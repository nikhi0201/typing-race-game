# Backend Implementation - Complete

## Overview
Full Node.js + Express + Socket.IO backend implementation with authentication, room management, race management, and leaderboard system.

## Features Implemented

### ✅ Authentication System
- **Signup**: Create account with email/phone and password
- **Login**: Authenticate with email/phone and password
- **Password Hashing**: SHA-256 encryption for security
- **User Tokens**: Unique session identifiers
- **User Stats Tracking**: WPM, accuracy, total races, wins

### ✅ Room Management
- **Create Room**: Generate unique room codes (6-character alphanumeric)
- **Join Room**: Join existing rooms by code
- **Player Tracking**: Real-time player list per room
- **Room Status**: Waiting → Racing → Finished states
- **Auto-cleanup**: Remove empty rooms automatically

### ✅ Race Management
- **Start Race**: Begin race with timer countdown
- **Progress Tracking**: Real-time WPM/accuracy updates
- **Finish Race**: Record race results
- **Real-time Broadcasting**: Update all players with opponent progress
- **Placement Calculation**: Determine rankings by WPM

### ✅ Leaderboard System
- **Global Leaderboard**: Top 50 all-time rankings
- **Session Leaderboard**: Per-room race results
- **Persistent Storage**: JSON database
- **Auto-ranking**: Ranked by WPM descending
- **Statistics**: User average WPM, accuracy, total races

### ✅ REST API Endpoints
- `GET /api/health` - Server health check
- `GET /api/leaderboard?mode=global` - Global leaderboard
- `GET /api/stats/:userId` - User statistics

---

## Socket.IO Events

### Authentication Events

#### `login` (Client → Server)
```javascript
socket.emit('login', {
  email: 'user@example.com',
  // OR
  phone: '+1234567890',
  password: 'password123'
}, (response) => {
  // response.success: boolean
  // response.user: { id, displayName, email, phone }
  // response.message: string
})
```

#### `signup` (Client → Server)
```javascript
socket.emit('signup', {
  email: 'user@example.com',    // or phone
  phone: '+1234567890',           // or email
  password: 'password123',
  displayName: 'John Doe'
}, (response) => {
  // response.success: boolean
  // response.user: { id, displayName, email, phone }
  // response.message: string
})
```

### Room Events

#### `createRoom` (Client → Server)
```javascript
socket.emit('createRoom', {
  timer: 60  // 30, 60, 120, or 300 seconds
}, (response) => {
  // response.success: boolean
  // response.roomId: string
  // response.code: string (6-char room code)
})
```

**Broadcast**: `roomCreated`
```javascript
socket.on('roomCreated', (data) => {
  // data.code: room code
  // data.roomId: unique room ID
  // data.players: array of player objects
})
```

#### `joinRoom` (Client → Server)
```javascript
socket.emit('joinRoom', {
  roomCode: 'ABC123'
}, (response) => {
  // response.success: boolean
  // response.roomId: string
  // response.code: string
  // response.players: array of player objects
})
```

**Broadcast**: `roomJoined`
```javascript
socket.on('roomJoined', (data) => {
  // data.code: room code
  // data.roomId: unique room ID
  // data.players: all players in room
})
```

**Broadcast**: `playerJoined`
```javascript
socket.on('playerJoined', (data) => {
  // data.count: number of players
  // data.players: array of player objects
})
```

### Race Events

#### `startRace` (Client → Server)
```javascript
socket.emit('startRace', {})
```

**Broadcast**: `raceStarted`
```javascript
socket.on('raceStarted', (data) => {
  // data.roomId: unique room ID
  // data.startTime: timestamp
  // data.timer: duration in seconds
  // data.players: array of players
})
```

#### `updateProgress` (Client → Server)
```javascript
socket.emit('updateProgress', {
  wpm: 75,
  accuracy: 92.5,
  progress: 45  // percentage of passage typed
})
```

