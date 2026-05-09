import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { fetchGitaGuidance, translateGitaText } from '../api'

const LANGUAGES = [
  { code: 'english',    label: 'English' },
  { code: 'hindi',      label: 'Hindi (हिन्दी)' },
  { code: 'sanskrit',   label: 'Sanskrit (संस्कृत)' },
  { code: 'marathi',    label: 'Marathi (मराठी)' },
  { code: 'tamil',      label: 'Tamil (தமிழ்)' },
  { code: 'telugu',     label: 'Telugu (తెలుగు)' },
  { code: 'bengali',    label: 'Bengali (বাংলা)' },
  { code: 'gujarati',   label: 'Gujarati (ગુજરાતી)' },
  { code: 'kannada',    label: 'Kannada (ಕನ್ನಡ)' },
  { code: 'punjabi',    label: 'Punjabi (ਪੰਜਾਬੀ)' },
  { code: 'spanish',    label: 'Spanish' },
  { code: 'french',     label: 'French' },
  { code: 'german',     label: 'German' },
  { code: 'japanese',   label: 'Japanese' },
  { code: 'mandarin',   label: 'Mandarin' },
  { code: 'arabic',     label: 'Arabic' },
]

const DEVANAGARI_RE = /[ऀ-ॿ]/

// Parse the structured guidance text from the backend into card objects.
// The model is asked to emit blocks of LABEL: value lines separated by `---`.
// Be lenient: the model sometimes drops the final separator before OVERALL_READING
// or uses extra whitespace around `---`.
function parseGuidance(raw) {
  if (!raw || typeof raw !== 'string') return { cards: [], overall: '' }

  const blocks = raw
    .split(/\r?\n\s*-{3,}\s*\r?\n/)
    .map(b => b.trim())
    .filter(Boolean)

  const cards = []
  let overall = ''
  const KEY_RE = /^(METRIC|TITLE|SCORE_LINE|SITUATION|REFERENCE|SHLOKA_SANSKRIT|SHLOKA_TRANSLITERATION|MEANING_ENGLISH|IMPACT|GITA_ADVICE):\s*(.*)$/

  const parseCardBlock = (text) => {
    const card = {}
    const lines = text.split('\n')
    let currentKey = null
    let currentVal = []
    const flush = () => { if (currentKey) card[currentKey] = currentVal.join('\n').trim() }
    for (const line of lines) {
      const m = line.match(KEY_RE)
      if (m) {
        flush()
        currentKey = m[1]
        currentVal = [m[2]]
      } else if (currentKey) {
        currentVal.push(line)
      }
    }
    flush()
    return card
  }

  for (const block of blocks) {
    // Pull OVERALL_READING out of whichever block contains it, leaving any
    // preceding card content intact so it still gets parsed.
    let cardText = block
    const idx = block.indexOf('OVERALL_READING:')
    if (idx !== -1) {
      cardText = block.slice(0, idx).trim()
      overall = block.slice(idx + 'OVERALL_READING:'.length).trim()
    }
    if (!cardText) continue

    const card = parseCardBlock(cardText)
    if (card.METRIC || card.TITLE || card.SHLOKA_SANSKRIT) cards.push(card)
  }
  return { cards, overall }
}

function CoherenceHeader({ score, name }) {
  const pct = Math.round(score || 0)
  const color = pct >= 70 ? '#00e676' : pct >= 50 ? '#ffaa00' : '#ff3366'
  const label = pct >= 70 ? 'Optimal' : pct >= 50 ? 'Moderate' : 'Needs Attention'
  return (
    <div style={styles.header}>
      <div style={styles.headerTitle}>Bhagavad Gita Wisdom</div>
      <div style={styles.headerSub}>
        Personalised guidance for <span style={{ color: '#00ffff' }}>{name}</span> · based on your neural state
      </div>
      <div style={styles.headerScoreRow}>
        <div style={styles.headerScoreLabel}>Neural Coherence</div>
        <div style={{ ...styles.headerScore, color }}>{pct}%</div>
        <div style={{ ...styles.headerScoreStatus, color }}>{label}</div>
      </div>
    </div>
  )
}

