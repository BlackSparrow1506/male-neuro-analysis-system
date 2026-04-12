import React, { useState } from 'react'
import { changePassword, deleteAccount, logout } from '../api'

export default function ProfilePage({ username, email, onBack, onLogout }) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword]         = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pwMsg, setPwMsg]                     = useState(null)
  const [pwError, setPwError]                 = useState(null)
  const [pwLoading, setPwLoading]             = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteLoading, setDeleteLoading]         = useState(false)
  const [deleteError, setDeleteError]             = useState(null)
  const [showCurrent, setShowCurrent]             = useState(false)
  const [showNew, setShowNew]                     = useState(false)
  const [showConfirm, setShowConfirm]             = useState(false)

  async function handleChangePassword() {
    setPwMsg(null)
    setPwError(null)
    if (!currentPassword) { setPwError('Enter your current password'); return }
    if (newPassword !== confirmPassword) { setPwError('New passwords do not match'); return }
    if (newPassword.length < 6) { setPwError('New password must be at least 6 characters'); return }
    setPwLoading(true)
    try {
      await changePassword(currentPassword, newPassword)
      setPwMsg('Password changed successfully!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setPwError(err.message)
    } finally {
      setPwLoading(false)
    }
  }

  async function handleDeleteAccount() {
    setDeleteLoading(true)
    setDeleteError(null)
    try {
      await deleteAccount()
      logout()
      onLogout()
    } catch (err) {
      setDeleteError(err.message)
      setDeleteLoading(false)
    }
  }

  const avatarLetter = (username || email || '?')[0].toUpperCase()

  return (
    <div style={styles.root}>
      {/* Sidebar */}
      <div className="nn-profile-sidebar" style={styles.sidebar}>
        <div style={styles.sidebarTop}>
          <div style={styles.logo}>MNN</div>
          <div style={styles.logoSub}>Neural Platform</div>
        </div>
        <nav style={styles.nav}>
          <div style={styles.navItem}>
            <span style={styles.navIcon}>◈</span> Dashboard
          </div>
          <div style={{...styles.navItem, ...styles.navItemActive}}>
            <span style={styles.navIcon}>⊙</span> Account
          </div>
        </nav>
        <button onClick={onBack} style={styles.backBtn}>
          ← Back to Dashboard
        </button>
      </div>

      {/* Main content */}
      <div className="nn-profile-main" style={styles.main}>
        {/* Top bar */}
        <div style={styles.topbar}>
          <div>
            <div style={styles.pageTitle}>Account Settings</div>
            <div style={styles.pageSub}>Manage your profile, security, and preferences</div>
          </div>
        </div>

        {/* Scrollable body */}
        <div style={styles.body}>

          {/* Avatar + identity */}
          <div style={styles.identityCard}>
            <div style={styles.avatar}>{avatarLetter}</div>
            <div>
              <div style={styles.identityName}>{username}</div>
              <div style={styles.identityEmail}>{email}</div>
              <div style={styles.badge}>✓ Verified Account</div>
            </div>
          </div>

          {/* Two column grid */}
          <div className="nn-profile-grid" style={styles.grid}>

            {/* Profile info */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <span style={styles.cardIcon}>⊙</span>
                <span style={styles.cardTitle}>Profile Information</span>
              </div>
              <div style={styles.field}>
                <div style={styles.fieldLabel}>Username</div>
                <div style={styles.fieldValue}>{username}</div>
              </div>
              <div style={styles.field}>
                <div style={styles.fieldLabel}>Email Address</div>
                <div style={styles.fieldValue}>{email}</div>
              </div>
              <div style={styles.field}>
                <div style={styles.fieldLabel}>Account Status</div>
                <div style={{...styles.fieldValue, color:'#00e676'}}>Active · Verified</div>
              </div>
              <div style={{...styles.field, borderBottom:'none'}}>
                <div style={styles.fieldLabel}>Platform</div>
                <div style={styles.fieldValue}>Male Neural Network</div>
              </div>
            </div>

            {/* Change password */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <span style={styles.cardIcon}>◈</span>
                <span style={styles.cardTitle}>Change Password</span>
              </div>

              <div style={styles.field}>
                <div style={styles.fieldLabel}>Current Password</div>
                <div style={styles.inputWrap}>
                  <input
                    type={showCurrent ? 'text' : 'password'}
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    style={styles.input}
                  />
                  <button style={styles.eyeBtn} onClick={() => setShowCurrent(v => !v)}>
                    {showCurrent ? '🙈' : '👁'}
                  </button>
                </div>
              </div>

              <div style={styles.field}>
                <div style={styles.fieldLabel}>New Password</div>
                <div style={styles.inputWrap}>
                  <input
                    type={showNew ? 'text' : 'password'}
                    placeholder="Min 6 characters"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    style={styles.input}
                  />
                  <button style={styles.eyeBtn} onClick={() => setShowNew(v => !v)}>
                    {showNew ? '🙈' : '👁'}
                  </button>
                </div>
              </div>

              <div style={{...styles.field, borderBottom:'none'}}>
                <div style={styles.fieldLabel}>Confirm New Password</div>
                <div style={styles.inputWrap}>
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Repeat new password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    style={styles.input}
                  />
                  <button style={styles.eyeBtn} onClick={() => setShowConfirm(v => !v)}>
                    {showConfirm ? '🙈' : '👁'}
                  </button>
                </div>
              </div>

              {pwError && <div style={styles.errorMsg}>{pwError}</div>}
              {pwMsg   && <div style={styles.successMsg}>{pwMsg}</div>}

              <button
                onClick={handleChangePassword}
                disabled={pwLoading}
                style={styles.primaryBtn}
              >
                {pwLoading ? 'Updating...' : 'Update Password'}
              </button>
            </div>

          </div>

          {/* Danger zone */}
          <div className="nn-danger-card" style={styles.dangerCard}>
            <div style={styles.dangerLeft}>
              <div style={styles.dangerTitle}>Delete Account</div>
              <div style={styles.dangerDesc}>
                Permanently removes your account, all neural profiles, and chat history. This action cannot be undone.
              </div>
            </div>
            <div style={styles.dangerRight}>
              {!showDeleteConfirm ? (
                <button onClick={() => setShowDeleteConfirm(true)} style={styles.dangerBtn}>
                  Delete Account
                </button>
              ) : (
                <div style={styles.confirmBox}>
                  <div style={styles.confirmText}>Are you absolutely sure? This is permanent.</div>
                  {deleteError && <div style={styles.errorMsg}>{deleteError}</div>}
                  <div style={styles.confirmBtns}>
                    <button onClick={handleDeleteAccount} disabled={deleteLoading} style={styles.dangerBtn}>
                      {deleteLoading ? 'Deleting...' : 'Yes, Delete Everything'}
                    </button>
                    <button onClick={() => setShowDeleteConfirm(false)} style={styles.cancelBtn}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

const styles = {
  root: {
    display: 'flex',
    height: '100vh',
    width: '100vw',
    background: '#020610',
    color: '#ccd6f6',
    fontFamily: "'SF Mono','Fira Code','Consolas',monospace",
    overflow: 'hidden',
  },

  // Sidebar
  sidebar: {
    width: 220,
    flexShrink: 0,
    background: 'rgba(6,10,26,0.95)',
    borderRight: '1px solid rgba(0,204,255,0.08)',
    display: 'flex',
    flexDirection: 'column',
    padding: '32px 0',
  },
  sidebarTop: {
    padding: '0 24px 32px',
    borderBottom: '1px solid rgba(0,204,255,0.06)',
    marginBottom: 24,
  },
  logo: {
    fontSize: 20,
    fontWeight: 900,
    letterSpacing: '4px',
    color: '#00ccff',
    textShadow: '0 0 20px rgba(0,204,255,0.4)',
  },
  logoSub: {
    fontSize: 9,
    letterSpacing: '2px',
    color: '#2a3a50',
    textTransform: 'uppercase',
    marginTop: 4,
  },
  nav: {
    flex: 1,
    padding: '0 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 12px',
    borderRadius: 8,
    fontSize: 11,
    letterSpacing: '1px',
    color: '#2a3a50',
    cursor: 'pointer',
    textTransform: 'uppercase',
  },
  navItemActive: {
    background: 'rgba(0,204,255,0.08)',
    color: '#00ccff',
    border: '1px solid rgba(0,204,255,0.15)',
  },
  navIcon: { fontSize: 14 },
  backBtn: {
    margin: '24px 12px 0',
    padding: '10px 12px',
    background: 'transparent',
    border: '1px solid rgba(0,204,255,0.12)',
    borderRadius: 8,
    color: '#4a6080',
    fontSize: 10,
    letterSpacing: '1px',
    textTransform: 'uppercase',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },

  // Main
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  topbar: {
    padding: '28px 40px',
    borderBottom: '1px solid rgba(0,204,255,0.06)',
    background: 'rgba(6,10,26,0.6)',
    flexShrink: 0,
  },
  pageTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: '2px',
    color: '#ccd6f6',
  },
  pageSub: {
    fontSize: 11,
    color: '#2a3a50',
    marginTop: 4,
    letterSpacing: '0.5px',
  },

  // Scrollable body
  body: {
    flex: 1,
    overflowY: 'auto',
    padding: '32px 40px 48px',
    display: 'flex',
    flexDirection: 'column',
    gap: 24,
  },

  // Identity
  identityCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 24,
    padding: '28px 32px',
    background: 'rgba(0,204,255,0.03)',
    border: '1px solid rgba(0,204,255,0.1)',
    borderRadius: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: '50%',
    background: 'linear-gradient(135deg,#00ccff,#7c4dff)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 24,
    fontWeight: 900,
    color: '#fff',
    flexShrink: 0,
    boxShadow: '0 0 30px rgba(0,204,255,0.3)',
  },
  identityName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ccd6f6',
    letterSpacing: '1px',
  },
  identityEmail: {
    fontSize: 12,
    color: '#4a6080',
    marginTop: 4,
    letterSpacing: '0.5px',
  },
  badge: {
    display: 'inline-block',
    marginTop: 8,
    padding: '3px 10px',
    background: 'rgba(0,230,118,0.1)',
    border: '1px solid rgba(0,230,118,0.25)',
    borderRadius: 20,
    fontSize: 10,
    color: '#00e676',
    letterSpacing: '1px',
  },

  // Grid
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 24,
  },

  // Card
  card: {
    background: 'rgba(6,10,26,0.8)',
    border: '1px solid rgba(0,204,255,0.1)',
    borderRadius: 16,
    padding: '24px 28px',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
    paddingBottom: 16,
    borderBottom: '1px solid rgba(0,204,255,0.06)',
  },
  cardIcon: { fontSize: 16, color: '#00ccff' },
  cardTitle: {
    fontSize: 11,
    letterSpacing: '2px',
    textTransform: 'uppercase',
    color: '#00ccff',
    fontWeight: 'bold',
  },
  field: {
    padding: '14px 0',
    borderBottom: '1px solid rgba(0,204,255,0.04)',
  },
  fieldLabel: {
    fontSize: 10,
    letterSpacing: '1.5px',
    textTransform: 'uppercase',
    color: '#2a3a50',
    marginBottom: 6,
  },
  fieldValue: {
    fontSize: 13,
    color: '#ccd6f6',
    letterSpacing: '0.5px',
  },

  // Input
  inputWrap: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    padding: '10px 40px 10px 14px',
    background: 'rgba(0,204,255,0.03)',
    border: '1px solid rgba(0,204,255,0.12)',
    borderRadius: 8,
    color: '#ccd6f6',
    fontSize: 12,
    fontFamily: 'inherit',
    outline: 'none',
  },
  eyeBtn: {
    position: 'absolute',
    right: 10,
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: 14,
    padding: 0,
    lineHeight: 1,
  },
  primaryBtn: {
    marginTop: 20,
    width: '100%',
    padding: '12px',
    background: 'linear-gradient(135deg,#00ccff,#7c4dff)',
    border: 'none',
    borderRadius: 8,
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    cursor: 'pointer',
    fontFamily: 'inherit',
    boxShadow: '0 4px 20px rgba(0,204,255,0.2)',
  },

  // Messages
  errorMsg: {
    marginTop: 12,
    padding: '10px 14px',
    background: 'rgba(255,51,102,0.08)',
    border: '1px solid rgba(255,51,102,0.2)',
    borderRadius: 8,
    color: '#ff3366',
    fontSize: 11,
  },
  successMsg: {
    marginTop: 12,
    padding: '10px 14px',
    background: 'rgba(0,230,118,0.08)',
    border: '1px solid rgba(0,230,118,0.2)',
    borderRadius: 8,
    color: '#00e676',
    fontSize: 11,
  },

  // Danger zone
  dangerCard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 32,
    padding: '24px 32px',
    background: 'rgba(255,51,102,0.03)',
    border: '1px solid rgba(255,51,102,0.15)',
    borderRadius: 16,
  },
  dangerLeft: { flex: 1 },
  dangerRight: { flexShrink: 0 },
  dangerTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#ff3366',
    letterSpacing: '1px',
    marginBottom: 6,
  },
  dangerDesc: {
    fontSize: 11,
    color: '#4a6080',
    lineHeight: 1.7,
    maxWidth: 420,
  },
  dangerBtn: {
    padding: '10px 22px',
    background: 'rgba(255,51,102,0.1)',
    border: '1px solid rgba(255,51,102,0.3)',
    borderRadius: 8,
    color: '#ff3366',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: '1.5px',
    textTransform: 'uppercase',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  cancelBtn: {
    padding: '10px 22px',
    background: 'transparent',
    border: '1px solid rgba(100,130,170,0.2)',
    borderRadius: 8,
    color: '#4a6080',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: '1.5px',
    textTransform: 'uppercase',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  confirmBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    alignItems: 'flex-end',
  },
  confirmText: {
    fontSize: 11,
    color: '#ff3366',
    letterSpacing: '0.5px',
  },
  confirmBtns: {
    display: 'flex',
    gap: 10,
  },
}
