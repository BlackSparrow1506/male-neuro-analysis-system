import React, { useState, useEffect, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import NeuralNetwork3D from './components/NeuralNetwork3D'
import BrainScan3D from './components/BrainScan3D'
import ChatPanel from './components/ChatPanel'
import MetricsPanel from './components/MetricsPanel'
import ProfileSelector from './components/ProfileSelector'
import WelcomeModal from './components/WelcomeModal'
import AuthPage from './components/AuthPage'
import ProfileDashboard from './components/ProfileDashboard'
import { fetchProfile, clearChatHistory, getToken } from './api'

// Decode JWT payload without a library to check expiry
function isTokenAlive() {
  const token = getToken()
  if (!token) return false
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.exp * 1000 > Date.now()
  } catch {
    return false
  }
}

// app states: 'landing' | 'auth' | 'dashboard' | 'app'
function initialView() {
  return isTokenAlive() ? 'dashboard' : 'landing'
}

export default function App() {
  const [view, setView]             = useState(initialView)
  const [userEmail, setUserEmail]   = useState(() => localStorage.getItem('nn_email') || '')
  const [selectedId, setSelectedId] = useState(null)
  const [profile, setProfile]       = useState(null)
  const [selectedRegion, setSelectedRegion] = useState(null)
  const [backendUp]                 = useState(true)
  const [isUserInteracting, setIsUserInteracting] = useState(false)
  const [chatKey, setChatKey]       = useState(0)
  const [viewMode, setViewMode]     = useState('network')
  const [hoverInfo, setHoverInfo]   = useState(null)
  const [isAboutOpen, setIsAboutOpen] = useState(false)
  const hoverInfoRef = React.useRef(null)

  // Mouse tracking for hover tooltip
  useEffect(() => {
    const onMove = (e) => {
      if (hoverInfoRef.current) {
        hoverInfoRef.current = { ...hoverInfoRef.current, x: e.clientX, y: e.clientY }
        setHoverInfo({ ...hoverInfoRef.current })
      }
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  // Poll selected profile when in 'app' view
  useEffect(() => {
    if (view !== 'app' || !selectedId) return
    const load = () => fetchProfile(selectedId).then(setProfile).catch(() => {})
    load()
    const interval = setInterval(load, 3000)
    return () => clearInterval(interval)
  }, [view, selectedId])

  // ── Session expiry (fired by api.js on 401) ───────────────────────────────
  useEffect(() => {
    const handler = () => {
      localStorage.removeItem('nn_email')
      setUserEmail('')
      setSelectedId(null)
      setProfile(null)
      setView('auth')
    }
    window.addEventListener('nn:sessionExpired', handler)
    return () => window.removeEventListener('nn:sessionExpired', handler)
  }, [])

  // ── Auth handlers ────────────────────────────────────────────────────────────
  const handleAuth = useCallback((data) => {
    localStorage.setItem('nn_email', data.email || '')
    setUserEmail(data.email || '')
    setView('dashboard')
  }, [])

  const handleLogout = useCallback(() => {
    localStorage.removeItem('nn_email')
    setUserEmail('')
    setSelectedId(null)
    setProfile(null)
    setView('landing')
  }, [])

  // ── Dashboard → App ──────────────────────────────────────────────────────────
  const handleEnterApp = useCallback((profileId) => {
    setSelectedId(profileId)
    setProfile(null)
    setView('app')
  }, [])

  const handleBackToDashboard = useCallback(() => {
    setView('dashboard')
    setSelectedId(null)
    setProfile(null)
  }, [])

  // ── In-app profile switch ────────────────────────────────────────────────────
  const handleSelectProfile = useCallback((id) => {
    setSelectedId(id)
    setProfile(null)
    setChatKey(k => k + 1)
  }, [])

  const handleClearChat = useCallback(async () => {
    if (!selectedId) return
    try {
      await clearChatHistory(selectedId)
      setChatKey(k => k + 1)
    } catch (e) {
      console.error('Failed to clear chat:', e)
    }
  }, [selectedId])

  // ── Render by view ───────────────────────────────────────────────────────────

  if (view === 'landing') {
    return <WelcomeModal onClose={() => setView('auth')} />
  }

  if (view === 'auth') {
    return <AuthPage onAuth={handleAuth} />
  }

  if (view === 'dashboard') {
    return (
      <ProfileDashboard
        userEmail={userEmail}
        onEnter={handleEnterApp}
        onLogout={handleLogout}
      />
    )
  }

  // ── Main 3D app ──────────────────────────────────────────────────────────────
  return (
    <div style={styles.app}>
      {!backendUp && (
        <div style={styles.warning}>
          Backend not reachable — make sure the Spring Boot server is running on port 8080.
        </div>
      )}

      {/* Top bar: profile selector + back button */}
      <ProfileSelector
        selectedId={selectedId}
        onSelect={handleSelectProfile}
        onBackToDashboard={handleBackToDashboard}
        userEmail={userEmail}
        onAboutOpen={() => setIsAboutOpen(true)}
        onAboutClose={() => setIsAboutOpen(false)}
      />

      <div style={styles.main}>
        {/* Left: Metrics */}
        <div style={styles.leftPanel}>
          <MetricsPanel profile={profile} selectedRegion={selectedRegion} />
        </div>

        {/* Center: 3D Visualization */}
        <div style={{ ...styles.center, ...(isAboutOpen ? { visibility: 'hidden' } : {}) }}>
          <div style={styles.viewToggle}>
            {['network', 'scan'].map(m => (
              <button
                key={m}
                style={{ ...styles.toggleBtn, ...(viewMode === m ? styles.toggleBtnActive : {}) }}
                onClick={() => setViewMode(m)}
              >
                {m === 'network' ? 'Neural Network' : 'Brain Scan'}
              </button>
            ))}
          </div>

          <Canvas
            camera={{ position: [0, 0, 7], fov: 50 }}
            style={{ background: viewMode === 'scan' ? '#01040a' : '#020610' }}
            dpr={[1, 2]}
          >
            <fog attach="fog" args={[viewMode === 'scan' ? '#01040a' : '#020610', 10, 25]} />
            <ambientLight intensity={viewMode === 'scan' ? 0.72 : 0.1} />
            {viewMode === 'scan' ? (
              <>
                <directionalLight position={[3,  5,  4]} intensity={1.6} color="#fff5e8" />
                <directionalLight position={[-4, 2,  2]} intensity={0.7} color="#c8d8ff" />
                <pointLight       position={[0, -3,  3]} intensity={0.5} color="#ffe0cc" distance={12} />
                <pointLight       position={[0,  4, -3]} intensity={0.4} color="#aabbff" distance={14} />
              </>
            ) : (
              <>
                <pointLight position={[ 5,  4,  5]} intensity={1.0} color="#00ccff" distance={20} />
                <pointLight position={[-5, -3,  3]} intensity={0.6} color="#ff3366" distance={15} />
                <pointLight position={[ 0,  5, -5]} intensity={0.4} color="#7c4dff" distance={15} />
                <pointLight position={[ 0, -4,  0]} intensity={0.3} color="#00e676" distance={10} />
              </>
            )}
            {viewMode === 'network' && (
              <Stars radius={80} depth={60} count={3000} factor={5} saturation={0.2} fade speed={0.8} />
            )}
            {viewMode === 'network' ? (
              <NeuralNetwork3D
                profile={profile}
                selectedRegion={selectedRegion}
                onSelectRegion={setSelectedRegion}
                isUserInteracting={isUserInteracting}
                onHoverInfo={(info) => { hoverInfoRef.current = info; setHoverInfo(info) }}
              />
            ) : (
              <BrainScan3D
                profile={profile}
                selectedRegion={selectedRegion}
                onSelectRegion={setSelectedRegion}
                isUserInteracting={isUserInteracting}
                onHoverInfo={(info) => { hoverInfoRef.current = info; setHoverInfo(info) }}
              />
            )}
            <OrbitControls
              enablePan={false}
              enableZoom={true}
              minDistance={3}
              maxDistance={15}
              enableDamping
              dampingFactor={0.05}
              onStart={() => setIsUserInteracting(true)}
              onEnd={() => setIsUserInteracting(false)}
            />
          </Canvas>

          {/* Hover tooltip */}
          {hoverInfo && (() => {
            const TW = 290, TH = 200, pad = 12
            const clampX = Math.min(hoverInfo.x + 16, window.innerWidth  - TW - pad)
            const clampY = Math.max(pad, Math.min(hoverInfo.y - TH / 2, window.innerHeight - TH - pad))
            return (
              <div style={{
                position: 'fixed', left: clampX, top: clampY,
                width: TW, pointerEvents: 'none', zIndex: 9999,
                background: 'rgba(2,5,18,0.97)',
                border: `1.5px solid ${hoverInfo.color}`,
                borderRadius: 12, padding: '14px 18px',
                boxShadow: `0 0 30px ${hoverInfo.color}55, 0 10px 40px rgba(0,0,0,0.9)`,
                backdropFilter: 'blur(12px)',
                fontFamily: "'SF Mono','Fira Code',monospace",
              }}>
                <div style={{ fontSize: 14, fontWeight: 'bold', color: hoverInfo.color, marginBottom: 3, textShadow: `0 0 10px ${hoverInfo.color}88` }}>
                  {hoverInfo.title}
                </div>
                <div style={{ fontSize: 9, color: '#64ffda', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 10 }}>
                  {hoverInfo.fn} — {Math.round(hoverInfo.activity * 100)}% Active
                </div>
                <div style={{ height: 6, background: '#0a1428', borderRadius: 3, overflow: 'hidden', marginBottom: 10 }}>
                  <div style={{ width: `${Math.round(hoverInfo.activity * 100)}%`, height: '100%', background: `linear-gradient(90deg,#0033ff,${hoverInfo.color})`, borderRadius: 3, boxShadow: `0 0 6px ${hoverInfo.color}` }} />
                </div>
                <div style={{ fontSize: 11, color: '#b0bec5', lineHeight: '1.6', marginBottom: 10 }}>{hoverInfo.description}</div>
                <div style={{ fontSize: 10, color: '#80cbc4', borderTop: '1px solid #1a3a5c', paddingTop: 8, fontStyle: 'italic', lineHeight: 1.5 }}>
                  ♂ {hoverInfo.maleTrait}
                </div>
              </div>
            )
          })()}

          {/* Overlay label */}
          <div style={styles.overlay}>
            <div style={styles.overlayTitle}>
              {viewMode === 'network' ? '3D Male Neural Network' : '3D Anatomical Brain Scan'}
            </div>
            <div style={styles.overlayHint}>
              {viewMode === 'network'
                ? 'Hover nodes · Click to select · Scroll to zoom · Drag to orbit · Chat to influence neural state'
                : 'Hover regions · Click to select · Drag to orbit · Speak to influence brain activity'}
            </div>
          </div>
        </div>

        {/* Right: Chat */}
        <div style={styles.rightPanel}>
          <ChatPanel key={chatKey} profileId={selectedId} onClearChat={handleClearChat} />
        </div>
      </div>
    </div>
  )
}

const styles = {
  app: {
    width: '100vw', height: '100vh',
    display: 'flex', flexDirection: 'column',
    background: '#020610',
    fontFamily: "'SF Mono','Fira Code','Consolas',monospace",
    color: '#ccd6f6', overflow: 'hidden',
  },
  warning: {
    background: '#ff3366', color: '#fff',
    padding: '8px 16px', fontSize: 12, textAlign: 'center',
  },
  main: { flex: 1, display: 'flex', overflow: 'hidden' },
  leftPanel:  { width: 300, flexShrink: 0 },
  center:     { flex: 1, position: 'relative', background: '#020610' },
  rightPanel: { width: 350, flexShrink: 0 },
  overlay: {
    position: 'absolute', bottom: 20, left: '50%',
    transform: 'translateX(-50%)', textAlign: 'center', pointerEvents: 'none',
  },
  overlayTitle: { fontSize: 12, color: '#4a5568', letterSpacing: '2px', textTransform: 'uppercase' },
  overlayHint:  { fontSize: 10, color: '#2d3748', marginTop: 4 },
  viewToggle: {
    position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)',
    display: 'flex', gap: 4, padding: 4,
    background: 'rgba(10,15,30,0.85)',
    border: '1px solid #1a3a5c', borderRadius: 8, zIndex: 10,
    backdropFilter: 'blur(8px)',
  },
  toggleBtn: {
    padding: '8px 18px', background: 'transparent', border: 'none',
    borderRadius: 6, color: '#4a5568', fontSize: 11, fontWeight: 'bold',
    cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '1.5px',
    fontFamily: "'SF Mono','Fira Code','Consolas',monospace",
    transition: 'all 0.2s ease',
  },
  toggleBtnActive: { background: '#00ccff', color: '#000', boxShadow: '0 0 15px #00ccff66' },
}
