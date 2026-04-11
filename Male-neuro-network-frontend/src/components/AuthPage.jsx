import React, { useEffect, useRef, useState } from 'react'
import { login, register, resendVerification } from '../api'

// ─── Reuse the same interstellar canvas ───────────────────────────────────────
function hexToRgb(hex) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return m ? [parseInt(m[1],16),parseInt(m[2],16),parseInt(m[3],16)] : [0,204,255]
}

function NeuralCanvas() {
  const ref = useRef(null)
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    try { ctx.clearRect(0, 0, 0, 0) } catch(e) { return }
    let raf, cancelled=false, W=0, H=0, stars=[], nodes=[], pulses=[]
    const COLORS = ['#00ccff','#7c4dff','#ff3366','#00e676','#64ffda']
    function init() {
      W=canvas.width=window.innerWidth; H=canvas.height=window.innerHeight
      stars=Array.from({length:220},()=>({x:Math.random()*W,y:Math.random()*H,r:Math.random()*1.2+0.2,phase:Math.random()*Math.PI*2,speed:0.5+Math.random()*2}))
      nodes=Array.from({length:22},()=>({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.3,vy:(Math.random()-.5)*.3,r:1.5+Math.random()*2,pulse:Math.random()*Math.PI*2,pulseSpeed:.018+Math.random()*.025,color:COLORS[Math.floor(Math.random()*5)]}))
    }
    let t=0
    function fire(){if(pulses.length>=6||Math.random()>.02)return;const n1=nodes[Math.floor(Math.random()*nodes.length)],n2=nodes[Math.floor(Math.random()*nodes.length)];if(n1!==n2&&Math.hypot(n1.x-n2.x,n1.y-n2.y)<200)pulses.push({x:n1.x,y:n1.y,tx:n2.x,ty:n2.y,p:0,color:n1.color})}
    function draw(){
      if (cancelled) return
      t+=.007; ctx.clearRect(0,0,W,H)
      ;[[W*.2,H*.3,W*.5,'rgba(80,0,160,0.05)'],[W*.8,H*.7,W*.4,'rgba(0,60,140,0.06)'],[W*.5,H*.5,W*.55,'rgba(0,80,110,0.035)']].forEach(([x,y,r,c])=>{const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,c);g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(0,0,W,H)})
      stars.forEach(s=>{const a=.12+.78*(.5+.5*Math.sin(t*s.speed+s.phase));ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.fillStyle=`rgba(255,255,255,${a})`;ctx.fill()})
      for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++){const d=Math.hypot(nodes[i].x-nodes[j].x,nodes[i].y-nodes[j].y);if(d<200){const a=(1-d/200)*.18;ctx.beginPath();ctx.moveTo(nodes[i].x,nodes[i].y);ctx.lineTo(nodes[j].x,nodes[j].y);ctx.strokeStyle=`rgba(0,180,255,${a})`;ctx.lineWidth=a*2;ctx.stroke()}}
      nodes.forEach(n=>{n.x+=n.vx;n.y+=n.vy;n.pulse+=n.pulseSpeed;if(n.x<0){n.x=0;n.vx*=-1}if(n.x>W){n.x=W;n.vx*=-1}if(n.y<0){n.y=0;n.vy*=-1}if(n.y>H){n.y=H;n.vy*=-1};const act=.4+.6*(.5+.5*Math.sin(n.pulse));const gr=n.r*(4+act*5);const[r,g,b]=hexToRgb(n.color);const grd=ctx.createRadialGradient(n.x,n.y,0,n.x,n.y,gr);grd.addColorStop(0,`rgba(${r},${g},${b},${act*.7})`);grd.addColorStop(1,`rgba(${r},${g},${b},0)`);ctx.fillStyle=grd;ctx.beginPath();ctx.arc(n.x,n.y,gr,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(n.x,n.y,n.r,0,Math.PI*2);ctx.fillStyle=n.color;ctx.fill()})
      fire(); pulses=pulses.filter(p=>p.p<1); pulses.forEach(p=>{p.p+=.02;const x=p.x+(p.tx-p.x)*p.p,y=p.y+(p.ty-p.y)*p.p;const[r,g,b]=hexToRgb(p.color);const grd=ctx.createRadialGradient(x,y,0,x,y,9);grd.addColorStop(0,`rgba(${r},${g},${b},1)`);grd.addColorStop(1,`rgba(${r},${g},${b},0)`);ctx.fillStyle=grd;ctx.beginPath();ctx.arc(x,y,9,0,Math.PI*2);ctx.fill()})
      raf=requestAnimationFrame(draw)
    }
    init(); draw(); window.addEventListener('resize',init)
    return()=>{cancelled=true;cancelAnimationFrame(raf);window.removeEventListener('resize',init)}
  },[])
  return <canvas ref={ref} style={{position:'fixed',inset:0,zIndex:0,pointerEvents:'none'}}/>
}

