# 🛡️ GIT-Cerber - Quick Start Guide

**Data:** 2026-01-02  
**Status:** ✅ DEPLOYED (Soft Mode)  
**Lokalizacja:** `.github/workflows/git-cerber.yml`

---

## 📋 Co to jest GIT-Cerber?

GIT-Cerber to Guardian (schema validator) zintegrowany z GitHub Actions CI/CD. Działa jako **first step** w workflow - pilnuje Single Source of Truth (FRONTEND_SCHEMA.ts) ale **nie spowalnia** rozwoju.

---

## 🎯 Obecny Stan: SOFT MODE

**Soft Mode = Informuje, ale nie blokuje**

```yaml
continue-on-error: true  # Violations są logowane ale nie failują workflow
```

**Co to znaczy:**
- ✅ Guardian sprawdza każdy push/PR
- ✅ Violations są widoczne w logach
- ✅ Auto-komentarze na PR z sugestiami fixów
- ⚠️ Workflow NIE failuje (nie blokuje merge)
- ⚠️ To jest PRZEJŚCIOWE - dla stopniowego wdrożenia

**Dlaczego Soft Mode?**
1. Gradual rollout - team się przyzwyczaja
2. Możliwość zobaczenia "co by się stało" bez ryzyka
3. Fixing existing violations bez pressure
4. Smooth transition do strict mode

---

## 🚀 Jak to działa?

### **Trigger:**
```bash
# Każdy push do main/develop
git push origin main

# Każdy Pull Request
gh pr create
```

### **Workflow Flow:**
```
1. git push
     ↓
2. GitHub Actions trigger
     ↓
3. 🛡️ GIT-Cerber runs (FIRST!)
     ↓
4. Guardian Schema Validation
   - Sprawdza FRONTEND_SCHEMA.ts
   - Wykrywa violations
   - Loguje architect approvals
     ↓
5. Performance Budget Check
   - Build bundle
   - Check size (<500KB)
     ↓
6. Result Summary
   - ✅ PASS: All clear
   - ⚠️ WARN: Violations found (logged)
     ↓
7. Workflow continues (lint, build, tests)
```

**Czas wykonania:** ~1-2 minuty (faster niż build!)

---

## 📊 Co Widzisz w GitHub Actions?

### **Successful Run (No Violations):**
```
🛡️ Guardian Schema Check  ✅
   ✅ All required files present
   ✅ No forbidden patterns found
   ✅ All required imports present
   ✅ package-lock.json in sync
   
📦 Performance Budget Check  ✅
   Total size: 387 KB
   Status: OPTIMAL
   
📋 GIT-Cerber Summary  ✅
   Guardian Schema: success
   Performance Budget: success
```

### **Run with Violations (Soft Mode):**
```
🛡️ Guardian Schema Check  ⚠️ (non-blocking)
   ❌ FORBIDDEN PATTERN 'CONSOLE_LOG' found in src/test.ts:10
      Line: console.log('debug');
   ❌ MISSING REQUIRED IMPORT in src/Calculator.tsx
      Missing: fetchWithRetry
   
   💡 SOFT MODE: Violations logged but workflow continues
   
📦 Performance Budget Check  ⚠️
   Total size: 423 KB
   Status: WARNING (approaching 500 KB limit)
   
📋 GIT-Cerber Summary  ⚠️
   Guardian Schema: failed (non-blocking)
   Performance Budget: warning
```

### **PR Comment (Auto-generated):**
```markdown
## ⚠️ Guardian Schema Violations Detected

**Status:** Failed (non-blocking in soft mode)

### 📋 Violations Found:
1. FORBIDDEN PATTERN 'CONSOLE_LOG' in src/test.ts:10
2. MISSING REQUIRED IMPORT 'fetchWithRetry' in src/Calculator.tsx

### 💡 How to Fix:
1. Remove console.log or add architect approval:
   // ARCHITECT_APPROVED: Debug logging for ... - 2026-01-02 - Stefan
   
2. Add missing import:
   import { fetchWithRetry } from '@/lib/auto-healing';

### 📚 Docs:
- [FRONTEND_SCHEMA.ts](../FRONTEND_SCHEMA.ts)
- [ARCHITECT_APPROVAL_GUIDE.md](../ARCHITECT_APPROVAL_GUIDE.md)

**Note:** This check is in soft mode and won't block merge.
```

---

## 🔧 Jak Naprawić Violations?

### **Option 1: Fix Code (Recommended)**
```typescript
// ❌ BEFORE (violation)
console.log('debug data:', data);
const url = 'https://eliksir-backend.onrender.com';

// ✅ AFTER (fixed)
import { logger } from '@/lib/logger';
import { API } from '@/lib/config';

logger.debug('debug data:', data);
const url = API.calculatorConfig;
```

