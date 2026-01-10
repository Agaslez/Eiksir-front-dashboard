// src/components/Contact.tsx
import { motion } from 'framer-motion';
import { useState, type FormEvent } from 'react';
import { useComponentHealth } from '../lib/component-health-monitor';
import type { CalculatorSnapshot } from './Calculator';
import { Container } from './layout/Container';
import { Section } from './layout/Section';

type ContactProps = {
  calculatorSnapshot?: CalculatorSnapshot | null; // Zmieniamy na opcjonalne
};

export default function Contact({ calculatorSnapshot }: ContactProps) {
  useComponentHealth('Contact');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    guests: '',
    message: '',
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Funkcje walidacyjne
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    if (!phone) return true; // telefon opcjonalny
    const phoneRegex = /^[+]?[\d\s\-\(\)]{9,}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Imię i nazwisko jest wymagane';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email jest wymagany';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Podaj poprawny adres email';
    }

    if (formData.phone && !validatePhone(formData.phone)) {
      newErrors.phone = 'Podaj poprawny numer telefonu';
    }

    if (formData.guests) {
      const guestsNum = parseInt(formData.guests);
      if (isNaN(guestsNum) || guestsNum < 10 || guestsNum > 400) {
        newErrors.guests = 'Liczba gości musi być między 10 a 400';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!agreedToTerms) {
      alert('Proszę wyrazić zgodę na przetwarzanie danych osobowych.');
      return;
    }

    if (!validateForm()) {
      alert('Proszę poprawić błędy w formularzu.');
      return;
    }

    setIsSubmitting(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      
      // Przygotuj dane do wysłania
      const emailData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        message: formData.message,
        eventType: 'Zapytanie z formularza',
        eventDate: formData.date || undefined,
        guestCount: formData.guests ? parseInt(formData.guests) : undefined,
        calculatorSnapshot: calculatorSnapshot || undefined,
      };

      // Wyślij przez backend API
      const response = await fetch(`${API_URL}/api/email/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Błąd podczas wysyłania wiadomości');
      }

      // Sukces!
      setIsSubmitted(true);
      alert('✅ Wiadomość wysłana! Odezwiemy się wkrótce.');

      // Reset form after 3 seconds
      setTimeout(() => {
        setIsSubmitted(false);
        setFormData({
          name: '',
          email: '',
          phone: '',
          date: '',
          guests: '',
          message: '',
        });
        setAgreedToTerms(false);
        setErrors({});
      }, 3000);

    } catch (error) {
      console.error('Error sending contact form:', error);
      alert('❌ Błąd podczas wysyłania. Spróbuj ponownie lub skontaktuj się bezpośrednio: kontakt@eliksir-bar.pl');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Section
      id="kontakt"
      className="bg-black border-t border-white/10 relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-amber-900/10 via-transparent to-transparent" />

      {/* KONTENER */}
      <Container className="relative">
        {/* NAGŁÓWEK - IDENTYCZNY JAK KALKULATOR */}
        <div className="mb-12 text-center">
          <p className="text-amber-400 uppercase tracking-[0.3em] text-sm mb-4">
            Kontakt
          </p>
          <h2 className="font-playfair text-4xl md:text-5xl font-bold text-white mb-3">
            Zamów wycenę
          </h2>
          <p className="text-white/60 text-sm md:text-base">
            Wyślij nam kilka podstawowych informacji. Odezwiemy się z dopasowaną
            wyceną i potwierdzeniem dostępności terminu.
          </p>
        </div>

        {/* jak w Testimonials – sama siatka ma max-w-6xl mx-auto */}
        <div className="grid gap-14 lg:grid-cols-2 items-start max-w-6xl mx-auto">
          {/* LEWA STRONA – dane kontaktowe */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="font-playfair text-2xl md:text-3xl text-white mb-6 text-center">
              Porozmawiajmy o Twojej imprezie
            </h3>
            <p className="text-white/60 text-sm md:text-base mb-10 leading-relaxed text-center">
              Najlepiej, gdy w wiadomości podasz typ wydarzenia, lokalizację,
              przybliżoną liczbę gości i godziny trwania imprezy. To pozwoli nam
              szybko przygotować konkretną propozycję.
            </p>

            <div className="space-y-7 text-sm">
              <a
                href="tel:+48781024701"
                className="flex items-center gap-4 group"
              >
                <div className="w-12 h-12 border border-amber-400/40 flex items-center justify-center group-hover:bg-amber-400/10 transition-colors">
                  <svg
                    className="w-5 h-5 text-amber-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-white/40 text-xs uppercase tracking-[0.2em]">
                    Telefon
                  </p>
                  <p className="text-white text-base group-hover:text-amber-300 transition-colors">
                    +48 781 024 701
                  </p>
                </div>
              </a>

              <a
                href="mailto:kontakt@eliksir-bar.pl"
                className="flex items-center gap-4 group"
              >
                <div className="w-12 h-12 border border-amber-400/40 flex items-center justify-center group-hover:bg-amber-400/10 transition-colors">
                  <svg
                    className="w-5 h-5 text-amber-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-white/40 text-xs uppercase tracking-[0.2em]">
                    Email
                  </p>
                  <p className="text-white text-base group-hover:text-amber-300 transition-colors">
                    kontakt@eliksir-bar.pl
                  </p>
                </div>
              </a>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 border border-amber-400/40 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-amber-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M17.657 16.657 13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-white/40 text-xs uppercase tracking-[0.2em]">
                    Lokalizacja bazowa
                  </p>
                  <p className="text-white text-base">
                    Kleszczów / Bełchatów (dojazd na całą Polskę)
                  </p>
                </div>
              </div>

              {calculatorSnapshot && (
                <div className="mt-4 p-4 border border-emerald-400/40 bg-emerald-400/5 text-xs text-emerald-100 rounded-sm">
                  <p className="font-semibold mb-1">
                    Dane z kalkulatora zostaną dołączone do maila.
                  </p>
                  <p className="leading-relaxed">
                    Pakiet: <strong>{calculatorSnapshot.offerName}</strong> ·{' '}
                    Goście: <strong>{calculatorSnapshot.guests}</strong> · Cena:{' '}
                    <strong>
                      {calculatorSnapshot.totalAfterDiscount.toLocaleString(
                        'pl-PL'
                      )}{' '}
                      PLN
                    </strong>
                  </p>
                </div>
              )}
            </div>
          </motion.div>

          {/* PRAWA STRONA – formularz */}
          <motion.div
            className="bg-gradient-to-b from-neutral-900 to-neutral-950 border border-white/10 p-6 md:p-8 lg:p-10"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            {isSubmitted ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg
                    className="w-10 h-10 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3 text-center">
                  Wiadomość wysłana! ✨
                </h3>
                <p className="text-white/60 mb-6 text-center">
                  Dziękujemy za kontakt! Otworzyliśmy dla Ciebie okno maila.
                  <br />
                  Wypełnij wiadomość i wyślij do nas.
                </p>
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4 mb-6">
                  <p className="text-emerald-300 text-sm text-center">
                    <strong>Uwaga:</strong> Jeśli okno maila się nie otworzyło,
                    sprawdź swoją skrzynkę pocztową
                    <br />
                    lub wyślij maila ręcznie na adres:{' '}
                    <strong>st.pitek@gmail.com</strong>
                  </p>
                </div>
                <p className="text-white/40 text-sm text-center">
                  Formularz zostanie zresetowany za chwilę...
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="space-y-7 text-sm">
                  <div>
                    <label className="text-white/45 text-xs uppercase tracking-[0.2em] block mb-2">
                      Imię i nazwisko
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => {
                        setFormData((f) => ({ ...f, name: e.target.value }));
                        if (errors.name)
                          setErrors((prev) => ({ ...prev, name: '' }));
                      }}
                      className={`w-full bg-transparent border-b py-2 text-white text-sm focus:outline-none mt-1 ${
                        errors.name
                          ? 'border-red-500'
                          : 'border-white/25 focus:border-amber-400'
                      }`}
                    />
                    {errors.name && (
                      <p className="text-red-400 text-xs mt-1">{errors.name}</p>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-white/45 text-xs uppercase tracking-[0.2em] block mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => {
                          setFormData((f) => ({ ...f, email: e.target.value }));
                          if (errors.email)
                            setErrors((prev) => ({ ...prev, email: '' }));
                        }}
                        className={`w-full bg-transparent border-b py-2 text-white text-sm focus:outline-none mt-1 ${
                          errors.email
                            ? 'border-red-500'
                            : 'border-white/25 focus:border-amber-400'
                        }`}
                      />
                      {errors.email && (
                        <p className="text-red-400 text-xs mt-1">
                          {errors.email}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="text-white/45 text-xs uppercase tracking-[0.2em] block mb-2">
                        Telefon
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => {
                          setFormData((f) => ({ ...f, phone: e.target.value }));
                          if (errors.phone)
                            setErrors((prev) => ({ ...prev, phone: '' }));
                        }}
                        placeholder="+48 123 456 789"
                        className={`w-full bg-transparent border-b py-2 text-white text-sm focus:outline-none mt-1 ${
                          errors.phone
                            ? 'border-red-500'
                            : 'border-white/25 focus:border-amber-400'
                        }`}
                      />
                      {errors.phone && (
                        <p className="text-red-400 text-xs mt-1">
                          {errors.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-white/45 text-xs uppercase tracking-[0.2em] block mb-2">
                        Data imprezy
                      </label>
                      <input
                        type="date"
                        value={formData.date}
                        onChange={(e) =>
                          setFormData((f) => ({ ...f, date: e.target.value }))
                        }
                        className="w-full bg-transparent border-b border-white/25 py-2 text-white text-sm focus:border-amber-400 focus:outline-none mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-white/45 text-xs uppercase tracking-[0.2em] block mb-2">
                        Liczba gości
                      </label>
                      <input
                        type="number"
                        min={10}
                        max={400}
                        value={formData.guests}
                        onChange={(e) => {
                          setFormData((f) => ({
                            ...f,
                            guests: e.target.value,
                          }));
                          if (errors.guests)
                            setErrors((prev) => ({ ...prev, guests: '' }));
                        }}
                        className={`w-full bg-transparent border-b py-2 text-white text-sm focus:outline-none mt-1 ${
                          errors.guests
                            ? 'border-red-500'
                            : 'border-white/25 focus:border-amber-400'
                        }`}
                      />
                      {errors.guests && (
                        <p className="text-red-400 text-xs mt-1">
                          {errors.guests}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-white/45 text-xs uppercase tracking-[0.2em] block mb-2">
                      Wiadomość
                    </label>
                    <textarea
                      rows={4}
                      value={formData.message}
                      onChange={(e) =>
                        setFormData((f) => ({ ...f, message: e.target.value }))
                      }
                      className="w-full bg-transparent border-b border-white/25 py-2 text-white text-sm focus:border-amber-400 focus:outline-none resize-none"
                      placeholder="Np. wesele 120 osób, plener, chcemy bar z pokazem flair i pakietem premium..."
                    />
                  </div>

                  <div className="pt-4 border-t border-white/10">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={agreedToTerms}
                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                        className="mt-1 w-4 h-4 text-amber-500 bg-transparent border border-amber-400/50 rounded focus:ring-amber-500 focus:ring-2"
                        required
                      />
                      <span className="text-white/70 text-xs leading-relaxed">
                        Wyrażam zgodę na przetwarzanie moich danych osobowych
                        przez ELIKSIR Bar Mobilny w celu przygotowania oferty i
                        kontaktu w sprawie wydarzenia. Zgodnie z art. 6 ust. 1
                        lit. a RODO. Administratorem danych jest ELIKSIR Bar
                        Mobilny. Dane będą przetwarzane do czasu wycofania
                        zgody. Przysługuje mi prawo dostępu, sprostowania,
                        usunięcia danych, ograniczenia przetwarzania, wniesienia
                        sprzeciwu oraz wniesienia skargi do Prezesa Urzędu
                        Ochrony Danych Osobowych.
                      </span>
                    </label>
                  </div>

                  <motion.button
                    type="submit"
                    className="w-full bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-semibold py-3.5 text-xs md:text-sm uppercase tracking-[0.2em] mt-4 hover:from-amber-300 hover:to-yellow-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    disabled={!agreedToTerms || isSubmitting}
                  >
                    {isSubmitting
                      ? 'Wysyłanie...'
                      : agreedToTerms
                      ? 'Wyślij zapytanie'
                      : 'Zaznacz zgodę aby wysłać'}
                  </motion.button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      </Container>
    </Section>
  );
}
