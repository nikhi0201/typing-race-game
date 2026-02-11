import React, { useEffect, useState } from 'react'
import { socket } from '../socket'

export default function Leaderboard({ sessionMode = false, roomCode = null }) {
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)
  const [sessionStats, setSessionStats] = useState(null)

  useEffect(() => {
    const fetchLeaderboard = () => {
      if (sessionMode && roomCode) {
        socket.emit('getLeaderboard', { mode: 'session', roomCode }, (data) => {
          if (data.success) {
            setLeaderboard(data.leaderboard || [])
          }
          setLoading(false)
        })
      } else {
        socket.emit('getLeaderboard', { mode: 'global' }, (data) => {
          if (data.success) {
            setLeaderboard(data.leaderboard || [])
          }
          setLoading(false)
        })
      }
    }

    fetchLeaderboard()

    const interval = setInterval(fetchLeaderboard, 3000)

    return () => {
      clearInterval(interval)
    }
  }, [sessionMode, roomCode])

  const getMedalEmoji = (rank) => {
    switch (rank) {
      case 1:
        return '🥇'
      case 2:
        return '🥈'
      case 3:
        return '🥉'
      default:
        return '•'
    }
  }

  return (
    <div className="leaderboard-container">
      <div className="leaderboard-card">
        <h3>{sessionMode ? '📊 Session Standings' : '🏆 Global Leaderboard'}</h3>
        
        {sessionStats && sessionMode && (
          <div className="session-stats">
            <div className="stat-pill">
              <span className="stat-label">Races</span>
              <span className="stat-value">{sessionStats.raceCount || 1}</span>
            </div>
            <div className="stat-pill">
              <span className="stat-label">Players</span>
              <span className="stat-value">{sessionStats.playerCount || 0}</span>
            </div>
          </div>
        )}
        
        {loading ? (
          <div className="loading">Loading leaderboard...</div>
        ) : leaderboard.length === 0 ? (
          <div className="empty-state">
            <p>{sessionMode ? 'No races yet. Be the first!' : 'No players yet.'}</p>
          </div>
        ) : (
          <div className="leaderboard-list">
            {leaderboard.slice(0, 10).map((entry, index) => (
              <div key={entry.id || index} className="leaderboard-entry">
                <div className="rank">
                  <span className="medal">{getMedalEmoji(index + 1)}</span>
                  <span className="number">#{index + 1}</span>
                </div>
                <div className="player-info">
                  <span className="player-name">{entry.name || 'Unknown'}</span>
                  <span className="player-stats">
                    {entry.accuracy || 0}% • {entry.wpm || 0} WPM
                  </span>
                </div>
                <div className="wpm-badge">{entry.wpm || '-'} WPM</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}