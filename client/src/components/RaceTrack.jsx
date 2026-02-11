import React, { useEffect, useRef, useState, useCallback } from 'react'
import { socket } from '../socket'

const PASSAGES = [
  'The quick brown fox jumps over the lazy dog.\nShe moves with grace and speed through the forest.\nNothing can stop her natural agility.',
  'Pack my box with five dozen liquor jugs.\nEach bottle is carefully placed inside the container.\nThe task is completed with precision and care.',
  'Sphinx of black quartz, judge my vow.\nThis ancient monument stands tall against time.\nIts mysteries remain unsolved through the ages.',
  'How razorback-jumping frogs can level six piqued gymnasts!\nThey leap with incredible height and distance.\nTheir athletic abilities never cease to amaze.',
  'Bright vixens jump; dozy fowl quack loudly.\nThe animals gather in the early morning hours.\nNature puts on its daily spectacular show.',
  'Jackdaws love my big sphinx of quartz.\nThese clever birds are attracted to shiny objects.\nThey collect treasures in their hidden nests.',
  'The five boxing wizards jump quickly over obstacles.\nThey train every single day to perfect their craft.\nSpeed and precision are their greatest strengths.',
  'Crazy Fredrick bought many very exquisite opal jewels.\nHe displays them in his grand marble collection room.\nEach stone sparkles with brilliant colors and light.',
  'We promptly judged antique ivory buckles for the next prize.\nThe craftmanship displayed exceptional skill and artistry.\nThe competition revealed remarkable talent among contestants.',
  'The jay, pig, fox, zebra and my wolves quack loudly.\nThey gather together in the peaceful meadow each morning.\nTogether they form an unlikely family of friends.',
]

