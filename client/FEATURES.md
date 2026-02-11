# Typing Race Game - Frontend Features

## 🎮 Game Features

### 1. **Multi-Player Room System**
- **Create Room**: Players can create a private game room that generates a unique 6-character room code
- **Join Room**: Players can join existing rooms using the room code
- **Live Player List**: See all players in the room and their status in real-time

### 2. **Customizable Game Timer**
- **Timer Options**: 30s, 60s, 2min, 5min
- **Room Creator Control**: Only the room creator can select the timer duration
- **Visual Timer**: Large, prominent countdown timer during races (turns red when < 10 seconds)

### 3. **Competitive Racing**
- **Real-time Opposition Tracking**: View opponent progress, WPM, and completion status during the race
- **Instant WPM Calculation**: Live words-per-minute calculation
- **Accuracy Tracking**: Real-time character-by-character accuracy feedback
- **Progress Visualization**: Visual indication of where you are in the passage with cursor highlighting

### 4. **Dynamic Leaderboards**

#### Global Leaderboard (Main Menu)
- Top 10 players with highest WPM
- Sorted by performance
- Auto-updates every 3 seconds
- Medal system: 🥇 🥈 🥉

#### Session Leaderboard (After Each Race)
- Competitive standings for current room
- Updates after every race
- Shows race count and player count for the session
- Rankings display current session performance

### 5. **Race Results & Scoring**
- **Detailed Stats**: WPM, Accuracy, Time Taken, Characters Typed
- **Placement Display**: Shows your rank in the current race
- **Session Results Table**: See how you rank against other players in real-time
- **Performance Metrics**: 
  - WPM (Words Per Minute)
  - Accuracy Percentage
  - Total Time
  - Characters Correctly Typed

### 6. **Enhanced UI/UX**
- **Modern Dark Theme**: Eye-friendly dark mode with gradient accents
- **Glassmorphism Effects**: Modern frosted glass card design
- **Smooth Animations**: Professional transitions and micro-interactions
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Color-Coded Feedback**: Green for correct characters, red for errors, blue for UI elements

## 🎯 Game Flow

```
1. Start → Menu (Enter name, choose Create/Join)
   ├─ Create Room → Room Code Generated
   │  └─ Enter Lobby → Share Code
   └─ Join Room → Lobby (if code valid)

2. Lobby → Wait for Players
   ├─ Room Creator → Select Timer
   └─ All Players → Ready Status

3. Race → Live Competition
   ├─ Timer Countdown
   ├─ Type Passage
   ├─ Real-time Opponent Tracking
   └─ Finish (Complete or Timer Ends)

4. Results → Performance Review
   ├─ Final Stats
   ├─ Session Leaderboard
   └─ Next Race / Leave Room
```

## 🔧 Technical Features

### Socket.IO Events
- `createRoom` - Create a new game room
- `joinRoom` - Join an existing room
- `selectTimer` - Set the race duration
- `startRace` - Begin the race
- `progress` - Send live typing progress
- `finishRace` - Complete the race
- `leaveRoom` - Exit the room
- `nextRace` - Start another race in the same room

### Real-time Updates
- Live opponent progress tracking
- Immediate WPM and accuracy calculations
- Session-based leaderboard updates
- Player join/leave notifications
- Timer synchronization across all players

## 📊 Statistics Tracked

### Per-Race Metrics
- **WPM**: Words per minute
- **Accuracy**: Character-by-character accuracy percentage
- **Time**: Total race duration
- **Characters Typed**: Total characters entered
- **Placement**: Your rank in the race

### Session Metrics
- Total races completed
- Player count in session
- Average WPM
- Best WPM
- Leaderboard rankings

## 🎨 UI Components

### Main Screens
1. **Menu Screen**: Name entry, room creation/joining, global leaderboard
2. **Lobby Screen**: Player list, timer selection, start race button
3. **Race Screen**: Passage display, typing input, live stats, opponent tracking
4. **Results Screen**: Final stats, session standings, next race/leave options

### Key Elements
- **Timer Display**: Large countdown with color change warning
- **Progress Bar**: Visual representation of race completion
- **Passage Display**: Character-by-character feedback with cursor
- **Opponent List**: Live tracking of competing players
- **Leaderboard**: Ranked player standings with medals

## ⚙️ Environment Configuration

Create a `.env` file in the client folder:
```
VITE_SOCKET_URL=http://localhost:4000
```

## 🚀 Running the Frontend

```bash
cd client
npm install
npm run dev
```

The game will be available at `http://localhost:5173` (or your configured Vite port)

## 📱 Responsive Design

- **Desktop (1200px+)**: Full layout with sidebars
- **Tablet (768px - 1199px)**: Stacked layouts with adjusted grid
- **Mobile (<768px)**: Single column, touch-friendly buttons
