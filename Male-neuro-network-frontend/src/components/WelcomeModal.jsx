import React, { useEffect, useRef, useState } from 'react'

// ─── CSS animations injected into <head> ───────────────────────────────────────
const ANIM_CSS = `
  @keyframes rotateSlow  { to { transform: rotate(360deg); } }
  @keyframes rotateRev   { to { transform: rotate(-360deg); } }
  @keyframes scrollBounce { 0%,100%{ transform: translateX(-50%) translateY(0); } 50%{ transform: translateX(-50%) translateY(10px); } }
  @keyframes borderPulse {
    0%,100% { box-shadow: 0 0 20px rgba(0,204,255,0.3), 0 0 50px rgba(0,204,255,0.1); }
    50%     { box-shadow: 0 0 60px rgba(0,204,255,0.9), 0 0 120px rgba(124,77,255,0.4), 0 0 200px rgba(0,204,255,0.15); }
  }
  @keyframes scanPulse {
    0%,100% { opacity: 0.4; transform: scaleX(1); }
    50%     { opacity: 1;   transform: scaleX(1.05); }
  }

  /* Reveal transitions */
  .nn-reveal {
    opacity: 0;
    transform: translateY(38px);
    transition: opacity 0.75s ease, transform 0.75s ease;
  }
  .nn-reveal.visible { opacity: 1; transform: translateY(0); }
  .nn-reveal.d1  { transition-delay: 0.10s; }
  .nn-reveal.d2  { transition-delay: 0.20s; }
  .nn-reveal.d3  { transition-delay: 0.30s; }
  .nn-reveal.d4  { transition-delay: 0.40s; }
  .nn-reveal.d5  { transition-delay: 0.50s; }
  .nn-reveal.d6  { transition-delay: 0.60s; }
  .nn-reveal.d7  { transition-delay: 0.70s; }

  /* Interactive elements */
  .nn-btn {
    cursor: pointer;
    transition: transform 0.3s ease, box-shadow 0.3s ease, filter 0.3s ease;
  }
  .nn-btn:hover {
    transform: translateY(-4px) scale(1.03) !important;
    filter: brightness(1.15);
    box-shadow: 0 20px 70px rgba(0,204,255,0.55), 0 0 100px rgba(124,77,255,0.3) !important;
  }
  .nn-btn:active { transform: scale(0.97) !important; }

  .nn-card {
    transition: transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
  }
  .nn-card:hover {
    transform: translateY(-8px) scale(1.01);
    box-shadow: 0 24px 70px rgba(0,204,255,0.18) !important;
  }

  .nn-row {
    transition: transform 0.25s ease, background 0.25s ease;
  }
  .nn-row:hover {
    transform: translateX(8px);
    background: rgba(0,204,255,0.07) !important;
  }

  /* Custom scrollbar */
  .nn-scroller::-webkit-scrollbar { width: 3px; }
  .nn-scroller::-webkit-scrollbar-track { background: transparent; }
  .nn-scroller::-webkit-scrollbar-thumb { background: rgba(0,204,255,0.25); border-radius: 2px; }
`

// ─── Helper ────────────────────────────────────────────────────────────────────
function hexToRgb(hex) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : [0, 204, 255]
}

