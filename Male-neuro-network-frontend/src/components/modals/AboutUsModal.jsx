import React, { useEffect } from 'react'
import MaleWatermark from '../common/MaleWatermark'

const m = {
  page: {
    position: 'fixed', inset: 0, zIndex: 10000,
    background: '#020610',
    overflowY: 'auto', WebkitOverflowScrolling: 'touch',
    fontFamily: "'SF Mono','Fira Code',monospace",
    color: '#ccd6f6',
    display: 'flex', flexDirection: 'column',
    overflow: 'hidden', isolation: 'isolate',
  },
  topBar: {
    height: 52, flexShrink: 0,
    borderBottom: '1px solid rgba(0,204,255,0.1)',
    background: 'rgba(4,8,20,0.98)', backdropFilter: 'blur(12px)',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 32px',
  },
  topBrand: { fontSize: 10, letterSpacing: '3px', textTransform: 'uppercase', color: 'rgba(0,204,255,0.4)' },
  closeBtn: {
    padding: '6px 18px', background: 'rgba(0,204,255,0.06)',
    border: '1px solid rgba(0,204,255,0.2)', borderRadius: 6,
    color: 'rgba(0,204,255,0.7)', fontSize: 11, letterSpacing: '1px',
    cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
  },
  scroll: { flex: 1, overflowY: 'auto', scrollBehavior: 'smooth' },
  hero: {
    minHeight: '82vh', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    textAlign: 'center', padding: '60px 40px',
    position: 'relative', overflow: 'hidden',
    borderBottom: '1px solid rgba(0,204,255,0.07)',
  },
  heroBadge: {
    fontSize: 9, letterSpacing: '5px', textTransform: 'uppercase',
    color: '#00ccff', border: '1px solid rgba(0,204,255,0.22)',
    borderRadius: 20, padding: '5px 18px', marginBottom: 28, zIndex: 1,
  },
  heroTitle: {
    fontSize: 'clamp(52px,9vw,110px)', fontWeight: 900,
    letterSpacing: '6px', textTransform: 'uppercase',
    background: 'linear-gradient(135deg,#fff 0%,#00ccff 35%,#7c4dff 68%,#ff3366 100%)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
    margin: '0 0 20px', lineHeight: 1.05, whiteSpace: 'pre-line', zIndex: 1,
  },
  heroSub: {
    fontSize: 'clamp(11px,1.5vw,15px)', letterSpacing: '5px',
    textTransform: 'uppercase', color: 'rgba(150,180,220,0.55)',
    fontWeight: 300, margin: '0 0 32px', zIndex: 1,
  },
  heroLine: {
    width: 180, height: 1, zIndex: 1, marginBottom: 32,
    background: 'linear-gradient(to right,transparent,rgba(0,204,255,0.6),transparent)',
  },
  heroDesc: {
    fontSize: 15, color: '#4a6080', lineHeight: '1.9',
    maxWidth: 580, zIndex: 1, margin: 0,
  },
  section: { padding: '80px 40px', borderBottom: '1px solid rgba(255,255,255,0.03)' },
  sectionInner: { maxWidth: 1100, margin: '0 auto' },
  label: { fontSize: 9, letterSpacing: '4px', textTransform: 'uppercase', color: '#7c4dff', marginBottom: 12 },
  heading: {
    fontSize: 'clamp(22px,3.5vw,42px)', fontWeight: 800,
    letterSpacing: '2px', color: '#e2e8f0', margin: '0 0 36px',
  },
  missionGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 },
  bodyText: { fontSize: 14, color: '#4a6080', lineHeight: '1.9', margin: 0 },
  pillarsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 20 },
  pillar: {
    padding: '28px 22px', background: 'rgba(6,10,28,0.7)',
    borderRadius: 14, backdropFilter: 'blur(12px)',
  },
  pillarNum: { fontSize: 32, fontWeight: 900, opacity: 0.25, letterSpacing: '-2px', marginBottom: 14, lineHeight: 1 },
  pillarTitle: { fontSize: 13, fontWeight: 'bold', color: '#ccd6f6', marginBottom: 12, lineHeight: 1.3 },
  pillarDesc: { fontSize: 12, color: '#3a5070', lineHeight: '1.75' },
  valuesGrid: { display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 20 },
  valueCard: {
    padding: '28px 30px', background: 'rgba(6,10,28,0.6)',
    borderRadius: 12, backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.03)',
  },
  valueTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 12, letterSpacing: '0.5px' },
  valueText: { fontSize: 12, color: '#3a5070', lineHeight: '1.85', margin: 0 },
  techRow: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 },
  techCard: {
    padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 12,
    background: 'rgba(0,204,255,0.04)', border: '1px solid rgba(0,204,255,0.1)',
    borderRadius: 10,
  },
  techDot: { width: 6, height: 6, borderRadius: '50%', background: '#00ccff', boxShadow: '0 0 8px #00ccff', flexShrink: 0 },
  techLabel: { fontSize: 11, color: 'rgba(0,204,255,0.55)', letterSpacing: '1px' },
  creatorCard: {
    display: 'flex', gap: 36, alignItems: 'flex-start',
    background: 'rgba(4,8,24,0.8)', border: '1px solid rgba(0,204,255,0.1)',
    borderRadius: 18, padding: '36px 40px', maxWidth: 700,
    backdropFilter: 'blur(16px)',
  },
  creatorAvatar: {
    width: 72, height: 72, borderRadius: '50%', flexShrink: 0,
    background: 'linear-gradient(135deg,#00ccff,#7c4dff)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 22, fontWeight: 900, color: '#fff', letterSpacing: '1px',
  },
  creatorInfo: { flex: 1 },
  creatorName: { fontSize: 20, fontWeight: 800, color: '#e2e8f0', letterSpacing: '1px', marginBottom: 4 },
  creatorRole: { fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: '#2a4060', marginBottom: 16 },
  creatorBio: { fontSize: 13, color: '#3a5472', lineHeight: '1.85', marginBottom: 22 },
  linkedIn: {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    padding: '10px 22px',
    background: 'rgba(0,119,181,0.1)', border: '1px solid rgba(0,119,181,0.3)',
    borderRadius: 8, color: '#0ea5e9', fontSize: 11, fontWeight: 'bold',
    letterSpacing: '1.5px', textTransform: 'uppercase', textDecoration: 'none',
    fontFamily: "'SF Mono','Fira Code',monospace", transition: 'all 0.2s',
  },
  footer: {
    padding: '48px 40px', textAlign: 'center',
    borderTop: '1px solid rgba(0,204,255,0.06)',
  },
  footerBrand: { fontSize: 11, letterSpacing: '4px', textTransform: 'uppercase', color: 'rgba(0,204,255,0.3)', marginBottom: 14 },
  footerDisclaimer: { fontSize: 11, color: '#1a2840', fontStyle: 'italic', lineHeight: '1.7', marginBottom: 12 },
  footerCopy: { fontSize: 10, color: '#1a2535', letterSpacing: '1px' },
}

