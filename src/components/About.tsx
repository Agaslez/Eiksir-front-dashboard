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
    description: 'Jesteśmy zespołem profesjonalnych barmanów z wieloletnim doświadczeniem w obsłudze najróżniejszych wydarzeń. Naszą specjalnością jest mobilny bar koktajlowy na zamówienie – pełna elastyczność, profesjonalizm i pasja w każdym drinku.\n\nDostosowujemy się do Twoich potrzeb: od kameralnych przyjęć po wielkie wesela. Oferujemy nie tylko doskonałe koktajle, ale również pełną oprawę wizualną baru, która idealnie wpisuje się w charakter Twojego wydarzenia. Z nami każda impreza staje się wyjątkową, smakową podróżą!',
    image: '/images/about.jpg',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'https://eliksir-backend-front-dashboard.onrender.com';
        const baseUrl = API_URL.endsWith('/api') ? API_URL : `${API_URL}/api`;
        
        const response = await fetch(`${baseUrl}/content/sections`);
        const data = await response.json();
        
        if (data.success) {
          const aboutSection = data.sections.find((s: any) => s.id === 'about');
          if (aboutSection?.content) {
            setContent(aboutSection.content);
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
