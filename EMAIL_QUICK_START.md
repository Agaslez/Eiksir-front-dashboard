# 🚀 Email Module - Szybki Start

## ✅ Co zostało zaimplementowane?

**Faza 1 + IMAP Headers:**
- Konfiguracja SMTP w bazie danych (edytowalna z dashboardu)
- Logi wysłanych emaili z statusem
- Odbiór nagłówków IMAP (skrzynka odbiorcza)
- Preset dla home.pl, Gmail, Onet
- Minimal memory (~0.5MB/1000 emails)

## 📋 Kroki Instalacji

### 1. Backend Deployed ✅
```
Commit: 35cea7e
- Migration 0013 (3 tabele)
- Email routes (6 endpointów)
- IMAP packages (imap, mailparser)
```

### 2. Frontend Deployed ✅
```
Commit: 69279bc
- EmailSettings.tsx (pełna funkcjonalność)
- Preset dropdown
- Historia wysłanych
- Skrzynka odbiorcza
```

### 3. Migracja uruchomiona ✅
```bash
npx tsx scripts/run-email-migration.ts
# ✅ Email system migration completed!
# Created: email_settings, email_logs, inbox_messages
```

## 🎯 Jak Używać?

### Krok 1: Zaloguj się do Dashboardu
```
URL: https://eliksir-dashboard.vercel.app/admin/login
Lub: http://localhost:5175/admin/login
```

### Krok 2: Przejdź do Email Settings
```
Menu: Ustawienia Email
```

### Krok 3: Wybierz Preset home.pl
```
Dropdown: "home.pl (poczta2559727.home.pl)"
```

### Krok 4: Wpisz Dane
```
Email SMTP: kontakt@eliksir-bar.pl
Hasło: [twoje hasło z home.pl]
Email Nadawcy: kontakt@eliksir-bar.pl
Nazwa: ELIKSIR Bar
```

### Krok 5: Test Połączenia
```
Kliknij: "Wyślij Test"
Sprawdź: Czy email przyszedł na kontakt@eliksir-bar.pl
```

### Krok 6: Zapisz Konfigurację
```
Kliknij: "Zapisz Ustawienia"
Alert: "✅ Ustawienia zapisane pomyślnie!"
```

### Krok 7: Synchronizuj Inbox
```
Sekcja: "Odebrane Wiadomości"
Kliknij: "Synchronizuj"
Poczekaj: 2-5 sekund (IMAP pobiera 50 ostatnich)
```

## 📊 Co Zobaczysz?

### Historia Wysłanych:
| Data | Odbiorca | Temat | Status |
|------|----------|-------|--------|
| 2026-01-11 12:34 | kontakt@eliksir-bar.pl | Test Email | ✅ |

### Skrzynka Odbiorcza:
```
📧 Jan Kowalski (jan@example.com)
   Pytanie o wesele
   Witam, chciałbym zapytać o dostępność...
   2026-01-10 15:23
```

## 🔥 Funkcje

✅ Preset dropdown (home.pl, Gmail, Onet)  
✅ Zapisz/Wczytaj z bazy danych  
✅ Test połączenia SMTP  
✅ Historia wysłanych (logi)  
✅ Skrzynka odbiorcza (IMAP headers)  
✅ Synchronizacja na żądanie  
✅ Oznacz jako przeczytane  
✅ Lazy loading treści (oszczędność pamięci)  

## 📦 Struktura Bazy

```
email_settings      → 1 wiersz (250 B)
email_logs          → ~200 B/email
inbox_messages      → ~300 B/email (nagłówki tylko)

RAZEM: ~0.5 MB na 1000 emaili ✅
```

## 🎨 UI Flow

```
Dashboard → Email Settings
  ↓
[Dropdown] Wybierz preset: home.pl
  ↓
[Form] Wpisz: email + hasło
  ↓
[Button] Test → ✅ Działa!
  ↓
[Button] Zapisz → Konfiguracja w DB
  ↓
[Section] Historia Wysłanych (tabela)
  ↓
[Section] Inbox → Synchronizuj
  ↓
[List] Wiadomości (pogrubione nieprzeczytane)
```

## 🛠️ Troubleshooting

**"Email testowy nie przyszedł"**
- Sprawdź spam/junk
- Sprawdź hasło (czy poprawne?)
- Sprawdź port: 587 dla SMTP

**"Synchronizacja nie działa"**
- Backend zamienia smtp → imap automatycznie
- Port IMAP: 993 (SSL)
- Sprawdź czy konto ma włączony IMAP w home.pl

**"Hasło się nie zapisuje"**
- Wpisz pełne hasło (nie zostawiaj `••••••••`)
- Zapisz ponownie

## ✅ Status Wdrożenia

| Komponent | Status | Commit |
|-----------|--------|--------|
| Migracja 0013 | ✅ Uruchomiona | - |
| Backend Routes | ✅ Deployed | 35cea7e |
| Frontend UI | ✅ Deployed | 69279bc |
| IMAP Packages | ✅ Zainstalowane | imap, mailparser |
| Test Lokalny | ✅ Działa | localhost:5175 |

## 🚀 Gotowe!

Email module **Phase 1 + IMAP Headers** jest w pełni funkcjonalny i gotowy do użycia w produkcji!

**Konfiguracja home.pl:**
- Server: `poczta2559727.home.pl`
- Email: `kontakt@eliksir-bar.pl`
- Port: `587` (SMTP), `993` (IMAP)

**Dashboard:**
- Preset dropdown ✅
- Historia wysłanych ✅
- Skrzynka odbiorcza ✅
- Test + Zapisz ✅

**Memory:**
- ~0.5MB per 1000 emails ✅
- Lazy loading full body ✅

---

📧 **Wszystko działa!** Możesz teraz zarządzać emailami przez dashboard bez edycji kodu.
