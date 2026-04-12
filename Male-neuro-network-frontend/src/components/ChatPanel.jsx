import { useState, useRef, useEffect, useCallback } from 'react'
import { sendChatMessage, fetchChatHistory, synthesizeSpeech } from '../api'

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

let currentAudio = null

async function speakText(text) {
  try {
    // Stop any currently playing audio
    if (currentAudio) {
      currentAudio.pause()
      currentAudio = null
    }
    const url = await synthesizeSpeech(text)
    const audio = new Audio(url)
    currentAudio = audio
    audio.play()
    audio.onended = () => URL.revokeObjectURL(url)
  } catch {
    // Fallback to browser voice if ElevenLabs fails
    if (!window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.92
    utterance.pitch = 0.85
    window.speechSynthesis.speak(utterance)
  }
}

export default function ChatPanel({ profileId, onClearChat }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [ttsEnabled, setTtsEnabled] = useState(true)
  const [micSupported] = useState(() => !!SpeechRecognition)
  const scrollRef = useRef()
  const recognitionRef = useRef(null)
  const ttsEnabledRef = useRef(true)

  useEffect(() => {
    ttsEnabledRef.current = ttsEnabled
  }, [ttsEnabled])

  useEffect(() => {
    if (!profileId) return
    fetchChatHistory(profileId)
      .then(setMessages)
      .catch(() => setMessages([]))
  }, [profileId])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  // Cleanup recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
        recognitionRef.current = null
      }
    }
  }, [])

  async function handleSend(text) {
    const msg = (text || input).trim()
    if (!msg || !profileId) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: msg, timestamp: new Date().toISOString() }])
    setLoading(true)
    try {
      const reply = await sendChatMessage(profileId, msg)
      setMessages(prev => [...prev, reply])
      if (ttsEnabledRef.current && reply.content) {
        speakText(reply.content)
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error: Could not reach backend.', timestamp: new Date().toISOString() }])
    }
    setLoading(false)
  }

  function handleSubmit(e) {
    e.preventDefault()
    handleSend()
  }

  const toggleListening = useCallback(() => {
    if (!micSupported) return

    if (isListening) {
      // Stop listening
      if (recognitionRef.current) {
        recognitionRef.current.stop()
        recognitionRef.current = null
      }
      setIsListening(false)
      return
    }

    // Start listening
    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'
    recognitionRef.current = recognition

    let finalTranscript = ''

    recognition.onresult = (event) => {
      let interim = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' '
        } else {
          interim = transcript
        }
      }
      setInput(finalTranscript + interim)
    }

    recognition.onend = () => {
      // Auto-send the accumulated transcript when speech ends
      const text = finalTranscript.trim()
      if (text) {
        handleSend(text)
        finalTranscript = ''
      }
      setIsListening(false)
      recognitionRef.current = null
    }

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error)
      setIsListening(false)
      recognitionRef.current = null
    }

    recognition.start()
    setIsListening(true)
    setInput('')
  }, [isListening, micSupported, profileId])

  if (!profileId) {
    return (
      <div style={styles.panel}>
        <div style={styles.empty}>Select or create a profile to begin neural analysis.</div>
      </div>
    )
  }

  return (
    <div style={styles.panel}>
      <div style={styles.header}>
        <span>Neural Analysis Chat</span>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <button
            style={{
              ...styles.clearBtn,
              borderColor: ttsEnabled ? '#00ccff' : '#1a3a5c',
              color: ttsEnabled ? '#00ccff' : '#4a5568',
            }}
            onClick={() => {
              if (ttsEnabled) {
                if (currentAudio) { currentAudio.pause(); currentAudio = null }
                window.speechSynthesis && window.speechSynthesis.cancel()
              }
              setTtsEnabled(v => !v)
            }}
            title={ttsEnabled ? 'Pause AI voice' : 'Resume AI voice'}
          >
            {ttsEnabled ? (
              // Speaker on icon
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
              </svg>
            ) : (
              // Speaker off icon
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
              </svg>
            )}
          </button>
          <button
            style={styles.clearBtn}
            onClick={() => {
              if (window.confirm('Clear all chat messages and start a new conversation?')) {
                onClearChat()
              }
            }}
            title="Start new chat"
          >
            New Chat
          </button>
        </div>
      </div>
      <div style={styles.messages} ref={scrollRef}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            ...styles.message,
            alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
            background: msg.role === 'user' ? '#0a3d6b' : '#1a1a2e',
            borderLeft: msg.role === 'assistant' ? '3px solid #00ffff' : 'none',
          }}>
            <div style={styles.msgRole}>{msg.role === 'user' ? 'You' : 'Neural AI'}</div>
            <div style={styles.msgContent}>{msg.content}</div>
          </div>
        ))}
        {loading && (
          <div style={{ ...styles.message, background: '#1a1a2e', borderLeft: '3px solid #00ffff' }}>
            <div style={styles.msgRole}>Neural AI</div>
            <div style={{ ...styles.msgContent, color: '#666' }}>Analyzing neural patterns...</div>
          </div>
        )}
      </div>

      {/* Input area */}
      <div style={styles.inputArea}>
        {/* Live transcript preview */}
        {isListening && input && (
          <div style={styles.transcript}>
            <div style={styles.transcriptLabel}>Live transcript</div>
            <div style={styles.transcriptText}>{input}</div>
          </div>
        )}

        <form style={styles.inputRow} onSubmit={handleSubmit}>
          <input
            style={styles.input}
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={isListening ? 'Listening...' : 'Type a message...'}
            disabled={loading || isListening}
          />
          {/* Mic button — beside Send */}
          <button
            type="button"
            style={{
              ...styles.micBtn,
              background: isListening ? '#ff1744' : '#0a0a1a',
              border: `1px solid ${isListening ? '#ff1744' : '#1a3a5c'}`,
              boxShadow: isListening ? '0 0 12px #ff174466' : 'none',
              animation: isListening ? 'micPulse 1.5s ease-in-out infinite' : 'none',
            }}
            onClick={toggleListening}
            disabled={loading || !micSupported}
            title={isListening ? 'Stop listening' : 'Start speaking'}
          >
            {isListening ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#00ccff">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
              </svg>
            )}
          </button>
          <button style={styles.sendBtn} type="submit" disabled={loading || isListening || !input.trim()}>
            Send
          </button>
        </form>
      </div>

      {/* Keyframe animation for mic pulse */}
      <style>{`
        @keyframes micPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
      `}</style>
    </div>
  )
}

