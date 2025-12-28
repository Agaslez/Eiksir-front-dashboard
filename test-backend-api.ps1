# ELIKSIR Backend API Tests (PowerShell)

$API_URL = "http://localhost:3001"
$TOKEN = ""

Write-Host "=== ELIKSIR Backend API Tests ===" -ForegroundColor Cyan
Write-Host ""

# Test 1: Health Check
Write-Host "[1] Health Check..." -ForegroundColor Yellow
$response = Invoke-RestMethod -Uri "$API_URL/api/auth/health" -Method Get
$response | ConvertTo-Json
Write-Host ""

# Test 2: Login
Write-Host "[2] Login as admin@eliksir.pl..." -ForegroundColor Yellow
$loginBody = @{
    email = "admin@eliksir.pl"
    password = "admin123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$API_URL/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    $loginResponse | ConvertTo-Json
    $TOKEN = $loginResponse.accessToken
    
    if ($TOKEN) {
        Write-Host "✅ Token received: $($TOKEN.Substring(0, [Math]::Min(20, $TOKEN.Length)))..." -ForegroundColor Green
    } else {
        Write-Host "❌ Login failed - no token received" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Login error: $_" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Test 3: /me endpoint
Write-Host "[3] Testing /api/auth/me..." -ForegroundColor Yellow
$headers = @{
    "Authorization" = "Bearer $TOKEN"
}
$meResponse = Invoke-RestMethod -Uri "$API_URL/api/auth/me" -Method Get -Headers $headers
$meResponse | ConvertTo-Json
Write-Host ""

# Test 4: SEO Stats
Write-Host "[4] Testing /api/seo/stats..." -ForegroundColor Yellow
$statsResponse = Invoke-RestMethod -Uri "$API_URL/api/seo/stats" -Method Get -Headers $headers
$statsResponse | ConvertTo-Json
Write-Host ""

# Test 5: Content Images
Write-Host "[5] Testing /api/content/images..." -ForegroundColor Yellow
$imagesResponse = Invoke-RestMethod -Uri "$API_URL/api/content/images" -Method Get -Headers $headers
$imagesResponse | ConvertTo-Json
Write-Host ""

# Test 6: Calculator Settings
Write-Host "[6] Testing /api/calculator/settings..." -ForegroundColor Yellow
$calcResponse = Invoke-RestMethod -Uri "$API_URL/api/calculator/settings" -Method Get -Headers $headers
$calcResponse | ConvertTo-Json
Write-Host ""

Write-Host "=== Tests Complete ===" -ForegroundColor Cyan
