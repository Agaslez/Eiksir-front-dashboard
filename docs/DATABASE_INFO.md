# 🗄️ BAZA DANYCH - INFORMACJE KRYTYCZNE

**Data:** 30 grudnia 2025  
**Status:** ✅ Production database (Neon PostgreSQL)

---

## ⚠️ WAŻNE - JEDNA BAZA DANYCH

**Projekt ELIKSIR używa JEDNEJ bazy danych:**

```
Provider: Neon (Serverless PostgreSQL)
Database: neondb
Region: eu-central-1 (AWS Frankfurt)
Connection: Pooler (connection pooling enabled)
```

**Connection String (znajdziesz w `.env`):**
```bash
DATABASE_URL=postgresql://neondb_owner:npg_fY1SjkCQHs9A@ep-lively-salad-agdpryyk-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

**❌ NIE MA:**
- Lokalnej bazy danych
- Development/staging database
- Test database

**✅ JEST:**
- Tylko jedna baza: **Neon Production**

---

## 📍 GDZIE JEST UŻYWANA

### Backend (stefano-eliksir-backend)
```bash
Lokalizacja: d:\REP\eliksir-website.tar\stefano-eliksir-backend\
Config: .env (DATABASE_URL)
Schema: shared/schema.ts
Connection: server/db.ts (drizzle ORM)
Migrations: drizzle/ (SQL migrations)
```

### Drizzle Config
```typescript
// stefano-eliksir-backend/drizzle.config.ts
export default {
  schema: './shared/schema.ts',  // ⚠️ Używa shared/schema.ts nie server/db/schema.ts!
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
};
```

---

## 📊 TABELE W BAZIE (Production)

### Eliksir-specific tables (3):
1. **gallery_images** ✅ (galeria zdjęć Cloudinary)
2. **calculator_config** ⏳ (config kalkulatora - do dodania)
3. **content_sections** ⏳ (treści strony - do dodania)

### SaaS platform tables (22):
- api_keys
- contacts
- customers
- email_campaigns
- email_tracking
- gastro_configs
- gdpr_consents
- gdpr_requests
- kitchen_capacity
- kitchen_status
- loyalty_members
- newsletter_subscribers
- orders
- page_views
- playing_with_neon
- points_transactions
- reservations
- reward_redemptions
- rewards
- sessions
- tenants
- time_slots
- users

---

## 🔍 JAK SPRAWDZIĆ POŁĄCZENIE

### 1. Sprawdź tabele w bazie:
```bash
cd stefano-eliksir-backend
node -e "
const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query('SELECT tablename FROM pg_tables WHERE schemaname = \'public\'')
  .then(res => { 
    console.log('Tabele:', res.rows.map(r => r.tablename).join(', ')); 
    pool.end(); 
  })
  .catch(err => { 
    console.error('Error:', err.message); 
    process.exit(1); 
  });
"
```

### 2. Test connection:
```bash
cd stefano-eliksir-backend
npm run db:push  # Synchronizuje schema z bazą
```

### 3. Sprawdź kolumny tabeli:
```bash
node -e "
const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query(\`
  SELECT column_name, data_type 
  FROM information_schema.columns 
  WHERE table_name = 'gallery_images'
\`)
  .then(res => { 
    console.log('Kolumny gallery_images:', res.rows); 
    pool.end(); 
  });
"
```

---

## 🚫 TYPOWE BŁĘDY DO UNIKANIA

### ❌ Błąd 1: Myląsz schema files
```typescript
// ❌ ŹLE - server/db/schema.ts (stary, nieużywany)
import { users, sessions } from '../server/db/schema';

// ✅ DOBRZE - shared/schema.ts (używany przez db.ts)
import { users, sessions } from '../shared/schema';
```

### ❌ Błąd 2: Lokalna baza nie istnieje
```bash
# ❌ NIE próbuj łączyć się lokalnie:
DATABASE_URL=postgresql://localhost:5432/eliksir

# ✅ ZAWSZE używaj Neon:
DATABASE_URL=postgresql://...neon.tech/neondb
```

### ❌ Błąd 3: Migracje do złego schema
```bash
# ❌ Jeśli drizzle.config.ts wskazuje na zły plik:
schema: './server/db/schema.ts'  # Stary plik!

# ✅ Powinno być:
schema: './shared/schema.ts'  # Aktualny schema
```

---

## 📝 DODAWANIE NOWEJ TABELI

### Krok 1: Dodaj do shared/schema.ts
```typescript
// shared/schema.ts
export const myNewTable = pgTable('my_new_table', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

### Krok 2: Wygeneruj migrację
```bash
cd stefano-eliksir-backend
npx drizzle-kit generate
```

### Krok 3: Push do bazy Neon
```bash
npx drizzle-kit push
```

### Krok 4: Verify w Neon Console
- Otwórz: https://console.neon.tech/
- Project: dark-art-66792900
- Branch: production
- SQL Editor: `SELECT * FROM my_new_table LIMIT 1;`

---

## 🔐 SECURITY

**⚠️ NIGDY nie commituj:**
- `.env` files (w `.gitignore`)
- Connection strings z hasłem
- Database credentials

**✅ Zamiast tego:**
- Używaj environment variables
- Render.com przechowuje DATABASE_URL w env vars
- Vercel (frontend) nie ma dostępu do bazy (przez API)

---

## 🌐 DOSTĘP DO NEON CONSOLE

**URL:** https://console.neon.tech/app/projects/dark-art-66792900

**Login:** (użyj GitHub OAuth)

**Project ID:** dark-art-66792900
**Branch:** br-round-morning-agbecqzw (production)

**Możliwości:**
- SQL Editor (wykonuj queries)
- Tables view (przeglądaj dane)
- Monitoring (connection stats)
- Branching (create dev branches)

---

## 📊 STATYSTYKI BAZY (30.12.2025)

```
Tabele: 25 total
- Eliksir: 1 (gallery_images) + 2 pending
- SaaS platform: 22

Rozmiar: ~50 MB
Connection pooling: Enabled (max 100 connections)
Region: eu-central-1 (Frankfurt)
PostgreSQL version: 16.1
```

---

## 🔄 BACKUP & RESTORE

**Backup automatyczny (Neon):**
- Point-in-time recovery: 7 dni retention
- Daily snapshots: Tak
- Manual backups: Przez Neon Console

**Manual export:**
```bash
# Export całej bazy:
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Restore:
psql $DATABASE_URL < backup_20251230.sql
```

---

## 📞 KONTAKT W RAZIE PROBLEMÓW

**Problem:** Baza nie odpowiada
**Check:** https://neon.tech/status

**Problem:** Tabela nie istnieje
**Fix:** `cd stefano-eliksir-backend && npx drizzle-kit push`

**Problem:** Connection timeout
**Fix:** Sprawdź czy DATABASE_URL w `.env` jest aktualny

---

**Dokument przygotował:** GitHub Copilot (Claude Sonnet 4.5)  
**Data:** 30 grudnia 2025  
**Wersja:** 1.0

**⚠️ Ten plik powinien być w repo (bez credentials) aby każdy developer wiedział z jakiej bazy korzystamy!**
