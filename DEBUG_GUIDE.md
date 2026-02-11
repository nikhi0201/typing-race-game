# GAME FLOW DEBUGGING GUIDE

## Purpose
This guide helps verify the complete game flow from menu → lobby → countdown → racing arena.

## Comprehensive Logging Added
- **Server**: Detailed logs at every step of room creation, countdown, and race start
- **Client**: Console logs showing socket listener registration and event receipt

## Test Steps

### 1. Start Servers
- Backend: `node server/server.js` (running on :4000)
- Frontend: `npm run dev` in client/ (running on :5173)
- Both should already be running

### 2. Test Account Credentials
**Demo Account**:
- Email: `demo@example.com`
- Password: `password`

OR **Create New Account**:
- Choose "Sign Up" on auth screen
- Enter new email and password

### 3. Complete Game Flow
1. Authenticate with demo account
2. On Menu, click "Create Room"
3. In Lobby, select timer (e.g., 10 seconds for fast testing)
4. Click "Start Game" button (rocket icon)
5. Watch countdown (10 → 0)
6. **CRITICAL**: After countdown finishes, check if typing arena appears

### 4. Monitor Logs

**In Browser Console** (F12):
```
Look for these logs:
✅ [App.jsx] Setting up socket listeners...
✅ [App.jsx] All socket listeners registered successfully
✅ Countdown started event received
⏱️ Countdown tick: 10, 9, 8, ..., 1, 0
🏁 Countdown finished
🏁 RACE STARTING EVENT RECEIVED:
✅ Game state changed to racing
```

**In Server Terminal**:
```
Look for these logs:
✅ [createRoom] Room created successfully
⏰ [startCountdown] Event received
📡 [startCountdown] Emitting countdownStarted
⏰ [startCountdown] Setting 10-second timeout...
⏰ [startCountdown] Timeout scheduled with ID: ...
⏰ [TIMEOUT FIRED] 10 seconds elapsed
🚀 [TIMEOUT] Emitting raceStarting to room-...
🚀 [TIMEOUT] Emitting raceStarted to room-...
```

## Diagnostic Interpretation

###  All logs appear → SUCCESS
- Game should transition to typing arena
- Both server and client events firing correctly
- Flow is complete

### Missing "🏁 RACE STARTING EVENT RECEIVED" in browser
- Socket.io listeners not receiving event
- Possible: Socket disconnection, room mismatch, wrong event channel

### Missing "⏰ [TIMEOUT FIRED]" in server
- setTimeout not executing
- Possible: Socket disconnect, Node event loop blocked, room status mismatch

### Missing "⏰ [startCountdown] Event received" in server
- Lobby not emitting `startCountdown` event
- Possible: Button not clicking, socket not connected, event name wrong

### All server logs appear but no browser logs
- Event emitted but not received by client
- Possible: Socket room mismatch, listener not registered, wrong event namespace

## Next Steps If Issue Persists

1. **Check Browser DevTools Network Tab**:
   - Should see Socket.IO connections
   - Should see message exchanges
   - Check for errors

2. **Check Server Logs for Room Status**:
   - Is room in "countdown" status when setTimeout fires?
   - If not, something is clearing/resetting room status

3. **Verify Socket Rooms**:
   - Client must be in `room-${roomId}` to receive events
   - Look for "socket joined to:" log messages

## Critical Files
- Server event handlers: `/server/server.js` lines 324-410
- Client listeners: `/client/src/App.jsx` lines 28-90
- Lobby countdown: `/client/src/components/Lobby.jsx` lines 27-105
- RaceTrack render: `/client/src/App.jsx` lines 213-220
