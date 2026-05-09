import React, { useEffect } from 'react'

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

export default function CopyrightModal({ onClose }) {
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
