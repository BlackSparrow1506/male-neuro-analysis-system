import React, { useEffect } from 'react'
import MaleWatermark from '../common/MaleWatermark'

const sp = {
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
    minHeight: '60vh', display: 'flex', flexDirection: 'column',
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
    background: 'linear-gradient(135deg,#fff 0%,#00ccff 45%,#7c4dff 100%)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
    margin: '0 0 20px', lineHeight: 1.05, zIndex: 1,
  },
  heroSub: {
    fontSize: 'clamp(11px,1.5vw,15px)', letterSpacing: '3px',
    textTransform: 'uppercase', color: 'rgba(150,180,220,0.5)',
    fontWeight: 300, margin: '0 0 32px', zIndex: 1,
  },
  heroLine: {
    width: 180, height: 1, zIndex: 1, marginBottom: 32,
    background: 'linear-gradient(to right,transparent,rgba(0,204,255,0.6),transparent)',
  },
  heroDesc: {
    fontSize: 15, color: '#4a6080', lineHeight: '1.9',
    maxWidth: 560, zIndex: 1, margin: 0,
  },
  section: { padding: '80px 40px', borderBottom: '1px solid rgba(255,255,255,0.03)' },
  sectionInner: { maxWidth: 1100, margin: '0 auto' },
  label: { fontSize: 9, letterSpacing: '4px', textTransform: 'uppercase', color: '#7c4dff', marginBottom: 12 },
  heading: {
    fontSize: 'clamp(22px,3.5vw,42px)', fontWeight: 800,
    letterSpacing: '2px', color: '#e2e8f0', margin: '0 0 36px',
  },
  channelsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 },
  channelCard: {
    padding: '32px 28px',
    background: 'rgba(6,10,28,0.7)',
    borderRadius: 14, backdropFilter: 'blur(12px)',
  },
  channelIcon: { fontSize: 28, marginBottom: 16, lineHeight: 1 },
  channelLabel: { fontSize: 9, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: 8 },
  channelValue: { fontSize: 15, fontWeight: 700, color: '#ccd6f6', marginBottom: 16, letterSpacing: '0.5px' },
  channelDetail: { fontSize: 12, color: '#3a5070', lineHeight: '1.85', margin: '0 0 20px' },
  channelLink: {
    display: 'inline-block', fontSize: 11, fontWeight: 'bold', letterSpacing: '1px',
    textTransform: 'uppercase', textDecoration: 'none',
    padding: '8px 16px', borderRadius: 6, border: '1px solid',
    fontFamily: "'SF Mono','Fira Code',monospace",
    background: 'transparent',
  },
  faqGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(440px,1fr))', gap: 20 },
  faqCard: {
    padding: '26px 30px',
    background: 'rgba(4,8,22,0.75)',
    border: '1px solid rgba(255,255,255,0.04)',
    borderRadius: 12, backdropFilter: 'blur(12px)',
  },
  faqQ: { fontSize: 13, fontWeight: 'bold', color: '#ccd6f6', marginBottom: 14, lineHeight: '1.5', letterSpacing: '0.3px' },
  faqA: { fontSize: 12, color: '#3a5070', lineHeight: '1.88', margin: 0 },
  guideGrid: { display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 20 },
  guideCard: {
    padding: '28px 30px',
    background: 'rgba(6,10,28,0.6)',
    borderRadius: 12, backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.03)',
  },
  guideTitle: { fontSize: 13, fontWeight: 'bold', marginBottom: 12, letterSpacing: '0.5px' },
  guideText: { fontSize: 12, color: '#3a5070', lineHeight: '1.85', margin: 0 },
  footer: {
    padding: '48px 40px', textAlign: 'center',
    borderTop: '1px solid rgba(0,204,255,0.06)',
  },
  footerBrand: { fontSize: 11, letterSpacing: '4px', textTransform: 'uppercase', color: 'rgba(0,204,255,0.3)', marginBottom: 14 },
  footerDisclaimer: { fontSize: 11, color: '#1a2840', fontStyle: 'italic', lineHeight: '1.7', marginBottom: 12 },
  footerCopy: { fontSize: 10, color: '#1a2535', letterSpacing: '1px' },
}

