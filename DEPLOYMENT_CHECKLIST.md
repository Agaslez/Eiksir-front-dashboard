# 🚀 Eliksir Deployment Checklist - Zero Regres Strategy

**Zasada:** Po każdej zmianie → smoke test → push → czekamy na zielony CI → kolejny punkt

---

## ✅ Phase 1: Fix Tests & Quality (COMPLETED)
- [x] **1.1** Fix failing tests (calculator, SEO)
  - Status: ✅ 18/18 tests passing
  - Commit: "fix: update API responses to match test expectations"

---

## 🔧 Phase 2: Remove Jest ForceExit
**Goal:** Usunąć `forceExit: true` i naprawić async leaks metodycznie

### Reguła A: Zawsze wykrywaj wyciek single-thread
```bash
npm test -- --detectOpenHandles --runInBand
```

### Reguła B: Testy NIE mają odpalać app.listen() gdy używasz supertest
**Preferuj:**
```typescript
import request from "supertest";
await request(app).get("/health").expect(200);
```

**Unikaj:**
```typescript
const server = app.listen(...)  // NIE TAK!
```

### Reguła C: Jeśli gdziekolwiek jest listen(), musi być cleanup
```typescript
let server: any;

beforeAll(() => {
  server = app.listen(0);  // random port
});

afterAll(async () => {
  await new Promise<void>((resolve) => server.close(() => resolve()));
});
```

### Reguła D: Jeśli jest DB pool/ORM, zamknij w afterAll
```typescript
afterAll(async () => {
  await db.$disconnect();  // lub pool.end(), client.end()
});
```

### Reguła E: Timery/schedulery muszą być czyszczone
```typescript
let intervalId: any;

beforeAll(() => {
  intervalId = setInterval(...);
});

afterAll(() => {
  clearInterval(intervalId);
});
```

### Task 2.1: Apply Rules & Remove forceExit
1. Remove `forceExit: true` from jest.config.js
2. Remove `detectOpenHandles: false` from jest.config.js
3. Check tests follow Rules A-E
4. Add cleanup where needed

**Test Strategy:**
```bash
npm test -- --detectOpenHandles --runInBand  # Must pass without warnings
```

**Success Criteria:** ✅ Tests pass, no "Jest did not exit" warning

**Git:**
```bash
git add jest.config.js __tests__/
git commit -m "refactor: remove Jest forceExit and fix async leaks"
git push
```

**Wait:** 🟢 CI green → proceed

---

## 🗄️ Phase 3: Database Setup

### Task 3.1: Create Neon PostgreSQL
1. Go to https://neon.tech
2. Create new project: `eliksir-production`
3. Get connection string: `postgresql://user:pass@host/dbname`
4. Save to password manager

**Test Strategy:**
```bash
# Test connection locally
DATABASE_URL="postgres://..." npm run dev
# Verify: Server starts without errors
```

**Success Criteria:** ✅ Connection works, no errors

**No Git Push** - only credentials saved

---

### Task 3.2A: Run migrations (preferred)
```bash
# If you have separate migration script
DATABASE_URL="postgres://..." npm run db:migrate
```

### Task 3.2B: Run seed (schema + data)
```bash
# Our project: seed creates schema + admin user
DATABASE_URL="postgres://..." npm run seed:eliksir
```

**Note:** W naszym projekcie `seed:eliksir` tworzy zarówno schema jak i dane (all-in-one).

**Test Strategy:**
```bash
# Verify tables created
psql $DATABASE_URL -c "\dt"

# Verify admin user exists
psql $DATABASE_URL -c "SELECT email FROM users WHERE role='admin';"
```

**Success Criteria:** ✅ Schema created, admin user exists

**No Git Push** - database operation only

---

## 🔐 Phase 4: Secrets (CI) vs Runtime Env (Render)

**Zasada:**
- **GitHub Secrets** = tylko CI/CD (testy, build w Actions)
- **Render Environment Variables** = runtime (działająca aplikacja)

**⚠️ WAŻNE:** Render NIE pobiera sekretów z GitHub Actions!

---

