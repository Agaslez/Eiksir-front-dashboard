# Smoke Tests - Logger Implementation

## ✅ Punkt 1: Logger w wszystkich komponentach - COMPLETED

### Status Deploymentu
- **Commit**: 63bc118
- **Data**: 2025-12-31
- **Zmiany**: 21 plików (20 komponentów + 1 hook)

### Komponenty Zinstrumentowane (20/20)
1. ✅ Calculator
2. ✅ Gallery
3. ✅ HorizontalGallery
4. ✅ Contact
5. ✅ Header
6. ✅ Footer
7. ✅ FooterEliksir
8. ✅ Menu
9. ✅ HeroEliksir
10. ✅ OfertaEliksir
11. ✅ StatsEliksir
12. ✅ CTA
13. ✅ About
14. ✅ Pricing
15. ✅ PackageDetails
16. ✅ UslugiEventowe
17. ✅ ThemeSwitcher
18. ✅ LoadingSpinner
19. ✅ ResponsiveTest
20. ✅ ProtectedRoute

---

## 🧪 Testy do Wykonania

### Test 1: Weryfikacja Logów w Konsoli
**Oczekiwany Rezultat:**
Po otwarciu strony w konsoli powinny pojawić się logi:
```
[Component] HeroEliksir mount {renderCount: 0}
[Component] Header mount {renderCount: 0}
[Component] Gallery mount {renderCount: 0}
[Component] Calculator mount {renderCount: 0}
...
```

**Kroki:**
1. Otwórz https://eliksir-front-dashboard.vercel.app/
2. Otwórz DevTools (F12) → zakładka Console
3. Odśwież stronę (Ctrl+F5)
4. Sprawdź czy widać logi z prefixem `[Component]`

**Status**: ⏳ PENDING

---

### Test 2: Render Tracking
**Oczekiwany Rezultat:**
Po interakcji ze stroną (np. zmiana pakietu w kalkulatorze) powinny pojawić się logi:
```
[Component] Calculator render {renderCount: 2}
[Component] Calculator render {renderCount: 3}
```

**Kroki:**
1. Przewiń do sekcji Kalkulator
2. Kliknij różne pakiety (Family, Business, Premium)
3. Sprawdź konsole - czy widać logi z rosnącym `renderCount`

**Status**: ⏳ PENDING

---

### Test 3: Unmount Tracking
**Oczekiwany Rezultat:**
Po nawigacji do innej strony (np. Admin Panel) powinny pojawić się logi:
```
[Component] Calculator unmount {lifetime: 15234, renderCount: 5}
[Component] Gallery unmount {lifetime: 15240, renderCount: 2}
```

**Kroki:**
1. Otwórz stronę główną
2. Poczekaj 5 sekund
3. Przejdź do `/admin/login`
4. Sprawdź konsole - czy widać logi unmount z `lifetime` i `renderCount`

**Status**: ⏳ PENDING

---

### Test 4: Performance Metrics
**Oczekiwany Rezultat:**
W konsoli powinny być widoczne metryki API calls z czasem wykonania:
```
[API] GET /api/config 200 (duration: 145ms)
[API] GET /api/content/gallery/public 200 (duration: 234ms)
```

**Kroki:**
1. Odśwież stronę (Ctrl+F5)
2. Sprawdź konsole - czy są logi API z czasem (duration)
3. Zweryfikuj czy wszystkie requesty mają logi

**Status**: ⏳ PENDING

---

### Test 5: Error Capture
**Oczekiwany Rezultat:**
Jeśli backend zwróci 400 (np. przy zapisie w Dashboard), w konsoli powinien być:
```
[API] POST /api/config 400 (duration: 89ms)
❌ Error details: {validation errors...}
```

**Kroki:**
1. Zaloguj się do Admin Panel
2. Idź do Calculator Settings
3. Spróbuj zapisać nieprawidłową konfigurację (np. ujemna cena)
4. Sprawdź konsole - czy error został złapany i zalogowany

