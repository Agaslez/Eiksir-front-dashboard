import { Award, Calendar, CheckCircle, Clock, Mail, Phone, Users } from 'lucide-react';
import { trackEvent } from '../lib/error-monitoring';

const CTA = () => {
  const handleContactClick = (method: string) => {
    trackEvent('cta_contact_click', { method });
    
    switch(method) {
      case 'phone':
        window.location.href = 'tel:+48517616618';
        break;
      case 'email':
        window.location.href = 'mailto:eliksir@bar.pl';
        break;
      case 'calculator':
        document.getElementById('kalkulator')?.scrollIntoView({ behavior: 'smooth' });
        break;
    }
  };

  const benefits = [
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: 'Gwarancja jakości',
      description: 'Wszystkie drinki przygotowywane ze świeżych składników'
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Doświadczony zespół',
      description: 'Profesjonalni barmani z wieloletnim doświadczeniem'
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: 'Autorskie receptury',
      description: 'Unikalne drinki stworzone specjalnie dla Eliksir Bar'
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: 'Elastyczne godziny',
      description: 'Dostosowujemy się do harmonogramu Twojej imprezy'
    }
  ];

  return (
    <section id="kontakt" className="py-20 bg-gradient-to-b from-black to-amber-950/20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-amber-400 uppercase tracking-[0.3em] text-sm mb-4">
            Skontaktuj się z nami
          </p>
          <h2 className="font-playfair text-4xl md:text-5xl font-bold text-white mb-3">
            Zarezerwuj swój bar już dziś!
          </h2>
          <p className="text-white/60 text-sm md:text-base max-w-2xl mx-auto">
            Masz pytania? Chcesz omówić szczegóły swojej imprezy? 
            Jesteśmy do Twojej dyspozycji 7 dni w tygodniu.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column - Contact Methods */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-gray-900 to-black border border-amber-500/30 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-white mb-6">Szybki kontakt</h3>
              
              {/* Phone */}
              <button
                onClick={() => handleContactClick('phone')}
                className="w-full mb-4 p-6 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 hover:border-amber-500/50 rounded-xl flex items-center space-x-4 transition-all group"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full flex items-center justify-center">
                  <Phone className="w-6 h-6 text-black" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-white text-lg">Zadzwoń do nas</div>
                  <div className="text-amber-300 text-xl font-bold">517-616-618</div>
                  <div className="text-gray-400 text-sm">Odbiór 24/7</div>
                </div>
              </button>

              {/* Email */}
              <button
                onClick={() => handleContactClick('email')}
                className="w-full mb-4 p-6 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 hover:border-amber-500/50 rounded-xl flex items-center space-x-4 transition-all group"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full flex items-center justify-center">
                  <Mail className="w-6 h-6 text-black" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-white text-lg">Napisz email</div>
                  <div className="text-amber-300 text-lg">eliksir@bar.pl</div>
                  <div className="text-gray-400 text-sm">Odpowiadamy w 24h</div>
                </div>
              </button>

              {/* Calculator */}
              <button
                onClick={() => handleContactClick('calculator')}
                className="w-full p-6 bg-gradient-to-r from-amber-500/10 to-amber-600/10 hover:from-amber-500/20 hover:to-amber-600/20 border border-amber-500/30 hover:border-amber-500/50 rounded-xl flex items-center space-x-4 transition-all group"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-black" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-white text-lg">Oblicz wycenę</div>
                  <div className="text-amber-300">Użyj naszego kalkulatora</div>
                  <div className="text-gray-400 text-sm">Szybka, orientacyjna wycena</div>
                </div>
              </button>
            </div>

            {/* Benefits */}
            <div className="grid grid-cols-2 gap-4">
              {benefits.map((benefit, index) => (
                <div 
                  key={index}
                  className="bg-gray-900/50 border border-gray-800 rounded-xl p-4"
                >
                  <div className="text-amber-400 mb-2">{benefit.icon}</div>
                  <div className="font-bold text-white text-sm mb-1">{benefit.title}</div>
                  <div className="text-gray-400 text-xs">{benefit.description}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Contact Form */}
          <div className="bg-gradient-to-br from-gray-900 to-black border border-amber-500/30 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-white mb-6">Wyślij zapytanie</h3>
            <p className="text-gray-400 mb-8">
              Wypełnij formularz, a skontaktujemy się z Tobą w ciągu 24 godzin 
              z indywidualną wyceną i propozycją.
            </p>

            <form className="space-y-6" onSubmit={(e) => {
              e.preventDefault();
              trackEvent('contact_form_submit');
              alert('Dziękujemy za wiadomość! Skontaktujemy się z Tobą w ciągu 24 godzin.');
            }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Imię i nazwisko *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
                    placeholder="Jan Kowalski"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Telefon *
                  </label>
                  <input
                    type="tel"
                    required
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
                    placeholder="+48 123 456 789"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
                  placeholder="jan@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Typ imprezy
                </label>
                <select className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-amber-500">
                  <option value="">Wybierz typ imprezy</option>
                  <option value="wesele">Wesele</option>
                  <option value="firmowe">Event firmowy</option>
                  <option value="urodziny">Urodziny</option>
                  <option value="komunia">Komunia/Chrzest</option>
                  <option value="inne">Inne</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Przybliżona liczba gości
                  </label>
                  <input
                    type="number"
                    min="20"
                    max="200"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
                    placeholder="np. 80"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Data imprezy
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Wiadomość
                </label>
                <textarea
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
                  placeholder="Opisz szczegóły swojej imprezy, preferencje drinkowe, lokalizację..."
                ></textarea>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="privacy"
                  required
                  className="w-4 h-4 bg-gray-800 border-gray-700 rounded text-amber-500 focus:ring-amber-500 focus:ring-2"
                />
                <label htmlFor="privacy" className="ml-2 text-sm text-gray-400">
                  Akceptuję <a href="#" className="text-amber-400 hover:text-amber-300">politykę prywatności</a> i wyrażam zgodę na przetwarzanie danych
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold py-4 px-6 rounded-xl transition-all duration-300 text-lg"
              >
                Wyślij zapytanie o wycenę
              </button>

              <p className="text-center text-gray-500 text-sm">
                Lub zadzwoń od razu: <span className="text-amber-400 font-bold">517-616-618</span>
              </p>
            </form>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 pt-12 border-t border-amber-500/20">
          <div className="text-center">
            <h4 className="text-xl font-bold text-white mb-6">Dlaczego warto nam zaufać?</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-amber-400 mb-2">50+</div>
                <div className="text-gray-400">Zrealizowanych imprez</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-amber-400 mb-2">100%</div>
                <div className="text-gray-400">Zadowolonych klientów</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-amber-400 mb-2">24h</div>
                <div className="text-gray-400">Szybka odpowiedź</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-amber-400 mb-2">5★</div>
                <div className="text-gray-400">Średnia ocena</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;