const styles = {
  panel: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    minHeight: 0,
    overflow: 'hidden', /* keeps inputArea pinned at bottom */
    background: 'rgba(10, 10, 20, 0.95)',
    borderLeft: '1px solid #1a3a5c',
  },
  header: {
    padding: '12px 16px',
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#00ffff',
    borderBottom: '1px solid #1a3a5c',
    textTransform: 'uppercase',
    letterSpacing: '2px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexShrink: 0,
  },
  clearBtn: {
    padding: '4px 10px',
    background: 'transparent',
    border: '1px solid #1a3a5c',
    borderRadius: '4px',
    color: '#8892b0',
    fontSize: '10px',
    cursor: 'pointer',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    fontFamily: 'inherit',
  },
  messages: {
    flex: 1,
    overflowY: 'auto',
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  message: {
    padding: '10px 14px',
    borderRadius: '8px',
    maxWidth: '90%',
  },
  msgRole: {
    fontSize: '10px',
    color: '#00ffff',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: '4px',
  },
  msgContent: {
    fontSize: '13px',
    color: '#ccd6f6',
    lineHeight: '1.5',
    whiteSpace: 'pre-wrap',
  },
  inputArea: {
    borderTop: '1px solid #1a3a5c',
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    flexShrink: 0, /* never compress — always visible at bottom */
  },
  micSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 0',
  },
  micBtn: {
    width: '36px',
    height: '36px',
    borderRadius: '6px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease',
    flexShrink: 0,
  },
  transcript: {
    background: 'rgba(0, 204, 255, 0.05)',
    border: '1px solid #1a3a5c',
    borderRadius: '6px',
    padding: '8px 12px',
  },
  transcriptLabel: {
    fontSize: '9px',
    color: '#00ccff',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: '4px',
  },
  transcriptText: {
    fontSize: '12px',
    color: '#ccd6f6',
    lineHeight: '1.4',
    fontStyle: 'italic',
  },
  inputRow: {
    display: 'flex',
    gap: '8px',
  },
  input: {
    flex: 1,
    padding: '8px 12px',
    background: '#0a0a1a',
    border: '1px solid #1a3a5c',
    borderRadius: '6px',
    color: '#ccd6f6',
    fontSize: '12px',
    outline: 'none',
    fontFamily: 'inherit',
  },
  sendBtn: {
    padding: '8px 14px',
    background: '#00ccff',
    color: '#000',
    border: 'none',
    borderRadius: '6px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '12px',
    fontFamily: 'inherit',
    opacity: 1,
  },
  empty: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#4a5568',
    fontSize: '14px',
    padding: '20px',
    textAlign: 'center',
  },
}
