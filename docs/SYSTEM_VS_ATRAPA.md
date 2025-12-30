# 🔥 SYSTEM vs ATRAPA - Audyt Persistencji Danych

**Data:** 29 grudnia 2025  
**Priorytet:** P0 (KRYTYCZNY)

## Pytanie kluczowe: "Czy to SYSTEM czy ATRAPA?"

**Definicja SYSTEMU:** Po restarcie backendu (Render → restart/redeploy) wszystkie dane zostają w DB.  
**Definicja ATRAPY:** Po restarcie dane giną, bo siedzą w pamięci RAM lub w kodzie.

---

## ✅ STATUS: TO JEST SYSTEM

### 1. Content Sections (hero, about, services, contact)

**PRZED:** ❌ ATRAPA
- Content zwracany z hardcoded defaults w `content.ts`
- Endpointy GET/PUT były ale nie zapisywały do DB
- Po restarcie zmiany ginęły

**TERAZ:** ✅ SYSTEM
```sql
-- Tabela w PostgreSQL
CREATE TABLE content_sections (
  id TEXT PRIMARY KEY,              -- 'hero', 'about', 'services', 'contact'
  content JSONB NOT NULL,           -- Elastyczna struktura JSON
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Endpointy:**
- `GET /api/content/sections` → Pobiera z DB
- `PUT /api/content/sections/:id` → Zapisuje do DB z `updatedAt`

**Test brutalny:**
```bash
# 1. Zmień content przez API
curl -X PUT http://localhost:3001/api/content/sections/about \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"content": {"title": "UPDATED", "description": "Test persistence"}}'

# 2. Zrestartuj backend (Render → Restart)

