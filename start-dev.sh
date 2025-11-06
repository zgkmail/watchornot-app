#!/bin/bash

# WatchOrNot - Development Server Starter
# This script starts both the frontend and backend servers

echo "🎬 Starting WatchOrNot Development Servers..."
echo ""

# Check if node_modules exists in root
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
    echo ""
fi

# Check if backend node_modules exists
if [ ! -d "backend/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd backend
    npm install
    cd ..
    echo ""
fi

# Check if backend .env exists
if [ ! -f "backend/.env" ]; then
    echo "⚠️  WARNING: backend/.env file not found!"
    echo "Please create backend/.env from backend/.env.example"
    echo "and add your API keys before continuing."
    exit 1
fi

echo "🚀 Starting servers..."
echo ""

# Start backend in background
echo "Starting backend server on http://localhost:3001..."
cd backend
npm start &
BACKEND_PID=$!
cd ..

# Give backend time to start
sleep 2

# Start frontend
echo "Starting frontend server on http://localhost:3000..."
npm run dev

# When frontend is stopped (Ctrl+C), kill backend too
kill $BACKEND_PID 2>/dev/null
echo ""
echo "✅ Servers stopped"
