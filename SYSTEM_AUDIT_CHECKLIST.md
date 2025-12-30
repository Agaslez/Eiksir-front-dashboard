# 🔍 ELIKSIR - System Audit & Action Checklist
**Data audytu:** 30 grudnia 2025, 12:45  
**Status:** ✅ Większość DONE  
**Commity:** Backend `6c47031`, Frontend `6b80b0d`

---

## 📊 STATUS REALTIME (30.12.2025)

### ✅ ZROBIONE (8/12):
1. ✅ Calculator Config → **W BAZIE** (1 row, ostatnia zmiana: 30.12.2025, 11:44:53)
2. ✅ Gallery Auto-refresh → **DZIAŁA** (polling 30s)
3. ✅ robots.txt → **ISTNIEJE** (public/robots.txt)
4. ✅ sitemap.xml → **ISTNIEJE** (public/sitemap.xml)
5. ✅ Open Graph Meta Tags → **ZROBIONE** (index.html)
6. ✅ Twitter Cards → **ZROBIONE** (index.html)
7. ✅ Google Analytics → **SKONFIGUROWANY** (G-93QYC5BVDR)
8. ✅ JSON-LD Schema → **ZROBIONE** (index.html)

### ⚠️ DO ZROBIENIA (4/12):
9. ⚠️ Content Sections → **TABELA PUSTA** (0 rows)
10. ⚠️ Stats API → **NIE DZIAŁA** (wymaga auth token)
11. ⚠️ ErrorBoundary → **NIE UŻYTY** (zdefiniowany ale nie wrapped)
12. ⚠️ Backend Logging → **ENDPOINT NIE ISTNIEJE** (/api/logs)

---

---

## ✅ **CO DZIAŁA POPRAWNIE**

### **Backend API**
- ✅ `/api/calculator/config` - zwraca konfigurację kalkulatora (GET public, PUT protected)
- ✅ `/api/content/gallery/public` - zwraca zdjęcia galerii z `displayOrder`
- ✅ Cloudinary CDN - upload i hosting zdjęć
- ✅ JWT Authentication - chronione endpointy
- ✅ TypeScript kompilacja - 0 błędów
- ✅ CORS - skonfigurowany dla Vercel

### **Frontend**
- ✅ Calculator - pobiera config z API przy mount
- ✅ Gallery (główna + HorizontalGallery) - wyświetla zdjęcia z API
- ✅ Sortowanie zdjęć - według `displayOrder` z backendu
- ✅ Kontakt - email: **kontakt@eliksir-bar.pl**, tel: **+48 781 024 701**
- ✅ Analytics - `trackEvent()` loguje do localStorage
- ✅ Build - Vite 6.4.1, bundle 183 kB, 0 vulnerabilities
- ✅ Responsive - działa na mobile/desktop

### **Deployment**
- ✅ Backend - Render.com (auto-deploy z GitHub)
- ✅ Frontend - Vercel (auto-deploy z GitHub)
- ✅ Database - Neon PostgreSQL
- ✅ CDN - Cloudinary dla zdjęć

---

## 🔴 **PROBLEMY KRYTYCZNE (FIX TERAZ)**

### 1. **Calculator Config NIE Persystowany**
**Problem:** `currentConfig` trzymany tylko w pamięci (stefano-eliksir-backend/server/routes/calculator.ts:54)  
**Efekt:** Po restarcie backendu wraca do domyślnych wartości  
**Fix:**
```typescript
// 1. Dodaj do schema.ts:
export const calculatorConfig = pgTable('calculator_config', {
  id: serial('id').primaryKey(),
  promoDiscount: real('promo_discount').notNull().default(0.2),
  pricePerExtraGuest: json('price_per_extra_guest').notNull(),
  addons: json('addons').notNull(),
  shoppingList: json('shopping_list').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 2. Migruj tabelę: npm run db:push
// 3. Zmień calculator.ts GET/PUT aby używały db zamiast currentConfig
```
**Priorytet:** 🔴 Krytyczny  
**Czas:** 30 min

