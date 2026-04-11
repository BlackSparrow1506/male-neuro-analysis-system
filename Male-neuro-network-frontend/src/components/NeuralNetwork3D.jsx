import React, { useRef, useMemo, useState, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const REGION_POSITIONS = {
  prefrontalCortex: [0, 1.2, 2.0],
  amygdala:         [-0.7, -0.5, 0.6],
  hippocampus:      [0.7, -0.5, 0.6],
  cerebellum:       [0, -1.6, -1.5],
  hypothalamus:     [0, -0.1, 0.7],
  striatum:         [0, 0.6, 0.9],
  parietalLobe:     [0, 1.6, -0.6],
  temporalLobe:     [-1.7, 0, 0.2],
  occipitalLobe:    [0, 0.6, -2.0],
  brainstem:        [0, -1.6, -0.3],
  thalamusLeft:     [-0.4, 0.2, 0.3],
  thalamusRight:    [0.4, 0.2, 0.3],
}

const REGION_COLORS = {
  prefrontalCortex: '#00e5ff',
  amygdala:         '#ff1744',
  hippocampus:      '#00e676',
  cerebellum:       '#ff9100',
  hypothalamus:     '#ff6d00',
  striatum:         '#d500f9',
  parietalLobe:     '#448aff',
  temporalLobe:     '#ff4081',
  occipitalLobe:    '#76ff03',
  brainstem:        '#90a4ae',
  thalamusLeft:     '#ffd740',
  thalamusRight:    '#ffd740',
}

const REGION_INFO = {
  prefrontalCortex: { title: 'Prefrontal Cortex', function: 'Decision Making & Planning', description: 'Executive control center. Handles decision-making, planning, personality expression, and moderating social behavior.', maleTrait: 'Stronger intra-hemispheric connectivity in males, enhancing perception-to-action coordination.' },
  amygdala: { title: 'Amygdala', function: 'Emotion & Fear Processing', description: 'Emotional alarm system. Processes fear, aggression, and emotional memories. Triggers fight-or-flight.', maleTrait: 'Generally larger in males. Associated with heightened threat detection and competitive behavior.' },
  hippocampus: { title: 'Hippocampus', function: 'Memory & Navigation', description: 'Memory formation center. Converts short-term to long-term memories. Critical for spatial navigation.', maleTrait: 'Males rely more on hippocampal spatial strategies for navigation.' },
  cerebellum: { title: 'Cerebellum', function: 'Motor Coordination', description: 'Fine-tunes movement, posture, and motor learning. Also involved in cognitive timing and processing.', maleTrait: 'Higher metabolic activity and larger volume in males. Supports motor coordination.' },
  hypothalamus: { title: 'Hypothalamus', function: 'Hormone Command Center', description: 'Regulates body temperature, hunger, thirst, sleep, and the endocrine system.', maleTrait: 'INAH-3 nucleus is 2-3x larger in males. Regulates testosterone and sexual behavior.' },
  striatum: { title: 'Striatum', function: 'Reward & Motivation', description: 'Processes dopamine for reward-based learning, habit formation, and motivation.', maleTrait: 'Higher dopamine receptor density in males. Linked to risk-taking and reward sensitivity.' },
  parietalLobe: { title: 'Parietal Lobe', function: 'Spatial Processing', description: 'Processes touch, temperature, spatial orientation, and mathematical reasoning.', maleTrait: 'Inferior parietal lobule often larger in males. Linked to spatial reasoning.' },
  temporalLobe: { title: 'Temporal Lobe', function: 'Language & Creativity', description: 'Processes sound, speech, visual memory, and creative thinking.', maleTrait: 'Males show more lateralized language processing (left-dominant).' },
  occipitalLobe: { title: 'Occipital Lobe', function: 'Visual Processing', description: 'Interprets visual input — color, motion, depth perception, and pattern recognition.', maleTrait: 'Males show enhanced motion detection pathways for dynamic spatial tracking.' },
  brainstem: { title: 'Brainstem', function: 'Life Support', description: 'Controls breathing, heart rate, blood pressure, and consciousness. Always active.', maleTrait: 'Regulates baseline arousal and autonomic responses. Gateway for all neural signals.' },
  thalamusLeft: { title: 'Thalamus (Left)', function: 'Sensory Relay', description: 'Routes sensory information (except smell) to appropriate cortical areas for processing.', maleTrait: 'Stronger connectivity to analytical and language processing regions in males.' },
  thalamusRight: { title: 'Thalamus (Right)', function: 'Emotional Relay', description: 'Complements left thalamus with emphasis on spatial and emotional data routing.', maleTrait: 'Routes more spatial-emotional data, supporting visuospatial tasks in males.' },
}


function NeuralNode({ position, activity, color, name, isSelected, isHovered, onHover, onUnhover, onClick }) {
  const coreRef = useRef()
  const outerRef = useRef()
  const ringRef = useRef()
  const ring2Ref = useRef()
  const baseScale = 0.13 + activity * 0.17

  useFrame((state) => {
    const t = state.clock.elapsedTime
    const hScale = isHovered ? 0.1 : 0
    if (coreRef.current) {
      const pulse = Math.sin(t * 2.5 + activity * 8) * 0.02
      coreRef.current.scale.setScalar(baseScale + pulse + hScale)
      coreRef.current.material.emissiveIntensity = isHovered ? 2.5 : (isSelected ? 1.8 : 0.5 + activity * 1.2)
    }
    if (outerRef.current) {
      outerRef.current.scale.setScalar(baseScale * 3.5 + Math.sin(t * 1.0) * 0.05)
      outerRef.current.material.opacity = isHovered ? 0.2 : 0.04 + activity * 0.08
    }
    if (ringRef.current) {
      ringRef.current.rotation.x = t * 0.7
      ringRef.current.rotation.z = t * 0.4
      ringRef.current.scale.setScalar(baseScale * (isHovered ? 5 : 3.5))
      ringRef.current.material.opacity = isHovered ? 0.6 : 0.2 + Math.sin(t * 2) * 0.1
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.y = t * 0.9
      ring2Ref.current.rotation.x = t * 0.3 + 1.5
      ring2Ref.current.scale.setScalar(baseScale * (isHovered ? 4 : 2.8))
      ring2Ref.current.material.opacity = isHovered ? 0.4 : 0.1
    }
  })

  return (
    <group position={position} onClick={onClick} onPointerOver={(e) => onHover(e.nativeEvent || e)} onPointerOut={onUnhover}>
      <mesh ref={outerRef}>
        <sphereGeometry args={[1, 24, 24]} />
        <meshBasicMaterial color={color} transparent opacity={0.06} depthWrite={false} />
      </mesh>
      <mesh ref={ringRef}>
        <torusGeometry args={[1, 0.012, 8, 64]} />
        <meshBasicMaterial color={color} transparent opacity={0.25} depthWrite={false} />
      </mesh>
      <mesh ref={ring2Ref}>
        <torusGeometry args={[0.8, 0.008, 6, 48]} />
        <meshBasicMaterial color={color} transparent opacity={0.15} depthWrite={false} />
      </mesh>
      <mesh ref={coreRef}>
        <sphereGeometry args={[1, 48, 48]} />
        <meshPhysicalMaterial
          color={color} emissive={color} emissiveIntensity={0.6}
          roughness={0.1} metalness={0.95} clearcoat={1.0} clearcoatRoughness={0.05}
        />
      </mesh>
    </group>
  )
}

function NeuralEdge({ start, end, strength, type }) {
  const tubeRef = useRef()
  const color = type === 'inhibitory' ? '#ff1744' : '#00e5ff'
  const particleRefs = useRef([])

  const { curve, tubeGeo } = useMemo(() => {
    const s = new THREE.Vector3(...start)
    const e = new THREE.Vector3(...end)
    const mid = s.clone().add(e).multiplyScalar(0.5)
    mid.add(new THREE.Vector3((Math.random() - 0.5) * 0.3, 0.2 + Math.random() * 0.2, (Math.random() - 0.5) * 0.3))
    const c = new THREE.QuadraticBezierCurve3(s, mid, e)
    const g = new THREE.TubeGeometry(c, 40, 0.006 + strength * 0.01, 6, false)
    return { curve: c, tubeGeo: g }
  }, [start, end, strength])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (tubeRef.current) tubeRef.current.material.opacity = 0.12 + strength * 0.35 + Math.sin(t * 2) * 0.04
    particleRefs.current.forEach((ref, i) => {
      if (ref) {
        const progress = ((t * 0.35 + i / 3) % 1)
        ref.position.copy(curve.getPoint(progress))
        ref.material.opacity = 0.4 + Math.sin(progress * Math.PI) * 0.5
      }
    })
  })

  return (
    <group>
      <mesh ref={tubeRef} geometry={tubeGeo}>
        <meshBasicMaterial color={color} transparent opacity={0.2} depthWrite={false} />
      </mesh>
      {[0, 1, 2].map(i => (
        <mesh key={i} ref={el => particleRefs.current[i] = el}>
          <sphereGeometry args={[0.018 + strength * 0.012, 8, 8]} />
          <meshBasicMaterial color={color} transparent opacity={0.5} depthWrite={false} />
        </mesh>
      ))}
    </group>
  )
}

