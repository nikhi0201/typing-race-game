# 🚀 Quick Start Guide

## Getting Started with Typing Race Game v2.0

### ⚡ What's New?

Your typing game now supports:
- 🏘️ **Multi-player rooms** - Create rooms or join with codes
- ⏱️ **Custom timers** - Choose game duration (30s-5m)
- 🏁 **Live racing** - Compete against others in real-time
- 🏆 **Leaderboards** - Track global and session rankings

---

## 🎮 How to Play

### Step 1: Start the Game
```bash
cd client
npm run dev
```
Open `http://localhost:5173` in your browser

### Step 2: Enter Your Name
Type your name and either:
- **Create Room** → Get a room code to share
- **Join Room** → Enter a code someone shared

### Step 3: Wait in Lobby
- See players as they join
- Room creator selects game duration (30s, 1m, 2m, 5m)
- Everyone gets ready

### Step 4: Race!
- Type the displayed passage as fast and accurately as possible
- See your opponent's progress in real-time
- Watch your WPM and accuracy update live

### Step 5: View Results
- See your stats (WPM, accuracy, time, placement)
- Check session leaderboard
- Start another race or leave

---

## 📊 Understanding the Stats

### WPM (Words Per Minute)
```
Formula: (Total Characters Typed ÷ 5) ÷ (Time in Minutes)
Example: 450 characters in 5 minutes = 90 ÷ 5 = 18 WPM
Faster typing = Higher WPM
```

### Accuracy
```
Formula: (Correct Characters ÷ Total Characters Typed) × 100%
Example: 45 correct out of 50 typed = 90% accuracy
Fewer mistakes = Higher accuracy
```

### Placement
```
Your rank in the race
1st Place 🥇 = Fastest typing
Competition!
```

---

## 🎮 Game Modes

### Solo Play (Single Player in Room)
- Create room alone
- Practice typing
- Get baseline WPM
- Compete with past scores

### Competitive Play (Multiple Players)
- Create or join room
- Race against real people
- Live opponent tracking
- Instant rankings
- Most fun mode!

---

## 💡 Pro Tips

### For Faster WPM
1. **Don't look at keyboard** - Focus on the passage
2. **Use all fingers** - Proper typing technique helps
3. **Accuracy first** - Speed comes with practice
4. **Stay calm** - Rushing causes mistakes

### For Higher Accuracy
1. **Read ahead** - See what's coming
2. **Consistent technique** - Regular finger positions
3. **Avoid backspace** - Type carefully, not quickly
4. **Practice passages** - Familiarity helps

### Competitive Strategy
1. **Know the passage** - Common phrases appear often
2. **Steady pace** - Consistent beats frantic typing
3. **Cold hands** - Prepare before race starts
4. **Focus mode** - Minimize distractions

---

## 🔌 Socket.IO Connection

The frontend automatically connects to your server at:
```
VITE_SOCKET_URL = http://localhost:4000
```

Change in `.env` file:
```
VITE_SOCKET_URL=http://your-server.com:4000
```

---

## 🐛 Troubleshooting

### Game Won't Load
- Check Node.js is installed: `node --version`
- Install dependencies: `npm install`
- Start dev server: `npm run dev`

### Can't Connect to Server
- Verify backend is running
- Check VITE_SOCKET_URL in .env
- Try `http://localhost:4000` (local development)

### Room Code Invalid
- Codes are case-insensitive
- Must be exactly 6 characters
- Check for typos
- Ask room creator to resend

### Timer Not Working
- Only room creator can select timer
- Timer starts when race begins
- Check backend timer sync

### WPM Shows 0
- You need to type at least a few characters
- WPM calculates based on time typed
- Give it a few seconds

### Can't Join Race
- Make sure you're in the lobby first
- Wait for room creator to press Start
- Check for error messages

---

## 📱 Mobile Play

Works on:
- ✅ iPhones (iOS 12+)
- ✅ Android phones
- ✅ Tablets
- ✅ Any modern browser

Touch controls:
- Tap input area to focus
- Type using keyboard
- Tap buttons to navigate

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Enter | Submit form / Join room |
| Tab | Navigate between fields |
| Escape | (Future: pause game) |
| Space | Type space character |

---

## 📊 Leaderboard Info

### Global Leaderboard
- Shows top 10 all-time players
- Updates after each race
- Based on highest WPM
- Shows on main menu

### Session Leaderboard
- Shows current room standings
- Updates after each race
- Ranks players by performance
- Visible after race results

### Medals
- 🥇 1st Place - Gold
- 🥈 2nd Place - Silver
- 🥉 3rd Place - Bronze
- • Others - No medal

---

## 🔐 Privacy & Security

- Your name is shared with room players only
- No personal data collected
- Scores stored in session only
- Clear browser = fresh account

---

## 🎯 Goals

### Beginner
- Get 30+ WPM
- Achieve 85%+ accuracy
- Complete 5 races

### Intermediate
- Get 50+ WPM
- Achieve 90%+ accuracy
- Win against 1+ player

### Advanced
- Get 80+ WPM
- Achieve 95%+ accuracy
- Reach #1 leaderboard

### Expert
- Get 100+ WPM
- Achieve 98%+ accuracy
- Maintain top position

---

## 🎊 Features by Screen

### Menu Screen
- [x] Name input
- [x] Create room button
- [x] Join room input & button
- [x] Global leaderboard
- [x] Error messages

### Lobby Screen
- [x] Room code display
- [x] Player list
- [x] Timer selection (creator only)
- [x] Start race button (creator only)
- [x] Leave room button
- [x] Waiting status

### Race Screen
- [x] Passage to type
- [x] Typing input area
- [x] Real-time stats (WPM, accuracy)
- [x] Progress bar
- [x] Timer countdown
- [x] Opponent list
- [x] Finish status

### Results Screen
- [x] Final stats display
- [x] Placement ranking
- [x] Session leaderboard
- [x] Next race button
- [x] Leave room button
- [x] Global leaderboard
- [x] Error messages

---

## 📞 Getting Help

### Documentation Files
1. **FEATURES.md** - What you can do
2. **SOCKET_EVENTS.md** - Technical info
3. **QUICK_REFERENCE.md** - Developer guide
4. **UPDATE_SUMMARY.md** - What's new
5. **CHECKLIST.md** - Implementation status

### Common Questions

**Q: How do I create a room?**
A: Click "Create Room" button after entering name

**Q: How do I share my room code?**
A: Copy the 6-character code from lobby screen and share

**Q: Can I change the timer?**
A: Only room creator can select timer before race

**Q: What if I disconnect mid-race?**
A: Socket.io auto-reconnects (backend permitting)

**Q: How are WPM and accuracy calculated?**
A: See "Understanding the Stats" section above

**Q: Can I play alone?**
A: Yes! Create room and race solo to practice

---

## 🚀 Next Steps

1. **Start the game**: `npm run dev`
2. **Create a room**: Click "Create Room"
3. **Invite friends**: Share the room code
4. **Race together**: Wait for them to join
5. **Compete**: Type your best!
6. **View results**: Check leaderboards
7. **Repeat**: Start another race

---

## 🎉 Have Fun!

Enjoy typing race! 

May your WPM be high and your accuracy even higher! ⚡

---

**Version**: 2.0 Multiplayer  
**Last Updated**: January 24, 2026  
**Status**: ✅ Ready to Play
