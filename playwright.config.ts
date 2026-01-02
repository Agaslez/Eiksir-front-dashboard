import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0, // Increase retries for cold start issues
  workers: process.env.CI ? 2 : undefined, // Increase parallelization in CI
  reporter: process.env.CI ? 'github' : 'html',
  timeout: 90 * 1000, // 90s per test (increased for cold start)
  
  use: {
    baseURL: process.env.FRONTEND_URL || 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 20 * 1000, // 20s for actions (increased)
    navigationTimeout: 60 * 1000, // 60s for navigation (cold start tolerance)
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