// Nebula cloud — colored volumetric blobs
function NebulaCloud() {
  const ref = useRef()
  const clouds = useMemo(() => {
    const arr = []
    const colors = ['#1a0a3a', '#0a1a3a', '#2a0a2a', '#0a2a3a', '#1a1a4a']
    for (let i = 0; i < 12; i++) {
      arr.push({
        pos: [(Math.random() - 0.5) * 16, (Math.random() - 0.5) * 12, (Math.random() - 0.5) * 16 - 5],
        scale: 2 + Math.random() * 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        speed: 0.1 + Math.random() * 0.2,
        opacity: 0.03 + Math.random() * 0.04,
      })
    }
    return arr
  }, [])

  useFrame((state) => {
    if (ref.current) ref.current.rotation.y = state.clock.elapsedTime * 0.005
  })

  return (
    <group ref={ref}>
      {clouds.map((c, i) => (
        <mesh key={i} position={c.pos} scale={c.scale}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshBasicMaterial color={c.color} transparent opacity={c.opacity} depthWrite={false} side={THREE.BackSide} />
        </mesh>
      ))}
    </group>
  )
}

// Galaxy spiral arm particles
function GalaxyField() {
  const ref = useRef()
  const count = 2000

  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const col = new Float32Array(count * 3)
    const palette = [
      [0.0, 0.8, 1.0], [0.5, 0.2, 1.0], [1.0, 0.2, 0.4],
      [0.0, 0.9, 0.5], [1.0, 0.6, 0.0],
    ]
    for (let i = 0; i < count; i++) {
      const arm = Math.floor(Math.random() * 3)
      const distance = Math.pow(Math.random(), 0.6) * 18
      const angle = (arm / 3) * Math.PI * 2 + distance * 0.4 + (Math.random() - 0.5) * 0.5
      const spread = (Math.random() - 0.5) * 1.5 * (1 + distance * 0.1)

      pos[i * 3] = Math.cos(angle) * distance + spread
      pos[i * 3 + 1] = (Math.random() - 0.5) * 2.0
      pos[i * 3 + 2] = Math.sin(angle) * distance + spread

      const c = palette[Math.floor(Math.random() * palette.length)]
      col[i * 3] = c[0]
      col[i * 3 + 1] = c[1]
      col[i * 3 + 2] = c[2]
    }
    return { positions: pos, colors: col }
  }, [])

  useFrame((state) => {
    if (ref.current) ref.current.rotation.y = state.clock.elapsedTime * 0.01
  })

  return (
    <points ref={ref} position={[0, 0, -8]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={count} itemSize={3} />
        <bufferAttribute attach="attributes-color" array={colors} count={count} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.04} transparent opacity={0.5} sizeAttenuation vertexColors depthWrite={false} />
    </points>
  )
}

