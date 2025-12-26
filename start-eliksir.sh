#!/bin/bash

echo ""
echo "============================================"
echo "🚀 ELIKSIR BAR - Development Startup"
echo "============================================"
echo ""

# Navigate to project root
cd "$(dirname "$0")"

# Start Backend
echo "1️⃣  Starting BACKEND (Express.js + PostgreSQL)..."
cd stefano-eliksir-backend
npm run dev > ../backend.log 2>&1 &
BACKEND_PID=$!
echo "   ✅ Backend PID: $BACKEND_PID"
cd ..
sleep 3

# Start Frontend
echo "2️⃣  Starting FRONTEND (React + Vite)..."
cd eliksir-frontend
npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
echo "   ✅ Frontend PID: $FRONTEND_PID"
cd ..
sleep 5

echo ""
echo "============================================"
echo "✅ SERVICES STARTED"
echo "============================================"
echo ""
echo "🌐 FRONTEND: http://localhost:5173"
echo "   Admin Login: http://localhost:5173/admin/login"
echo ""
echo "⚙️  BACKEND: http://localhost:3001"
echo "   API Health: http://localhost:3001/api/health"
echo ""
echo "🔐 TEST CREDENTIALS:"
echo "   Email: admin@eliksir-bar.pl"
echo "   Password: Admin123!"
echo ""
echo "🛑 TO STOP: pkill node"
echo ""
echo "📊 LOGS:"
echo "   Backend: tail -f backend.log"
echo "   Frontend: tail -f frontend.log"
echo ""
echo "============================================"
echo "Happy coding! 🎉"
echo "============================================"