// ─── Input field component ────────────────────────────────────────────────────
function Field({ label, type, value, onChange, placeholder, error, autoComplete }) {
  const [show, setShow] = useState(false)
  const isPassword = type === 'password'
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{ display: 'block', fontSize: 11, color: '#4a6080', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 8, fontFamily: 'inherit' }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <input
          type={isPassword && show ? 'text' : type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          style={{
            width: '100%', boxSizing: 'border-box',
            padding: isPassword ? '14px 46px 14px 16px' : '14px 16px',
            background: 'rgba(4,8,22,0.9)',
            border: `1px solid ${error ? '#ff3366' : 'rgba(0,204,255,0.2)'}`,
            borderRadius: 10,
            color: '#ccd6f6',
            fontSize: 14,
            fontFamily: 'inherit',
            outline: 'none',
            transition: 'border-color 0.2s',
          }}
          onFocus={e => { e.target.style.borderColor = error ? '#ff3366' : 'rgba(0,204,255,0.7)' }}
          onBlur={e  => { e.target.style.borderColor = error ? '#ff3366' : 'rgba(0,204,255,0.2)' }}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow(s => !s)}
            style={{
              position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#4a6080', fontSize: 13, fontFamily: 'inherit', padding: 0,
            }}
          >
            {show ? 'hide' : 'show'}
          </button>
        )}
      </div>
      {error && <div style={{ fontSize: 11, color: '#ff3366', marginTop: 5 }}>{error}</div>}
    </div>
  )
}

// ─── Password strength ────────────────────────────────────────────────────────
function pwStrength(pw) {
  if (!pw) return 0
  let s = 0
  if (pw.length >= 6)  s++
  if (pw.length >= 10) s++
  if (/[0-9]/.test(pw)) s++
  if (/[^a-zA-Z0-9]/.test(pw)) s++
  return s // 0–4
}
const PW_LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong']
const PW_COLORS = ['', '#ff3366', '#ff9800', '#ffeb3b', '#00e676']

function PasswordStrength({ password }) {
  const s = pwStrength(password)
  if (!password) return null
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
        {[1,2,3,4].map(i => (
          <div key={i} style={{
            flex: 1, height: 3, borderRadius: 2,
            background: i <= s ? PW_COLORS[s] : 'rgba(255,255,255,0.06)',
            transition: 'background 0.25s ease',
            boxShadow: i <= s ? `0 0 6px ${PW_COLORS[s]}88` : 'none',
          }} />
        ))}
      </div>
      <div style={{ fontSize: 10, color: PW_COLORS[s], letterSpacing: '1px', textAlign: 'right' }}>
        {PW_LABELS[s]}
      </div>
    </div>
  )
}