// Brain-fill synaptic particles
function SynapticField() {
  const ref = useRef()
  const count = 800

  const { positions, speeds } = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const spd = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = Math.pow(Math.random(), 0.5) * 2.3
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.85
      pos[i * 3 + 2] = r * Math.cos(phi) * 1.1
      spd[i] = 0.2 + Math.random() * 0.6
    }
    return { positions: pos, speeds: spd }
  }, [])

  useFrame((state) => {
    if (ref.current) {
      const attr = ref.current.geometry.attributes.position
      const t = state.clock.elapsedTime
      for (let i = 0; i < count; i++) {
        attr.array[i * 3 + 1] += Math.sin(t * speeds[i] + i) * 0.0004
        attr.array[i * 3] += Math.cos(t * speeds[i] * 0.6 + i) * 0.0002
      }
      attr.needsUpdate = true
    }
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={count} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color="#1a6b8a" size={0.012} transparent opacity={0.35} sizeAttenuation depthWrite={false} />
    </points>
  )
}

// Brain shell
function BrainShell() {
  const ref = useRef()
  useFrame((state) => {
    if (ref.current) ref.current.material.opacity = 0.025 + Math.sin(state.clock.elapsedTime * 0.4) * 0.01
  })
  return (
    <mesh ref={ref} scale={[2.4, 2.1, 2.7]}>
      <sphereGeometry args={[1, 48, 48]} />
      <meshPhysicalMaterial color="#0a2a4a" transparent opacity={0.03} roughness={0.8} side={THREE.DoubleSide} depthWrite={false} />
    </mesh>
  )
}

