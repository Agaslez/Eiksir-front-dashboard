# 🚨 CI/CD Quality Gate - Checklist przed push

## ❌ NIGDY nie push jeśli:

1. ❌ `npm run build` - FAIL
2. ❌ `npm run lint` - FAIL  
3. ❌ Są błędy TypeScript
4. ❌ Jest garbage text w kodzie (np. "zajmij sie", "TODO_REMOVE")
5. ❌ package.json i package-lock.json są out of sync

## ✅ ZAWSZE przed push:

```bash
# Frontend (eliksir-frontend/)
cd eliksir-frontend

# 1. Test lokalnie
npm run lint           # ✅ ESLint check
npm run build          # ✅ Build check
npm run test           # ✅ Unit tests (optional)

# 2. Auto validation script
bash scripts/pre-push-validation.sh  # ✅ All-in-one check

# 3. Jeśli wszystko OK → Push
git push origin main
```

## 🔧 Napraw przed push:

### Problem: Syntax Error
```bash
# ERROR: Expected ";" but found "sie"
# FIX: Usuń garbage text z pliku
```

### Problem: package-lock out of sync
```bash
npm install  # Regeneruje package-lock.json
git add package-lock.json
```

### Problem: Import nie istnieje
```bash
# ERROR: Cannot find module '@/lib/config'
# FIX: Sprawdź czy plik istnieje i path jest poprawny
```

## 📊 Monitoring CI/CD

**GitHub Actions:** https://github.com/Agaslez/Eiksir-front-dashboard/actions

**Workflow Jobs:**
1. ✅ Lint & Format Check (ESLint + Prettier)
2. ✅ Type Check (TypeScript tsc)
3. ✅ Build (Vite production build)
4. ✅ E2E Tests (Playwright - 23 tests)
5. ✅ Unit Tests (Jest)
6. ✅ Security Scan (npm audit)

**Jeśli RED build:**
```bash
# 1. Zobacz logi w GitHub Actions
# 2. Reprodukuj błąd lokalnie
# 3. Napraw i test lokalnie
# 4. Push fix
```

## 🎯 Target: 100% Green Builds

**Obecny status:**
- ✅ #158 (latest) - In progress
- ✅ #157 - 39s - docs update
- ✅ #156 - 42s - package-lock fix
- ✅ #155 - 45s - package-lock update
- ✅ #154 - 22s - HorizontalGallery fix
- ✅ #153 - 22s - E2E tests add

**Czerwone buildy - HISTORIA:**
- Commit bb73f1e wcześniej - package-lock desync
- Commit 70094b4 wcześniej - "zajmij sie" garbage text
- **NAPRAWIONE** ✅

---

**Ostatnia aktualizacja:** 2026-01-01  
**Autor:** Stefano + GitHub Copilot
