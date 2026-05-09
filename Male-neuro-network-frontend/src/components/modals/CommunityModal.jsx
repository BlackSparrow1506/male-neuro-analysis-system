import React, { useEffect } from 'react'

const cm = {
  overlay: {
    position: 'fixed', inset: 0, zIndex: 1000,
    background: '#020610',
    overflowY: 'auto',
    fontFamily: "'SF Mono','Fira Code','Consolas',monospace",
  },
  inner: { maxWidth: 900, margin: '0 auto', padding: '0 24px 64px' },
  topBar: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '20px 0', borderBottom: '1px solid rgba(0,204,255,0.08)',
    marginBottom: 40,
  },
  brand: { fontSize: 10, letterSpacing: '4px', color: 'rgba(0,204,255,0.5)', textTransform: 'uppercase' },
  closeBtn: {
    background: 'transparent', border: '1px solid rgba(0,204,255,0.15)',
    borderRadius: 6, color: '#4a6080', fontSize: 11,
    padding: '6px 16px', cursor: 'pointer', fontFamily: 'inherit',
    letterSpacing: '1px',
  },
  hero: { textAlign: 'center', marginBottom: 48 },
  heroEye: { fontSize: 11, letterSpacing: '5px', color: 'rgba(0,204,255,0.4)', textTransform: 'uppercase', marginBottom: 16 },
  heroTitle: { fontSize: 36, fontWeight: 900, letterSpacing: '4px', color: '#fff', textTransform: 'uppercase', margin: '0 0 12px' },
  heroSub: { fontSize: 12, color: '#3a4a60', letterSpacing: '1px', lineHeight: 1.7 },
  statsRow: {
    display: 'flex', justifyContent: 'center', gap: 40,
    margin: '32px 0 48px',
    padding: '20px 0',
    borderTop: '1px solid rgba(0,204,255,0.06)',
    borderBottom: '1px solid rgba(0,204,255,0.06)',
  },
  stat: { textAlign: 'center' },
  statNum: { fontSize: 24, fontWeight: 900, color: '#00ccff', letterSpacing: '2px' },
  statLabel: { fontSize: 9, color: '#2a3a50', letterSpacing: '2px', textTransform: 'uppercase', marginTop: 4 },
  sectionLabel: {
    fontSize: 10, letterSpacing: '3px', color: '#2a3a50',
    textTransform: 'uppercase', marginBottom: 20,
  },
  threads: { display: 'flex', flexDirection: 'column', gap: 2 },
  thread: {
    padding: '24px 28px',
    background: 'rgba(6,10,26,0.6)',
    border: '1px solid rgba(0,204,255,0.06)',
    borderRadius: 12,
    cursor: 'default',
    transition: 'border-color 0.2s',
  },
  threadTop: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 },
  tag: (color) => ({
    fontSize: 9, letterSpacing: '2px', textTransform: 'uppercase',
    color, border: `1px solid ${color}33`,
    background: `${color}0d`,
    padding: '3px 10px', borderRadius: 20,
  }),
  threadTitle: { fontSize: 14, fontWeight: 'bold', color: '#ccd6f6', letterSpacing: '0.5px', marginBottom: 8 },
  threadBody: { fontSize: 12, color: '#3a4a60', lineHeight: 1.7, marginBottom: 14 },
  threadMeta: { display: 'flex', alignItems: 'center', gap: 16 },
  metaAuthor: { fontSize: 10, color: '#00ccff', letterSpacing: '1px' },
  metaItem: { fontSize: 10, color: '#1a2535', letterSpacing: '0.5px' },
  joinBox: {
    marginTop: 40,
    padding: '32px',
    background: 'rgba(0,204,255,0.03)',
    border: '1px solid rgba(0,204,255,0.1)',
    borderRadius: 16,
    textAlign: 'center',
  },
  joinTitle: { fontSize: 14, fontWeight: 'bold', color: '#ccd6f6', letterSpacing: '2px', marginBottom: 8 },
  joinSub: { fontSize: 11, color: '#2a3a50', lineHeight: 1.7, marginBottom: 20 },
  joinBtn: {
    display: 'inline-block',
    padding: '12px 32px',
    background: 'linear-gradient(135deg,#00ccff,#7c4dff)',
    border: 'none', borderRadius: 8,
    color: '#fff', fontSize: 11, fontWeight: 'bold',
    letterSpacing: '2px', textTransform: 'uppercase',
    cursor: 'pointer', fontFamily: 'inherit',
    textDecoration: 'none',
  },
}