# 3. Sprawdź czy zmiana została
curl http://localhost:3001/api/content/sections
# ✅ Jeśli zmiana jest = SYSTEM
# ❌ Jeśli zniknęła = ATRAPA
```

**Plik:** `stefano-eliksir-backend/migrations/002_content_sections.sql`

---

### 2. Calculator Config (ceny, dodatki, lista zakupów)

**STATUS:** ✅ SYSTEM (już był)

```sql
CREATE TABLE calculator_config (
  id SERIAL PRIMARY KEY,
  promo_discount REAL DEFAULT 0.2,
  price_per_extra_guest JSONB,    -- {basic: 40, premium: 50, ...}
  addons JSONB,                    -- {fountain: {...}, keg: {...}}
  shopping_list JSONB,             -- {vodkaRumGinBottles: 5, ...}
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Endpointy:**
- `GET /api/calculator/config` → DB (tabela `calculatorConfig`)
- `PUT /api/calculator/config` → DB z `updatedAt`

**Test brutalny:**
```typescript
// src/__tests__/brutal/persistence.test.tsx
it('Should persist calculator config after restart', async () => {
  // 1. Update promoDiscount to 0.25
  await fetch('/api/calculator/config', {
    method: 'PUT',
    body: JSON.stringify({ promoDiscount: 0.25, ... })
  });
  
  // 2. Simulate restart (clear cache)
  
  // 3. Fetch again
  const response = await fetch('/api/calculator/config');
  const data = await response.json();
  
  expect(data.config.promoDiscount).toBe(0.25); // ✅ PERSISTS
});
```

---

### 3. Gallery Images (zdjęcia galerii)

**STATUS:** ✅ SYSTEM (już był)

```sql
CREATE TABLE gallery_images (
  id SERIAL PRIMARY KEY,
  filename TEXT UNIQUE,
  url TEXT NOT NULL,               -- Cloudinary URL
  public_id TEXT,                  -- Cloudinary public_id
  title TEXT,
  description TEXT,
  category TEXT,
  size INTEGER,
  display_order INTEGER DEFAULT 0,
  uploaded_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Storage:** DB (metadata) + **Cloudinary** (pliki)

**Endpointy:**
- `POST /api/content/images/upload` → Upload do Cloudinary + save metadata do DB
- `GET /api/content/images` → Pobiera z DB
- `DELETE /api/content/images/:id` → Usuwa z Cloudinary + DB

**Test brutalny:**
```bash
# 1. Upload image
curl -X POST http://localhost:3001/api/content/images/upload \
  -F "image=@test.jpg" \
  -F "title=Test Image" \
  -H "Authorization: Bearer $TOKEN"

# 2. Restart backend

# 3. Sprawdź czy image jest
curl http://localhost:3001/api/content/images
# ✅ Image jest w DB z Cloudinary URL = SYSTEM
```

---

## 📊 Podsumowanie: Co jest w DB?

| Feature | DB Table | Status | updatedAt |
|---------|----------|--------|-----------|
| Content Sections | `content_sections` | ✅ SYSTEM | ✅ |
| Calculator Config | `calculator_config` | ✅ SYSTEM | ✅ |
| Gallery Images | `gallery_images` | ✅ SYSTEM | ✅ |
| User Auth | `users` | ✅ SYSTEM | ✅ |
| Sessions | `sessions` | ✅ SYSTEM | ✅ |

---

## 🎯 VERDICT: TO JEST SYSTEM

**Czemu?**
1. ✅ Wszystkie dane w PostgreSQL (nie RAM)
2. ✅ Migracje SQL (`migrations/*.sql`)
3. ✅ Endpointy zapisują z `updatedAt` timestamp
4. ✅ Po restarcie Render → dane zostają
5. ✅ Cloudinary dla plików (nie filesystem)

**Test produkcyjny:**
```bash
# Na Render:
1. Zmień cenę w CalculatorSettings
2. Edytuj "O nas" w ContentEditor
3. Uploaduj zdjęcie w GalleryManager
4. Kliknij "Restart" w Render dashboard
5. Odśwież frontend
# ✅ Wszystkie zmiany zostają = SYSTEM
```

---

## 🔧 Implementacja (29 Dec 2025)

### Pliki zmienione:

1. **Backend Schema:**
   - `stefano-eliksir-backend/server/db/schema.ts` 
   - Added `contentSections` table

2. **Migration:**
   - `stefano-eliksir-backend/migrations/002_content_sections.sql`
   - Creates table + default data

3. **API Endpoints:**
   - `stefano-eliksir-backend/server/routes/content.ts`
   - GET/PUT `/api/content/sections` with DB persistence

4. **Tests:**
   - `src/__tests__/brutal/persistence.test.tsx`
   - Brutal test: update → restart → verify

### Uruchomienie migracji:

```bash
cd stefano-eliksir-backend
npm run db:push  # Drizzle ORM
# lub
psql $DATABASE_URL -f migrations/002_content_sections.sql
```

---

## 📝 Wnioski dla przyszłych feature'ów

**Zasada:** Jeśli ma być edytowalne przez admin → musi być w DB.

❌ **NIE ROBIMY:**
```typescript
// ATRAPA - defaults w kodzie
const sections = [
  { id: 'hero', title: 'ELIKSIR' },
  { id: 'about', title: 'O nas' },
];
```

✅ **ROBIMY:**
```typescript
// SYSTEM - query z DB
const sections = await db.select().from(contentSections);
```

**Checklist dla nowych feature'ów:**
1. [ ] Tabela w schema.ts
2. [ ] Migracja SQL
3. [ ] Endpoint z `updatedAt`
4. [ ] Test persistence (brutal test)
5. [ ] Admin panel do edycji

---

## 🚀 Next Steps

1. ✅ Content sections → DB (DONE)
2. ⏳ SEO meta tags → DB (jeśli mają być edytowalne)
3. ⏳ Email templates → DB (jeśli mają być edytowalne)
4. ⏳ Promotions/events → DB (jeśli mają być edytowalne)

**Priorytet:** Wszystko co admin może zmieniać = DB.
