import { expect, test } from '@playwright/test';

/**
 * E2E Tests - API Consistency & Component Integration
 * 
 * Sprawdza czy wszystkie komponenty używają tego samego centralized API configuration
 * i poprawnie łączą się z backendem.
 * 
 * OPTIMIZATIONS:
 * - Reduced waitForTimeout to minimum (networkidle, domcontentloaded)
 * - Increased timeouts for cold start tolerance (Render.com free tier)
 * - Parallel execution with 2 workers in CI
 */

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const BACKEND_URL = process.env.BACKEND_URL || 'https://eliksir-backend-front-dashboard.onrender.com';

test.describe('API Consistency Tests', () => {
  test.describe('HorizontalGallery Component (Panorama)', () => {
    test('should use API.galleryPanorama endpoint', async ({ page }) => {
      const apiRequests: string[] = [];
      page.on('request', (request) => {
        if (request.url().includes('/api/content/gallery')) {
          apiRequests.push(request.url());
        }
      });

      await page.goto(FRONTEND_URL);
      await page.waitForLoadState('networkidle', { timeout: 30000 });

      // Verify correct API endpoint was called
      expect(apiRequests.length).toBeGreaterThan(0);
      const hasPanoramaEndpoint = apiRequests.some(url => 
        url.includes('/api/content/gallery/public') && url.includes('category=wszystkie')
      );
      expect(hasPanoramaEndpoint).toBe(true);
    });

    test('should display horizontal gallery', async ({ page }) => {
      await page.goto(FRONTEND_URL);
      await page.waitForLoadState('domcontentloaded');

      // Check if panorama images are visible (should be near top of page)
      const panoramaImages = page.locator('img[alt*="Eliksir"]').first();
      await expect(panoramaImages).toBeVisible({ timeout: 20000 });
    });

    test('should not have infinite loader', async ({ page }) => {
      await page.goto(FRONTEND_URL);
      
      // Check if loader appears
      const loader = page.locator('text=/Ładowanie galerii/i').first();
      if (await loader.isVisible()) {
        // Loader should disappear within 30 seconds (cold start tolerance)
        await expect(loader).not.toBeVisible({ timeout: 35000 });
      }
    });
  });

  test.describe('Calculator Component', () => {
    test('should use API.calculatorConfig endpoint', async ({ page }) => {
      // Monitor network requests
      const apiRequests: string[] = [];
      page.on('request', (request) => {
        if (request.url().includes('/api/calculator')) {
          apiRequests.push(request.url());
        }
      });

      await page.goto(FRONTEND_URL);
      
      // Scroll to Calculator section
      await page.locator('#kalkulator').scrollIntoViewIfNeeded();
      
      // Wait for Calculator to load
      await page.waitForTimeout(2000);

      // Verify correct API endpoint was called
      expect(apiRequests.length).toBeGreaterThan(0);
      expect(apiRequests[0]).toBe(`${BACKEND_URL}/api/calculator/config`);
    });

    test('should display calculator UI correctly', async ({ page }) => {
      await page.goto(FRONTEND_URL);
      await page.locator('#kalkulator').scrollIntoViewIfNeeded();

      // Check if package selection is visible
      await expect(page.locator('text=Pakiet')).toBeVisible();
      await expect(page.locator('text=Family Party')).toBeVisible();
      
      // Check if guests slider is visible
      await expect(page.locator('text=Liczba gości')).toBeVisible();
      await expect(page.locator('input[type="range"]')).toBeVisible();
      
      // Check if addons are visible
      await expect(page.locator('text=Dodatki')).toBeVisible();
      await expect(page.locator('text=Fontanna czekolady')).toBeVisible();
    });

    test('should interact with calculator without errors', async ({ page }) => {
      await page.goto(FRONTEND_URL);
      await page.locator('#kalkulator').scrollIntoViewIfNeeded();

      // Select Premium package
      await page.click('text=Premium Party');
      
      // Adjust guests slider
      const slider = page.locator('input[type="range"]').first();
      await slider.fill('80');
      
      // Toggle fountain addon
      const fountainCheckbox = page.locator('input[type="checkbox"]').first();
      await fountainCheckbox.check();

      // Verify cost summary is updated
      await expect(page.locator('text=/Koszt całkowity/i')).toBeVisible();
      await expect(page.locator('text=/zł/i')).toBeVisible();
    });

    test('should not have console errors during calculator operation', async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      await page.goto(FRONTEND_URL);
      await page.locator('#kalkulator').scrollIntoViewIfNeeded();
      await page.waitForTimeout(3000);

      // Filter out Cloudinary tracking warnings (external, not our code)
      const relevantErrors = consoleErrors.filter(
        err => !err.includes('Tracking Prevention') && !err.includes('cloudinary')
      );

      expect(relevantErrors).toHaveLength(0);
    });
  });

  test.describe('Gallery Component', () => {
    test('should use API.galleryPanorama endpoint', async ({ page }) => {
      const apiRequests: string[] = [];
      page.on('request', (request) => {
        if (request.url().includes('/api/content/gallery')) {
          apiRequests.push(request.url());
        }
      });

      await page.goto(FRONTEND_URL);
      await page.locator('text=Nasza Galeria').scrollIntoViewIfNeeded();
      await page.waitForTimeout(2000);

      // Verify correct API endpoint was called
      expect(apiRequests.length).toBeGreaterThan(0);
      const hasCorrectEndpoint = apiRequests.some(url => 
        url.includes('/api/content/gallery/public')
      );
      expect(hasCorrectEndpoint).toBe(true);
    });

    test('should display gallery images', async ({ page }) => {
      await page.goto(FRONTEND_URL);
      await page.locator('text=Nasza Galeria').scrollIntoViewIfNeeded();
      await page.waitForTimeout(3000);

      // Check if gallery grid is visible
      const images = page.locator('img[alt*="Eliksir"]');
      const count = await images.count();
      
      // Should have at least some images
      expect(count).toBeGreaterThan(0);
    });

    test('should filter gallery categories', async ({ page }) => {
      await page.goto(FRONTEND_URL);
      await page.locator('text=Nasza Galeria').scrollIntoViewIfNeeded();
      await page.waitForTimeout(2000);

      // Click on different categories if available
      const allButton = page.locator('text=Wszystkie');
      if (await allButton.isVisible()) {
        await allButton.click();
        await page.waitForTimeout(1000);
        
        // Verify images are still visible
        const images = page.locator('img[alt*="Eliksir"]');
        expect(await images.count()).toBeGreaterThan(0);
      }
    });
  });

  test.describe('About Component', () => {
    test('should use API.contentSections endpoint', async ({ page }) => {
      const apiRequests: string[] = [];
      page.on('request', (request) => {
        if (request.url().includes('/api/content/sections')) {
          apiRequests.push(request.url());
        }
      });

      await page.goto(FRONTEND_URL);
      await page.waitForTimeout(2000);

      // Verify correct API endpoint was called
      expect(apiRequests.length).toBeGreaterThan(0);
      expect(apiRequests[0]).toBe(`${BACKEND_URL}/api/content/sections`);
    });

    test('should display about content', async ({ page }) => {
      await page.goto(FRONTEND_URL);
      await page.locator('text=/Kim jesteśmy|O nas/i').scrollIntoViewIfNeeded();

      // Check if about section is visible
      await expect(page.locator('text=/Kim jesteśmy|O nas/i')).toBeVisible();
      
      // Check if description is visible
      await expect(page.locator('text=/Jesteśmy zespołem|profesjonalnych barmanów/i')).toBeVisible();
    });
  });

  test.describe('Backend Health Checks', () => {
    test('should verify backend /api/health endpoint', async ({ request }) => {
      const response = await request.get(`${BACKEND_URL}/api/health`);
      expect(response.ok()).toBeTruthy();
      
      const data = await response.json();
      expect(data.status).toBe('healthy');
    });

    test('should verify calculator config endpoint', async ({ request }) => {
      const response = await request.get(`${BACKEND_URL}/api/calculator/config`);
      expect(response.ok()).toBeTruthy();
      
      const data = await response.json();
      expect(data).toHaveProperty('promoDiscount');
      expect(data).toHaveProperty('addons');
      expect(data).toHaveProperty('shoppingList');
    });

    test('should verify gallery panorama endpoint', async ({ request }) => {
      const response = await request.get(`${BACKEND_URL}/api/content/gallery/public?category=wszystkie`);
      expect(response.ok()).toBeTruthy();
      
      const data = await response.json();
      // Response could be array or object with images property
      if (Array.isArray(data)) {
        expect(data).toBeTruthy();
      } else {
        expect(data).toHaveProperty('success');
        expect(data).toHaveProperty('images');
      }
    });

    test('should verify content sections endpoint', async ({ request }) => {
      const response = await request.get(`${BACKEND_URL}/api/content/sections`);
      expect(response.ok()).toBeTruthy();
      
      const data = await response.json();
      expect(data).toHaveProperty('success');
      expect(data).toHaveProperty('sections');
    });
  });

  test.describe('Cross-Component Integration', () => {
    test('should load all components without breaking each other', async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      await page.goto(FRONTEND_URL);
      
      // Scroll through all major sections
      await page.locator('#kalkulator').scrollIntoViewIfNeeded();
      await page.waitForTimeout(1000);
      
      await page.locator('text=Nasza Galeria').scrollIntoViewIfNeeded();
      await page.waitForTimeout(1000);
      
      await page.locator('text=/Kim jesteśmy/i').scrollIntoViewIfNeeded();
      await page.waitForTimeout(1000);

      // Filter out external errors
      const relevantErrors = consoleErrors.filter(
        err => !err.includes('Tracking Prevention') && !err.includes('cloudinary')
      );

      expect(relevantErrors).toHaveLength(0);
    });

    test('should verify all API calls use centralized config', async ({ page }) => {
      const apiRequests = new Map<string, string[]>();
      
      page.on('request', (request) => {
        const url = request.url();
        if (url.includes('/api/')) {
          const endpoint = url.split('/api/')[1];
          const component = 
            url.includes('calculator') ? 'Calculator' :
            url.includes('gallery') ? url.includes('category=wszystkie') ? 'HorizontalGallery' : 'Gallery' :
            url.includes('content/sections') ? 'About' :
            'Unknown';
          
          if (!apiRequests.has(component)) {
            apiRequests.set(component, []);
          }
          apiRequests.get(component)!.push(url);
        }
      });

      await page.goto(FRONTEND_URL);
      await page.waitForTimeout(5000);

      // Verify all components use the same BACKEND_URL
      for (const [component, urls] of apiRequests.entries()) {
        urls.forEach(url => {
          expect(url.startsWith(BACKEND_URL)).toBe(true);
        });
      }
    });
  });

  test.describe('Loading State Consistency', () => {
    test('should not show infinite loaders in Calculator', async ({ page }) => {
      await page.goto(FRONTEND_URL);
      
      // Wait for initial load
      await page.waitForTimeout(2000);
      
      // Check Calculator loader disappears
      await page.locator('#kalkulator').scrollIntoViewIfNeeded();
      await page.waitForTimeout(2000);
      
      const calculatorLoader = page.locator('text=/Ładowanie|Loading/i').first();
      if (await calculatorLoader.isVisible()) {
        // Loader should disappear within 10 seconds
        await expect(calculatorLoader).not.toBeVisible({ timeout: 10000 });
      }
    });

    test('should not show infinite loaders in Gallery', async ({ page }) => {
      await page.goto(FRONTEND_URL);
      
      // Check Gallery loader disappears
      await page.locator('text=Nasza Galeria').scrollIntoViewIfNeeded();
      await page.waitForTimeout(2000);
      
      const galleryLoader = page.locator('text=/Ładowanie galerii/i').first();
      if (await galleryLoader.isVisible()) {
        await expect(galleryLoader).not.toBeVisible({ timeout: 10000 });
      }
    });

    test('should not show infinite loaders in HorizontalGallery', async ({ page }) => {
      await page.goto(FRONTEND_URL);
      await page.waitForTimeout(2000);
      
      const panoramaLoader = page.locator('text=/Ładowanie galerii/i').first();
      if (await panoramaLoader.isVisible()) {
        // HorizontalGallery has longer timeout due to cold start (35s)
        await expect(panoramaLoader).not.toBeVisible({ timeout: 35000 });
      }
    });
  });
});

test.describe('Performance & Error Handling', () => {
  test('should handle API timeout gracefully', async ({ page }) => {
    // Simulate slow network
    await page.route('**/api/calculator/config', async (route) => {
      await page.waitForTimeout(3000);
      await route.continue();
    });

    await page.goto(FRONTEND_URL);
    await page.locator('#kalkulator').scrollIntoViewIfNeeded();
    
    // Should show loading state
    await expect(page.locator('text=/Ładowanie|Loading/i').first()).toBeVisible();
    
    // Should eventually load or show error (not infinite loader)
    await page.waitForTimeout(5000);
  });

  test('should handle 404 API errors gracefully', async ({ page }) => {
    // Mock 404 response
    await page.route('**/api/calculator/config', (route) => {
      route.fulfill({
        status: 404,
        body: JSON.stringify({ error: 'Not found' }),
      });
    });

    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto(FRONTEND_URL);
    await page.locator('#kalkulator').scrollIntoViewIfNeeded();
    await page.waitForTimeout(2000);

    // Should not crash - should use fallback data
    await expect(page.locator('text=Pakiet')).toBeVisible();
  });
});