---

### 2. **Gallery - Brak Realtime Refresh**
**Problem:** Dodajesz zdjęcie w dashboardzie → frontend nie widzi zmiany  
**Przyczyna:** `useEffect([], [])` w Gallery.tsx pobiera zdjęcia tylko raz przy mount  
**Fix - Opcja A (prosty):**
```typescript
// Gallery.tsx - dodaj button refresh
<button onClick={() => fetchImages()}>Odśwież galerię</button>
```
**Fix - Opcja B (automatic):**
```typescript
// Polling co 30s
useEffect(() => {
  fetchImages();
  const interval = setInterval(fetchImages, 30000);
  return () => clearInterval(interval);
}, []);
```
**Priorytet:** 🔴 Krytyczny  
**Czas:** 15 min

---

### 3. **SEO - Brak robots.txt**
**Problem:** Google nie może crawlować strony  
**Efekt:** 0 indeksacji w wyszukiwarce  
**Fix:**
```txt
// public/robots.txt
User-agent: *
Allow: /
Sitemap: https://eliksir-bar.pl/sitemap.xml
```
**Priorytet:** 🔴 Krytyczny  
**Czas:** 2 min

---

### 4. **SEO - Brak sitemap.xml**
**Problem:** Google nie zna struktury strony  
**Fix:**
```xml
<!-- public/sitemap.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://eliksir-bar.pl/</loc><priority>1.0</priority></url>
  <url><loc>https://eliksir-bar.pl/#oferta</loc><priority>0.8</priority></url>
  <url><loc>https://eliksir-bar.pl/#kalkulator</loc><priority>0.9</priority></url>
  <url><loc>https://eliksir-bar.pl/#galeria</loc><priority>0.8</priority></url>
  <url><loc>https://eliksir-bar.pl/#kontakt</loc><priority>0.9</priority></url>
</urlset>
```
**Priorytet:** 🔴 Krytyczny  
**Czas:** 5 min

---

## 🟡 **PROBLEMY WAŻNE (FIX W TYM TYGODNIU)**

### 5. **SEO - Brak Open Graph Meta Tags**
**Problem:** Brak preview przy share na Facebook/LinkedIn  
**Lokalizacja:** index.html (tylko basic meta description)  
**Fix:**
```html
<!-- index.html <head> -->
<meta property="og:type" content="website" />
<meta property="og:url" content="https://eliksir-bar.pl/" />
<meta property="og:title" content="ELIKSIR - Mobilny Bar Koktajlowy na Twoją Imprezę" />
<meta property="og:description" content="Profesjonalny mobilny bar koktajlowy. Wesela, eventy firmowe, przyjęcia prywatne. Koktajle alkoholowe i bezalkoholowe. Cała Polska." />
<meta property="og:image" content="https://eliksir-bar.pl/og-image.jpg" />
<meta property="og:locale" content="pl_PL" />

<!-- Twitter Cards -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="ELIKSIR - Mobilny Bar Koktajlowy" />
<meta name="twitter:description" content="Profesjonalny bar mobilny na wesela i eventy" />
<meta name="twitter:image" content="https://eliksir-bar.pl/og-image.jpg" />
```
**Dodaj:** Zdjęcie `public/og-image.jpg` (1200x630px)  
**Priorytet:** 🟡 Ważny  
**Czas:** 20 min

---

### 6. **SEO - Brak JSON-LD Structured Data**
**Problem:** Google nie rozumie że to lokalna firma  
**Efekt:** Brak w Google Maps, brak rich snippets  
**Fix:**
```html
<!-- index.html przed </body> -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "ELIKSIR - Mobilny Bar Koktajlowy",
  "description": "Profesjonalny mobilny bar koktajlowy na wesela, eventy firmowe i imprezy prywatne",
  "telephone": "+48781024701",
  "email": "kontakt@eliksir-bar.pl",
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "PL",
    "addressRegion": "Cała Polska"
  },
  "url": "https://eliksir-bar.pl",
  "priceRange": "$$",
  "areaServed": {
    "@type": "Country",
    "name": "Polska"
  },
  "serviceType": ["Bar koktajlowy", "Obsługa barmańska", "Catering alkoholowy"]
}
</script>
```
**Priorytet:** 🟡 Ważny  
**Czas:** 15 min

