# ZASADA #1: TESTY = ŹRÓDŁO PRAWDY

**Roadmap nie jest dowodem. Dowodem jest CI run link + testy w repo.**

## 📍 Gdzie są testy (źródło prawdy)

```bash
# Uruchom testy lokalnie:
cd cerber-core-github/
npm test                    # Wszystkie testy
npm run test:watch          # Watch mode
npm run coverage            # Coverage report
npm run lint                # ESLint
npm run typecheck           # TypeScript strict

# Smoke test:
node bin/cerber-validate test/fixtures/real-workflows/
```

## 🔗 Weryfikowalne źródła

- **CI Status:** `https://github.com/[org]/cerber-core/actions` (każdy commit)
- **Test Files:** `test/` directory w repo
- **Fixtures:** `test/fixtures/real-workflows/*.yml` (production workflows)
- **Coverage:** Automatycznie przez CI (NIE ręcznie wpisane!)
- **Changelog:** `CHANGELOG.md` (każda zmiana zachowania)

## 📋 Definition of Done (KAŻDY PR)

**Before merge:**

```bash
✅ npm test                    # All tests green
✅ npm run lint                # Zero warnings
✅ npm run typecheck           # TypeScript strict
✅ node bin/cerber-validate test/fixtures/...  # Smoke test
```

**Each PR MUST include:**

1. **1-2 new fixtures** (real workflow YAML z `test/fixtures/`)
2. **Test comparing output** (snapshot OK, stabilny format)
3. **CHANGELOG update** (jeśli zmienia się zachowanie)

## 🐛 False Positive Workflow

```bash
# Step 1: Fixture BEFORE fix
cat > test/fixtures/snippets/fp-issue-123.yml << EOF
# User's workflow that triggered FP
EOF

# Step 2: Test showing expected behavior
it('does NOT flag X (issue #123)', () => {
  expect(violations).toHaveLength(0);
});

# Step 3: npm test (FAILS - catches FP)
# Step 4: Fix logic
# Step 5: npm test (PASSES - FP fixed)
# Step 6: Update CHANGELOG
```

## 🚫 WHAT NOT TO DO

**❌ Hero Refactors:**
```
# BAD: 50 files, 5000+ lines
feat: rewrite validation engine
```

**✅ Small PRs:**
```
# GOOD: 3 files, 120 lines
fix: eliminate FP in secret detection

- Add fixture: test/fixtures/snippets/fp-doc-example.yml
- Add test: expect no violations
- Fix logic: skip step.name containing "example"
- Update CHANGELOG
```

## 📊 Metrics (CI-Generated ONLY)

**❌ NEVER write manually:**
```
❌ "90+ tests passing"
❌ "85% coverage"
❌ "0% false positives"
```

**✅ ALWAYS link to CI:**
```
✅ Tests: https://github.com/[org]/cerber-core/actions
✅ Coverage: https://codecov.io/gh/[org]/cerber-core (badge)
✅ Performance: https://github.com/[org]/cerber-core/actions/workflows/benchmark.yml
```

## 🏗️ Test Structure

```
test/
├── fixtures/
│   ├── real-workflows/       # REAL workflows z audytów
│   │   ├── ci-nodejs.yml
│   │   ├── deploy-docker.yml
│   │   └── ...
│   └── snippets/             # Minimal reproducers
│       ├── hardcoded-secret.yml
│       ├── unpinned-action.yml
│       └── fp-doc-example.yml
├── rules/
│   ├── security-rules.test.ts
│   ├── best-practices.test.ts
│   └── performance.test.ts
├── e2e/
│   └── cli.test.ts
└── snapshots/
    └── __snapshots__/

CHANGELOG.md
```

## 🔄 CI Pipeline

```yaml
# .github/workflows/ci.yml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - run: npm test
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run coverage
      - run: node bin/cerber-validate test/fixtures/real-workflows/
      - uses: codecov/codecov-action@v4

  nightly:
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
        node: [18, 20, 22]
    steps:
      - run: npm test
      - run: npm run benchmark
```

## 📝 Test Philosophy

**Testuj ZACHOWANIE (input → output), nie implementację:**

```typescript
// ✅ GOOD - testuje behavior
it('detects Stripe live key', async () => {
  const workflow = loadFixture('hardcoded-secret.yml');
  const violations = await validator.check(workflow);
  
  expect(violations).toMatchSnapshot();
  expect(violations[0]).toMatchObject({
    id: 'security/no-hardcoded-secrets',
    severity: 'critical'
  });
});

// ❌ BAD - testuje implementation
it('calls SecretScanner.scan', () => {
  const spy = jest.spyOn(SecretScanner, 'scan');
  validator.check(workflow);
  expect(spy).toHaveBeenCalled();
});
```

---

**Jedna prawda: Code in repo → CI validates → Badges show status**
