# 🏗️ Architecture Overview & Setup Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     YOUR SYSTEM ARCHITECTURE                      │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────┐
│  GITHUB ACTIONS CI   │
│  (automated on push) │
│                      │
│  ✅ Lint (v4 actions)│
│  ✅ Type Check       │
│  ✅ Build            │
└──────────────────────┘
         │
         ├─ Builds: twojaknajpa-app (Frontend)
         │
         └─ Builds: stefano-eliksir-backend (Backend)


┌─────────────────────────────────────────────────────────────┐
│                    YOUR DEPLOYMENT (Soon)                    │
│                                                               │
│  ┌──────────────────┐           ┌──────────────────┐        │
│  │  VERCEL          │ HTTP      │  RENDER          │        │
│  │  Frontend        │◄─────────►│  Backend Service │        │
│  │                  │           │                  │        │
│  │ twojaknajpa-app  │           │ stefano-eliksir  │        │
│  │                  │           │                  │        │
│  │ - Dashboard      │           │ - Auth Routes    │        │
│  │ - Editors        │           │ - Config Routes  │        │
│  │ - Live Preview   │           │ - AI Routes      │        │
│  │                  │           │ - CSRF Protected │        │
│  └──────────────────┘           └────────┬─────────┘        │
│           │                              │                   │
│           │                              │ SQL Commands      │
│           │                              │                   │
│           │                     ┌────────▼──────────┐        │
│           │                     │  RENDER           │        │
│           │                     │  PostgreSQL       │        │
│           │                     │                   │        │
│           │                     │ - tenants         │        │
│           │                     │ - users           │        │
│           │                     │ - sessions        │        │
│           │                     │ - gastro_configs  │        │
│           │                     │ - [other tables]  │        │
│           │                     └───────────────────┘        │
│           │                                                   │
│           └─► (Store data in localStorage for offline use)   │
│                                                               │
└─────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────┐
│                    DATA FLOW DIAGRAM                          │
│                                                               │
│  ┌────────────────────────────────────────────────┐         │
│  │  User Opens Dashboard                          │         │
│  └────────────┬─────────────────────────────────┘         │
│               │                                              │
│               ▼                                              │
│  ┌────────────────────────────────────────────────┐         │
│  │  AuthContext: Check session (GET /auth/me)     │         │
│  │  + Fetch CSRF Token (GET /csrf-token)          │         │
│  └────────────┬─────────────────────────────────┘         │
│               │                                              │
│               ▼                                              │
│  ┌────────────────────────────────────────────────┐         │
│  │  DashboardPage: Load Config                    │         │
│  │  + GET /api/config (with session cookie)       │         │
│  │  + Populate Zustand store                      │         │
│  └────────────┬─────────────────────────────────┘         │
│               │                                              │
│               ▼                                              │
│  ┌────────────────────────────────────────────────┐         │
│  │  User Edits Menu/Packages/Promotions           │         │
│  │  + Updates Zustand store (live preview)        │         │
│  │  + Sets isDirty = true                         │         │
│  └────────────┬─────────────────────────────────┘         │
│               │                                              │
│               │ (wait 30 seconds)                           │
│               ▼                                              │
│  ┌────────────────────────────────────────────────┐         │
│  │  Auto-Save Triggered (configStore)             │         │
│  │  + Get CSRF token from cache (or fetch new)    │         │
│  │  + POST /api/config with:                      │         │
│  │    - X-CSRF-Token header ✅                    │         │
│  │    - credentials: include ✅                   │         │
│  │    - config JSON body ✅                       │         │
│  └────────────┬─────────────────────────────────┘         │
│               │                                              │
│               ▼                                              │
│  ┌────────────────────────────────────────────────┐         │
│  │  Backend: ConfigController.updateConfig()      │         │
│  │  + Verify CSRF token ✅                        │         │
│  │  + Check tenant isolation ✅                   │         │
│  │  + Save to gastro_configs table ✅             │         │
│  │  + Return success response                     │         │
│  └────────────┬─────────────────────────────────┘         │
│               │                                              │
│               ▼                                              │
│  ┌────────────────────────────────────────────────┐         │
│  │  configStore: isDirty = false                  │         │
│  │  Save also to localStorage (persistence)       │         │
│  │  Next auto-save in 30 seconds                  │         │
│  └────────────────────────────────────────────────┘         │
│                                                               │
└─────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────┐
│                    SETUP TIMELINE                             │
│                                                               │
│  TODAY (Step 1-4 takes ~15 minutes)                          │
│  ├─ Create PostgreSQL DB on Render (5 min)  ◄─ YOU ARE HERE │
│  ├─ Create Backend Service on Render (5 min)                │
│  ├─ Deploy Backend (deploy time: 3-5 min)                   │
│  ├─ Initialize DB schema (seed script: 1 min)               │
│  └─ Test endpoints (5 min)                                  │
│                                                               │
│  TOMORROW (Optional - deploy frontend too)                  │
│  ├─ Deploy twojaknajpa-app to Vercel                        │
│  ├─ Set VITE_API_URL environment variable                  │
│  └─ Test full end-to-end flow                              │
│                                                               │
│  LATER (Krok 5 & 6)                                         │
│  ├─ Krok 5: GHOST Bot Marketing                            │
│  └─ Krok 6: Vercel Deployment                              │
│                                                               │
└─────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────┐
│                    SECURITY LAYERS                            │
│                                                               │
│  🔒 Layer 1: HTTPS (Vercel + Render provide SSL)            │
│  🔒 Layer 2: CSRF Tokens (X-CSRF-Token header)              │
│  🔒 Layer 3: Session Cookies (HttpOnly, Secure, SameSite)   │
│  🔒 Layer 4: Tenant Isolation (All requests filtered)       │
│  🔒 Layer 5: Authentication (User must be logged in)        │
│  🔒 Layer 6: Rate Limiting (optional - can add later)       │
│                                                               │
│  Flow: HTTPS → Auth Check → CSRF Validation → Tenant Check  │
│        → Database Access Control → Response Encrypted       │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Component Relationships

