# ELIKSIR Quick Smoke Test

Write-Host "=== ELIKSIR SMOKE TEST ===" -ForegroundColor Cyan
Write-Host ""

$API_URL = "http://localhost:3001"
$failed = 0
$passed = 0

# Test 1: Health Check
Write-Host "[1/6] Testing Health Endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$API_URL/api/auth/health" -Method Get -ErrorAction Stop
    if ($response.success -eq $true) {
        Write-Host "  ✅ PASS - Health check OK" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "  ❌ FAIL - Health check returned unsuccessful" -ForegroundColor Red
        $failed++
    }
} catch {
    Write-Host "  ❌ FAIL - Health endpoint unreachable: $_" -ForegroundColor Red
    $failed++
}

# Test 2: Login
Write-Host "[2/6] Testing Login Endpoint..." -ForegroundColor Yellow
try {
    $loginBody = @{
        email = "admin@eliksir.pl"
        password = "admin123"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$API_URL/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json" -ErrorAction Stop
    
    if ($response.success -and $response.accessToken) {
        Write-Host "  ✅ PASS - Login successful, token received" -ForegroundColor Green
        $TOKEN = $response.accessToken
        $passed++
    } else {
        Write-Host "  ❌ FAIL - Login did not return token" -ForegroundColor Red
        $failed++
    }
} catch {
    Write-Host "  ❌ FAIL - Login failed: $_" -ForegroundColor Red
    $failed++
}

# Test 3: /me endpoint
Write-Host "[3/6] Testing /me Endpoint..." -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $TOKEN"
    }
    $response = Invoke-RestMethod -Uri "$API_URL/api/auth/me" -Method Get -Headers $headers -ErrorAction Stop
    
    if ($response.success -and $response.user) {
        Write-Host "  ✅ PASS - User data retrieved" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "  ❌ FAIL - /me did not return user" -ForegroundColor Red
        $failed++
    }
} catch {
    Write-Host "  ❌ FAIL - /me endpoint failed: $_" -ForegroundColor Red
    $failed++
}

# Test 4: Content Images
Write-Host "[4/6] Testing Content Images Endpoint..." -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $TOKEN"
    }
    $response = Invoke-RestMethod -Uri "$API_URL/api/content/images" -Method Get -Headers $headers -ErrorAction Stop
    
    if ($response.success) {
        Write-Host "  ✅ PASS - Images endpoint OK" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "  ❌ FAIL - Images endpoint unsuccessful" -ForegroundColor Red
        $failed++
    }
} catch {
    Write-Host "  ❌ FAIL - Images endpoint failed: $_" -ForegroundColor Red
    $failed++
}

# Test 5: Calculator Settings
Write-Host "[5/6] Testing Calculator Endpoint..." -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $TOKEN"
    }
    $response = Invoke-RestMethod -Uri "$API_URL/api/calculator/settings" -Method Get -Headers $headers -ErrorAction Stop
    
    if ($response.success -and $response.settings) {
        Write-Host "  ✅ PASS - Calculator settings OK" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "  ❌ FAIL - Calculator settings unsuccessful" -ForegroundColor Red
        $failed++
    }
} catch {
    Write-Host "  ❌ FAIL - Calculator endpoint failed: $_" -ForegroundColor Red
    $failed++
}

# Test 6: SEO Stats
Write-Host "[6/6] Testing SEO Stats Endpoint..." -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $TOKEN"
    }
    $response = Invoke-RestMethod -Uri "$API_URL/api/seo/stats" -Method Get -Headers $headers -ErrorAction Stop
    
    if ($response.success) {
        Write-Host "  ✅ PASS - SEO stats OK" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "  ❌ FAIL - SEO stats unsuccessful" -ForegroundColor Red
        $failed++
    }
} catch {
    Write-Host "  ❌ FAIL - SEO stats failed: $_" -ForegroundColor Red
    $failed++
}

# Summary
Write-Host ""
Write-Host "=== SMOKE TEST SUMMARY ===" -ForegroundColor Cyan
Write-Host "Passed: $passed/6" -ForegroundColor Green
Write-Host "Failed: $failed/6" -ForegroundColor Red

if ($failed -eq 0) {
    Write-Host ""
    Write-Host "✅ ALL TESTS PASSED!" -ForegroundColor Green
    exit 0
} else {
    Write-Host ""
    Write-Host "❌ SOME TESTS FAILED" -ForegroundColor Red
    exit 1
}
