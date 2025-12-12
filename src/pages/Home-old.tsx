import { motion } from 'framer-motion';
import React, { useState } from 'react';
import Calculator, { CalculatorSnapshot } from '../components/Calculator';
import Contact from '../components/Contact';
import FooterEliksir from '../components/FooterEliksir';
import Gallery from '../components/Gallery';
import HeroEliksir from '../components/HeroEliksir';
import OfertaEliksir from '../components/OfertaEliksir';
import UslugiEventowe from '../components/UslugiEventowe';
import { COCKTAILS } from '../lib/content';

const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

function Stats() {
  const stats = [
    { value: '500+', label: 'ObsĹ‚uĹĽonych imprez' },
    { value: '50k+', label: 'Zadowolonych goĹ›ci' },
    { value: '6+', label: 'Lat doĹ›wiadczenia' },
    { value: '100%', label: 'Satysfakcji' },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-black to-neutral-950">
      <div className="container mx-auto px-6">
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {stats.map((stat, idx) => (
            <motion.div key={idx} className="text-center" variants={fadeInUp}>
              <div className="font-playfair text-4xl md:text-5xl font-bold bg-gradient-to-r from-amber-200 to-yellow-400 bg-clip-text text-transparent mb-2">
                {stat.value}
              </div>
              <div className="text-white/50 text-sm uppercase tracking-wider">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function Menu() {
  const alcoholic = COCKTAILS.filter((c) => c.category === 'alcoholic');
  const nonAlcoholic = COCKTAILS.filter((c) => c.category === 'non-alcoholic');
  const shots = COCKTAILS.filter((c) => c.category === 'shot');

  const categories = [
    {
      title: 'Koktajle Signature',
      subtitle: 'Klasyka w perfekcyjnym wykonaniu',
      items: alcoholic,
      accent: 'from-amber-400 to-yellow-500',
    },
    {
      title: 'Bezalkoholowe',
      subtitle: 'Dla kaĹĽdego goĹ›cia',
      items: nonAlcoholic,
      accent: 'from-emerald-400 to-teal-500',
    },
    {
      title: 'Shot Bar',
      subtitle: 'Energia imprezy',
      items: shots,
      accent: 'from-rose-400 to-pink-500',
    },
  ];

  return (
    <section
      id="menu"
      className="py-32 bg-neutral-950 relative overflow-hidden"
    >
      {/* Decorative */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-amber-500/5 to-transparent" />

      <div className="container mx-auto px-6 relative">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <p className="text-amber-400 uppercase tracking-[0.3em] text-sm mb-4">
            Nasza karta
          </p>
          <h2 className="font-playfair text-5xl md:text-6xl font-bold text-white mb-6">
            Menu Koktajli
          </h2>
          <div className="w-20 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto" />
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {categories.map((category, idx) => (
            <motion.div
              key={idx}
              className="group relative bg-gradient-to-b from-neutral-900 to-neutral-950 border border-white/5 hover:border-amber-400/30 transition-all duration-500"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.15, duration: 0.8 }}
            >
              {/* Card header */}
              <div className={`h-1 bg-gradient-to-r ${category.accent}`} />

              <div className="p-8">
                <h3 className="font-playfair text-2xl font-bold text-white mb-2">
                  {category.title}
                </h3>
                <p className="text-white/40 text-sm mb-8">
                  {category.subtitle}
                </p>

                <div className="space-y-6">
                  {category.items.map((cocktail, cidx) => (
                    <div key={cidx} className="group/item">
                      <div className="flex justify-between items-baseline mb-1">
                        <h4 className="text-white font-medium group-hover/item:text-amber-300 transition-colors">
                          {cocktail.name}
                        </h4>
                        <div className="flex-1 mx-3 border-b border-dotted border-white/10" />
                      </div>
                      <p className="text-white/40 text-sm leading-relaxed">
                        {cocktail.ingredients}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.p
          className="text-center text-white/40 mt-12 text-sm"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Menu dostosowujemy do Twoich preferencji i charakteru imprezy
        </motion.p>
      </div>
    </section>
  );
}

function Testimonials() {
  const testimonials = [
    {
      text: 'ELIKSIR uĹ›wietniĹ‚ nasze wesele! GoĹ›cie do dziĹ› wspominajÄ… niesamowite koktajle i profesjonalnÄ… obsĹ‚ugÄ™. Polecamy z caĹ‚ego serca!',
      author: 'Anna i Piotr',
      event: 'Wesele, ĹĂłdĹş',
    },
    {
      text: 'WspĂłĹ‚praca na najwyĹĽszym poziomie. Bar LED zrobiĹ‚ niesamowite wraĹĽenie, a barman Ĺ›wietnie bawiĹ‚ goĹ›ci pokazami flair.',
      author: 'Marta K.',
      event: 'Urodziny 30',
    },
    {
      text: 'Profesjonalizm i elastycznoĹ›Ä‡ - dokĹ‚adnie to czego szukaliĹ›my dla naszego eventu firmowego. Na pewno wrĂłcimy!',
      author: 'Tomasz W.',
      event: 'Event korporacyjny',
    },
  ];

  return (
    <section className="py-32 bg-black">
      <div className="container mx-auto px-6">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-amber-400 uppercase tracking-[0.3em] text-sm mb-4">
            Opinie
          </p>
          <h2 className="font-playfair text-5xl md:text-6xl font-bold text-white mb-6">
            Co mĂłwiÄ… klienci
          </h2>
          <div className="w-20 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto" />
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((item, idx) => (
            <motion.div
              key={idx}
              className="bg-gradient-to-b from-neutral-900 to-neutral-950 border border-white/5 p-8"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.15 }}
            >
              <div className="text-amber-400 text-4xl font-serif mb-4">"</div>
              <p className="text-white/70 leading-relaxed mb-6 italic">
                {item.text}
              </p>
              <div>
                <p className="text-white font-medium">{item.author}</p>
                <p className="text-white/40 text-sm">{item.event}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

const Home: React.FC = () => {
  const [calculatorSnapshot, setCalculatorSnapshot] =
    useState<CalculatorSnapshot | null>(null);

  const handleCalculate = (snapshot: CalculatorSnapshot) => {
    setCalculatorSnapshot(snapshot);
  };

  return (
    <div className="min-h-screen bg-black text-white antialiased">
      <HeroEliksir />
      <Stats />
      <Menu />

      <section id="oferta" className="py-32 bg-black relative overflow-hidden">
        <div className="container mx-auto px-4">
          <OfertaEliksir />
        </div>
      </section>

      <section id="uslugi" className="py-32 bg-neutral-950">
        <div className="container mx-auto px-4">
          <UslugiEventowe />
        </div>
      </section>

      <section id="kalkulator" className="py-32 bg-black">
        <div className="container mx-auto px-4">
          <Calculator onCalculate={handleCalculate} />
        </div>
      </section>

      <section id="galeria" className="py-32 bg-neutral-950">
        <div className="container mx-auto px-4">
          <Gallery />
        </div>
      </section>

      <Testimonials />

      <Contact calculatorSnapshot={calculatorSnapshot} />
      <FooterEliksir />
    </div>
  );
};

export default Home;
