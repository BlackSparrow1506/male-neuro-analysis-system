import React, { useEffect, useState } from 'react'
import { fetchMyAuditLog } from '../api'
import SystemStatus from './SystemStatus'

const ACTION_LABELS = {
  'chat.message':   'AI Chat',
  'tts.synthesize': 'Text-to-Speech',
}

function formatLatency(ms) {
  if (ms == null) return '—'
  if (ms < 1000) return `${ms} ms`
  return `${(ms / 1000).toFixed(2)} s`
}

function formatTimestamp(ts) {
  if (!ts) return '—'
  try {
    return new Date(ts).toLocaleString()
  } catch {
    return ts
  }
}

export default function ActivityLog() {
  const [logs, setLogs]       = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetchMyAuditLog(100)
      .then(data => {
        if (!cancelled) {
          setLogs(Array.isArray(data) ? data : [])
          setError(null)
        }
      })
      .catch(err => {
        if (!cancelled) setError(err.message || 'Failed to load activity log')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  return (
    <>
    <SystemStatus />
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <span style={styles.cardIcon}>◇</span>
        <span style={styles.cardTitle}>Audit Trail · Your Recent AI Activity</span>
      </div>

      <div style={styles.intro}>
        Every AI interaction in this platform is recorded for traceability — when it ran,
        which model handled it, how long it took, and whether it succeeded.
        This is the same kind of audit trail enterprise compliance teams require.
      </div>

      {loading && <div style={styles.empty}>Loading activity…</div>}
      {error   && <div style={styles.errorMsg}>{error}</div>}

      {!loading && !error && logs.length === 0 && (
        <div style={styles.empty}>No activity recorded yet. Try chatting with the AI or playing back a response.</div>
      )}

      {!loading && !error && logs.length > 0 && (
        <div style={styles.table}>
          <div style={styles.tableHeadRow}>
            <div style={{...styles.col, ...styles.colTime}}>Time</div>
            <div style={{...styles.col, ...styles.colAction}}>Action</div>
            <div style={{...styles.col, ...styles.colModel}}>Model</div>
            <div style={{...styles.col, ...styles.colLatency}}>Latency</div>
            <div style={{...styles.col, ...styles.colStatus}}>Status</div>
          </div>
          {logs.map(log => {
            const isOpen = expanded === log.id
            return (
              <div key={log.id} style={styles.row}>
                <button
                  type="button"
                  onClick={() => setExpanded(isOpen ? null : log.id)}
                  style={styles.rowButton}
                >
                  <div style={{...styles.col, ...styles.colTime}}>{formatTimestamp(log.timestamp)}</div>
                  <div style={{...styles.col, ...styles.colAction}}>{ACTION_LABELS[log.action] || log.action}</div>
                  <div style={{...styles.col, ...styles.colModel}}>{log.model || '—'}</div>
                  <div style={{...styles.col, ...styles.colLatency}}>{formatLatency(log.latencyMs)}</div>
                  <div style={{...styles.col, ...styles.colStatus}}>
                    <span style={log.success ? styles.statusOk : styles.statusFail}>
                      {log.success ? 'OK' : 'FAIL'}
                    </span>
                  </div>
                </button>
                {isOpen && (
                  <div style={styles.detail}>
                    {log.requestPreview && (
                      <div style={styles.detailRow}>
                        <div style={styles.detailLabel}>Request</div>
                        <div style={styles.detailText}>{log.requestPreview}</div>
                      </div>
                    )}
                    {log.responsePreview && (
                      <div style={styles.detailRow}>
                        <div style={styles.detailLabel}>Response</div>
                        <div style={styles.detailText}>{log.responsePreview}</div>
                      </div>
                    )}
                    {log.errorMessage && (
                      <div style={styles.detailRow}>
                        <div style={styles.detailLabel}>Error</div>
                        <div style={{...styles.detailText, color: '#ff3366'}}>{log.errorMessage}</div>
                      </div>
                    )}
                    {log.profileId && (
                      <div style={styles.detailRow}>
                        <div style={styles.detailLabel}>Profile</div>
                        <div style={styles.detailMono}>{log.profileId}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
    </>
  )
}

const styles = {
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
    marginBottom: 16,
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
  intro: {
    fontSize: 11,
    color: '#4a6080',
    lineHeight: 1.7,
    marginBottom: 20,
    maxWidth: 720,
  },
  empty: {
    padding: '32px 0',
    fontSize: 12,
    color: '#4a6080',
    textAlign: 'center',
  },
  errorMsg: {
    marginTop: 12,
    padding: '10px 14px',
    background: 'rgba(255,51,102,0.08)',
    border: '1px solid rgba(255,51,102,0.2)',
    borderRadius: 8,
    color: '#ff3366',
    fontSize: 11,
  },

  table: {
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
  },
  tableHeadRow: {
    display: 'flex',
    padding: '10px 12px',
    borderBottom: '1px solid rgba(0,204,255,0.1)',
    fontSize: 10,
    letterSpacing: '1.5px',
    textTransform: 'uppercase',
    color: '#2a3a50',
  },
  row: {
    borderBottom: '1px solid rgba(0,204,255,0.04)',
  },
  rowButton: {
    width: '100%',
    display: 'flex',
    padding: '12px',
    background: 'transparent',
    border: 'none',
    color: '#ccd6f6',
    fontFamily: 'inherit',
    cursor: 'pointer',
    textAlign: 'left',
  },
  col: {
    fontSize: 11,
    color: '#a8b2d1',
  },
  colTime:    { flex: '0 0 200px' },
  colAction:  { flex: '0 0 130px' },
  colModel:   { flex: '0 0 110px' },
  colLatency: { flex: '0 0 90px' },
  colStatus:  { flex: '1 1 auto', textAlign: 'right' },
  statusOk: {
    padding: '2px 8px',
    background: 'rgba(0,230,118,0.1)',
    border: '1px solid rgba(0,230,118,0.25)',
    borderRadius: 12,
    color: '#00e676',
    fontSize: 10,
    letterSpacing: '1px',
    fontWeight: 'bold',
  },
  statusFail: {
    padding: '2px 8px',
    background: 'rgba(255,51,102,0.1)',
    border: '1px solid rgba(255,51,102,0.3)',
    borderRadius: 12,
    color: '#ff3366',
    fontSize: 10,
    letterSpacing: '1px',
    fontWeight: 'bold',
  },
  detail: {
    padding: '12px 16px 16px 16px',
    background: 'rgba(0,204,255,0.02)',
    borderTop: '1px solid rgba(0,204,255,0.04)',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  detailRow: {
    display: 'grid',
    gridTemplateColumns: '120px 1fr',
    gap: 16,
    fontSize: 11,
  },
  detailLabel: {
    color: '#2a3a50',
    letterSpacing: '1.5px',
    textTransform: 'uppercase',
    fontSize: 10,
  },
  detailText: {
    color: '#a8b2d1',
    lineHeight: 1.6,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
  detailMono: {
    color: '#4a6080',
    fontFamily: 'inherit',
    fontSize: 10,
  },
}
