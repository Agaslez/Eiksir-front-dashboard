#!/bin/bash

echo "🛑 Stopping ELIKSIR services..."
pkill -f "npm run dev" 2>/dev/null
pkill node 2>/dev/null
echo "✅ All services stopped"