**Status**: ⏳ PENDING (wymaga testu w Dashboard)

---

### Test 6: System Health Dashboard
**Oczekiwany Rezultat:**
W System Health powinny być widoczne:
- 🛡️ Banner "Automatic Error Capture Active"
- Lista ostatnich errorów (jeśli były)
- Timestamp każdego errora

**Kroki:**
1. Zaloguj się do Admin Panel
2. Idź do System Health
3. Sprawdź czy widać info banner
4. Sprawdź czy ostatnie błędy są wyświetlone (jeśli były)

**Status**: ⏳ PENDING

---

## 📊 Oczekiwane Wyniki

### Console Logs (Development)
- ✅ Mount logs przy ładowaniu strony
- ✅ Render logs przy interakcji
- ✅ Unmount logs przy nawigacji
- ✅ API logs z performance metrics
- ✅ Error logs z breadcrumbs

### Production Behavior
- ⚠️ Console logs wyłączone (tylko w dev)
- ✅ API logs nadal działają (fetch interceptor)
- ✅ Errors wysyłane do backend /api/logs
- ✅ System Health pokazuje captured errors

---

## ⚠️ Known Issues

### Issue 1: useLogger w hooku React.FC
W `ProtectedRoute` i `LoadingSpinner` używamy `React.FC`, więc hook musi być na początku.
✅ **FIXED** - dodano `useLogger()` na początku funkcji

### Issue 2: Menu eksportowany jako named export
`Menu.tsx` ma `export const Menu` zamiast `export default`
✅ **FIXED** - dodano useLogger wewnątrz komponentu

---

## 🚀 Next Steps (Po Zakończeniu Testów)

### Punkt 2: Backend /api/logs Endpoint
- [ ] Zweryfikować czy backend ma route `/api/logs`
- [ ] Stworzyć tabelę `logs` w bazie danych
- [ ] Dodać retention policy (usuń po 7 dniach)

### Punkt 3: Dashboard Logs Viewer
- [ ] Stworzyć stronę Logs Viewer w Admin Panel
- [ ] Dodać filtrowanie po level/component/time
- [ ] Dodać search/export

### Punkt 4: Navigation Tracking
- [ ] Stworzyć useNavigationLogger hook
- [ ] Integracja z React Router

### Punkt 5: Performance Dashboard
- [ ] Panel z metrykami API response time
- [ ] Chart z czasem odpowiedzi
- [ ] Top 10 slowest endpoints

---

## 📝 Test Results Log

| Test | Status | Data | Notatki |
|------|--------|------|---------|
| Test 1 | ⏳ | - | Czeka na deployment |
| Test 2 | ⏳ | - | Czeka na deployment |
| Test 3 | ⏳ | - | Czeka na deployment |
| Test 4 | ⏳ | - | Czeka na deployment |
| Test 5 | ⏳ | - | Wymaga testu Dashboard |
| Test 6 | ⏳ | - | Wymaga logowania |

---

## ✅ Deployment Checklist

- [x] Commit zmian
- [x] Push do GitHub
- [ ] Vercel auto-deploy (~2 min)
- [ ] Smoke test 1-6
- [ ] Update test results log
- [ ] Przejście do Punktu 2

---

## 🔍 Debugging Tips

### Brak logów w konsoli?
1. Sprawdź czy jesteś w trybie development
2. Sprawdź czy Logger został zainicjalizowany w main.tsx
3. Sprawdź czy useLogger jest importowany poprawnie

### Logi się powtarzają?
To normalne w React Strict Mode (development). Każdy komponent renderuje się 2x.

### Nie widać API logs?
Sprawdź czy fetch interceptor działa:
```javascript
console.log(typeof window.fetch); // powinno być "function"
```

### Nie widać errorów w System Health?
Sprawdź czy GlobalErrorMonitor został zainicjalizowany:
```javascript
import { getErrorMonitor } from '@/lib/global-error-monitor';
console.log(getErrorMonitor()); // nie powinno być null
```