export default function CommunityModal({ onClose, username }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const threads = [
    {
      id: 1,
      tag: 'Discussion',
      tagColor: '#00ccff',
      title: 'How does sleep quality affect prefrontal cortex activity?',
      body: 'Members who track their sleep patterns are reporting significant changes in their coherence scores. The prefrontal cortex shows markedly different activation levels after 7+ hours of quality sleep versus fragmented sleep cycles.',
      author: 'NeuralExplorer',
      time: '2 hours ago',
      replies: 14,
      views: 238,
    },
    {
      id: 2,
      tag: 'Research',
      tagColor: '#7c4dff',
      title: 'Testosterone and amygdala reactivity — sharing my 30-day data',
      body: 'After tracking my neural profile daily for a month, I noticed a consistent correlation between my logged stress levels and amygdala activity scores. Sharing the full dataset for anyone interested in the pattern.',
      author: 'BioSignalMike',
      time: '5 hours ago',
      replies: 27,
      views: 412,
    },
    {
      id: 3,
      tag: 'Tips',
      tagColor: '#00e676',
      title: 'Exercise timing and neural coherence — morning vs evening workouts',
      body: 'Morning workouts consistently boost my coherence score by 12–18 points within 2 hours. Evening workouts show a delayed effect peaking during sleep. Anyone else noticing this pattern in their profiles?',
      author: 'CortexCoach',
      time: '1 day ago',
      replies: 9,
      views: 187,
    },
    {
      id: 4,
      tag: 'Question',
      tagColor: '#ff9800',
      title: 'What metrics matter most for long-term cognitive performance?',
      body: 'I have been using the platform for 3 weeks and I am trying to understand which of the neural metrics I should focus on optimising first. Coherence score, regional activation balance, or the limbic indicators?',
      author: 'MindMapper',
      time: '2 days ago',
      replies: 31,
      views: 560,
    },
    {
      id: 5,
      tag: 'Insight',
      tagColor: '#ff3366',
      title: 'Dopamine pathways and motivation — a practical breakdown',
      body: 'The AI coach helped me understand how my basal ganglia activation patterns correlate with my productivity cycles. Here is a breakdown of what I learned and how I restructured my daily routine based on this data.',
      author: 'SynapseBuilder',
      time: '3 days ago',
      replies: 42,
      views: 891,
    },
  ]

  return (
    <div style={cm.overlay}>
      <div style={cm.inner}>
        <div style={cm.topBar}>
          <div style={cm.brand}>Male Neural Network &nbsp;·&nbsp; Community</div>
          <button style={cm.closeBtn} onClick={onClose}>✕ Close</button>
        </div>

        <div style={cm.hero}>
          <div style={cm.heroEye}>Neural Intelligence Platform</div>
          <h1 style={cm.heroTitle}>Community</h1>
          <p style={cm.heroSub}>
            A space for members to share insights, discuss neural patterns,<br />
            and explore the science of the male brain together.
          </p>
        </div>

        <div style={cm.statsRow}>
          <div style={cm.stat}>
            <div style={cm.statNum}>1.2K</div>
            <div style={cm.statLabel}>Members</div>
          </div>
          <div style={cm.stat}>
            <div style={cm.statNum}>340</div>
            <div style={cm.statLabel}>Discussions</div>
          </div>
          <div style={cm.stat}>
            <div style={cm.statNum}>89</div>
            <div style={cm.statLabel}>Active Today</div>
          </div>
          <div style={cm.stat}>
            <div style={cm.statNum}>4.8K</div>
            <div style={cm.statLabel}>Replies</div>
          </div>
        </div>

        <div style={cm.sectionLabel}>Latest Discussions</div>
        <div style={cm.threads}>
          {threads.map(t => (
            <div key={t.id} style={cm.thread}>
              <div style={cm.threadTop}>
                <span style={cm.tag(t.tagColor)}>{t.tag}</span>
              </div>
              <div style={cm.threadTitle}>{t.title}</div>
              <div style={cm.threadBody}>{t.body}</div>
              <div style={cm.threadMeta}>
                <span style={cm.metaAuthor}>⊙ {t.author}</span>
                <span style={cm.metaItem}>{t.time}</span>
                <span style={cm.metaItem}>💬 {t.replies} replies</span>
                <span style={cm.metaItem}>👁 {t.views} views</span>
              </div>
            </div>
          ))}
        </div>

        <div style={cm.joinBox}>
          <div style={cm.joinTitle}>Join the Discussion</div>
          <p style={cm.joinSub}>
            Have insights to share or questions about your neural data?<br />
            Start a thread or reach out to the community directly.
          </p>
          <a
            href={`mailto:g73552780@gmail.com?subject=Community Discussion - Male Neural Network&body=Hi, I am ${username} and I would like to discuss...`}
            style={cm.joinBtn}
          >
            Start a Discussion
          </a>
        </div>

      </div>
    </div>
  )
}
