# 🚀 ELIKSIR - Implementacja Nowych Funkcji

## Data: 27.12.2025
## Status: W TRAKCIE - Wymaga dokończenia

---

## ✅ Co zostało stworzone

### 1. Backend API Routes

Utworzono 3 nowe pliki w `stefano-eliksir-backend/server/routes/`:

#### `content.ts` - Zarządzanie treścią
- ✅ GET `/api/content/images` - Lista wszystkich zdjęć
- ✅ POST `/api/content/images/upload` - Upload nowego zdjęcia
- ✅ DELETE `/api/content/images/:filename` - Usunięcie zdjęcia
- ✅ GET `/api/content/sections` - Pobierz sekcje do edycji
- ✅ PUT `/api/content/sections/:id` - Aktualizuj sekcję

#### `email.ts` - System email
- ✅ POST `/api/email/contact` - Wyślij formularz kontaktowy
- ✅ POST `/api/email/test` - Test konfiguracji email

#### `calculator.ts` - Kalkulator cen
- ✅ GET `/api/calculator/settings` - Pobierz ustawienia kalkulatora
- ✅ PUT `/api/calculator/settings` - Aktualizuj ceny/przeliczniki
- ✅ POST `/api/calculator/calculate` - Oblicz cenę

---

## 🔧 Co trzeba jeszcze zrobić

### KROK 1: Integracja nowych routes z głównym routerem

**Plik:** `stefano-eliksir-backend/server/routes/index.ts`

Dodaj na początku (po istniejących importach):
```typescript
import contentRouter from './content';
import emailRouter from './email';
import calculatorRouter from './calculator';
```

Dodaj na końcu (przed `export default api`):
```typescript
// Mount new routers
api.use('/content', contentRouter);
api.use('/email', emailRouter);
api.use('/calculator', calculatorRouter);
```

### KROK 2: Instalacja wymaganych zależności

```bash
cd stefano-eliksir-backend
npm install multer @types/multer nodemailer @types/nodemailer
```

### KROK 3: Konfiguracja zmiennych środowiskowych

**Plik:** `stefano-eliksir-backend/.env`

Dodaj:
```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@eliksir-bar.pl
ADMIN_EMAIL=admin@eliksir-bar.pl
```

### KROK 4: Utworzenie folderu uploads

```bash
mkdir -p stefano-eliksir-backend/uploads/images
```

### KROK 5: Konfiguracja serwowania plików statycznych

**Plik:** `stefano-eliksir-backend/server/index.ts`

Dodaj po `app.use('/api', routes)`:
```typescript
// Serve uploaded files
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
```

---

## 📋 Frontend Components - DO STWORZENIA

### 1. Content Editor Component

**Plik:** `eliksir-frontend/src/pages/admin/ContentEditor.tsx`

Funkcje:
- [ ] Lista sekcji (Hero, About, Services, etc.)
- [ ] Edytor tekstu dla każdej sekcji
- [ ] Upload manager dla zdjęć
- [ ] Live preview zmian
- [ ] Drag & drop dla zdjęć
- [ ] Image gallery z podglądem

### 2. Email Settings Component

**Plik:** `eliksir-frontend/src/pages/admin/EmailSettings.tsx`

Funkcje:
- [ ] Konfiguracja SMTP
- [ ] Test wysyłki
- [ ] Historia wysłanych emaili
- [ ] Szablony emaili

### 3. Calculator Settings Component

**Plik:** `eliksir-frontend/src/pages/admin/CalculatorSettings.tsx`

Funkcje:
- [ ] Edycja cen bazowych
- [ ] Edycja przeliczników (drink types, event types)
- [ ] Edycja opcji dodatkowych (barman, dekoracje, etc.)
- [ ] Edycja progów zniżek
- [ ] Live preview kalkulacji

### 4. Dashboard Live Stats

**Plik:** `eliksir-frontend/src/pages/admin/DashboardHome.tsx`

Funkcje:
- [ ] Real-time SEO statistics
- [ ] Wykresy wizytatorów (Chart.js lub Recharts)
- [ ] Top strony
- [ ] Źródła ruchu
- [ ] Auto-refresh co 30s

---

## 🔐 Naprawa logowania - DO ZROBIENIA

### Problem: Endpoint `/api/auth/me` nie działa prawidłowo

**Rozwiązanie:**

1. **Sprawdź middleware authenticateToken**
   - Czy poprawnie weryfikuje JWT?
   - Czy ustawia `req.user`?

2. **Test manual:**
   ```bash
   # 1. Zaloguj się
   TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@eliksir-bar.pl","password":"Admin123!"}' \
     | jq -r '.accessToken')
   
   # 2. Test /me
   curl -s http://localhost:3001/api/auth/me \
     -H "Authorization: Bearer $TOKEN" | jq
   ```

3. **Frontend AuthContext**
   - Sprawdź czy token jest zapisywany w localStorage
   - Sprawdź czy nagłówek Authorization jest dodawany
   - Dodaj console.log do debugowania

---

## 📊 Priorytety

### PILNE (Zrób teraz):
1. ✅ Integracja nowych routes (KROK 1)
2. ✅ Instalacja dependencies (KROK 2)
3. ✅ Konfiguracja .env (KROK 3)
4. 🔧 Naprawa logowania
5. 🔧 Test wszystkich endpoints

### WAŻNE (Następne):
6. Content Editor component
7. Dashboard Live Stats
8. Email system frontend

### MOŻE POCZEKAĆ:
9. Calculator settings UI
10. Advanced image editing
11. Email templates editor

---

## 🧪 Testy

### Backend Endpoints

```bash
# Content API
curl http://localhost:3001/api/content/images
curl http://localhost:3001/api/content/sections

# Email API (wymaga config)
curl -X POST http://localhost:3001/api/email/test

# Calculator API
curl http://localhost:3001/api/calculator/settings
curl -X POST http://localhost:3001/api/calculator/calculate \
  -H "Content-Type: application/json" \
  -d '{"guests":50,"drinkType":"premium","eventType":"wedding"}'
```

---

## 📝 Notatki

- **Multer** - obsługuje multipart/form-data dla uploadu plików
- **Nodemailer** - wysyłka emaili przez SMTP
- **Wymaga Gmail App Password** - nie zwykłe hasło!
- **Uploads folder** - dodaj do .gitignore

---

## ⚠️ Znane problemy

1. **Backend przestaje działać** - timeout w Git Bash
   - Rozwiązanie: Użyj PowerShell lub uruchom w tle

2. **curl nie działa w Git Bash** 
   - Rozwiązanie: Użyj PowerShell lub test-login.html

3. **CORS errors**
   - Sprawdź czy frontend URL jest w corsOptions

---

**Następny krok:** Dokończ integrację (KROKI 1-5) i przetestuj wszystkie endpointy.