function GitaCard({ card, language, onLanguageChange }) {
  const [translated, setTranslated] = useState(null)
  const [loadingT, setLoadingT] = useState(false)

  const englishText = useMemo(() => {
    return [
      `MEANING\n${card.MEANING_ENGLISH || ''}`,
      `IMPACT OF LOW SCORE\n${card.IMPACT || ''}`,
      `WHAT THE GITA SAYS\n${card.GITA_ADVICE || ''}`,
    ].join('\n\n')
  }, [card])

  useEffect(() => {
    setTranslated(null)
    if (!language || language === 'english') return
    let cancelled = false
    setLoadingT(true)
    translateGitaText(englishText, language)
      .then(r => { if (!cancelled) setTranslated(r.text) })
      .catch(() => { if (!cancelled) setTranslated(null) })
      .finally(() => { if (!cancelled) setLoadingT(false) })
    return () => { cancelled = true }
  }, [language, englishText])

  const display = (language === 'english' || !translated) ? null : translated

  // Helper to render either translated bundle or original english sections.
  const renderSections = () => {
    if (display) {
      const parts = display.split(/\n\n+/)
      return parts.map((p, i) => {
        const [head, ...rest] = p.split('\n')
        return (
          <div key={i} style={styles.section}>
            <div style={styles.sectionTitle}>{head}</div>
            <div style={styles.sectionBody}>{rest.join('\n')}</div>
          </div>
        )
      })
    }
    return (
      <>
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Meaning</div>
          <div style={styles.sectionBody}>{card.MEANING_ENGLISH}</div>
        </div>
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Impact of low score</div>
          <div style={styles.sectionBody}>{card.IMPACT}</div>
        </div>
        <div style={styles.section}>
          <div style={styles.sectionTitle}>What the Gita says</div>
          <div style={styles.sectionBody}>{card.GITA_ADVICE}</div>
        </div>
      </>
    )
  }

  const sanskritIsValid = card.SHLOKA_SANSKRIT && DEVANAGARI_RE.test(card.SHLOKA_SANSKRIT)

  return (
    <div style={styles.card}>
      <div style={styles.cardTopRow}>
        <div>
          <div style={styles.cardSituation}>{card.SITUATION}</div>
          <div style={styles.cardTitle}>{card.TITLE}</div>
        </div>
        <div style={styles.cardRef}>{card.REFERENCE}</div>
      </div>

      {card.SCORE_LINE && (
        <div style={styles.scoreLine}>{card.SCORE_LINE}</div>
      )}

      <div style={styles.shlokaBox}>
        {sanskritIsValid && (
          <div style={styles.shlokaSanskrit}>{card.SHLOKA_SANSKRIT}</div>
        )}
        <div style={styles.shlokaTransliteration}>{card.SHLOKA_TRANSLITERATION}</div>
      </div>

      {renderSections()}

      <div style={styles.cardFooter}>
        <label style={styles.langLabel}>Translate to:</label>
        <select
          style={styles.langSelect}
          value={language}
          onChange={e => onLanguageChange(e.target.value)}
        >
          {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
        </select>
        {loadingT && <span style={styles.loadingChip}>Translating…</span>}
      </div>
    </div>
  )
}

export default function GitaPanel({ profile }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [language, setLanguage] = useState('english')

  const profileId = profile?.id

  const load = useCallback(() => {
    if (!profileId) return
    setLoading(true)
    setError(null)
    fetchGitaGuidance(profileId)
      .then(setData)
      .catch(e => setError(e.message || 'Failed to load Gita guidance'))
      .finally(() => setLoading(false))
  }, [profileId])

  useEffect(() => { load() }, [load])

  const parsed = useMemo(() => parseGuidance(data?.guidance), [data])

  if (!profile) {
    return (
      <div style={styles.panel}>
        <div style={styles.empty}>Select a profile to receive personalised Bhagavad Gita guidance.</div>
      </div>
    )
  }

  return (
    <div style={styles.panel}>
      <CoherenceHeader score={data?.coherenceScore ?? Math.round((profile.coherenceScore || 0) * 100)} name={data?.name || profile.name} />

      <div style={styles.body}>
        {loading && (
          <div style={styles.statusBox}>
            <div style={styles.spinner} />
            <div style={styles.statusText}>Consulting the Gita on your behalf…</div>
          </div>
        )}

        {error && !loading && (
          <div style={styles.errorBox}>
            <div style={{ marginBottom: 8 }}>{error}</div>
            <button style={styles.retryBtn} onClick={load}>Try again</button>
          </div>
        )}

        {!loading && !error && parsed.cards.length === 0 && (
          <div style={styles.statusBox}>
            <div style={styles.statusText}>No guidance available yet. Try refreshing.</div>
            <button style={styles.retryBtn} onClick={load}>Refresh</button>
          </div>
        )}

        {!loading && !error && parsed.cards.map((c, i) => (
          <GitaCard
            key={`${c.METRIC || c.TITLE || i}`}
            card={c}
            language={language}
            onLanguageChange={setLanguage}
          />
        ))}

        {!loading && !error && parsed.overall && (
          <div style={styles.overallBox}>
            <div style={styles.overallLabel}>Overall reading</div>
            <div style={styles.overallText}>{parsed.overall}</div>
          </div>
        )}

        {!loading && !error && parsed.cards.length > 0 && (
          <button style={styles.refreshBtn} onClick={load}>Refresh guidance</button>
        )}
      </div>

      <style>{`
        @keyframes gitaSpin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}

const styles = {
  panel: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    width: '100%',
    background: 'linear-gradient(180deg, #0a0a18 0%, #120a05 100%)',
    overflow: 'hidden',
  },
  header: {
    padding: '20px 24px 16px',
    borderBottom: '1px solid #2a1810',
    background: 'linear-gradient(135deg, rgba(255,170,0,0.08), rgba(255,100,50,0.04))',
    flexShrink: 0,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffaa00',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    textShadow: '0 0 20px rgba(255,170,0,0.4)',
  },
  headerSub: {
    fontSize: 11,
    color: '#8892b0',
    marginTop: 4,
    letterSpacing: '0.5px',
  },
  headerScoreRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 12,
    marginTop: 12,
  },
  headerScoreLabel: {
    fontSize: 10,
    color: '#00ccff',
    textTransform: 'uppercase',
    letterSpacing: '2px',
  },
  headerScore: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  headerScoreStatus: {
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: '1.5px',
    textTransform: 'uppercase',
  },
  body: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px 24px 40px',
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  card: {
    background: 'rgba(20, 14, 8, 0.92)',
    border: '1px solid #3a2810',
    borderRadius: 12,
    padding: 18,
    boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
  },
  cardTopRow: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 14,
  },
  cardSituation: {
    fontSize: 9,
    color: '#ff7043',
    textTransform: 'uppercase',
    letterSpacing: '2px',
    fontWeight: 'bold',
    marginBottom: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffd180',
    letterSpacing: '0.5px',
  },
  cardRef: {
    fontSize: 10,
    color: '#8892b0',
    background: 'rgba(255,170,0,0.08)',
    border: '1px solid #3a2810',
    padding: '4px 10px',
    borderRadius: 4,
    textTransform: 'uppercase',
    letterSpacing: '1px',
    whiteSpace: 'nowrap',
  },
  scoreLine: {
    fontSize: 12,
    color: '#ffd180',
    background: 'rgba(255,112,67,0.10)',
    border: '1px solid #3a2810',
    borderLeft: '3px solid #ff7043',
    padding: '10px 14px',
    borderRadius: 6,
    marginBottom: 14,
    lineHeight: 1.55,
    fontStyle: 'italic',
  },
  shlokaBox: {
    background: 'rgba(255,170,0,0.04)',
    border: '1px solid #2a1810',
    borderLeft: '3px solid #ffaa00',
    padding: '14px 16px',
    borderRadius: 6,
    marginBottom: 14,
  },
  shlokaSanskrit: {
    fontSize: 16,
    color: '#ffd180',
    lineHeight: 1.7,
    fontFamily: '"Sanskrit Text","Noto Sans Devanagari",serif',
    whiteSpace: 'pre-wrap',
    marginBottom: 8,
  },
  shlokaTransliteration: {
    fontSize: 12,
    color: '#a0826d',
    fontStyle: 'italic',
    lineHeight: 1.6,
    whiteSpace: 'pre-wrap',
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 10,
    color: '#00ccff',
    textTransform: 'uppercase',
    letterSpacing: '2px',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  sectionBody: {
    fontSize: 13,
    color: '#ccd6f6',
    lineHeight: 1.6,
    whiteSpace: 'pre-wrap',
  },
  cardFooter: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingTop: 12,
    borderTop: '1px solid #2a1810',
    marginTop: 4,
    flexWrap: 'wrap',
  },
  langLabel: {
    fontSize: 10,
    color: '#8892b0',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  langSelect: {
    background: '#0a0a1a',
    color: '#ccd6f6',
    border: '1px solid #3a2810',
    borderRadius: 4,
    padding: '5px 8px',
    fontSize: 12,
    fontFamily: 'inherit',
    cursor: 'pointer',
    outline: 'none',
  },
  loadingChip: {
    fontSize: 10,
    color: '#ffaa00',
    fontStyle: 'italic',
  },
  overallBox: {
    background: 'rgba(0,204,255,0.05)',
    border: '1px solid #1a3a5c',
    borderLeft: '3px solid #00ccff',
    borderRadius: 8,
    padding: 16,
  },
  overallLabel: {
    fontSize: 10,
    color: '#00ccff',
    textTransform: 'uppercase',
    letterSpacing: '2px',
    fontWeight: 'bold',
    marginBottom: 6,
  },
  overallText: {
    fontSize: 13,
    color: '#ccd6f6',
    lineHeight: 1.6,
    whiteSpace: 'pre-wrap',
  },
  statusBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    padding: '40px 20px',
    color: '#8892b0',
  },
  statusText: {
    fontSize: 13,
    color: '#a0826d',
    fontStyle: 'italic',
    letterSpacing: '0.5px',
  },
  spinner: {
    width: 28,
    height: 28,
    border: '2px solid #2a1810',
    borderTopColor: '#ffaa00',
    borderRadius: '50%',
    animation: 'gitaSpin 0.8s linear infinite',
  },
  errorBox: {
    padding: 16,
    background: 'rgba(255,51,102,0.08)',
    border: '1px solid #ff3366',
    borderRadius: 8,
    color: '#ff8a9a',
    fontSize: 13,
    textAlign: 'center',
  },
  retryBtn: {
    background: 'transparent',
    border: '1px solid #ffaa00',
    color: '#ffaa00',
    padding: '6px 16px',
    borderRadius: 4,
    fontSize: 11,
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: '1.5px',
    fontFamily: 'inherit',
    fontWeight: 'bold',
  },
  refreshBtn: {
    alignSelf: 'center',
    marginTop: 4,
    background: 'transparent',
    border: '1px solid #1a3a5c',
    color: '#8892b0',
    padding: '8px 22px',
    borderRadius: 4,
    fontSize: 11,
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: '1.5px',
    fontFamily: 'inherit',
  },
  empty: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#4a5568',
    fontSize: 14,
    padding: 20,
    textAlign: 'center',
  },
}
