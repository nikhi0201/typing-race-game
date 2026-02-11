#!/usr/bin/env python3
"""
Test client to simulate the game flow and debug socket events
"""
import socketio
import time
import json
import hashlib

# Create socket connection
sio = socketio.Client()

# Test data
test_email = "demo@example.com"
test_password = "password"  # plaintext
test_name = "Test Player"
test_room_code = None
test_room_id = None

# Event handlers
@sio.event
def connect():
    print("\n✅ [CLIENT] Connected to server")
    time.sleep(0.5)
    # Try to login
    password_hash = hashlib.sha256(test_password.encode()).hexdigest()
    print(f"\n📧 [CLIENT] Attempting login with email: {test_email}")
    print(f"   Password hash: {password_hash}")
    sio.emit('login', {
        'email': test_email,
        'password': test_password
    }, callback=handle_login_response)

@sio.event
def disconnect():
    print("❌ [CLIENT] Disconnected from server")

def handle_login_response(response):
    print(f"\n✅ [CLIENT] Login response: {json.dumps(response, indent=2)}")
    if response.get('success'):
        time.sleep(0.5)
        print(f"\n🎮 [CLIENT] Creating room...")
        sio.emit('createRoom', {
            'playerName': test_name,
            'timer': 60
        }, callback=handle_create_room_response)

def handle_create_room_response(response):
    global test_room_code, test_room_id
    print(f"\n✅ [CLIENT] Create room response: {json.dumps(response, indent=2)}")
    if response.get('success'):
        test_room_code = response.get('code')
        test_room_id = response.get('roomId')
        print(f"   Room Code: {test_room_code}")
        print(f"   Room ID: {test_room_id}")
        time.sleep(0.5)
        print(f"\n⏱️ [CLIENT] Starting countdown with timer: 10 seconds...")
        sio.emit('startCountdown', {
            'roomId': test_room_code,
            'timerDuration': 10
        })

@sio.on('roomCreated')
def on_room_created(data):
    print(f"\n📡 [CLIENT] Received roomCreated event: {json.dumps(data, indent=2)}")

@sio.on('countdownStarted')
def on_countdown_started(data):
    print(f"\n⏱️ [CLIENT] Received countdownStarted event: {json.dumps(data, indent=2)}")
    print(f"    Will wait 10 seconds for raceStarting event...")

@sio.on('raceStarting')
def on_race_starting(data):
    print(f"\n🏁 [CLIENT] 🚀 🚀 🚀 Received raceStarting event! 🚀 🚀 🚀")
    print(f"   Data: {json.dumps(data, indent=2)}")
    sio.disconnect()

# Run the test
if __name__ == "__main__":
    print("=" * 70)
    print("TYPING RACE GAME - SOCKET TEST CLIENT")
    print("=" * 70)
    print("\nConnecting to server at localhost:4000...")
    
    try:
        sio.connect('http://localhost:4000')
        print("\nWaiting for events (will timeout after 15 seconds)...")
        sio.wait(timeout=15)
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        if sio.connected:
            sio.disconnect()
        print("\n" + "=" * 70)
        print("TEST COMPLETE")
        print("=" * 70)
