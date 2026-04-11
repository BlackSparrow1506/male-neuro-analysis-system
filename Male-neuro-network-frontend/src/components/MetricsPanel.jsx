import React from 'react'

const METRIC_CONFIG = [
  { key: 'sleepQuality',       label: 'Sleep Quality',       color: '#7c4dff', icon: '' },
  { key: 'stressLevel',        label: 'Stress Level',        color: '#ff3366', icon: '', inverse: true },
  { key: 'focusIndex',         label: 'Focus Index',         color: '#00e5ff', icon: '' },
  { key: 'emotionalBalance',   label: 'Emotional Balance',   color: '#ffaa00', icon: '' },
  { key: 'creativity',         label: 'Creativity',          color: '#aa66ff', icon: '' },
  { key: 'analyticalThinking', label: 'Analytical Thinking', color: '#448aff', icon: '' },
  { key: 'socialEngagement',   label: 'Social Engagement',   color: '#ff66aa', icon: '' },
  { key: 'physicalActivity',   label: 'Physical Activity',   color: '#76ff03', icon: '' },
  { key: 'mindfulness',        label: 'Mindfulness',         color: '#64ffda', icon: '' },
  { key: 'cognitiveLoad',      label: 'Cognitive Load',      color: '#ff9100', icon: '' },
]

function CoherenceGauge({ score }) {
  const pct = Math.round((score || 0) * 100)
  const color = pct >= 70 ? '#00e676' : pct >= 50 ? '#ffaa00' : '#ff3366'
  const label = pct >= 70 ? 'Optimal' : pct >= 50 ? 'Moderate' : 'Needs Attention'

  return (
    <div style={styles.coherenceBox}>
      <div style={styles.coherenceLabel}>Neural Coherence</div>
      <div style={styles.coherenceScore}>
        <span style={{ color, fontSize: '36px', fontWeight: 'bold' }}>{pct}</span>
        <span style={{ color: '#4a5568', fontSize: '16px' }}>%</span>
      </div>
      <div style={{ ...styles.coherenceStatus, color }}>{label}</div>
      <div style={styles.coherenceBarTrack}>
        <div style={{ ...styles.coherenceBarFill, width: `${pct}%`, background: `linear-gradient(90deg, ${color}88, ${color})` }} />
      </div>
      <div style={styles.coherenceFactors}>
        Sleep 20% | Stress 20% | Focus 15% | Emotion 15% | Body 10% | Social 10% | Mind 10%
      </div>
    </div>
  )
}

function MetricBar({ label, value, color, scorecard }) {
  const pct = Math.round((value || 0) * 100)
  const badge = scorecard === 'strength' ? 'STR' : scorecard === 'weakness' ? 'LOW' : null
  const badgeColor = scorecard === 'strength' ? '#00e676' : '#ff3366'

  return (
    <div style={styles.metricRow}>
      <div style={styles.metricLabel}>{label}</div>
      <div style={styles.barTrack}>
        <div style={{ ...styles.barFill, width: `${pct}%`, background: `linear-gradient(90deg, ${color}66, ${color})` }} />
      </div>
      <div style={{ ...styles.metricValue, color }}>{pct}%</div>
      {badge && <div style={{ ...styles.badge, background: badgeColor + '22', color: badgeColor }}>{badge}</div>}
    </div>
  )
}

