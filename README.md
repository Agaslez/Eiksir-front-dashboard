# 🍸 ELIKSIR - Mobilny Bar Koktajlowy Premium

[![Production](https://img.shields.io/badge/Status-Production_Ready-success)](https://eiksir-front-dashboard.vercel.app)
[![Backend](https://img.shields.io/badge/Backend-Render-blueviolet)](https://stefano-eliksir-backend.onrender.com)
[![Database](https://img.shields.io/badge/Database-Neon_PostgreSQL-blue)](https://neon.tech)

**Profesjonalna aplikacja webowa dla mobilnego baru koktajlowego ELIKSIR.**  
Kompleksowy system: frontend + backend + admin panel + database + CDN.

---

## 🚀 System Overview

### **Stack Technologiczny:**

#### **Frontend** (React 19 + TypeScript)
- Framework: React 19.0.0 + Vite 6
- Styling: Tailwind CSS 3 + Framer Motion
- State: React Context API
- Testing: Jest 29.7 + 53 passing tests
- Deployment: Vercel (auto-deploy z GitHub)

#### **Backend** (Node.js + Express)
- Runtime: Node.js 20+ + TypeScript 5.4
- Framework: Express.js + Drizzle ORM
- Database: Neon PostgreSQL (27 tables)
- Auth: JWT + bcrypt
- Deployment: Render.com (auto-deploy z GitHub)

#### **Infrastructure:**
- CDN: Cloudinary (image storage & optimization)
- Analytics: Google Analytics (G-93QYC5BVDR)
- Monitoring: Render logs + health checks
- CI/CD: GitHub Actions

---

## 📁 Struktura Projektu

```
eliksir-website.tar/
├── eliksir-frontend/          # Frontend (React 19)
│   ├── src/
│   │   ├── components/        # UI components (40+)
│   │   ├── pages/            # Routes (Home, About, Gallery, etc.)
│   │   ├── context/          # Global state
│   │   └── lib/              # API client
│   ├── public/               # Static assets
│   └── package.json
│
├── stefano-eliksir-backend/   # Backend API (Express + PostgreSQL)
│   ├── server/
│   │   ├── routes/           # API endpoints
│   │   ├── controllers/      # Business logic
│   │   ├── db/              # Drizzle ORM schema (27 tables)
│   │   └── middleware/       # Auth, CORS, rate limiting
│   ├── .env                  # Local secrets (NOT in git)
│   └── package.json
│
├── docs/                      # Documentation
│   ├── FINAL_REPORT_100_PERCENT.md
│   ├── SYSTEM_AUDIT_CHECKLIST.md
│   ├── SECRETS_MANAGEMENT.md
│   ├── DATABASE_INFO.md
│   └── archive-2025-12-30/   # Historical docs
│
└── README.md                  # This file
```

---

## 🎯 Główne Funkcjonalności

### **Dla Klientów (Frontend):**
✅ **Kalkulator wyceny** - Automatyczne obliczanie kosztów eventu  
✅ **Galeria zdjęć** - 30+ zdjęć z eventów (auto-refresh co 30s)  
✅ **Sekcja O Nas** - Historia, wartości, team (edytowalne przez admin)  
✅ **Formularz kontaktowy** - Wysyłanie zapytań z snapshot'em kalkulatora  
✅ **Responsywność** - Mobile-first design  
✅ **SEO** - robots.txt, sitemap.xml, Open Graph, JSON-LD  

### **Dla Administratora (Admin Panel):**
✅ **Dashboard** - Live statistics (views, unique users, avg time)  
✅ **Content Editor** - WYSIWYG edycja sekcji O Nas (5 sections)  
✅ **Gallery Manager** - Upload/delete zdjęć (Cloudinary integration)  
✅ **Calculator Config** - Edycja cen, kategorii, opcji  
✅ **Email Management** - Przegląd zapytań od klientów  
✅ **Pixel Tracking** - Analityka wizyt (pages, sources, devices)  

### **Backend Features:**
✅ **RESTful API** - 30+ endpoints (auth, content, stats, calculator)  
✅ **JWT Authentication** - Secure admin access  
✅ **Rate Limiting** - DDoS protection (auth/AI/API limiters)  
✅ **Image Upload** - Cloudinary CDN integration  
✅ **Database Persistence** - All configs & content in PostgreSQL  
✅ **Health Checks** - `/api/health` monitoring  
✅ **Logging Endpoint** - Frontend → Backend error tracking  

---

## 🔧 Quick Start

### **Frontend Development:**
```bash
cd eliksir-frontend
npm install
npm run dev
# http://localhost:5174
```

### **Backend Development:**
```bash
cd stefano-eliksir-backend
# Skopiuj sekrety z .env.example
npm install
npm run dev
# http://localhost:3001
```

### **Full Stack (Both):**
```bash
# Terminal 1 - Backend
cd stefano-eliksir-backend && npm run dev

# Terminal 2 - Frontend
cd eliksir-frontend && npm run dev
```

---

## 🧪 Testing

### **🔥 Smoke Tests (CRITICAL - Pre-Deployment):**
```bash
# Uruchom PRZED każdym deploymentem
npm run smoke-test

# Lub bezpośrednio:
npx playwright test smoke.spec.ts --project=chromium

# Windows PowerShell:
.\scripts\smoke-test.ps1

# Linux/Mac:
./scripts/smoke-test.sh
```

**Co sprawdzają smoke testy:**
- ✅ Frontend się ładuje i renderuje (200 OK)
- ✅ Backend odpowiada na requesty
- ✅ Kluczowe endpointy działają (config, gallery, content)
- ✅ Frontend może pobierać dane z backendu
- ✅ Kalkulator jest widoczny
- ✅ Formularz kontaktowy działa
- ✅ Brak krytycznych błędów w konsoli
- ✅ Panel admina jest dostępny
- ✅ System email skonfigurowany

**🚨 WAŻNE:** Jeśli smoke testy failują - **ZATRZYMAJ DEPLOYMENT**!

### **Unit Tests (Jest):**
```bash
cd eliksir-frontend
npm test              # Run all 53 tests
npm test -- --coverage  # Coverage report
```

### **E2E Tests (Playwright):**
```bash
npm run test:e2e
# Tests: Auth flow, Dashboard, Content editor, Gallery
```

**Test Coverage:**
- ✅ 10/10 smoke tests (critical system health)
- ✅ 53/53 unit tests passing
- ✅ All tests use mocks (no real DB connections)
- ✅ E2E framework configured (271+ lines of tests)
- ✅ GitHub Actions integration (auto-run on push)

---

## 🔒 Security

### **Authentication:**
- JWT tokens (512-char strong secret)
- bcrypt password hashing (384-char salt)
- Session secrets (512-char)
- Cookie encryption (512-char)

### **Best Practices:**
✅ `.env` nie w git (zablokowany przez .gitignore)  
✅ Rate limiting (auth: 5 req/15min, API: 100 req/15min)  
✅ CORS whitelisting  
✅ Input validation (backend middleware)  
✅ SQL injection protection (Drizzle ORM parameterized queries)  

**Dokumentacja security:** [docs/SECRETS_MANAGEMENT.md](docs/SECRETS_MANAGEMENT.md)

---

## 📊 Database Schema

**27 tabel PostgreSQL (Neon):**

| Kategoria | Tabele |
|-----------|--------|
| **Content** | `about_sections`, `gallery_images` |
| **Calculator** | `calculator_config`, `calculator_snapshots` |
| **Admin** | `users`, `sessions` |
| **Analytics** | `page_views`, `traffic_sources`, `device_stats` |
| **Email** | `contact_submissions`, `email_logs` |

**Szczegóły:** [docs/DATABASE_INFO.md](docs/DATABASE_INFO.md)

---

## 🚀 Deployment

### **Production URLs:**
- **Frontend:** `https://eiksir-front-dashboard.vercel.app` (Vercel)
- **Backend:** `https://stefano-eliksir-backend.onrender.com`
- **Database:** Neon PostgreSQL (eu-central-1)

### **CI/CD Pipeline:**
```
GitHub Push → Render Auto-Deploy → Health Check → Live
```

### **Environment Variables (Render):**
```env
DATABASE_URL=postgresql://...
JWT_SECRET=***512-chars***
SESSION_SECRET=***512-chars***
PASSWORD_SALT=***384-chars***
CLOUDINARY_CLOUD_NAME=dkpmxdpgn
CLOUDINARY_API_KEY=***
CLOUDINARY_API_SECRET=***
```

**Setup Guide:** [docs/SECRETS_MANAGEMENT.md](docs/SECRETS_MANAGEMENT.md)

---

## 📈 Analytics & Monitoring

### **Google Analytics:**
- Tracking ID: `G-93QYC5BVDR`
- Integration: gtag.js (frontend)
- Events: Page views, calculator usage, form submissions

### **Health Monitoring:**
```bash
# Backend health check
curl https://stefano-eliksir-backend.onrender.com/api/health

# Expected response:
{"status":"healthy","timestamp":"2025-12-30T..."}
```

---

## 📚 Dokumentacja

| Dokument | Opis |
|----------|------|
| [FINAL_REPORT_100_PERCENT.md](docs/FINAL_REPORT_100_PERCENT.md) | Raport końcowy 12/12 tasków ✅ |
| [SYSTEM_AUDIT_CHECKLIST.md](docs/SYSTEM_AUDIT_CHECKLIST.md) | Checklist audytu systemu |
| [SECRETS_MANAGEMENT.md](docs/SECRETS_MANAGEMENT.md) | Zarządzanie sekretami |
| [DATABASE_INFO.md](docs/DATABASE_INFO.md) | Schemat bazy danych |
| [TESTING_GUIDE.md](docs/TESTING_GUIDE.md) | Instrukcje testowania |
| [docs/archive-2025-12-30/](docs/archive-2025-12-30/) | Archiwalne dokumenty |

---

## 🛠️ Development Commands

### **Frontend:**
```bash
npm run dev          # Development server (port 5174)
npm run build        # Production build
npm run preview      # Preview production build
npm test             # Run Jest tests
npm run lint         # ESLint check
```

### **Backend:**
```bash
npm run dev          # Development server (port 3001)
npm run build        # Compile TypeScript
npm start            # Production mode
npm run db:push      # Push schema to database
npm run db:studio    # Drizzle Studio GUI
```

---

## 🤝 Contributing

### **Workflow:**
1. Feature branch: `git checkout -b feature/nazwa`
2. Commit: `git commit -m "feat: opis"`
3. Push: `git push origin feature/nazwa`
4. Create Pull Request na GitHub
5. Auto-deploy po merge do `main`

### **Commit Convention:**
- `feat:` - Nowa funkcjonalność
- `fix:` - Bugfix
- `docs:` - Dokumentacja
- `test:` - Testy
- `refactor:` - Refactoring
- `chore:` - Maintenance

---

## 📞 Contact

**Projekt:** ELIKSIR - Mobilny Bar Koktajlowy  
**Tech Lead:** GitHub @Agaslez  
**Status:** ✅ Production Ready (100% feature complete)  
**Last Update:** 2025-12-30  

---

## 📝 License

Proprietary - All rights reserved © 2025 ELIKSIR

---

**🎉 System Status: 100% Complete**  
✅ Frontend + Backend + Database  
✅ 53/53 Tests Passing  
✅ Security Audited  
✅ Production Deployed
