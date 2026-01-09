import { API } from '@/lib/config';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Container } from './layout/Container';
import { Section } from './layout/Section';

interface AboutContent {
  heading: string;
  description: string;
  image: string;
}

const About = () => {
  const [content, setContent] = useState<AboutContent>({
    heading: 'Kim jesteśmy?',
    description: 'Jesteśmy zespołem profesjonalnych barmanów z wieloletnim doświadczeniem w obsłudze wesel, eventów firmowych i imprez prywatnych. Specjalizujemy się w usłudze mobilnego baru koktajlowego premium, który realizujemy na terenie Bełchatowa, Kleszczowa, Łodzi oraz w całej Polsce.\n\nDostosowujemy się do Twoich potrzeb – od kameralnych przyjęć po duże wesela i wydarzenia korporacyjne. Oferujemy nie tylko autorskie koktajle i klasykę barmańską, ale również pełną oprawę wizualną mobilnego baru, dopasowaną do charakteru wydarzenia.\n\nELIKSIR to mobilny bar koktajlowy, który łączy profesjonalizm, estetykę i niezawodną obsługę – dzięki temu każda impreza staje się wyjątkowym doświadczeniem smakowym.',
    image: '/images/about.jpg',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch(API.contentSections);
        
        // Bezpieczny parse - backend może zwrócić HTML przy 429/500
        const raw = await response.text();
        let data;
        try {
          data = JSON.parse(raw);
        } catch {
          console.error('Invalid JSON from /content/sections:', raw.substring(0, 100));
          return; // Użyj fallback content
        }
        
        if (data.success) {
          const aboutSection = data.sections.find((s: any) => 
            s.sectionKey === 'about' || s.sectionKey === 'o-nas'
          );
          if (aboutSection) {
            setContent({
              heading: aboutSection.title || 'Kim jesteśmy?',
              description: aboutSection.content || content.description,
              image: aboutSection.imageUrl || '/images/about.jpg',
            });
          }
        }
      } catch (error) {
        console.error('Failed to fetch about content:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  if (loading) {
    return null; // Or skeleton
  }

  return (
    <Section id="o-nas" className="bg-gradient-to-b from-neutral-950 to-black relative">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center space-y-6"
        >
          <p className="text-amber-400 uppercase tracking-[0.3em] text-sm">
            O nas
          </p>
          <h2 className="font-playfair text-4xl md:text-5xl font-bold text-white">
            {content.heading}
          </h2>
          <p className="text-white/70 text-lg leading-relaxed whitespace-pre-line">
            {content.description}
          </p>
        </motion.div>
      </Container>
    </Section>
  );
};

export default About;
