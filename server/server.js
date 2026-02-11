// server/server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// ==================== DATABASE ====================
const DB_PATH = path.join(__dirname, "db.json");

function readDB() {
  try {
    const data = fs.readFileSync(DB_PATH, "utf8");
    return JSON.parse(data);
  } catch (err) {
    return {
      users: [],
      leaderboard: [],
      runs: [],
      rooms: [],
    };
  }
}

function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// ==================== UTILITIES ====================
function generateRoomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

function generateUserToken() {
  return crypto.randomBytes(16).toString("hex");
}

// ==================== AUTHENTICATION ====================
io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id);
  let currentUser = null;
  let currentRoom = null;

  // ==================== AUTH EVENTS ====================
  socket.on("login", (credentials, callback) => {
    try {
      console.log(`🔐 Login attempt: ${credentials.email || credentials.phone}`);
      const db = readDB();
      const { email, phone, password } = credentials;

      // Find user by email or phone
      const user = db.users.find(
        (u) => (u.email === email || u.phone === phone) && u.password === hashPassword(password)
      );

      if (user) {
        currentUser = {
          id: user.id,
          displayName: user.displayName,
          email: user.email,
          phone: user.phone,
        };
        socket.join(`user-${user.id}`);
        callback({
          success: true,
          user: currentUser,
          message: "Login successful",
        });
        console.log(`✅ User logged in: ${user.displayName}`);
      } else {
        console.log(`❌ Login failed for: ${email || phone}`);
        callback({
          success: false,
          message: "Invalid email/phone or password",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      callback({
        success: false,
        message: "Login error",
      });
    }
  });

  socket.on("signup", (userData, callback) => {
    try {
      const db = readDB();
      const { email, phone, password, displayName } = userData;

      // Validate input
      if (!displayName || !password) {
        return callback({
          success: false,
          message: "Display name and password required",
        });
      }

      // Check if user already exists
      const existingUser = db.users.find((u) => u.email === email || u.phone === phone);
      if (existingUser) {
        return callback({
          success: false,
          message: "Email or phone already registered",
        });
      }

      // Create new user
      const newUser = {
        id: generateUserToken(),
        displayName,
        email: email || null,
        phone: phone || null,
        password: hashPassword(password),
        createdAt: new Date().toISOString(),
        stats: {
          totalRaces: 0,
          totalWins: 0,
          averageWPM: 0,
          averageAccuracy: 0,
        },
      };

      db.users.push(newUser);
      writeDB(db);

      currentUser = {
        id: newUser.id,
        displayName: newUser.displayName,
        email: newUser.email,
        phone: newUser.phone,
      };

      socket.join(`user-${newUser.id}`);
      callback({
        success: true,
        user: currentUser,
        message: "Account created successfully",
      });
      console.log(`✅ New user registered: ${displayName}`);
    } catch (error) {
      console.error("Signup error:", error);
      callback({
        success: false,
        message: "Signup error",
      });
    }
  });

  // ==================== ROOM EVENTS ====================
  socket.on("createRoom", (data, callback) => {
    try {
      console.log(`📌 createRoom event received from socket: ${socket.id}`);
      console.log(`👤 currentUser: ${currentUser ? currentUser.displayName : 'NOT LOGGED IN'}`);
      
      if (!currentUser) {
        console.log(`❌ User not logged in for room creation`);
        return callback({
          success: false,
          message: "Must be logged in",
        });
      }

      const db = readDB();
      const roomCode = generateRoomCode();
      const roomId = generateUserToken();

      const newRoom = {
        id: roomId,
        code: roomCode,
        creatorId: currentUser.id,
        creatorName: currentUser.displayName,
        players: [
          {
            id: currentUser.id,
            name: currentUser.displayName,
            status: "ready",
            socketId: socket.id,
          },
        ],
        status: "waiting", // waiting, racing, finished
        timer: data.timer || 60,
        startTime: null,
        createdAt: new Date().toISOString(),
      };

      db.rooms.push(newRoom);
      writeDB(db);

      currentRoom = roomId;
      socket.join(`room-${roomId}`);

      console.log(`✅ [createRoom] Room created successfully`)
      console.log(`   - Room code: ${roomCode}`)
      console.log(`   - Room ID: ${roomId}`)
      console.log(`   - Socket joined to: room-${roomId}`)
      console.log(`   - currentRoom set to: ${currentRoom}`)

      callback({
        success: true,
        roomId,
        code: roomCode,
        message: "Room created",
      });

      io.to(`room-${roomId}`).emit("roomCreated", {
        code: roomCode,
        roomId,
        players: newRoom.players,
      });
    } catch (error) {
      console.error("Create room error:", error);
      callback({
        success: false,
        message: "Error creating room",
      });
    }
  });

  socket.on("joinRoom", (data, callback) => {
    try {
      if (!currentUser) {
        return callback({
          success: false,
          message: "Must be logged in",
        });
      }

      const db = readDB();
      const room = db.rooms.find((r) => r.code === data.roomCode && r.status === "waiting");

      if (!room) {
        return callback({
          success: false,
          message: "Room not found or already started",
        });
      }

      // Add player to room
      room.players.push({
        id: currentUser.id,
        name: currentUser.displayName,
        status: "joined",
        isReady: false,
        socketId: socket.id,
      });

      writeDB(db);
      currentRoom = room.id;
      socket.join(`room-${room.id}`);

      console.log(`✅ [joinRoom] Player joined successfully`)
      console.log(`   - Room code: ${room.code}`)
      console.log(`   - Room ID: ${room.id}`)
      console.log(`   - Player: ${currentUser?.displayName}`)
      console.log(`   - Socket joined to: room-${room.id}`)
      console.log(`   - currentRoom set to: ${currentRoom}`)

      callback({
        success: true,
        roomId: room.id,
        code: room.code,
        players: room.players,
        message: "Joined room",
      });

      io.to(`room-${room.id}`).emit("roomJoined", {
        code: room.code,
        roomId: room.id,
        players: room.players,
      });

      io.to(`room-${room.id}`).emit("playerJoined", {
        count: room.players.length,
        players: room.players,
      });
    } catch (error) {
      console.error("Join room error:", error);
      callback({
        success: false,
        message: "Error joining room",
      });
    }
  });

  // ==================== LOBBY EVENTS ====================
  socket.on("setPlayerReady", (data) => {
    try {
      if (!currentUser || !currentRoom) return;

      const db = readDB();
      const room = db.rooms.find((r) => r.id === currentRoom);

      if (room) {
        const player = room.players.find((p) => p.id === currentUser.id);
        if (player) {
          player.isReady = data.isReady;
        }
        writeDB(db);

        io.to(`room-${currentRoom}`).emit("playerReadyChanged", {
          roomId: currentRoom,
          playerId: currentUser.id,
          isReady: data.isReady,
          players: room.players,
        });

        console.log(`✅ ${currentUser.displayName} is ${data.isReady ? 'ready' : 'not ready'}`);
      }
    } catch (error) {
      console.error("Set player ready error:", error);
    }
  });

  socket.on("startCountdown", (data) => {
    try {
      console.log('📢 [startCountdown] Event received')
      console.log('   - socket.id:', socket.id)
      console.log('   - currentRoom:', currentRoom)
      console.log('   - currentUser:', currentUser?.displayName)
      console.log('   - data:', data)
      
      if (!currentUser || !currentRoom) {
        console.log('❌ [startCountdown] currentUser or currentRoom is missing. Aborting.')
        return
      }

      const db = readDB();
      const room = db.rooms.find((r) => r.id === currentRoom);
      console.log('🔍 [startCountdown] Found room:', room?.code, 'status:', room?.status)

      if (room && room.status === "waiting") {
        console.log('✅ [startCountdown] Room is waiting. Setting countdown...')
        room.status = "countdown";
        room.countdownStart = Date.now();
        room.countdownDuration = data.timerDuration || 60;
        writeDB(db);

        console.log(`📡 [startCountdown] Emitting countdownStarted to room-${currentRoom}`)
        io.to(`room-${currentRoom}`).emit("countdownStarted", {
          roomId: currentRoom,
          duration: 10, // 10 second countdown before race
          gameTimer: data.timerDuration,
          players: room.players,
        });

        console.log(`⏰ [startCountdown] Setting 10-second timeout for race start...`);
        console.log(`   - Room code: ${room.code}`)
        console.log(`   - Room ID: ${room.id}`)
        console.log(`   - Room status will change: waiting → countdown`)
        console.log(`   - Timer duration: ${room.countdownDuration} seconds`)
        console.log(`   - Players in room: ${room.players.length}`)

        // After 10 seconds, start the race
        const timeoutId = setTimeout(() => {
          console.log('')
          console.log('⏰ [TIMEOUT FIRED] 10 seconds elapsed. Starting race check...')
          console.log('   - currentRoom at timeout:', currentRoom)
          console.log('   - socket.id at timeout:', socket.id)
          
          const updatedDb = readDB();
          const updatedRoom = updatedDb.rooms.find((r) => r.id === currentRoom);
          console.log('🔍 [TIMEOUT] Updated room:', updatedRoom?.code, 'status:', updatedRoom?.status)

          if (updatedRoom && updatedRoom.status === "countdown") {
            console.log('✅ [TIMEOUT] Room is still in countdown. Emitting race events...')
            updatedRoom.status = "racing";
            updatedRoom.startTime = Date.now();
            writeDB(updatedDb);

            console.log(`🚀 [TIMEOUT] Emitting raceStarting to room-${currentRoom}`)
            console.log('   - Recipients: All sockets in room-' + currentRoom)
            io.to(`room-${currentRoom}`).emit("raceStarting", {
              roomId: currentRoom,
              startTime: updatedRoom.startTime,
              timer: updatedRoom.countdownDuration,
              players: updatedRoom.players,
            });

            console.log(`🚀 [TIMEOUT] Emitting raceStarted to room-${currentRoom}`)
            io.to(`room-${currentRoom}`).emit("raceStarted", {
              roomId: currentRoom,
              startTime: updatedRoom.startTime,
              timer: updatedRoom.countdownDuration,
            });

            console.log(`🏁 [TIMEOUT] Race started successfully in room: ${updatedRoom.code}`);
          } else {
            console.log('❌ [TIMEOUT] Room not found or status is not countdown. Cannot start race.')
            if (!updatedRoom) console.log('   - Reason: Room not found in database')
            if (updatedRoom && updatedRoom.status !== "countdown") console.log('   - Reason: Room status is ' + updatedRoom.status)
          }
          console.log('')
        }, 10000);
        
        console.log(`⏰ [startCountdown] Timeout scheduled with ID: ${timeoutId}`)
      } else {
        console.log('❌ [startCountdown] Room not found or not in waiting status')
      }
    } catch (error) {
      console.error("❌ [startCountdown] Error:", error);
    }
  });

  socket.on("selectTimer", (data) => {
    try {
      if (!currentRoom) return;

      const db = readDB();
      const room = db.rooms.find((r) => r.id === currentRoom);

      if (room) {
        room.timer = data.timer;
        writeDB(db);

        io.to(`room-${currentRoom}`).emit("timerSelected", data.timer);
        console.log(`⏱️ Timer selected: ${data.timer}s in room ${room.code}`);
      }
    } catch (error) {
      console.error("Select timer error:", error);
    }
  });

  socket.on("leaveRoom", (data) => {
    try {
      if (!currentRoom) return;

      const db = readDB();
      const room = db.rooms.find((r) => r.id === currentRoom);

      if (room) {
        room.players = room.players.filter((p) => p.socketId !== socket.id);

        if (room.players.length === 0) {
          db.rooms = db.rooms.filter((r) => r.id !== currentRoom);
          console.log(`🗑️ Room deleted (empty): ${room.code}`);
        } else {
          writeDB(db);
          io.to(`room-${currentRoom}`).emit("playerLeft", {
            count: room.players.length,
            players: room.players,
          });
          console.log(`👤 Player left room: ${room.code}`);
        }
      }

      socket.leave(`room-${currentRoom}`);
      currentRoom = null;
    } catch (error) {
      console.error("Leave room error:", error);
    }
  });

  // ==================== RACE EVENTS ====================
  socket.on("startRace", (data) => {
    try {
      if (!currentRoom) return;

      const db = readDB();
      const room = db.rooms.find((r) => r.id === currentRoom);

      if (room && room.status === "waiting") {
        room.status = "racing";
        room.startTime = Date.now();
        writeDB(db);

        io.to(`room-${currentRoom}`).emit("raceStarted", {
          roomId: currentRoom,
          startTime: room.startTime,
          timer: room.timer,
          players: room.players,
        });

        console.log(`🏁 Race started in room: ${room.code}`);
      }
    } catch (error) {
      console.error("Start race error:", error);
    }
  });

  socket.on("updateProgress", (data) => {
    try {
      if (!currentRoom) return;

      const db = readDB();
      const room = db.rooms.find((r) => r.id === currentRoom);

      if (room) {
        const player = room.players.find((p) => p.id === currentUser.id);
        if (player) {
          player.wpm = data.wpm || 0;
          player.accuracy = data.accuracy || 0;
          player.progress = data.progress || 0;
        }

        writeDB(db);

        // Broadcast updated state to all players in room
        io.to(`room-${currentRoom}`).emit("raceState", {
          roomId: currentRoom,
          opponents: room.players.filter((p) => p.id !== currentUser.id),
          placement: room.players.sort((a, b) => (b.wpm || 0) - (a.wpm || 0)).findIndex((p) => p.id === currentUser.id) + 1,
          sessionResults: room.players,
        });
      }
    } catch (error) {
      console.error("Update progress error:", error);
    }
  });

  socket.on("finishRace", (data) => {
    try {
      if (!currentRoom) return;

      const db = readDB();
      const room = db.rooms.find((r) => r.id === currentRoom);

      if (room && currentUser) {
        const player = room.players.find((p) => p.id === currentUser.id);
        if (player) {
          player.wpm = data.wpm;
          player.accuracy = data.accuracy;
          player.time = data.time;
          player.finished = true;
        }

        // Add to leaderboard
        const leaderboardEntry = {
          id: generateUserToken(),
          userId: currentUser.id,
          userName: currentUser.displayName,
          wpm: data.wpm,
          accuracy: data.accuracy,
          time: data.time,
          roomCode: room.code,
          timestamp: new Date().toISOString(),
        };

        db.leaderboard.push(leaderboardEntry);

        // Update user stats
        const user = db.users.find((u) => u.id === currentUser.id);
        if (user) {
          user.stats.totalRaces++;
          // Check if this is a win (highest WPM in room)
          const isWin =
            data.wpm === Math.max(...room.players.map((p) => p.wpm || 0));
          if (isWin) user.stats.totalWins++;
          user.stats.averageWPM =
            (user.stats.averageWPM * (user.stats.totalRaces - 1) + data.wpm) /
            user.stats.totalRaces;
          user.stats.averageAccuracy =
            (user.stats.averageAccuracy * (user.stats.totalRaces - 1) + data.accuracy) /
            user.stats.totalRaces;
        }

        writeDB(db);

        // Emit results to all players
        const finalResults = room.players
          .map((p) => ({
            name: p.name,
            wpm: p.wpm || 0,
            accuracy: p.accuracy || 0,
            time: p.time || 0,
          }))
          .sort((a, b) => b.wpm - a.wpm);

        io.to(`room-${currentRoom}`).emit("raceFinished", {
          roomId: currentRoom,
          results: finalResults,
          placement:
            finalResults.findIndex((r) => r.name === currentUser.displayName) +
            1,
        });

        console.log(`✅ Race finished - ${currentUser.displayName}: ${data.wpm} WPM`);
      }
    } catch (error) {
      console.error("Finish race error:", error);
    }
  });

  // ==================== LEADERBOARD EVENTS ====================
  socket.on("getLeaderboard", (data, callback) => {
    try {
      const db = readDB();
      let leaderboard = db.leaderboard || [];

      if (data.mode === "global") {
        // Top 50 all-time
        leaderboard = leaderboard
          .sort((a, b) => b.wpm - a.wpm)
          .slice(0, 50);
      } else if (data.mode === "session" && data.roomCode) {
        // This session/room
        leaderboard = leaderboard
          .filter((entry) => entry.roomCode === data.roomCode)
          .sort((a, b) => b.wpm - a.wpm);
      }

      callback({
        success: true,
        leaderboard: leaderboard.map((entry, index) => ({
          rank: index + 1,
          name: entry.userName,
          wpm: Math.round(entry.wpm),
          accuracy: Math.round(entry.accuracy),
          time: entry.time,
        })),
      });
    } catch (error) {
      console.error("Get leaderboard error:", error);
      callback({
        success: false,
        message: "Error fetching leaderboard",
      });
    }
  });

  socket.on("getGlobalLeaderboard", (callback) => {
    try {
      const db = readDB();
      const leaderboard = (db.leaderboard || [])
        .sort((a, b) => b.wpm - a.wpm)
        .slice(0, 50)
        .map((entry, index) => ({
          rank: index + 1,
          name: entry.userName,
          wpm: Math.round(entry.wpm),
          accuracy: Math.round(entry.accuracy),
        }));

      callback({
        success: true,
        leaderboard,
      });
    } catch (error) {
      console.error("Get global leaderboard error:", error);
      callback({
        success: false,
        leaderboard: [],
      });
    }
  });

  // ==================== DISCONNECT ====================
  socket.on("disconnect", () => {
    console.log("\n❌ [DISCONNECT] User disconnected:")
    console.log(`   - socket.id: ${socket.id}`)
    console.log(`   - currentUser: ${currentUser?.displayName || 'NOT LOGGED IN'}`)
    console.log(`   - currentRoom: ${currentRoom || 'NOT IN ROOM'}`)

    // Remove player from room
    if (currentRoom) {
      const db = readDB();
      const room = db.rooms.find((r) => r.id === currentRoom);
      if (room) {
        console.log(`   - Room ${room.code} status: ${room.status}`)
        room.players = room.players.filter((p) => p.socketId !== socket.id);
        if (room.players.length === 0) {
          console.log(`   - Room ${room.code} is now empty, deleting...`)
          db.rooms = db.rooms.filter((r) => r.id !== currentRoom);
        } else {
          console.log(`   - Notifying remaining ${room.players.length} players`)
          io.to(`room-${currentRoom}`).emit("playerLeft", {
            count: room.players.length,
            players: room.players,
          });
        }
        writeDB(db);
      }
    }
    console.log('')
  });
});

// ==================== REST ENDPOINTS ====================
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/api/leaderboard", (req, res) => {
  try {
    const db = readDB();
    const mode = req.query.mode || "global";
    let leaderboard = db.leaderboard || [];

    if (mode === "global") {
      leaderboard = leaderboard
        .sort((a, b) => b.wpm - a.wpm)
        .slice(0, 50);
    }

    res.json({
      success: true,
      leaderboard: leaderboard.map((entry, index) => ({
        rank: index + 1,
        name: entry.userName,
        wpm: Math.round(entry.wpm),
        accuracy: Math.round(entry.accuracy),
      })),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching leaderboard",
    });
  }
});

app.get("/api/stats/:userId", (req, res) => {
  try {
    const db = readDB();
    const user = db.users.find((u) => u.id === req.params.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      stats: user.stats,
      user: {
        displayName: user.displayName,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching stats",
    });
  }
});

const PORT = 4000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 WebSocket server ready for connections`);
});
