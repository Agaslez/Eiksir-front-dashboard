# 📧 Moduł Email - Dokumentacja

## ✨ Funkcje

### Faza 1: Podstawy + Nagłówki IMAP ✅ GOTOWE

**Konfiguracja SMTP w Bazie Danych:**
- Zapisywanie ustawień serwera email w bazie (nie tylko w .env)
- Edytowalne z poziomu dashboardu
- Preset dla popularnych dostawców (home.pl, Gmail, Onet)
- Maskowanie hasła w interfejsie

**Logowanie Wysłanych:**
- Historia wszystkich wysłanych emaili
- Status (sent/failed)
- Data, odbiorca, temat
- Metadata (typ wydarzenia, liczba gości)

**Skrzynka Odbiorcza (IMAP):**
- Synchronizacja nagłówków wiadomości
- Lazy loading treści (oszczędność pamięci)
- Oznaczanie jako przeczytane
- Preview pierwszych 200 znaków

## 🗄️ Struktura Bazy Danych

### `email_settings` (Konfiguracja SMTP)
```sql
CREATE TABLE email_settings (
  id SERIAL PRIMARY KEY,
  smtp_host VARCHAR(255) NOT NULL,          -- 'poczta2559727.home.pl'
  smtp_port INTEGER NOT NULL DEFAULT 587,
  smtp_user VARCHAR(255) NOT NULL,          -- 'kontakt@eliksir-bar.pl'
  smtp_password TEXT NOT NULL,
  smtp_secure BOOLEAN DEFAULT false,
  from_email VARCHAR(255) NOT NULL,
  from_name VARCHAR(255) DEFAULT 'ELIKSIR Bar',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Pamięć:** ~250 bajtów (1 wiersz)

### `email_logs` (Historia Wysłanych)
```sql
CREATE TABLE email_logs (
  id SERIAL PRIMARY KEY,
  recipient VARCHAR(255) NOT NULL,
  subject VARCHAR(500),
  status VARCHAR(50) NOT NULL,               -- 'sent', 'failed', 'pending'
  error_message TEXT,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB                              -- {eventType, guestCount}
);

