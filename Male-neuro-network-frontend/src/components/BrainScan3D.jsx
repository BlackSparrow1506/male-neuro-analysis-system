import { useRef, useMemo, useState, useCallback, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'

// ══════════════════════════════════════════════════════════════════════════
// Unique anatomical atlas colours per region
// ══════════════════════════════════════════════════════════════════════════
const REGION_COLORS = {
  prefrontalCortex: '#d4603a',  // warm coral-orange
  parietalLobe:     '#5577dd',  // periwinkle blue
  temporalLobe:     '#26a882',  // teal
  occipitalLobe:    '#88bb22',  // yellow-green
  cerebellum:       '#8844cc',  // violet-purple
  brainstem:        '#778833',  // olive green
  amygdala:         '#dd2277',  // magenta-pink
  hippocampus:      '#0099cc',  // cerulean
  thalamusLeft:     '#ee8800',  // amber
  thalamusRight:    '#ccaa00',  // gold
  hypothalamus:     '#cc1100',  // deep crimson
  striatum:         '#55aa00',  // lime green
}

// ══════════════════════════════════════════════════════════════════════════
// Region metadata
// ══════════════════════════════════════════════════════════════════════════
const META = {
  prefrontalCortex: { label: 'Prefrontal Cortex',  short: 'PFC', fn: 'Decision Making & Planning',       desc: 'Executive control at the very front of the brain. Governs personality, judgement and complex thought.',              male: 'Stronger intra-hemispheric connectivity in males.' },
  parietalLobe:     { label: 'Parietal Lobe',       short: 'PAR', fn: 'Spatial Processing & Integration', desc: 'Top of the brain. Integrates sensory input — touch, temperature, pain and spatial awareness.',                      male: 'Inferior parietal lobule often larger in males.' },
  temporalLobe:     { label: 'Temporal Lobe',       short: 'TMP', fn: 'Language & Auditory Memory',       desc: 'Sides of the brain above the ears. Processes hearing, speech recognition and stores semantic memory.',               male: 'More lateralised language processing in males.' },
  occipitalLobe:    { label: 'Occipital Lobe',      short: 'OCC', fn: 'Visual Cortex',                    desc: 'Entire back of the brain dedicated to interpreting visual signals.',                                                male: 'Enhanced motion-detection pathways in males.' },
  cerebellum:       { label: 'Cerebellum',           short: 'CBL', fn: 'Motor Coordination & Balance',    desc: 'Back-bottom structure. Houses more neurons than the rest of the brain combined — fine-tunes movement.',               male: 'Higher metabolic activity and larger volume in males.' },
  brainstem:        { label: 'Brainstem',            short: 'BST', fn: 'Vital Life Functions',             desc: 'Connects brain to spinal cord. Controls breathing, heart rate and sleep-wake cycles.',                               male: 'Gateway for all neural signals between brain and body.' },
  amygdala:         { label: 'Amygdala',             short: 'AMY', fn: 'Fear & Emotion Processing',        desc: 'Almond-shaped nucleus deep in the medial temporal lobe. Threat detection and emotional memory hub.',                  male: 'Generally larger in males; heightened threat detection.' },
  hippocampus:      { label: 'Hippocampus',          short: 'HPC', fn: 'Memory Consolidation',             desc: 'Seahorse-shaped curl deep in the medial temporal lobe. Converts short-term to long-term memories.',                  male: 'Males rely more on hippocampal spatial strategies.' },
  thalamusLeft:     { label: 'Thalamus (L)',         short: 'THL', fn: 'Sensory Relay (Left)',             desc: 'Deep central structure. Routes all sensory data (except smell) to the correct cortical areas.',                     male: 'Stronger analytical and language connectivity in males.' },
  thalamusRight:    { label: 'Thalamus (R)',         short: 'THR', fn: 'Sensory Relay (Right)',            desc: 'Complements left thalamus — routes spatial and emotional signals.',                                                  male: 'Routes more spatial-emotional data in males.' },
  hypothalamus:     { label: 'Hypothalamus',         short: 'HYP', fn: 'Hormone Command Centre',           desc: 'Small region below the thalamus. Regulates temperature, hunger, thirst and hormones.',                               male: 'INAH-3 nucleus is 2-3× larger in males.' },
  striatum:         { label: 'Striatum',             short: 'STR', fn: 'Reward & Motivation',              desc: 'Subcortical structure. Dopamine gateway driving reward-based learning and habit formation.',                         male: 'Higher dopamine receptor density in males.' },
}

// ══════════════════════════════════════════════════════════════════════════
// Activity-modulated region colour — brightens with activity, keeps hue
// ══════════════════════════════════════════════════════════════════════════
function regionColor(key, activity) {
  const hex = REGION_COLORS[key] || '#888888'
  const base = new THREE.Color(hex)
  // dim at 0 activity, full+slight bloom at 1
  const factor = 0.28 + activity * 0.90
  return new THREE.Color(
    Math.min(1, base.r * factor),
    Math.min(1, base.g * factor),
    Math.min(1, base.b * factor),
  )
}
function regionHex(key, activity) {
  return '#' + regionColor(key, activity).getHexString()
}

// ══════════════════════════════════════════════════════════════════════════
// Brain fold displacement — realistic gyri/sulci with sulcal darkening info
// Returns { disp, fold } where fold > 0 = gyrus ridge, fold < 0 = sulcus
// ══════════════════════════════════════════════════════════════════════════
function brainFolds(nx, ny, nz) {
  // Primary gyri — large slow undulation
  const a = Math.sin(nx * 4.8)          * Math.cos(ny * 4.2)             * Math.sin(nz * 3.6 + 0.3) * 0.14
  // Secondary gyri — medium folds
  const b = Math.sin(ny * 7.8 + 1.1)    * Math.cos(nz * 6.5 - 0.6)      * Math.sin(nx * 5.9)        * 0.085
  // Sulcal grooves — higher freq, negative creates grooves
  const c = Math.sin(nz * 11.2 + 2.0)   * Math.cos(nx * 9.8 + 0.8)      * Math.sin(ny * 8.4)        * 0.050
  // Fine surface texture
  const d = Math.sin(nx * 17.5 + ny * 14.3 + 0.5) * 0.022
  const e = Math.sin(ny * 21.8 + nz * 18.6 + 1.6)  * 0.013
  // Directional asymmetry (real brains are slightly asymmetric)
  const f = Math.sin(nx * 6.2 + 0.7) * Math.cos(ny * 5.1) * 0.018
  return a + b + c + d + e + f
}

// ══════════════════════════════════════════════════════════════════════════
// Surface region classifier — maps unit-sphere point → anatomical lobe
// ══════════════════════════════════════════════════════════════════════════
const SURFACE_REGIONS = ['prefrontalCortex', 'parietalLobe', 'temporalLobe', 'occipitalLobe']

function classifyRegion(nx, ny, nz) {
  if (ny > 0.42 && nz > 0.18) return 'prefrontalCortex'
  if (nz > 0.52)               return 'prefrontalCortex'
  if (nz > 0.22 && ny > -0.18 && Math.abs(nx) < 0.72) return 'prefrontalCortex'
  if (ny > 0.42)               return 'parietalLobe'
  if (nz < -0.52)              return 'occipitalLobe'
  if (nz < -0.26 && ny > -0.08) return 'parietalLobe'
  if (nz < -0.26)              return 'occipitalLobe'
  if (Math.abs(nx) > 0.52)     return 'temporalLobe'
  if (ny < 0.18 && Math.abs(nx) > 0.33) return 'temporalLobe'
  if (ny > 0.12)               return 'parietalLobe'
  return 'temporalLobe'
}

// ══════════════════════════════════════════════════════════════════════════
// Build the cerebrum geometry with realistic gyri + sulcal darkening data
// ══════════════════════════════════════════════════════════════════════════
function buildCerebrumGeo() {
  const RES = 148
  const geo = new THREE.SphereGeometry(1, RES, RES)
  const pos = geo.attributes.position
  const count = pos.count
  const regionIdx  = new Uint8Array(count)
  const foldValues = new Float32Array(count)   // used for sulcal darkening

  for (let i = 0; i < count; i++) {
    const nx = pos.getX(i)
    const ny = pos.getY(i)
    const nz = pos.getZ(i)

    regionIdx[i] = SURFACE_REGIONS.indexOf(classifyRegion(nx, ny, nz))

    const fold = brainFolds(nx, ny, nz)
    foldValues[i] = fold

    // Realistic brain ellipsoid: wider side-to-side than tall, long front-back
    const sx = 1.18
    let   sy = 1.04
    if (ny < -0.22) sy = 0.82 + (0.22 + ny) * 0.30   // flatten the inferior surface
    const sz = 1.48

    // Deep interhemispheric fissure running top to bottom along midline
    let fissure = 0
    if (Math.abs(nx) < 0.12 && ny > 0.10) {
      const fade = Math.min(1, (ny - 0.10) / 0.22)
      fissure = -0.072 * (1 - Math.abs(nx) / 0.12) * fade
    }

    // Lateral sulcus (Sylvian fissure) — horizontal groove on sides
    let sylvian = 0
    if (Math.abs(nx) > 0.52 && ny > -0.25 && ny < 0.12 && Math.abs(nz) < 0.3) {
      const depth = Math.max(0, (Math.abs(nx) - 0.52) / 0.18)
      sylvian = -0.038 * depth * Math.max(0, 1 - Math.abs(ny - (-0.06)) / 0.18)
    }

    pos.setXYZ(i,
      nx * sx + nx * fold,
      ny * sy + ny * fold + fissure + sylvian,
      nz * sz + nz * fold
    )
  }

  const colors = new Float32Array(count * 3)
  geo.setAttribute('color',     new THREE.BufferAttribute(colors, 3))
  geo.setAttribute('foldValue', new THREE.BufferAttribute(foldValues, 1))
  geo.computeVertexNormals()

  return { geo, regionIdx, foldValues }
}

// ══════════════════════════════════════════════════════════════════════════
// Cerebellum — pronounced horizontal folia (parallel ridges)
// ══════════════════════════════════════════════════════════════════════════
function buildCerebellumGeo() {
  const geo = new THREE.SphereGeometry(1, 112, 112)
  const pos = geo.attributes.position
  const count = pos.count

  for (let i = 0; i < count; i++) {
    const nx = pos.getX(i)
    const ny = pos.getY(i)
    const nz = pos.getZ(i)
    // Tight parallel folia running laterally (horizontal ridges)
    const folia   = Math.sin(ny * 32) * 0.055 + Math.sin(ny * 64) * 0.022 + Math.sin(ny * 96) * 0.009
    // Subtle anterior-posterior undulation
    const ap      = Math.cos(nz * 5.5) * 0.020
    const rough   = brainFolds(nx, ny, nz) * 0.28
    const d = folia + ap + rough
    pos.setXYZ(i,
      nx * 0.90 + nx * d * 0.50,
      ny * 0.52 + ny * d * 0.42,
      nz * 0.74 + nz * d * 0.52
    )
  }
  geo.computeVertexNormals()
  return geo
}

// ══════════════════════════════════════════════════════════════════════════
// Cerebrum mesh — matte organic material, unique region colours
// ══════════════════════════════════════════════════════════════════════════
function CerebrumMesh({ activities, hoveredRegion, onHoverRegion, onOut, onPick }) {
  const { geo, regionIdx, foldValues } = useMemo(() => buildCerebrumGeo(), [])
  const hoverRef = useRef(null)

  // Matte organic brain-tissue material — no metalness, slight subsurface look
  const material = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.82,
      metalness: 0.0,
      side: THREE.FrontSide,
    })
    // Pipe vertex color into emissive so active regions glow subtly
    mat.onBeforeCompile = (shader) => {
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <emissivemap_fragment>',
        `#include <emissivemap_fragment>
         totalEmissiveRadiance += vColor * 0.22;`
      )
    }
    return mat
  }, [])

  // Update vertex colours: region colour × activity, sulci slightly darker
  useEffect(() => {
    const colorAttr = geo.attributes.color
    const count = regionIdx.length
    for (let i = 0; i < count; i++) {
      const key = SURFACE_REGIONS[regionIdx[i]]
      const act = activities[key] ?? 0.5
      const isHovered = key === hoveredRegion
      const c = regionColor(key, act)

      // Darken in sulci (fold < 0), lighten on gyri peaks
      const fold  = foldValues[i]
      const sulcal = fold < 0 ? 0.65 + fold * 1.2 : 1.0 + fold * 0.4
      const hoverBoost = isHovered ? 1.35 : 1.0

      colorAttr.setXYZ(i,
        Math.min(1, c.r * sulcal * hoverBoost),
        Math.min(1, c.g * sulcal * hoverBoost),
        Math.min(1, c.b * sulcal * hoverBoost),
      )
    }
    colorAttr.needsUpdate = true
  }, [activities, hoveredRegion, geo, regionIdx, foldValues])

  const handleMove = useCallback((e) => {
    e.stopPropagation()
    if (!e.face) return
    const key = SURFACE_REGIONS[regionIdx[e.face.a]]
    if (key !== hoverRef.current) {
      hoverRef.current = key
      onHoverRegion(key, e.nativeEvent || e)
    }
    document.body.style.cursor = 'pointer'
  }, [onHoverRegion, regionIdx])

  const handleOut = useCallback(() => {
    hoverRef.current = null
    onOut()
  }, [onOut])

  const handleClick = useCallback((e) => {
    e.stopPropagation()
    if (hoverRef.current) onPick(hoverRef.current)
  }, [onPick])

  return (
    <mesh
      geometry={geo}
      material={material}
      onPointerMove={handleMove}
      onPointerOut={handleOut}
      onClick={handleClick}
    />
  )
}

