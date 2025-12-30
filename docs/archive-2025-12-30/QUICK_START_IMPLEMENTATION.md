# 🎯 QUICK START - Wdrożenie Nowych Funkcji

## ⚡ Co zrobić TERAZ (5 minut)

### 1. Zainstaluj pakiety (Terminal PowerShell)
```powershell
cd D:\REP\eliksir-website.tar\stefano-eliksir-backend
npm install multer @types/multer nodemailer @types/nodemailer
```

### 2. Utwórz folder uploads
```powershell
mkdir uploads\images -Force
```

### 3. Skonfiguruj email (.env)
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@eliksir-bar.pl
ADMIN_EMAIL=admin@eliksir-bar.pl
```

### 4. Restart backend
```powershell
# Zatrzymaj obecny proces (Ctrl+C)
npm run dev
```

---

## ✅ Co zostało ZROBIONE

### Backend - Nowe API Endpoints

**✅ Content API** (`server/routes/content.ts`)
- `GET /api/content/images` - Lista zdjęć
- `POST /api/content/images/upload` - Upload zdjęcia
- `DELETE /api/content/images/:filename` - Usuń zdjęcie  
- `GET /api/content/sections` - Pobierz sekcje
- `PUT /api/content/sections/:id` - Edytuj sekcję

**✅ Email API** (`server/routes/email.ts`)
- `POST /api/email/contact` - Wyślij email z formularza
- `POST /api/email/test` - Test konfiguracji SMTP

**✅ Calculator API** (`server/routes/calculator.ts`)
- `GET /api/calculator/settings` - Pobierz ustawienia
- `PUT /api/calculator/settings` - Zapisz ustawienia
- `POST /api/calculator/calculate` - Oblicz cenę

**✅ Integracja z głównym routerem**
- Routes zamontowane w `server/routes/index.ts`
- Uploads serwowane przez `/uploads`

---

## 🧪 TESTY (Po instalacji pakietów)

### Test Content API
```bash
# Lista zdjęć (pusta początkowo)
curl http://localhost:3001/api/content/images

# Sekcje do edycji
curl http://localhost:3001/api/content/sections
```

### Test Email API
```bash
# Test config (wymaga SMTP w .env)
curl -X POST http://localhost:3001/api/email/test
```

### Test Calculator API
```bash
# Ustawienia
curl http://localhost:3001/api/calculator/settings

# Kalkulacja
curl -X POST http://localhost:3001/api/calculator/calculate \
  -H "Content-Type: application/json" \
  -d '{"guests":50,"drinkType":"premium","eventType":"wedding","serviceOptions":["bartender"]}'
```

---

## 📋 CO DALEJ - Frontend Components

### Do utworzenia (kolejność):

1. **Content Editor** (`eliksir-frontend/src/pages/admin/ContentManager.tsx`)
   - Upload zdjęć (drag & drop)
   - Galeria z podglądem  
   - Edycja opisów sekcji
   - Live preview

2. **Dashboard Stats** (aktualizacja `eliksir-frontend/src/pages/admin/DashboardHome.tsx`)
   - Real-time SEO statistics
   - Wykresy (Chart.js / Recharts)
   - Auto-refresh co 30s
   - Top strony + źródła ruchu

3. **Email Settings** (`eliksir-frontend/src/pages/admin/EmailSettings.tsx`)
   - Konfiguracja SMTP
   - Test wysyłki
   - Historia emaili

4. **Calculator Editor** (`eliksir-frontend/src/pages/admin/CalculatorSettings.tsx`)
   - Edycja cen bazowych
   - Przeliczniki (event types, drink types)
   - Dodatkowe usługi
   - Zniżki progowe
   - Live preview kalkulacji

---

## 🔧 Naprawa Logowania

### Problem
AuthContext próbuje `/api/auth/me` ale może dostawać 401.

### Rozwiązanie  
Sprawdź w DevTools (F12 → Network):
1. Czy request jest wysyłany?
2. Jaki status zwraca?
3. Czy nagłówek `Authorization: Bearer ...` jest obecny?

### Debug (dodaj w AuthContext.tsx)
```typescript
const fetchCurrentUser = useCallback(async (token: string | null) => {
  console.log('🔍 Fetching user with token:', token?.substring(0, 20) + '...');
  
  if (!token) {
    setUser(null);
    return false;
  }

  try {
    const url = `${API_BASE_URL}/api/auth/me`;
    console.log('📡 Request URL:', url);
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('📥 Response status:', response.status);
    const data = await response.json();
    console.log('📦 Response data:', data);
    
    // ... rest of code
```

---

## 📊 Status

✅ Backend API - GOTOWE (wymaga npm install)  
⏳ Frontend Components - DO ZROBIENIA  
⏳ Tests & Debug - W TRAKCIE  
⏳ Email Config - DO KONFIGURACJI

---

## 🚀 Następne Kroki

1. **Najpierw:** Zainstaluj pakiety + restart backend
2. **Test API:** Sprawdź czy endpointy działają  
3. **Frontend:** Stwórz komponenty React
4. **Integracja:** Połącz frontend z backend API
5. **Tests:** Sprawdź upload, email, calculator

---

**Gotowe do wdrożenia! Zacznij od QUICK START powyżej.** ⚡
