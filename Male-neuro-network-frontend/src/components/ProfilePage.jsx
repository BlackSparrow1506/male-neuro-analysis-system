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

  async function handleChangePassword(e) {
    e.preventDefault()
    setPwMsg(null)
    setPwError(null)

    if (newPassword !== confirmPassword) {
      setPwError('New passwords do not match')
      return
    }
    if (newPassword.length < 6) {
      setPwError('New password must be at least 6 characters')
      return
    }

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

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <button onClick={onBack} style={styles.backBtn}>← Back</button>
        <div style={styles.headerTitle}>Account Settings</div>
        <div />
      </div>

      <div style={styles.content}>

        {/* Profile Info Card */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>Profile</div>
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Username</span>
            <span style={styles.infoValue}>{username}</span>
          </div>
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Email</span>
            <span style={styles.infoValue}>{email}</span>
          </div>
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Status</span>
            <span style={{...styles.infoValue, color:'#00e676'}}>✓ Verified</span>
          </div>
        </div>

        {/* Change Password Card */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>Change Password</div>
          <form onSubmit={handleChangePassword}>
            <input
              type="password"
              placeholder="Current password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              style={styles.input}
              required
            />
            <input
              type="password"
              placeholder="New password (min 6 characters)"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              style={styles.input}
              required
            />
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              style={styles.input}
              required
            />
            {pwError && <div style={styles.error}>{pwError}</div>}
            {pwMsg   && <div style={styles.success}>{pwMsg}</div>}
            <button type="submit" disabled={pwLoading} style={styles.primaryBtn}>
              {pwLoading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>

        {/* Delete Account Card */}
        <div style={{...styles.card, borderColor:'rgba(255,51,102,0.2)'}}>
          <div style={{...styles.cardTitle, color:'#ff3366'}}>Danger Zone</div>
          <p style={styles.dangerText}>
            Deleting your account is permanent. All your neural profiles and chat history will be removed and cannot be recovered.
          </p>
          {!showDeleteConfirm ? (
            <button onClick={() => setShowDeleteConfirm(true)} style={styles.dangerBtn}>
              Delete My Account
            </button>
          ) : (
            <div style={styles.confirmBox}>
              <p style={{color:'#ff3366', fontSize:13, marginBottom:16}}>
                Are you absolutely sure? This cannot be undone.
              </p>
              {deleteError && <div style={styles.error}>{deleteError}</div>}
              <div style={{display:'flex', gap:12}}>
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
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#020610',
    color: '#ccd6f6',
    fontFamily: "'SF Mono','Fira Code','Consolas',monospace",
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 32px',
    borderBottom: '1px solid rgba(0,204,255,0.08)',
    background: 'rgba(6,10,26,0.9)',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: '3px',
    textTransform: 'uppercase',
    color: '#00ccff',
  },
  backBtn: {
    background: 'transparent',
    border: '1px solid rgba(0,204,255,0.2)',
    borderRadius: 8,
    color: '#00ccff',
    fontSize: 11,
    padding: '8px 16px',
    cursor: 'pointer',
    letterSpacing: '1px',
    fontFamily: 'inherit',
  },
  content: {
    maxWidth: 560,
    margin: '48px auto',
    padding: '0 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: 24,
  },
  card: {
    background: 'rgba(6,10,26,0.8)',
    border: '1px solid rgba(0,204,255,0.12)',
    borderRadius: 16,
    padding: '28px 32px',
  },
  cardTitle: {
    fontSize: 11,
    letterSpacing: '3px',
    textTransform: 'uppercase',
    color: '#00ccff',
    marginBottom: 20,
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid rgba(0,204,255,0.06)',
  },
  infoLabel: {
    fontSize: 11,
    color: '#4a6080',
    letterSpacing: '1px',
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 13,
    color: '#ccd6f6',
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    marginBottom: 12,
    background: 'rgba(0,204,255,0.04)',
    border: '1px solid rgba(0,204,255,0.15)',
    borderRadius: 8,
    color: '#ccd6f6',
    fontSize: 13,
    fontFamily: 'inherit',
    outline: 'none',
    boxSizing: 'border-box',
  },
  primaryBtn: {
    width: '100%',
    padding: '12px',
    marginTop: 4,
    background: 'linear-gradient(135deg, #00ccff, #7c4dff)',
    border: 'none',
    borderRadius: 8,
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  dangerBtn: {
    padding: '10px 20px',
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
    padding: '10px 20px',
    background: 'transparent',
    border: '1px solid rgba(100,130,170,0.3)',
    borderRadius: 8,
    color: '#4a6080',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: '1.5px',
    textTransform: 'uppercase',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  dangerText: {
    fontSize: 12,
    color: '#4a6080',
    lineHeight: 1.6,
    marginBottom: 20,
  },
  confirmBox: {
    background: 'rgba(255,51,102,0.04)',
    border: '1px solid rgba(255,51,102,0.15)',
    borderRadius: 8,
    padding: 20,
  },
  error: {
    color: '#ff3366',
    fontSize: 12,
    marginBottom: 12,
    padding: '8px 12px',
    background: 'rgba(255,51,102,0.08)',
    borderRadius: 6,
  },
  success: {
    color: '#00e676',
    fontSize: 12,
    marginBottom: 12,
    padding: '8px 12px',
    background: 'rgba(0,230,118,0.08)',
    borderRadius: 6,
  },
}
