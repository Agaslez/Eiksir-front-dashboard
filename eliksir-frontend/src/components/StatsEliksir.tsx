import { motion } from 'framer-motion';
import { Container } from './layout/Container';
import { Section } from './layout/Section';

const StatsEliksir = () => {
  const stats = [
    { value: '500+', label: 'Obsłużonych imprez' },
    { value: '50k+', label: 'Zadowolonych gości' },
    { value: '6+', label: 'Lat doświadczenia' },
    { value: '100%', label: 'Satysfakcji' },
  ];

  return (
    <Section className="bg-gradient-to-b from-eliksir-dark to-black">
      <Container>
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
          }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              className="text-center"
              variants={{
                hidden: { opacity: 0, y: 60 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
              }}
            >
              <div className="text-5xl md:text-6xl font-bold mb-2">
                <span className="bg-gradient-to-r from-eliksir-gold via-eliksir-goldLight to-eliksir-gold bg-clip-text text-transparent">
                  {stat.value}
                </span>
              </div>
              <div className="text-lg text-white/70">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </Section>
  );
};

export default StatsEliksir;
