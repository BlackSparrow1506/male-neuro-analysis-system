import React, { useEffect, useState } from 'react'
import { fetchAgentRun } from '../api'

const STATUS_COLORS = {
  success: '#00e676',
  skipped: '#7c4dff',
  failed:  '#ff3366',
}

const STEP_LABEL = {
  router:    'Router',
  responder: 'Responder',
  validator: 'Validator',
  recovery:  'Recovery',
}

export default function AgentTrace({ runId, onClose }) {
  const [run, setRun]         = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    let cancelled = false
    fetchAgentRun(runId)
      .then(data => { if (!cancelled) setRun(data) })
      .catch(err  => { if (!cancelled) setError(err.message || 'Failed to load trace') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [runId])

  return (
    <div style={styles.backdrop} onClick={onClose}>
      <div style={styles.panel} onClick={e => e.stopPropagation()}>
        <div style={styles.header}>
          <span style={styles.headerTitle}>Agent Trace</span>
          <button type="button" onClick={onClose} style={styles.closeBtn}>×</button>
        </div>

        {loading && <div style={styles.empty}>Loading trace…</div>}
        {error   && <div style={styles.errorMsg}>{error}</div>}

        {run && (
          <>
            <div style={styles.summary}>
              <div style={styles.summaryRow}>
                <span style={styles.summaryLabel}>Intent</span>
                <span style={styles.summaryValue}>{run.intent || '—'}</span>
              </div>
              <div style={styles.summaryRow}>
                <span style={styles.summaryLabel}>Total latency</span>
                <span style={styles.summaryValue}>{run.totalLatencyMs} ms</span>
              </div>
              <div style={styles.summaryRow}>
                <span style={styles.summaryLabel}>Final eval</span>
                <span style={styles.summaryValue}>{run.finalScore ?? '—'}/100</span>
              </div>
            </div>

            <div style={styles.timeline}>
              {run.steps.map((step, i) => (
                <div key={i} style={styles.step}>
                  <div style={{...styles.stepBadge, color: STATUS_COLORS[step.status] || '#a8b2d1', borderColor: STATUS_COLORS[step.status] || '#a8b2d1'}}>
                    {step.status.toUpperCase()}
                  </div>
                  <div style={styles.stepBody}>
                    <div style={styles.stepHead}>
                      <span style={styles.stepName}>{STEP_LABEL[step.name] || step.name}</span>
                      <span style={styles.stepLatency}>{step.latencyMs} ms</span>
                    </div>
                    {step.inputPreview && (
                      <div style={styles.kv}><span style={styles.k}>in</span><span style={styles.v}>{step.inputPreview}</span></div>
                    )}
                    {step.outputPreview && (
                      <div style={styles.kv}><span style={styles.k}>out</span><span style={styles.v}>{step.outputPreview}</span></div>
                    )}
                    {step.notes && (
                      <div style={styles.kv}><span style={styles.k}>note</span><span style={{...styles.v, color: '#ff9800'}}>{step.notes}</span></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

const styles = {
  backdrop: {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.65)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000, padding: 20,
  },
  panel: {
    background: '#06101e', border: '1px solid rgba(0,204,255,0.25)',
    borderRadius: 14, padding: 22, width: '100%', maxWidth: 720,
    maxHeight: '85vh', overflowY: 'auto',
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    paddingBottom: 14, marginBottom: 16,
    borderBottom: '1px solid rgba(0,204,255,0.1)',
  },
  headerTitle: {
    fontSize: 12, letterSpacing: '2px', textTransform: 'uppercase',
    color: '#00ccff', fontWeight: 'bold',
  },
  closeBtn: {
    background: 'transparent', border: 'none', color: '#a8b2d1',
    fontSize: 22, cursor: 'pointer', padding: '0 6px',
  },
  empty:    { padding: 12, fontSize: 12, color: '#4a6080' },
  errorMsg: { padding: '10px 14px', background: 'rgba(255,51,102,0.08)', border: '1px solid rgba(255,51,102,0.2)', borderRadius: 8, color: '#ff3366', fontSize: 12 },

  summary: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 18 },
  summaryRow: { display: 'flex', flexDirection: 'column', gap: 4, padding: '10px 12px', background: 'rgba(0,204,255,0.04)', border: '1px solid rgba(0,204,255,0.08)', borderRadius: 8 },
  summaryLabel: { fontSize: 9, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#4a6080' },
  summaryValue: { fontSize: 14, color: '#00ccff', fontWeight: 'bold' },

  timeline: { display: 'flex', flexDirection: 'column', gap: 10 },
  step: { display: 'flex', gap: 12, alignItems: 'flex-start', padding: '10px 12px', background: 'rgba(124,77,255,0.04)', border: '1px solid rgba(124,77,255,0.1)', borderRadius: 8 },
  stepBadge: { padding: '3px 8px', borderRadius: 6, border: '1px solid', fontSize: 9, fontWeight: 'bold', letterSpacing: '1px', flex: '0 0 auto' },
  stepBody: { flex: 1, minWidth: 0 },
  stepHead: { display: 'flex', justifyContent: 'space-between', marginBottom: 6 },
  stepName: { fontSize: 12, color: '#a8b2d1', fontWeight: 'bold' },
  stepLatency: { fontSize: 10, color: '#4a6080' },
  kv: { display: 'flex', gap: 8, fontSize: 11, lineHeight: 1.5, marginTop: 3 },
  k:  { flex: '0 0 36px', color: '#4a6080', fontSize: 9, letterSpacing: '1px', textTransform: 'uppercase', paddingTop: 2 },
  v:  { flex: 1, color: '#a8b2d1', wordBreak: 'break-word' },
}