// ─── Interstellar + Neural canvas background (fixed) ──────────────────────────
function NeuralSpaceCanvas() {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let raf
    let W = 0, H = 0
    let stars = [], nodes = [], pulses = []

    const COLORS = ['#00ccff', '#7c4dff', '#ff3366', '#00e676', '#64ffda']

    function init() {
      W = canvas.width  = window.innerWidth
      H = canvas.height = window.innerHeight

      stars = Array.from({ length: 320 }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.4 + 0.2,
        phase: Math.random() * Math.PI * 2,
        speed: 0.6 + Math.random() * 2.2,
      }))

      nodes = Array.from({ length: 30 }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.38,
        vy: (Math.random() - 0.5) * 0.38,
        r: 1.5 + Math.random() * 2,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.016 + Math.random() * 0.028,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      }))
    }

    let t = 0

    function tryFire() {
      if (pulses.length >= 8 || Math.random() > 0.022) return
      const n1 = nodes[Math.floor(Math.random() * nodes.length)]
      const n2 = nodes[Math.floor(Math.random() * nodes.length)]
      if (n1 === n2) return
      if (Math.hypot(n1.x - n2.x, n1.y - n2.y) < 230)
        pulses.push({ x: n1.x, y: n1.y, tx: n2.x, ty: n2.y, p: 0, color: n1.color })
    }

    function draw() {
      t += 0.007
      ctx.clearRect(0, 0, W, H)

      // Nebulae
      ;[
        [W * 0.15, H * 0.25, W * 0.52, 'rgba(80,0,160,0.065)'],
        [W * 0.85, H * 0.72, W * 0.48, 'rgba(0,60,140,0.07)'],
        [W * 0.5,  H * 0.5,  W * 0.65, 'rgba(0,80,110,0.04)'],
        [W * 0.3,  H * 0.8,  W * 0.3,  'rgba(120,0,80,0.045)'],
      ].forEach(([x, y, r, c]) => {
        const g = ctx.createRadialGradient(x, y, 0, x, y, r)
        g.addColorStop(0, c)
        g.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = g
        ctx.fillRect(0, 0, W, H)
      })

      // Stars
      stars.forEach(s => {
        const a = 0.12 + 0.78 * (0.5 + 0.5 * Math.sin(t * s.speed + s.phase))
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${a})`
        ctx.fill()
        if (s.r > 1.05 && a > 0.88) {
          ctx.strokeStyle = `rgba(255,255,255,${a * 0.3})`
          ctx.lineWidth = 0.4
          ctx.beginPath()
          ctx.moveTo(s.x - s.r * 3.5, s.y); ctx.lineTo(s.x + s.r * 3.5, s.y)
          ctx.moveTo(s.x, s.y - s.r * 3.5); ctx.lineTo(s.x, s.y + s.r * 3.5)
          ctx.stroke()
        }
      })

      // Neural connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const d = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y)
          if (d < 230) {
            const a = (1 - d / 230) * 0.22
            ctx.beginPath()
            ctx.moveTo(nodes[i].x, nodes[i].y)
            ctx.lineTo(nodes[j].x, nodes[j].y)
            ctx.strokeStyle = `rgba(0,180,255,${a})`
            ctx.lineWidth = a * 2.2
            ctx.stroke()
          }
        }
      }

      // Neural nodes
      nodes.forEach(n => {
        n.x += n.vx; n.y += n.vy; n.pulse += n.pulseSpeed
        if (n.x < 0) { n.x = 0; n.vx *= -1 }
        if (n.x > W) { n.x = W; n.vx *= -1 }
        if (n.y < 0) { n.y = 0; n.vy *= -1 }
        if (n.y > H) { n.y = H; n.vy *= -1 }

        const act = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(n.pulse))
        const gr = n.r * (4 + act * 5.5)
        const [r, g, b] = hexToRgb(n.color)

        const grd = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, gr)
        grd.addColorStop(0, `rgba(${r},${g},${b},${act * 0.72})`)
        grd.addColorStop(1, `rgba(${r},${g},${b},0)`)
        ctx.fillStyle = grd
        ctx.beginPath(); ctx.arc(n.x, n.y, gr, 0, Math.PI * 2); ctx.fill()

        ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2)
        ctx.fillStyle = n.color; ctx.fill()
      })

      // Synaptic pulses
      tryFire()
      pulses = pulses.filter(p => p.p < 1)
      pulses.forEach(p => {
        p.p += 0.019
        const x = p.x + (p.tx - p.x) * p.p
        const y = p.y + (p.ty - p.y) * p.p
        const [r, g, b] = hexToRgb(p.color)
        const grd = ctx.createRadialGradient(x, y, 0, x, y, 11)
        grd.addColorStop(0, `rgba(${r},${g},${b},1)`)
        grd.addColorStop(1, `rgba(${r},${g},${b},0)`)
        ctx.fillStyle = grd
        ctx.beginPath(); ctx.arc(x, y, 11, 0, Math.PI * 2); ctx.fill()
      })

      raf = requestAnimationFrame(draw)
    }

    init(); draw()
    window.addEventListener('resize', init)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', init) }
  }, [])

  return (
    <canvas
      ref={ref}
      style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}
    />
  )
}

// ─── Scroll-reveal hook ────────────────────────────────────────────────────────
function useReveal(threshold = 0.18) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true) },
      { threshold }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [threshold])
  return [ref, visible]
}

function v(visible, extra = '') {
  return `nn-reveal${visible ? ' visible' : ''}${extra ? ' ' + extra : ''}`
}

// ─── Section 1 — Hero ──────────────────────────────────────────────────────────
function HeroSection({ onClose }) {
  const [ref, visible] = useReveal(0.05)

  return (
    <div
      ref={ref}
      style={{
        height: '100vh', scrollSnapAlign: 'start',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', position: 'relative', overflow: 'hidden',
      }}
    >
      {/* Male symbol watermark — behind rings */}
      <div style={{
        position: 'absolute',
        fontSize: 500,
        color: 'rgba(0,204,255,0.032)',
        fontWeight: 900,
        lineHeight: 1,
        pointerEvents: 'none',
        zIndex: 0,
        userSelect: 'none',
        transform: 'translate(160px, -40px)',
        fontFamily: 'serif',
        letterSpacing: 0,
      }}>♂</div>

      {/* Skip button — top right */}
      <button
        className="nn-btn"
        onClick={onClose}
        style={{
          position: 'absolute', top: 28, right: 32,
          padding: '8px 22px',
          background: 'rgba(10,20,50,0.7)',
          border: '1px solid rgba(0,204,255,0.25)',
          borderRadius: 8,
          color: 'rgba(0,204,255,0.7)',
          fontSize: 11,
          letterSpacing: '2px',
          textTransform: 'uppercase',
          fontFamily: 'inherit',
          backdropFilter: 'blur(10px)',
          zIndex: 5,
        }}
      >
        Skip Intro
      </button>

      {/* Main content */}
      <div style={{ textAlign: 'center', zIndex: 1, padding: '0 40px', maxWidth: 860 }}>
        <div className={v(visible)} style={{ fontSize: 11, letterSpacing: '6px', color: '#00ccff', textTransform: 'uppercase', marginBottom: 24 }}>
          — Neural Intelligence Platform —
        </div>

        <h1 className={v(visible, 'd1')} style={{
          fontSize: 'clamp(46px,8vw,92px)',
          fontWeight: 900,
          letterSpacing: '6px',
          textTransform: 'uppercase',
          background: 'linear-gradient(135deg,#ffffff 0%,#00ccff 35%,#7c4dff 65%,#ff3366 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          margin: '0 0 6px',
          lineHeight: 1.08,
        }}>
          Male Neural
        </h1>
        <h1 className={v(visible, 'd2')} style={{
          fontSize: 'clamp(46px,8vw,92px)',
          fontWeight: 900,
          letterSpacing: '6px',
          textTransform: 'uppercase',
          background: 'linear-gradient(135deg,#7c4dff 0%,#00ccff 55%,#ffffff 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          margin: '0 0 32px',
          lineHeight: 1.08,
        }}>
          Network
        </h1>

        <p className={v(visible, 'd3')} style={{
          fontSize: 'clamp(13px,1.8vw,18px)',
          color: 'rgba(180,200,240,0.75)',
          letterSpacing: '4px',
          textTransform: 'uppercase',
          marginBottom: 54,
          fontWeight: 300,
        }}>
          Understand Your Brain.&nbsp;&nbsp;Optimize Your Life.
        </p>

        <div className={v(visible, 'd4')} style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 50, marginBottom: 20 }}>
          {[['3D', 'Neural Map'], ['AI', 'Coach'], ['Real‑Time', 'Analysis'], ['Gita', 'Wisdom']].map(([top, bot]) => (
            <div key={top} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 'bold', color: '#00ccff', letterSpacing: '2px' }}>{top}</div>
              <div style={{ fontSize: 10, color: '#3a4a6a', letterSpacing: '2px', textTransform: 'uppercase', marginTop: 4 }}>{bot}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="scroll-indicator" style={{
        position: 'absolute', bottom: 36, left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
        color: 'rgba(0,204,255,0.45)', fontSize: 10, letterSpacing: '3px',
        textTransform: 'uppercase', animation: 'scrollBounce 1.8s ease-in-out infinite',
        pointerEvents: 'none',
      }}>
        <span>Scroll</span>
        <div style={{ width: 1, height: 44, background: 'linear-gradient(to bottom,rgba(0,204,255,0.6),transparent)' }} />
      </div>
    </div>
  )
}

// ─── Section 2 — What Is This ─────────────────────────────────────────────────
function WhatSection() {
  const [ref, visible] = useReveal()

  return (
    <div
      ref={ref}
      style={{
        height: '100vh', scrollSnapAlign: 'start',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '40px', boxSizing: 'border-box',
      }}
    >
      <div style={{ maxWidth: 800, width: '100%' }}>
        <div className={v(visible)} style={{ fontSize: 11, letterSpacing: '5px', color: '#7c4dff', textTransform: 'uppercase', marginBottom: 14 }}>
          01 / 04 — Discovery
        </div>
        <h2 className={v(visible, 'd1')} style={{
          fontSize: 'clamp(30px,5vw,58px)',
          fontWeight: 'bold', color: '#e2e8f0',
          marginBottom: 32, lineHeight: 1.15, letterSpacing: '2px',
        }}>
          What Is This?
        </h2>

        <div className={v(visible, 'd2')} style={{
          padding: '32px 36px',
          background: 'rgba(8,12,36,0.78)',
          border: '1px solid rgba(0,204,255,0.14)',
          borderRadius: 18,
          backdropFilter: 'blur(24px)',
          boxShadow: '0 0 60px rgba(0,204,255,0.04)',
          marginBottom: 22,
        }}>
          <p style={{ fontSize: 17, color: '#8892b0', lineHeight: '1.88', margin: 0 }}>
            A <span style={{ color: '#00ccff', fontWeight: 'bold' }}>personal neural network analyzer</span> built
            specifically for men. It creates a live visual map of your brain's activity based on your lifestyle,
            habits, and daily state.
          </p>
        </div>

        <div className={v(visible, 'd3')} style={{
          padding: '26px 32px',
          background: 'rgba(4,8,24,0.65)',
          border: '1px solid rgba(124,77,255,0.18)',
          borderRadius: 14,
          backdropFilter: 'blur(14px)',
        }}>
          <p style={{ fontSize: 15, color: '#8892b0', lineHeight: '1.82', margin: 0 }}>
            Think of it as a{' '}
            <span style={{ color: '#64ffda', fontWeight: 'bold' }}>dashboard for your mind</span> — showing you
            which parts of your brain are thriving and which need attention. Built on neuroscience research
            focused on male‑specific brain patterns and behavioral data.
          </p>
        </div>

        {/* Decorative scan line */}
        <div className={v(visible, 'd4')} style={{
          marginTop: 28, height: 2,
          background: 'linear-gradient(to right,transparent,rgba(0,204,255,0.5),rgba(124,77,255,0.4),transparent)',
          animation: 'scanPulse 3s ease-in-out infinite',
        }} />
      </div>
    </div>
  )
}

// ─── Section 3 — How Does It Work ─────────────────────────────────────────────
function HowSection() {
  const [ref, visible] = useReveal()

  const steps = [
    {
      num: '01', color: '#00ccff',
      title: 'Create Your Profile',
      desc: 'Tell us about your sleep, exercise, stress, social life, and goals. This builds your personalised neural baseline in seconds.',
    },
    {
      num: '02', color: '#7c4dff',
      title: 'Explore Your 3D Brain',
      desc: 'Watch your brain light up in real-time. Hover any region to learn exactly what it does and why it matters for your daily life.',
    },
    {
      num: '03', color: '#ff3366',
      title: 'Chat With Neural AI',
      desc: 'Describe your mental state. The AI analyzes your input, updates your brain map live, and gives specific actionable advice.',
    },
    {
      num: '04', color: '#ffaa00',
      title: 'Receive Gita Wisdom',
      desc: 'For every metric flagged "needs work", get a Bhagavad Gita verse — Sanskrit, English meaning, the neuroscience impact, and the practice prescribed by the Gita. Translate any verse into 16 languages on the fly.',
    },
  ]

  return (
    <div
      ref={ref}
      style={{
        height: '100vh', scrollSnapAlign: 'start',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '40px', boxSizing: 'border-box',
      }}
    >
      <div style={{ maxWidth: 940, width: '100%' }}>
        <div className={v(visible)} style={{ fontSize: 11, letterSpacing: '5px', color: '#00ccff', textTransform: 'uppercase', marginBottom: 14 }}>
          02 / 04 — Process
        </div>
        <h2 className={v(visible, 'd1')} style={{
          fontSize: 'clamp(30px,5vw,58px)',
          fontWeight: 'bold', color: '#e2e8f0',
          marginBottom: 40, lineHeight: 1.15, letterSpacing: '2px',
        }}>
          How Does It Work?
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 20 }}>
          {steps.map((s, i) => (
            <div
              key={s.num}
              className={`nn-card ${v(visible, `d${i + 2}`)}`}
              style={{
                padding: '32px 28px',
                background: 'rgba(6,10,28,0.82)',
                border: `1px solid ${s.color}1e`,
                borderRadius: 18,
                backdropFilter: 'blur(22px)',
                boxShadow: `0 0 28px ${s.color}08`,
              }}
            >
              <div style={{ fontSize: 42, fontWeight: 900, color: s.color, opacity: 0.28, marginBottom: 10, letterSpacing: '-3px', lineHeight: 1 }}>
                {s.num}
              </div>
              <div style={{ fontSize: 16, fontWeight: 'bold', color: '#ccd6f6', marginBottom: 14, lineHeight: 1.35 }}>
                {s.title}
              </div>
              <div style={{ fontSize: 13, color: '#4a6080', lineHeight: '1.75' }}>
                {s.desc}
              </div>
              <div style={{ marginTop: 24, height: 2, background: `linear-gradient(to right,${s.color},transparent)` }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Section 4 — What Will You Learn ─────────────────────────────────────────
function LearnSection() {
  const [ref, visible] = useReveal()

  const items = [
    { label: 'Neural Coherence Score',     desc: 'How balanced your brain systems are overall',               color: '#00ccff' },
    { label: 'Your Strengths',             desc: "What you're doing right that boosts brain function",        color: '#00e676' },
    { label: 'Your Weaknesses',            desc: "What's holding you back, with science-backed explanations", color: '#ff3366' },
    { label: 'Personalised Action Plan',   desc: 'Specific steps to balance your neural network today',       color: '#7c4dff' },
    { label: 'Bhagavad Gita Guidance',     desc: 'Each weak metric paired with a verse, its meaning, and the practice the Gita prescribes', color: '#ffaa00' },
    { label: 'Male Brain Specifics',       desc: 'How each region works and what affects it in men',          color: '#64ffda' },
  ]

  return (
    <div
      ref={ref}
      style={{
        height: '100vh', scrollSnapAlign: 'start',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '40px', boxSizing: 'border-box',
      }}
    >
      <div style={{ maxWidth: 720, width: '100%' }}>
        <div className={v(visible)} style={{ fontSize: 11, letterSpacing: '5px', color: '#00e676', textTransform: 'uppercase', marginBottom: 14 }}>
          03 / 04 — Insights
        </div>
        <h2 className={v(visible, 'd1')} style={{
          fontSize: 'clamp(30px,5vw,58px)',
          fontWeight: 'bold', color: '#e2e8f0',
          marginBottom: 36, lineHeight: 1.15, letterSpacing: '2px',
        }}>
          What Will You Learn?
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {items.map((item, i) => (
            <div
              key={item.label}
              className={`nn-row ${v(visible, `d${i + 2}`)}`}
              style={{
                display: 'flex', alignItems: 'center', gap: 20,
                padding: '18px 24px',
                background: 'rgba(6,10,28,0.65)',
                border: `1px solid ${item.color}16`,
                borderRadius: 12,
                backdropFilter: 'blur(14px)',
              }}
            >
              <div style={{
                width: 7, height: 7, borderRadius: '50%',
                background: item.color,
                boxShadow: `0 0 12px ${item.color}`,
                flexShrink: 0,
              }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 'bold', color: '#ccd6f6' }}>{item.label}</div>
                <div style={{ fontSize: 12, color: '#3a4a60', marginTop: 3 }}>{item.desc}</div>
              </div>
              <div style={{ fontSize: 12, color: item.color, flexShrink: 0 }}>→</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Section 5 — CTA ──────────────────────────────────────────────────────────
function CTASection({ onClose }) {
  const [ref, visible] = useReveal()

  return (
    <div
      ref={ref}
      style={{
        height: '100vh', scrollSnapAlign: 'start',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', padding: '40px', boxSizing: 'border-box',
        textAlign: 'center', position: 'relative',
      }}
    >
      <div className={v(visible)} style={{ fontSize: 11, letterSpacing: '5px', color: '#ff3366', textTransform: 'uppercase', marginBottom: 14, zIndex: 1 }}>
        04 / 04 — Begin
      </div>

      <h2 className={v(visible, 'd1')} style={{
        fontSize: 'clamp(26px,4vw,50px)',
        fontWeight: 'bold', color: '#e2e8f0',
        marginBottom: 14, letterSpacing: '2px', zIndex: 1,
      }}>
        When Should You Use It?
      </h2>

      <p className={v(visible, 'd2')} style={{
        fontSize: 16, color: '#4a6080', lineHeight: '1.85',
        maxWidth: 540, marginBottom: 50, zIndex: 1,
      }}>
        When you want to understand why you feel a certain way — stressed, unfocused, or uninspired.
        Come back regularly.{' '}
        <span style={{ color: '#00ccff' }}>Your profile evolves as you chat.</span>
      </p>

      <button
        className={`nn-btn ${v(visible, 'd3')}`}
        onClick={onClose}
        style={{
          padding: '22px 68px',
          background: 'linear-gradient(135deg,#00ccff 0%,#7c4dff 50%,#ff3366 100%)',
          border: 'none',
          borderRadius: 14,
          color: '#fff',
          fontSize: 16,
          fontWeight: 'bold',
          letterSpacing: '4px',
          textTransform: 'uppercase',
          fontFamily: 'inherit',
          boxShadow: '0 12px 50px rgba(0,204,255,0.35),0 0 90px rgba(124,77,255,0.2)',
          zIndex: 1,
          marginBottom: 36,
        }}
      >
        Enter Neural Network
      </button>

      <p className={v(visible, 'd4')} style={{
        fontSize: 11, color: '#1e2840', fontStyle: 'italic',
        maxWidth: 420, lineHeight: '1.65', zIndex: 1,
      }}>
        Educational visualization tool · Not medical advice ·
        Consult a healthcare professional for health concerns
      </p>
    </div>
  )
}

// ─── Main export ───────────────────────────────────────────────────────────────
export default function WelcomeModal({ onClose }) {
  // Inject CSS
  useEffect(() => {
    const el = document.createElement('style')
    el.id = 'nn-landing-css'
    el.textContent = ANIM_CSS
    document.head.appendChild(el)
    return () => { const s = document.getElementById('nn-landing-css'); if (s) s.remove() }
  }, [])

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: '#020610',
      zIndex: 1000,
      fontFamily: "'SF Mono','Fira Code',monospace",
    }}>
      {/* Fixed animated background */}
      <NeuralSpaceCanvas />

      {/* Full-page scroll-snap container */}
      <div
        className="nn-scroller"
        style={{
          position: 'absolute', inset: 0,
          overflowY: 'scroll',
          scrollSnapType: 'y mandatory',
          scrollBehavior: 'smooth',
          zIndex: 1,
        }}
      >
        <HeroSection onClose={onClose} />
        <WhatSection />
        <HowSection />
        <LearnSection />
        <CTASection onClose={onClose} />
      </div>
    </div>
  )
}