// ─── OAuth provider button (stubbed for Phase 2) ──────────────────────────────
function OAuthButton({ provider, label, icon }) {
  const [hover, setHover] = useState(false)
  return (
    <button
      type="button"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => alert(`${provider} sign-in is coming soon.`)}
      title={`${provider} sign-in is coming soon`}
      style={{
        flex: 1,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        padding: '12px 14px',
        background: hover ? 'rgba(0,204,255,0.08)' : 'rgba(4,8,22,0.85)',
        border: `1px solid ${hover ? 'rgba(0,204,255,0.45)' : 'rgba(0,204,255,0.18)'}`,
        borderRadius: 10,
        color: '#a8b2d1',
        fontSize: 12, fontWeight: 'bold',
        letterSpacing: '1px', textTransform: 'uppercase',
        fontFamily: 'inherit',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
    >
      <span style={{ fontSize: 16, lineHeight: 1 }}>{icon}</span>
      <span>{label}</span>
    </button>
  )
}

// ─── "Check your email" pending screen ────────────────────────────────────────
function VerifyPending({ email, username, onBack }) {
  const [resending, setResending] = useState(false)
  const [resent, setResent] = useState(false)
  const [resendErr, setResendErr] = useState('')

  async function handleResend() {
    setResending(true); setResendErr('')
    try {
      await resendVerification(email)
      setResent(true)
    } catch (e) {
      setResendErr(e.message)
    } finally {
      setResending(false)
    }
  }

  return (
    <div style={{ textAlign: 'center', padding: '8px 4px' }}>
      <div style={{
        width: 72, height: 72, margin: '0 auto 22px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,204,255,0.18), rgba(124,77,255,0.05) 70%)',
        border: '1px solid rgba(0,204,255,0.35)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 30, color: '#00ccff',
        boxShadow: '0 0 40px rgba(0,204,255,0.2)',
      }}>
        ✉
      </div>
      <div style={{
        fontSize: 11, letterSpacing: '3px', textTransform: 'uppercase',
        color: 'rgba(0,204,255,0.6)', marginBottom: 10,
      }}>
        Verification Required
      </div>
      <h2 style={{
        fontSize: 18, fontWeight: 900, color: '#fff',
        letterSpacing: '2px', textTransform: 'uppercase',
        margin: '0 0 16px 0',
      }}>
        Check your inbox
      </h2>
      <p style={{ color: '#a8b2d1', fontSize: 13, lineHeight: 1.6, margin: '0 0 8px 0' }}>
        We've sent a verification link to
      </p>
      <p style={{ color: '#00ccff', fontSize: 14, fontWeight: 'bold', margin: '0 0 22px 0', wordBreak: 'break-all' }}>
        {email}
      </p>
      <p style={{ color: '#4a6080', fontSize: 11, lineHeight: 1.6, margin: '0 0 24px 0' }}>
        {username ? <>Welcome, <strong style={{ color: '#a8b2d1' }}>{username}</strong>. </> : null}
        Click the link in the email to activate your account. The link expires in 24 hours.
      </p>

      {resent && (
        <div style={{
          padding: '10px 14px',
          background: 'rgba(0,230,118,0.08)',
          border: '1px solid rgba(0,230,118,0.3)',
          borderRadius: 8,
          color: '#00e676', fontSize: 12,
          marginBottom: 14,
        }}>
          A new verification email is on its way.
        </div>
      )}
      {resendErr && (
        <div style={{
          padding: '10px 14px',
          background: 'rgba(255,51,102,0.1)',
          border: '1px solid rgba(255,51,102,0.3)',
          borderRadius: 8,
          color: '#ff3366', fontSize: 12,
          marginBottom: 14,
        }}>
          {resendErr}
        </div>
      )}

      <button
        type="button"
        onClick={handleResend}
        disabled={resending}
        className="auth-submit"
        style={{
          width: '100%', padding: '14px',
          background: resending ? 'rgba(0,100,130,0.4)' : 'linear-gradient(135deg,#00ccff,#7c4dff)',
          border: 'none', borderRadius: 12, color: '#fff',
          fontSize: 13, fontWeight: 'bold',
          letterSpacing: '2.5px', textTransform: 'uppercase',
          fontFamily: 'inherit',
          boxShadow: '0 8px 30px rgba(0,204,255,0.25)',
          opacity: resending ? 0.7 : 1,
          marginBottom: 12,
        }}
      >
        {resending ? 'Sending…' : 'Resend Email'}
      </button>
      <button
        type="button"
        onClick={onBack}
        style={{
          width: '100%', padding: '12px',
          background: 'transparent',
          border: '1px solid rgba(0,204,255,0.18)',
          borderRadius: 10,
          color: '#4a6080',
          fontSize: 11, fontWeight: 'bold',
          letterSpacing: '2px', textTransform: 'uppercase',
          fontFamily: 'inherit',
          cursor: 'pointer',
        }}
      >
        Back to Sign In
      </button>
    </div>
  )
}

// ─── Inline banner shown after backend redirects from /verify ─────────────────
function VerifyBanner({ status, reason, onDismiss }) {
  const ok = status === 'ok'
  const messages = {
    'ok|verified':  'Your account has been verified. You can sign in now.',
    'ok|already':   'This account is already verified. Please sign in.',
    'error|invalid':'Verification link is invalid.',
    'error|expired':'Verification link has expired. Request a new one below.',
  }
  const msg = messages[`${status}|${reason}`] || (ok ? 'Verified.' : 'Verification failed.')
  return (
    <div style={{
      padding: '12px 16px',
      background: ok ? 'rgba(0,230,118,0.08)' : 'rgba(255,51,102,0.1)',
      border: `1px solid ${ok ? 'rgba(0,230,118,0.35)' : 'rgba(255,51,102,0.3)'}`,
      borderRadius: 10,
      color: ok ? '#00e676' : '#ff3366',
      fontSize: 12, lineHeight: 1.5,
      marginBottom: 18,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
    }}>
      <span>{msg}</span>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="dismiss"
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'inherit', fontSize: 16, padding: 0, lineHeight: 1,
        }}
      >×</button>
    </div>
  )
}