### **Option 2: Architect Approval (Exception)**
```typescript
// When violation is justified:
// ARCHITECT_APPROVED: FB Pixel requires console.log for tracking - 2026-01-02 - Stefan
console.log('📊 FB Pixel: PageView');
```

### **Option 3: Temporary WIP (Skip Validation)**
```bash
# For work-in-progress commits (not recommended for main)
git commit -m "WIP: testing idea"
# Guardian recognizes "WIP:" prefix and skips validation
```

---

## 🔒 Przejście na Strict Mode

**Kiedy?** Gdy wszystkie existing violations zostaną naprawione.

**Jak?**
```yaml
# Edit: .github/workflows/git-cerber.yml
# Find line ~45:
continue-on-error: true  # ← Change this

# Change to:
continue-on-error: false  # ← Strict mode ON

# Commit and push
git add .github/workflows/git-cerber.yml
git commit -m "chore: enable GIT-Cerber strict mode"
git push
```

**Effect:**
- ❌ Workflow FAILS on violations
- ❌ PR cannot be merged until fixed
- ✅ 100% enforcement (defense in depth)

---

## 📊 Monitoring & Metrics

### **Check Workflow Status:**
```bash
# GitHub UI:
https://github.com/YOUR_ORG/eliksir-frontend/actions

# GitHub CLI:
gh run list --workflow=git-cerber.yml
gh run view <run-id>
```

### **Check Health Monitor:**
```bash
# Recent health checks:
gh run list --workflow=cerber-health-monitor.yml --limit 10

# Backend health status:
curl https://eliksir-backend.onrender.com/api/health | jq
```

---

## 🆘 Troubleshooting

### **Problem: "Guardian check failed but I can't see why"**
```bash
# Check workflow logs:
gh run view <run-id> --log

# Or GitHub UI:
Actions tab → Select failed run → Click "Guardian Schema Check"
```

### **Problem: "I need to push urgently, skip Guardian"**
```bash
# Option 1: WIP commit (Guardian skips)
git commit -m "WIP: urgent hotfix"

# Option 2: Wait for workflow (soft mode doesn't block)
git push  # Workflow runs but doesn't prevent merge

# Option 3: Emergency (NOT RECOMMENDED)
# In strict mode only: Admin can force merge with override
```

### **Problem: "False positive - Guardian wrongly flagged my code"**
```bash
# Add architect approval:
// ARCHITECT_APPROVED: [reason] - [date] - [your_name]

# Example:
// ARCHITECT_APPROVED: Performance optimization requires direct fetch - 2026-01-02 - Stefan
const data = await fetch(url);

# Re-push and Guardian will recognize approval
```

---

## 📈 Benefits Tracking

**Expected Impact (from Senior Dev Assessment):**
- Bug prevention: ~60% fewer production bugs
- Time saved: 10-16h/week (debugging + code reviews)
- Developer velocity: +15-20%
- ROI: Payback in 2 weeks

**Monitor:**
- Check GitHub Actions logs for violation trends
- Track time spent fixing violations vs time saved on bugs
- Review architect approvals (are same violations repeated?)

---

## 🎓 Best Practices

### **Do's:**
- ✅ Fix violations as soon as you see them
- ✅ Read violation messages (they contain fix suggestions)
- ✅ Add architect approval with clear reason
- ✅ Update FRONTEND_SCHEMA.ts when project evolves
- ✅ Review PR comments from GIT-Cerber

### **Don'ts:**
- ❌ Don't ignore violations ("I'll fix later")
- ❌ Don't bypass with WIP for non-WIP code
- ❌ Don't add architect approvals without reason
- ❌ Don't disable workflows without team discussion
- ❌ Don't commit with `--no-verify` to skip local Guardian

---

## 📚 Related Documentation

- [FRONTEND_SCHEMA.ts](../FRONTEND_SCHEMA.ts) - Single Source of Truth
- [ARCHITECT_APPROVAL_GUIDE.md](../ARCHITECT_APPROVAL_GUIDE.md) - Approval process
- [CERBER_VERSION_STATEMENT.md](CERBER_VERSION_STATEMENT.md) - Version info
- [CERBER_SENIOR_DEV_ASSESSMENT.md](CERBER_SENIOR_DEV_ASSESSMENT.md) - Detailed analysis
- [SYSTEM_ARCHITECTURE_REPORT.md](../SYSTEM_ARCHITECTURE_REPORT.md#guardian) - Full docs

---

## 🚦 Status Summary

**Current Mode:** 🟡 SOFT (informational, non-blocking)  
**Next Milestone:** 🟢 STRICT (blocking, full enforcement)  
**Timeline:** When existing violations fixed (~1-2 weeks)

**Rating:** ⭐⭐⭐⭐⭐ (8/10 - excellent for solo dev)

---

**Questions?** Check [CERBER_SENIOR_DEV_ASSESSMENT.md](CERBER_SENIOR_DEV_ASSESSMENT.md) for detailed analysis or ask Stefan.

**Last updated:** 2026-01-02
