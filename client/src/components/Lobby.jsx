import React, { useState, useEffect, useRef } from 'react'
import { socket } from '../socket'
import './Lobby.css'

export default function Lobby({
  roomCode,
  playerName,
  playerEmail,
  isRoomCreator,
  roomPlayers,
  onStartRace,
  onLeaveRoom,
}) {
  const [isReady, setIsReady] = useState(false)
  const [countdown, setCountdown] = useState(null)
  const [countdownActive, setCountdownActive] = useState(false)
  const [timerSelected, setTimerSelected] = useState(60)
  const [roomStatus, setRoomStatus] = useState('waiting') // waiting, ready-all, countdown, starting
  const [copied, setCopied] = useState(null)
  const [showPlayers, setShowPlayers] = useState(true)
  const countdownRef = useRef(null)
  const joinWindowRef = useRef(null)

  const TIMER_OPTIONS = [30, 60, 100, 120]

  // Listen for room updates
  useEffect(() => {
    const handlePlayerReadyChanged = (data) => {
      console.log('Player ready status:', data)
    }

    const handleCountdownStarted = (data) => {
      console.log('✅ Countdown started event received:', data)
      setCountdownActive(true)
      setCountdown(10)
      setRoomStatus('countdown')
      
      if (countdownRef.current) clearInterval(countdownRef.current)
      
      let timeLeft = 10
      countdownRef.current = setInterval(() => {
        timeLeft--
        console.log('⏱️ Countdown tick:', timeLeft)
        setCountdown(timeLeft)
        
        if (timeLeft <= 0) {
          console.log('🏁 Countdown finished (timeLeft:', timeLeft, ')')
          clearInterval(countdownRef.current)
          setCountdownActive(false)
          setRoomStatus('starting')
        }
      }, 1000)
    }

    const handlePlayerJoined = (data) => {
      console.log('Player joined, current countdown:', countdown, 'active:', countdownActive)
      if (countdownActive && countdown && countdown <= 5) {
        console.log('Restarting countdown due to new player')
        if (countdownRef.current) clearInterval(countdownRef.current)
        setCountdown(10)
        
        let timeLeft = 10
        countdownRef.current = setInterval(() => {
          timeLeft--
          console.log('Restarted countdown tick:', timeLeft)
          setCountdown(timeLeft)
          
          if (timeLeft <= 0) {
            clearInterval(countdownRef.current)
            setCountdownActive(false)
            setRoomStatus('starting')
          }
        }, 1000)
      }
    }

    const handleError = (msg) => {
      console.error('Room error:', msg)
    }

    socket.on('playerReadyChanged', handlePlayerReadyChanged)
    socket.on('countdownStarted', handleCountdownStarted)
    socket.on('playerJoined', handlePlayerJoined)
    socket.on('error', handleError)

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current)
      socket.off('playerReadyChanged', handlePlayerReadyChanged)
      socket.off('countdownStarted', handleCountdownStarted)
      socket.off('playerJoined', handlePlayerJoined)
      socket.off('error', handleError)
    }
  }, [])

  const handleReady = () => {
    setIsReady(!isReady)
    socket.emit('setPlayerReady', {
      roomId: roomCode,
      isReady: !isReady,
    })

    // Check if all are ready
    const allReady = roomPlayers.every((p) => p.isReady) || isReady
    if (allReady && roomPlayers.length > 0) {
      setRoomStatus('ready-all')
    }
  }

  const handleStartCountdown = () => {
    if (!isRoomCreator) return

    console.log('Starting countdown with timer:', timerSelected)
    socket.emit('startCountdown', {
      roomId: roomCode,
      timerDuration: timerSelected,
    })
  }

  const handleLeave = () => {
    if (countdownRef.current) clearInterval(countdownRef.current)
    socket.emit('leaveRoom', { roomId: roomCode })
    onLeaveRoom()
  }

  const handleSelectTimer = (timer) => {
    setTimerSelected(timer)
    socket.emit('selectTimer', {
      roomId: roomCode,
      timer: timer,
    })
  }

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="lobby-container-new">
      {/* Animated Background */}
      <div className="lobby-bg">
        <div className="lobby-orb lobby-orb-1"></div>
        <div className="lobby-orb lobby-orb-2"></div>
        <div className="lobby-orb lobby-orb-3"></div>
      </div>

      <div className="lobby-wrapper">
        <div className="lobby-card-new">
          {/* Header Section */}
          <div className="lobby-header-new">
            <div className="header-content">
              <h1 className="lobby-title-new">
                <span className="lobby-icon">🎮</span>
                <span>GAME LOBBY</span>
                <span className="lobby-icon">🎮</span>
              </h1>
              <p className="lobby-subtitle-new">Players Unite • Ready to Race</p>
            </div>

            {isRoomCreator && (
              <div className="creator-badge-new">
                <span className="badge-icon">👑</span>
                <span>Room Creator</span>
              </div>
            )}
          </div>

          {/* Room Info Section */}
          <div className="room-info-section">
            <div className="room-info-card">
              <div className="room-code-new">
                <label>📋 Room Code</label>
                <div className="code-display">
                  <span className="code-value">{roomCode}</span>
                  <button
                    className={`copy-btn-new ${copied === 'code' ? 'copied' : ''}`}
                    onClick={() => copyToClipboard(roomCode, 'code')}
                    title="Copy room code"
                  >
                    {copied === 'code' ? '✓' : '📋'}
                  </button>
                </div>
              </div>

              <div className="room-link-new">
                <label>🔗 Share Link</label>
                <div className="link-display">
                  <input
                    type="text"
                    value={`${window.location.origin}?join=${roomCode}`}
                    readOnly
                    className="link-input-new"
                  />
                  <button
                    className={`copy-btn-new ${copied === 'link' ? 'copied' : ''}`}
                    onClick={() =>
                      copyToClipboard(`${window.location.origin}?join=${roomCode}`, 'link')
                    }
                    title="Copy share link"
                  >
                    {copied === 'link' ? '✓' : '📋'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="lobby-content-grid">
            {/* Players Section */}
            <div className="players-section-new">
              <div className="section-header">
                <h2>👥 Players ({roomPlayers.length})</h2>
                <span className="player-count-badge">{roomPlayers.length}</span>
              </div>

              <div className="players-list-new">
                {roomPlayers && roomPlayers.length > 0 ? (
                  roomPlayers.map((player, idx) => (
                    <div key={idx} className={`player-item-new ${player.isReady ? 'ready' : ''}`}>
                      <div className="player-info">
                        <div className="player-avatar">
                          {player.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="player-details">
                          <p className="player-name-new">
                            {player.name}
                            {playerName === player.name && <span className="you-badge">(You)</span>}
                          </p>
                          <p className="player-email-new">{player.email || 'guest'}</p>
                        </div>
                      </div>
                      <div className={`status-badge ${player.isReady ? 'ready-badge' : 'waiting-badge'}`}>
                        {player.isReady ? (
                          <>
                            <span className="status-icon">✓</span>
                            <span>Ready</span>
                          </>
                        ) : (
                          <>
                            <span className="status-icon">⏳</span>
                            <span>Waiting</span>
                          </>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-state-new">
                    <p className="empty-icon">👀</p>
                    <p className="empty-text">Waiting for players...</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="lobby-right-column">
              {/* Your Status */}
              <div className="your-status-section-new">
                <h3>Your Status</h3>
                <button
                  className={`ready-btn-new ${isReady ? 'active' : ''}`}
                  onClick={handleReady}
                >
                  <span className="ready-icon">{isReady ? '✓' : '○'}</span>
                  <span>{isReady ? 'Ready to Race' : 'Mark as Ready'}</span>
                </button>
              </div>

              {/* Countdown Display */}
              {countdownActive && (
                <div className="countdown-section-new">
                  <div className="countdown-container">
                    <div className={`countdown-number-new ${countdown <= 3 ? 'critical' : ''}`}>
                      {countdown}
                    </div>
                    <p className="countdown-text-new">
                      {countdown > 5 ? '🚀 Race Starting' : '⚡ Get Ready'}
                    </p>
                  </div>
                </div>
              )}

              {/* Ready Status Message */}
              {isReady && !countdownActive && (
                <div className="ready-status-section">
                  <div className="ready-message">
                    <p>✓ You're Ready!</p>
                    <p className="ready-subtext">Waiting for other players...</p>
                  </div>
                </div>
              )}

              {/* Timer Selection */}
              {isRoomCreator && !countdownActive && (
                <div className="timer-selection-section-new">
                  <h3>Game Duration</h3>
                  <div className="timer-buttons-new">
                    {TIMER_OPTIONS.map((timer) => (
                      <button
                        key={timer}
                        className={`timer-btn-new ${timerSelected === timer ? 'active' : ''}`}
                        onClick={() => handleSelectTimer(timer)}
                      >
                        {timer}s
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Start Button */}
              {isRoomCreator &&
                !countdownActive &&
                roomPlayers &&
                roomPlayers.length > 0 && (
                  <button
                    className="start-game-btn-new"
                    onClick={handleStartCountdown}
                  >
                    <span className="btn-icon">🚀</span>
                    <span>Start Game</span>
                  </button>
                )}
            </div>
          </div>

          {/* Footer */}
          <div className="lobby-footer-new">
            <button className="leave-btn-new" onClick={handleLeave}>
              <span>👋</span>
              <span>Leave Room</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
