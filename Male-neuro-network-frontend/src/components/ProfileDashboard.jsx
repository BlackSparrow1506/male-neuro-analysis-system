import React, { useState, useEffect, useCallback } from 'react'
import { fetchProfiles, createProfile, updateProfile, deleteProfile, logout } from '../api'
import { AboutUsModal, ResearchModal, SupportModal, CopyrightModal } from './ProfileSelector'

// ─── CSS ───────────────────────────────────────────────────────────────────────
const DASH_CSS = `
  @keyframes dashFadeIn { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
  @keyframes rotateSlow { to{transform:rotate(360deg)} }
  @keyframes pulse2 { 0%,100%{opacity:.4} 50%{opacity:1} }

  .profile-card {
    animation: dashFadeIn 0.5s ease both;
    transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
    cursor: default;
  }
  .profile-card:hover {
    transform: translateY(-6px);
    box-shadow: 0 24px 70px rgba(0,204,255,0.14) !important;
    border-color: rgba(0,204,255,0.35) !important;
  }
  .dash-btn {
    transition: all 0.2s ease;
    cursor: pointer;
  }
  .dash-btn:hover { filter: brightness(1.2); transform: translateY(-1px); }
  .dash-btn:active { transform: scale(0.96); }

  .enter-btn {
    transition: all 0.25s ease;
    cursor: pointer;
  }
  .enter-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 40px rgba(0,204,255,0.45) !important;
    filter: brightness(1.1);
  }

  .dash-scroll::-webkit-scrollbar { width: 4px; }
  .dash-scroll::-webkit-scrollbar-track { background: transparent; }
  .dash-scroll::-webkit-scrollbar-thumb { background: rgba(0,204,255,0.2); border-radius: 2px; }

  .form-overlay-anim { animation: dashFadeIn 0.3s ease; }
`

