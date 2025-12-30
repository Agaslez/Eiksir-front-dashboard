# 🧪 ELIKSIR - Test Documentation

## Test Coverage

### Backend API Tests
- ✅ Authentication (login, /me endpoint, token validation)
- ✅ Content Management (images, sections)
- ✅ Email System (contact forms, SMTP test)
- ✅ Calculator (settings, calculations)
- ✅ SEO Tracking (page views, statistics)

### Frontend Component Tests
- ✅ ImageGallery (render, upload, display, empty state)
- ✅ ContentEditor (render, sections, preview toggle)
- ✅ DashboardHome (stats, refresh, charts)
- ✅ EmailSettings (form, SMTP config, instructions)
- ✅ CalculatorSettings (pricing, live preview, categories)

### E2E Tests
- ✅ Complete authentication flow
- ✅ Navigation between pages
- ✅ Content editing workflow
- ✅ Calculator configuration
- ✅ Image gallery operations
- ✅ Email settings configuration

## 🚀 Running Tests

### Quick Start - All Tests
```bash
npm run test:all
```

### Smoke Tests Only (Fast)
```bash
npm run test:smoke
```

### Backend Tests
```bash
cd stefano-eliksir-backend
npm test
```

Or from root:
```bash
npm run test:backend
```

### Frontend Tests
```bash
cd eliksir-frontend
npm test
```

Or from root:
```bash
npm run test:frontend
```

### E2E Tests (Playwright)
```bash
npm run test:e2e
```

Interactive mode:
```bash
npm run test:e2e:ui
```

## 📋 Test Scripts

