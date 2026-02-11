import React, { useState, useEffect, useCallback } from 'react'
import { socket } from './socket'
import RaceTrack from './components/RaceTrack'
import Leaderboard from './components/Leaderboard'
import Auth from './components/Auth'
import SplashScreen from './components/SplashScreen'
import Menu from './components/Menu'
import Lobby from './components/Lobby'
import './styles.css'

function App() {
  const [gameState, setGameState] = useState('splash') // splash, auth, menu, lobby, timer-select, racing, finished
  const [playerName, setPlayerName] = useState('')
  const [playerEmail, setPlayerEmail] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [roomId, setRoomId] = useState('')
  const [roomCode, setRoomCode] = useState('')
  const [error, setError] = useState('')
  const [playerCount, setPlayerCount] = useState(0)
  const [raceResult, setRaceResult] = useState(null)
  const [selectedTimer, setSelectedTimer] = useState(60)
  const [roomPlayers, setRoomPlayers] = useState([])
  const [isRoomCreator, setIsRoomCreator] = useState(false)
  const [raceSession, setRaceSession] = useState(null)

  const TIMER_OPTIONS = [30, 60, 120, 300]

  useEffect(() => {
    const handleRoomCreated = (data) => {
      setRoomCode(data.code)
      setRoomId(data.roomId)
      setIsRoomCreator(true)
      setGameState('lobby')
      setError('')
      setRoomPlayers([{ name: playerName, status: 'ready' }])
    }

    const handleRoomJoined = (data) => {
      setRoomId(data.roomId)
      setRoomCode(data.code)
      setIsRoomCreator(false)
      setGameState('lobby')
      setError('')
      setRoomPlayers(data.players || [{ name: playerName }])
    }

    const handlePlayerJoined = (data) => {
      setPlayerCount(data.count)
      setRoomPlayers(data.players || [])
    }

    const handlePlayerLeft = (data) => {
      setPlayerCount(data.count)
      setRoomPlayers(data.players || [])
    }

    const handleTimerSelected = (timer) => {
      setSelectedTimer(timer)
    }

    const handleRaceStarting = (data) => {
      console.log('🏁 RACE STARTING EVENT RECEIVED:', data)
      setRaceSession(data)
      setGameState('racing')
      console.log('✅ Game state WILL change to racing')
    }

    const handleRaceFinished = (result) => {
      setRaceResult(result)
      setGameState('finished')
    }

    const handleNextRace = () => {
      setRaceResult(null)
      setGameState('lobby')
    }

    const handleError = (msg) => {
      setError(msg)
      setTimeout(() => setError(''), 5000)
    }

    socket.on('roomCreated', handleRoomCreated)
    socket.on('roomJoined', handleRoomJoined)
    socket.on('playerJoined', handlePlayerJoined)
    socket.on('playerLeft', handlePlayerLeft)
    socket.on('timerSelected', handleTimerSelected)
    socket.on('raceStarting', handleRaceStarting)
    socket.on('raceFinished', handleRaceFinished)
    socket.on('nextRace', handleNextRace)
    socket.on('error', handleError)

    return () => {
      socket.off('roomCreated', handleRoomCreated)
      socket.off('roomJoined', handleRoomJoined)
      socket.off('playerJoined', handlePlayerJoined)
      socket.off('playerLeft', handlePlayerLeft)
      socket.off('timerSelected', handleTimerSelected)
      socket.off('raceStarting', handleRaceStarting)
      socket.off('raceFinished', handleRaceFinished)
      socket.off('nextRace', handleNextRace)
      socket.off('error', handleError)
    }
  }, [])

  const handleCreateRoom = useCallback(() => {
    if (!playerName.trim()) {
      setError('Please enter your name')
      return
    }
    socket.emit('createRoom', { playerName }, (response) => {
      if (response && response.success) {
        console.log('Room created:', response.code)
      } else {
        setError(response?.message || 'Failed to create room')
      }
    })
  }, [playerName])

  const handleJoinRoom = useCallback(() => {
    if (!playerName.trim()) {
      setError('Please enter your name')
      return
    }
    if (!roomCode.trim()) {
      setError('Please enter a room code')
      return
    }
    socket.emit('joinRoom', { roomCode: roomCode.toUpperCase(), playerName }, (response) => {
      if (response && response.success) {
        console.log('Joined room:', response.code)
      } else {
        setError(response?.message || 'Failed to join room')
      }
    })
  }, [playerName, roomCode])

  const handleSelectTimer = useCallback((timer) => {
    setSelectedTimer(timer)
    socket.emit('selectTimer', { roomCode, timer })
  }, [roomCode])

  const handleStartRace = useCallback(() => {
    if (playerCount < 1 && !isRoomCreator) {
      setError('Waiting for other players...')
      return
    }
    socket.emit('startRace', { roomCode, timer: selectedTimer })
  }, [roomCode, playerCount, selectedTimer, isRoomCreator])

  const handlePlayAgain = useCallback(() => {
    socket.emit('nextRace', { roomCode })
    setRaceResult(null)
    setGameState('lobby')
  }, [roomCode])

  const handleLeaveRoom = useCallback(() => {
    socket.emit('leaveRoom', { roomCode })
    setGameState('menu')
    setRoomCode('')
    setRoomId('')
    setPlayerCount(0)
    setRoomPlayers([])
    setIsRoomCreator(false)
    setError('')
  }, [roomCode])

  const handleAuthSuccess = (user) => {
    setPlayerName(user.displayName || user.email || user.phone)
    setPlayerEmail(user.email || user.phone)
    setIsAuthenticated(true)
    setGameState('menu')
    setError('')
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setGameState('auth')
    setPlayerName('')
    setPlayerEmail('')
    setRoomCode('')
    setRoomId('')
    setRoomPlayers([])
    setError('')
  }

  if (gameState === 'splash') {
    return <SplashScreen onComplete={() => setGameState('auth')} />
  }

  if (gameState === 'auth') {
    return <Auth onAuthSuccess={handleAuthSuccess} />
  }

  if (gameState === 'menu') {
    return (
      <Menu
        playerName={playerName}
        playerEmail={playerEmail}
        onCreateRoom={handleCreateRoom}
        onJoinRoom={(code) => {
          setRoomCode(code)
          setGameState('lobby')
        }}
      />
    )
  }

  if (gameState === 'lobby') {
    return (
      <Lobby
        roomCode={roomCode}
        playerName={playerName}
        playerEmail={playerEmail}
        isRoomCreator={isRoomCreator}
        roomPlayers={roomPlayers}
        onStartRace={() => socket.emit('startRace', { roomCode, timer: selectedTimer })}
        onLeaveRoom={handleLeaveRoom}
      />
    )
  }

  if (gameState === 'racing') {
    return (
      <RaceTrack
        roomCode={roomCode}
        playerName={playerName}
        timer={raceSession?.timer || selectedTimer}
        onFinish={(result) => {
          setRaceResult(result)
          setGameState('finished')
        }}
      />
    )
  }

  if (gameState === 'finished' && raceResult) {
    return (
      <div className="results-container">
        <div className="results-card">
          <h2>🏁 Race Finished!</h2>

          <div className="results-grid">
            <div className="result-item">
              <div className="result-label">WPM</div>
              <div className="result-value">{raceResult.wpm}</div>
            </div>
            <div className="result-item">
              <div className="result-label">Accuracy</div>
              <div className="result-value">{raceResult.accuracy}%</div>
            </div>
            <div className="result-item">
              <div className="result-label">Time</div>
              <div className="result-value">{raceResult.time}s</div>
            </div>
          </div>

          {raceResult.placement && (
            <div className={`placement placement-${raceResult.placement}`}>
              {raceResult.placement === 1 ? '🥇 1st Place!' : `${raceResult.placement}th Place`}
            </div>
          )}

          <div className="session-leaderboard">
            <h3>Current Session Results</h3>
            <div className="session-table">
              {raceResult.sessionResults &&
                raceResult.sessionResults.map((entry, idx) => (
                  <div key={idx} className="session-row">
                    <span className="session-rank">#{idx + 1}</span>
                    <span className="session-name">{entry.name}</span>
                    <span className="session-wpm">{entry.wpm} WPM</span>
                    <span className="session-accuracy">{entry.accuracy}%</span>
                  </div>
                ))}
            </div>
          </div>

          <div className="results-actions">
            <button onClick={() => setGameState('lobby')} className="btn btn-primary">
              Next Race
            </button>
            <button onClick={handleLeaveRoom} className="btn btn-ghost">
              Leave Room
            </button>
          </div>

          <Leaderboard sessionMode={true} roomCode={roomCode} />
        </div>
      </div>
    )
  }
}

export default App


