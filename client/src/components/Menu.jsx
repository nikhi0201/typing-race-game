import React, { useState } from 'react'
import { socket } from '../socket'
import './Menu.css'

export default function Menu({ playerName, playerEmail, onCreateRoom, onJoinRoom }) {
  const [roomCodeInput, setRoomCodeInput] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(null)

  const handleCreateRoom = () => {
    if (!playerName.trim()) {
      setError('Please enter your name first')
      return
    }
    setIsLoading(true)
    setTimeout(() => {
      onCreateRoom()
      setIsLoading(false)
    }, 500)
  }

  const handleJoinRoom = () => {
    if (!roomCodeInput.trim()) {
      setError('Please enter a room code')
      return
    }
    setIsLoading(true)
    socket.emit('joinRoom', { roomCode: roomCodeInput.toUpperCase(), playerName }, (response) => {
      setIsLoading(false)
      if (response && response.success) {
        onJoinRoom(roomCodeInput.toUpperCase())
      } else {
        setError(response?.message || 'Failed to join room')
      }
    })
  }

  return (
    <div className="menu-container">
      {/* Animated Background */}
      <div className="animated-bg">
        <div className="floating-orb orb-1"></div>
        <div className="floating-orb orb-2"></div>
        <div className="floating-orb orb-3"></div>
        <div className="floating-orb orb-4"></div>
        <div className="grid-bg"></div>
      </div>

      {/* Menu Content */}
      <div className="menu-content">
        {/* Header */}
        <div className="menu-header">
          <h1 className="menu-title">⚡ TYPING RACE ⚡</h1>
          <p className="menu-welcome">Welcome, <span>{playerName}</span></p>
        </div>

        {/* Two Button Container */}
        <div className="button-group">
          {/* Create Button */}
          <button 
            className={`menu-button create-button ${isLoading ? 'loading' : ''}`}
            onClick={handleCreateRoom}
            disabled={isLoading}
          >
            <div className="btn-icon">🎮</div>
            <div className="btn-text">
              <h3>CREATE ROOM</h3>
              <p>Start a new race</p>
            </div>
            <div className="btn-arrow">→</div>
          </button>

          {/* Join Button */}
          <button 
            className={`menu-button join-button ${isLoading ? 'loading' : ''}`}
            onClick={handleJoinRoom}
            disabled={isLoading}
          >
            <div className="btn-icon">🚀</div>
            <div className="btn-text">
              <h3>JOIN ROOM</h3>
              <p>Enter room code</p>
            </div>
            <div className="btn-arrow">→</div>
          </button>
        </div>

        {/* Room Code Input */}
        <div className="input-section">
          <input
            type="text"
            className="room-input"
            placeholder="Enter room code (6 characters)"
            value={roomCodeInput}
            onChange={(e) => {
              setRoomCodeInput(e.target.value.toUpperCase())
              setError('')
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') handleJoinRoom()
            }}
            maxLength="6"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-box">
            <span>⚠️ {error}</span>
          </div>
        )}

        {/* Footer */}
        <div className="menu-footer">
          <p>⚡ Fast Typing • 🏆 Competitive • 🎯 Real-time</p>
        </div>
      </div>
    </div>
  )
}
