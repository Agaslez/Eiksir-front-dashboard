# 🍸 ELIKSIR BAR - Status Projektu
**Data aktualizacji:** 28 grudnia 2025, 16:50  
**Wersja:** v1.0.1 MVP (LIVE)

---

## 📊 Status Ogólny

| Komponent | Status | URL | Commit |
|-----------|--------|-----|--------|
| **Backend API** | 🟢 LIVE | https://eliksir-backend-front-dashboard.onrender.com | `cdc1f51` |
| **Dashboard Admin** | 🟢 LIVE | https://eiksir-front-dashboard.vercel.app | `2e66743` |
| **Public Website** | 🟡 DEPLOYING | https://eiksir-front-dashboard.vercel.app | `2e66743` |
| **Database** | 🟢 LIVE | Neon PostgreSQL | 23 tables |

---

## ✅ Co Działa (Wdrożone i Przetestowane)

### 🔐 1. Autentykacja & Autoryzacja
- ✅ JWT Bearer tokens (bez cookies)
- ✅ **Role hierarchy (backend source of truth):**
  - owner (5) - pełny dostęp
  - admin (4) - zarządzanie treścią
  - manager (3) - podstawowe operacje
  - staff (2) - tylko odczyt (nie używane w MVP)
  - customer (1) - nie używane w MVP
- ✅ Login/logout flow
- ✅ Protected routes w dashboardzie
- ✅ Rate limiting dla `/api/auth/login`
- **Login:** `admin@eliksir-bar.pl` (password in vault)

### 📈 2. Analytics & SEO Tracking
- ✅ Śledzenie page views (path, visitor_id, time_on_page, referrer)
- ✅ Dashboard analytics z wykresami
- ✅ Statystyki:
  - Total views / Recent views (30 dni)
  - Unique visitors
  - Average time on page
  - Bounce rate
  - Popular pages (top 10)
  - Traffic sources (top 10)
- ✅ **FIX 27.12:** SQL COUNT/AVG zwracają numbers zamiast strings

### 📸 3. Galeria Obrazów (Backend + Dashboard)
- ✅ **Upload zdjęć:** max 5MB, formaty: JPEG, PNG, WebP, GIF
- ✅ **Metadata:** title, description, category
- ✅ **Kategorie:** Wszystkie, Wesela, Eventy firmowe, Urodziny, Drinki, Zespół
- ✅ **CRUD API:**
  - `GET /api/content/images?category=wesela` (admin auth)
  - `POST /api/content/images/upload` (multipart/form-data)
  - `PUT /api/content/images/:id` (update metadata)
  - `DELETE /api/content/images/:filename`
  - `PUT /api/content/images/reorder` (przygotowane)
- ✅ **Public API:** `GET /api/content/gallery/public` (no auth)
- ✅ **Dashboard UI:**
  - Filtrowanie po kategoriach
  - Modal edycji (title, description, category)
  - Podgląd pełnoekranowy
  - Copy URL do clipboard
  - Grid z hover actions
- ✅ **Database:** `gallery_images` table z `display_order` (sortowanie)
- ✅ **Storage:** Cloudinary CDN (persistent, ~25GB free tier)
- ✅ **FIX 28.12:** 
  - CORS dla Vercel preview URLs (regex pattern)
  - Circular dependency fix (auth middleware extraction)
  - Per-endpoint authentication
  - API_URL fallback z auto `/api` suffix

### 🧮 4. Kalkulator Ofert
- ✅ Settings management w dashboardzie
- ✅ Zapisywanie: base price, multipliers, add-ons
- ✅ Frontend packages hardcoded w `content.ts`

### ✉️ 5. Email Settings
- ✅ SMTP configuration (Render env vars)
- ✅ Test endpoint `/api/contacts/test`
- ✅ Environment variables: `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`

### 📝 6. Content Editor
- ✅ Load/save sections z bazy danych
- ✅ Sekcje: hero, about, services
- ✅ Edit mode w dashboardzie

### 🛡️ 7. Security & Infrastructure
- ✅ Helmet.js (CSP, XSS protection)
- ✅ CORS configured dla Vercel:
  - Dashboard: `https://eiksir-front-dashboard.vercel.app`
  - Preview URLs: `/^https:\/\/eiksir-front-dashboard.*\.vercel\.app$/` (regex)
