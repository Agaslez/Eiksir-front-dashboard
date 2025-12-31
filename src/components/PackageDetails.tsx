// src/components/PackageDetails.tsx - UPROSZCZONA WERSJA
import { motion } from 'framer-motion';
import { Briefcase, Cake, Crown, Sparkles, Users, Wine } from 'lucide-react';
import { OFFERS } from '../lib/content';
import { Container } from './layout/Container';
import { Section } from './layout/Section';

const PACKAGE_ICONS = {
  basic: Wine,
  premium: Sparkles,
  exclusive: Crown,
  kids: Cake,
  family: Users,
  business: Briefcase,
};

const PACKAGE_DETAILS = {
  basic: {
    subtitle: 'Podstawowy pakiet dla kameralnych imprez',
    highlights: [
      '20-50 osób',
      '5 godzin',
      '3 koktajle/osobę',
      '6 signature drinków',
    ],
    idealFor: ['Kameralne przyjęcia', 'Mniejsze wesela', 'Urodziny'],
  },
  premium: {
    subtitle: 'Najpopularniejszy wybór na wesela',
    highlights: ['50-80 osób', '6 godzin', '3.5 koktajle/osobę', 'Shot bar'],
    idealFor: ['Wesela', 'Duże imprezy', 'Eventy z pokazami'],
    popular: true,
  },
  exclusive: {
    subtitle: 'Ekskluzywny pakiet z efektem WOW',
    highlights: [
      '80-120 osób',
      '7 godzin',
      '4 koktajle/osobę',
      'Personalizacja baru',
    ],
    idealFor: ['Luksusowe wesela', 'Gale', 'VIP eventy'],
  },
  kids: {
    subtitle: 'Bezalkoholowe przyjęcia dla dzieci',
    highlights: ['15-40 dzieci', '3 godziny', 'Mocktaile', 'Stacja lemoniad'],
    idealFor: ['Urodziny dzieci', 'Komunie', 'Festyny szkolne'],
  },
  family: {
    subtitle: 'Łagodne miksy dla rodzin i seniorów',
    highlights: ['25-60 osób', '4 godziny', '2.5 koktajle/osobę', 'Więcej 0%'],
    idealFor: ['Rocznice', 'Komunie', 'Imprezy rodzinne'],
  },
  business: {
    subtitle: 'Profesjonalny serwis dla firm',
    highlights: [
      '30-100 osób',
      '4 godziny',
      '2.5 koktajle/osobę',
      'Dopasowanie karty',
    ],
    idealFor: ['Eventy firmowe', 'Targi', 'Konferencje', 'Gale'],
  },
};

export default function PackageDetails() {
  return (
    <Section className="bg-gradient-to-b from-black to-neutral-950">
      {/* TYTUŁ W KONTENERZE */}
      <Container>
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <p className="text-amber-400 uppercase tracking-[0.3em] text-sm mb-4">
            Nasze pakiety
          </p>
          <h2 className="font-playfair text-5xl md:text-6xl font-bold text-white mb-6">
            Wybierz idealny pakiet
          </h2>
          <div className="w-20 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto" />
        </motion.div>
      </Container>

      {/* KARTY W KONTENERZE */}
      <Container>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {Object.values(OFFERS).map((offer) => {
            const details =
              PACKAGE_DETAILS[offer.id as keyof typeof PACKAGE_DETAILS];
            const Icon = PACKAGE_ICONS[offer.id as keyof typeof PACKAGE_ICONS];

            if (!details) return null;

            return (
              <motion.div
                key={offer.id}
                className="group relative bg-gradient-to-b from-neutral-900 to-neutral-950 border border-white/5 hover:border-amber-400/30 transition-all duration-500 h-full"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                {/* Popular badge */}
                {details.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-amber-500 to-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-full">
                    NAJPOPULARNIEJSZY
                  </div>
                )}

                <div className="p-6">
                  {/* Icon & Title */}
                  <div className="text-center mb-4">
                    <div className="p-2 bg-gradient-to-br from-amber-500/20 to-amber-500/5 rounded-lg inline-flex items-center justify-center mb-3">
                      <Icon className="w-6 h-6 text-amber-400" />
                    </div>
                    <h3 className="font-playfair text-xl font-bold text-white">
                      {offer.name}
                    </h3>
                    <p className="text-amber-300 text-sm mt-1">
                      {details.subtitle}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="mb-4 text-center">
                    <p className="text-white/50 text-xs uppercase tracking-[0.2em]">
                      od
                    </p>
                    <p className="font-playfair text-2xl font-bold bg-gradient-to-r from-amber-200 to-yellow-400 bg-clip-text text-transparent">
                      {offer.price.toLocaleString('pl-PL')} zł
                    </p>
                  </div>

                  {/* Highlights */}
                  <div className="mb-4">
                    <p className="text-white/40 text-xs uppercase tracking-[0.2em] mb-2 text-center">
                      W pakiecie:
                    </p>
                    <ul className="text-white/70 text-sm space-y-1">
                      {details.highlights.map((item, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="text-amber-400 mr-2">✓</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Ideal for */}
                  <div>
                    <p className="text-white/40 text-xs uppercase tracking-[0.2em] mb-2 text-center">
                      Idealny na:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {details.idealFor.map((item, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-white/5 text-white/60 text-xs rounded"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </Container>

      {/* DODATKI - TYTUŁ W KONTENERZE */}
      <Container>
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-amber-400 uppercase tracking-[0.3em] text-sm mb-4">
            Dodatki
          </p>
          <h3 className="font-playfair text-3xl md:text-4xl font-bold text-white mb-6">
            Uzupełnij swój pakiet
          </h3>
          <div className="w-20 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto" />
        </motion.div>
      </Container>

      {/* KARTY DODATKÓW W KONTENERZE */}
      <Container>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[
            {
              name: 'Fontanna czekolady',
              desc: 'Belgijska czekolada z owocami',
              price: 'od 600 zł',
            },
            {
              name: 'Stacja lemoniad',
              desc: '3 smaki, dystrybutory 24L',
              price: 'od 300 zł',
            },
            {
              name: 'KEG piwa',
              desc: '30L z chłodzeniem i obsługą',
              price: 'od 500 zł',
            },
            {
              name: 'Hockery 6 szt.',
              desc: 'Eleganckie stołki barowe',
              price: '200 zł',
            },
            {
              name: 'Oświetlenie LED z personalizacją',
              desc: "Dekoracja świetlna z napisem (np. '30 lat', nazwa pary młodej, logo firmy)",
              price: 'od 500 zł',
            },
          ].map((addon, idx) => (
            <motion.div
              key={idx}
              className="bg-gradient-to-b from-neutral-900 to-neutral-950 border border-white/5 p-6"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
            >
              <h4 className="text-white font-playfair text-lg font-bold mb-2 text-center">
                {addon.name}
              </h4>
              <p className="text-white/60 text-sm mb-3 text-center">
                {addon.desc}
              </p>
              <p className="text-amber-400 font-bold text-center">
                {addon.price}
              </p>
            </motion.div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
