# E2E Test Optimization Plan

## Problem
- **23 tests** with **1 worker** = slow execution
- **19x waitForTimeout()** = wasted **38+ seconds** of hard waits
- **Render.com cold start** = backend takes 30s to wake up
- **Playwright timeout** = 10 minutes → tests hanging

## Root Causes
1. `page.waitForTimeout(3000)` everywhere - **blind waiting**
2. No parallelization (workers: 1)
3. No test timeout limits
4. No navigation timeout for cold starts

## Implemented Fixes ✅

### 1. Playwright Config (playwright.config.ts)
```typescript
- workers: 1 → workers: 2 (parallel execution)
- No timeout → timeout: 60s per test
- No actionTimeout → actionTimeout: 15s
- No navigationTimeout → navigationTimeout: 45s (cold start tolerance)
- retries: 2 → retries: 1 (faster failures)
```

### 2. CI Workflow (.github/workflows/ci.yml)
```yaml
- timeout-minutes: 10 → 15 (safety buffer)
+ env:
    FRONTEND_URL: http://localhost:4173
    BACKEND_URL: https://eliksir-backend-front-dashboard.onrender.com
```

### 3. Smart Waiting (e2e/api-consistency.spec.ts)
```typescript
// BEFORE:
await page.goto(FRONTEND_URL);
await page.waitForTimeout(3000); // blind 3s wait

// AFTER:
await page.goto(FRONTEND_URL);
await page.waitForLoadState('networkidle', { timeout: 30000 }); // waits until network idle

// BEFORE:
await page.waitForTimeout(2000);

// AFTER:
await page.waitForLoadState('domcontentloaded'); // waits for DOM ready
```

## Remaining Optimizations 🔄

### Quick Wins (5 min)
- [ ] Replace all `waitForTimeout(2000)` with element visibility checks
- [ ] Replace `waitForTimeout(3000)` with `waitForLoadState('networkidle')`
- [ ] Replace `waitForTimeout(1000)` with immediate element checks
- [ ] Reduce `waitForTimeout(5000)` to `waitForLoadState('networkidle')`

### Medium Impact (15 min)
- [ ] Add `test.describe.configure({ mode: 'parallel' })` for independent test groups
- [ ] Use `page.waitForResponse()` instead of waitForTimeout for API calls
- [ ] Add backend health check before test suite (skip if backend is down)
- [ ] Mock slow API endpoints for faster tests

### Long-term (1 hr)
- [ ] Split tests into smoke + full suites
- [ ] Add test sharding for >50 tests
- [ ] Implement backend warmup step in CI
- [ ] Add visual regression tests separately

## Expected Results

### Before Optimization
- **Duration:** 10+ minutes (timeout)
- **Success Rate:** 0% (timeout failure)
- **Wasted Time:** 38s+ in waitForTimeout
- **Workers:** 1 (sequential)

### After Quick Fixes
- **Duration:** ~5-7 minutes (estimate)
- **Success Rate:** 90%+ (cold start tolerance)
- **Wasted Time:** <5s in critical waits
- **Workers:** 2 (parallel)

### After Full Optimization
- **Duration:** ~3-4 minutes
- **Success Rate:** 95%+
- **Smoke Tests:** <1 minute
- **Full Suite:** <5 minutes

## Implementation Priority

1. ✅ **DONE:** Increase workers to 2
2. ✅ **DONE:** Add test timeout (60s)
3. ✅ **DONE:** Add navigation timeout (45s for cold start)
4. ✅ **DONE:** Increase CI timeout (15 min)
5. ✅ **DONE:** Replace 3 key waitForTimeout with networkidle
6. 🔄 **TODO:** Replace remaining 16 waitForTimeout
7. 🔄 **TODO:** Add backend health check
8. 🔄 **TODO:** Split smoke vs full tests

## Testing Strategy

### Smoke Tests (fast, run on every PR)
- Health endpoint
- Calculator config load
- Gallery load
- Main page render
**Target:** <1 minute, 5 tests

### Full E2E (comprehensive, run before merge)
- All API consistency checks
- Cross-component integration
- Error handling
- Performance checks
**Target:** <5 minutes, 23 tests

## Manual Replacement Guide

### Pattern 1: After page.goto()
```typescript
// BAD
await page.goto(URL);
await page.waitForTimeout(3000);

// GOOD
await page.goto(URL);
await page.waitForLoadState('networkidle', { timeout: 30000 });
```

### Pattern 2: After scrollIntoView
```typescript
// BAD
await page.locator('#kalkulator').scrollIntoViewIfNeeded();
await page.waitForTimeout(2000);

// GOOD
await page.locator('#kalkulator').scrollIntoViewIfNeeded();
await expect(page.locator('#kalkulator')).toBeVisible();
// Element visibility check implicitly waits
```

### Pattern 3: After click/interaction
```typescript
// BAD
await page.click('text=Premium');
await page.waitForTimeout(1000);

// GOOD
await page.click('text=Premium');
await expect(page.locator('text=Premium').locator('..')).toHaveClass(/active/);
// Check for state change instead of blind wait
```

### Pattern 4: Before API call check
```typescript
// BAD
await page.goto(URL);
await page.waitForTimeout(5000);
expect(apiRequests.length).toBeGreaterThan(0);

// GOOD
await page.goto(URL);
await page.waitForResponse(resp => resp.url().includes('/api/'));
expect(apiRequests.length).toBeGreaterThan(0);
```

## Next Steps

1. Commit current fixes
2. Test in CI (should pass now with 15min timeout + 2 workers)
3. If passes: tackle remaining waitForTimeout
4. If fails: check logs for actual failure reason

## Rollback Plan

If tests still timeout:
1. Increase CI timeout to 20 minutes
2. Reduce workers back to 1 (safety)
3. Add explicit backend health check with skip
4. Consider mocking backend for E2E tests