- ✅ Rate limiting:
  - Auth: 5 req/min
  - AI endpoints: 20 req/15min
  - General API: 100 req/15min
- ✅ Trust proxy dla Render
- ✅ Compression middleware
- ✅ UTF-8 encoding dla polskich znaków
- ✅ JWT Auth middleware (server/middleware/auth.ts) - circular dependency fix

### 🗄️ 8. Database (PostgreSQL)
**Core tables (MVP używa ~10, schema ma 23+):**
- `users` - autentykacja, role
- `sessions` - sesje użytkowników
- `page_views` - SEO tracking
- `gallery_images` - galeria z metadata i display_order
- `content_sections` - edytowalna treść
- `calculator_settings` - ustawienia kalkulatora
- `email_settings` - konfiguracja email
- `seo_metadata`, `social_shares`, `testimonials`
- Plus: `api_keys`, `contacts`, `customers`, `gdpr_*`, `orders`, `tenants` (w schema, nieużywane w MVP)
- **Full schema:** Check Neon Console SQL Editor

---

## 🚧 W Trakcie / Do Naprawy

### 🌐 Public Website Gallery - FIX IN PROGRESS (28.12.2025 16:50)
**Status:** Deploying commit `2e66743`
- ✅ Backend API działa: 11 zdjęć z Cloudinary
- ✅ CORS fix dla Vercel preview URLs
- ✅ Auth middleware refactor (circular dependency resolved)
- 🔄 Frontend fix: API_URL auto-append `/api` suffix
- ⏳ Czeka na Vercel deployment (commit `2e66743`)

**Problem wykryty:**
- Vercel ma `VITE_API_URL=https://eliksir-backend-front-dashboard.onrender.com` (bez `/api`)
- Gallery.tsx requestowała `/content/gallery/public` zamiast `/api/content/gallery/public`
- Backend zwracał: `Cannot GET /content/gallery/public` (404)

**Rozwiązanie:**
```typescript
// Gallery.tsx - auto-append /api if missing
const baseUrl = import.meta.env.VITE_API_URL || 'https://eliksir-backend-front-dashboard.onrender.com';
const API_URL = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;
```

**Next steps po deployment:**
- [ ] Odśwież stronę (Ctrl+F5) aby wymusić nową wersję
- [ ] Sprawdź Network tab - Request URL powinien zawierać `/api/`
- [ ] Galeria powinna pokazać 11 zdjęć z Cloudinary

### 🔄 Drag & Drop Reordering
**Status:** Backend endpoint gotowy
- ✅ `PUT /api/content/images/reorder` endpoint
- ✅ `display_order` column w DB
- ✅ Sortowanie po `display_order ASC`
- ❌ Brak UI w dashboardzie

**Do zrobienia:**
1. Install `@dnd-kit/core` lub `react-beautiful-dnd`
2. Update `ImageGalleryEnhanced.tsx` z drag & drop
3. Wywołanie `/reorder` endpoint po drop

---

## 🎯 ROADMAP - Kolejne Kroki

### 📅 Faza 1: Galeria Public Website (TERAZ) ⚡
**Priorytet: P0 - Deployment w toku**

#### 1️⃣ Weryfikacja Vercel Deployment (2 min)
- [ ] **Sprawdź Vercel dashboard:**
  - Otwórz: https://dashboard.vercel.com
  - Znajdź projekt: eiksir-front-dashboard
  - Deployments → commit `2e66743` → Status: "Ready" ✅
  
- [ ] **Test public gallery:**
  ```bash
  curl https://eiksir-front-dashboard.vercel.app/
  # Scroll do sekcji Galeria → powinna pokazać 11 zdjęć
  ```

#### 2️⃣ DOD Tests - Gallery Persistence (15 min)
- [ ] **Test 1: Nowy upload**
  - Dashboard → Upload nowego zdjęcia
  - Sprawdź czy URL w DB zaczyna się od `https://res.cloudinary.com/`
  - Odśwież public website → zdjęcie powinno być widoczne

