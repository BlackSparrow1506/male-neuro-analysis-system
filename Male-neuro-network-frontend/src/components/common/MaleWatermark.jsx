import React from 'react'

export default function MaleWatermark() {
  return (
    <div style={{
      position: 'absolute',
      fontSize: 520,
      color: 'rgba(0,204,255,0.028)',
      fontWeight: 900,
      lineHeight: 1,
      pointerEvents: 'none',
      zIndex: 0,
      userSelect: 'none',
      transform: 'translate(170px, -50px)',
      fontFamily: 'serif',
    }}>♂</div>
  )
}