### Task 4.1: Add GitHub Actions Secrets (CI only)
Go to: https://github.com/Agaslez/Eliksir-Backend-front-dashboard/settings/secrets/actions

Click: **New repository secret**

Add each:
```
JWT_SECRET=<generate-32-char-random>
SESSION_SECRET=<generate-32-char-random>
COOKIE_SECRET=<generate-32-char-random>
DATABASE_URL=<neon-test-connection-string>
SENTRY_DSN=<optional-leave-empty>
```

**Generate secrets:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Test Strategy:** Trigger CI manually - check secrets are accessible in workflow

**Success Criteria:** ✅ CI runs with secrets, tests pass

---

### Task 4.2: Add Render Environment Variables (Runtime)
**Gdzie:** Render Dashboard → Your Service → Environment

**⚠️ Te wartości MUSZĄ być wpisane ręcznie w Render!**

Add each variable:
```
NODE_ENV=production
DATABASE_URL=<neon-production-connection-string>
JWT_SECRET=<same-as-github-or-different>
SESSION_SECRET=<same-as-github-or-different>
COOKIE_SECRET=<same-as-github-or-different>
FRONTEND_URL=https://eliksir-frontend.vercel.app
SENTRY_DSN=<optional>
```

**⚠️ NIE ustawiaj PORT** - Render automatycznie dostarcza `process.env.PORT`

**Test Strategy:** Deploy service, check logs for env vars presence

**Success Criteria:** ✅ Service starts, no "missing env var" errors

---

## 🌐 Phase 5: Backend Deployment (Render)

### Task 5.1: Create Render Web Service
1. Go to https://render.com/dashboard
2. New → Web Service
3. Connect GitHub: `Eliksir-Backend-front-dashboard`
4. Configure:
   - **Name:** `eliksir-backend`
   - **Branch:** `main`
   - **Build Command:** `npm ci && npm run build`
   - **Start Command:** `npm start`
   - **Instance Type:** Free

**Environment Variables:**
```
NODE_ENV=production
DATABASE_URL=<neon-production-url>
JWT_SECRET=<32-char-random>
SESSION_SECRET=<32-char-random>
COOKIE_SECRET=<32-char-random>
FRONTEND_URL=https://eliksir-frontend.vercel.app
SENTRY_DSN=<optional-empty-ok>
```

**⚠️ Port Rule:** App MUST use `process.env.PORT` from Render (fallback 3001 local only).

**Code check:**
```typescript
const port = Number(process.env.PORT) || 3001;
server.listen(port, '0.0.0.0', () => console.log(`Server on ${port}`));
```

**Test Strategy:**
```bash
# Wait for deploy (~5min)
# Test health endpoint
curl https://eliksir-backend.onrender.com/health

# Expected: {"status":"healthy",...}
```

**Success Criteria:** ✅ Health endpoint returns 200 OK

---

### Task 5.2: Test Backend Auth
```bash
# Test login
curl -X POST https://eliksir-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@eliksir-bar.pl","password":"Admin123!"}'

# Expected: {"success":true,"accessToken":"..."}
```

**Success Criteria:** ✅ Login works, token returned

---

## 🎨 Phase 6: Frontend Deployment (Vercel)

### Task 6.1: Create Vercel Project
1. Go to https://vercel.com/new
2. Import: `Eiksir-front-dashboard` (GitHub)
3. Configure:
   - **Framework:** Vite
   - **Root Directory:** `./`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

**Environment Variables:**
```
VITE_API_URL=https://eliksir-backend.onrender.com
```

**Test Strategy:**
```bash
# Wait for deploy (~2min)
# Open in browser
open https://eliksir-frontend.vercel.app
```

**Success Criteria:** ✅ Site loads, no console errors

---

### Task 6.2: Update Backend CORS
Edit: `stefano-eliksir-backend/server/index.ts`

```typescript
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://eliksir-frontend.vercel.app',  // ADD THIS
    process.env.FRONTEND_URL || 'https://eliksirbar.pl',
  ],
  // ...
};
```

**Test Strategy:**
```bash
npm test  # All pass?
```

