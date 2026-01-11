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
  const BACKEND_URL = process.env.BACKEND_URL || 'http://127.0.0.1:3001';
  
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
      
      // Try /api/health endpoint first (most reliable)
      const response = await page.request.get(`${BACKEND_URL}/api/health`, {
        timeout: 90000, // 90s timeout per attempt (Render cold start can be slow)
      });
      
      if (response.status() === 200 || response.status() === 503) {
        const body = await response.json().catch(() => ({ status: 'unknown' }));
        console.log('✅ Backend is ready');
        console.log(`Status: ${body.status || response.status()}`);
        
        await browser.close();
        return;
      }
      
      console.log(`⚠️  /api/health returned: ${response.status()}`);
      lastError = new Error(`/api/health: Status ${response.status()}`);
      
    } catch (error) {
      lastError = error as Error;
      console.log(`❌ /api/health failed: ${lastError.message}`);
      
      // Fallback 1: try /api/config endpoint
      try {
        console.log(`⚠️ Trying fallback: /api/config...`);
        const fallbackResponse = await page.request.get(`${BACKEND_URL}/api/config`, {
          timeout: 90000,
        });
        
        if (fallbackResponse.status() < 500) {
          console.log('✅ Backend is ready (via /api/config)');
          console.log(`Status: ${fallbackResponse.status()}`);
          await browser.close();
          return;
        }
      } catch (fallbackError) {
        console.log(`❌ /api/config failed: ${(fallbackError as Error).message}`);
        
        // Fallback 2: try root health endpoint
        try {
          console.log(`⚠️ Trying fallback: /health...`);
          const rootHealthResponse = await page.request.get(`${BACKEND_URL}/health`, {
            timeout: 90000,
          });
          
          if (rootHealthResponse.status() < 500) {
            console.log('✅ Backend is ready (via /health)');
            console.log(`Status: ${rootHealthResponse.status()}`);
            await browser.close();
            return;
          }
        } catch (rootHealthError) {
          console.log(`❌ /health failed: ${(rootHealthError as Error).message}`);
        }
      }
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
    `Backend not available at ${BACKEND_URL}/health or ${BACKEND_URL}/api/config. ` +
    `Check if backend is running or update BACKEND_URL env variable. ` +
    `Current BACKEND_URL: ${BACKEND_URL}`
  );
}

export default globalSetup;