// ─── Metric mini-bar ──────────────────────────────────────────────────────────
function MetricBar({ label, value, color }) {
  const pct = Math.round((value || 0) * 100)
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
        <span style={{ fontSize: 10, color: '#3a4a60', textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</span>
        <span style={{ fontSize: 10, color: color }}>{pct}%</span>
      </div>
      <div style={{ height: 3, background: 'rgba(255,255,255,0.05)', borderRadius: 2 }}>
        <div style={{ width: `${pct}%`, height: '100%', background: `linear-gradient(to right,${color}88,${color})`, borderRadius: 2, boxShadow: `0 0 4px ${color}66` }} />
      </div>
    </div>
  )
}

// ─── Profile card ─────────────────────────────────────────────────────────────
function ProfileCard({ profile, onEnter, onEdit, onDelete, delay }) {
  const coherence = Math.round((profile.coherenceScore || 0) * 100)
  const date = profile.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })
    : '—'

  return (
    <div
      className="profile-card"
      style={{
        background: 'rgba(6,10,26,0.85)',
        border: '1px solid rgba(0,204,255,0.12)',
        borderRadius: 16,
        padding: '24px',
        animationDelay: `${delay}s`,
        backdropFilter: 'blur(20px)',
        boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 'bold', color: '#e2e8f0', marginBottom: 2 }}>{profile.name}</div>
          <div style={{ fontSize: 12, color: '#3a4a60' }}>
            {profile.age ? `${profile.age} yrs` : ''}{profile.occupation ? `  ·  ${profile.occupation}` : ''}
          </div>
        </div>
        {/* Coherence ring */}
        <div style={{
          width: 52, height: 52,
          borderRadius: '50%',
          background: `conic-gradient(#00ccff ${coherence * 3.6}deg, rgba(0,30,60,0.8) 0deg)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <div style={{
            width: 38, height: 38,
            background: 'rgba(6,10,26,0.95)',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexDirection: 'column',
          }}>
            <div style={{ fontSize: 13, fontWeight: 'bold', color: '#00ccff', lineHeight: 1 }}>{coherence}</div>
            <div style={{ fontSize: 7, color: '#2a3a50', letterSpacing: '1px', textTransform: 'uppercase' }}>sync</div>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div>
        <MetricBar label="Focus"    value={profile.focusIndex}       color="#00ccff" />
        <MetricBar label="Stress"   value={profile.stressLevel}      color="#ff3366" />
        <MetricBar label="Mood"     value={profile.emotionalBalance} color="#00e676" />
        <MetricBar label="Energy"   value={profile.physicalActivity} color="#7c4dff" />
      </div>

      {/* Footer */}
      <div style={{ fontSize: 10, color: '#1e2840', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: 12 }}>
        Created {date}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          className="enter-btn"
          onClick={() => onEnter(profile.id)}
          style={{
            flex: 1, padding: '12px',
            background: 'linear-gradient(135deg,#00ccff,#7c4dff)',
            border: 'none', borderRadius: 10,
            color: '#fff', fontSize: 12, fontWeight: 'bold',
            letterSpacing: '2px', textTransform: 'uppercase',
            fontFamily: 'inherit',
            boxShadow: '0 6px 24px rgba(0,204,255,0.25)',
          }}
        >
          Enter
        </button>
        <button
          className="dash-btn"
          onClick={() => onEdit(profile)}
          style={{
            padding: '12px 16px',
            background: 'rgba(0,204,255,0.08)',
            border: '1px solid rgba(0,204,255,0.2)',
            borderRadius: 10,
            color: '#00ccff', fontSize: 12,
            fontFamily: 'inherit',
          }}
          title="Edit profile"
        >
          Edit
        </button>
        <button
          className="dash-btn"
          onClick={() => onDelete(profile.id, profile.name)}
          style={{
            padding: '12px 16px',
            background: 'rgba(255,51,102,0.08)',
            border: '1px solid rgba(255,51,102,0.2)',
            borderRadius: 10,
            color: '#ff3366', fontSize: 12,
            fontFamily: 'inherit',
          }}
          title="Delete profile"
        >
          Del
        </button>
      </div>
    </div>
  )
}

// ─── 4-step onboarding form (create / edit) ───────────────────────────────────
const STEPS = [
  { id: 'basics',    title: 'About You' },
  { id: 'lifestyle', title: 'Lifestyle' },
  { id: 'mental',    title: 'Mental State' },
  { id: 'goals',     title: 'Goals' },
]

function Sel({ label, value, onChange, options }) {
  return (
    <div style={fStyles.field}>
      <label style={fStyles.label}>{label}</label>
      <select style={fStyles.select} value={value} onChange={e => onChange(e.target.value)}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}
function Num({ label, value, onChange, min, max, suffix }) {
  return (
    <div style={fStyles.field}>
      <label style={fStyles.label}>{label}</label>
      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        <input style={{...fStyles.input,width:70}} type="number" min={min} max={max}
          value={value} onChange={e=>onChange(parseInt(e.target.value)||0)} />
        {suffix && <span style={{fontSize:11,color:'#3a4a60'}}>{suffix}</span>}
      </div>
    </div>
  )
}
function Toggle({ label, value, onChange }) {
  return (
    <div style={fStyles.field}>
      <label style={fStyles.label}>{label}</label>
      <button type="button" className="dash-btn" style={{
        ...fStyles.toggle,
        background: value ? 'rgba(0,204,255,0.15)' : 'rgba(0,0,0,0.4)',
        border: `1px solid ${value ? '#00ccff' : 'rgba(0,204,255,0.15)'}`,
        color: value ? '#00ccff' : '#3a4a60',
      }} onClick={() => onChange(!value)}>
        {value ? 'Yes' : 'No'}
      </button>
    </div>
  )
}

const BLANK = {
  name:'', age:25, occupation:'',
  sleepHours:7, exerciseFrequency:2, exerciseType:'none',
  dietQuality:'average', screenTimeHours:6, socialLife:'moderate',
  stressSource:'work', primaryGoal:'balance',
  meditates:false, readsRegularly:false,
  moodBaseline:'neutral', caffeineIntake:2,
  relationshipStatus:'single', hasHobbies:false, hobbyType:'none',
}

function ProfileForm({ initial, onSave, onCancel, saving }) {
  const [step, setStep]   = useState(0)
  const [form, setForm]   = useState(initial || BLANK)
  const set = k => v => setForm(p => ({...p, [k]:v}))

  return (
    <div className="form-overlay-anim" style={{
      position:'fixed', inset:0, background:'rgba(0,0,0,0.75)',
      backdropFilter:'blur(14px)', display:'flex', alignItems:'center',
      justifyContent:'center', zIndex:2000,
    }}>
      <div style={{
        background:'rgba(6,10,26,0.97)', border:'1px solid rgba(0,204,255,0.18)',
        borderRadius:18, width:'100%', maxWidth:480,
        margin:'0 16px', display:'flex', flexDirection:'column',
        maxHeight:'85vh', boxShadow:'0 0 80px rgba(0,204,255,0.1)',
      }}>
        {/* Header */}
        <div style={{padding:'22px 26px 18px', borderBottom:'1px solid rgba(0,204,255,0.08)', textAlign:'center'}}>
          <div style={{fontSize:14,fontWeight:'bold',color:'#e2e8f0',letterSpacing:'2px',marginBottom:14}}>
            {initial ? 'Update Profile' : 'Create Neural Profile'}
          </div>
          {/* Step dots */}
          <div style={{display:'flex',justifyContent:'center',gap:10,marginBottom:8}}>
            {STEPS.map((s,i) => (
              <div key={s.id} style={{
                width:24,height:24,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',
                background: i<=step ? '#00ccff' : 'rgba(0,30,60,0.8)',
                border: `1px solid ${i<=step ? '#00ccff' : 'rgba(0,204,255,0.15)'}`,
                fontSize:10,fontWeight:'bold',
                color: i<=step ? '#000' : '#2a3a50',
              }}>{i+1}</div>
            ))}
          </div>
          <div style={{fontSize:10,color:'#00ccff',textTransform:'uppercase',letterSpacing:'2px'}}>{STEPS[step].title}</div>
        </div>

        {/* Body */}
        <div className="dash-scroll" style={{padding:'20px 26px',overflowY:'auto',flex:1,display:'flex',flexDirection:'column',gap:14}}>
          {step===0 && <>
            <div style={fStyles.field}>
              <label style={fStyles.label}>Your Name</label>
              <input style={fStyles.input} value={form.name} onChange={e=>set('name')(e.target.value)} placeholder="Enter your name"/>
            </div>
            <Num label="Age" value={form.age} onChange={set('age')} min={13} max={100} suffix="years"/>
            <div style={fStyles.field}>
              <label style={fStyles.label}>Occupation</label>
              <input style={fStyles.input} value={form.occupation} onChange={e=>set('occupation')(e.target.value)} placeholder="e.g. Engineer, Student"/>
            </div>
            <Sel label="Relationship Status" value={form.relationshipStatus} onChange={set('relationshipStatus')} options={[
              {value:'single',label:'Single'},{value:'in_relationship',label:'In a Relationship'},{value:'married',label:'Married'},
            ]}/>
          </>}

          {step===1 && <>
            <Num label="Sleep (hours/night)" value={form.sleepHours} onChange={set('sleepHours')} min={1} max={14} suffix="hrs"/>
            <Num label="Exercise (days/week)" value={form.exerciseFrequency} onChange={set('exerciseFrequency')} min={0} max={7} suffix="days"/>
            <Sel label="Exercise Type" value={form.exerciseType} onChange={set('exerciseType')} options={[
              {value:'none',label:'None / Minimal'},{value:'walking',label:'Walking / Light'},{value:'gym',label:'Gym / Weights'},{value:'running',label:'Running / Cardio'},{value:'sports',label:'Team Sports'},{value:'mixed',label:'Mixed'},
            ]}/>
            <Sel label="Diet Quality" value={form.dietQuality} onChange={set('dietQuality')} options={[
              {value:'poor',label:'Poor'},{value:'average',label:'Average'},{value:'good',label:'Good'},{value:'excellent',label:'Excellent'},
            ]}/>
            <Num label="Screen Time (hrs/day)" value={form.screenTimeHours} onChange={set('screenTimeHours')} min={0} max={18} suffix="hrs"/>
            <Num label="Caffeine (cups/day)" value={form.caffeineIntake} onChange={set('caffeineIntake')} min={0} max={12} suffix="cups"/>
          </>}

          {step===2 && <>
            <Sel label="Baseline Mood" value={form.moodBaseline} onChange={set('moodBaseline')} options={[
              {value:'anxious',label:'Anxious'},{value:'low',label:'Low / Down'},{value:'neutral',label:'Neutral'},{value:'calm',label:'Calm'},{value:'energetic',label:'Energetic'},
            ]}/>
            <Sel label="Main Stress Source" value={form.stressSource} onChange={set('stressSource')} options={[
              {value:'work',label:'Work / Career'},{value:'academic',label:'Studies'},{value:'finances',label:'Finances'},{value:'relationships',label:'Relationships'},{value:'health',label:'Health'},{value:'none',label:'No major stress'},
            ]}/>
            <Sel label="Social Life" value={form.socialLife} onChange={set('socialLife')} options={[
              {value:'isolated',label:'Isolated'},{value:'limited',label:'Limited'},{value:'moderate',label:'Moderate'},{value:'active',label:'Active'},{value:'very_active',label:'Very Active'},
            ]}/>
            <Toggle label="Do you meditate?" value={form.meditates} onChange={set('meditates')}/>
            <Toggle label="Do you read regularly?" value={form.readsRegularly} onChange={set('readsRegularly')}/>
          </>}

          {step===3 && <>
            <Sel label="Primary Goal" value={form.primaryGoal} onChange={set('primaryGoal')} options={[
              {value:'reduce_stress',label:'Reduce Stress & Anxiety'},{value:'improve_focus',label:'Improve Focus'},{value:'boost_creativity',label:'Boost Creativity'},{value:'balance',label:'Overall Balance'},{value:'fitness',label:'Physical Fitness'},{value:'emotional_health',label:'Emotional Health'},
            ]}/>
            <Toggle label="Do you have hobbies?" value={form.hasHobbies} onChange={set('hasHobbies')}/>
            {form.hasHobbies && (
              <Sel label="Hobby Type" value={form.hobbyType} onChange={set('hobbyType')} options={[
                {value:'creative',label:'Creative (art, music)'},{value:'analytical',label:'Analytical (coding, chess)'},{value:'physical',label:'Physical (sports, hiking)'},{value:'social',label:'Social (groups, clubs)'},
              ]}/>
            )}
            {/* Summary */}
            <div style={{background:'rgba(0,0,0,0.4)',border:'1px solid rgba(0,204,255,0.1)',borderRadius:10,padding:14,marginTop:4}}>
              <div style={{fontSize:10,color:'#00ccff',textTransform:'uppercase',letterSpacing:'2px',marginBottom:8}}>Profile Summary</div>
              <div style={{fontSize:12,color:'#4a6080',lineHeight:1.7}}>
                {form.name || '—'}, {form.age} · {form.occupation || 'Not specified'}<br/>
                Sleep: {form.sleepHours}h · Exercise: {form.exerciseFrequency}x/wk · Screen: {form.screenTimeHours}h/day<br/>
                Mood: {form.moodBaseline} · Stress: {form.stressSource}
              </div>
            </div>
          </>}
        </div>

        {/* Footer */}
        <div style={{padding:'16px 26px',borderTop:'1px solid rgba(0,204,255,0.08)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <button className="dash-btn" onClick={onCancel} style={fStyles.cancelBtn}>Cancel</button>
          <div style={{display:'flex',gap:8}}>
            {step>0 && <button className="dash-btn" onClick={()=>setStep(s=>s-1)} style={fStyles.backBtn}>Back</button>}
            {step < STEPS.length-1
              ? <button className="dash-btn" onClick={()=>setStep(s=>s+1)} style={fStyles.nextBtn} disabled={step===0&&!form.name.trim()}>Next</button>
              : <button className="dash-btn" onClick={()=>onSave(form)} style={fStyles.saveBtn} disabled={saving||!form.name.trim()}>
                  {saving ? 'Saving...' : (initial ? 'Update Profile' : 'Generate Profile')}
                </button>
            }
          </div>
        </div>
      </div>
    </div>
  )
}

const fStyles = {
  field:  { display:'flex', flexDirection:'column', gap:5 },
  label:  { fontSize:10, color:'#3a4a60', textTransform:'uppercase', letterSpacing:'1.5px', fontFamily:'inherit' },
  input:  { padding:'10px 14px', background:'rgba(0,0,0,0.5)', border:'1px solid rgba(0,204,255,0.15)', borderRadius:8, color:'#ccd6f6', fontSize:13, outline:'none', fontFamily:'inherit' },
  select: { padding:'10px 14px', background:'rgba(0,0,0,0.5)', border:'1px solid rgba(0,204,255,0.15)', borderRadius:8, color:'#ccd6f6', fontSize:13, outline:'none', fontFamily:'inherit' },
  toggle: { padding:'8px 20px', borderRadius:8, fontSize:12, fontWeight:'bold', width:80, fontFamily:'inherit' },
  cancelBtn: { padding:'8px 16px', background:'transparent', border:'1px solid rgba(255,255,255,0.06)', borderRadius:8, color:'#2a3a50', fontSize:12, fontFamily:'inherit' },
  backBtn:   { padding:'8px 16px', background:'rgba(0,0,0,0.4)', border:'1px solid rgba(0,204,255,0.12)', borderRadius:8, color:'#4a6080', fontSize:12, fontFamily:'inherit' },
  nextBtn:   { padding:'8px 24px', background:'rgba(0,204,255,0.12)', border:'1px solid rgba(0,204,255,0.3)', borderRadius:8, color:'#00ccff', fontSize:12, fontWeight:'bold', fontFamily:'inherit' },
  saveBtn:   { padding:'8px 24px', background:'linear-gradient(135deg,#00ccff,#7c4dff)', border:'none', borderRadius:8, color:'#fff', fontSize:12, fontWeight:'bold', fontFamily:'inherit' },
}

// ─── Main ProfileDashboard ────────────────────────────────────────────────────
export default function ProfileDashboard({ userEmail, username, onEnter, onLogout, onViewProfile }) {
  const [profiles, setProfiles]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [showForm, setShowForm]   = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [saving, setSaving]       = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [error, setError]         = useState('')
  const [showAbout, setShowAbout]         = useState(false)
  const [showResearch, setShowResearch]   = useState(false)
  const [showSupport, setShowSupport]     = useState(false)
  const [showCopyright, setShowCopyright] = useState(false)

  // Inject CSS
  useEffect(() => {
    const el = document.createElement('style'); el.id='nn-dash-css'; el.textContent=DASH_CSS
    document.head.appendChild(el)
    return () => { const s=document.getElementById('nn-dash-css'); if(s) s.remove() }
  }, [])

  const load = useCallback(() => {
    setLoading(true)
    fetchProfiles()
      .then(setProfiles)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  async function handleSave(form) {
    setSaving(true)
    try {
      if (editTarget) {
        const updated = await updateProfile(editTarget.id, form)
        setProfiles(prev => prev.map(p => p.id === updated.id ? updated : p))
      } else {
        const created = await createProfile(form)
        setProfiles(prev => [...prev, created])
      }
      setShowForm(false); setEditTarget(null)
    } catch(e) { setError(e.message) }
    finally { setSaving(false) }
  }

  async function handleDelete(id) {
    try {
      await deleteProfile(id)
      setProfiles(prev => prev.filter(p => p.id !== id))
    } catch(e) { setError(e.message) }
    finally { setDeleteConfirm(null) }
  }

  function handleLogout() {
    logout(); onLogout()
  }

  return (
    <div className="dash-scroll" style={{
      position:'fixed', inset:0,
      background:'#020610',
      overflowY:'scroll',
      fontFamily:"'SF Mono','Fira Code',monospace",
      zIndex:500,
    }}>
      {/* Modals */}
      {showAbout     && <AboutUsModal   onClose={() => setShowAbout(false)} />}
      {showResearch  && <ResearchModal  onClose={() => setShowResearch(false)} />}
      {showSupport   && <SupportModal   onClose={() => setShowSupport(false)} />}
      {showCopyright && <CopyrightModal onClose={() => setShowCopyright(false)} />}

      {/* Subtle background gradient */}
      <div style={{position:'fixed',inset:0,background:'radial-gradient(ellipse at 20% 20%, rgba(0,100,160,0.06) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(80,0,160,0.05) 0%, transparent 60%)',pointerEvents:'none'}}/>

      {/* Top navigation bar */}
      <div style={{
        position:'sticky', top:0, zIndex:10,
        background:'rgba(2,6,16,0.95)',
        backdropFilter:'blur(20px)',
        borderBottom:'1px solid rgba(0,204,255,0.08)',
        padding:'0 32px',
        display:'flex', alignItems:'center', justifyContent:'space-between',
        height:60,
      }}>
        <div style={{display:'flex',alignItems:'center',gap:16}}>
          <div style={{fontSize:13,fontWeight:'bold',color:'#00ccff',letterSpacing:'3px',textTransform:'uppercase'}}>
            Male Neural Network
          </div>
          <div style={{width:1,height:18,background:'rgba(0,204,255,0.15)'}}/>
          <div style={{fontSize:11,color:'#2a3a50',letterSpacing:'1px'}}>Dashboard</div>
        </div>

        {/* Centre nav tabs */}
        <div style={{display:'flex',alignItems:'center',gap:2}}>
          {[
            { label:'About Us',  action:() => setShowAbout(true)    },
            { label:'Research',  action:() => setShowResearch(true)  },
            { label:'Support',   action:() => setShowSupport(true)   },
            { label:'Copyright', action:() => setShowCopyright(true) },
          ].map(tab => (
            <button key={tab.label} onClick={tab.action} style={{
              padding:'5px 12px', background:'transparent', border:'none',
              color:'rgba(100,130,170,0.55)', fontSize:10, letterSpacing:'1.5px',
              textTransform:'uppercase', cursor:'pointer', fontFamily:'inherit',
              transition:'color 0.2s ease',
            }}
            onMouseEnter={e => e.currentTarget.style.color='rgba(0,204,255,0.8)'}
            onMouseLeave={e => e.currentTarget.style.color='rgba(100,130,170,0.55)'}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <button onClick={onViewProfile} style={{
            display:'flex', alignItems:'center', gap:8,
            padding:'6px 14px',
            background:'rgba(0,204,255,0.06)',
            border:'1px solid rgba(0,204,255,0.15)',
            borderRadius:8, color:'#00ccff',
            fontSize:11, fontWeight:'bold',
            letterSpacing:'1.5px', textTransform:'uppercase',
            fontFamily:'inherit', cursor:'pointer',
          }}>
            <span style={{fontSize:14}}>⚙</span>
            {username || userEmail}
          </button>
          <button className="dash-btn" onClick={handleLogout} style={{
            padding:'7px 16px',
            background:'rgba(255,51,102,0.08)',
            border:'1px solid rgba(255,51,102,0.2)',
            borderRadius:8, color:'#ff3366',
            fontSize:11, fontWeight:'bold',
            letterSpacing:'1.5px', textTransform:'uppercase',
            fontFamily:'inherit', cursor:'pointer',
          }}>
            Sign Out
          </button>
        </div>
      </div>

      {/* Page content */}
      <div style={{ maxWidth:1100, margin:'0 auto', padding:'48px 32px' }}>

        {/* Hero row */}
        <div style={{ marginBottom:48, display:'flex', justifyContent:'space-between', alignItems:'flex-end', flexWrap:'wrap', gap:20 }}>
          <div>
            <div style={{fontSize:11,color:'#00ccff',letterSpacing:'4px',textTransform:'uppercase',marginBottom:8}}>
              Neural Profiles
            </div>
            <h2 style={{fontSize:'clamp(26px,4vw,40px)',fontWeight:900,color:'#e2e8f0',margin:0,letterSpacing:'2px'}}>
              Your Brain Maps
            </h2>
            <p style={{fontSize:13,color:'#2a3a50',marginTop:8,lineHeight:1.6}}>
              {profiles.length === 0
                ? 'Create your first profile to begin neural analysis.'
                : `${profiles.length} profile${profiles.length > 1 ? 's' : ''} — select one to enter the neural network`}
            </p>
          </div>
          <button className="dash-btn enter-btn" onClick={() => { setEditTarget(null); setShowForm(true) }} style={{
            padding:'14px 28px',
            background:'linear-gradient(135deg,rgba(0,204,255,0.15),rgba(124,77,255,0.15))',
            border:'1px solid rgba(0,204,255,0.3)',
            borderRadius:12, color:'#00ccff',
            fontSize:13, fontWeight:'bold',
            letterSpacing:'2px', textTransform:'uppercase',
            fontFamily:'inherit',
            boxShadow:'0 8px 30px rgba(0,204,255,0.1)',
          }}>
            + New Profile
          </button>
        </div>

        {/* Error banner */}
        {error && (
          <div style={{padding:'12px 18px',background:'rgba(255,51,102,0.08)',border:'1px solid rgba(255,51,102,0.25)',borderRadius:10,color:'#ff3366',fontSize:13,marginBottom:24,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            {error}
            <button onClick={()=>setError('')} style={{background:'none',border:'none',color:'#ff3366',cursor:'pointer',fontSize:16}}>×</button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{textAlign:'center',padding:'60px 0',color:'#2a3a50',fontSize:12,letterSpacing:'3px',textTransform:'uppercase',animation:'pulse2 1.5s ease infinite'}}>
            Initialising neural grid…
          </div>
        )}

        {/* Empty state */}
        {!loading && profiles.length === 0 && (
          <div style={{
            textAlign:'center', padding:'80px 40px',
            background:'rgba(6,10,26,0.6)',
            border:'1px dashed rgba(0,204,255,0.15)',
            borderRadius:20, color:'#2a3a50',
          }}>
            <div style={{fontSize:48,marginBottom:16,opacity:.4}}>⬡</div>
            <div style={{fontSize:14,fontWeight:'bold',color:'#3a4a60',letterSpacing:'2px',marginBottom:8}}>No Profiles Yet</div>
            <div style={{fontSize:12,color:'#1e2840',marginBottom:24}}>Create your first neural profile to begin analysis</div>
            <button className="dash-btn enter-btn" onClick={() => setShowForm(true)} style={{
              padding:'12px 32px',
              background:'linear-gradient(135deg,#00ccff,#7c4dff)',
              border:'none', borderRadius:10, color:'#fff',
              fontSize:13, fontWeight:'bold', letterSpacing:'2px',
              textTransform:'uppercase', fontFamily:'inherit',
              boxShadow:'0 8px 24px rgba(0,204,255,0.2)',
            }}>
              Create First Profile
            </button>
          </div>
        )}

        {/* Profile grid */}
        {!loading && profiles.length > 0 && (
          <div style={{
            display:'grid',
            gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',
            gap:20,
          }}>
            {profiles.map((p, i) => (
              <ProfileCard
                key={p.id}
                profile={p}
                delay={i * 0.08}
                onEnter={onEnter}
                onEdit={(prof) => { setEditTarget(prof); setShowForm(true) }}
                onDelete={(id, name) => setDeleteConfirm({ id, name })}
              />
            ))}
          </div>
        )}

        {/* Footer */}
        <div style={{marginTop:64,borderTop:'1px solid rgba(0,204,255,0.06)',paddingTop:24,textAlign:'center',fontSize:11,color:'#101820',letterSpacing:'1px'}}>
          Male Neural Network · Educational tool · Not medical advice
        </div>
      </div>

      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div className="form-overlay-anim" style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',backdropFilter:'blur(10px)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:3000}}>
          <div style={{background:'rgba(6,10,26,0.97)',border:'1px solid rgba(255,51,102,0.3)',borderRadius:16,padding:'32px 36px',maxWidth:380,width:'100%',margin:'0 16px',textAlign:'center',boxShadow:'0 0 60px rgba(255,51,102,0.1)'}}>
            <div style={{fontSize:32,marginBottom:12,opacity:.7}}>⚠</div>
            <div style={{fontSize:15,fontWeight:'bold',color:'#e2e8f0',marginBottom:8}}>Delete Profile?</div>
            <div style={{fontSize:13,color:'#3a4a60',lineHeight:1.6,marginBottom:24}}>
              <span style={{color:'#ff3366'}}>"{deleteConfirm.name}"</span> and all chat history will be permanently removed.
            </div>
            <div style={{display:'flex',gap:10,justifyContent:'center'}}>
              <button className="dash-btn" onClick={()=>setDeleteConfirm(null)} style={{padding:'10px 22px',background:'transparent',border:'1px solid rgba(255,255,255,0.08)',borderRadius:8,color:'#3a4a60',fontSize:12,fontFamily:'inherit'}}>
                Cancel
              </button>
              <button className="dash-btn" onClick={()=>handleDelete(deleteConfirm.id)} style={{padding:'10px 22px',background:'rgba(255,51,102,0.15)',border:'1px solid rgba(255,51,102,0.4)',borderRadius:8,color:'#ff3366',fontSize:12,fontWeight:'bold',fontFamily:'inherit'}}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile form modal */}
      {showForm && (
        <ProfileForm
          initial={editTarget}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditTarget(null) }}
          saving={saving}
        />
      )}
    </div>
  )
}