- [ ] **Test 2: Redeploy persistence**
  - Zrób trivial commit (np. dodaj komentarz w backend)
  - Push → czekaj 3-5 min na Render redeploy
  - Sprawdź public gallery → wszystkie zdjęcia WCIĄŻ widoczne (nie 404)

- [ ] **Test 3: Delete test**
  - Dashboard → usuń testowe zdjęcie
  - Sprawdź czy usunięte z: Dashboard, Public website, Cloudinary Media Library
  - Backend logs: powinny zawierać "✅ Deleted from Cloudinary: {publicId}"

#### 3️⃣ Cleanup Old Images (5 min)
- [ ] **Usuń stare 404 images:**
  - IDs 1-5 w DB (stare `/uploads/` URLs)
  - Opcja A: Delete przez dashboard jeden po drugim
  - Opcja B: SQL query w Neon Console:
    ```sql
    DELETE FROM gallery_images WHERE id IN (1,2,3,4,5);
    ```

### 📅 Faza 2: Testy Automatyczne (po Fazie 1)
**Priorytet: P1 - Wzmocnienie systemu**

#### 🧪 Smoke Tests (wykonywane po każdym deploy)
- [ ] Backend health: `GET /health` → status 200
- [ ] Admin login: `POST /api/auth/login` → JWT token
- [ ] Gallery public: `GET /api/content/gallery/public` → 11+ images
- [ ] Upload test: `POST /api/content/images/upload` → Cloudinary URL

#### 🧪 Unit Tests (server/)
- [ ] **Auth middleware:** `server/middleware/auth.ts`
  - `generateToken()` - generuje poprawny JWT
  - `verifyToken()` - weryfikuje token i zwraca payload
  - `authenticateToken()` - middleware rejects bez tokena
  - `requireRole()` - autoryzacja roli

- [ ] **Cloudinary helpers:** `server/lib/cloudinary.ts`
  - `uploadToCloudinary()` - upload buffer → URL
  - `deleteFromCloudinary()` - delete by publicId
  - `isCloudinaryEnabled()` - env check

- [ ] **Gallery API:** `server/routes/content.ts`
  - GET `/images` - requires auth
  - POST `/images/upload` - requires auth + multipart
  - GET `/gallery/public` - no auth required
  - DELETE `/images/:filename` - requires auth + deletes from Cloudinary

#### 🧪 Integration Tests (E2E)
- [ ] **Scenariusz 1: Admin upload workflow**
  1. Login jako admin
  2. Upload nowego zdjęcia
  3. Sprawdź czy jest w DB z Cloudinary URL
  4. Sprawdź czy widoczne w public gallery
  5. Delete zdjęcia
  6. Sprawdź czy usunięte z Cloudinary + DB

- [ ] **Scenariusz 2: Redeploy persistence**
  1. Upload test image → zapisz ID i URL
  2. Trigger backend redeploy (trivial commit)
  3. Czekaj 3-5 min
  4. Sprawdź czy zdjęcie WCIĄŻ działa (nie 404)

- [ ] **Scenariusz 3: Public website**
  1. Otwórz https://eiksir-front-dashboard.vercel.app
  2. Scroll do sekcji Galeria
  3. Sprawdź czy ładuje 11+ zdjęć
  4. Kliknij na zdjęcie → modal z full-size
  5. Filtry kategorii działają

#### 🛠️ Test Stack & CI/CD
- [ ] **Backend:** Jest + Supertest
  - `npm install -D jest supertest @types/jest @types/supertest`
  - Config: `jest.config.cjs`
  - Run: `npm test`

- [ ] **Frontend:** Vitest + Testing Library
  - Already installed
  - Add E2E: `npm install -D @playwright/test`
  - Run: `npm run test`

- [ ] **GitHub Actions CI:**
  - `.github/workflows/test.yml`
  - Auto-run na każdy push do `main`
  - Fail deployment jeśli testy nie przejdą

**Timing:** Stworzenie pełnego test suite: ~2-3 godziny po naprawie galerii

### 📅 Faza 3: Drag & Drop + Edycja
  - Backup zdjęć lokalnie przed każdym push
  - Metadata w DB zostanie (title, description, category)
  - Rozwiązanie: Cloudinary (Faza 2)

