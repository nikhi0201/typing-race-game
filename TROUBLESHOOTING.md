# Troubleshooting Guide - Typing Race Game

## ✅ Fixed Issues

### 1. **Backend Server Not Running**
- **Issue**: Port 4000 was not listening
- **Fix**: Ensured backend starts with `npm start` in `/server` directory
- **Status**: ✅ Backend running on `http://localhost:4000`

### 2. **Login/Signup Timeout Issues**
- **Issue**: Callbacks from socket.io were not properly handled with timeouts
- **Fix**: Rewrote Auth component to properly track response state and handle 8-second timeout
- **Status**: ✅ Fixed with proper error messages

### 3. **Password Hashing Mismatch**
- **Issue**: Demo user password hash was incorrect
- **Fix**: Updated db.json with correct SHA-256 hash for "password"
- **Status**: ✅ Both test accounts now use password: `password`

### 4. **Room Creation/Join Missing Callbacks**
- **Issue**: Frontend wasn't handling callback responses from createRoom/joinRoom
- **Fix**: Added callback handlers to both functions with error handling
- **Status**: ✅ Now properly captures success/failure responses

## 🎯 Test Accounts

Both accounts use password: `password`

### Account 1 (Demo)
- **Email**: `demo@example.com`
- **Phone**: `+1234567890`
- **Password**: `password`

### Account 2 (Your Account)
- **Email**: `nikki020106@gmail.com`
- **Password**: `password`

## 📋 Step-by-Step Testing

### 1. Start the Backend
```bash
cd c:\Users\nikki\OneDrive\Desktop\typing-race-game\server
npm start
```
Expected output:
```
🚀 Server running on http://localhost:4000
📊 WebSocket server ready for connections
```

### 2. Start the Frontend
```bash
cd c:\Users\nikki\OneDrive\Desktop\typing-race-game\client
npm run dev
```

### 3. Login Flow
1. Visit `http://localhost:5174`
2. Watch the splash screen with animated typing race
3. Click "Sign In" tab
4. Enter email: `nikki020106@gmail.com`
5. Enter password: `password`
6. Click "🚀 Sign In"
7. You should see the menu with "Create Room" and "Join Room" buttons

### 4. Create Room
1. Click "Create Room" button
2. You'll be taken to the lobby with a room code
3. Share the code with others to join

### 5. Join Room
1. Click "Join Room" button
2. Enter the 6-character room code
3. Select your timer (30, 60, 120, or 300 seconds)
4. Wait for host to start the race
5. Type the passage when race starts

## 🔍 Common Issues & Solutions

### Issue: "Connection timeout" error
**Solution**: 
- Make sure backend is running on port 4000
- Check: `netstat -ano | findstr ":4000"` should show LISTENING
- Restart backend: `npm start` in server directory

### Issue: "Invalid email/phone or password"
**Solution**:
- Double-check credentials - password is case-sensitive
- Use: `nikki020106@gmail.com` / `password`
- Or: `demo@example.com` / `password`

### Issue: Can't create/join room
**Solution**:
- Make sure you're logged in (check gameState is 'menu' or 'lobby')
- Room code must be 6 characters
- Room must exist and have status "waiting"

### Issue: Room creation fails silently
**Solution**:
- Check browser console (F12) for error messages
- Backend logs should show any room creation errors
- Verify database (db.json) is readable/writable

## 🛠️ Technical Stack

- **Frontend**: React 18 + Vite + Socket.IO Client
- **Backend**: Node.js + Express + Socket.IO
- **Database**: JSON file (db.json)
- **Authentication**: SHA-256 password hashing

## 📊 Database Schema

### Users Collection
```json
{
  "id": "unique-id",
  "displayName": "Your Name",
  "email": "email@example.com",
  "phone": "+1234567890",
  "password": "sha256-hash",
  "stats": {
    "totalRaces": 0,
    "totalWins": 0,
    "averageWPM": 0,
    "averageAccuracy": 0
  }
}
```

### Rooms Collection
```json
{
  "id": "unique-id",
  "code": "ABC123",
  "creatorId": "user-id",
  "creatorName": "Player Name",
  "players": [
    {
      "id": "user-id",
      "name": "Player Name",
      "status": "ready|joined",
      "socketId": "socket-id"
    }
  ],
  "status": "waiting|racing|finished",
  "timer": 60
}
```

## 🚀 Production Deployment

When deploying to production:

1. **Security**:
   - Replace SHA-256 with bcrypt + salt
   - Use environment variables for secrets
   - Enable HTTPS/WSS (encrypted WebSockets)

2. **Database**:
   - Replace JSON with MongoDB or PostgreSQL
   - Add proper indexing

3. **Backend**:
   - Deploy to Heroku, Railway, or similar
   - Set `SOCKET_URL` environment variable
   - Enable CORS for your domain

4. **Frontend**:
   - Build: `npm run build`
   - Deploy to Vercel, Netlify, or similar
   - Update `VITE_SOCKET_URL` to production backend URL

## 📞 Support

For issues:
1. Check browser console (F12) for errors
2. Check backend terminal for server logs
3. Verify both servers are running on correct ports
4. Check db.json is valid JSON