export default function NeuralNetwork3D({ profile, selectedRegion, onSelectRegion, isUserInteracting, onHoverInfo }) {
  const brainGroupRef = useRef()
  const regions = profile?.brainRegions || {}
  const connections = profile?.connections || []
  const [hoveredRegion, setHoveredRegion] = useState(null)

  const handleHover = useCallback((name, e) => {
    setHoveredRegion(name)
    document.body.style.cursor = 'pointer'
    if (onHoverInfo) {
      const info = REGION_INFO[name]
      onHoverInfo({
        name,
        title: info?.title,
        fn: info?.function,
        description: info?.description,
        maleTrait: info?.maleTrait,
        activity: regions[name] || 0.5,
        color: REGION_COLORS[name] || '#00ffff',
        x: e?.clientX ?? 0,
        y: e?.clientY ?? 0,
      })
    }
  }, [onHoverInfo, regions])

  const handleUnhover = useCallback(() => {
    setHoveredRegion(null)
    document.body.style.cursor = 'default'
    if (onHoverInfo) onHoverInfo(null)
  }, [onHoverInfo])

  useFrame(() => {
    if (brainGroupRef.current && !isUserInteracting) {
      brainGroupRef.current.rotation.y += 0.004
    }
  })

  return (
    <>
      <NebulaCloud />
      <GalaxyField />
      <group ref={brainGroupRef}>
        <BrainShell />
        <SynapticField />

        {connections.map((conn, i) => {
          const s = REGION_POSITIONS[conn.sourceRegion]
          const e = REGION_POSITIONS[conn.targetRegion]
          if (!s || !e) return null
          return <NeuralEdge key={i} start={s} end={e} strength={conn.strength} type={conn.type} />
        })}

        {Object.entries(REGION_POSITIONS).map(([name, pos]) => (
          <NeuralNode
            key={name} position={pos} activity={regions[name] || 0.5}
            color={REGION_COLORS[name] || '#fff'} name={name}
            isSelected={selectedRegion === name} isHovered={hoveredRegion === name}
            onHover={(e) => handleHover(name, e)} onUnhover={handleUnhover}
            onClick={() => onSelectRegion?.(name)}
          />
        ))}
      </group>
    </>
  )
}
