# 📊 Facebook Pixel Tracking - Test Manual

**Data:** 29 grudnia 2025  
**Priorytet:** KRYTYK #4

## ✅ Eventy zaimplementowane:

### 1. PageView (automatyczny)
- **Gdzie:** `index.html` - Facebook Pixel SDK
- **Kiedy:** Automatycznie na każdym załadowaniu strony
- **Test:** 
  ```bash
  1. Wejdź na stronę
  2. Otwórz Chrome DevTools → Console
  3. Szukaj: "FB Pixel: PageView"
  4. Facebook Events Manager → Test Events → PageView ✅
  ```

### 2. Lead (wysłanie formularza kontaktowego)
- **Gdzie:** `src/components/Contact.tsx`
- **Kiedy:** Po kliknięciu "Wyślij zapytanie" w formularzu
- **Data:** 
  - `content_name`: "Contact Form Submission"
  - `content_category`: "Event Inquiry"
  - `value`: Cena z kalkulatora (jeśli wypełniony)
  - `currency`: "PLN"
- **Test:**
  ```bash
  1. Wypełnij formularz kontaktowy
  2. Kliknij "Wyślij zapytanie"
  3. Console: "📊 FB Pixel: Lead"
  4. Events Manager → Lead event ✅
  ```

### 3. ViewContent (przewinięcie do sekcji Oferta/Kalkulator)
- **Gdzie:** `src/components/Calculator.tsx`
- **Kiedy:** Przy pierwszym wyświetleniu kalkulatora (raz per sesja)
- **Data:**
  - `content_name`: "Calculator - Event Pricing"
  - `content_type`: "product_group"
  - `content_ids`: ['basic', 'premium', 'exclusive', 'kids', 'family', 'business']
- **Test:**
  ```bash
  1. Przewiń do sekcji #kalkulator
  2. Console: "📊 FB Pixel: ViewContent"
  3. Events Manager → ViewContent event ✅
  ```

### 4. AddToCart (wybór pakietu w kalkulatorze)
- **Gdzie:** `src/components/Calculator.tsx`
- **Kiedy:** Po kliknięciu na jeden z pakietów (Basic, Premium, Exclusive, Kids, Family, Business)
- **Data:**
  - `content_name`: "Package: [nazwa pakietu]"
  - `content_type`: "product"
  - `content_ids`: [id pakietu]
  - `value`: Cena bazowa pakietu
  - `currency`: "PLN"
- **Test:**
  ```bash
  1. W kalkulatorze kliknij pakiet (np. Premium)
  2. Console: "📊 FB Pixel: AddToCart"
  3. Events Manager → AddToCart event ✅
  ```

### 5. Contact (klik telefon/email/social)
- **Gdzie:** `src/components/FooterEliksir.tsx`
- **Kiedy:** Po kliknięciu telefon, email, Facebook lub Instagram
- **Data:**
  - `content_name`: "Contact Click"
  - `content_category`: "phone" | "email" | "facebook" | "instagram"
- **Test:**
  ```bash
  1. W stopce kliknij numer telefonu
  2. Console: "📊 FB Pixel: Contact (phone)"
  3. Events Manager → Contact event ✅
  
  4. Kliknij email
  5. Console: "📊 FB Pixel: Contact (email)"
  
  6. Kliknij ikonę Facebook
  7. Console: "📊 FB Pixel: Contact (facebook)"
  ```

---

## 🧪 Test Manual - Facebook Events Manager

### Krok 1: Test Events (przed publikacją)

```bash
# 1. Otwórz Facebook Events Manager
https://business.facebook.com/events_manager2/list/pixel/756005747529490

# 2. Kliknij "Test Events"

# 3. Wpisz ID przeglądarki (pokazuje się w DevTools Console)
# Lub wpisz: "Test Browser"

# 4. Wykonaj akcje na stronie:
- Załaduj stronę → PageView ✅
- Przewiń do kalkulatora → ViewContent ✅
- Wybierz pakiet → AddToCart ✅
- Wypełnij formularz → Lead ✅
- Kliknij telefon → Contact ✅

# 5. Sprawdź w Test Events czy wszystkie eventy przychodzą
```

### Krok 2: Pixel Helper (Chrome Extension)

```bash
# 1. Zainstaluj: Meta Pixel Helper
https://chrome.google.com/webstore/detail/meta-pixel-helper/

# 2. Otwórz stronę i kliknij ikonę w toolbar

# 3. Powinny się pokazać:
✅ PageView (automatyczny)
✅ ViewContent (po scroll do kalkulatora)
✅ AddToCart (po wyborze pakietu)
✅ Lead (po submit formularza)
✅ Contact (po klik tel/email)
```

### Krok 3: Test produkcyjny (na żywo)

```bash
# Po wdrożeniu na Vercel:
https://eliksir-bar.pl

# 1. Otwórz Events Manager → Overview
# 2. Sprawdź Last 60 Minutes
# 3. Wykonaj test user flow:
   - Wejdź na stronę
   - Scroll do kalkulatora
   - Wybierz pakiet
   - Wypełnij formularz
   - Kliknij telefon

# 4. Po 1-5 minutach: Events Manager pokaz wszystkie eventy ✅
```

---

## 📊 Wyniki sprzedażowe (KPI)

### Konwersje do śledzenia:

| Event | Cel biznesowy | Wartość |
|-------|---------------|---------|
| **PageView** | Ruch na stronie | Info |
| **ViewContent** | Zainteresowanie ofertą | Gorący lead |
| **AddToCart** | Wybór pakietu | Bardzo gorący lead |
| **Lead** | Wysłanie zapytania | **KONWERSJA** 🎯 |
| **Contact** | Kontakt telefoniczny | **KONWERSJA** 🎯 |

### Funnel konwersji:

```
PageView (100%) 
  ↓
ViewContent (30-40% - scroll do oferty)
  ↓
AddToCart (15-20% - wybór pakietu)
  ↓
Lead (5-10% - wysłanie formularza) ← GŁÓWNA KONWERSJA
  ↓
Contact (2-5% - telefon/email) ← NAJLEPSZA KONWERSJA
```

---

## 🚀 Next Steps

### 1. Kampanie reklamowe:
- **Conversion Objective:** Lead (formularz)
- **Custom Audience:** Ludzie którzy wykonali ViewContent ale nie Lead
- **Lookalike Audience:** Bazując na ludziach którzy wykonali Lead

### 2. Retargeting:
- ViewContent → pokaż reklamy z pakietami
- AddToCart → pokaż rabat / ofertę specjalną
- Lead → exclude z reklam (już wysłali zapytanie)

### 3. Optymalizacja:
- A/B test: które pakiety generują najwięcej AddToCart?
- A/B test: które sekcje generują najwięcej Contact kliknięć?
- Analiza: jaki % ViewContent konwertuje do Lead?

---

## ✅ CHECKLIST FINALNA:

- [x] PageView - automatyczny ✅
- [x] Lead - formularz kontaktowy ✅
- [x] ViewContent - scroll do kalkulatora ✅
- [x] AddToCart - wybór pakietu ✅
- [x] Contact - telefon/email/social ✅
- [ ] Test w Facebook Events Manager (do wykonania)
- [ ] Test produkcyjny na Vercel (do wykonania)
- [ ] Kampanie conversion-based (do skonfigurowania)

**STATUS:** Implementacja complete, czeka test manual.
