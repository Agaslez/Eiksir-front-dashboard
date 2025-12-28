# ELIKSIR - Nowe Funkcje ✨

## Co zostało dodane?

### 1. 📸 Content Editor & Image Gallery
- **Galeria zdjęć** z możliwością:
  - Upload zdjęć (max 5MB)
  - Podgląd na żywo
  - Kopiowanie URL
  - Usuwanie zdjęć
- **Edytor treści** do zarządzania:
  - Sekcjami na stronie głównej
  - Tekstami i opisami
  - Zdjęciami z live preview

### 2. 📊 Dashboard z Live Stats
- **Statystyki na żywo**:
  - Łączne wyświetlenia
  - Unikalni użytkownicy
  - Średni czas na stronie
  - Współczynnik odrzuceń
- **Wykresy**:
  - Najpopularniejsze strony
  - Źródła ruchu
- Auto-odświeżanie co 30 sekund

### 3. ✉️ System Email
- **Konfiguracja SMTP** (Gmail):
  - Ustawienia serwera
  - Test email
  - Instrukcja konfiguracji
- **Formularze kontaktowe**:
  - Wysyłanie wiadomości
  - Auto-odpowiedzi

### 4. 🧮 Edytor Kalkulatora
- **Zarządzanie cenami**:
  - Cena bazowa
  - Mnożniki dla napojów
  - Mnożniki dla wydarzeń
  - Dodatkowe usługi
  - Rabaty grupowe
- **Live preview** kalkulacji

### 5. 🔐 Poprawione Logowanie
- JWT Bearer authentication
- Endpoint /api/auth/me
- Persistent sessions

## 🚀 Jak uruchomić?

### Backend (Port 3001)
```bash
cd stefano-eliksir-backend
npm run dev
```

### Frontend (Port 5174)
```bash
cd eliksir-frontend
npm run dev
```

## 📍 Nowe Endpointy API

### Content Management
- `GET /api/content/images` - Lista zdjęć
- `POST /api/content/images/upload` - Upload zdjęcia
- `DELETE /api/content/images/:filename` - Usuń zdjęcie
- `GET /api/content/sections` - Sekcje treści
- `PUT /api/content/sections/:id` - Aktualizuj sekcję

### Email System
- `POST /api/email/contact` - Wyślij formularz kontaktowy
- `POST /api/email/test` - Test SMTP

### Calculator
- `GET /api/calculator/settings` - Ustawienia cennika
- `PUT /api/calculator/settings` - Zapisz ustawienia
- `POST /api/calculator/calculate` - Oblicz cenę

## 🎨 Nowe Strony w Dashboardzie

1. **Dashboard** (`/admin`) - Live statistics
2. **Treść** (`/admin/content`) - Content editor & gallery
3. **Kalkulator** (`/admin/calculator`) - Pricing settings
4. **Email** (`/admin/email`) - SMTP configuration
5. **Analytics** (`/admin/analytics`) - Detailed stats

## ⚙️ Konfiguracja

### .env (Backend)
```env
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@eliksir.pl
```

### Gmail App Password
1. Przejdź do ustawień konta Google
2. Włącz weryfikację dwuetapową
3. Wygeneruj hasło aplikacji
4. Użyj hasła aplikacji w SMTP_PASS

## 🧪 Testowanie

### PowerShell Test Script
```powershell
./test-backend-api.ps1
```

### Bash Test Script
```bash
./test-backend-api.sh
```

## 📦 Nowe Zależności

### Backend
- `multer` - File uploads
- `@types/multer` - TypeScript types
- `nodemailer` - Email sending
- `@types/nodemailer` - TypeScript types

### Frontend
- Wszystkie komponenty używają istniejących zależności

## 🗂️ Struktura Plików

```
eliksir-frontend/src/
├── components/admin/
│   ├── ImageGallery.tsx       # Galeria zdjęć
│   ├── ContentEditor.tsx      # Edytor treści
│   ├── DashboardHome.tsx      # Dashboard z stats
│   ├── EmailSettings.tsx      # Konfiguracja email
│   └── CalculatorSettings.tsx # Edytor cennika
├── vite-env.d.ts              # TypeScript env types
└── ...

stefano-eliksir-backend/
├── server/routes/
│   ├── content.ts             # Content API
│   ├── email.ts               # Email API
│   └── calculator.ts          # Calculator API
├── uploads/images/            # Folder na zdjęcia
└── ...
```

## 🎯 Następne Kroki

1. ✅ Przetestuj wszystkie nowe funkcje
2. ✅ Skonfiguruj SMTP w .env
3. ✅ Upload testowych zdjęć
4. ✅ Sprawdź live statistics
5. ✅ Edytuj ceny w kalkulatorze

## 🐛 Znane Problemy

- Login issue: Sprawdź czy backend działa na porcie 3001
- CORS: Frontend musi być na http://localhost:5174
- Uploads: Folder uploads/images musi istnieć

## 💡 Tips

- Używaj Chrome DevTools do debugowania API
- Sprawdź Network tab dla błędów 401/403
- Token JWT jest ważny przez 24h
- Statystyki odświeżają się co 30s automatycznie

---

**Created by:** GitHub Copilot with Claude Sonnet 4.5
**Date:** $(date +%Y-%m-%d)
**Version:** 1.0.0
