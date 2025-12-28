import { motion } from 'framer-motion';
import React, { useCallback, useState } from 'react';
import Calculator, { CalculatorSnapshot } from '../components/Calculator';
import Contact from '../components/Contact';
import FooterEliksir from '../components/FooterEliksir';
import Gallery from '../components/Gallery';
import HeroEliksir from '../components/HeroEliksir';
import { Container } from '../components/layout/Container';
import { Section } from '../components/layout/Section';
import PackageDetails from '../components/PackageDetails';
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
    { value: '500+', label: 'Obsłużonych imprez' },
    { value: '50k+', label: 'Zadowolonych gości' },
    { value: '6+', label: 'Lat doświadczenia' },
    { value: '100%', label: 'Satysfakcji' },
  ];

  return (
    <Section className="bg-gradient-to-b from-black to-neutral-950 relative">
      <Container>
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
      </Container>
    </Section>
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
      subtitle: 'Dla każdego gościa',
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
    <Section id="menu" className="bg-neutral-950 relative overflow-hidden">
      {/* Decorative */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-amber-500/5 to-transparent" />

      <Container>
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <p className="text-amber-400 uppercase tracking-[0.3em] text-sm mb-4">
            Nasza karta
          </p>
          <h2 className="font-playfair text-4xl md:text-5xl font-bold text-white mb-6">
            Menu Koktajli
          </h2>
          <div className="w-20 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto" />
        </motion.div>
      </Container>

      <Container>
        <div className="grid lg:grid-cols-3 gap-8">
          {categories.map((category, idx) => (
            <motion.div
              key={idx}
              className="group relative bg-gradient-to-b from-neutral-900 to-neutral-950 border border-white/5 hover:border-amber-400/30 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-amber-400/10"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.15, duration: 0.8 }}
            >
              {/* Card header */}
              <div className={`h-1 bg-gradient-to-r ${category.accent}`} />

              <div className="p-6">
                <h3 className="font-playfair text-xl font-bold text-white mb-2 text-center">
                  {category.title}
                </h3>
                <p className="text-white/40 text-sm mb-6 text-center">
                  {category.subtitle}
                </p>

                <div className="space-y-4">
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
      </Container>

      <Container className="mt-8">
        <motion.p
          className="text-center text-white/40 text-sm"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Menu dostosowujemy do Twoich preferencji i charakteru imprezy
        </motion.p>
      </Container>
    </Section>
  );
}

function Testimonials() {
  const testimonials = [
    {
      text: 'ELIKSIR uświetnił nasze wesele! Goście do dziś wspominają niesamowite koktajle i profesjonalną obsługę. Polecamy z całego serca!',
      author: 'Anna i Piotr',
      event: 'Wesele, Łódź',
    },
    {
      text: 'Współpraca na najwyższym poziomie. Bar LED zrobił niesamowite wrażenie, a barman świetnie bawił gości pokazami flair.',
      author: 'Marta K.',
      event: 'Urodziny 30',
    },
    {
      text: 'Profesjonalizm i elastyczność - dokładnie to czego szukaliśmy dla naszego eventu firmowego. Na pewno wrócimy!',
      author: 'Tomasz W.',
      event: 'Event korporacyjny',
    },
  ];

  return (
    <Section className="bg-black relative">
      <Container>
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-amber-400 uppercase tracking-[0.3em] text-sm mb-4">
            Opinie
          </p>
          <h2 className="font-playfair text-4xl md:text-5xl font-bold text-white mb-6">
            Co mówią klienci
          </h2>
          <div className="w-20 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto" />
        </motion.div>
      </Container>

      <Container>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((item, idx) => (
            <motion.div
              key={idx}
              className="bg-gradient-to-b from-neutral-900 to-neutral-950 border border-white/5 p-6 hover:border-amber-400/30 hover:-translate-y-2 hover:shadow-2xl hover:shadow-amber-400/10 transition-all duration-300"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.15 }}
            >
              <div className="text-amber-400 text-4xl font-serif mb-4 text-center">
                "
              </div>
              <p className="text-white/70 leading-relaxed mb-6 italic text-center">
                {item.text}
              </p>
              <div>
                <p className="text-white font-medium text-center">
                  {item.author}
                </p>
                <p className="text-white/40 text-sm text-center">
                  {item.event}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </Container>
    </Section>
  );
}

const Home: React.FC = () => {
  const [calculatorSnapshot, setCalculatorSnapshot] =
    useState<CalculatorSnapshot | null>(null);

  const handleCalculate = useCallback((snapshot: CalculatorSnapshot) => {
    setCalculatorSnapshot(snapshot);
  }, []);

  return (
    <main className="min-h-screen bg-black text-white antialiased w-full flex flex-col items-center relative">
      <HeroEliksir />
      <About />
      <Stats />
      <Menu />
      <PackageDetails />
      <Calculator onCalculate={handleCalculate} />
      <Gallery />
      <Testimonials />
      <Contact calculatorSnapshot={calculatorSnapshot} />
      <FooterEliksir />
    </main>
  );
};

export default Home;
