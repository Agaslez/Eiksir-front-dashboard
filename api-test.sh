#!/bin/bash

# ELIKSIR API Test Script
# Use this in Terminal 3 for quick API testing

echo "🧪 ELIKSIR API TEST SCRIPT"
echo "=========================="
echo ""

API_URL="http://localhost:3001"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

function test_health() {
    echo -e "${YELLOW}📊 Testing Health Endpoint...${NC}"
    curl -s ${API_URL}/api/health | python -m json.tool
    echo ""
}

function test_login() {
    echo -e "${YELLOW}🔐 Testing Login...${NC}"
    RESPONSE=$(curl -s -X POST ${API_URL}/api/auth/login \
        -H "Content-Type: application/json" \
        -d '{"email":"admin@eliksir-bar.pl","password":"Admin123!"}')
    
    echo "$RESPONSE" | python -m json.tool
    
    # Extract token
    TOKEN=$(echo "$RESPONSE" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
    
    if [ ! -z "$TOKEN" ]; then
        echo ""
        echo -e "${GREEN}✅ Token otrzymany!${NC}"
        echo "Token: ${TOKEN:0:50}..."
        echo ""
        echo "Zapisuję token do /tmp/eliksir_token..."
        echo "$TOKEN" > /tmp/eliksir_token
    else
        echo -e "${RED}❌ Login failed${NC}"
    fi
    echo ""
}

function test_me() {
    echo -e "${YELLOW}👤 Testing /api/auth/me...${NC}"
    
    if [ ! -f /tmp/eliksir_token ]; then
        echo -e "${RED}❌ Brak tokenu! Najpierw uruchom: test_login${NC}"
        return 1
    fi
    
    TOKEN=$(cat /tmp/eliksir_token)
    curl -s ${API_URL}/api/auth/me \
        -H "Authorization: Bearer $TOKEN" | python -m json.tool
    echo ""
}

function test_seo_track() {
    echo -e "${YELLOW}📈 Testing SEO Track (public)...${NC}"
    curl -s -X POST ${API_URL}/api/seo/track \
        -H "Content-Type: application/json" \
        -d '{"path":"/test","referrer":"google.com"}' | python -m json.tool
    echo ""
}

function test_seo_stats() {
    echo -e "${YELLOW}📊 Testing SEO Stats (admin only)...${NC}"
    
    if [ ! -f /tmp/eliksir_token ]; then
        echo -e "${RED}❌ Brak tokenu! Najpierw uruchom: test_login${NC}"
        return 1
    fi
    
    TOKEN=$(cat /tmp/eliksir_token)
    curl -s ${API_URL}/api/seo/stats \
        -H "Authorization: Bearer $TOKEN" | python -m json.tool | head -30
    echo ""
}

function run_all() {
    test_health
    sleep 1
    test_login
    sleep 1
    test_me
    sleep 1
    test_seo_track
    sleep 1
    test_seo_stats
}

# Menu
echo "Dostępne komendy:"
echo "  test_health       - Test /api/health"
echo "  test_login        - Test login i zapisz token"
echo "  test_me           - Test /api/auth/me (wymaga token)"
echo "  test_seo_track    - Test SEO tracking (public)"
echo "  test_seo_stats    - Test SEO stats (admin only)"
echo "  run_all           - Uruchom wszystkie testy"
echo ""
echo "Przykład:"
echo "  source api-test.sh"
echo "  test_login"
echo "  test_me"
echo ""