export default function AboutUsModal({ onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const pillars = [
    { color: '#00ccff', num: '01', title: '3D Neural Visualization',  desc: "An interactive, real-time 3D map of your brain's active regions. Rotate, zoom, and explore every neural cluster — translating complex neuroscience into something you can actually see and feel." },
    { color: '#7c4dff', num: '02', title: 'AI Neural Coach',          desc: 'Describe your mental state in plain language. The AI interprets your input, updates your live brain map instantly, and delivers science-backed, personalised recommendations.' },
    { color: '#00e676', num: '03', title: 'Male-Specific Science',    desc: 'Every metric is grounded in male neuroscience — testosterone-driven motivation circuits, stress-response patterns, and focus architectures specific to the male brain.' },
    { color: '#ff3366', num: '04', title: 'Anatomical Brain Scan',    desc: 'Switch to a clinical brain-scan perspective for region coherence scores, functional states, and a deeper anatomical understanding of what drives your daily performance.' },
    { color: '#ffaa00', num: '05', title: 'Bhagavad Gita Wisdom',     desc: "For every metric flagged as 'needs work', the platform pairs your score with a Bhagavad Gita verse — Sanskrit, English meaning, the neuroscience impact, and the practice the Gita prescribes. Translate any verse into 16 languages on the fly." },
  ]

  const stack = ['React · Three.js · R3F', 'Spring Boot · Java', 'OpenAI API', 'WebGL · Canvas 2D']

  const values = [
    { color: '#00ccff', title: 'Transparency',   text: 'We show you exactly what your data means and why. No black boxes — every metric is explained, every region is labelled, and every recommendation is justified.' },
    { color: '#7c4dff', title: 'Precision',       text: 'Generic wellness tools do not account for the male brain. Our models are calibrated specifically to male neural architecture, hormonal patterns, and behavioural science.' },
    { color: '#00e676', title: 'Accessibility',   text: 'Advanced neuroscience should not require a PhD to understand. We translate peer-reviewed research into visual, intuitive experiences anyone can engage with.' },
    { color: '#ff3366', title: 'Actionability',   text: 'Insight without action is just information. Every output from this platform is designed to produce a clear, concrete next step you can take today.' },
  ]

  return (
    <div style={m.page}>
      <div style={m.topBar}>
        <div style={m.topBrand}>MALE NEURO NETWORK &nbsp;·&nbsp; ABOUT</div>
        <button style={m.closeBtn} onClick={onClose}>← Back to App</button>
      </div>

      <div style={m.scroll}>

        {/* ── HERO ── */}
        <section style={m.hero}>
          <MaleWatermark />
          <div style={m.heroBadge}>Neural Intelligence Platform</div>
          <h1 style={m.heroTitle}>Male Neural{'\n'}Network</h1>
          <p style={m.heroSub}>Understand your brain.&nbsp;&nbsp;Optimise your life.</p>
          <div style={m.heroLine} />
          <p style={m.heroDesc}>
            A next-generation neuroscience platform that turns your lifestyle data into a living,
            breathing 3D map of your mind — built exclusively around the male brain, and paired with
            <span style={{ color: '#ffaa00' }}> Bhagavad Gita guidance</span> tuned to your weakest metrics.
          </p>
        </section>

        {/* ── MISSION ── */}
        <section style={m.section}>
          <div style={m.sectionInner}>
            <div style={m.label}>Our Mission</div>
            <h2 style={m.heading}>Why We Built This</h2>
            <div style={m.missionGrid}>
              <p style={m.bodyText}>
                Most wellness tools treat the brain as a black box. We disagree. The Male Neural Network
                was created to give men a clear, visual understanding of their own neural activity —
                so that improving focus, managing stress, and building mental resilience becomes
                something you can <em style={{ color: '#00ccff' }}>see</em>, not just feel.
              </p>
              <p style={m.bodyText}>
                Rooted in peer-reviewed neuroscience and powered by AI, the platform maps your habits,
                sleep, stress, and emotional state onto a real-time 3D brain — making abstract brain
                science tangible, personal, and actionable.
              </p>
            </div>
          </div>
        </section>

        {/* ── PILLARS ── */}
        <section style={{ ...m.section, background: 'rgba(0,204,255,0.02)' }}>
          <div style={m.sectionInner}>
            <div style={m.label}>Core Capabilities</div>
            <h2 style={m.heading}>What the Platform Does</h2>
            <div style={m.pillarsGrid}>
              {pillars.map(p => (
                <div key={p.num} style={{ ...m.pillar, borderTop: `3px solid ${p.color}` }}>
                  <div style={{ ...m.pillarNum, color: p.color }}>{p.num}</div>
                  <div style={m.pillarTitle}>{p.title}</div>
                  <div style={m.pillarDesc}>{p.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── GITA + SCIENCE ── */}
        <section style={{ ...m.section, background: 'linear-gradient(180deg, rgba(255,170,0,0.04) 0%, rgba(255,112,67,0.02) 100%)', borderTop: '1px solid rgba(255,170,0,0.12)', borderBottom: '1px solid rgba(255,170,0,0.12)' }}>
          <div style={m.sectionInner}>
            <div style={{ ...m.label, color: '#ffaa00' }}>Ancient Wisdom × Modern Science</div>
            <h2 style={m.heading}>Why the Bhagavad Gita</h2>
            <div style={m.missionGrid}>
              <p style={m.bodyText}>
                The neural coach diagnoses <em style={{ color: '#00ccff' }}>what</em> is out of balance.
                The Gita layer answers <em style={{ color: '#ffaa00' }}>what to do about it</em>.
                The Bhagavad Gita is one of the oldest systematic texts on the male inner battlefield — Arjuna's
                anxiety, paralysis, anger, doubt, and search for steadiness map almost cleanly onto modern
                constructs of low mindfulness, elevated stress, weak focus, and emotional dysregulation.
              </p>
              <p style={m.bodyText}>
                For every metric flagged as <span style={{ color: '#ff3366' }}>needs work</span>, the platform
                cross-references the Gita's situation taxonomy — anger, fear, depression, uncontrolled mind,
                demotivation, losing hope, seeking peace — and surfaces the verse that has guided practitioners
                for two and a half millennia. Modern neuroscience names the problem; the Gita prescribes the
                discipline. Translate any verse into <span style={{ color: '#ffaa00' }}>16 languages</span> while
                the Sanskrit shloka stays in Devanagari.
              </p>
            </div>
          </div>
        </section>

        {/* ── VALUES ── */}
        <section style={m.section}>
          <div style={m.sectionInner}>
            <div style={m.label}>Our Principles</div>
            <h2 style={m.heading}>What We Stand For</h2>
            <div style={m.valuesGrid}>
              {values.map(v => (
                <div key={v.title} style={{ ...m.valueCard, borderLeft: `3px solid ${v.color}` }}>
                  <div style={{ ...m.valueTitle, color: v.color }}>{v.title}</div>
                  <p style={m.valueText}>{v.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TECH ── */}
        <section style={{ ...m.section, background: 'rgba(0,204,255,0.02)' }}>
          <div style={m.sectionInner}>
            <div style={m.label}>Technology</div>
            <h2 style={m.heading}>Built With Precision</h2>
            <div style={m.techRow}>
              {stack.map(t => (
                <div key={t} style={m.techCard}>
                  <div style={m.techDot} />
                  <span style={m.techLabel}>{t}</span>
                </div>
              ))}
            </div>
            <p style={{ ...m.bodyText, marginTop: 24, maxWidth: 560 }}>
              Every layer of the stack is chosen for performance and precision — from WebGL-powered
              3D rendering at 60 fps, to a Spring Boot API that persists and evolves your neural
              profile with every conversation.
            </p>
          </div>
        </section>

        {/* ── CREATOR ── */}
        <section style={m.section}>
          <div style={m.sectionInner}>
            <div style={m.label}>The Creator</div>
            <h2 style={m.heading}>Behind the Project</h2>
            <div style={m.creatorCard}>
              <div style={m.creatorAvatar}>GL</div>
              <div style={m.creatorInfo}>
                <div style={m.creatorName}>Gauri Langote</div>
                <div style={m.creatorRole}>Creator &amp; Full-Stack Developer</div>
                <p style={m.creatorBio}>
                  Passionate about the intersection of neuroscience, AI, and human performance.
                  Male Neural Network is built to make brain science accessible, visual, and
                  genuinely useful for everyday life.
                </p>
                <a
                  href="https://www.linkedin.com/in/gaurilangote"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={m.linkedIn}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                  Know More — LinkedIn
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer style={m.footer}>
          <div style={m.footerBrand}>MALE NEURO NETWORK</div>
          <div style={m.footerDisclaimer}>
            Educational visualization tool &nbsp;·&nbsp; Not medical advice &nbsp;·&nbsp;
            Consult a qualified healthcare professional for any health concerns.
          </div>
          <div style={m.footerCopy}>© {new Date().getFullYear()} Gauri Langote. All rights reserved.</div>
        </footer>

      </div>
    </div>
  )
}
