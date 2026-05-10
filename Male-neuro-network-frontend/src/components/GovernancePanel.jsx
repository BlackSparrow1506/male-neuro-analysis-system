import React, { useEffect, useState } from 'react'
import {
  fetchAdminOverview,
  fetchAdminAudit,
  fetchAdminAgentRuns,
} from '../api'
import SystemStatus from './SystemStatus'
import AgentTrace from './AgentTrace'

const ACTION_LABELS = {
  'chat.message':       'AI Chat',
  'chat.flagged':       'AI Chat (PII redacted)',
  'chat.blocked':       'AI Chat (guardrail block)',
  'chat.rate_limited':  'AI Chat (rate limited)',
  'tts.synthesize':     'Text-to-Speech',
  'tts.rate_limited':   'TTS (rate limited)',
}

function fmtTime(ts) {
  if (!ts) return '—'
  try { return new Date(ts).toLocaleString() } catch { return ts }
}

function fmtMs(ms) {
  if (ms == null) return '—'
  if (ms < 1000) return `${ms} ms`
  return `${(ms / 1000).toFixed(2)} s`
}

function qualityPill(score) {
  const color = score >= 80 ? '#00e676' : score >= 60 ? '#ff9800' : '#ff3366'
  return {
    display: 'inline-block', padding: '2px 8px', borderRadius: 10,
    fontSize: 10, fontWeight: 'bold', color,
    border: `1px solid ${color}`, background: `${color}11`,
  }
}

