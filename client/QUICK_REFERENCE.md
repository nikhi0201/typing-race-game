# Quick Reference Guide - Typing Race Frontend

## 🎮 Game States

```
┌─────────────────────────────────────────────────────────────┐
│                        MAIN MENU                             │
│  Enter Name → Create Room OR Join Room                      │
│  (Display: Global Leaderboard on right)                     │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
   CREATE ROOM              JOIN ROOM
        │                         │
        └────────────┬────────────┘
                     ▼
        ┌─────────────────────────┐
        │     LOBBY SCREEN        │
        │ • Room Code Display     │
        │ • Player List           │
        │ • Timer Selection*      │
        │ • Start Button*         │
        │ (*Creator only)         │
        └────────────┬────────────┘
                     │
                PRESS START
                     │
                     ▼
        ┌─────────────────────────┐
        │     RACE SCREEN         │
        │ • Timer Countdown       │
        │ • Passage to Type       │
        │ • Live Opponents        │
        │ • Your Stats (WPM/Acc)  │
        └────────────┬────────────┘
                     │
        COMPLETE OR TIMER ENDS
                     │
                     ▼
        ┌─────────────────────────┐
        │    RESULTS SCREEN       │
        │ • Final WPM/Accuracy    │
        │ • Placement             │
        │ • Session Leaderboard   │
        │ • Next Race / Leave     │
        └─────────────────────────┘
```

## ⌨️ Typing Mechanics

### Display
```
Text shown:    "The quick brown fox"
User typed:    "The quic"
Display:       The quic|k brown fox
               ^^^^^^^ ✓ correct (green)
                   ^ ✗ wrong would be (red)
                       ^ cursor position
```

### Calculations
```
WPM = (Correct Characters / 5) / (Time in Minutes)
Accuracy = (Correct Characters / Total Typed) × 100%
Progress = (Characters Typed / Passage Length) × 100%
```

## 🎮 Key Controls

### Menu Screen
- Type name → press Enter
- Click "Create Room" → Get room code
- Click "Join Room" → Enter code → join

### Lobby Screen
- Click timer buttons (creator only) → Select 30s/1m/2m/5m
- Click "Start Race" → Begin racing
- Click "Leave Room" → Return to menu

### Race Screen
- Click text area → Start typing
- Type passage → See real-time feedback
- Complete passage OR wait for timer → Finish race

### Results Screen
- Click "Next Race" → Go to lobby for new race
- Click "Leave Room" → Return to menu

## 📊 Data Structures

### Room
```javascript
{
  code: "ABC123",              // 6-character code
  roomId: "uuid-string",
  creatorId: "creator-uuid",
  players: [
    { name: "Alice", status: "ready" },
    { name: "Bob", status: "ready" }
  ],
  selectedTimer: 60,           // seconds
  currentRace: { /* race data */ },
  sessionResults: [ /* all race results */ ]
}
```

### Race Result
```javascript
{
  playerName: "Alice",
  wpm: 75,                     // words per minute
  accuracy: 95,                // percentage
  time: 45,                    // seconds elapsed
  charactersTyped: 450,
  placement: 1,                // rank in race
  timestamp: 1705977600000
}
```

### Session Standing
```javascript
[
  {
    name: "Alice",
    wpm: 85,
    accuracy: 96,
    races: 3,                  // races in session
    avgWpm: 80,
    bestWpm: 85
  },
  {
    name: "Bob",
    wpm: 72,
    accuracy: 93,
    races: 3,
    avgWpm: 70,
    bestWpm: 75
  }
]
```

## 🔧 Component Hierarchy

```
App
├── Header
│   └── Title + Tagline
├── Main (gameState)
│   ├── Menu Screen
│   │   ├── Login Card
│   │   │   ├── Name Input
│   │   │   ├── Create Room Button
│   │   │   ├── Join Room Input
│   │   │   └── Join Room Button
│   │   └── Leaderboard
│   │
│   ├── Lobby Screen
│   │   ├── Room Code Display
│   │   ├── Players List
│   │   ├── Timer Selection Grid
│   │   ├── Start Race Button
│   │   └── Leave Room Button
│   │
│   ├── Race Screen (RaceTrack)
│   │   ├── Header
│   │   │   ├── Timer Display
│   │   │   └── Stats (WPM, Accuracy, Progress)
│   │   ├── Passage Display
│   │   ├── Progress Bar
│   │   ├── Input TextArea
│   │   ├── Finish Message (conditional)
│   │   └── Opponents List
│   │
│   └── Results Screen
│       ├── Final Stats Grid
│       ├── Placement Display
│       ├── Session Leaderboard
│       ├── Action Buttons
│       └── Leaderboard (sessionMode)
│
└── Footer
    └── Copyright
```

## 🌐 Socket Event Sequence

### Creating & Joining Room
```
Client                          Server
  │
  │─────────createRoom────────→ │ Generate code
  │                             │ Store room
  │ ←────────roomCreated────── │ Send code
  │
  └─ Client waits in lobby ─┘
  
     (Other client)
  │
  │─────────joinRoom────────→ │ Validate code
  │                           │ Add to room
  │ ←────────roomJoined───── │ Send room data
  │ ←────────playerJoined─── │ Notify all
  │
  └─ Client joins lobby ─┘
```

### Starting & Racing
```
Client                          Server
  │
  │──────────startRace────────→ │ Start timer
  │ ←──────raceStarting─────── │ All get signal
  │
  ├─ User types ─┤ (each keystroke)
  │
  │────────progress────────────→ │ Update live
  │ ←───────raceState────────── │ Broadcast
  │ (Shows opponent progress)
  │
  │───────finishRace───────────→ │ Record finish
  │ ←──────raceFinished─────────│ Calc placement
  │                            │ Update leaderboard
```

## 💾 Browser Storage

Not currently stored (stateless per session), but could add:
- LocalStorage for player preferences
- IndexedDB for match history
- SessionStorage for temporary race data

## 🎯 Performance Tips

1. **For Backend**
   - Use room-based broadcasting, not individual sockets
   - Batch progress updates every 100-200ms
   - Cache leaderboard, update on race complete
   - Use binary protocol for large data transfers

2. **For Frontend**
   - Timer uses setInterval (1s updates)
   - Progress is debounced and sent on keystroke
   - Leaderboard auto-refreshes every 3-5s
   - Opponent list updates in real-time

## 🐛 Common Issues & Fixes

### Issue: Socket connection fails
**Fix**: Check VITE_SOCKET_URL environment variable

### Issue: Timer not syncing
**Fix**: Ensure server sends raceStarted with timestamp

### Issue: WPM always 0
**Fix**: Ensure startTimeRef is set before calculating

### Issue: Opponent list empty
**Fix**: Check raceState.opponents is populated by server

### Issue: Can't start race
**Fix**: Ensure you're room creator for start button to appear

## 📱 Mobile Optimization

- Timer takes 40% of header width
- Stats display in single row on mobile
- Opponent list scrolls vertically
- Buttons are 48px+ for touch targets
- Input area expands on focus

## 🚀 Deployment Checklist

- [ ] VITE_SOCKET_URL set to production server
- [ ] Build creates dist folder
- [ ] dist/index.html loads correctly
- [ ] CSS and JS assets load
- [ ] Socket.IO connects to backend
- [ ] All features work end-to-end
- [ ] Responsive design tested on mobile
- [ ] Performance acceptable on 3G

---

**Last Updated**: January 24, 2026  
**Version**: 2.0 (Multiplayer)
