import React, { useEffect, useState } from 'react'
import { fetchMetrics } from '../api'

const ACTION_LABELS = {
  'chat.message':       'AI Chat (success)',
  'chat.flagged':       'AI Chat (PII redacted)',
  'chat.blocked':       'AI Chat (guardrail block)',
  'chat.rate_limited':  'AI Chat (rate limited)',
  'tts.synthesize':     'Text-to-Speech',
  'tts.rate_limited':   'TTS (rate limited)',
}

const BREAKER_LABELS = {
  groq:       'Groq (LLM)',
  elevenlabs: 'ElevenLabs (TTS)',
}

function fmtMs(ms) {
  if (ms == null) return '—'
  if (ms < 1000) return `${ms} ms`
  return `${(ms / 1000).toFixed(2)} s`
}

function breakerColor(state) {
  if (state === 'CLOSED')    return '#00e676'
  if (state === 'HALF_OPEN') return '#ff9800'
  return '#ff3366'
}

export default function SystemStatus() {
  const [snapshot, setSnapshot] = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)

  async function load() {
    try {
      const data = await fetchMetrics(3600)
      setSnapshot(data)
      setError(null)
    } catch (err) {
      setError(err.message || 'Failed to load metrics')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    const t = setInterval(load, 15_000)
    return () => clearInterval(t)
  }, [])

  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <span style={styles.cardIcon}>◐</span>
        <span style={styles.cardTitle}>System Status · last 60 minutes</span>
        <span style={styles.live}>● live</span>
      </div>

      <div style={styles.intro}>
        Rolling SLA metrics computed from the audit trail and live circuit-breaker state.
        Refreshes automatically every 15 seconds.
      </div>

      {loading && !snapshot && <div style={styles.empty}>Loading metrics…</div>}
      {error && <div style={styles.errorMsg}>{error}</div>}

      {snapshot && (
        <>
          <div style={styles.sectionHead}>Upstream Health</div>
          {snapshot.breakers.length === 0 && (
            <div style={styles.empty}>No upstream registered yet.</div>
          )}
          <div style={styles.breakerGrid}>
            {snapshot.breakers.map(b => (
              <div key={b.name} style={styles.breakerCard}>
                <div style={styles.breakerName}>{BREAKER_LABELS[b.name] || b.name}</div>
                <div style={{...styles.breakerState, color: breakerColor(b.state)}}>{b.state}</div>
                <div style={styles.breakerMeta}>
                  Failure rate: {b.failureRatePct >= 0 ? `${b.failureRatePct}%` : '—'} ·
                  Buffered: {b.bufferedCalls} ·
                  Failed: {b.failedCalls}
                </div>
              </div>
            ))}
          </div>

          <div style={styles.sectionHead}>Action Throughput &amp; Latency</div>
          {snapshot.actions.length === 0 && (
            <div style={styles.empty}>No traffic in the last hour.</div>
          )}
          {snapshot.actions.length > 0 && (
            <div style={styles.table}>
              <div style={styles.tableHeadRow}>
                <div style={{...styles.col, ...styles.colAction}}>Action</div>
                <div style={{...styles.col, ...styles.colNum}}>Count</div>
                <div style={{...styles.col, ...styles.colNum}}>Per min</div>
                <div style={{...styles.col, ...styles.colNum}}>Success %</div>
                <div style={{...styles.col, ...styles.colNum}}>p50</div>
                <div style={{...styles.col, ...styles.colNum}}>p95</div>
                <div style={{...styles.col, ...styles.colNum}}>p99</div>
              </div>
              {snapshot.actions.map(a => (
                <div key={a.action} style={styles.row}>
                  <div style={{...styles.col, ...styles.colAction}}>{ACTION_LABELS[a.action] || a.action}</div>
                  <div style={{...styles.col, ...styles.colNum}}>{a.count}</div>
                  <div style={{...styles.col, ...styles.colNum}}>{a.perMinute.toFixed(1)}</div>
                  <div style={{...styles.col, ...styles.colNum, color: a.successRatePct >= 95 ? '#00e676' : a.successRatePct >= 80 ? '#ff9800' : '#ff3366'}}>
                    {a.successRatePct.toFixed(1)}%
                  </div>
                  <div style={{...styles.col, ...styles.colNum}}>{fmtMs(a.latencyP50Ms)}</div>
                  <div style={{...styles.col, ...styles.colNum}}>{fmtMs(a.latencyP95Ms)}</div>
                  <div style={{...styles.col, ...styles.colNum}}>{fmtMs(a.latencyP99Ms)}</div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

const styles = {
  card: {
    background: 'rgba(6,10,26,0.8)',
    border: '1px solid rgba(0,204,255,0.1)',
    borderRadius: 16,
    padding: '24px 28px',
    marginBottom: 20,
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
    flex: 1,
  },
  live: {
    fontSize: 9,
    color: '#00e676',
    letterSpacing: '1.5px',
    textTransform: 'uppercase',
    fontWeight: 'bold',
  },
  intro: {
    fontSize: 11,
    color: '#4a6080',
    lineHeight: 1.7,
    marginBottom: 20,
    maxWidth: 720,
  },
  sectionHead: {
    fontSize: 10,
    letterSpacing: '2px',
    textTransform: 'uppercase',
    color: '#7c4dff',
    marginTop: 8,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  empty: {
    padding: '12px 0',
    fontSize: 11,
    color: '#4a6080',
  },
  errorMsg: {
    padding: '10px 14px',
    background: 'rgba(255,51,102,0.08)',
    border: '1px solid rgba(255,51,102,0.2)',
    borderRadius: 8,
    color: '#ff3366',
    fontSize: 11,
    marginBottom: 12,
  },

  breakerGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: 12,
    marginBottom: 24,
  },
  breakerCard: {
    padding: '14px 16px',
    background: 'rgba(0,204,255,0.03)',
    border: '1px solid rgba(0,204,255,0.1)',
    borderRadius: 10,
  },
  breakerName: {
    fontSize: 10,
    letterSpacing: '1.5px',
    textTransform: 'uppercase',
    color: '#a8b2d1',
    marginBottom: 6,
  },
  breakerState: {
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: '2px',
    marginBottom: 8,
  },
  breakerMeta: {
    fontSize: 10,
    color: '#4a6080',
    lineHeight: 1.6,
  },

  table: {
    display: 'flex',
    flexDirection: 'column',
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
    display: 'flex',
    padding: '12px',
    borderBottom: '1px solid rgba(0,204,255,0.04)',
    fontSize: 11,
    color: '#a8b2d1',
  },
  col: {
    fontSize: 11,
  },
  colAction: { flex: '2 1 200px' },
  colNum:    { flex: '1 1 80px', textAlign: 'right' },
}
