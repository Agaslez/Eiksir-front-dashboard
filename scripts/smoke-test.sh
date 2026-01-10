#!/bin/bash

# Pre-Deployment Smoke Tests
# Ten skrypt MUSI przejść przed każdym deploymentem
# Używaj w GitHub Actions / Vercel / Render pre-deploy hooks

set -e  # Exit on any error

echo "🔥 Running pre-deployment smoke tests..."
echo "================================================"

# Kolory dla outputu
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Sprawdź czy Node.js jest zainstalowany
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    exit 1
fi

# Sprawdź czy Playwright jest zainstalowany
if ! command -v npx playwright &> /dev/null; then
    echo -e "${YELLOW}⚠️  Installing Playwright...${NC}"
    npx playwright install --with-deps chromium
fi

# Uruchom TYLKO smoke testy (szybkie, krytyczne)
echo "🧪 Running smoke tests..."
npx playwright test smoke.spec.ts --project=chromium --reporter=list

# Sprawdź wynik
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ All smoke tests passed!${NC}"
    echo "================================================"
    echo "✅ System is healthy - deployment can proceed"
    exit 0
else
    echo -e "${RED}❌ SMOKE TESTS FAILED!${NC}"
    echo "================================================"
    echo "🚨 CRITICAL: System is not healthy"
    echo "🛑 DEPLOYMENT MUST BE STOPPED"
    echo ""
    echo "Common issues:"
    echo "  1. Frontend not responding (check build errors)"
    echo "  2. Backend not responding (check server logs)"
    echo "  3. Database connection failed"
    echo "  4. Critical component broken"
    echo ""
    echo "Fix the issues and try again."
    exit 1
fi
