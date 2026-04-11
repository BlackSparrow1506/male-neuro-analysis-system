import React, { useState, useEffect, useCallback } from 'react'
import { fetchProfiles } from '../api'

// ─── Shared male-symbol watermark ─────────────────────────────────────────────
function MaleWatermark() {
  return (
    <div style={{
      position: 'absolute',
      fontSize: 520,
      color: 'rgba(0,204,255,0.028)',
      fontWeight: 900,
      lineHeight: 1,
      pointerEvents: 'none',
      zIndex: 0,
      userSelect: 'none',
      transform: 'translate(170px, -50px)',
      fontFamily: 'serif',
    }}>♂</div>
  )
}

// ─── Support Full Page ─────────────────────────────────────────────────────────
export function SupportModal({ onClose }) {
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
      value: 'support@maleneuronetwork.com',
      detail: 'For account issues, general questions, and feedback. Our team typically responds within 48 business hours.',
      action: null,
    },
    {
      color: '#7c4dff',
      icon: '⚡',
      label: 'Bug Reports & Feature Requests',
      value: 'GitHub Issues',
      detail: 'Found a technical issue or have a suggestion? Open an issue on GitHub and our development team will review it.',
      action: { label: 'Open GitHub Issues →', href: 'https://github.com/gaurilangote/male-neuro-network/issues' },
    },
    {
      color: '#00e676',
      icon: '♂',
      label: 'Community & Discussion',
      value: 'Coming Soon',
      detail: 'A dedicated community space for Male Neural Network users is currently in development. Stay tuned.',
      action: null,
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

const sp = {
  page: {
    position: 'fixed', inset: 0, zIndex: 10000,
    background: '#020610',
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

// ─── Copyright Modal ───────────────────────────────────────────────────────────
export function CopyrightModal({ onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const deps = [
    { name: 'React',             version: '18.3',  license: 'MIT',         author: 'Meta Platforms Inc.',     url: 'https://react.dev' },
    { name: 'Three.js',          version: '0.170', license: 'MIT',         author: 'Mr.doob & Contributors',  url: 'https://threejs.org' },
    { name: 'React Three Fiber', version: '8.x',   license: 'MIT',         author: 'Poimandres',              url: 'https://r3f.docs.pmnd.rs' },
    { name: 'React Three Drei',  version: '9.x',   license: 'MIT',         author: 'Poimandres',              url: 'https://github.com/pmndrs/drei' },
    { name: 'Vite',              version: '6.x',   license: 'MIT',         author: 'Evan You & Contributors', url: 'https://vitejs.dev' },
    { name: 'Spring Boot',       version: '3.x',   license: 'Apache 2.0',  author: 'Pivotal / VMware',        url: 'https://spring.io/projects/spring-boot' },
    { name: 'OpenAI API',        version: 'GPT-4', license: 'Commercial',  author: 'OpenAI',                  url: 'https://openai.com' },
  ]

  return (
    <div style={cop.overlay}>
      <div style={cop.modal}>
        <div style={cop.header}>
          <div>
            <div style={cop.badge}>Legal &amp; Attribution</div>
            <h2 style={cop.title}>Copyright</h2>
          </div>
          <button style={cop.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div style={cop.mainCard}>
          <div style={cop.symbol}>©</div>
          <div>
            <div style={cop.copyYear}>© {new Date().getFullYear()} Gauri Langote</div>
            <div style={cop.copyDesc}>
              All rights reserved. Male Neural Network and its visual assets, data models,
              neural algorithms, and user interface design are the intellectual property of the creator.
            </div>
          </div>
        </div>

        <div style={cop.section}>
          <div style={cop.sectionLabel}>Platform License</div>
          <div style={cop.licenseBox}>
            <p style={cop.licenseText}>
              Male Neural Network is a proprietary educational visualization platform. The platform
              code, design language, neural modeling algorithms, and all associated creative works
              are proprietary. Reproduction, redistribution, or commercial use of any part of this
              platform without explicit written permission from the creator is strictly prohibited.
            </p>
          </div>
        </div>

        <div style={cop.section}>
          <div style={cop.sectionLabel}>Open-Source Acknowledgements</div>
          <div style={cop.depsGrid}>
            {deps.map(d => (
              <a key={d.name} href={d.url} target="_blank" rel="noopener noreferrer" style={cop.depCard}>
                <div style={cop.depName}>{d.name}&nbsp;<span style={{ opacity: 0.4 }}>v{d.version}</span></div>
                <div style={cop.depMeta}>{d.author}</div>
                <div style={cop.depLicense}>{d.license}</div>
              </a>
            ))}
          </div>
        </div>

        <div style={cop.footer}>
          Trademarks of third-party services belong to their respective owners. Male Neural Network
          is not affiliated with or endorsed by any third-party organisation.
        </div>
      </div>
    </div>
  )
}

const cop = {
  overlay: {
    position: 'fixed', inset: 0, zIndex: 20000,
    background: 'rgba(2,6,18,0.88)', backdropFilter: 'blur(16px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '20px',
  },
  modal: {
    width: '100%', maxWidth: 660, maxHeight: '85vh',
    background: 'rgba(4,8,24,0.99)',
    border: '1px solid rgba(124,77,255,0.15)',
    borderRadius: 20, padding: '36px 40px', overflowY: 'auto',
    boxShadow: '0 0 80px rgba(124,77,255,0.06), 0 40px 100px rgba(0,0,0,0.85)',
    fontFamily: "'SF Mono','Fira Code',monospace", color: '#ccd6f6',
  },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 },
  badge: { fontSize: 9, letterSpacing: '4px', textTransform: 'uppercase', color: '#7c4dff', marginBottom: 8 },
  title: { fontSize: 28, fontWeight: 900, color: '#e2e8f0', margin: 0, letterSpacing: '2px' },
  closeBtn: {
    padding: '8px 14px', background: 'rgba(124,77,255,0.06)',
    border: '1px solid rgba(124,77,255,0.2)', borderRadius: 8,
    color: 'rgba(124,77,255,0.7)', fontSize: 14, cursor: 'pointer',
    fontFamily: 'inherit',
  },
  mainCard: {
    display: 'flex', gap: 24, alignItems: 'flex-start',
    padding: '24px 28px', marginBottom: 28,
    background: 'rgba(124,77,255,0.04)',
    border: '1px solid rgba(124,77,255,0.12)', borderRadius: 14,
  },
  symbol: { fontSize: 40, color: '#7c4dff', opacity: 0.5, lineHeight: 1, flexShrink: 0 },
  copyYear: { fontSize: 18, fontWeight: 800, color: '#e2e8f0', marginBottom: 10, letterSpacing: '1px' },
  copyDesc: { fontSize: 12, color: '#3a5070', lineHeight: '1.85' },
  section: { marginBottom: 28 },
  sectionLabel: { fontSize: 9, letterSpacing: '4px', textTransform: 'uppercase', color: '#7c4dff', marginBottom: 14 },
  licenseBox: { padding: '20px 24px', background: 'rgba(4,8,20,0.5)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 10 },
  licenseText: { fontSize: 12, color: '#2a4060', lineHeight: '1.85', margin: 0 },
  depsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 10 },
  depCard: {
    padding: '14px 16px', background: 'rgba(0,204,255,0.02)',
    border: '1px solid rgba(0,204,255,0.08)', borderRadius: 10,
    textDecoration: 'none', display: 'block',
  },
  depName: { fontSize: 12, fontWeight: 'bold', color: '#8892b0', marginBottom: 4, fontFamily: "'SF Mono','Fira Code',monospace" },
  depMeta: { fontSize: 10, color: '#2a3a50', marginBottom: 4 },
  depLicense: { fontSize: 9, letterSpacing: '2px', textTransform: 'uppercase', color: '#7c4dff', opacity: 0.6 },
  footer: { fontSize: 10, color: '#1e2840', lineHeight: '1.7', fontStyle: 'italic', borderTop: '1px solid rgba(124,77,255,0.06)', paddingTop: 16 },
}

// ─── Research Hub Full Page ───────────────────────────────────────────────────
export function ResearchModal({ onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const overview = [
    { color: '#00ccff', num: '01', title: 'Biological Neural Networks', desc: 'In biological terms, the male neural network refers to brain circuits that govern innate male-specific behaviours — mating, mate-searching, aggression, and reward. These are physically "wired" during development by hormonal and genetic signals.' },
    { color: '#7c4dff', num: '02', title: 'Artificial Neural Networks', desc: 'In AI, male neural networks are computational models trained on male-specific data — brain MRI scans, physiological signals, or behavioural datasets — to classify, predict, or simulate male-specific patterns with high accuracy.' },
    { color: '#00e676', num: '03', title: 'Structural Connectome', desc: 'The human connectome reveals male brains are optimised for intra-hemispheric communication — stronger front-to-back wiring within each hemisphere, supporting coordination between perception and action, alongside greater white matter density.' },
    { color: '#ff3366', num: '04', title: 'Sex-Specific Neurons', desc: 'In model organisms like C. elegans, roughly 25% of the male neural network consists of male-specific neurons, versus only ~1.6% in hermaphrodites. This demonstrates that sex-specific circuitry is a fundamental principle of neural organisation.' },
  ]

  const circuits = [
    { color: '#00ccff', region: 'BNST / POA Circuit', full: 'Bed Nucleus of the Stria Terminalis & Preoptic Area', fn: 'Sexual Behaviour & Mate-Seeking', desc: 'A multisynaptic pathway connects pheromone sensory inputs to BNST and POA neurons in the hypothalamus. This circuit triggers dopamine release, making mate-seeking behaviours inherently rewarding for the male. It is "developmentally wired" — fixed by hormonal exposure during a critical window.' },
    { color: '#7c4dff', region: 'VMHvl Circuit', full: 'Ventrolateral Ventromedial Hypothalamus', fn: 'Aggression & Territorial Behaviour', desc: 'The VMHvl controls reactive male–male attacks in mammals. Optogenetic stimulation of this region can trigger or suppress aggressive episodes. It integrates sensory threat cues with hormonal state (testosterone) to calibrate response intensity.' },
    { color: '#00e676', region: 'Mesolimbic Dopamine', full: 'VTA → Nucleus Accumbens → Prefrontal Cortex', fn: 'Reward, Motivation & Drive', desc: 'Testosterone potentiates dopamine release in the nucleus accumbens, amplifying reward-seeking and competitive motivation. Males show higher baseline dopamine turnover in striatal regions, linked to goal-directed behaviour and drive.' },
    { color: '#ff3366', region: 'Amygdala (Right)', full: 'Lateral & Basolateral Amygdala', fn: 'Emotional Memory & Threat Processing', desc: 'Males show preferential right-hemisphere amygdala activation during emotional memory encoding, with stronger connectivity to motor and action circuits — encoding emotional experience as action-oriented memory rather than internal/verbal memory.' },
    { color: '#64ffda', region: 'Hypothalamus INAH-3', full: 'Interstitial Nuclei of the Anterior Hypothalamus', fn: 'Sexual Orientation & Endocrine Control', desc: 'INAH-3 is 2–3× larger in males than females. This region integrates hormonal signals and governs gonadotropin release, sex drive, and certain aspects of sexual orientation. Differences are established during prenatal testosterone exposure.' },
    { color: '#ffab40', region: 'Cerebellum', full: 'Cerebellar Cortex & Deep Nuclei', fn: 'Motor Coordination & Spatial Processing', desc: 'Males consistently show higher metabolic activity and larger cerebellar volumes relative to other structures. The cerebellum contributes to fine motor control, spatial navigation, and — increasingly — to cognitive processing and emotional regulation.' },
  ]

  const hotspots = [
    { label: 'Amygdala',    value: 'Larger volume in males; linked to emotional memory, threat detection, and social aggression processing.' },
    { label: 'Striatum',    value: 'Higher volume in males; core reward and habit-learning structure, heavily modulated by testosterone.' },
    { label: 'Cerebellum',  value: 'Higher metabolic activity and volume; motor coordination, spatial cognition, and emerging cognitive roles.' },
    { label: 'INAH-3',      value: '2–3× larger in males; hypothalamic nucleus governing sex drive and gonadotropin release.' },
    { label: 'IPL',         value: 'Inferior parietal lobule — proportionally larger in males; linked to spatial task performance and speed judgement.' },
    { label: 'White Matter', value: 'Males have a higher percentage of myelinated axons (white matter) supporting long-distance intra-hemispheric signalling.' },
  ]

  const aiSteps = [
    { num: '01', color: '#00ccff', title: 'Data Collection', desc: 'Gather thousands of 3D fMRI or structural MRI scans from open databases such as the Human Connectome Project, OpenNeuro, or ABIDE. A typical training set requires 5,000–20,000 scans.' },
    { num: '02', color: '#7c4dff', title: 'Architecture: 3D CNN', desc: 'Unlike standard 2D CNNs, a 3D Convolutional Neural Network extracts spatial features across the entire brain volume simultaneously — capturing inter-regional connectivity patterns invisible in 2D slices.' },
    { num: '03', color: '#00e676', title: 'Feature Extraction', desc: 'The model identifies hotspots in the striatum and limbic network (reward systems), the default mode network (self-referential thought), and cerebellar–cortical connectivity patterns.' },
    { num: '04', color: '#ff3366', title: 'Training & Accuracy', desc: 'The network is trained on labelled brain scans. Modern 3D CNN architectures achieve 94–98% sex-classification accuracy, detecting subtle structural patterns that are invisible to the human eye.' },
    { num: '05', color: '#64ffda', title: 'Facial Classification', desc: 'For facial-based models, 2D CNNs (ResNet-50, VGG16) trained on datasets like CelebA analyse jawline, brow, and nose geometry. These typically achieve 90–95% accuracy at biological sex classification.' },
    { num: '06', color: '#ffab40', title: 'RAG Memory Architecture', desc: 'For personalised AI models, Retrieval-Augmented Generation (RAG) stores past user interactions as vectors in Pinecone or Weaviate. Before each response, the model retrieves relevant past context — enabling genuine longitudinal "understanding" of the individual.' },
  ]

  const databases = [
    { color: '#00ccff', name: 'Human Connectome Project', abbr: 'HCP', desc: 'The gold standard for human brain connectivity data. Over 1,200 subjects with high-resolution structural and functional MRI, diffusion imaging, and behavioural measures.', url: 'https://www.humanconnectome.org' },
    { color: '#7c4dff', name: 'PubMed / NCBI',           abbr: 'NIH', desc: 'The primary index of biomedical literature. Over 36 million citations. Essential for locating primary research on male neuroscience, sex differences, and brain structure.', url: 'https://pubmed.ncbi.nlm.nih.gov' },
    { color: '#00e676', name: 'OpenNeuro',                abbr: 'BIDS', desc: 'Free, open platform for neuroimaging data sharing. Thousands of MRI, MEG, and EEG datasets available in BIDS format, ready for computational analysis.', url: 'https://openneuro.org' },
    { color: '#ff3366', name: 'Allen Brain Atlas',        abbr: 'ABA', desc: 'Comprehensive gene expression and neuroanatomy atlas of the human and mouse brain. Critical for understanding molecular sex differences across brain regions.', url: 'https://brain-map.org' },
    { color: '#64ffda', name: 'PMC Full-Text Archive',    abbr: 'PMC', desc: 'Over 9 million full-text biomedical and life science articles available free of charge. The most comprehensive open-access archive for neuroscience papers.', url: 'https://pmc.ncbi.nlm.nih.gov' },
    { color: '#ffab40', name: 'Kaggle Neuroscience',      abbr: 'ML',  desc: 'Open machine-learning datasets including Mental Health in Tech Survey, Men\'s Health Statistics, and EEG signals datasets — ideal for building and benchmarking predictive models.', url: 'https://www.kaggle.com' },
  ]

  const scientists = [
    { name: 'Larry Cahill',       inst: 'UC Irvine',           field: 'Sex differences in memory & emotion',            contact: 'https://www.faculty.uci.edu/profile.cfm?faculty_id=2263' },
    { name: 'Margaret McCarthy',  inst: 'Univ. of Maryland',   field: 'Sex differences in brain development',           contact: 'https://www.medschool.umaryland.edu/profiles/McCarthy-Margaret/' },
    { name: 'Simon Baron-Cohen',  inst: 'Cambridge University', field: 'Male brain theory, empathizing-systemizing',    contact: 'https://www.autismresearchcentre.com' },
    { name: 'Raquel Gur',         inst: 'Univ. of Pennsylvania', field: 'Brain imaging & cognitive sex differences',    contact: 'https://www.med.upenn.edu/apps/faculty/index.php/g275/p15780' },
    { name: 'Nirao Shah',         inst: 'Stanford University',  field: 'Sex-specific neural circuits & behaviour',      contact: 'https://shahlab.stanford.edu' },
    { name: 'Geert De Vries',     inst: 'Georgia State Univ.', field: 'Sexual dimorphism in the mammalian brain',       contact: 'https://neuroscience.gsu.edu/profile/geert-de-vries/' },
    { name: 'David Amaral',       inst: 'UC Davis',             field: 'Amygdala, social behaviour & autism',           contact: 'https://health.ucdavis.edu/mindinstitute/research/amaral/' },
    { name: 'Debra Bangasser',    inst: 'Temple University',    field: 'Sex differences in stress & CRF circuits',      contact: 'https://www.cla.temple.edu/psychology/faculty/debra-bangasser/' },
  ]

  const journals = [
    { name: 'Nature Neuroscience',        if: '28.8', url: 'https://www.nature.com/neuro' },
    { name: 'Nature Reviews Neuroscience', if: '38.8', url: 'https://www.nature.com/nrn' },
    { name: 'PNAS',                        if: '11.1', url: 'https://www.pnas.org' },
    { name: 'eLife',                       if: '7.7',  url: 'https://elifesciences.org' },
    { name: 'Journal of Neuroscience',     if: '5.3',  url: 'https://www.jneurosci.org' },
    { name: 'Cerebral Cortex',             if: '4.9',  url: 'https://academic.oup.com/cercor' },
    { name: 'Hormones and Behavior',       if: '3.8',  url: 'https://www.journals.elsevier.com/hormones-and-behavior' },
    { name: 'Frontiers in Neuroscience',   if: '4.3',  url: 'https://www.frontiersin.org/journals/neuroscience' },
    { name: 'NeuroImage',                  if: '7.4',  url: 'https://www.sciencedirect.com/journal/neuroimage' },
    { name: 'Science',                     if: '56.9', url: 'https://www.science.org' },
    { name: 'Cell',                        if: '64.5', url: 'https://www.cell.com' },
    { name: 'Scientific American',         if: 'N/A',  url: 'https://www.scientificamerican.com' },
  ]

  const extLinks = [
    { cat: 'Primary Research',   color: '#00ccff', links: [
      { label: 'eLife Sciences',                url: 'https://elifesciences.org' },
      { label: 'PubMed (NIH)',                  url: 'https://pubmed.ncbi.nlm.nih.gov' },
      { label: 'PMC Full-Text Archive',         url: 'https://pmc.ncbi.nlm.nih.gov' },
      { label: 'PNAS',                          url: 'https://www.pnas.org' },
      { label: 'Science.org',                   url: 'https://www.science.org' },
      { label: 'Cell Press',                    url: 'https://www.cell.com' },
      { label: 'ScienceDirect',                 url: 'https://www.sciencedirect.com' },
      { label: 'ResearchGate',                  url: 'https://www.researchgate.net' },
    ]},
    { cat: 'Medical & Clinical',  color: '#7c4dff', links: [
      { label: 'Stanford Medicine',             url: 'https://med.stanford.edu' },
      { label: 'Stanford Medicine Magazine',    url: 'https://stanmed.stanford.edu' },
      { label: 'Endeavor Health',               url: 'https://www.endeavorhealth.org' },
      { label: 'Bentham Open Archives',         url: 'https://benthamopenarchives.com' },
      { label: 'Springer Link',                 url: 'https://link.springer.com' },
      { label: 'MDPI Open Access',              url: 'https://www.mdpi.com' },
    ]},
    { cat: 'AI & Technology',     color: '#00e676', links: [
      { label: 'Frontiers in Neuroscience (AI)', url: 'https://www.frontiersin.org' },
      { label: 'MDPI — Neuro AI Papers',         url: 'https://www.mdpi.com' },
      { label: 'Tech With Shadab (Medium)',       url: 'https://techwithshadab.medium.com' },
      { label: 'Medium — Neuroscience & AI',     url: 'https://medium.com' },
      { label: 'Spring.io — Spring AI Docs',     url: 'https://spring.io' },
    ]},
    { cat: 'General Education',   color: '#ff3366', links: [
      { label: 'Brain Facts (Society for Neuroscience)', url: 'https://www.brainfacts.org' },
      { label: 'Scientific American — Brain',   url: 'https://www.scientificamerican.com' },
      { label: 'Down to Earth — Science',       url: 'https://www.downtoearth.org.in' },
    ]},
  ]

  const pathway = [
    { step: '01', color: '#00ccff', title: 'Foundations',    time: '4–8 weeks', resources: ['Neuroscience by Purves et al. (Sinauer)', 'Khan Academy — Nervous System', 'MIT OpenCourseWare 9.01 Neuroscience' ] },
    { step: '02', color: '#7c4dff', title: 'Sex Differences', time: '4–6 weeks', resources: ['Cahill (2006) — Nature Reviews Neuroscience', 'Ingalhalikar (2014) — PNAS', 'McCarthy & Arnold (2011) — Science'] },
    { step: '03', color: '#00e676', title: 'Primary Literature', time: 'Ongoing', resources: ['Journal of Neuroscience (weekly)', 'Hormones and Behavior', 'eLife Neuroscience section'] },
    { step: '04', color: '#ff3366', title: 'Computational Methods', time: '6–10 weeks', resources: ['fast.ai Practical Deep Learning', 'Kaggle — Brain MRI datasets', 'arXiv cs.LG — NeuroAI papers'] },
    { step: '05', color: '#64ffda', title: 'Applied Projects', time: 'Ongoing', resources: ['Human Connectome Project — HCP500', 'OpenNeuro — BIDS datasets', 'Spring AI + React Three Fiber (this platform)'] },
  ]

  return (
    <div style={res.page}>
      <div style={res.topBar}>
        <div style={res.topBrand}>MALE NEURO NETWORK &nbsp;·&nbsp; RESEARCH HUB</div>
        <button style={res.closeBtn} onClick={onClose}>← Back to App</button>
      </div>

      <div style={res.scroll}>

        {/* ── HERO ── */}
        <section style={res.hero}>
          <MaleWatermark />
          <div style={res.heroBadge}>Neuroscience Research &amp; Education</div>
          <h1 style={res.heroTitle}>Research Hub</h1>
          <p style={res.heroSub}>Male Neural Networks — Biology, Circuitry &amp; Artificial Intelligence</p>
          <div style={res.heroLine} />
          <p style={res.heroDesc}>
            A comprehensive reference for understanding the male neural network across biological,
            computational, and clinical dimensions. Includes key circuits, primary literature,
            AI methodologies, open databases, and direct links to researchers and journals.
          </p>
          <div style={res.heroStats}>
            {[['25%','Male-specific neurons in C. elegans'],['94–98%','AI sex-classification accuracy'],['2–3×','INAH-3 size difference in males'],['3D CNN','State-of-the-art model architecture']].map(([v, l]) => (
              <div key={v} style={res.heroStat}>
                <div style={res.heroStatVal}>{v}</div>
                <div style={res.heroStatLab}>{l}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── OVERVIEW ── */}
        <section style={res.section}>
          <div style={res.inner}>
            <div style={res.label}>What Is It</div>
            <h2 style={res.heading}>Understanding the Male Neural Network</h2>
            <div style={res.grid4}>
              {overview.map(o => (
                <div key={o.num} style={{ ...res.card4, borderTop: `3px solid ${o.color}` }}>
                  <div style={{ ...res.cardNum, color: o.color }}>{o.num}</div>
                  <div style={res.cardTitle}>{o.title}</div>
                  <p style={res.cardDesc}>{o.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── KEY CIRCUITS ── */}
        <section style={{ ...res.section, background: 'rgba(0,204,255,0.015)' }}>
          <div style={res.inner}>
            <div style={res.label}>Neural Architecture</div>
            <h2 style={res.heading}>Male-Specific Brain Circuits</h2>
            <div style={res.grid2}>
              {circuits.map(c => (
                <div key={c.region} style={{ ...res.circuitCard, borderLeft: `3px solid ${c.color}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div style={{ ...res.circuitRegion, color: c.color }}>{c.region}</div>
                    <div style={res.circuitFn}>{c.fn}</div>
                  </div>
                  <div style={res.circuitFull}>{c.full}</div>
                  <p style={res.circuitDesc}>{c.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── ANATOMICAL HOTSPOTS ── */}
        <section style={res.section}>
          <div style={res.inner}>
            <div style={res.label}>Structural Differences</div>
            <h2 style={res.heading}>Anatomical Hotspots in the Male Brain</h2>
            <p style={{ ...res.bodyText, maxWidth: 700, marginBottom: 32 }}>
              When adjusted for total brain volume, specific regions show consistent volumetric
              and metabolic differences in males across large population studies.
            </p>
            <div style={res.hotspotGrid}>
              {hotspots.map(h => (
                <div key={h.label} style={res.hotspotRow}>
                  <div style={res.hotspotDot} />
                  <div style={res.hotspotLabel}>{h.label}</div>
                  <div style={res.hotspotVal}>{h.value}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── AI MODELS ── */}
        <section style={{ ...res.section, background: 'rgba(124,77,255,0.015)' }}>
          <div style={res.inner}>
            <div style={res.label}>Computational Neuroscience</div>
            <h2 style={res.heading}>Building AI Models for Male Neural Patterns</h2>
            <div style={res.grid3}>
              {aiSteps.map(s => (
                <div key={s.num} style={{ ...res.aiCard, borderTop: `3px solid ${s.color}` }}>
                  <div style={{ ...res.aiNum, color: s.color }}>{s.num}</div>
                  <div style={res.aiTitle}>{s.title}</div>
                  <p style={res.aiDesc}>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── DATABASES ── */}
        <section style={res.section}>
          <div style={res.inner}>
            <div style={res.label}>Open Data Resources</div>
            <h2 style={res.heading}>Research Databases &amp; Datasets</h2>
            <div style={res.grid3}>
              {databases.map(d => (
                <a key={d.name} href={d.url} target="_blank" rel="noopener noreferrer" style={{ ...res.dbCard, borderTop: `3px solid ${d.color}`, textDecoration: 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <div style={{ ...res.dbName, color: d.color }}>{d.name}</div>
                    <div style={{ ...res.dbAbbr, borderColor: d.color, color: d.color }}>{d.abbr}</div>
                  </div>
                  <p style={res.dbDesc}>{d.desc}</p>
                  <div style={{ ...res.dbLink, color: d.color }}>Visit Database →</div>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* ── SCIENTISTS ── */}
        <section style={{ ...res.section, background: 'rgba(0,204,255,0.015)' }}>
          <div style={res.inner}>
            <div style={res.label}>Key Researchers</div>
            <h2 style={res.heading}>Scientists &amp; Contacts</h2>
            <div style={res.sciGrid}>
              {scientists.map(s => (
                <a key={s.name} href={s.contact} target="_blank" rel="noopener noreferrer" style={res.sciCard}>
                  <div style={res.sciAvatar}>{s.name.split(' ').map(n => n[0]).join('').slice(0,2)}</div>
                  <div style={res.sciInfo}>
                    <div style={res.sciName}>{s.name}</div>
                    <div style={res.sciInst}>{s.inst}</div>
                    <div style={res.sciField}>{s.field}</div>
                    <div style={res.sciContact}>Profile &amp; Contact →</div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* ── JOURNALS ── */}
        <section style={res.section}>
          <div style={res.inner}>
            <div style={res.label}>Academic Publishing</div>
            <h2 style={res.heading}>Key Journals &amp; Publications</h2>
            <div style={res.journalGrid}>
              {journals.map(j => (
                <a key={j.name} href={j.url} target="_blank" rel="noopener noreferrer" style={res.journalCard}>
                  <div style={res.journalName}>{j.name}</div>
                  <div style={res.journalIf}>IF {j.if}</div>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* ── EXTERNAL LINKS ── */}
        <section style={{ ...res.section, background: 'rgba(0,204,255,0.015)' }}>
          <div style={res.inner}>
            <div style={res.label}>External Resources</div>
            <h2 style={res.heading}>Reference Links by Category</h2>
            <div style={res.linkCatGrid}>
              {extLinks.map(cat => (
                <div key={cat.cat} style={{ ...res.linkCat, borderTop: `3px solid ${cat.color}` }}>
                  <div style={{ ...res.linkCatTitle, color: cat.color }}>{cat.cat}</div>
                  {cat.links.map(l => (
                    <a key={l.label} href={l.url} target="_blank" rel="noopener noreferrer" style={res.linkItem}>
                      <span style={{ color: cat.color, marginRight: 8 }}>→</span>{l.label}
                    </a>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── LEARNING PATHWAY ── */}
        <section style={res.section}>
          <div style={res.inner}>
            <div style={res.label}>Structured Learning</div>
            <h2 style={res.heading}>How to Study Male Neuroscience</h2>
            <div style={res.pathwayList}>
              {pathway.map(p => (
                <div key={p.step} style={{ ...res.pathwayCard, borderLeft: `3px solid ${p.color}` }}>
                  <div style={res.pathwayLeft}>
                    <div style={{ ...res.pathwayStep, color: p.color }}>{p.step}</div>
                    <div style={res.pathwayTitle}>{p.title}</div>
                    <div style={res.pathwayTime}>{p.time}</div>
                  </div>
                  <div style={res.pathwayRight}>
                    {p.resources.map(r => (
                      <div key={r} style={res.pathwayResource}>
                        <span style={{ color: p.color, marginRight: 8, flexShrink: 0 }}>·</span>{r}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer style={res.footer}>
          <div style={res.footerBrand}>MALE NEURO NETWORK — RESEARCH HUB</div>
          <div style={res.footerDisc}>
            All external links lead to third-party websites. Content accuracy is the responsibility of the respective publishers.
            Research findings represent population-level statistics; individual variation is substantial.
            This platform is for educational purposes and does not constitute medical advice.
          </div>
          <div style={res.footerCopy}>© {new Date().getFullYear()} Gauri Langote. All rights reserved.</div>
        </footer>

      </div>
    </div>
  )
}

const res = {
  page: {
    position: 'fixed', inset: 0, zIndex: 10000,
    background: '#020610', fontFamily: "'SF Mono','Fira Code',monospace",
    color: '#ccd6f6', display: 'flex', flexDirection: 'column',
    overflow: 'hidden', isolation: 'isolate',
  },
  topBar: {
    height: 52, flexShrink: 0, borderBottom: '1px solid rgba(0,204,255,0.1)',
    background: 'rgba(4,8,20,0.98)', backdropFilter: 'blur(12px)',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px',
  },
  topBrand: { fontSize: 10, letterSpacing: '3px', textTransform: 'uppercase', color: 'rgba(0,204,255,0.4)' },
  closeBtn: {
    padding: '6px 18px', background: 'rgba(0,204,255,0.06)', border: '1px solid rgba(0,204,255,0.2)',
    borderRadius: 6, color: 'rgba(0,204,255,0.7)', fontSize: 11, letterSpacing: '1px',
    cursor: 'pointer', fontFamily: 'inherit',
  },
  scroll: { flex: 1, overflowY: 'auto', scrollBehavior: 'smooth' },
  hero: {
    minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', textAlign: 'center', padding: '60px 40px',
    position: 'relative', overflow: 'hidden', borderBottom: '1px solid rgba(0,204,255,0.07)',
  },
  heroBadge: {
    fontSize: 9, letterSpacing: '5px', textTransform: 'uppercase', color: '#00ccff',
    border: '1px solid rgba(0,204,255,0.22)', borderRadius: 20, padding: '5px 18px', marginBottom: 28, zIndex: 1,
  },
  heroTitle: {
    fontSize: 'clamp(52px,9vw,110px)', fontWeight: 900, letterSpacing: '6px', textTransform: 'uppercase',
    background: 'linear-gradient(135deg,#fff 0%,#00ccff 40%,#7c4dff 100%)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
    margin: '0 0 20px', lineHeight: 1.05, zIndex: 1,
  },
  heroSub: {
    fontSize: 'clamp(11px,1.4vw,14px)', letterSpacing: '3px', textTransform: 'uppercase',
    color: 'rgba(150,180,220,0.5)', fontWeight: 300, margin: '0 0 32px', zIndex: 1,
  },
  heroLine: {
    width: 180, height: 1, zIndex: 1, marginBottom: 32,
    background: 'linear-gradient(to right,transparent,rgba(0,204,255,0.6),transparent)',
  },
  heroDesc: { fontSize: 15, color: '#4a6080', lineHeight: '1.9', maxWidth: 620, zIndex: 1, margin: '0 0 48px' },
  heroStats: { display: 'flex', gap: 48, zIndex: 1 },
  heroStat: { textAlign: 'center' },
  heroStatVal: { fontSize: 'clamp(20px,3vw,32px)', fontWeight: 900, color: '#00ccff', letterSpacing: '1px' },
  heroStatLab: { fontSize: 9, color: '#2a3a50', letterSpacing: '2px', textTransform: 'uppercase', marginTop: 6, maxWidth: 120 },
  section: { padding: '80px 40px', borderBottom: '1px solid rgba(255,255,255,0.03)' },
  inner: { maxWidth: 1200, margin: '0 auto' },
  label: { fontSize: 9, letterSpacing: '4px', textTransform: 'uppercase', color: '#7c4dff', marginBottom: 12 },
  heading: { fontSize: 'clamp(22px,3.5vw,42px)', fontWeight: 800, letterSpacing: '2px', color: '#e2e8f0', margin: '0 0 36px' },
  bodyText: { fontSize: 14, color: '#4a6080', lineHeight: '1.9', margin: 0 },
  grid4: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20 },
  card4: { padding: '28px 22px', background: 'rgba(6,10,28,0.7)', borderRadius: 14, backdropFilter: 'blur(12px)' },
  cardNum: { fontSize: 32, fontWeight: 900, opacity: 0.25, letterSpacing: '-2px', marginBottom: 14, lineHeight: 1 },
  cardTitle: { fontSize: 13, fontWeight: 'bold', color: '#ccd6f6', marginBottom: 12, lineHeight: 1.3 },
  cardDesc: { fontSize: 12, color: '#3a5070', lineHeight: '1.75', margin: 0 },
  grid2: { display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 18 },
  circuitCard: {
    padding: '26px 30px', background: 'rgba(4,8,22,0.75)',
    borderRadius: 12, backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.03)',
  },
  circuitRegion: { fontSize: 14, fontWeight: 'bold', letterSpacing: '0.5px' },
  circuitFull: { fontSize: 9, color: '#2a3a50', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 12 },
  circuitFn: {
    fontSize: 9, letterSpacing: '2px', textTransform: 'uppercase', color: '#7c4dff',
    background: 'rgba(124,77,255,0.08)', border: '1px solid rgba(124,77,255,0.18)',
    borderRadius: 10, padding: '3px 10px', whiteSpace: 'nowrap',
  },
  circuitDesc: { fontSize: 12, color: '#3a5070', lineHeight: '1.85', margin: 0 },
  hotspotGrid: { display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 },
  hotspotRow: {
    display: 'flex', alignItems: 'flex-start', gap: 16, padding: '16px 20px',
    background: 'rgba(6,10,28,0.6)', border: '1px solid rgba(255,255,255,0.03)',
    borderRadius: 10, backdropFilter: 'blur(8px)',
  },
  hotspotDot: { width: 7, height: 7, borderRadius: '50%', background: '#00ccff', boxShadow: '0 0 8px #00ccff', flexShrink: 0, marginTop: 4 },
  hotspotLabel: { fontSize: 12, fontWeight: 'bold', color: '#ccd6f6', width: 110, flexShrink: 0 },
  hotspotVal: { fontSize: 12, color: '#3a5070', lineHeight: '1.7' },
  grid3: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 },
  aiCard: { padding: '28px 24px', background: 'rgba(6,10,28,0.7)', borderRadius: 14, backdropFilter: 'blur(12px)' },
  aiNum: { fontSize: 30, fontWeight: 900, opacity: 0.22, letterSpacing: '-2px', marginBottom: 12, lineHeight: 1 },
  aiTitle: { fontSize: 13, fontWeight: 'bold', color: '#ccd6f6', marginBottom: 12 },
  aiDesc: { fontSize: 12, color: '#3a5070', lineHeight: '1.8', margin: 0 },
  dbCard: {
    padding: '24px 26px', background: 'rgba(6,10,28,0.7)', borderRadius: 14,
    backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.03)', display: 'block',
  },
  dbName: { fontSize: 13, fontWeight: 'bold', letterSpacing: '0.5px' },
  dbAbbr: {
    fontSize: 9, fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase',
    padding: '2px 8px', border: '1px solid', borderRadius: 4,
  },
  dbDesc: { fontSize: 11, color: '#3a5070', lineHeight: '1.8', margin: '0 0 14px' },
  dbLink: { fontSize: 10, fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase' },
  sciGrid: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 18 },
  sciCard: {
    display: 'flex', gap: 14, alignItems: 'flex-start', textDecoration: 'none',
    padding: '20px 20px', background: 'rgba(4,8,22,0.75)',
    border: '1px solid rgba(255,255,255,0.04)', borderRadius: 12, backdropFilter: 'blur(10px)',
  },
  sciAvatar: {
    width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
    background: 'linear-gradient(135deg,#00ccff22,#7c4dff33)',
    border: '1px solid rgba(0,204,255,0.2)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 13, fontWeight: 900, color: '#00ccff', letterSpacing: '1px',
  },
  sciInfo: { flex: 1 },
  sciName: { fontSize: 12, fontWeight: 'bold', color: '#ccd6f6', marginBottom: 3 },
  sciInst: { fontSize: 9, color: '#00ccff', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 6, opacity: 0.6 },
  sciField: { fontSize: 11, color: '#3a5070', lineHeight: '1.6', marginBottom: 10 },
  sciContact: { fontSize: 9, color: '#00ccff', letterSpacing: '1px', textTransform: 'uppercase' },
  journalGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 12 },
  journalCard: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '14px 18px', background: 'rgba(6,10,28,0.6)',
    border: '1px solid rgba(0,204,255,0.07)', borderRadius: 10,
    textDecoration: 'none',
  },
  journalName: { fontSize: 11, color: '#8892b0', fontWeight: 'bold', lineHeight: 1.3 },
  journalIf: { fontSize: 9, color: '#00ccff', letterSpacing: '1px', textTransform: 'uppercase', flexShrink: 0, marginLeft: 8, opacity: 0.55 },
  linkCatGrid: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 24 },
  linkCat: { padding: '24px 0 0' },
  linkCatTitle: { fontSize: 10, fontWeight: 'bold', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: 16 },
  linkItem: {
    display: 'flex', alignItems: 'flex-start', padding: '8px 0',
    borderBottom: '1px solid rgba(255,255,255,0.03)',
    fontSize: 11, color: '#4a6080', textDecoration: 'none', lineHeight: '1.5',
    fontFamily: "'SF Mono','Fira Code',monospace",
  },
  pathwayList: { display: 'flex', flexDirection: 'column', gap: 16 },
  pathwayCard: {
    display: 'flex', gap: 40, alignItems: 'flex-start',
    padding: '28px 32px', background: 'rgba(6,10,28,0.6)',
    border: '1px solid rgba(255,255,255,0.03)', borderRadius: 12,
  },
  pathwayLeft: { flexShrink: 0, width: 140 },
  pathwayStep: { fontSize: 36, fontWeight: 900, opacity: 0.2, letterSpacing: '-2px', lineHeight: 1, marginBottom: 6 },
  pathwayTitle: { fontSize: 14, fontWeight: 'bold', color: '#ccd6f6', marginBottom: 4 },
  pathwayTime: { fontSize: 10, color: '#2a3a50', letterSpacing: '1.5px', textTransform: 'uppercase' },
  pathwayRight: { flex: 1, display: 'flex', flexDirection: 'column', gap: 8, justifyContent: 'center' },
  pathwayResource: { display: 'flex', alignItems: 'flex-start', fontSize: 12, color: '#4a6080', lineHeight: '1.5' },
  footer: { padding: '48px 40px', textAlign: 'center', borderTop: '1px solid rgba(0,204,255,0.06)' },
  footerBrand: { fontSize: 11, letterSpacing: '4px', textTransform: 'uppercase', color: 'rgba(0,204,255,0.3)', marginBottom: 14 },
  footerDisc: { fontSize: 11, color: '#1a2840', fontStyle: 'italic', lineHeight: '1.7', marginBottom: 12, maxWidth: 700, margin: '0 auto 12px' },
  footerCopy: { fontSize: 10, color: '#1a2535', letterSpacing: '1px' },
}

// ─── About Us Full Page ────────────────────────────────────────────────────────
export function AboutUsModal({ onClose }) {
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
            breathing 3D map of your mind — built exclusively around the male brain.
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

const m = {
  page: {
    position: 'fixed', inset: 0, zIndex: 10000,
    background: '#020610',
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
  pillarsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20 },
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

// ─── Profile Selector ──────────────────────────────────────────────────────────
export default function ProfileSelector({ selectedId, onSelect, onBackToDashboard, userEmail, onAboutOpen, onAboutClose }) {
  const [profiles, setProfiles]           = useState([])
  const [showAbout, setShowAbout]         = useState(false)
  const [showResearch, setShowResearch]   = useState(false)
  const [showSupport, setShowSupport]     = useState(false)
  const [showCopyright, setShowCopyright] = useState(false)

  const load = useCallback(() => {
    fetchProfiles().then(setProfiles).catch(() => {})
  }, [])

  useEffect(() => { load() }, [load])

  const openAbout      = () => { setShowAbout(true);      onAboutOpen?.() }
  const closeAbout     = () => { setShowAbout(false);     onAboutClose?.() }
  const openResearch   = () => { setShowResearch(true);   onAboutOpen?.() }
  const closeResearch  = () => { setShowResearch(false);  onAboutClose?.() }
  const openSupport    = () => { setShowSupport(true);    onAboutOpen?.() }
  const closeSupport   = () => { setShowSupport(false);   onAboutClose?.() }
  const openCopyright  = () => { setShowCopyright(true);  onAboutOpen?.() }
  const closeCopyright = () => { setShowCopyright(false); onAboutClose?.() }

  return (
    <>
      {showAbout     && <AboutUsModal   onClose={closeAbout} />}
      {showResearch  && <ResearchModal  onClose={closeResearch} />}
      {showSupport   && <SupportModal   onClose={closeSupport} />}
      {showCopyright && <CopyrightModal onClose={closeCopyright} />}

      <div style={styles.bar}>
        <div style={styles.left}>
          <button style={styles.backBtn} onClick={onBackToDashboard} title="Back to dashboard">
            ← Dashboard
          </button>
          <div style={styles.divider} />
          <div style={styles.brand}>MALE NEURO NETWORK</div>
        </div>

        <div style={styles.tabs}>
          {profiles.map(p => (
            <button
              key={p.id}
              style={{ ...styles.tab, ...(p.id === selectedId ? styles.tabActive : {}) }}
              onClick={() => onSelect(p.id)}
              title={`Switch to ${p.name}`}
            >
              {p.name}
            </button>
          ))}
        </div>

        <div style={styles.right}>
          <button style={styles.navLink} onClick={openAbout}>About Us</button>
          <button style={styles.navLink} onClick={openResearch}>Research</button>
          <button style={styles.navLink} onClick={openSupport}>Support</button>
          <button style={styles.navLink} onClick={openCopyright}>Copyright</button>
          <div style={styles.divider} />
          <div style={styles.userEmail}>{userEmail}</div>
        </div>
      </div>
    </>
  )
}

const styles = {
  bar: {
    height: 48, padding: '0 16px',
    background: 'rgba(6,10,22,0.98)',
    borderBottom: '1px solid rgba(0,204,255,0.1)',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    gap: 12, flexShrink: 0, backdropFilter: 'blur(12px)',
  },
  left: { display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 },
  backBtn: {
    padding: '5px 12px', background: 'rgba(0,204,255,0.07)',
    border: '1px solid rgba(0,204,255,0.2)', borderRadius: 6,
    color: 'rgba(0,204,255,0.7)', fontSize: 11, fontWeight: 'bold',
    letterSpacing: '1px', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s ease',
  },
  divider: { width: 1, height: 18, background: 'rgba(0,204,255,0.12)' },
  brand: { fontSize: 12, fontWeight: 'bold', color: 'rgba(0,204,255,0.6)', letterSpacing: '3px', textTransform: 'uppercase' },
  tabs: { display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'nowrap', overflow: 'hidden' },
  tab: {
    padding: '5px 14px', background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)', borderRadius: 6,
    color: '#3a4a60', fontSize: 12, fontWeight: 'bold',
    cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s ease', whiteSpace: 'nowrap',
  },
  tabActive: { background: '#00ccff', border: '1px solid #00ccff', color: '#000', boxShadow: '0 0 12px rgba(0,204,255,0.4)' },
  right: { flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4 },
  userEmail: { fontSize: 11, color: '#2a3a50', letterSpacing: '0.5px' },
  navLink: {
    padding: '4px 10px', background: 'transparent', border: 'none',
    color: 'rgba(100,130,170,0.55)', fontSize: 10, letterSpacing: '1px',
    textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit',
    transition: 'color 0.2s ease',
  },
}
