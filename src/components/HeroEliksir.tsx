import { useLogger } from '@/hooks/useLogger';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { ELIKSIR_STYLES } from '../lib/styles';
import { Container } from './layout/Container';
import { Section } from './layout/Section';

const HeroEliksir = () => {
  useLogger('HeroEliksir');
  const ref = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <Section
      ref={ref}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background layers with parallax */}
      <motion.div className="absolute inset-0" style={{ y }}>
        {/* Oryginalny drink z gradientami */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=1920&q=80&auto=format&fit=crop')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-black/70" />
      </motion.div>

      {/* Decorative elements */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-eliksir-gold/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-eliksir-gold/5 rounded-full blur-3xl" />

      {/* Content w kontenerze */}
      <Container className="relative z-10">
        <motion.div
          className="w-full flex flex-col items-center text-center"
          style={{ opacity }}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          <p className={`${ELIKSIR_STYLES.caption} mb-6`}>
            Mobilny Bar Koktajlowy Premium
          </p>

          <h1 className="font-playfair text-8xl md:text-9xl lg:text-10xl font-bold mb-6">
            <span className="bg-gradient-to-r from-eliksir-gold via-eliksir-goldLight to-eliksir-gold bg-clip-text text-transparent">
              ELIKSIR
            </span>
          </h1>

          <div className={ELIKSIR_STYLES.dividerShort} />

          <p className={`${ELIKSIR_STYLES.body} max-w-2xl mx-auto mb-10`}>
            Tworzymy wyjątkowe doświadczenia koktajlowe na każdą okazję.
            <span className="text-white/90">
              {' '}
              Wesela, eventy korporacyjne, imprezy prywatne
            </span>{' '}
            — obsłużymy z niezrównaną klasą i profesjonalizmem.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.a
              href="#kalkulator"
              className={ELIKSIR_STYLES.buttonPrimary}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Otrzymaj wycenę
            </motion.a>

            <motion.a
              href="#menu"
              className={ELIKSIR_STYLES.buttonSecondary}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Odkryj menu
            </motion.a>
          </div>
        </motion.div>
      </Container>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
      >
        <div className="w-px h-16 bg-gradient-to-b from-eliksir-gold/50 to-transparent" />
      </motion.div>
    </Section>
  );
};

export default HeroEliksir;