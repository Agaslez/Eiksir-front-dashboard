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
    description: 'Jesteśmy zespołem profesjonalnych barmanów z pasją do tworzenia wyjątkowych koktajli.',
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
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-6"
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

          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="aspect-square rounded-lg overflow-hidden border-2 border-amber-500/20">
              <img
                src={content.image}
                alt={content.heading}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback image
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800';
                }}
              />
            </div>
            {/* Decorative element */}
            <div className="absolute -bottom-4 -right-4 w-full h-full border-2 border-amber-500/10 rounded-lg -z-10" />
          </motion.div>
        </div>
      </Container>
    </Section>
  );
};

export default About;