export default function GovernancePanel({ username, onBack }) {
  const [tab, setTab]               = useState('overview')
  const [overview, setOverview]     = useState(null)
  const [audit, setAudit]           = useState([])
  const [runs, setRuns]             = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)
  const [traceRunId, setTraceRunId] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    Promise.all([
      fetchAdminOverview(),
      fetchAdminAudit(150),
      fetchAdminAgentRuns(50),
    ])
      .then(([ov, au, rn]) => {
        if (cancelled) return
        setOverview(ov)
        setAudit(au)
        setRuns(rn)
        setError(null)
      })
      .catch(err => { if (!cancelled) setError(err.message || 'Failed to load admin data') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  return (
    <div style={styles.page}>
      <div style={styles.headerBar}>
        <button onClick={onBack} style={styles.backBtn}>← Back</button>
        <div style={styles.headerTitle}>
          <span style={styles.headerKicker}>Governance Panel</span>
          <span style={styles.headerName}>Hello, {username || 'Admin'}</span>
        </div>
      </div>

      <div style={styles.intro}>
        Cross-tenant view of every AI action, every agent run, and every SLA metric on the
        platform. Same data the rest of the app already collects — admins see it across all users.
      </div>

      <div style={styles.tabBar}>
        {[
          ['overview',  'Overview'],
          ['live',      'Live SLA'],
          ['audit',     'Audit Trail'],
          ['runs',      'Agent Runs'],
        ].map(([k, label]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            style={{...styles.tabBtn, ...(tab === k ? styles.tabBtnActive : {})}}
          >{label}</button>
        ))}
      </div>

      {error && <div style={styles.errorMsg}>{error}</div>}
      {loading && !overview && <div style={styles.empty}>Loading…</div>}

      {tab === 'overview' && overview && (
        <div style={styles.statGrid}>
          <Stat label="Total users"     value={overview.totalUsers} />
          <Stat label="Total profiles"  value={overview.totalProfiles} />
          <Stat label="Audit entries"   value={overview.totalAuditLogs} />
          <Stat label="Agent runs"      value={overview.totalAgentRuns} />
        </div>
      )}

      {tab === 'live' && <SystemStatus />}

      {tab === 'audit' && (
        <div style={styles.card}>
          <div style={styles.cardTitle}>Audit Trail · all users · most recent {audit.length}</div>
          <div style={styles.table}>
            <div style={styles.tableHead}>
              <div style={{...styles.col, ...styles.colTime}}>Time</div>
              <div style={{...styles.col, ...styles.colUser}}>User</div>
              <div style={{...styles.col, ...styles.colAction}}>Action</div>
              <div style={{...styles.col, ...styles.colNum}}>Latency</div>
              <div style={{...styles.col, ...styles.colNum}}>Quality</div>
              <div style={{...styles.col, ...styles.colStatus}}>Status</div>
            </div>
            {audit.map(a => (
              <div key={a.id} style={styles.row}>
                <div style={{...styles.col, ...styles.colTime}}>{fmtTime(a.timestamp)}</div>
                <div style={{...styles.col, ...styles.colUser}}>{(a.userId || '—').slice(-8)}</div>
                <div style={{...styles.col, ...styles.colAction}}>{ACTION_LABELS[a.action] || a.action}</div>
                <div style={{...styles.col, ...styles.colNum}}>{fmtMs(a.latencyMs)}</div>
                <div style={{...styles.col, ...styles.colNum}}>
                  {a.evalScore != null ? <span style={qualityPill(a.evalScore)}>{a.evalScore}</span> : '—'}
                </div>
                <div style={{...styles.col, ...styles.colStatus, color: a.success ? '#00e676' : '#ff3366'}}>
                  {a.success ? 'OK' : 'FAIL'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'runs' && (
        <div style={styles.card}>
          <div style={styles.cardTitle}>Agent Runs · all users · most recent {runs.length}</div>
          <div style={styles.table}>
            <div style={styles.tableHead}>
              <div style={{...styles.col, ...styles.colTime}}>Time</div>
              <div style={{...styles.col, ...styles.colUser}}>User</div>
              <div style={{...styles.col, ...styles.colAction}}>Intent</div>
              <div style={{...styles.col, ...styles.colNum}}>Latency</div>
              <div style={{...styles.col, ...styles.colNum}}>Score</div>
              <div style={{...styles.col, ...styles.colStatus}}>Trace</div>
            </div>
            {runs.map(r => (
              <div key={r.id} style={styles.row}>
                <div style={{...styles.col, ...styles.colTime}}>{fmtTime(r.createdAt)}</div>
                <div style={{...styles.col, ...styles.colUser}}>{(r.userId || '—').slice(-8)}</div>
                <div style={{...styles.col, ...styles.colAction}}>{r.intent || '—'}</div>
                <div style={{...styles.col, ...styles.colNum}}>{fmtMs(r.totalLatencyMs)}</div>
                <div style={{...styles.col, ...styles.colNum}}>
                  {r.finalScore != null ? <span style={qualityPill(r.finalScore)}>{r.finalScore}</span> : '—'}
                </div>
                <div style={{...styles.col, ...styles.colStatus}}>
                  <button onClick={() => setTraceRunId(r.id)} style={styles.linkBtn}>open ▸</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {traceRunId && (
        <AgentTrace runId={traceRunId} onClose={() => setTraceRunId(null)} />
      )}
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div style={styles.stat}>
      <div style={styles.statLabel}>{label}</div>
      <div style={styles.statValue}>{value}</div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh', background: '#020610', color: '#a8b2d1',
    padding: '32px 5%', boxSizing: 'border-box',
  },
  headerBar: { display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 },
  backBtn: {
    background: 'transparent', border: '1px solid rgba(0,204,255,0.25)',
    color: '#00ccff', padding: '6px 14px', borderRadius: 6, cursor: 'pointer',
    fontSize: 11, letterSpacing: '1.5px', textTransform: 'uppercase',
  },
  headerTitle: { display: 'flex', flexDirection: 'column', gap: 2 },
  headerKicker: { fontSize: 11, color: '#7c4dff', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 'bold' },
  headerName: { fontSize: 18, color: '#e6f1ff' },

  intro: { fontSize: 12, color: '#4a6080', maxWidth: 760, lineHeight: 1.7, marginBottom: 24 },

  tabBar: { display: 'flex', gap: 4, borderBottom: '1px solid rgba(0,204,255,0.1)', marginBottom: 18 },
  tabBtn: {
    background: 'transparent', border: 'none', color: '#4a6080', cursor: 'pointer',
    padding: '10px 16px', fontSize: 11, letterSpacing: '1.5px', textTransform: 'uppercase',
    borderBottom: '2px solid transparent',
  },
  tabBtnActive: { color: '#00ccff', borderBottomColor: '#00ccff' },

  empty:    { padding: 18, fontSize: 12, color: '#4a6080' },
  errorMsg: { padding: '10px 14px', background: 'rgba(255,51,102,0.08)', border: '1px solid rgba(255,51,102,0.2)', borderRadius: 8, color: '#ff3366', fontSize: 12, marginBottom: 12 },

  statGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px,1fr))', gap: 14 },
  stat: { padding: '20px 22px', background: 'rgba(0,204,255,0.04)', border: '1px solid rgba(0,204,255,0.12)', borderRadius: 12 },
  statLabel: { fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: '#4a6080', marginBottom: 8 },
  statValue: { fontSize: 28, color: '#00ccff', fontWeight: 'bold' },

  card: { background: 'rgba(6,10,26,0.8)', border: '1px solid rgba(0,204,255,0.1)', borderRadius: 14, padding: 22 },
  cardTitle: { fontSize: 11, color: '#00ccff', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 14, fontWeight: 'bold' },

  table: { display: 'flex', flexDirection: 'column' },
  tableHead: {
    display: 'flex', padding: '10px 12px', fontSize: 9, letterSpacing: '1.5px',
    textTransform: 'uppercase', color: '#2a3a50', borderBottom: '1px solid rgba(0,204,255,0.08)',
  },
  row: { display: 'flex', padding: '10px 12px', fontSize: 11, borderBottom: '1px solid rgba(0,204,255,0.04)' },
  col: { fontSize: 11 },
  colTime:   { flex: '0 0 170px' },
  colUser:   { flex: '0 0 100px', fontFamily: 'monospace', color: '#7c4dff' },
  colAction: { flex: '2 1 auto' },
  colNum:    { flex: '0 0 90px', textAlign: 'right' },
  colStatus: { flex: '0 0 80px', textAlign: 'right' },

  linkBtn: {
    background: 'transparent', border: 'none', color: '#7c4dff',
    fontSize: 10, letterSpacing: '1px', textTransform: 'uppercase',
    cursor: 'pointer', fontWeight: 'bold',
  },
}