```
Frontend
├─ AuthProvider (CSRF + Session Management)
│  └─ AuthContext (user, loading, csrfToken, login, register, logout)
│     ├─ LoginPage (uses useAuth)
│     ├─ RegisterPage (uses useAuth)
│     └─ DashboardPage (uses useAuth + useConfigStore)
│
├─ configStore (Zustand with localStorage persistence)
│  ├─ saveToBackend (POST /api/config with CSRF)
│  ├─ loadFromBackend (GET /api/config with session)
│  └─ updateCategories, updatePackages, updatePromotions (local state)
│
└─ DashboardLayout
   ├─ Sidebar (section navigation)
   ├─ Editor Area
   │  ├─ HeroEditor (uses configStore)
   │  ├─ MenuEditor (uses configStore)
   │  ├─ PackagesEditor (uses configStore)
   │  └─ PromotionsEditor (uses configStore)
   └─ Live Preview (MagicGastroPro with live data)

Backend
├─ AuthController
│  ├─ login (POST /api/auth/login)
│  ├─ register (POST /api/auth/register)
│  ├─ logout (POST /api/auth/logout + CSRF)
│  ├─ refresh (POST /api/auth/refresh + CSRF)
│  └─ getCurrentUser (GET /api/auth/me)
│
├─ ConfigController
│  ├─ getConfig (GET /api/config + Auth + Tenant Isolation)
│  └─ updateConfig (POST /api/config + Auth + Tenant Isolation + CSRF)
│
└─ Middleware
   ├─ authenticate (verify session)
   ├─ csrfProtection (validate X-CSRF-Token)
   └─ tenantIsolationMiddleware (filter data by tenant)
```

---

## 🔄 Auto-Save Workflow

```
User Types in Editor
  │
  ▼
configStore State Changes
  │
  ▼
isDirty = true
  │
  ▼
Timer starts (30 second interval)
  │
  ▼
30 seconds pass OR user closes page
  │
  ▼
DashboardPage.useEffect triggers
  │
  ▼
configStore.saveToBackend(apiUrl)
  │
  ├─ Get CSRF token from cache or fetch fresh
  ├─ POST to /api/config with X-CSRF-Token
  ├─ Include session cookie (credentials: include)
  ├─ Backend validates CSRF
  ├─ Backend verifies tenant isolation
  ├─ Backend saves to gastro_configs table
  │
  ▼
Response received
  │
  ├─ Success: isDirty = false, clear timer
  └─ Error: Log error, keep isDirty = true, retry next interval
  │
  ▼
Process continues...
```

---

Once your Render database is live, everything connects automatically! 🚀
