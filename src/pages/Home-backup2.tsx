import { motion } from 'framer-motion';
import React, { useState } from 'react';
import Calculator, { CalculatorSnapshot } from '../components/Calculator';
import Contact from '../components/Contact';
import FooterEliksir from '../components/FooterEliksir';
import Gallery from '../components/Gallery';
import HeroEliksir from '../components/HeroEliksir';
import OfertaEliksir from '../components/OfertaEliksir';
import UslugiEventowe from '../components/UslugiEventowe';
import StatsEliksir from '../components/StatsEliksir';
import ResponsiveTest from '../components/ResponsiveTest';
import { ELIKSIR_STYLES } from '../lib/styles';

const Home = () => {
  const [calculatorSnapshot, setCalculatorSnapshot] =
    useState<CalculatorSnapshot | null>(null);

  return (
    <div className="bg-eliksir-dark text-white min-h-screen">
      {/* Hero Section */}
      <HeroEliksir />

      {/* Stats Section */}
      <StatsEliksir />

      {/* Services Section */}
      <section
        id="uslugi"
        className={`${ELIKSIR_STYLES.section} ${ELIKSIR_STYLES.bgGradient}`}
      >
        <div className={ELIKSIR_STYLES.container}>
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className={ELIKSIR_STYLES.caption}>Nasze Usługi</p>
            <h2 className={`${ELIKSIR_STYLES.heading2} mb-4`}>
              <span className={ELIKSIR_STYLES.textGradient}>
                Kompleksowa Obsługa
              </span>{' '}
              Eventów
            </h2>
            <div className={ELIKSIR_STYLES.dividerShort} />
            <p className={`${ELIKSIR_STYLES.body} max-w-2xl mx-auto`}>
              Oferujemy pełną obsługę każdego typu wydarzenia - od małych
              przyjęć po duże imprezy korporacyjne.
            </p>
          </motion.div>

          <UslugiEventowe />
        </div>
      </section>

      {/* Offer Section */}
      <section id="oferta" className={`${ELIKSIR_STYLES.section}`}>
        <div className={ELIKSIR_STYLES.container}>
          <OfertaEliksir />
        </div>
      </section>

      {/* Calculator Section */}
      <section
        id="kalkulator"
        className={`${ELIKSIR_STYLES.section} ${ELIKSIR_STYLES.bgGradient}`}
      >
        <div className={ELIKSIR_STYLES.container}>
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className={ELIKSIR_STYLES.caption}>Kalkulator Wyceny</p>
            <h2 className={`${ELIKSIR_STYLES.heading2} mb-4`}>
              <span className={ELIKSIR_STYLES.textGradient}>
                Oszacuj Koszty
              </span>{' '}
              Swojego Wydarzenia
            </h2>
            <div className={ELIKSIR_STYLES.dividerShort} />
            <p className={`${ELIKSIR_STYLES.body} max-w-2xl mx-auto`}>
              Wprowadź parametry swojego eventu, a my przygotujemy dla Ciebie
              szczegółową wycenę.
            </p>
          </motion.div>

          <Calculator onSnapshotChange={setCalculatorSnapshot} />
        </div>
      </section>

      {/* Gallery Section */}
      <section id="galeria" className={`${ELIKSIR_STYLES.section}`}>
        <div className={ELIKSIR_STYLES.container}>
          <Gallery />
        </div>
      </section>

      {/* Contact Section */}
      <section
        id="kontakt"
        className={`${ELIKSIR_STYLES.section} ${ELIKSIR_STYLES.bgGradient}`}
      >
        <div className={ELIKSIR_STYLES.container}>
          <Contact calculatorSnapshot={calculatorSnapshot} />
        </div>
      </section>

      {/* Footer */}
      <FooterEliksir />
    </div>
  );
};

export default Home;