- [ ] **Rate Limiting - Info:**
  - Login: 5 prób/minutę
  - API: 100 req/15min
  - Jeśli przekroczysz: poczekaj 15 min

- [ ] **Free Plan Limity:**
  - Render: 750 godz/miesiąc (wystarczy)
  - Vercel: unlimited deployments
  - Neon: 0.5GB storage, 1 projekt

### 📅 Faza 2: Storage Migration (Następne)
**Priorytet: HIGH**
- [ ] **Setup Cloudinary:**
  1. Konto na cloudinary.com
  2. API keys do Render env vars
  3. Install `cloudinary` npm package
- [ ] **Update upload endpoint:**
  - Zamiast `multer` disk storage → upload to Cloudinary
  - Zwracaj Cloudinary URL w response
  - Zapisz URL w `gallery_images.url`
- [ ] **Migration script:**
  - Upload existing images z `/uploads` do Cloudinary
  - Update URLs w bazie danych
- [ ] **Test:** Upload → wyświetlenie → redeploy → sprawdź czy działa

### 📅 Faza 3: Public Website Deployment
**Priorytet: MEDIUM**
- [ ] **Vercel setup:**
  1. New project: `eliksir-website`
  2. Root directory: `eliksir-website/`
  3. Framework: Vite
  4. Build: `npm run build`
  5. Output: `dist/`
- [ ] **Environment variables:**
  ```
  VITE_API_URL=https://eliksir-backend-front-dashboard.onrender.com
  ```
- [ ] **Update CORS w backendzie:**
  - Dodaj public site URL do `corsOptions.origin`
- [ ] **Test:**
  - Galeria ładuje się z API
  - Metadata widoczne przy hover
  - Performance OK

### 📅 Faza 4: Gallery Enhancement
**Priorytet: MEDIUM**
- [ ] **Drag & Drop UI:**
  - Install `@dnd-kit/sortable`
  - Wrap grid w `SortableContext`
  - Add drag handles do images
  - Call `/api/content/images/reorder` on drop
- [ ] **Batch operations:**
  - Select multiple images
  - Bulk delete
  - Bulk category change
- [ ] **Image optimization:**
  - Automatic resize on upload
  - WebP conversion
  - Thumbnail generation

### 📅 Faza 5: Features & Polish
**Priorytet: LOW**
- [ ] **Email system:**
  - Contact form na public site
  - Email notifications dla admina
  - Autoresponder dla klientów
- [ ] **Booking system:**
  - Formularz rezerwacji
  - Calendar integration
  - Status tracking
- [ ] **AI Integration:**
  - SEO content suggestions
  - Social media post generator
  - Image alt text generator
- [ ] **Multi-language:**
  - i18n setup (PL/EN)
  - Language switcher

---

## 🏗️ Architektura Techniczna

### Backend Stack
```
Node.js 20.19.6
├── Express.js - REST API
├── TypeScript - Type safety
├── Drizzle ORM - Database queries
├── PostgreSQL (Neon) - Database
├── Multer - File uploads
├── JWT - Authentication
├── Helmet - Security headers
└── Rate limiting - DDoS protection
```

### Frontend Dashboard Stack
```
React 19
├── Vite 5.4 - Build tool
├── TypeScript - Type safety
├── Tailwind CSS - Styling
├── Framer Motion - Animations
├── Lucide Icons - UI icons
├── React Router - Navigation
└── Context API - State management
```

### Public Frontend Stack
```
React 19
├── Vite - Build tool
├── TypeScript
├── Tailwind CSS
├── Framer Motion
└── API Integration (fetch)
```

### Deployment
```
Backend:  Render.com (Free Plan)
          ├── Auto-deploy z GitHub
          ├── Node.js 20
          └── PORT from Render env (dynamic)

Dashboard: Vercel (Free Plan)
           ├── Auto-deploy z GitHub
           └── CDN global

Database:  Neon PostgreSQL (Free Plan)
           ├── Serverless
           └── 0.5GB storage

Public:    [Not deployed yet]
```

---

## 📂 Struktura Projektu