---

### 7. **Google Analytics Nie Skonfigurowany**
**Problem:** `window.gtag` sprawdzany ale brak skryptu  
**Efekt:** Tracking tylko do localStorage, brak realnych statystyk  
**Fix:**
```html
<!-- index.html w <head> -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```
**Priorytet:** 🟡 Ważny  
**Czas:** 10 min (+ 5 min setup GA4)

---

### 8. **Dashboard Calculator - Brak Realtime Sync**
**Problem:**  
1. Admin zmienia `promoDiscount` w dashboard CalculatorSettings
2. Zapisuje do backendu (PUT `/api/calculator/config`)
3. Frontend Calculator NIE widzi zmian (useEffect tylko przy mount)

**Fix:**
```typescript
// Calculator.tsx - dodaj polling lub timestamp check
useEffect(() => {
  fetchConfig();
  // Refresh co 60s jeśli admin może edytować
  const interval = setInterval(fetchConfig, 60000);
  return () => clearInterval(interval);
}, []);
```
**Lub:** Dodaj "Odśwież kalkulator" button dla admina  
**Priorytet:** 🟡 Ważny  
**Czas:** 20 min

---

## 🟢 **NICE TO HAVE (FIX W PRZYSZŁOŚCI)**

### 9. **ErrorBoundary Nie Używany**
**Problem:** Komponent `ErrorBoundary` zdefiniowany w error-monitoring.tsx ale nigdzie nie użyty  
**Fix:**
```typescript
// main.tsx
import { ErrorBoundary } from './lib/error-monitoring';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
```
**Priorytet:** 🟢 Nice to have  
**Czas:** 5 min

---

### 10. **Backend Logging Endpoint Nie Istnieje**
**Problem:** error-monitoring.tsx próbuje wysłać logi do `/api/logs` (linia 122) ale endpoint nie istnieje  
**Fix:**
```typescript
// backend/server/routes/logs.ts
router.post('/logs', async (req: Request, res: Response) => {
  const { level, message, context } = req.body;
  // Save to database or external service (Sentry, Logtail)
  console.log(`[${level}] ${message}`, context);
  res.json({ success: true });
});
```
**Priorytet:** 🟢 Nice to have  
**Czas:** 30 min

---

### 11. **Brak Canonical URLs**
**Problem:** Duplikacja SEO dla `/?section=galeria` vs `/#galeria`  
**Fix:**
```html
<!-- index.html -->
<link rel="canonical" href="https://eliksir-bar.pl/" />
```
**Priorytet:** 🟢 Nice to have  
**Czas:** 2 min

---

### 12. **Social Links Placeholder**
**Problem:** Footer ma linki do `https://facebook.com` i `https://instagram.com`  
**Fix:**
```typescript
// FooterEliksir.tsx
const socialLinks = [
  { icon: Facebook, href: 'https://facebook.com/eliksir.bar', label: 'Facebook' },
  { icon: Instagram, href: 'https://instagram.com/eliksir.bar', label: 'Instagram' },
];
```
**Priorytet:** 🟢 Nice to have  
**Czas:** 2 min

---

## 📊 **AKTUALNY STATUS SYSTEMU**

### **Galerie**
- ✅ Backend zwraca zdjęcia z `displayOrder`
- ✅ Frontend sortuje poprawnie
- ❌ Brak auto-refresh po dodaniu zdjęcia w dashboardzie
- **Status:** Działa, wymaga refresh button

### **Kalkulator**
- ✅ Pobiera config z API
- ✅ Obliczenia działają poprawnie
- ❌ Config w pamięci (nie w bazie)
- ❌ Brak sync z dashboard po zmianie
- **Status:** Działa, ale niestabilny po restarcie

