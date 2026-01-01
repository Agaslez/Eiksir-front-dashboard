# 🏛️ ARCHITECT APPROVAL SYSTEM

## Cel
System zapewnia **SINGLE SOURCE OF TRUTH** poprzez walidację kodu przed każdym commitem. Odstępstwa od standardów są możliwe **TYLKO** za zgodą architekta i muszą być udokumentowane w kodzie.

## Pre-commit Hook
Każdy commit jest automatycznie walidowany przez `scripts/validate-schema.mjs`:
- ✅ Sprawdza strukturę plików
- ✅ Blokuje zabronione wzorce (console.log, debugger, garbage text)
- ✅ Wymusza wymagane importy (API, fetchWithRetry, useComponentHealth)
- ✅ Weryfikuje sync package-lock.json

## Format Approval

### Składnia
```typescript
// ARCHITECT_APPROVED: [powód] - YYYY-MM-DD - [imię]
console.log("debug code"); // zabronionyKod
```

### Przykład
```typescript
// ARCHITECT_APPROVED: Logger initialization requires console.log for debugging - 2025-01-25 - Stefan
console.log(`[Logger] Initialized - session: ${this.sessionId}`);
```

### Wymagania
1. **Komentarz musi być:** 
   - W tej samej linii co zabronionyKod **LUB**
   - W linii bezpośrednio powyżej

2. **Format daty:** `YYYY-MM-DD`

3. **Architect name:** Jedno słowo, [A-Za-z]

4. **Powód:** Konkretny, biznesowy, techniczny

## Proces Approval

### Krok 1: Developer Napotyka Blokadę
```bash
$ git commit -m "feature: new component"

═══════════════════════════════════════════════════
🛡️  SINGLE SOURCE OF TRUTH VALIDATOR
═══════════════════════════════════════════════════

❌ ERRORS:
   ❌ FORBIDDEN PATTERN 'CONSOLE_LOG' found in src/lib/logger.ts:78

❌ COMMIT BLOCKED - Fix errors above!

💡 TIP: Schema violations require architect approval:
   // ARCHITECT_APPROVED: [reason] - YYYY-MM-DD - [name]
   console.log("debug"); // forbidden code
```

### Krok 2: Developer Zgłasza Do Architekta
Developer tworzy ticket/message z uzasadnieniem:
> "Potrzebuję console.log w Logger.ts:78 dla inicjalizacji loggera. Jest to critical dla debugging produkcji, gdzie musimy wiedzieć czy logger wystartował."

### Krok 3: Architect Przegląda
Architect sprawdza:
- ✅ Czy odstępstwo jest uzasadnione?
- ✅ Czy nie ma lepszego rozwiązania?
- ✅ Czy jest zgodne z architekturą?

**Jeśli TAK:** Architect daje approval w kodzie:
```typescript
// ARCHITECT_APPROVED: Logger initialization requires console.log for debugging - 2025-01-25 - Stefan
console.log(`[Logger] Initialized - session: ${this.sessionId}`);
```

**Jeśli NIE:** Architect proponuje alternatywę (np. użyć logger.info zamiast console.log)

### Krok 4: Commit Przechodzi
```bash
$ git commit -m "feature: logger initialization"

✅ ARCHITECT APPROVALS:
   📄 src\lib\logger.ts:78
      Reason: Logger initialization requires console.log for debugging
      Approved by: Stefan on 2025-01-25

✅ ALL CHECKS PASSED
✅ Single Source of Truth validated
✅ Commit allowed
```

## Kiedy Używać Approval?

### ✅ DOPUSZCZALNE (z approval)
1. **console.log w kritycznym miejscu** 
   - Logger initialization
   - FB Pixel tracking
   - Critical error notifications

2. **debugger w E2E tests**
   - Playwright debugging
   - CI/CD troubleshooting

3. **TEMP_CODE w spike/prototype**
   - POC features
   - Temporary workarounds z deadline

### ❌ NIEDOPUSZCZALNE (nawet z approval)
1. **Garbage text** (`zajmij sie`, random strings)
2. **Hardcoded secrets** (API keys, passwords)
3. **Broken imports** (undefined variables)
4. **Syntax errors**

## Schema (FRONTEND_SCHEMA.ts)