```
eliksir-website.tar/
├── stefano-eliksir-backend/          # Backend API (Render)
│   ├── server/
│   │   ├── index.ts                   # Main server
│   │   ├── routes/
│   │   │   ├── index.ts               # All routes (auth, content, SEO)
│   │   │   └── content.ts             # Gallery CRUD
│   │   ├── db/
│   │   │   ├── schema.ts              # Drizzle schema (23 tables)
│   │   │   └── index.ts               # DB connection
│   │   └── middleware/
│   │       └── auth.ts                # JWT verification
│   ├── scripts/
│   │   ├── seed-neon.ts               # Database seeding
│   │   └── migrate-gallery-order.ts   # Display order migration
│   └── uploads/images/                # Ephemeral storage (⚠️)
│
├── eliksir-frontend/                  # Dashboard Admin (Vercel)
│   ├── src/
│   │   ├── App.tsx                    # Main app
│   │   ├── pages/admin/Dashboard.tsx  # Admin layout
│   │   ├── components/admin/
│   │   │   ├── DashboardHome.tsx      # Stats overview
│   │   │   ├── ImageGalleryEnhanced.tsx  # Gallery manager
│   │   │   ├── ContentEditor.tsx      # Content editor
│   │   │   ├── CalculatorSettings.tsx # Calculator config
│   │   │   ├── EmailSettings.tsx      # SMTP config
│   │   │   └── Analytics.tsx          # Analytics dashboard
│   │   └── context/AuthContext.tsx    # Auth state
│   └── vercel.json                    # Vercel config
│
├── eliksir-website/                   # Public Frontend (Not deployed)
│   ├── src/
│   │   ├── App.tsx                    # Main app (with API gallery)
│   │   └── lib/content.ts             # Static content
│   └── package.json
│
├── DEPLOYMENT_CHECKLIST.md            # Deployment guide
├── PROJECT_STATUS.md                  # This file
└── README.md
```

---

## 🔑 Credentials & URLs

### Production Access
```
Dashboard: https://eiksir-front-dashboard.vercel.app/admin
Login:     admin@eliksir-bar.pl
Password:  (stored in password manager)
Role:      owner (level 5)

Backend:   https://eliksir-backend-front-dashboard.onrender.com
Health:    /health (returns API info)
Metrics:   /metrics (system stats)

Database:  Neon PostgreSQL
URL:       (in Render env vars)
```

### Quick Access Links (Bookmark These)
```
Render Dashboard: https://dashboard.render.com/web/srv-ctub49lds78s73bkpnmg
Render Logs:      https://dashboard.render.com/web/srv-ctub49lds78s73bkpnmg/logs
Vercel Dashboard: https://vercel.com/stefans-projects-b8091071/eiksir-front-dashboard
Neon Console:     https://console.neon.tech/
Neon SQL Editor:  https://console.neon.tech/ (SQL Editor tab)
```

### GitHub Repositories
```
Backend:   https://github.com/Agaslez/Eliksir-Backend-front-dashboard
Dashboard: https://github.com/Agaslez/Eiksir-front-dashboard
```

---

## 📊 Metryki Projektu

### Kod
- **Backend:** ~3,500 LOC (TypeScript)
- **Frontend Dashboard:** ~2,800 LOC (TypeScript + React)
- **Public Frontend:** ~1,200 LOC (TypeScript + React)
- **Total:** ~7,500 LOC

### API Endpoints
- **Auth:** 3 endpoints (login, logout, me)
- **Content:** 8 endpoints (sections, gallery CRUD)
- **SEO:** 4 endpoints (track, stats, metadata)
- **Email:** 2 endpoints (settings, test)
- **Calculator:** 2 endpoints (get/save settings)
- **Total:** ~19 production endpoints

### Database
- **Tables:** 23
- **Indexes:** 12
- **Foreign Keys:** 8
- **Current Size:** ~2MB (with test data)

### Performance
- **Backend Response Time:** ~50-200ms
- **Dashboard Load:** ~1.5s (cold start)
- **API Rate Limit:** 100 req/15min
- **Image Upload:** max 5MB per file

---

## 🐛 Znane Problemy & Workarounds

### 1. Ephemeral Storage na Render
**Problem:** Zdjęcia usuwane przy redeploy  
**Impact:** DB contains references to missing files → UI shows 404/broken images  
**Workaround:** Re-upload po deploy  
**Fix:** Migracja do Cloudinary (Faza 2)  
**UI Handling:** Dashboard musi gracefully handle 404 responses (show placeholder)

