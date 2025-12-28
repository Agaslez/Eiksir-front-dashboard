#!/bin/bash
# Backend API Tests

API_URL="http://localhost:3001"
TOKEN=""

echo "=== ELIKSIR Backend API Tests ==="
echo ""

# Test 1: Health Check
echo "[1] Health Check..."
curl -s "$API_URL/api/auth/health" | jq .
echo ""

# Test 2: Login
echo "[2] Login as admin@eliksir.pl..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@eliksir.pl", "password": "admin123"}')

echo "$LOGIN_RESPONSE" | jq .

TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.accessToken // empty')

if [ -z "$TOKEN" ]; then
  echo "❌ Login failed - no token received"
  exit 1
fi

echo "✅ Token received: ${TOKEN:0:20}..."
echo ""

# Test 3: /me endpoint
echo "[3] Testing /api/auth/me..."
curl -s "$API_URL/api/auth/me" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""

# Test 4: SEO Stats
echo "[4] Testing /api/seo/stats..."
curl -s "$API_URL/api/seo/stats" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""

# Test 5: Content Images
echo "[5] Testing /api/content/images..."
curl -s "$API_URL/api/content/images" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""

# Test 6: Calculator Settings
echo "[6] Testing /api/calculator/settings..."
curl -s "$API_URL/api/calculator/settings" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""

echo "=== Tests Complete ==="