// ══════════════════════════════════════════════════════════════════════════
// Cerebellum mesh
// ══════════════════════════════════════════════════════════════════════════
function CerebellumMesh({ activity, isActive, onOver, onOut, onPick }) {
  const geo    = useMemo(() => buildCerebellumGeo(), [])
  const matRef = useRef()
  const col    = regionHex('cerebellum', activity)

  useFrame(({ clock }) => {
    if (!matRef.current) return
    matRef.current.emissiveIntensity = isActive
      ? 0.55
      : 0.12 + activity * 0.22 + Math.sin(clock.elapsedTime * 1.8) * 0.04 * activity
  })

  return (
    <mesh
      geometry={geo}
      position={[0, -0.78, -1.20]}
      onPointerOver={(e) => { e.stopPropagation(); onOver('cerebellum', e.nativeEvent || e) }}
      onPointerOut={onOut}
      onClick={(e) => { e.stopPropagation(); onPick('cerebellum') }}
    >
      <meshStandardMaterial
        ref={matRef}
        color={col}
        emissive={col}
        emissiveIntensity={0.15}
        roughness={0.88}
        metalness={0.0}
      />
    </mesh>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// Brainstem mesh — tapered cylinder
// ══════════════════════════════════════════════════════════════════════════
function BrainstemMesh({ activity, isActive, onOver, onOut, onPick }) {
  const matRef = useRef()
  const col    = regionHex('brainstem', activity)

  useFrame(({ clock }) => {
    if (!matRef.current) return
    matRef.current.emissiveIntensity = isActive
      ? 0.55
      : 0.12 + activity * 0.22 + Math.sin(clock.elapsedTime * 1.6) * 0.04 * activity
  })

  return (
    <mesh
      position={[0, -1.40, -0.20]}
      rotation={[0.20, 0, 0]}
      onPointerOver={(e) => { e.stopPropagation(); onOver('brainstem', e.nativeEvent || e) }}
      onPointerOut={onOut}
      onClick={(e) => { e.stopPropagation(); onPick('brainstem') }}
    >
      <cylinderGeometry args={[0.18, 0.26, 0.82, 28]} />
      <meshStandardMaterial
        ref={matRef}
        color={col}
        emissive={col}
        emissiveIntensity={0.15}
        roughness={0.80}
        metalness={0.0}
      />
    </mesh>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// Deep subcortical structure — visible through translucent cerebrum
// ══════════════════════════════════════════════════════════════════════════
function DeepStructure({ position, scale, activity, rKey, isActive, onOver, onOut, onPick }) {
  const matRef = useRef()
  const col    = regionHex(rKey, activity)

  useFrame(({ clock }) => {
    if (!matRef.current) return
    const t = clock.elapsedTime
    matRef.current.emissiveIntensity = isActive
      ? 1.8
      : 0.5 + activity * 1.0 + Math.sin(t * 2.2 + activity * 5) * 0.25 * activity
  })

  return (
    <mesh
      position={position}
      scale={scale}
      onPointerOver={(e) => { e.stopPropagation(); onOver(rKey, e.nativeEvent || e) }}
      onPointerOut={onOut}
      onClick={(e) => { e.stopPropagation(); onPick(rKey) }}
    >
      <sphereGeometry args={[1, 22, 22]} />
      <meshStandardMaterial
        ref={matRef}
        color={col}
        emissive={col}
        emissiveIntensity={0.6}
        roughness={0.45}
        metalness={0.05}
        transparent
        opacity={0.85}
      />
    </mesh>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// Surface label chip
// ══════════════════════════════════════════════════════════════════════════
function RegionChip({ worldPos, rKey, activity, isActive }) {
  const meta = META[rKey]
  if (!meta) return null
  const col = regionHex(rKey, activity)
  return (
    <Html position={worldPos} center distanceFactor={9} style={{ pointerEvents: 'none' }}>
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
        opacity: isActive ? 1 : 0.70, transition: 'opacity 0.2s',
      }}>
        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: col, boxShadow: `0 0 8px ${col}` }} />
        <div style={{
          background: isActive ? `${col}33` : 'rgba(2,5,18,0.82)',
          border: `1px solid ${col}${isActive ? 'dd' : '77'}`,
          borderRadius: '4px', padding: '2px 7px',
          fontSize: '9px', fontFamily: "'SF Mono', monospace",
          fontWeight: 'bold', color: col, letterSpacing: '1px',
          textTransform: 'uppercase', whiteSpace: 'nowrap',
          textShadow: isActive ? `0 0 8px ${col}` : 'none',
          backdropFilter: 'blur(4px)',
        }}>
          {meta.short}
        </div>
      </div>
    </Html>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// Neural arc between regions
// ══════════════════════════════════════════════════════════════════════════
function NeuralArc({ start, end, srcKey, tgtKey, activity }) {
  const matRef = useRef()
  const col = REGION_COLORS[srcKey] || '#888'
  const geo = useMemo(() => {
    const s = new THREE.Vector3(...start)
    const e = new THREE.Vector3(...end)
    const mid = s.clone().add(e).multiplyScalar(0.5)
    mid.y += 0.35
    return new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(s, mid, e), 22, 0.006, 5, false)
  }, [start, end])
  useFrame(({ clock }) => {
    if (matRef.current)
      matRef.current.opacity = 0.10 + activity * 0.25 + Math.sin(clock.elapsedTime * 2 + activity * 5) * 0.04
  })
  return (
    <mesh geometry={geo}>
      <meshBasicMaterial ref={matRef} color={col} transparent opacity={0.18} depthWrite={false} />
    </mesh>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// Green alpha/gamma scanner — passes through the brain
// ══════════════════════════════════════════════════════════════════════════
function ScanSweep() {
  const planeRef = useRef()
  const lineRef  = useRef()
  const glowRef  = useRef()

  useFrame(({ clock }) => {
    const t     = clock.elapsedTime
    const y     = Math.sin(t * 0.30) * 1.88
    const phase = Math.abs(Math.cos(t * 0.30))   // 0 at extremes, 1 at center

    if (planeRef.current) {
      planeRef.current.position.y = y
      planeRef.current.material.opacity = 0.13 + phase * 0.10
    }
    if (lineRef.current) {
      lineRef.current.position.y = y
      lineRef.current.material.opacity = 0.72 + phase * 0.22
    }
    if (glowRef.current) {
      glowRef.current.position.y = y
      glowRef.current.material.opacity = 0.05 + phase * 0.07
    }
  })

  return (
    <>
      {/* Main scan plane — alpha/gamma green, additive so it lights the brain */}
      <mesh ref={planeRef} rotation={[Math.PI / 2, 0, 0]} renderOrder={2}>
        <planeGeometry args={[7, 7]} />
        <meshBasicMaterial
          color="#00ff88" transparent opacity={0.13}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Bright leading scan line — the "cutting edge" of the beam */}
      <mesh ref={lineRef} rotation={[Math.PI / 2, 0, 0]} renderOrder={3}>
        <planeGeometry args={[7, 0.014]} />
        <meshBasicMaterial
          color="#66ffbb" transparent opacity={0.80}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Soft volumetric glow band around the scan line */}
      <mesh ref={glowRef} rotation={[Math.PI / 2, 0, 0]} renderOrder={2}>
        <planeGeometry args={[7, 0.32]} />
        <meshBasicMaterial
          color="#00ff66" transparent opacity={0.06}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>
    </>
  )
}

function ScanGrid() {
  return (
    <>
      {/* Green wireframe floor grid */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -2.4, 0]}>
        <planeGeometry args={[14, 14, 28, 28]} />
        <meshBasicMaterial
          color="#00ff88" transparent opacity={0.030}
          wireframe depthWrite={false}
        />
      </mesh>
      {/* Outer pulse ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -2.35, 0]}>
        <ringGeometry args={[3.1, 3.26, 64]} />
        <meshBasicMaterial
          color="#00ff88" transparent opacity={0.13}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>
    </>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// Lookup tables
// ══════════════════════════════════════════════════════════════════════════
const REGION_CENTRE = {
  prefrontalCortex: [ 0.00,  0.35,  1.25],
  parietalLobe:     [ 0.00,  1.05, -0.20],
  temporalLobe:     [-1.15, -0.15,  0.05],
  occipitalLobe:    [ 0.00,  0.25, -1.55],
  cerebellum:       [ 0.00, -0.78, -1.20],
  brainstem:        [ 0.00, -1.40, -0.20],
  amygdala:         [-0.55, -0.40,  0.45],
  hippocampus:      [ 0.55, -0.40,  0.45],
  thalamusLeft:     [-0.28,  0.08,  0.22],
  thalamusRight:    [ 0.28,  0.08,  0.22],
  hypothalamus:     [ 0.00, -0.30,  0.44],
  striatum:         [ 0.00,  0.28,  0.58],
}

const LABEL_ANCHOR = {
  prefrontalCortex: [ 0.00,  0.55,  2.05],
  parietalLobe:     [ 0.00,  1.88, -0.05],
  temporalLobe:     [-2.02, -0.12,  0.12],
  occipitalLobe:    [ 0.00,  0.35, -2.22],
  cerebellum:       [ 1.00, -1.28, -1.55],
  brainstem:        [ 0.95, -1.92, -0.18],
  amygdala:         [-1.70, -0.78,  0.65],
  hippocampus:      [ 1.70, -0.78,  0.65],
  thalamusLeft:     [-1.42,  0.55,  0.55],
  thalamusRight:    [ 1.42,  0.55,  0.55],
  hypothalamus:     [ 1.42, -0.95,  0.95],
  striatum:         [-1.32,  0.88,  1.12],
}

// ══════════════════════════════════════════════════════════════════════════
// Main export
// ══════════════════════════════════════════════════════════════════════════
export default function BrainScan3D({ profile, selectedRegion, onSelectRegion, isUserInteracting, onHoverInfo }) {
  const groupRef = useRef()
  const regions  = profile?.brainRegions || {}
  const conns    = profile?.connections  || []
  const [hovered, setHovered] = useState(null)

  const activities = useMemo(() => regions, [JSON.stringify(regions)]) // eslint-disable-line

  const onHoverRegion = useCallback((k, e) => {
    setHovered(k)
    document.body.style.cursor = 'pointer'
    if (onHoverInfo) {
      const meta = META[k]
      const act  = regions[k] ?? 0.5
      onHoverInfo({
        name: k,
        title: meta?.label,
        fn: meta?.fn,
        description: meta?.desc,
        maleTrait: meta?.male,
        activity: act,
        color: regionHex(k, act),
        x: e?.clientX ?? 0,
        y: e?.clientY ?? 0,
      })
    }
  }, [onHoverInfo, regions])

  const onOut  = useCallback(() => {
    setHovered(null)
    document.body.style.cursor = 'default'
    if (onHoverInfo) onHoverInfo(null)
  }, [onHoverInfo])

  const onPick = useCallback((k) => onSelectRegion?.(k), [onSelectRegion])

  useFrame(() => {
    if (groupRef.current && !isUserInteracting) groupRef.current.rotation.y += 0.0014
  })

  const act  = (k) => regions[k] ?? 0.5
  const avg  = (a, b) => (act(a) + act(b)) / 2

  const deepRegions = [
    { key: 'amygdala',      pos: [-0.55, -0.40,  0.45], scale: [0.22, 0.20, 0.22] },
    { key: 'hippocampus',   pos: [ 0.55, -0.40,  0.45], scale: [0.26, 0.18, 0.32] },
    { key: 'thalamusLeft',  pos: [-0.28,  0.08,  0.22], scale: [0.28, 0.26, 0.34] },
    { key: 'thalamusRight', pos: [ 0.28,  0.08,  0.22], scale: [0.28, 0.26, 0.34] },
    { key: 'hypothalamus',  pos: [ 0.00, -0.30,  0.44], scale: [0.22, 0.18, 0.24] },
    { key: 'striatum',      pos: [ 0.00,  0.28,  0.58], scale: [0.56, 0.44, 0.54] },
  ]

  const labelKeys = Object.keys(LABEL_ANCHOR)
  const active    = hovered || selectedRegion

  return (
    <>
      <ScanGrid />
      <ScanSweep />

      <group ref={groupRef}>
        {/* Cerebrum — main brain surface with unique region colours */}
        <CerebrumMesh
          activities={activities}
          hoveredRegion={hovered}
          onHoverRegion={onHoverRegion}
          onOut={onOut}
          onPick={onPick}
        />

        {/* Cerebellum */}
        <CerebellumMesh
          activity={act('cerebellum')}
          isActive={active === 'cerebellum'}
          onOver={onHoverRegion}
          onOut={onOut}
          onPick={onPick}
        />

        {/* Brainstem */}
        <BrainstemMesh
          activity={act('brainstem')}
          isActive={active === 'brainstem'}
          onOver={onHoverRegion}
          onOut={onOut}
          onPick={onPick}
        />

        {/* Deep subcortical structures */}
        {deepRegions.map((r, i) => (
          <DeepStructure
            key={i}
            position={r.pos}
            scale={r.scale}
            activity={act(r.key)}
            rKey={r.key}
            isActive={active === r.key}
            onOver={onHoverRegion}
            onOut={onOut}
            onPick={onPick}
          />
        ))}

        {/* Neural connection arcs */}
        {conns.map((conn, i) => {
          const s = REGION_CENTRE[conn.sourceRegion]
          const e = REGION_CENTRE[conn.targetRegion]
          if (!s || !e) return null
          return (
            <NeuralArc
              key={i}
              start={s} end={e}
              srcKey={conn.sourceRegion}
              tgtKey={conn.targetRegion}
              activity={avg(conn.sourceRegion, conn.targetRegion)}
            />
          )
        })}

        {/* Region label chips */}
        {labelKeys.map((k) => (
          <RegionChip
            key={k}
            worldPos={LABEL_ANCHOR[k]}
            rKey={k}
            activity={act(k)}
            isActive={active === k}
          />
        ))}
      </group>
    </>
  )
}
