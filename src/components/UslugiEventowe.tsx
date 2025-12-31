import { Calendar, Users, Wine, Music, Sparkles, Award } from 'lucide-react';
import { motion } from 'framer-motion';

const services = [
  {
    icon: Wine,
    title: 'Bar Koktajlowy',
    description:
      'Profesjonalny bar z barmanami przygotowujÄ…cymi koktajle na ĹĽywo',
    features: [
      '2 barmanĂłw',
      '50+ rodzajĂłw drinkĂłw',
      'SprzÄ™t profesjonalny',
      'Dekoracje',
    ],
  },
  {
    icon: Users,
    title: 'ObsĹ‚uga GoĹ›ci',
    description:
      'Kompleksowa obsĹ‚uga od przyjÄ™cia do poĹĽegnania ostatniego goĹ›cia',
    features: [
      'PrzyjÄ™cie drinkĂłw',
      'Serwis stoĹ‚owy',
      'Czyszczenie',
      'Koordynacja',
    ],
  },
  {
    icon: Music,
    title: 'Oprawa Muzyczna',
    description:
      'Dostosowana playlista lub DJ zapewniajÄ…cy idealnÄ… atmosferÄ™',
    features: [
      'Playlista tematyczna',
      'SprzÄ™t nagĹ‚oĹ›nieniowy',
      'DJ',
      'ĹšwiatĹ‚a',
    ],
  },
  {
    icon: Sparkles,
    title: 'Dekoracje',
    description:
      'Stylizacja przestrzeni zgodnie z tematykÄ… i kolorystykÄ… wydarzenia',
    features: [
      'OĹ›wietlenie',
      'Kwiaty',
      'Elementy tematyczne',
      'Stoisko barmaĹ„skie',
    ],
  },
  {
    icon: Calendar,
    title: 'Planowanie',
    description:
      'PeĹ‚ne wsparcie w organizacji i koordynacji kaĹĽdego szczegĂłĹ‚u',
    features: ['Harmonogram', 'Lista goĹ›ci', 'Menu dopasowane', 'Logistyka'],
  },
  {
    icon: Award,
    title: 'Premium Experience',
    description:
      'Exclusive service with premium ingredients and personalized attention',
    features: [
      'Premium alkohole',
      'Personal barman',
      'Gold flakes cocktails',
      'VIP treatment',
    ],
  },
];

const packages = [
  {
    name: 'Basic',
    price: 'od 1500 zĹ‚',
    description: 'Idealne na mniejsze spotkania',
    includes: ['1 barman', '20 drinkĂłw', 'Podstawowy sprzÄ™t', '4 godziny'],
    color: 'from-gray-600 to-gray-800',
  },
  {
    name: 'Standard',
    price: 'od 2500 zĹ‚',
    description: 'Najpopularniejszy pakiet na eventy',
    includes: [
      '2 barmanĂłw',
      '40 drinkĂłw',
      'PeĹ‚ny sprzÄ™t',
      '6 godzin',
      'Dekoracje',
    ],
    color: 'from-eliksir-gold to-eliksir-gold-dark',
  },
  {
    name: 'Premium',
    price: 'od 4000 zĹ‚',
    description: 'Kompleksowa obsĹ‚uga premium',
    includes: [
      '3 barmanĂłw',
      'Nieograniczone drinki',
      'Premium sprzÄ™t',
      '8 godzin',
      'Full decor',
      'DJ',
    ],
    color: 'from-purple-600 to-purple-800',
  },
  {
    name: 'Custom',
    price: 'Indywidualna',
    description: 'Spersonalizowana oferta',
    includes: [
      'Wszystko dopasowane',
      'Premium ingredients',
      'Personal planning',
      'Full production',
    ],
    color: 'from-blue-600 to-cyan-600',
  },
];

export default function UslugiEventowe() {
  return (
    <section id="uslugi" className="section-padding bg-eliksir-dark">
      <div className="container-padding">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="section-title">
            Nasze <span className="text-gradient-gold">UsĹ‚ugi</span>
          </h2>
          <p className="section-subtitle">
            Oferujemy kompleksowÄ… obsĹ‚ugÄ™ eventĂłw kaĹĽdego typu. Od maĹ‚ych
            przyjÄ™Ä‡ po duĹĽe wydarzenia korporacyjne.
          </p>
        </motion.div>

        {/* UsĹ‚ugi */}
        <div className="card-grid-3 mb-20">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="eliksir-card eliksir-card-hover"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-gradient-to-br from-eliksir-gold/20 to-transparent rounded-lg">
                    <Icon className="w-8 h-8 text-eliksir-gold" />
                  </div>
                  <h3 className="text-xl font-bold text-gradient-gold">
                    {service.title}
                  </h3>
                </div>

                <p className="text-white/70 mb-6">{service.description}</p>

                <div className="space-y-2">
                  {service.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="w-1.5 h-1.5 bg-eliksir-gold rounded-full"></span>
                      <span className="text-sm text-white/80">{feature}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Pakiety */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h3 className="text-3xl font-bold text-center mb-12">
            <span className="text-gradient-gold">Pakiety</span> Eventowe
          </h3>

          <div className="card-grid-4">
            {packages.map((pkg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`bg-gradient-to-b ${pkg.color} rounded-xl p-6 text-center relative overflow-hidden`}
              >
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="relative z-10">
                  <h4 className="text-2xl font-bold mb-2">{pkg.name}</h4>
                  <div className="text-3xl font-bold mb-4">{pkg.price}</div>
                  <p className="text-white/90 mb-6">{pkg.description}</p>

                  <div className="space-y-3 mb-8">
                    {pkg.includes.map((item, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="text-eliksir-gold">âś“</span>
                        <span className="text-sm">{item}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    className="w-full bg-white text-black font-semibold py-3 rounded-lg hover:bg-gray-100 transition-colors"
                    onClick={() => {
                      const element = document.getElementById('kontakt');
                      element?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    Wybierz pakiet
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Dodatkowe informacje */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card p-8 md:p-12"
        >
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold text-gradient-gold mb-4">
                Dlaczego warto wybraÄ‡ Eliksir?
              </h3>
              <ul className="space-y-4">
                {[
                  'Profesjonalni barmani z wieloletnim doĹ›wiadczeniem',
                  'NajwyĹĽszej jakoĹ›ci alkohole premium',
                  'Elastyczne podejĹ›cie do kaĹĽdego klienta',
                  'Kompleksowa obsĹ‚uga od A do Z',
                  'Ubezpieczenie OC na wypadek zdarzeĹ„',
                  'Pozytywne opinie setek zadowolonych klientĂłw',
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-eliksir-gold mt-1">âś¦</span>
                    <span className="text-white/80">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="text-center">
              <div className="inline-block p-8 bg-gradient-to-br from-eliksir-gold/10 to-transparent rounded-2xl">
                <div className="text-5xl font-bold text-gradient-gold mb-2">
                  98%
                </div>
                <div className="text-white/70">Zadowolonych klientĂłw</div>
              </div>

              <div className="mt-8 space-y-4">
                <div className="flex items-center justify-center gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-eliksir-gold">
                      500+
                    </div>
                    <div className="text-sm text-white/60">WydarzeĹ„</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-eliksir-gold">
                      50+
                    </div>
                    <div className="text-sm text-white/60">Miast</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-eliksir-gold">
                      24/7
                    </div>
                    <div className="text-sm text-white/60">Wsparcie</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