**Broadcast**: `raceState`
```javascript
socket.on('raceState', (data) => {
  // data.roomId: unique room ID
  // data.opponents: array of other players with wpm/accuracy
  // data.placement: current placement (1st, 2nd, etc)
  // data.sessionResults: all players in room
})
```

#### `finishRace` (Client → Server)
```javascript
socket.emit('finishRace', {
  wpm: 78,
  accuracy: 94.2,
  time: 60  // seconds elapsed
})
```

**Broadcast**: `raceFinished`
```javascript
socket.on('raceFinished', (data) => {
  // data.roomId: unique room ID
  // data.results: array of final results sorted by WPM
  // data.placement: your placement
})
```

### Leaderboard Events

#### `getLeaderboard` (Client → Server)
```javascript
socket.emit('getLeaderboard', {
  mode: 'global',  // or 'session'
  roomCode: 'ABC123'  // required if mode='session'
}, (response) => {
  // response.success: boolean
  // response.leaderboard: array of leaderboard entries
})
```

#### `getGlobalLeaderboard` (Client → Server)
```javascript
socket.emit('getGlobalLeaderboard', (response) => {
  // response.success: boolean
  // response.leaderboard: top 50 players
})
```

### Disconnection

#### `playerLeft` (Server → Client)
```javascript
socket.on('playerLeft', (data) => {
  // data.count: remaining player count
  // data.players: array of remaining players
})
```

---

## Database Schema

### Users Collection
```javascript
{
  "id": "unique-token",
  "displayName": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "password": "hashed-password",
  "createdAt": "2025-01-24T10:30:00Z",
  "stats": {
    "totalRaces": 5,
    "totalWins": 2,
    "averageWPM": 75.4,
    "averageAccuracy": 94.2
  }
}
```

### Leaderboard Collection
```javascript
{
  "id": "entry-id",
  "userId": "user-id",
  "userName": "John Doe",
  "wpm": 78,
  "accuracy": 94.2,
  "time": 60,
  "roomCode": "ABC123",
  "timestamp": "2025-01-24T10:35:00Z"
}
```

### Rooms Collection
```javascript
{
  "id": "room-id",
  "code": "ABC123",
  "creatorId": "user-id",
  "creatorName": "John Doe",
  "players": [
    {
      "id": "user-id",
      "name": "John Doe",
      "status": "ready",
      "socketId": "socket-id",
      "wpm": 0,
      "accuracy": 0,
      "progress": 0
    }
  ],
  "status": "waiting",  // waiting, racing, finished
  "timer": 60,
  "startTime": null,
  "createdAt": "2025-01-24T10:30:00Z"
}
```

---

## Demo Account

For testing, a demo account is pre-created in db.json:

**Email**: `demo@example.com`
**Phone**: `+1234567890`
**Password**: `password` (hashed)

The demo account has sample race history in the leaderboard for testing purposes.

---

## API Endpoints

### Health Check
```
GET /api/health
Response: { status: "ok", timestamp: "2025-01-24T10:30:00Z" }
```

### Get Global Leaderboard
```
GET /api/leaderboard?mode=global
Response: {
  success: true,
  leaderboard: [
    { rank: 1, name: "John", wpm: 95, accuracy: 97 },
    ...
  ]
}
```

### Get User Stats
```
GET /api/stats/:userId
Response: {
  success: true,
  stats: { totalRaces: 5, totalWins: 2, averageWPM: 75, averageAccuracy: 94.2 },
  user: { displayName: "John", email: "john@example.com", phone: "+1234567890" }
}
```

---

## File Structure

```
server/
├── server.js          # Main server (500+ lines)
├── package.json       # Dependencies
├── db.json            # JSON database
└── README.md          # This file
```

---

## Running the Server

### Install Dependencies
```bash
cd server
npm install
```

### Start Server
```bash
npm start
# or
node server.js
```

**Expected Output:**
```
🚀 Server running on http://localhost:4000
📊 WebSocket server ready for connections
```