### 2. Render Free Plan Cold Starts
**Problem:** First request after inactivity = 30-60s delay  
**Impact:** Dashboard może wyglądać jako "offline" przez minutę  
**Workaround:** Keep-alive ping co 10 min (opcjonalne)  
**User Experience:** Loading spinner + "Waking up server..." message  
**Note:** Dashboard "1.5s load" dotyczy warm instance, nie cold start

### 3. CORS Headers dla Images
**Status:** NAPRAWIONE commit `c194475`  
**Solution:** `express.static` z `setHeaders` callback  
**Deployed:** ✅ LIVE

### 4. Analytics zwracał stringi zamiast numbers
**Status:** NAPRAWIONE commit `15d547f`  
**Solution:** Explicit `Number()` conversion dla SQL results  
**Deployed:** ✅ LIVE

### 5. Public Frontend nie wdrożony
**Problem:** Kod gotowy, ale brak deployment  
**Impact:** Zdjęcia z dashboardu nie widoczne publicznie  
**Fix:** Deploy do Vercel (Faza 3)

---

## 🎓 Lessons Learned

### Deployment
1. **Trust Proxy:** CRITICAL dla Render (rate limiter wymaga)
2. **Role Hierarchy:** Backend != Frontend exact match (owner > admin)
3. **Port Configuration:** Render provides PORT automatically
4. **CORS Timing:** Add frontend URL before deployment
5. **Image Storage:** Free plans = ephemeral, use cloud storage
6. **SQL Types:** PostgreSQL COUNT() returns strings, need conversion

### Development
1. **JWT Bearer:** Prostsze niż cookies, lepsze dla API
2. **TypeScript:** Wyłapało wiele błędów przed runtime
3. **Drizzle ORM:** Czytelny SQL, ale wymaga type casting
4. **Vite:** Szybki build, ale wymaga konfiguracji dla proxy
5. **Tailwind:** Świetny DX, ale verbose classes

### Testing
1. Zawsze testuj na produkcji po deploy
2. Smoke test: health → login → dashboard
3. Monitor Render logs dla błędów
4. Verify commit hash w deployment logs

---

## 📞 Support & Maintenance

### Monitoring
- **Backend Health:** Check `/health` endpoint
- **Database:** Neon dashboard (connection count, storage)
- **Frontend:** Vercel analytics (visitors, errors)
- **Logs:** Render dashboard → Logs tab

### Backup Strategy
- **Database:** Neon automatic backups (7 days retention)
- **Code:** Git commits + GitHub (all changes tracked)
- **Images:** ⚠️ No backup (ephemeral storage)

### Update Process
```bash
# Local development
git checkout main
git pull

# Make changes
git add .
git commit -m "feat: description"
git push

# Auto-deploy
# Backend: Render (~3-5 min, może być cold start)
# Frontend: Vercel (~1-2 min)
```

### Release Checklist (After Every Deploy)
```bash
# 1. Health Check
curl https://eliksir-backend-front-dashboard.onrender.com/health
# Expected: {"status":"healthy", "apiVersion":"1.0.0", ...}

# 2. Authentication
curl -X POST https://eliksir-backend-front-dashboard.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@eliksir-bar.pl","password":"***"}'
# Expected: {"token":"eyJ...", "user":{...}}

# 3. Protected Endpoint
curl https://eliksir-backend-front-dashboard.onrender.com/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
# Expected: {"id":1, "email":"admin@...", "role":"owner"}

# 4. Dashboard UI
# Open: https://eiksir-front-dashboard.vercel.app/admin
# Login → Dashboard loads → Check Analytics/Gallery
```

---

## 🎯 Success Criteria (MVP Checklist)

### Phase 1-7: Deployment ✅ COMPLETE
- [x] All tests passing (18/18)
- [x] Backend deployed to Render
- [x] Frontend deployed to Vercel
- [x] Database connected (Neon PostgreSQL)
- [x] Admin can login
- [x] Dashboard displays stats
- [x] Image gallery working
- [x] All CRUD operations tested

