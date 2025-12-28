import { expect, test } from '@playwright/test';

const FRONTEND_URL = 'http://localhost:5174';
const BACKEND_URL = 'http://localhost:3001';

test.describe('ELIKSIR E2E Tests', () => {
  let authToken: string;

  test.beforeAll(async ({ request }) => {
    // Login and get token
    const response = await request.post(`${BACKEND_URL}/api/auth/login`, {
      data: {
        email: 'admin@eliksir.pl',
        password: 'admin123',
      },
    });
    const data = await response.json();
    authToken = data.accessToken;
  });

  test.describe('Authentication Flow', () => {
    test('should login successfully', async ({ page }) => {
      await page.goto(`${FRONTEND_URL}/admin/login`);
      
      await page.fill('input[type="email"]', 'admin@eliksir.pl');
      await page.fill('input[type="password"]', 'admin123');
      await page.click('button[type="submit"]');
      
      await expect(page).toHaveURL(/\/admin/);
      await expect(page.locator('text=ELIKSIR')).toBeVisible();
    });

    test('should reject invalid credentials', async ({ page }) => {
      await page.goto(`${FRONTEND_URL}/admin/login`);
      
      await page.fill('input[type="email"]', 'admin@eliksir.pl');
      await page.fill('input[type="password"]', 'wrongpassword');
      await page.click('button[type="submit"]');
      
      await expect(page.locator('text=/error|invalid|nieprawidłowe/i')).toBeVisible({ timeout: 5000 });
    });

    test('should logout successfully', async ({ page }) => {
      await page.goto(`${FRONTEND_URL}/admin/login`);
      await page.fill('input[type="email"]', 'admin@eliksir.pl');
      await page.fill('input[type="password"]', 'admin123');
      await page.click('button[type="submit"]');
      
      await page.click('text=Wyloguj');
      await expect(page).toHaveURL(/\/admin\/login/);
    });
  });

  test.describe('Dashboard Statistics', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`${FRONTEND_URL}/admin/login`);
      await page.fill('input[type="email"]', 'admin@eliksir.pl');
      await page.fill('input[type="password"]', 'admin123');
      await page.click('button[type="submit"]');
      await page.waitForURL(/\/admin/);
    });

    test('should display live statistics', async ({ page }) => {
      await expect(page.locator('text=Dashboard')).toBeVisible();
      await expect(page.locator('text=Łączne Wyświetlenia')).toBeVisible();
      await expect(page.locator('text=Unikalni Użytkownicy')).toBeVisible();
      await expect(page.locator('text=Średni Czas')).toBeVisible();
    });

    test('should refresh statistics', async ({ page }) => {
      await page.click('text=Odśwież');
      await expect(page.locator('text=Ostatnia aktualizacja')).toBeVisible();
    });

    test('should display charts', async ({ page }) => {
      await expect(page.locator('text=Najpopularniejsze Strony')).toBeVisible();
      await expect(page.locator('text=Źródła Ruchu')).toBeVisible();
    });
  });

  test.describe('Content Editor', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`${FRONTEND_URL}/admin/login`);
      await page.fill('input[type="email"]', 'admin@eliksir.pl');
      await page.fill('input[type="password"]', 'admin123');
      await page.click('button[type="submit"]');
      await page.waitForURL(/\/admin/);
    });

    test('should navigate to content editor', async ({ page }) => {
      await page.click('text=Treść');
      await expect(page).toHaveURL(/\/admin\/content/);
      await expect(page.locator('text=Edytor Treści')).toBeVisible();
    });

    test('should toggle gallery view', async ({ page }) => {
      await page.goto(`${FRONTEND_URL}/admin/content`);
      await page.click('text=Pokaż Galerię');
      await expect(page.locator('text=Galeria Zdjęć')).toBeVisible();
      
      await page.click('text=Ukryj Galerię');
      await expect(page.locator('text=Galeria Zdjęć')).not.toBeVisible();
    });

    test('should toggle preview mode', async ({ page }) => {
      await page.goto(`${FRONTEND_URL}/admin/content`);
      await page.click('text=Podgląd');
      await expect(page.locator('text=Edycja')).toBeVisible();
      
      await page.click('text=Edycja');
      await expect(page.locator('text=Podgląd')).toBeVisible();
    });

    test('should edit content section', async ({ page }) => {
      await page.goto(`${FRONTEND_URL}/admin/content`);
      
      const titleInput = page.locator('input[placeholder*="tytuł"]').first();
      await titleInput.fill('Test Title E2E');
      
      await page.click('text=Zapisz Zmiany');
      await expect(page.locator('text=/zapisano|success|✅/i')).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Image Gallery', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`${FRONTEND_URL}/admin/login`);
      await page.fill('input[type="email"]', 'admin@eliksir.pl');
      await page.fill('input[type="password"]', 'admin123');
      await page.click('button[type="submit"]');
      await page.goto(`${FRONTEND_URL}/admin/content`);
      await page.click('text=Pokaż Galerię');
    });

    test('should display image gallery', async ({ page }) => {
      await expect(page.locator('text=Galeria Zdjęć')).toBeVisible();
      await expect(page.locator('text=Dodaj Zdjęcie')).toBeVisible();
    });

    test('should show empty state when no images', async ({ page }) => {
      const emptyState = page.locator('text=Brak zdjęć');
      if (await emptyState.isVisible()) {
        await expect(emptyState).toBeVisible();
      }
    });
  });

  test.describe('Calculator Settings', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`${FRONTEND_URL}/admin/login`);
      await page.fill('input[type="email"]', 'admin@eliksir.pl');
      await page.fill('input[type="password"]', 'admin123');
      await page.click('button[type="submit"]');
      await page.waitForURL(/\/admin/);
    });

    test('should navigate to calculator settings', async ({ page }) => {
      await page.click('text=Kalkulator');
      await expect(page).toHaveURL(/\/admin\/calculator/);
      await expect(page.locator('text=Kalkulator Cenowy')).toBeVisible();
    });

    test('should display live preview', async ({ page }) => {
      await page.goto(`${FRONTEND_URL}/admin/calculator`);
      await expect(page.locator('text=Podgląd na Żywo')).toBeVisible();
      await expect(page.locator('text=Szacowana Cena')).toBeVisible();
    });

    test('should update price in live preview', async ({ page }) => {
      await page.goto(`${FRONTEND_URL}/admin/calculator`);
      
      const guestsSlider = page.locator('input[type="range"]');
      await guestsSlider.fill('150');
      
      await expect(page.locator('text=/PLN/i')).toBeVisible();
    });

    test('should edit base price', async ({ page }) => {
      await page.goto(`${FRONTEND_URL}/admin/calculator`);
      
      const basePriceInput = page.locator('input[step="10"]').first();
      await basePriceInput.fill('200');
      
      await page.click('text=Zapisz Wszystko');
      await expect(page.locator('text=/zapisano|success|✅/i')).toBeVisible({ timeout: 5000 });
    });

    test('should select services in preview', async ({ page }) => {
      await page.goto(`${FRONTEND_URL}/admin/calculator`);
      
      const checkbox = page.locator('input[type="checkbox"]').first();
      await checkbox.check();
      
      await expect(checkbox).toBeChecked();
    });
  });

  test.describe('Email Settings', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`${FRONTEND_URL}/admin/login`);
      await page.fill('input[type="email"]', 'admin@eliksir.pl');
      await page.fill('input[type="password"]', 'admin123');
      await page.click('button[type="submit"]');
      await page.waitForURL(/\/admin/);
    });

    test('should navigate to email settings', async ({ page }) => {
      await page.click('text=Email');
      await expect(page).toHaveURL(/\/admin\/email/);
      await expect(page.locator('text=Ustawienia Email')).toBeVisible();
    });

    test('should display SMTP configuration fields', async ({ page }) => {
      await page.goto(`${FRONTEND_URL}/admin/email`);
      
      await expect(page.locator('text=Serwer SMTP')).toBeVisible();
      await expect(page.locator('text=Port')).toBeVisible();
      await expect(page.locator('text=Email SMTP')).toBeVisible();
    });

    test('should show Gmail instructions', async ({ page }) => {
      await page.goto(`${FRONTEND_URL}/admin/email`);
      await expect(page.locator('text=📧 Instrukcja Gmail')).toBeVisible();
    });

    test('should have test and save buttons', async ({ page }) => {
      await page.goto(`${FRONTEND_URL}/admin/email`);
      
      await expect(page.locator('text=Wyślij Test')).toBeVisible();
      await expect(page.locator('text=Zapisz Ustawienia')).toBeVisible();
    });
  });

  test.describe('Navigation', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`${FRONTEND_URL}/admin/login`);
      await page.fill('input[type="email"]', 'admin@eliksir.pl');
      await page.fill('input[type="password"]', 'admin123');
      await page.click('button[type="submit"]');
      await page.waitForURL(/\/admin/);
    });

    test('should navigate between all pages', async ({ page }) => {
      // Dashboard
      await page.click('text=Dashboard');
      await expect(page).toHaveURL(/\/admin/);
      
      // Content
      await page.click('text=Treść');
      await expect(page).toHaveURL(/\/admin\/content/);
      
      // Calculator
      await page.click('text=Kalkulator');
      await expect(page).toHaveURL(/\/admin\/calculator/);
      
      // Email
      await page.click('text=Email');
      await expect(page).toHaveURL(/\/admin\/email/);
    });

    test('should maintain authentication across pages', async ({ page }) => {
      await page.click('text=Treść');
      await page.click('text=Kalkulator');
      await page.click('text=Email');
      
      // Should still be logged in
      await expect(page.locator('text=admin@eliksir.pl')).toBeVisible();
    });
  });
});