CREATE INDEX idx_email_logs_status ON email_logs(status);
CREATE INDEX idx_email_logs_sent_at ON email_logs(sent_at DESC);
CREATE INDEX idx_email_logs_recipient ON email_logs(recipient);
```

**Pamięć:** ~200 bajtów/email × 1000 = 0.2 MB

### `inbox_messages` (Odebrane Wiadomości)
```sql
CREATE TABLE inbox_messages (
  id SERIAL PRIMARY KEY,
  message_uid VARCHAR(255) UNIQUE NOT NULL,  -- IMAP UID
  from_email VARCHAR(255) NOT NULL,
  from_name VARCHAR(255),
  subject VARCHAR(500),
  preview TEXT,                               -- Pierwsze 200 znaków
  received_at TIMESTAMPTZ NOT NULL,
  is_read BOOLEAN DEFAULT false,
  is_starred BOOLEAN DEFAULT false,
  has_attachments BOOLEAN DEFAULT false,
  full_body TEXT,                             -- NULL (lazy loading)
  metadata JSONB,
  synced_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_inbox_message_uid ON inbox_messages(message_uid);
CREATE INDEX idx_inbox_received_at ON inbox_messages(received_at DESC);
CREATE INDEX idx_inbox_is_read ON inbox_messages(is_read);
```

**Pamięć:** ~300 bajtów/email × 1000 = 0.3 MB  
**RAZEM:** ~0.5 MB na 1000 emaili ✅

## 📡 API Endpoints

### 1. Konfiguracja SMTP

**GET /api/email/settings**
```typescript
// Wymagana autoryzacja: Bearer token
// Zwraca: { success: true, settings: {...} }
```

**PUT /api/email/settings**
```typescript
// Body:
{
  smtpHost: "poczta2559727.home.pl",
  smtpPort: 587,
  smtpUser: "kontakt@eliksir-bar.pl",
  smtpPassword: "password",  // lub '••••••••' jeśli nie zmieniono
  fromEmail: "kontakt@eliksir-bar.pl",
  fromName: "ELIKSIR Bar"
}
// Zwraca: { success: true, message: "Email settings updated" }
```

### 2. Wysyłanie Email

**POST /api/email/contact** (istniejący)
```typescript
// Wysyła email z formularza kontaktowego
// Automatycznie loguje do email_logs
```

**POST /api/email/test**
```typescript
// Test konfiguracji SMTP
// Wysyła email testowy
// Zwraca: { success: true/false, error?: string }
```

### 3. Historia Wysłanych

**GET /api/email/logs**
```typescript
// Query params: ?limit=50&offset=0
// Zwraca: { success: true, logs: [...], count: 20 }
```

### 4. Skrzynka Odbiorcza

**GET /api/email/inbox**
```typescript
// Query params: ?limit=50&offset=0&unreadOnly=true
// Zwraca: { success: true, messages: [...], count: 15 }
```

**POST /api/email/inbox/sync**
```typescript
// Synchronizuje ostatnie 50 wiadomości z IMAP
// Zwraca: { success: true, newMessages: 5 }
```

**PATCH /api/email/inbox/:id/read**
```typescript
// Oznacza wiadomość jako przeczytaną
// Zwraca: { success: true }
```

## 🎨 Frontend - EmailSettings.tsx

### Sekcje:

1. **Preset Dropdown**
   - home.pl → poczta2559727.home.pl:587
   - Gmail → smtp.gmail.com:587
   - Onet → smtp.poczta.onet.pl:587

2. **Formularz Konfiguracji**
   - Host, Port, User, Password
   - Email nadawcy, Nazwa nadawcy
   - Przyciski: Test, Zapisz

3. **Historia Wysłanych**
   - Tabela: Data | Odbiorca | Temat | Status
   - ✅/❌ ikony statusu
   - Przycisk odświeżania

4. **Skrzynka Odbiorcza**
   - Lista wiadomości (pogrubione nieprzeczytane)
   - Od (nazwa + email), Temat, Preview
   - Data synchronizacji
   - Przycisk: Synchronizuj

## 📦 Pakiety

**Backend:**
```bash
npm install imap mailparser
npm install --save-dev @types/imap @types/mailparser
```

**Drizzle Schema:**
```typescript
import { emailSettings, emailLogs, inboxMessages } from '../db/schema';
```

## 🚀 Wdrożenie

### 1. Uruchom Migrację
```bash
cd stefano-eliksir-backend
npx tsx scripts/run-email-migration.ts
# ✅ Email system migration completed!
```

### 2. Konfiguracja home.pl w Dashboardzie

1. Zaloguj się: `/admin/login`
2. Przejdź do: **Ustawienia Email**
3. Wybierz preset: **home.pl**
4. Wpisz dane:
   - Email: `kontakt@eliksir-bar.pl`
   - Hasło: (hasło do konta email)
5. Kliknij: **Wyślij Test**
6. Jeśli ✅ → Kliknij: **Zapisz Ustawienia**

### 3. Synchronizacja Inbox
1. W sekcji "Odebrane Wiadomości"
2. Kliknij: **Synchronizuj**
3. Poczekaj 2-5s (IMAP pobiera 50 ostatnich)
4. Wiadomości pojawią się na liście

## 🔐 Bezpieczeństwo

- Hasła szyfrowane w bazie ✅
- Autoryzacja JWT dla wszystkich endpointów ✅
- Maskowanie hasła w UI (••••••••) ✅
- IMAP TLS/SSL ✅

## 📊 Monitoring

**Przykładowe zapytania:**

```sql
-- Ile emaili wysłano dzisiaj?
SELECT COUNT(*) FROM email_logs 
WHERE sent_at >= CURRENT_DATE AND status = 'sent';

-- Nieprzeczytane wiadomości
SELECT COUNT(*) FROM inbox_messages WHERE is_read = false;

-- Ostatnie błędy
SELECT * FROM email_logs 
WHERE status = 'failed' 
ORDER BY sent_at DESC 
LIMIT 10;
```

## 🎯 Zużycie Pamięci

| Typ | Ilość | Rozmiar jednostkowy | RAZEM |
|-----|-------|---------------------|-------|
| Konfiguracja | 1 | 250 B | 0.25 KB |
| Logi (wysłane) | 1000 | 200 B | 195 KB |
| Inbox (nagłówki) | 1000 | 300 B | 293 KB |
| **SUMA** | **2001** | - | **~0.5 MB** ✅ |

**Porównanie:** 5 zdjęć w galerii = ~2-3 MB (więcej niż 6000 emaili)

## ❌ Co NIE jest implementowane (Faza 2-5)

- Auto-odpowiedzi i szablony
- System ticketów (CRM)
- Kategoryzacja AI
- Analytics i wykresy
- Pełna treść emaili w liście (lazy loading)
- Wysyłanie załączników
- Wyszukiwanie w skrzynce

## ✅ Testy Lokalne

```bash
# Backend
cd stefano-eliksir-backend
PORT=3002 npm run dev

# Frontend
cd eliksir-frontend
npm run dev

# Otwórz: http://localhost:5175/admin/email
```

## 🐛 Troubleshooting

**Problem:** "IMAP connection failed"  
**Rozwiązanie:** Sprawdź czy serwer to `imap.home.pl` (nie `smtp.home.pl`)

**Problem:** Hasło nie zapisuje się  
**Rozwiązanie:** Wpisz pełne hasło (nie `••••••••`)

**Problem:** Brak wiadomości po synchronizacji  
**Rozwiązanie:** Sprawdź czy port IMAP to 993 (SSL) lub 143 (STARTTLS)

## 📞 Konfiguracja home.pl

**SMTP (wysyłanie):**
- Host: `poczta2559727.home.pl`
- Port: `587` (STARTTLS)
- User: `kontakt@eliksir-bar.pl`
- Password: (hasło z home.pl)

**IMAP (odbieranie):**
- Host: `poczta2559727.home.pl` (zamienione przez backend z smtp → imap)
- Port: `993` (SSL)
- User: `kontakt@eliksir-bar.pl`
- Password: (to samo hasło)

## 🎉 Gotowe!

Moduł email **Phase 1 + IMAP Headers** jest w pełni funkcjonalny:
- ✅ Konfiguracja w dashboardzie (presets)
- ✅ Historia wysłanych (logi z statusem)
- ✅ Skrzynka odbiorcza (nagłówki IMAP)
- ✅ Test połączenia SMTP
- ✅ Minimal memory footprint (~0.5MB/1000 emails)
- ✅ Backend commit: `35cea7e`
- ✅ Frontend commit: `69279bc`

**Następne kroki (jeśli potrzebne):**
- Faza 2: Auto-odpowiedzi + szablony
- Faza 3: System ticketów (CRM)
- Faza 4: AI categorization + analytics
