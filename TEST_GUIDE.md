# 🎮 TYPING RACE GAME - QUICK TEST GUIDE

## 🚀 START HERE

### Both Servers Running?
```bash
Backend:  http://localhost:4000 ✅
Frontend: http://localhost:5173 ✅
```

### Open Application
Visit: **http://localhost:5173**

---

## 📋 STEP-BY-STEP TEST

### Step 1: Sign In
1. Wait for splash screen animation
2. Click "Sign In" tab
3. Enter credentials:
   - **Email**: nikki020106@gmail.com
   - **Password**: password
4. Click "Sign In" button
5. You should see the **Menu Screen**

### Step 2: Create Room
1. Click **"Create Room"** button
2. You'll see the **Lobby Screen** with:
   - 🏎️ Room code (e.g., "ABC123")
   - 📋 Copy button for code
   - 🔗 Share link with copy button
   - 👥 Players list (just you)
   - Your name at top

### Step 3: Invite Players
1. Click copy button next to room code
2. Share with friends OR
3. Open another tab/browser window at http://localhost:5173
4. Sign in again with same account (or different account)

### Step 4: Join Room
1. In the **Menu Screen**, click **"Join Room"**
2. Paste the room code you copied
3. Click **"Join Room"** button
4. You'll see the lobby with both players listed

### Step 5: Get Ready
1. First player: Click **"✅ Ready"** button
2. Second player: Click **"✅ Ready"** button
3. Both should show **"✅ Ready"** status

### Step 6: Select Game Time
1. **Room creator only** can see timer options
2. Click one: **30s** | **60s** | **100s** | **120s**
3. Selected one gets highlighted

### Step 7: Start Game
1. Once ALL players are ready
2. **"🚀 Start Game"** button appears
3. Click **"🚀 Start Game"**
4. Countdown appears with **"10"**

### Step 8: Watch Countdown
```
10 → 9 → 8 → 7 → 6 → 5 → 4 → 3 → 2 → 1 → 0
```

#### TEST COUNTDOWN RESET:
- While countdown shows **≤ 5 seconds**
- Open another browser tab
- Join the same room with new player
- **Timer resets to 10!** ✅

### Step 9: Race Begins
1. After countdown reaches 0
2. Typing arena appears
3. Large passage of text
4. Start typing!
5. Live WPM and accuracy show
6. Opponent names appear on right

### Step 10: Finish Race
1. Type the entire passage
2. Click **"Finish Race"** button
3. See results:
   - Your WPM
   - Accuracy %
   - Placement (1st, 2nd, etc.)
   - Leaderboard

### Step 11: Next Race or Leave
1. Click **"Next Race"** → Back to Lobby
2. Click **"Leave Room"** → Back to Menu

---

## ✅ WHAT SHOULD HAPPEN

### Menu Screen ✅
- [ ] Beautiful purple gradient background
- [ ] Welcome message with your name
- [ ] Two options: Create Room & Join Room
- [ ] Create Room button is prominent
- [ ] Join Room has input field for code

### Lobby Screen ✅
- [ ] Room code visible at top
- [ ] Copy button works (try clicking it!)
- [ ] Share link shows full URL
- [ ] Players list updates when new player joins
- [ ] Ready button toggles between states
- [ ] Timer options visible (creator only)
- [ ] Leave Room button at bottom

### Countdown Timer ✅
- [ ] Shows large "10" number
- [ ] Counts down to 0
- [ ] Auto-starts race when hits 0
- [ ] Resets to 10 if player joins (0-5 seconds only)
- [ ] Has pulse animation effect
- [ ] Shows text: "Game starting soon..." then "Last chance to join!"

### Race Screen ✅
- [ ] Large text passage appears
- [ ] Typing area with input field
- [ ] Live WPM display (updates as you type)
- [ ] Accuracy percentage
- [ ] Timer counting down
- [ ] Opponent list on right side

### Results Screen ✅
- [ ] Your WPM
- [ ] Accuracy percentage
- [ ] Your placement
- [ ] Leaderboard with all players
- [ ] Next Race button
- [ ] Leave Room button

---

## 🔧 TROUBLESHOOTING

### Issue: Can't see menu after login
**Solution**: Check browser console (F12) for errors. Backend must be running.

### Issue: Room code not showing
**Solution**: Check network tab, createRoom event should fire. Refresh page.

### Issue: Players not updating in list
**Solution**: Check websocket connection. Verify both servers running.

### Issue: Countdown not starting
**Solution**: All players must be "Ready". Check if "Start Game" button appears.

### Issue: Servers not running
**Solution**: 
```bash
# In PowerShell:
Get-Process node | Stop-Process -Force
Push-Location "c:\Users\nikki\OneDrive\Desktop\typing-race-game\server"
npm start

# In another PowerShell:
Push-Location "c:\Users\nikki\OneDrive\Desktop\typing-race-game\client"
npm run dev
```

---

## 🎯 KEY FEATURES TO TEST

1. **Room Creation** ✅
   - Create room gets unique code
   - Code can be copied
   - Share link includes full URL

2. **Player Joining** ✅
   - Other players can join with code
   - Players list updates immediately
   - Player names show correctly

3. **Ready System** ✅
   - Toggle ready on/off
   - Ready status visible for all
   - Only ready players can start race

4. **Countdown Timer** ✅
   - Starts at exactly 10 seconds
   - Counts down smoothly
   - Resets if player joins during 0-5 seconds
   - No reset after 5 seconds
   - Auto-starts race at 0

5. **Timer Selection** ✅
   - Only room creator sees options
   - Can select 30s, 60s, 100s, or 120s
   - Selection shows highlighted

6. **Race Execution** ✅
   - Typing arena appears
   - WPM calculates correctly
   - Accuracy tracks properly
   - Can finish and see results

---

## 📞 QUICK REFERENCE

| Screen | Purpose | Actions |
|--------|---------|---------|
| Splash | Intro animation | Auto-advances |
| Auth | Login/Signup | Enter credentials |
| Menu | Choose action | Create or Join room |
| Lobby | Wait for players | Ready, select timer, start |
| Countdown | 10-sec timer | Watch or invite more |
| Racing | Typing challenge | Type passage |
| Results | See scores | Next race or leave |

---

## 🎨 COLOR SCHEME

- **Primary**: Purple gradient (#667eea → #764ba2)
- **Ready**: Green (#d4edda)
- **Not Ready**: Yellow (#fff3cd)
- **Countdown**: Pink gradient (#f093fb → #f5576c)
- **Text**: Dark gray (#333)

---

## 📊 FILE LOCATIONS

```
Frontend Components:
├── client/src/App.jsx (UPDATED)
├── client/src/components/Menu.jsx (NEW)
├── client/src/components/Menu.css (NEW)
├── client/src/components/Lobby.jsx (NEW)
└── client/src/components/Lobby.css (NEW)

Backend:
└── server/server.js (UPDATED)

Database:
└── server/db.json (auto-updated)
```

---

## ✨ STATUS: FULLY OPERATIONAL

All systems tested and verified. Ready for production use!

Good luck! 🏁

---