### Root package.json
```json
{
  "scripts": {
    "test:all": "npm run test:backend && npm run test:frontend && npm run test:e2e",
    "test:smoke": "npm run test:backend -- --testPathPattern=smoke && npm run test:frontend -- --testPathPattern=smoke",
    "test:backend": "cd stefano-eliksir-backend && npm test",
    "test:frontend": "cd eliksir-frontend && npm test",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

### Backend package.json
```json
{
  "scripts": {
    "test": "jest",
    "test:smoke": "jest __tests__/smoke.test.ts",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

## 🎯 Smoke Test Coverage

### Backend Smoke Tests
Located: `stefano-eliksir-backend/__tests__/smoke.test.ts`

**Authentication Tests:**
- ✅ Health check endpoint
- ✅ Login with valid credentials
- ✅ Reject invalid credentials
- ✅ Get current user with token
- ✅ Reject requests without token

**Content Management Tests:**
- ✅ Get images list (authenticated)
- ✅ Get content sections (authenticated)
- ✅ Update content section
- ✅ Require authentication for all endpoints

**Email Tests:**
- ✅ Reject empty contact form
- ✅ Accept valid contact form (may fail without SMTP)

**Calculator Tests:**
- ✅ Get calculator settings (authenticated)
- ✅ Calculate event price
- ✅ Update calculator settings
- ✅ Require authentication for endpoints

**SEO Tracking Tests:**
- ✅ Track page view (public endpoint)
- ✅ Get SEO stats (authenticated)
- ✅ Require authentication for stats

### Frontend Smoke Tests
Located: `eliksir-frontend/src/__tests__/components.smoke.test.tsx`

**ImageGallery Tests:**
- ✅ Render gallery
- ✅ Display images when loaded
- ✅ Show empty state

**ContentEditor Tests:**
- ✅ Render editor
- ✅ Display content sections
- ✅ Toggle preview mode

**DashboardHome Tests:**
- ✅ Render with loading state
- ✅ Display statistics
- ✅ Have refresh button

**EmailSettings Tests:**
- ✅ Render form
- ✅ Have SMTP configuration fields
- ✅ Display Gmail instructions

**CalculatorSettings Tests:**
- ✅ Render calculator settings
- ✅ Display live preview
- ✅ Have all setting categories

## 🔄 E2E Test Scenarios

### Authentication Flow
1. Login with valid credentials → Dashboard
2. Login with invalid credentials → Error message
3. Logout → Redirect to login

### Dashboard Statistics
1. View live statistics (4 cards)
2. Refresh statistics
3. View charts (top pages, traffic sources)

### Content Editor
1. Navigate to content editor
2. Toggle gallery view
3. Toggle preview mode
4. Edit content section
5. Save changes

### Image Gallery
1. View gallery
2. Upload image (if test file provided)
3. Delete image
4. Show empty state

### Calculator Settings
1. Navigate to calculator
2. View live preview
3. Adjust guest count slider
4. Edit base price
5. Select services
6. Save settings

### Email Settings
1. Navigate to email settings
2. View SMTP configuration
3. Read Gmail instructions
4. Test email button available

### Navigation
1. Navigate between all pages
2. Maintain authentication across pages

## 📊 Test Reports

### Backend Coverage
Run with coverage:
```bash
cd stefano-eliksir-backend
npm run test:coverage
```

Expected coverage:
- Statements: > 70%
- Branches: > 60%
- Functions: > 70%
- Lines: > 70%

### Playwright Reports
After running E2E tests:
```bash
npx playwright show-report
```

HTML report location: `playwright-report/index.html`

## 🔧 Test Configuration

### Jest Configuration (Backend)
Located: `stefano-eliksir-backend/jest.config.js`

Key settings:
- Transform: tsx with ts-jest
- Test environment: node
- Coverage directory: coverage/
- Test timeout: 10000ms

### Playwright Configuration
Located: `playwright.config.ts`

Key settings:
- Test directory: ./e2e
- Base URL: http://localhost:5174
- Projects: chromium, firefox, webkit
- Web servers: Backend (3001), Frontend (5174)

### Vitest Configuration (Frontend)
Located: `eliksir-frontend/vitest.config.ts`

Key settings:
- Test environment: jsdom
- Setup files: src/test/setup.ts
- Coverage provider: v8

## 🐛 Troubleshooting

### Backend Tests Failing
```bash
# Check if backend is running
curl http://localhost:3001/api/auth/health

# Check database connection
cd stefano-eliksir-backend
npm run db:push

# Clear node_modules
rm -rf node_modules package-lock.json
npm install
```

### Frontend Tests Failing
```bash
# Check if frontend builds
cd eliksir-frontend
npm run build

# Clear cache
rm -rf node_modules .vite
npm install
```

### E2E Tests Failing
```bash
# Install Playwright browsers
npx playwright install

# Run with debug mode
npx playwright test --debug

# Run specific test
npx playwright test e2e/eliksir.spec.ts:10
```

### Common Issues

**Port Already in Use:**
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3001 | xargs kill -9
```

**Authentication Errors:**
- Check JWT_SECRET in .env
- Verify token in localStorage
- Check CORS configuration

**SMTP Tests Failing:**
- Configure SMTP settings in .env
- Use Gmail App Password
- Check SMTP_HOST, SMTP_PORT

## 📝 Writing New Tests

### Backend API Test Template
```typescript
import { describe, it, expect } from '@jest/globals';
import request from 'supertest';
import { app } from '../server';

describe('New Feature', () => {
  let authToken: string;

  beforeAll(async () => {
    // Login and get token
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@eliksir.pl', password: 'admin123' });
    authToken = response.body.accessToken;
  });

  it('should test new endpoint', async () => {
    const response = await request(app)
      .get('/api/new-endpoint')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body.success).toBe(true);
  });
});
```

### Frontend Component Test Template
```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import NewComponent from './NewComponent';

describe('NewComponent', () => {
  it('should render', () => {
    render(
      <BrowserRouter>
        <NewComponent />
      </BrowserRouter>
    );

    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

### E2E Test Template
```typescript
import { test, expect } from '@playwright/test';

test.describe('New Feature', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/admin/login');
    await page.fill('input[type="email"]', 'admin@eliksir.pl');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
  });

  test('should perform action', async ({ page }) => {
    await page.goto('/admin/new-feature');
    await expect(page.locator('text=New Feature')).toBeVisible();
  });
});
```

## 🔐 CI/CD Integration

### GitHub Actions Example
```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          npm install
          cd stefano-eliksir-backend && npm install
          cd ../eliksir-frontend && npm install
      
      - name: Run backend tests
        run: npm run test:backend
      
      - name: Run frontend tests
        run: npm run test:frontend
      
      - name: Install Playwright
        run: npx playwright install --with-deps
      
      - name: Run E2E tests
        run: npm run test:e2e
```

## 📈 Test Metrics

### Current Test Count
- Backend: 25+ tests
- Frontend: 20+ tests
- E2E: 15+ scenarios
- **Total: 60+ tests**

### Execution Time
- Backend smoke tests: ~5 seconds
- Frontend smoke tests: ~3 seconds
- E2E full suite: ~2 minutes

### Coverage Goals
- Backend: 80%
- Frontend: 75%
- Critical paths: 100%

---

**Last Updated:** December 27, 2025
**Version:** 1.0.0
**Maintained By:** ELIKSIR Development Team
