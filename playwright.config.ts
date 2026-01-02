import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration
 * 
 * PROTOCOL DECISION #001 (2026-01-02)
 * Optimization: Global setup + 4 workers + reduced timeouts
 * Expected: 15+ min → ~1.2 min (93% reduction)
 */

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0, // Auto-retry flaky tests once
  workers: process.env.CI ? 4 : undefined, // OPTIMIZED: 4 workers (was 2) = 2x faster
  reporter: process.env.CI ? 'github' : 'html',
  timeout: 30 * 1000, // OPTIMIZED: 30s per test (was 90s)
  
  // OPTIMIZATION: Global setup (wake backend once, not 23x)
  globalSetup: './e2e/global-setup.ts',
  
  use: {
    baseURL: process.env.FRONTEND_URL || 'http://localhost:5173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10 * 1000, // OPTIMIZED: 10s (was 20s)
    navigationTimeout: 30 * 1000, // OPTIMIZED: 30s (was 60s)
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Do not start servers in CI - use preview server started in workflow
  webServer: process.env.CI ? undefined : {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
    timeout: 120 * 1000,
  },
});