// ─── Main AuthPage ─────────────────────────────────────────────────────────────
export default function AuthPage({ onAuth }) {
  const [mode, setMode]               = useState('login')  // 'login' | 'register'
  const [stage, setStage]             = useState('form')   // 'form' | 'verify-pending'
  const [username, setUsername]       = useState('')
  const [email, setEmail]             = useState('')
  const [password, setPassword]       = useState('')
  const [confirm, setConfirm]         = useState('')
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState('')
  const [fieldErrs, setFieldErrs]     = useState({})
  const [pendingEmail, setPendingEmail] = useState('')
  const [pendingUsername, setPendingUsername] = useState('')
  const [verifyBanner, setVerifyBanner] = useState(null)

  // Pick up ?verify=ok&reason=verified from the backend redirect.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const status = params.get('verify')
    if (status === 'ok' || status === 'error') {
      setVerifyBanner({ status, reason: params.get('reason') || '' })
      params.delete('verify'); params.delete('reason')
      const qs = params.toString()
      window.history.replaceState({}, '', window.location.pathname + (qs ? '?' + qs : ''))
    }
  }, [])

  // Inject CSS
  useEffect(() => {
    const el = document.createElement('style')
    el.id = 'nn-auth-css'
    el.textContent = `
      @keyframes authFadeIn { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
      @keyframes rotateSlow { to{transform:rotate(360deg)} }
      @keyframes rotateRev  { to{transform:rotate(-360deg)} }
      .auth-card { animation: authFadeIn 0.6s ease forwards; }
      .auth-submit { transition: all 0.25s ease; cursor: pointer; }
      .auth-submit:hover:not(:disabled) { transform: translateY(-2px); filter: brightness(1.15); box-shadow: 0 16px 50px rgba(0,204,255,0.45) !important; }
      .auth-submit:active:not(:disabled) { transform: scale(0.97); }
      .auth-tab { cursor: pointer; transition: all 0.2s ease; }
    `
    document.head.appendChild(el)
    return () => { const s=document.getElementById('nn-auth-css'); if(s) s.remove() }
  }, [])

  function validate() {
    const errs = {}
    if (!username.trim()) {
      errs.username = 'Username is required'
    } else if (!/^[A-Za-z0-9_.-]{3,30}$/.test(username.trim()) && !/\S+@\S+\.\S+/.test(username.trim())) {
      errs.username = '3–30 chars: letters, numbers, _ . - (or email address)'
    }
    if (mode === 'register') {
      if (!email.trim())                       errs.email = 'Email is required'
      else if (!/\S+@\S+\.\S+/.test(email))    errs.email = 'Enter a valid email'
    }
    if (!password)                             errs.password = 'Password is required'
    else if (password.length < 6)              errs.password = 'Minimum 6 characters'
    if (mode === 'register' && confirm !== password) errs.confirm = 'Passwords do not match'
    return errs
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    const errs = validate()
    setFieldErrs(errs)
    if (Object.keys(errs).length) return

    setLoading(true)
    try {
      if (mode === 'login') {
        const data = await login(username.trim(), password)
        onAuth(data)
      } else {
        const data = await register(username.trim(), email.trim(), password)
        setPendingEmail(data.email || email.trim())
        setPendingUsername(data.username || username.trim())
        setStage('verify-pending')
      }
    } catch (err) {
      if (err.code === 'EMAIL_NOT_VERIFIED') {
        setPendingEmail(err.email || '')
        setPendingUsername(username.trim())
        setStage('verify-pending')
      } else {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  function switchMode(m) {
    setMode(m); setError(''); setFieldErrs({})
    setPassword(''); setConfirm('')
  }

  function backToForm() {
    setStage('form')
    setError('')
    setPassword(''); setConfirm('')
  }

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: '#020610',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000,
      fontFamily: "'SF Mono','Fira Code',monospace",
    }}>
      <NeuralCanvas />

      {/* Rotating rings */}
      {[[400,'40s','normal','rgba(0,204,255,0.05)'],[260,'25s','reverse','rgba(124,77,255,0.07)']].map(([size,speed,dir,color])=>(
        <div key={size} style={{position:'fixed',width:size,height:size,border:`1px solid ${color}`,borderRadius:'50%',animation:`${dir==='normal'?'rotateSlow':'rotateRev'} ${speed} linear infinite`,pointerEvents:'none',zIndex:1}}/>
      ))}

      {/* Card */}
      <div className="auth-card" style={{
        position: 'relative', zIndex: 2,
        width: '100%', maxWidth: 440,
        margin: '0 20px',
        background: 'rgba(6,10,26,0.92)',
        border: '1px solid rgba(0,204,255,0.15)',
        borderRadius: 20,
        padding: '40px 36px',
        backdropFilter: 'blur(30px)',
        boxShadow: '0 0 80px rgba(0,204,255,0.06), 0 40px 100px rgba(0,0,0,0.6)',
      }}>
        {/* Glow line */}
        <div style={{position:'absolute',top:0,left:20,right:20,height:2,background:'linear-gradient(90deg,transparent,#00ccff,#7c4dff,#ff3366,transparent)',borderRadius:1}}/>

        {/* Brand */}
        <div style={{textAlign:'center',marginBottom:28}}>
          <div style={{fontSize:11,letterSpacing:'5px',color:'rgba(0,204,255,0.5)',textTransform:'uppercase',marginBottom:10}}>
            Neural Intelligence Platform
          </div>
          <h1 style={{fontSize:24,fontWeight:900,letterSpacing:'4px',textTransform:'uppercase',background:'linear-gradient(135deg,#fff 0%,#00ccff 50%,#7c4dff 100%)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text',margin:0}}>
            Male Neural<br/>Network
          </h1>
        </div>

        {stage === 'verify-pending' ? (
          <VerifyPending
            email={pendingEmail}
            username={pendingUsername}
            onBack={backToForm}
          />
        ) : (
          <>
            {verifyBanner && (
              <VerifyBanner
                status={verifyBanner.status}
                reason={verifyBanner.reason}
                onDismiss={() => setVerifyBanner(null)}
              />
            )}

            {/* Mode tabs */}
            <div style={{display:'flex',background:'rgba(0,0,0,0.4)',borderRadius:10,padding:4,marginBottom:24,border:'1px solid rgba(0,204,255,0.1)'}}>
              {[['login','Sign In'],['register','Create Account']].map(([m,label])=>(
                <button key={m} type="button" className="auth-tab" onClick={()=>switchMode(m)} style={{
                  flex:1,padding:'10px 0',background:mode===m?'rgba(0,204,255,0.12)':'transparent',
                  border:mode===m?'1px solid rgba(0,204,255,0.3)':'1px solid transparent',
                  borderRadius:8,color:mode===m?'#00ccff':'#3a4a60',
                  fontSize:12,fontWeight:'bold',letterSpacing:'1.5px',textTransform:'uppercase',
                  fontFamily:'inherit',cursor:'pointer',
                }}>
                  {label}
                </button>
              ))}
            </div>

            {/* OAuth row (Phase 2 stub) */}
            <div style={{display:'flex',gap:10,marginBottom:18}}>
              <OAuthButton provider="Google" label="Google" icon="G" />
              <OAuthButton provider="Apple"  label="Apple"  icon="" />
            </div>

            {/* Divider */}
            <div style={{display:'flex',alignItems:'center',gap:12,margin:'4px 0 20px'}}>
              <div style={{flex:1,height:1,background:'linear-gradient(90deg,transparent,rgba(0,204,255,0.2),transparent)'}}/>
              <div style={{fontSize:10,color:'#3a4a60',letterSpacing:'2px',textTransform:'uppercase'}}>
                or with username
              </div>
              <div style={{flex:1,height:1,background:'linear-gradient(90deg,transparent,rgba(0,204,255,0.2),transparent)'}}/>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate>
              <Field
                label="Username"
                type="text"
                value={username}
                onChange={setUsername}
                placeholder={mode === 'login' ? 'Your username or email' : 'Pick a username'}
                error={fieldErrs.username}
                autoComplete={mode === 'login' ? 'username' : 'username'}
              />

              {mode === 'register' && (
                <Field
                  label="Email address"
                  type="email"
                  value={email}
                  onChange={setEmail}
                  placeholder="you@example.com"
                  error={fieldErrs.email}
                  autoComplete="email"
                />
              )}

              <div>
                <Field
                  label="Password"
                  type="password"
                  value={password}
                  onChange={setPassword}
                  placeholder="Min 6 characters"
                  error={fieldErrs.password}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                />
                {mode === 'register' && <PasswordStrength password={password} />}
              </div>
              {mode === 'register' && (
                <Field
                  label="Confirm Password"
                  type="password"
                  value={confirm}
                  onChange={setConfirm}
                  placeholder="Repeat password"
                  error={fieldErrs.confirm}
                  autoComplete="new-password"
                />
              )}

              {error && (
                <div style={{padding:'12px 16px',background:'rgba(255,51,102,0.1)',border:'1px solid rgba(255,51,102,0.3)',borderRadius:8,color:'#ff3366',fontSize:13,marginBottom:18,lineHeight:1.5}}>
                  {error}
                </div>
              )}

              <button type="submit" className="auth-submit" disabled={loading} style={{
                width:'100%',padding:'16px',marginTop:4,
                background: loading ? 'rgba(0,100,130,0.4)' : 'linear-gradient(135deg,#00ccff,#7c4dff)',
                border:'none',borderRadius:12,color:'#fff',
                fontSize:14,fontWeight:'bold',letterSpacing:'3px',textTransform:'uppercase',
                fontFamily:'inherit',
                boxShadow:'0 8px 30px rgba(0,204,255,0.25)',
                opacity: loading ? 0.7 : 1,
              }}>
                {loading
                  ? '...'
                  : mode === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            {mode === 'register' && (
              <div style={{
                marginTop: 16, fontSize: 10, color: '#3a4a60',
                textAlign: 'center', lineHeight: 1.6, letterSpacing: '0.5px',
              }}>
                After creating your account, we'll email you a verification link.
              </div>
            )}
          </>
        )}

        {/* Security trust badges */}
        <div style={{marginTop:24,display:'flex',justifyContent:'center',gap:10,flexWrap:'wrap'}}>
          {[
            { label: 'Bcrypt',   sub: 'Passwords' },
            { label: 'JWT',      sub: 'Sessions'  },
            { label: 'Verified', sub: 'Email'     },
          ].map(b => (
            <div key={b.label} style={{
              display:'flex',alignItems:'center',gap:6,
              padding:'6px 12px',
              background:'rgba(0,204,255,0.04)',
              border:'1px solid rgba(0,204,255,0.1)',
              borderRadius:8,
            }}>
              <div>
                <div style={{fontSize:10,fontWeight:'bold',color:'rgba(0,204,255,0.55)',letterSpacing:'1px'}}>{b.label}</div>
                <div style={{fontSize:9,color:'#1e2840',letterSpacing:'0.5px'}}>{b.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
