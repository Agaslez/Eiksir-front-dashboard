import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Container } from './layout/Container';
import { Section } from './layout/Section';

// Ensure API_URL always ends with /api
const baseUrl = import.meta.env.VITE_API_URL || 'https://eliksir-backend-front-dashboard.onrender.com';
const API_URL = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;

// Helper function to handle both Cloudinary and local URLs
const getImageUrl = (url: string) => {
  if (!url) return '';
  // If already absolute URL (Cloudinary), return as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  // Otherwise, prepend backend API URL
  return `${API_URL.replace('/api', '')}${url}`;
};

interface GalleryImage {
  id: number;
  url: string;
  title: string;
  category: string;
  displayOrder?: number;
  isActive?: boolean;
}

export default function HorizontalGallery() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const baseUrl = import.meta.env.VITE_API_URL || 'https://eliksir-backend-front-dashboard.onrender.com';
  const API_URL = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const response = await fetch(`${API_URL}/content/gallery/public?category=wszystkie`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.images)) {
          const activeImages = data.images
            .filter((img: GalleryImage) => img.isActive !== false)
            .sort((a: GalleryImage, b: GalleryImage) => 
              (a.displayOrder || 0) - (b.displayOrder || 0)
            );
          console.log('HorizontalGallery fetched images:', activeImages.length);
          setImages(activeImages);
        }
      }
    } catch (error) {
      console.error('Failed to fetch images:', error);
    }
  };

  // Don't render anything if no images yet
  if (images.length === 0) {
    return null;
  }

  return (
    <Section className="bg-black py-3 md:py-4">
      <Container className="!px-0 !max-w-none">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="relative overflow-hidden"
        >
          {/* Gradient overlays for smooth edges */}
          <div className="absolute left-0 top-0 bottom-0 w-16 md:w-24 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-16 md:w-24 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />

          {/* Scrolling container */}
          <div className="flex gap-2 md:gap-3 animate-scroll hover:pause-animation">
          {/* Duplicate images for infinite scroll effect */}
          {[...images, ...images].map((image, index) => (
            <motion.div
              key={`${image.id}-${index}`}
              className="flex-shrink-0 w-40 h-28 sm:w-44 sm:h-30 md:w-48 md:h-32 rounded-lg overflow-hidden border border-amber-500/20 hover:border-amber-500/40 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
            >
              <img
                src={getImageUrl(image.url)}
                alt={image.title}
                className="w-full h-full object-cover"
              />
            </motion.div>
          ))}
        </div>
      </motion.div>
      </Container>

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