### Connect Frontend
Frontend should connect to `http://localhost:4000` for local development.

---

## Implementation Details

### Password Security
- SHA-256 hashing (not salted - for demo only)
- For production: Use bcrypt with salt
- Passwords stored hashed in database

### Room Codes
- 6-character alphanumeric strings
- Generated randomly using `Math.random().toString(36)`
- Unique per room
- Case-insensitive (uppercase)

### Real-time Updates
- Socket.IO namespacing: `room-{roomId}`, `user-{userId}`
- Broadcasting to specific rooms
- Callback-based responses for client actions
- Automatic cleanup on disconnect

### Leaderboard Ranking
- Sorted by WPM descending
- All-time global: top 50
- Per-session: all participants
- Rank calculated from sort order

### User Statistics
- Track per race: WPM, accuracy, time
- Update averages on completion
- Count total races and wins
- Win: highest WPM in room

---

## Error Handling

All events include proper error handling:
- Invalid credentials → "Invalid email/phone or password"
- User not logged in → "Must be logged in"
- Room not found → "Room not found or already started"
- Duplicate email/phone → "Email or phone already registered"

Errors returned via callback or console logging.

---

## Performance Considerations

### Database
- In-memory JSON file (fast for development)
- Synchronous file operations (acceptable for small scale)
- For production: Use MongoDB, PostgreSQL, or similar

### Scaling
- Current setup: ~100 concurrent users
- To scale: Add database, implement caching, load balancing
- Socket.IO supports clustering with adapter

### Optimization Tips
- Add connection pooling for DB
- Implement Redis caching for leaderboard
- Add rate limiting on auth endpoints
- Use asynchronous file operations
- Add input validation middleware

---

## Security Recommendations (Production)

- [ ] Use HTTPS instead of HTTP
- [ ] Replace SHA-256 with bcrypt + salt
- [ ] Add CORS whitelist instead of "*"
- [ ] Implement rate limiting
- [ ] Add JWT tokens instead of basic auth
- [ ] Validate all inputs server-side
- [ ] Use environment variables for config
- [ ] Add database encryption
- [ ] Implement request signing
- [ ] Add audit logging
- [ ] Use secure WebSocket (WSS)
- [ ] Add CSRF protection

---

## Testing

### Test Login
```javascript
// Use browser console or test client
socket.emit('login', {
  email: 'demo@example.com',
  password: 'password'
}, (res) => console.log(res))
```

### Test Room Creation
```javascript
socket.emit('createRoom', { timer: 60 }, (res) => {
  console.log('Room:', res.code)
})
```

### Test Leaderboard
```javascript
socket.emit('getGlobalLeaderboard', (res) => {
  console.log('Top Players:', res.leaderboard)
})
```

---

## Troubleshooting

### Connection Issues
- Check port 4000 is available
- Verify CORS configuration
- Check WebSocket is enabled
- Verify frontend Socket.IO URL

### Authentication Fails
- Check password is correct
- Verify email/phone in database
- Check password hashing matches
- Look for typos in credentials

### Room Not Found
- Ensure room code is correct (case-insensitive)
- Check room hasn't already started
- Verify room exists in database
- Try creating new room instead

### Leaderboard Empty
- Check database has leaderboard entries
- Verify races have been completed
- Check sorting is working correctly
- Look at db.json file directly

---

## Next Steps

1. **Test all features** with frontend
2. **Verify socket events** fire correctly
3. **Check database** updates properly
4. **Test on production** environment
5. **Add security** improvements
6. **Implement persistence** (MongoDB, etc)
7. **Add monitoring** and logging
8. **Performance test** with many users

---

## Support

For issues:
1. Check server logs for error messages
2. Verify database file exists (db.json)
3. Test with browser DevTools (F12)
4. Check Socket.IO connection in Network tab
5. Verify all required fields in requests

---

*Backend Implementation Complete - All Features Ready*
