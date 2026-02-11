import React, { useState, useEffect } from 'react'

export default function SplashScreen({ onComplete }) {
  const [displayText, setDisplayText] = useState('')
  const mainText = 'Typing Speed Race'
  const [racingTexts, setRacingTexts] = useState([
    { text: '', fullText: 'Fast Fingers', progress: 0 },
    { text: '', fullText: 'Break Records', progress: 0 },
    { text: '', fullText: 'Champion Typist', progress: 0 },
  ])
  const [phase, setPhase] = useState('typing')
  const [cursorVisible, setCursorVisible] = useState(true)

  useEffect(() => {
    if (phase === 'typing') {
      let currentIndex = 0
      const typeInterval = setInterval(() => {
        if (currentIndex <= mainText.length) {
          setDisplayText(mainText.substring(0, currentIndex))
          currentIndex++
        } else {
          clearInterval(typeInterval)
          setPhase('racing')
        }
      }, 100)

      return () => clearInterval(typeInterval)
    }
  }, [phase])

  useEffect(() => {
    if (phase === 'racing') {
      const racingInterval = setInterval(() => {
        setRacingTexts((prev) =>
          prev.map((item) => {
            const newProgress = item.progress + 1
            return {
              ...item,
              progress: newProgress > item.fullText.length ? 0 : newProgress,
              text: item.fullText.substring(0, Math.min(newProgress, item.fullText.length)),
            }
          })
        )
      }, 80)

      return () => clearInterval(racingInterval)
    }
  }, [phase])

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setCursorVisible((prev) => !prev)
    }, 500)
    return () => clearInterval(cursorInterval)
  }, [])

  useEffect(() => {
    if (phase === 'racing') {
      const completeTimer = setTimeout(() => {
        setPhase('fade')
      }, 3000)

      return () => clearTimeout(completeTimer)
    }
  }, [phase])

  useEffect(() => {
    if (phase === 'fade') {
      const fadeTimer = setTimeout(() => {
        onComplete()
      }, 1000)

      return () => clearTimeout(fadeTimer)
    }
  }, [phase, onComplete])

  return (
    <div className={`splash-screen ${phase === 'fade' ? 'fade-out' : ''}`}>
      <div className="splash-background">
        <div className="splash-orb splash-orb-1"></div>
        <div className="splash-orb splash-orb-2"></div>
        <div className="splash-orb splash-orb-3"></div>
      </div>

      <div className="splash-content">
        <div className="splash-icon">⚡</div>
        <h1 className="splash-title">
          {displayText}
          {phase === 'typing' && <span className={`cursor ${cursorVisible ? 'visible' : ''}`}>|</span>}
        </h1>

        {phase === 'racing' && (
          <div className="racing-container">
            {racingTexts.map((item, index) => (
              <div key={index} className="racing-text">
                <span className="racing-label">Player {index + 1}:</span>
                <span className="racing-content">
                  {item.text}
                  {item.progress < item.fullText.length && <span className="cursor">|</span>}
                </span>
              </div>
            ))}
          </div>
        )}

        {phase !== 'fade' && phase !== 'racing' && (
          <p className="splash-subtitle">Master Your Typing Speed</p>
        )}

        {phase === 'typing' && (
          <div className="splash-loading">
            <div className="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