export default function RaceTrack({ roomCode, playerName, timer = 60, onFinish }) {
  const [passage, setPassage] = useState('')
  const [input, setInput] = useState('')
  const [timeLeft, setTimeLeft] = useState(timer)
  const [raceState, setRaceState] = useState({})
  const [isFinished, setIsFinished] = useState(false)
  const [opponents, setOpponents] = useState([])
  const [raceStartTime, setRaceStartTime] = useState(null)
  
  const startTimeRef = useRef(null)
  const timerRef = useRef(null)
  const correctCharsRef = useRef(0)

  useEffect(() => {
    const randomPassage = PASSAGES[Math.floor(Math.random() * PASSAGES.length)]
    setPassage(randomPassage)
    setTimeLeft(timer)

    // START TIMER IMMEDIATELY when component mounts
    console.log('🎯 RaceTrack mounted - Starting typing timer immediately!')
    startTimeRef.current = Date.now()
    setRaceStartTime(Date.now())
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          finishRaceRef.current()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    const handleRaceState = (state) => {
      setRaceState(state)
      setOpponents(state.opponents || [])
    }

    const handleRaceStarted = () => {
      console.log('🎯 RaceStarted event received (already running)')
    }

    const handlePlayerFinished = (data) => {
      setRaceState((prev) => ({
        ...prev,
        opponents: prev.opponents?.map((opp) =>
          opp.id === data.playerId ? { ...opp, finished: true, wpm: data.wpm } : opp
        ) || [],
      }))
    }

    const handleRaceEnded = () => {
      if (timerRef.current) clearInterval(timerRef.current)
      finishRaceRef.current()
    }

    socket.on('raceState', handleRaceState)
    socket.on('raceStarted', handleRaceStarted)
    socket.on('playerFinished', handlePlayerFinished)
    socket.on('raceEnded', handleRaceEnded)

    return () => {
      socket.off('raceState', handleRaceState)
      socket.off('raceStarted', handleRaceStarted)
      socket.off('playerFinished', handlePlayerFinished)
      socket.off('raceEnded', handleRaceEnded)
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [timer])

  const calculateWPM = useCallback(() => {
    const timeElapsed = startTimeRef.current ? (Date.now() - startTimeRef.current) / 1000 : 0
    if (timeElapsed < 1) return 0
    const minutes = timeElapsed / 60
    const words = correctCharsRef.current / 5
    return Math.round(words / Math.max(minutes, 0.0001))
  }, [])

  const calculateAccuracy = useCallback(() => {
    if (input.length === 0) return 100
    const correct = Array.from(input).filter((char, i) => char === passage[i]).length
    return Math.round((correct / input.length) * 100)
  }, [input, passage])

  const finishRaceRef = useRef(null)
  finishRaceRef.current = () => {
    if (isFinished) return
    if (timerRef.current) clearInterval(timerRef.current)
    finishRace()
  }

  const handleInputChange = (e) => {
    if (isFinished) {
      return
    }

    const value = e.target.value
    setInput(value)

    const correct = Array.from(value).filter((char, i) => char === passage[i]).length
    correctCharsRef.current = correct

    if (startTimeRef.current) {
      const timeElapsed = Math.max((Date.now() - startTimeRef.current) / 1000, 0.1)
      const wpm = calculateWPM()
      const accuracy = calculateAccuracy()

      socket.emit('progress', {
        roomCode,
        playerName,
        progress: (value.length / passage.length) * 100,
        wpm,
        accuracy,
        position: value.length,
      })
    }

    // Finish if passage completed
    if (value === passage && passage.length > 0) {
      finishRace()
    }
  }

  const finishRace = useCallback(() => {
    if (isFinished) return

    if (timerRef.current) clearInterval(timerRef.current)

    const wpm = calculateWPM()
    const accuracy = calculateAccuracy()
    const timeElapsed = startTimeRef.current ? Math.round((Date.now() - startTimeRef.current) / 1000) : 0

    socket.emit('finishRace', {
      roomCode,
      playerName,
      wpm: Math.max(0, wpm),
      accuracy,
      time: timeElapsed,
      charactersTyped: input.length,
    })

    setIsFinished(true)

    onFinish({
      wpm: Math.max(0, wpm),
      accuracy,
      time: timeElapsed,
      placement: raceState.placement || 1,
      sessionResults: raceState.sessionResults || [],
    })
  }, [isFinished, roomCode, playerName, input.length, calculateWPM, calculateAccuracy, onFinish, raceState])

  const progress = (input.length / passage.length) * 100
  const accuracy = calculateAccuracy()
  const wpm = calculateWPM()
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${String(secs).padStart(2, '0')}`
  }

  return (
    <div className="race-container">
      <div className="race-header">
        <div className="timer" style={{ color: timeLeft <= 10 ? '#ff4d4d' : '#00c6ff' }}>
          ⏱️ {formatTime(timeLeft)}
        </div>
        <div className="stats">
          <div className="stat">
            <span className="stat-label">WPM</span>
            <span className="stat-value">{wpm}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Accuracy</span>
            <span className="stat-value">{accuracy}%</span>
          </div>
          <div className="stat">
            <span className="stat-label">Progress</span>
            <span className="stat-value">{Math.round(progress)}%</span>
          </div>
        </div>
      </div>

      <div className="race-content">
        <div className="passage-display">
          {passage.split('\n').map((line, lineIndex) => (
            <div key={lineIndex} style={{ marginBottom: '10px' }}>
              {line.split('').map((char, charIndex) => {
                const globalIndex = passage.split('\n').slice(0, lineIndex).join('\n').length + (lineIndex > 0 ? lineIndex : 0) + charIndex
                let className = 'char'
                if (globalIndex < input.length) {
                  className += char === input[globalIndex] ? ' correct' : ' wrong'
                } else if (globalIndex === input.length) {
                  className += ' cursor'
                }
                return (
                  <span key={charIndex} className={className}>
                    {char}
                  </span>
                )
              })}
            </div>
          ))}
        </div>

        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${Math.min(progress, 100)}%` }}></div>
        </div>

        <textarea
          className="input-textarea"
          value={input}
          onChange={handleInputChange}
          placeholder="Click here and start typing..."
          disabled={isFinished}
          autoFocus
        />

        {isFinished && (
          <div className="finish-message">
            <h3>✅ Race Finished!</h3>
            <p>Final WPM: {wpm} | Final Accuracy: {accuracy}%</p>
          </div>
        )}

        {timeLeft === 0 && !isFinished && (
          <div className="finish-message error">
            <h3>⏰ Time's Up!</h3>
            <p>Your final score has been recorded.</p>
          </div>
        )}

        <div className="opponents-list">
          <h4>Live Opponents</h4>
          {opponents.length > 0 ? (
            <ul>
              {opponents.map((opp, idx) => (
                <li key={idx} className={`opponent-item ${opp.finished ? 'finished' : ''}`}>
                  <span className="opponent-name">{opp.name}</span>
                  <span className="opponent-progress">{Math.round(opp.progress || 0)}%</span>
                  <span className="opponent-wpm">{opp.wpm || '-'} WPM</span>
                  {opp.finished && <span className="finished-badge">✓</span>}
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-opponents">No opponents in this race</p>
          )}
        </div>
      </div>
    </div>
  )
}