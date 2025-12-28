import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Section } from './layout/Section';

interface GalleryImage {
  id: number;
  url: string;
  title: string;
  category: string;
}

export default function HorizontalGallery() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const API_URL = import.meta.env.VITE_API_URL || 'https://eliksir-backend.onrender.com';

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const response = await fetch(`${API_URL}/api/content/images`);
      if (response.ok) {
        const data = await response.json();
        console.log('HorizontalGallery fetched images:', data.length);
        setImages(data);
      }
    } catch (error) {
      console.error('Failed to fetch images:', error);
    }
  };

  // Don't render if no images
  if (images.length === 0) {
    return null;
  }

  return (
    <Section className="bg-black py-6 overflow-hidden">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="relative"
      >
        {/* Gradient overlays for smooth edges */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />

        {/* Scrolling container */}
        <div className="flex gap-3 animate-scroll hover:pause-animation">
          {/* Duplicate images for infinite scroll effect */}
          {[...images, ...images].map((image, index) => (
            <motion.div
              key={`${image.id}-${index}`}
              className="flex-shrink-0 w-48 h-32 rounded-lg overflow-hidden border border-amber-500/20 hover:border-amber-500/40 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
            >
              <img
                src={image.url}
                alt={image.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </motion.div>
          ))}
        </div>
      </motion.div>

      <style>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-scroll {
          animation: scroll 40s linear infinite;
        }

        .pause-animation:hover {
          animation-play-state: paused;
        }
      `}</style>
    </Section>
  );
}
