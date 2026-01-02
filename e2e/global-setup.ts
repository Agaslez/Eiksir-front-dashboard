/**
 * Playwright Global Setup
 * Runs once before all tests to verify backend availability
 * 
 * PROTOCOL DECISION #001 (2026-01-02)
 * Approved by: Stefan Pitek
 * Purpose: Reduce E2E test time from 15+ min to ~1.2 min
 */

import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  const BACKEND_URL = process.env.BACKEND_URL || 
    'https://eliksir-backend-front-dashboard.onrender.com';
  
  console.log('🔥 Global Setup: Verifying backend is ready...');
  console.log(`Backend URL: ${BACKEND_URL}`);
  
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Wake up backend (Render.com free tier cold start)
  let retries = 5;
  let lastError: Error | null = null;
  
  while (retries > 0) {
    try {
      console.log(`Attempt ${6 - retries}/5...`);
      
      const response = await page.request.get(`${BACKEND_URL}/api/health`, {
        timeout: 90000, // 90s timeout per attempt (Render cold start can be slow)
      });
      
      if (response.status() === 200 || response.status() === 503) {
        const body = await response.json();
        console.log('✅ Backend is ready');
        console.log(`Status: ${body.status}`);
        console.log(`Health checks: ${body.summary?.totalChecks || 0}`);
        
        await browser.close();
        return;
      }
      
      console.log(`⚠️  Unexpected status: ${response.status()}`);
      lastError = new Error(`Status ${response.status()}`);
      
    } catch (error) {
      lastError = error as Error;
      console.log(`❌ Error: ${lastError.message}`);
    }
    
    retries--;
    if (retries > 0) {
      console.log(`⏳ Waiting 20s before retry...`);
      await page.waitForTimeout(20000);
    }
  }
  
  await browser.close();
  
  console.error('❌ Backend not available after 5 attempts (7.5 min wait)');
  console.error(`Last error: ${lastError?.message}`);
  
  // Throw error to fail entire test suite if backend is down
  throw new Error(
    `Backend not available at ${BACKEND_URL}/api/health. ` +
    `Render.com cold start exceeded 7.5 min - check deployment status.`
  );
}

export default globalSetup;
