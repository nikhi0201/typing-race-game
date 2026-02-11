# Frontend Socket.IO Event Reference

## Client → Server Events

### Room Management
```javascript
socket.emit('createRoom', { playerName: string })
socket.emit('joinRoom', { roomCode: string, playerName: string })
socket.emit('leaveRoom', { roomCode: string })
```

### Game Control
```javascript
socket.emit('selectTimer', { roomCode: string, timer: number })
// timer: 30 | 60 | 120 | 300

socket.emit('startRace', { roomCode: string, timer: number })
socket.emit('nextRace', { roomCode: string })
```

### Race Progress
```javascript
socket.emit('progress', {
  roomCode: string,
  playerName: string,
  progress: number,        // 0-100
  wpm: number,            // words per minute
  accuracy: number,       // 0-100
  position: number        // characters typed
})

socket.emit('finishRace', {
  roomCode: string,
  playerName: string,
  wpm: number,
  accuracy: number,
  time: number,           // seconds
  charactersTyped: number
})
```

### Leaderboard
```javascript
socket.emit('getLeaderboard')
socket.emit('getSessionLeaderboard', { roomCode: string })
```

## Server → Client Events

### Room Events
```javascript
socket.on('roomCreated', { code: string, roomId: string })
socket.on('roomJoined', { 
  roomId: string, 
  code: string, 
  players: Player[] 
})
socket.on('playerJoined', { 
  count: number, 
  players: Player[] 
})
socket.on('playerLeft', { 
  count: number, 
  players: Player[] 
})
```

### Race Events
```javascript
socket.on('timerSelected', (timer: number))
socket.on('raceStarting', (data: any))
socket.on('raceState', {
  opponents: Opponent[],
  sessionResults: SessionResult[]
})
socket.on('playerFinished', {
  playerId: string,
  wpm: number
})
socket.on('raceFinished', {
  wpm: number,
  accuracy: number,
  time: number,
  placement: number,
  sessionResults: SessionResult[]
})
socket.on('raceEnded')
socket.on('nextRace')
```

### Leaderboard Events
```javascript
socket.on('leaderboard', LeaderboardEntry[])
socket.on('sessionLeaderboard', {
  standings: SessionStanding[],
  stats: {
    raceCount: number,
    playerCount: number
  }
})
```

### Error Handling
```javascript
socket.on('error', (message: string))
```

## Data Type Definitions

### Player
```typescript
{
  id?: string
  name: string
  status?: 'ready' | 'racing' | 'finished'
}
```

### Opponent
```typescript
{
  id: string
  name: string
  progress: number      // 0-100
  wpm: number          // current WPM
  finished?: boolean
  accuracy?: number
}
```

### LeaderboardEntry
```typescript
{
  id?: string
  name: string
  wpm: number
  accuracy: number
  charactersTyped?: number
}
```

### SessionResult / SessionStanding
```typescript
{
  name: string
  wpm: number
  accuracy: number
  time?: number
  placement?: number
  charactersTyped?: number
}
```

## Expected Backend Behavior

1. **Room Creation**
   - Generate unique 6-character room code
   - Store room with created timestamp
   - Emit `roomCreated` with code and roomId

2. **Player Joining**
   - Validate room code
   - Add player to room
   - Emit `playerJoined` to all in room with updated count
   - Emit `roomJoined` to joining player

3. **Race Start**
   - All players in room start simultaneously
   - Emit `raceStarted` to initialize timers
   - Track individual progress via `progress` events

4. **Race Completion**
   - Listen for `finishRace` events
   - Calculate placements based on completion time/WPM
   - Emit `raceFinished` with full stats and placement
   - Update session leaderboard

5. **Leaderboard Updates**
   - Maintain global leaderboard (all-time)
   - Maintain session leaderboard (current room)
   - Update after each race completion
   - Sort by WPM (descending), then accuracy (descending)

6. **Timer Synchronization**
   - Backend controls countdown
   - Auto-finish race when timer reaches 0
   - Emit `raceEnded` to force finish if needed

## Frontend State Management

The frontend maintains these key states:
- `gameState`: menu | lobby | racing | finished
- `roomCode`: Current room identifier
- `playerName`: Player's display name
- `selectedTimer`: Chosen race duration
- `roomPlayers`: List of players in current room
- `isRoomCreator`: Boolean for UI permissions
- `leaderboard`: Global rankings
- `opponents`: Live race opponents
- `raceResult`: Final race statistics

## Notes for Backend Developer

- All WPM calculations use: (correctChars / 5) / (timeInMinutes)
- Accuracy is calculated per session/race, not cumulative
- Session leaderboard resets when creating a new room
- Room codes should be case-insensitive
- Timestamps should be precise for accurate WPM/time calculations
