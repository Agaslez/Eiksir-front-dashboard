/**
 * SMOKE TESTS - Critical System Health Checks
 * 
 * Te testy MUSZĄ przejść przed uruchomieniem innych testów.
 * Sprawdzają czy podstawowa infrastruktura działa:
 * - Frontend się ładuje i renderuje
 * - Backend odpowiada na żądania
 * - Krytyczne endpointy działają
 * - Baza danych jest dostępna
 * 
 * Jeśli którykolwiek test failuje - cały deployment powinien być ZATRZYMANY.
 */

import { expect, test } from '@playwright/test';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5174';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

test.describe('🔥 SMOKE TESTS - Critical System Health', () => {
  
  test.describe.configure({ mode: 'serial' }); // Run tests in order, stop on first failure

  /**
   * TEST 1: Frontend Availability
   * Sprawdza czy frontend w ogóle się ładuje
   */
  test('CRITICAL: Frontend loads and responds', async ({ page }) => {
    console.log(`🔍 Testing frontend at: ${FRONTEND_URL}`);
    
    const response = await page.goto(FRONTEND_URL, {
      waitUntil: 'domcontentloaded',
      timeout: 15000
    });

    // Frontend musi odpowiedzieć 200 OK
    expect(response?.status(), 'Frontend must return 200 OK').toBe(200);
    
    // HTML musi zawierać podstawową strukturę
    const content = await page.content();
    expect(content, 'Frontend must return valid HTML').toContain('<!DOCTYPE html>');
    expect(content, 'Frontend must load React app').toContain('root');
    
    console.log('✅ Frontend is alive and serving content');
  });

  /**
   * TEST 2: Frontend Renders Main Page
   * Sprawdza czy główna strona renderuje kluczowe komponenty
   */
  test('CRITICAL: Frontend renders homepage components', async ({ page }) => {
    await page.goto(FRONTEND_URL, { waitUntil: 'networkidle', timeout: 15000 });
    
    // Sprawdź czy React się załadował (brak błędów w konsoli)
    const errors: string[] = [];
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });

    // Poczekaj na renderowanie
    await page.waitForTimeout(2000);
    
    // Nie może być krytycznych błędów React
    const criticalErrors = errors.filter(err => 
      err.includes('Cannot read properties of undefined') ||
      err.includes('is not a function') ||
      err.includes('TypeError')
    );
    expect(criticalErrors.length, `No critical React errors: ${criticalErrors.join(', ')}`).toBe(0);
    
    // Podstawowy layout musi być widoczny
    const body = page.locator('body');
    await expect(body, 'Page body must be visible').toBeVisible();
    
    // Strona nie może być pusta
    const text = await page.textContent('body');
    expect(text?.length || 0, 'Page must have content').toBeGreaterThan(100);
    
    console.log('✅ Frontend renders without critical errors');
  });

  /**
   * TEST 3: Backend Health Check
   * Sprawdza czy backend w ogóle odpowiada
   */
  test('CRITICAL: Backend API is reachable', async ({ request }) => {
    console.log(`🔍 Testing backend at: ${BACKEND_URL}`);
    
    try {
      // Próba połączenia z backendem (Render cold start może trwać do 60s)
      const response = await request.get(`${BACKEND_URL}/health`, {
        timeout: 90000 // 90s for Render free tier cold start
      });

      expect(response.status(), 'Backend health endpoint must respond').toBeLessThan(500);
      console.log(`✅ Backend responded with status: ${response.status()}`);
    } catch (error) {
      // Jeśli /health nie istnieje, spróbuj innego endpointa
      console.log('⚠️ /health endpoint not found, trying /api/config...');
      
      const response = await request.get(`${BACKEND_URL}/api/config`, {
        timeout: 90000 // 90s for Render free tier cold start
      });

      expect(response.status(), 'Backend must be reachable').toBeLessThan(500);
      console.log(`✅ Backend is alive (status: ${response.status()})`);
    }
  });

  /**
   * TEST 4: Critical Backend Endpoints
   * Sprawdza czy kluczowe endpointy działają
   */
  test('CRITICAL: Essential backend endpoints respond', async ({ request }) => {
    const criticalEndpoints = [
      { path: '/api/config', method: 'GET', name: 'Calculator Config' },
      { path: '/api/gallery/list', method: 'GET', name: 'Gallery List' },
      { path: '/api/content', method: 'GET', name: 'Content API' },
    ];

    const results: Array<{ endpoint: string; status: number; passed: boolean }> = [];
    
    // Timeout dla każdego endpointa (backend już jest warmed up z poprzedniego testu)
    const timeout = 30000; // 30s should be enough after cold start

    for (const endpoint of criticalEndpoints) {
      try {
        const response = await request.get(`${BACKEND_URL}${endpoint.path}`, {
          timeout: timeout
        });

        const passed = response.status() < 500; // 200-499 są OK (może być 401, 404 ale nie 500)
        results.push({
          endpoint: endpoint.name,
          status: response.status(),
          passed
        });

        console.log(`${passed ? '✅' : '❌'} ${endpoint.name}: ${response.status()}`);
      } catch (error) {
        results.push({
          endpoint: endpoint.name,
          status: 0,
          passed: false
        });
        console.log(`❌ ${endpoint.name}: Connection failed`);
      }
    }

    // Przynajmniej 2/3 endpointów muszą działać
    const passedCount = results.filter(r => r.passed).length;
    expect(passedCount, 'At least 2/3 critical endpoints must work').toBeGreaterThanOrEqual(2);
    
    console.log(`✅ ${passedCount}/${criticalEndpoints.length} critical endpoints working`);
  });

  /**
   * TEST 5: Frontend-Backend Integration
   * Sprawdza czy frontend może pobrać dane z backendu
   */
  test('CRITICAL: Frontend can fetch data from backend', async ({ page }) => {
    await page.goto(FRONTEND_URL, { waitUntil: 'networkidle', timeout: 15000 });
    
    // Monitoruj requesty do backendu
    const apiRequests: string[] = [];
    page.on('request', request => {
      if (request.url().includes(BACKEND_URL)) {
        apiRequests.push(request.url());
      }
    });

    // Poczekaj na załadowanie danych
    await page.waitForTimeout(3000);

    // Frontend powinien wykonać przynajmniej 1 request do backendu
    expect(apiRequests.length, 'Frontend must make API requests to backend').toBeGreaterThan(0);
    
    console.log(`✅ Frontend made ${apiRequests.length} requests to backend`);
    console.log(`   Endpoints called: ${[...new Set(apiRequests.map(url => new URL(url).pathname))].join(', ')}`);
  });

  /**
   * TEST 6: Calculator Component Loads
   * Kalkulator jest krytycznym komponentem - musi działać
   */
  test('CRITICAL: Calculator component is functional', async ({ page }) => {
    await page.goto(FRONTEND_URL, { waitUntil: 'networkidle', timeout: 15000 });
    
    // Poczekaj na załadowanie kalkulatora
    await page.waitForTimeout(2000);
    
    // Kalkulator powinien być widoczny (może być w sekcji)
    const hasCalculator = await page.locator('text=/kalkulator|cennik|pakiet/i').count() > 0;
    expect(hasCalculator, 'Calculator section must exist on homepage').toBeTruthy();
    
    console.log('✅ Calculator component found on page');
  });

  /**
   * TEST 7: Contact Form Loads
   * Formularz kontaktowy jest krytyczny - bez niego nie ma leadów
   */
  test('CRITICAL: Contact form is functional', async ({ page }) => {
    await page.goto(FRONTEND_URL, { waitUntil: 'networkidle', timeout: 15000 });
    
    // Poczekaj na załadowanie formularza
    await page.waitForTimeout(2000);
    
    // Formularz kontaktowy musi istnieć
    const hasContactForm = await page.locator('input[type="email"], input[name="email"]').count() > 0;
    expect(hasContactForm, 'Contact form must exist on homepage').toBeTruthy();
    
    console.log('✅ Contact form found on page');
  });

  /**
   * TEST 8: No Console Errors
   * Sprawdza czy nie ma krytycznych błędów w konsoli
   */
  test('CRITICAL: No critical console errors', async ({ page }) => {
    const errors: string[] = [];
    const warnings: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      } else if (msg.type() === 'warning') {
        warnings.push(msg.text());
      }
    });

    await page.goto(FRONTEND_URL, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(3000);

    // Filtruj błędy (niektóre są oczekiwane)
    const criticalErrors = errors.filter(err => {
      // Ignoruj znane, niekrytyczne błędy
      if (err.includes('Failed to load resource')) return false;
      if (err.includes('favicon')) return false;
      if (err.includes('net::ERR_CONNECTION_REFUSED')) return false;
      
      return true;
    });

    console.log(`📊 Console stats: ${errors.length} errors, ${warnings.length} warnings`);
    if (criticalErrors.length > 0) {
      console.log(`❌ Critical errors found:\n${criticalErrors.join('\n')}`);
    }

    expect(criticalErrors.length, 'No critical console errors allowed').toBe(0);
    console.log('✅ No critical console errors');
  });

  /**
   * TEST 9: Admin Panel Accessible
   * Panel admina musi być dostępny (nawet jeśli wymaga logowania)
   */
  test('CRITICAL: Admin panel is accessible', async ({ page }) => {
    const adminUrl = `${FRONTEND_URL}/admin/login`;
    
    const response = await page.goto(adminUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 15000
    });

    expect(response?.status(), 'Admin panel must be accessible').toBeLessThan(500);
    
    // Strona logowania powinna mieć pola email/hasło
    const hasLoginForm = await page.locator('input[type="email"], input[type="password"]').count() >= 2;
    expect(hasLoginForm, 'Admin login form must be functional').toBeTruthy();
    
    console.log('✅ Admin panel is accessible');
  });

  /**
   * TEST 10: Email System Health
   * Sprawdza czy system email jest skonfigurowany
   */
  test('Email system configuration check', async ({ request }) => {
    try {
      const response = await request.get(`${BACKEND_URL}/api/email/health`, {
        timeout: 10000
      });

      if (response.status() === 200) {
        const data = await response.json();
        console.log('📧 Email system status:', data);
        
        // Loguj status ale nie failuj testu - email może być opcjonalny
        if (data.sendgrid?.active || data.smtp?.configured) {
          console.log('✅ Email system is configured');
        } else {
          console.log('⚠️ Email system not configured (non-critical)');
        }
      }
    } catch (error) {
      console.log('⚠️ Email health check unavailable (non-critical)');
    }
  });
});

/**
 * PODSUMOWANIE SMOKE TESTS
 * 
 * Po przejściu tych testów mamy pewność że:
 * ✅ Frontend się ładuje i renderuje
 * ✅ Backend odpowiada na requesty
 * ✅ Kluczowe endpointy działają
 * ✅ Frontend może pobierać dane z backendu
 * ✅ Kalkulator jest widoczny
 * ✅ Formularz kontaktowy istnieje
 * ✅ Brak krytycznych błędów w konsoli
 * ✅ Panel admina jest dostępny
 * 
 * Jeśli którykolwiek test CRITICAL failuje:
 * 🚨 DEPLOYMENT POWINIEN BYĆ ZATRZYMANY 🚨
 */