export default function SupportModal({ onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const channels = [
    {
      color: '#00ccff',
      icon: '✉',
      label: 'Email Support',
      value: 'g73552780@gmail.com',
      detail: 'For account issues, general questions, and feedback. Our team typically responds within 48 business hours.',
      action: null,
    },
    {
      color: '#7c4dff',
      icon: '⚡',
      label: 'Bug Reports & Feature Requests',
      value: 'GitHub Issues',
      detail: 'Found a technical issue or have a suggestion? Open an issue on GitHub and our development team will review it.',
      action: { label: 'Open GitHub Issues →', href: 'https://github.com/BlackSparrow1506/male-neuro-analysis-system/issues' },
    },
  ]

  const faqs = [
    {
      q: 'Is Male Neural Network a medical diagnostic tool?',
      a: 'No. Male Neural Network is strictly an educational visualization platform. It is not a substitute for professional medical advice, diagnosis, or treatment. The neural metrics are illustrative models based on lifestyle inputs, not clinical measurements. Always consult a qualified healthcare professional for any health concerns.',
    },
    {
      q: 'How is my profile data stored and protected?',
      a: 'Your profile data is stored securely on our servers and is used exclusively to generate your personalized neural visualization. We do not sell, share, or distribute your data to any third parties. Each profile remains private to your account.',
    },
    {
      q: 'What does the Neural Coherence Score represent?',
      a: "The Neural Coherence Score is a composite metric derived from the balance of activity across your brain's key regions. It reflects how well your neural systems are working in harmony based on your lifestyle, sleep, stress, and behavioral inputs. A higher score indicates more balanced activity.",
    },
    {
      q: 'How does the AI Neural Coach interpret my inputs?',
      a: 'The AI processes your natural language descriptions and maps them to known neural state patterns grounded in male-specific neuroscience research. It then updates your 3D brain visualization in real-time and generates personalised, science-backed recommendations tailored to your current state.',
    },
    {
      q: 'Why is the platform designed exclusively for males?',
      a: 'Male and female brains differ in structural connectivity, hormonal influence, stress-response patterns, and neural circuit organisation. Building male-specific models allows for far greater accuracy and relevance than a one-size-fits-all approach. The platform is purpose-built around those differences.',
    },
    {
      q: 'Can I use this on mobile or tablet devices?',
      a: 'The platform is optimized for desktop browsers with WebGL support. Mobile usage is possible but the full 3D visualization experience — including OrbitControls, brain scan mode, and real-time neural updates — requires a capable GPU and a larger screen for the intended experience.',
    },
    {
      q: 'How do I reset or delete my profile data?',
      a: 'You can clear your chat history directly within the platform using the clear history button in the chat panel. For full account or data deletion, contact our support email and we will process your request within 5 business days.',
    },
  ]

  const guidelines = [
    { color: '#00ccff', title: 'Educational Use Only', text: 'This platform is intended for self-awareness and educational purposes. It is not designed to diagnose, treat, or monitor any medical condition.' },
    { color: '#7c4dff', title: 'Honest Inputs',        text: 'The quality of your neural visualization depends entirely on the accuracy of the lifestyle data you provide. More honest inputs produce more meaningful insights.' },
    { color: '#00e676', title: 'Regular Check-ins',    text: 'Your neural profile evolves with every conversation. Return regularly and describe your current mental and physical state to keep your brain map current.' },
    { color: '#ff3366', title: 'Professional Advice',  text: 'If any visualization or insight concerns you about your mental health, do not rely on this platform. Seek guidance from a qualified mental health or medical professional immediately.' },
  ]

  return (
    <div style={sp.page}>
      <div style={sp.topBar}>
        <div style={sp.topBrand}>MALE NEURO NETWORK &nbsp;·&nbsp; SUPPORT</div>
        <button style={sp.closeBtn} onClick={onClose}>← Back to App</button>
      </div>

      <div style={sp.scroll}>

        {/* ── HERO ── */}
        <section style={sp.hero}>
          <MaleWatermark />
          <div style={sp.heroBadge}>Help Center</div>
          <h1 style={sp.heroTitle}>Support</h1>
          <p style={sp.heroSub}>We're here to help you get the most out of Male Neural Network.</p>
          <div style={sp.heroLine} />
          <p style={sp.heroDesc}>
            Browse the most common questions below, or reach out directly through one
            of our contact channels. Our goal is a fast, clear, and helpful response every time.
          </p>
        </section>

        {/* ── CONTACT CHANNELS ── */}
        <section style={sp.section}>
          <div style={sp.sectionInner}>
            <div style={sp.label}>Get In Touch</div>
            <h2 style={sp.heading}>Contact Channels</h2>
            <div style={sp.channelsGrid}>
              {channels.map(c => (
                <div key={c.label} style={{ ...sp.channelCard, borderTop: `3px solid ${c.color}` }}>
                  <div style={{ ...sp.channelIcon, color: c.color }}>{c.icon}</div>
                  <div style={{ ...sp.channelLabel, color: c.color }}>{c.label}</div>
                  <div style={sp.channelValue}>{c.value}</div>
                  <p style={sp.channelDetail}>{c.detail}</p>
                  {c.action && (
                    <a
                      href={c.action.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ ...sp.channelLink, color: c.color, borderColor: c.color }}
                    >
                      {c.action.label}
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section style={{ ...sp.section, background: 'rgba(0,204,255,0.015)' }}>
          <div style={sp.sectionInner}>
            <div style={sp.label}>Common Questions</div>
            <h2 style={sp.heading}>Frequently Asked Questions</h2>
            <div style={sp.faqGrid}>
              {faqs.map((f, i) => (
                <div key={i} style={sp.faqCard}>
                  <div style={sp.faqQ}>{f.q}</div>
                  <p style={sp.faqA}>{f.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── GUIDELINES ── */}
        <section style={sp.section}>
          <div style={sp.sectionInner}>
            <div style={sp.label}>Usage Guidelines</div>
            <h2 style={sp.heading}>How to Use This Platform</h2>
            <div style={sp.guideGrid}>
              {guidelines.map(g => (
                <div key={g.title} style={{ ...sp.guideCard, borderLeft: `3px solid ${g.color}` }}>
                  <div style={{ ...sp.guideTitle, color: g.color }}>{g.title}</div>
                  <p style={sp.guideText}>{g.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── COMMUNITY ── */}
        <section style={{ ...sp.section, background: 'rgba(0,230,118,0.015)' }}>
          <div style={sp.sectionInner}>
            <div style={sp.label}>Coming Soon</div>
            <h2 style={sp.heading}>Community &amp; Discussion</h2>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 32,
              padding: '40px 48px',
              background: 'rgba(0,230,118,0.04)',
              border: '1px solid rgba(0,230,118,0.15)',
              borderRadius: 20,
            }}>
              <div style={{ fontSize: 64, lineHeight: 1 }}>♂</div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#00e676', letterSpacing: '2px', marginBottom: 12 }}>
                  We're Building Something
                </div>
                <p style={{ fontSize: 13, color: '#3a4a60', lineHeight: 1.8, marginBottom: 16, maxWidth: 520 }}>
                  A dedicated space where Male Neural Network users can share insights, discuss neural patterns,
                  compare profiles, and explore the science of the male brain together. The community hub is
                  currently in active development.
                </p>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  {['Discussion Threads', 'Profile Sharing', 'Neural Insights', 'Research Forum'].map(f => (
                    <div key={f} style={{
                      padding: '5px 14px',
                      background: 'rgba(0,230,118,0.08)',
                      border: '1px solid rgba(0,230,118,0.2)',
                      borderRadius: 20,
                      fontSize: 10, color: '#00e676', letterSpacing: '1.5px', textTransform: 'uppercase',
                    }}>{f}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer style={sp.footer}>
          <div style={sp.footerBrand}>MALE NEURO NETWORK</div>
          <div style={sp.footerDisclaimer}>
            Educational visualization tool &nbsp;·&nbsp; Not medical advice &nbsp;·&nbsp;
            Consult a qualified healthcare professional for any health concerns.
          </div>
          <div style={sp.footerCopy}>© {new Date().getFullYear()} Gauri Langote. All rights reserved.</div>
        </footer>

      </div>
    </div>
  )
}