**Git:**
```bash
git add server/index.ts
git commit -m "feat: add Vercel URL to CORS whitelist"
git push
```

**Wait:** 🟢 CI green → Render auto-deploys

---

## 🧪 Phase 7: Production Smoke Test

### Task 7.0: API Smoke Test (must pass before UI)
**Endpoint 1: Health Check**
```bash
curl https://eliksir-backend.onrender.com/health
# Expected: {"status":"healthy",...}
```

**Endpoint 2: Login → Token**
```bash
# With jq (recommended)
TOKEN=$(curl -s -X POST https://eliksir-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@eliksir-bar.pl","password":"Admin123!"}' | jq -r .accessToken)

echo $TOKEN

# Manual (without jq)
curl -X POST https://eliksir-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@eliksir-bar.pl","password":"Admin123!"}'
# Copy accessToken from response
```

**Endpoint 3: /me Must Return 200**
```bash
# With TOKEN from above
curl -H "Authorization: Bearer $TOKEN" \
  https://eliksir-backend.onrender.com/api/auth/me

# Expected: {"success":true,"user":{...}}
```

**Endpoint 4: Admin Stats Must Return 200**
```bash
curl -H "Authorization: Bearer $TOKEN" \
  https://eliksir-backend.onrender.com/api/seo/stats

# Expected: {"success":true,"data":{...}}
```

**Success Criteria:** ✅ All 4 endpoints return 200 OK, no errors

---

### Task 7.1: Test Login Flow
1. Open: https://eliksir-frontend.vercel.app/admin
2. Login: `admin@eliksir-bar.pl` / `Admin123!`
3. Expected: ✅ Dashboard loads

---

### Task 7.2: Test Admin Features
- [ ] **Dashboard:** Live stats display
- [ ] **Content Editor:** Load/save content
- [ ] **Calculator:** Load settings, calculate price
- [ ] **Email Settings:** Load SMTP config
- [ ] **Image Gallery:** View uploaded images

**Success Criteria:** ✅ All features work, no errors

---

## 📊 Phase 8: Monitoring (Post-Deploy)

### Task 8.1: Setup Error Tracking
- [ ] Add Sentry DSN to environment
- [ ] Test error reporting
- [ ] Configure alerts

### Task 8.2: Setup Uptime Monitoring
- [ ] Add UptimeRobot for backend health
- [ ] Monitor `/health` endpoint
- [ ] Alert on downtime

---

## 🎯 Success Metrics

**Must Have (MVP):**
- ✅ All tests passing (18/18)
- ✅ Backend deployed and healthy
- ✅ Frontend deployed and accessible
- ✅ Admin can login
- ✅ CORS configured correctly

**Nice to Have (Post-MVP):**
- ⏳ Error monitoring (Sentry)
- ⏳ Uptime monitoring
- ⏳ Database backups configured
- ⏳ Custom domain setup

---

## 🚨 Rollback Plan

If deployment fails:

**Backend:**
```bash
# Render: Manual rollback to previous deploy in dashboard
# Or: Git revert + push
git revert HEAD
git push
```

**Frontend:**
```bash
# Vercel: Rollback to previous deployment in dashboard
# Or: Redeploy specific commit
```

**Database:**
```bash
# Restore from Neon backup
# Or: Re-run seed script
npm run seed:eliksir
```

---

## 📝 Current Status

**Last Updated:** 2025-12-27

| Phase | Status | Notes |
|-------|--------|-------|
| 1. Tests | ✅ DONE | 18/18 passing |
| 2. ForceExit | ⏳ TODO | Next task |
| 3. Database | ⏳ TODO | - |
| 4. Secrets | ⏳ TODO | - |
| 5. Backend | ⏳ TODO | - |
| 6. Frontend | ⏳ TODO | - |
| 7. Smoke Test | ⏳ TODO | - |
| 8. Monitoring | ⏳ TODO | - |

---

## 🎓 Lessons Learned

- Jest `forceExit` masks async leaks - fix properly
- Calculator auth requires middleware on router mount
- SEO stats response key must match test expectations
- Port 3001 conflicts - always check before tests

