# Pre-Deployment Smoke Tests (PowerShell version)
# Dla Windows / CI/CD które używają PowerShell

Write-Host "🔥 Running pre-deployment smoke tests..." -ForegroundColor Cyan
Write-Host "================================================"

# Sprawdź Node.js
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed" -ForegroundColor Red
    exit 1
}

# Sprawdź Playwright
try {
    npx playwright --version | Out-Null
} catch {
    Write-Host "⚠️  Installing Playwright..." -ForegroundColor Yellow
    npx playwright install --with-deps chromium
}

# Uruchom smoke testy
Write-Host "🧪 Running smoke tests..." -ForegroundColor Cyan
npx playwright test smoke.spec.ts --project=chromium --reporter=list

# Sprawdź wynik
if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ All smoke tests passed!" -ForegroundColor Green
    Write-Host "================================================"
    Write-Host "✅ System is healthy - deployment can proceed" -ForegroundColor Green
    exit 0
} else {
    Write-Host ""
    Write-Host "❌ SMOKE TESTS FAILED!" -ForegroundColor Red
    Write-Host "================================================"
    Write-Host "🚨 CRITICAL: System is not healthy" -ForegroundColor Red
    Write-Host "🛑 DEPLOYMENT MUST BE STOPPED" -ForegroundColor Red
    Write-Host ""
    Write-Host "Common issues:"
    Write-Host "  1. Frontend not responding (check build errors)"
    Write-Host "  2. Backend not responding (check server logs)"
    Write-Host "  3. Database connection failed"
    Write-Host "  4. Critical component broken"
    Write-Host ""
    Write-Host "Fix the issues and try again." -ForegroundColor Yellow
    exit 1
}