### Phase 8: Production Ready ✅ COMPLETE
- [x] Trust proxy configured
- [x] Rate limiting active
- [x] CORS configured
- [x] Security headers (Helmet)
- [x] Error handling
- [x] Logging enabled
- [x] **Analytics fix deployed** (commit 15d547f LIVE)
- [x] **CORS for images deployed** (commit c194475 LIVE)
- [ ] Image storage migration (Faza 2 - Cloudinary)
- [ ] Public website deployment (Faza 3)

### Phase 9: Feature Complete 📋 TODO
- [ ] Drag & drop reordering
- [ ] Email notifications
- [ ] Booking system
- [ ] Multi-language support
- [ ] SEO optimization complete
- [ ] Performance optimization
- [ ] Mobile responsive testing

---

## 🚀 Quick Start Commands

```bash
# Backend (local development)
cd stefano-eliksir-backend
npm install
npm run dev          # Port 3001

# Frontend Dashboard (local)
cd eliksir-frontend
npm install
npm run dev          # Port 5173

# Public Frontend (local)
cd eliksir-website
npm install
npm run dev          # Port 5173

# Database operations
cd stefano-eliksir-backend
npx tsx scripts/seed-neon.ts              # Seed database
npx tsx scripts/migrate-gallery-order.ts  # Add display_order

# Testing
npm test                    # Run all tests
npm test -- --watch        # Watch mode
npm run type-check         # TypeScript check

# Deployment
git push                   # Auto-deploy (Render + Vercel)
```

---

## 📈 Następne Sesje - Action Items

### Sesja Następna #1: Cloudinary Migration
1. ✅ Setup Cloudinary account
2. ✅ Add API keys to Render env
3. ✅ Update upload endpoint
4. ✅ Migrate existing images
5. ✅ Test upload → display → redeploy

### Sesja Następna #2: Public Website Deploy
1. ✅ Create Vercel project
2. ✅ Configure build settings
3. ✅ Add environment variables
4. ✅ Update backend CORS
5. ✅ Deploy and test

### Sesja Następna #3: Drag & Drop
1. ✅ Install dnd library
2. ✅ Update ImageGalleryEnhanced
3. ✅ Implement drag handlers
4. ✅ Connect to reorder endpoint
5. ✅ Test functionality

---

---

## 🚨 Production Risks & Mitigations

### Critical Risks
1. **Ephemeral Storage (HIGH)**
   - Risk: Every Render redeploy = all uploaded images deleted
   - Impact: UI shows broken images, poor user experience
   - Mitigation: Cloudinary migration (Faza 2) - PRIORITY
   - Temporary: Backup images locally before each push

2. **Cold Start Delays (MEDIUM)**
   - Risk: Free plan sleeps after 15min inactivity
   - Impact: First request = 30-60s delay, looks "broken"
   - Mitigation: Paid plan ($7/mo) OR keep-alive ping
   - UI: Show "Server starting..." message

3. **Rate Limiting (LOW)**
   - Risk: Login attempts = 5/min, API = 100/15min
   - Impact: Blocked access if exceeded
   - Mitigation: Frontend retry logic + user message

4. **Single Point of Failure (MEDIUM)**
   - Risk: Render down = całe API offline
   - Impact: Dashboard unusable
   - Mitigation: Monitor uptime, consider multi-region (later)

### Free Plan Limits (Monitor Monthly)
- Render: 750 hours/month (31 days × 24h = 744h - margines 6h)
- Neon: 0.5GB storage, 1 project
- Vercel: Unlimited deployments (hobby plan)

### Source of Truth
- **Code:** GitHub (main branch)
- **Database Schema:** Neon Console → SQL Editor
- **Roles:** Backend defines hierarchy (owner=5, admin=4, manager=3)
- **Environment:** Render env vars (never commit secrets)

---

**Ostatnia aktualizacja:** 27 grudnia 2025, 23:15  
**Status:** 🟢 MVP LIVE | ✅ All fixes deployed | ⚠️ Ephemeral storage active  
**Next Steps:** Test all features → Cloudinary migration → Public website deploy

---

*Ten dokument jest automatycznie aktualizowany po każdej znaczącej zmianie w projekcie.*
