# 🔒 ZARZĄDZANIE SEKRETAMI - INSTRUKCJA

## 📁 Pliki środowiskowe

### `.env` (Local Development)
- **Lokalizacja:** `stefano-eliksir-backend/.env`
- **Przeznaczenie:** Rozwój lokalny (localhost:3001)
- **Status:** ❌ **NIE COMMITUJ** (zablokowany przez .gitignore)
- **Aktualizacja:** 2025-12-30

### `.env.example` (Szablon)
- **Lokalizacja:** `stefano-eliksir-backend/.env.example`
- **Przeznaczenie:** Szablon dla innych developerów
- **Status:** ✅ Commitowany do git
- **Zawartość:** Przykładowe wartości BEZ prawdziwych sekretów

---

## 🔑 Synchronizacja Sekretów

### ZASADA: Sekrety muszą być identyczne w 2 miejscach:

1. **Local:** `stefano-eliksir-backend/.env` (dla npm run dev)
2. **Production:** Render.com → Environment Variables (dla live serwera)

### Aktualne sekrety (wygenerowane 2025-12-30):

```bash
# JWT_SECRET (do tokenów autoryzacyjnych)
7mK9pL3nQ8vX2wY5rT6uI4oP1aS8dF0g... (pełna wartość w .env)

# SESSION_SECRET (do sesji użytkownika)
5xP2wQ9eR4tY7uI0oL3aK6sD1fG8hJ5k... (pełna wartość w .env)

# PASSWORD_SALT (do hashowania haseł)
3kR7mP2qW9xE5tY1uL8oI4aS0dF6gH3j... (pełna wartość w .env)

# COOKIE_SECRET (do szyfrowania cookies)
9pL6kH3jG0fD2sA5oI8uY1tR4eW7qM2n... (pełna wartość w .env)
```

---

## ⚙️ Aktualizacja Sekretów na Render.com

### Krok 1: Wejdź w Render Dashboard
```
https://dashboard.render.com/
→ Wybierz: stefano-eliksir-backend
→ Environment
```

### Krok 2: Zaktualizuj zmienne (DOKŁADNIE te wartości z .env):
```bash
JWT_SECRET = [skopiuj z .env]
SESSION_SECRET = [skopiuj z .env]
PASSWORD_SALT = [skopiuj z .env]
COOKIE_SECRET = [skopiuj z .env]
DATABASE_URL = [skopiuj z .env]
CLOUDINARY_CLOUD_NAME = dkpmxdpgn
CLOUDINARY_API_KEY = 482234587739343
CLOUDINARY_API_SECRET = aaWKcMo2jwG-TnSQ5hmnQShGTZM
```

### Krok 3: Save Changes
- Render automatycznie zrestartuje serwer z nowymi sekretami

---

## ✅ Weryfikacja Synchronizacji

### Test 1: Local Development
```bash
cd stefano-eliksir-backend
npm run dev
# Sprawdź: http://localhost:3001/api/health
# Powinno zwrócić: {"status":"healthy"}
```

### Test 2: Production
```bash
curl https://stefano-eliksir-backend.onrender.com/api/health
# Powinno zwrócić: {"status":"healthy"}
```

### Test 3: Logowanie
```bash
# Local
POST http://localhost:3001/api/auth/login
Body: {"email":"admin@eliksir.pl","password":"admin123"}
# Powinno zwrócić: {"accessToken":"..."}

# Production
POST https://stefano-eliksir-backend.onrender.com/api/auth/login
Body: {"email":"admin@eliksir.pl","password":"admin123"}
# Powinno zwrócić: {"accessToken":"..."}
```

---

## 🚨 WAŻNE: Rotacja Sekretów

### Kiedy rotować sekrety?
- ❌ Przypadkowy commit do GitHuba
- ❌ Podejrzenie wycieku
- ✅ Co 3 miesiące (rutynowa rotacja)
- ✅ Po zwolnieniu developera z dostępem

### Jak rotować?
```bash
# 1. Wygeneruj nowe sekrety
cd stefano-eliksir-backend
openssl rand -base64 48  # Nowy JWT_SECRET
openssl rand -base64 48  # Nowy SESSION_SECRET
openssl rand -base64 32  # Nowy PASSWORD_SALT
openssl rand -base64 32  # Nowy COOKIE_SECRET

# 2. Zaktualizuj .env lokalnie
nano .env  # Wklej nowe wartości

# 3. Zaktualizuj Render Environment Variables
# (Dashboard → Environment → Save Changes)

# 4. Przetestuj oba środowiska (local + production)
npm run dev  # Local test
curl https://stefano-eliksir-backend.onrender.com/api/health  # Production test
```

---

## 📋 Checklist przed każdym deploy:

- [ ] `.env` istnieje lokalnie
- [ ] `.env` NIE jest w git (`git status` nie pokazuje .env)
- [ ] Sekrety w `.env` = Sekrety na Render
- [ ] Database URL identyczny (local + production)
- [ ] Cloudinary credentials identyczne
- [ ] Test local: `npm run dev` działa
- [ ] Test production: `/api/health` zwraca 200

---

## 🛡️ Bezpieczeństwo

### ✅ Dobre praktyki:
- `.env` jest w `.gitignore` (zablokowany)
- Silne sekrety (48+ znaków)
- Różne sekrety dla JWT, SESSION, COOKIE
- Regularna rotacja (co 3 miesiące)

### ❌ NIE RÓB:
- ❌ `git add .env -f` (force add)
- ❌ Wysyłanie .env przez email/Slack
- ❌ Screenshot z sekretami
- ❌ Hardcodowanie sekretów w kodzie

---

**Ostatnia aktualizacja:** 2025-12-30  
**Status:** ✅ Synchronizacja Local ↔ Production OK