### **SEO**
- ✅ Basic meta tags
- ❌ Brak robots.txt
- ❌ Brak sitemap.xml
- ❌ Brak Open Graph
- ❌ Brak JSON-LD
- **Status:** Nieindeksowalny przez Google

### **Analytics**
- ✅ trackEvent() implementacja
- ❌ Google Analytics nie skonfigurowany
- **Status:** Logi tylko localStorage

---

## 🎯 **PLAN DZIAŁANIA (PRIORITIZACJA)**

### **DZISIAJ (29.12.2025)** ⏰ 1-2h
1. ✅ Napraw TypeScript error (isActive) - **DONE**
2. ✅ Update contact info - **DONE**
3. ⏳ Dodaj `public/robots.txt` - **5 min**
4. ⏳ Dodaj `public/sitemap.xml` - **5 min**
5. ⏳ Test gallery API (sprawdź czy Render zrobił redeploy)

### **JUTRO (30.12.2025)** ⏰ 2-3h
6. Utwórz tabelę `calculator_config` w bazie
7. Zmień backend aby używał bazy zamiast pamięci
8. Dodaj Open Graph meta tags
9. Dodaj button "Odśwież" w galerii

### **W TYM TYGODNIU (31.12 - 05.01)** ⏰ 4-5h
10. Skonfiguruj Google Analytics 4
11. Dodaj JSON-LD structured data
12. Realtime sync dla kalkulatora (polling)
13. Wrap App w ErrorBoundary
14. Zamień social links na prawdziwe

### **W PRZYSZŁOŚCI**
15. Backend `/api/logs` endpoint
16. WebSocket dla realtime gallery updates
17. Canonical URLs
18. Performance optimization (lazy loading, code splitting)

---

## 🚀 **DEPLOYMENT STATUS**

**Ostatnie commity:**
- Backend: `6c47031` - "fix: remove isActive filter"
- Frontend: `6b80b0d` - "feat: update contact info"

**Czy działa teraz galeria?**
Sprawdź API: `https://eliksir-backend-front-dashboard.onrender.com/api/content/gallery/public?category=wszystkie`

Jeśli **500 error** → Render jeszcze deploying (czeka ~3-5 min)  
Jeśli **200 OK** → Frontend odśwież cache przeglądarki (Ctrl+Shift+R)

---

## 📝 **NOTATKI DEVELOPERSKIE**

### **Architektura**
- **Frontend:** React 19 + Vite 6.4.1 + TypeScript 5.4.5
- **Backend:** Node.js 20 + Express + Drizzle ORM
- **Database:** Neon PostgreSQL (serverless)
- **CDN:** Cloudinary (obrazy galerii)
- **Hosting:** Vercel (front) + Render (backend)

### **Kluczowe Pliki**
```
Frontend:
- src/components/Calculator.tsx (useEffect fetchConfig linia 70)
- src/components/Gallery.tsx (useEffect fetchImages linia 48)
- src/components/HorizontalGallery.tsx (podobny pattern)
- src/lib/error-monitoring.tsx (trackEvent, ErrorBoundary)

Backend:
- server/routes/calculator.ts (currentConfig linia 54 - IN MEMORY!)
- server/routes/content.ts (gallery endpoint linia 77)
- server/db/schema.ts (brak calculator_config table)
```

### **Environment Variables**
```env
Frontend (.env):
VITE_API_URL=https://eliksir-backend-front-dashboard.onrender.com

Backend (.env):
DATABASE_URL=postgresql://...neon.tech
CLOUDINARY_CLOUD_NAME=dxanil4gc
CLOUDINARY_API_KEY=***
CLOUDINARY_API_SECRET=***
JWT_SECRET=***
```

---

**Przygotował:** GitHub Copilot (Claude Sonnet 4.5)  
**Data:** 29 grudnia 2025, 23:47 CET