### Zabronione Wzorce
```javascript
{ pattern: /zajmij\s+sie/gi, name: 'GARBAGE_TEXT' }
{ pattern: /TODO_REMOVE/gi, name: 'TODO_REMOVE' }
{ pattern: /TEMP_[A-Z_]+/gi, name: 'TEMP_CODE' }
{ pattern: /HACK_[A-Z_]+/gi, name: 'HACK_CODE' }
{ pattern: /console\.log\s*\(/gi, name: 'CONSOLE_LOG', exceptions: ['e2e/', 'scripts/'] }
{ pattern: /debugger;/gi, name: 'DEBUGGER', exceptions: ['e2e/'] }
```

### Wymagane Importy
```javascript
'src/components/Calculator.tsx': [
  "import { API }",
  "fetchWithRetry",
  "useComponentHealth",
]
'src/components/Gallery.tsx': [
  "import { API",
  "fetchWithRetry",
]
```

## Dodawanie Nowego Approval

### 1. Zidentyfikuj Wzorzec
```bash
❌ FORBIDDEN PATTERN 'CONSOLE_LOG' found in src/lib/pixel.ts:34
```

### 2. Dodaj Komentarz Approval
```typescript
// src/lib/pixel.ts:34

// ARCHITECT_APPROVED: FB Pixel tracking requires console.log for production debugging - 2025-01-25 - Stefan
console.log('📊 FB Pixel: PageView');
```

### 3. Commit Przejdzie
Pre-commit hook rozpozna approval i pozwoli na commit.

## Audyt Approvals

### Listowanie Wszystkich Approvals
```bash
$ node scripts/validate-schema.mjs 2>&1 | grep -A 3 "ARCHITECT APPROVALS"

✅ ARCHITECT APPROVALS:
   📄 src\lib\logger.ts:78
      Reason: Logger initialization requires console.log for debugging
      Approved by: Stefan on 2025-01-25
```

### Review Approvals w Code Review
Każdy PR z approval musi:
1. Pokazywać sekcję "ARCHITECT APPROVALS" w CI/CD output
2. Mieć review od architekta
3. Dokumentować powód w PR description

## FAQ

### Q: Czy mogę commitować z `--no-verify`?
**A:** TAK, ale CI/CD i tak zablokuje build. Pre-commit hook to pierwsza linia obrony, nie jedyna.

### Q: Co jeśli architect jest niedostępny?
**A:** Użyj `git commit --no-verify` i dodaj TODO w PR: "NEEDS_ARCHITECT_APPROVAL: [file:line]". Architect zrobi review w PR.

### Q: Czy approval expirują?
**A:** NIE, ale code review powinien sprawdzać czy powód approval jest nadal aktualny.

### Q: Jak usunąć przestarzały approval?
**A:** Po prostu usuń komentarz i napraw kod (zastąp console.log → logger.info).

## Narzędzia

### validate-schema.mjs
- **Lokalizacja:** `scripts/validate-schema.mjs`
- **Wywołanie:** `node scripts/validate-schema.mjs`
- **Zwraca:** Exit code 0 (OK) lub 1 (blocked)

### pre-commit Hook
- **Lokalizacja:** `.git/hooks/pre-commit`
- **Auto-run:** Każdy `git commit`
- **Disable:** `git commit --no-verify` (ostrożnie!)

### FRONTEND_SCHEMA.ts
- **Lokalizacja:** `FRONTEND_SCHEMA.ts`
- **Single Source of Truth** dla:
  - requiredFiles
  - forbiddenPatterns
  - requiredImports
  - criticalRules

## Przykłady Approvals

### Logger Initialization
```typescript
// ARCHITECT_APPROVED: Logger initialization requires console.log for debugging - 2025-01-25 - Stefan
console.log(`[Logger] Initialized - session: ${this.sessionId}, min level: ${LogLevel[this.minLevel]}`);
```

### FB Pixel Tracking
```typescript
// ARCHITECT_APPROVED: FB Pixel tracking requires console.log for production debugging - 2025-01-25 - Stefan
console.log('📊 FB Pixel: PageView');
```

### Temporary Spike Code
```typescript
// ARCHITECT_APPROVED: TEMP spike for dashboard POC - deadline 2025-02-01 - 2025-01-25 - Stefan
const TEMP_MOCK_DATA = [...];
```

### E2E Debugging
```typescript
// ARCHITECT_APPROVED: Playwright debugging requires debugger in E2E tests - 2025-01-25 - Stefan
await page.screenshot({ path: 'debug.png' });
debugger; // pause for manual inspection
```

---

**Ostatnia aktualizacja:** 2025-01-25 Stefan  
**Wersja systemu:** v1.0  
**Pre-commit hook:** Aktywny od commit #70094b4
