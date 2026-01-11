# SEO Keywords Synchronization

## 📋 Czym jest?

System automatycznej synchronizacji keywords z Dashboard Admin → `index.html`

## 🚀 Jak działa?

### 1. **Admin zmienia keywords**
- Wchodzi do Admin Panel → SEO Settings
- Edytuje keywords w textarea
- Klika "Zapisz" → keywords w bazie danych

### 2. **Vercel auto-deploy (opcjonalnie)**
- Można dodać webhook trigger w Vercel
- Każda zmiana keywords → auto redeploy
- Lub manualnie: push do GitHub → Vercel rebuild

### 3. **Build time synchronizacja**
- Przed buildem (`npm run build`) uruchamia się `prebuild` hook
- Skrypt `scripts/sync-seo-keywords.mjs`:
  - Pobiera keywords z `GET /api/settings/seo`
  - Aktualizuje `<meta name="keywords">` w index.html
  - **FALLBACK:** Jeśli API offline → zostawia obecne keywords

### 4. **Deploy**
- Vercel builduje stronę z nowymi keywords
- Za 2-3 minuty strona ma zaktualizowane SEO

## 🔒 Bezpieczeństwo

### ✅ **Co chroni przed błędami:**

1. **Timeout 5s** - jeśli backend nie odpowiada, pomija synchronizację
2. **Fallback na obecne keywords** - jeśli API zwróci błąd, używa starych
3. **Walidacja response** - sprawdza czy API zwrócił poprawne dane
4. **Exit code 0** - nawet przy błędzie build się nie wysypie

### ⚠️ **Ograniczenia:**

- Zmiana keywords **NIE jest instant** (wymaga redeployu)
- Backend musi być online podczas buildu (ale fallback załatwia sprawę)
- Keywords max 50 (walidacja w dashboardzie)

## 📝 Użycie

### **Lokalny test:**
```bash
npm run prebuild
# lub bezpośrednio:
node scripts/sync-seo-keywords.mjs
```

### **Build z synchronizacją:**
```bash
npm run build
# Automatycznie wywołuje prebuild → sync → build
```

### **Vercel:**
- Automatycznie uruchamia `npm run build`
- Prebuild hook synchronizuje keywords przed buildem

## 🔄 Vercel Auto-Deploy (opcjonalnie)

Aby zmiany w dashboardzie automatycznie deployowały stronę:

### 1. **Stwórz Deploy Hook w Vercel:**
- Vercel Dashboard → Settings → Git → Deploy Hooks
- Name: "SEO Keywords Update"
- Branch: main
- Skopiuj URL: `https://api.vercel.com/v1/integrations/deploy/...`

### 2. **Dodaj webhook do backendu:**
```typescript
// stefano-eliksir-backend/server/routes/index.ts
api.put('/settings/seo', authenticateToken, async (req, res) => {
  // ... existing code ...
  
  // Trigger Vercel redeploy
  const VERCEL_DEPLOY_HOOK = process.env.VERCEL_DEPLOY_HOOK;
  if (VERCEL_DEPLOY_HOOK) {
    fetch(VERCEL_DEPLOY_HOOK, { method: 'POST' })
      .then(() => console.log('✅ Triggered Vercel redeploy'))
      .catch(err => console.error('⚠️  Vercel trigger failed:', err));
  }
  
  res.json({ success: true, keywords, ... });
});
```

### 3. **Dodaj env variable na Render:**
```
VERCEL_DEPLOY_HOOK=https://api.vercel.com/v1/integrations/deploy/...
```

## 📊 Monitoring

### **Build logs (Vercel):**
```
🔄 Synchronizacja SEO keywords z backendem...
📡 Backend: https://eliksir-backend-front-dashboard.onrender.com
✅ Keywords zaktualizowane w index.html!
📋 Nowe keywords (31):
   - mobilny bar Piotrków Trybunalski
   - barman na wesele Bełchatów
   ...
🎉 Synchronizacja zakończona
```

### **Fallback (backend offline):**
```
⚠️  Nie udało się pobrać keywords z API: HTTP 500
✅ Zachowano obecne keywords (API offline)
📋 Keywords: mobilny bar, bar koktajlowy, wesele...
🎉 Synchronizacja zakończona
```

## ✅ Status

- ✅ Skrypt utworzony: `scripts/sync-seo-keywords.mjs`
- ✅ Prebuild hook dodany do `package.json`
- ✅ Fallback tested (działa gdy API offline)
- ✅ Bezpieczny dla produkcji (zero ryzyka crashu)
- ⏳ Vercel webhook (opcjonalnie - do dodania)

## 🎯 Efekt końcowy

**Przed:**
- Admin Dashboard SEO = martwa funkcja
- Zmiana keywords = edycja kodu + commit

**Po:**
- Admin zmienia keywords w dashboardzie
- Trigger deploy (manual/auto)
- Za 2-3 min strona ma nowe SEO

**Idealny workflow dla non-dev użytkownika!** 🚀
