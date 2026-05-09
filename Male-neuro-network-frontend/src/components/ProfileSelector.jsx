import React, { useState, useEffect, useCallback } from 'react'
import { fetchProfiles } from '../api'
import AboutUsModal from './modals/AboutUsModal'
import ResearchModal from './modals/ResearchModal'
import SupportModal from './modals/SupportModal'
import CopyrightModal from './modals/CopyrightModal'
import CommunityModal from './modals/CommunityModal'

export default function ProfileSelector({ selectedId, onSelect, onBackToDashboard, userEmail, username, onAboutOpen, onAboutClose }) {
  const [profiles, setProfiles]             = useState([])
  const [showAbout, setShowAbout]           = useState(false)
  const [showResearch, setShowResearch]     = useState(false)
  const [showSupport, setShowSupport]       = useState(false)
  const [showCopyright, setShowCopyright]   = useState(false)
  const [showCommunity, setShowCommunity]   = useState(false)

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
  const openCommunity  = () => { setShowCommunity(true);  onAboutOpen?.() }
  const closeCommunity = () => { setShowCommunity(false); onAboutClose?.() }

  const displayName = username || userEmail

  return (
    <>
      {showAbout     && <AboutUsModal    onClose={closeAbout} />}
      {showResearch  && <ResearchModal   onClose={closeResearch} />}
      {showSupport   && <SupportModal    onClose={closeSupport} />}
      {showCopyright && <CopyrightModal  onClose={closeCopyright} />}
      {showCommunity && <CommunityModal  onClose={closeCommunity} username={displayName} />}

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
          <div className="nn-topbar-nav" style={{display:'flex',alignItems:'center',gap:4}}>
            <button style={styles.navLink} onClick={openAbout}>About Us</button>
            <button style={styles.navLink} onClick={openResearch}>Research</button>
            <button style={styles.navLink} onClick={openSupport}>Support</button>
            <button style={styles.navLink} onClick={openCopyright}>Copyright</button>
          </div>
          <div style={styles.divider} />
          <div style={styles.userEmail}>{displayName}</div>
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