function ScorecardSection({ scorecard }) {
  if (!scorecard || Object.keys(scorecard).length === 0) return null

  const strengths = Object.entries(scorecard).filter(([, v]) => v === 'strength')
  const weaknesses = Object.entries(scorecard).filter(([, v]) => v === 'weakness')

  const formatName = (key) => key.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, s => s.toUpperCase())

  return (
    <div style={styles.section}>
      <div style={styles.sectionTitle}>Scorecard</div>
      {strengths.length > 0 && (
        <div style={styles.scorecardGroup}>
          <div style={{ fontSize: '10px', color: '#00e676', letterSpacing: '1px', marginBottom: '4px' }}>STRENGTHS</div>
          {strengths.map(([k]) => (
            <div key={k} style={{ fontSize: '11px', color: '#8892b0', padding: '2px 0' }}>+ {formatName(k)}</div>
          ))}
        </div>
      )}
      {weaknesses.length > 0 && (
        <div style={{ ...styles.scorecardGroup, marginTop: '8px' }}>
          <div style={{ fontSize: '10px', color: '#ff3366', letterSpacing: '1px', marginBottom: '4px' }}>NEEDS WORK</div>
          {weaknesses.map(([k]) => (
            <div key={k} style={{ fontSize: '11px', color: '#8892b0', padding: '2px 0' }}>- {formatName(k)}</div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function MetricsPanel({ profile, selectedRegion }) {
  if (!profile) {
    return (
      <div style={styles.panel}>
        <div style={styles.empty}>Create a profile to see your neural metrics</div>
      </div>
    )
  }

  return (
    <div style={styles.panel}>
      <div style={styles.header}>
        <div style={styles.name}>{profile.name || 'Unknown'}</div>
        <div style={styles.sub}>
          {profile.age || '—'} yrs | {profile.occupation || 'Not specified'}
        </div>
      </div>

      <CoherenceGauge score={profile.coherenceScore} />

      <div style={styles.section}>
        <div style={styles.sectionTitle}>Neural Metrics</div>
        {METRIC_CONFIG.map(m => (
          <MetricBar
            key={m.key}
            label={m.label}
            value={profile[m.key]}
            color={m.color}
            scorecard={profile.scorecard?.[m.key]}
          />
        ))}
      </div>

      <ScorecardSection scorecard={profile.scorecard} />

      {selectedRegion && (
        <div style={styles.selectedInfo}>
          <div style={styles.sectionTitle}>Selected Region</div>
          <div style={styles.selectedName}>
            {selectedRegion.replace(/([a-z])([A-Z])/g, '$1 $2')}
          </div>
          <div style={styles.selectedVal}>
            Activity: {Math.round((profile.brainRegions?.[selectedRegion] || 0) * 100)}%
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  panel: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    background: 'rgba(10, 10, 20, 0.95)',
    borderRight: '1px solid #1a3a5c',
    overflowY: 'auto',
  },
  header: {
    padding: '16px 16px 12px',
    borderBottom: '1px solid #1a3a5c',
  },
  name: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#e2e8f0',
  },
  sub: {
    fontSize: '11px',
    color: '#4a5568',
    marginTop: '4px',
  },
  coherenceBox: {
    padding: '16px',
    borderBottom: '1px solid #1a3a5c',
    textAlign: 'center',
  },
  coherenceLabel: {
    fontSize: '10px',
    color: '#00ccff',
    textTransform: 'uppercase',
    letterSpacing: '2px',
    marginBottom: '4px',
  },
  coherenceScore: {
    marginBottom: '2px',
  },
  coherenceStatus: {
    fontSize: '11px',
    fontWeight: 'bold',
    letterSpacing: '1px',
    marginBottom: '8px',
  },
  coherenceBarTrack: {
    height: '4px',
    background: '#0d1b2a',
    borderRadius: '2px',
    overflow: 'hidden',
    marginBottom: '8px',
  },
  coherenceBarFill: {
    height: '100%',
    borderRadius: '2px',
    transition: 'width 0.8s ease',
  },
  coherenceFactors: {
    fontSize: '8px',
    color: '#2d3748',
    letterSpacing: '0.5px',
  },
  section: {
    padding: '12px 16px',
    borderBottom: '1px solid #0d1b2a',
  },
  sectionTitle: {
    fontSize: '10px',
    fontWeight: 'bold',
    color: '#00ffff',
    textTransform: 'uppercase',
    letterSpacing: '2px',
    marginBottom: '10px',
  },
  metricRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '6px',
  },
  metricLabel: {
    width: '120px',
    fontSize: '10px',
    color: '#8892b0',
  },
  barTrack: {
    flex: 1,
    height: '5px',
    background: '#0d1b2a',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: '3px',
    transition: 'width 0.5s ease',
  },
  metricValue: {
    width: '35px',
    textAlign: 'right',
    fontSize: '10px',
    fontWeight: 'bold',
  },
  badge: {
    fontSize: '8px',
    fontWeight: 'bold',
    padding: '1px 4px',
    borderRadius: '3px',
    letterSpacing: '0.5px',
  },
  scorecardGroup: {
    padding: '8px 10px',
    background: '#0d1b2a',
    borderRadius: '6px',
  },
  selectedInfo: {
    padding: '12px',
    background: '#0d1b2a',
    margin: '12px',
    borderRadius: '8px',
    border: '1px solid #1a3a5c',
  },
  selectedName: {
    fontSize: '15px',
    color: '#e2e8f0',
    textTransform: 'capitalize',
    marginBottom: '4px',
  },
  selectedVal: {
    fontSize: '12px',
    color: '#00ffff',
  },
  empty: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#4a5568',
    fontSize: '13px',
    padding: '20px',
    textAlign: 'center',
  },
}
