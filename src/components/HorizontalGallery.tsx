import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useComponentHealth } from '../lib/component-health-monitor';
import { Container } from './layout/Container';
import { Section } from './layout/Section';

// Ensure API_URL always ends with /api
const baseUrl = import.meta.env.VITE_API_URL || 'https://eliksir-backend-front-dashboard.onrender.com';
const API_URL = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;

// Helper function to handle both Cloudinary and local URLs
const getImageUrl = (url: string) => {
  if (!url) return '';
  
  // If Cloudinary URL, add optimization parameters
  if (url.includes('cloudinary.com')) {
    // Insert transformation parameters before /upload/
    // w_400 = width 400px, h_300 = height 300px, c_fill = crop to fill, q_auto = auto quality, f_auto = auto format
    return url.replace('/upload/', '/upload/w_400,h_300,c_fill,q_auto,f_auto/');
  }
  
  // If already absolute URL (non-Cloudinary), return as is
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
  useComponentHealth('HorizontalGallery');
  
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const baseUrl = import.meta.env.VITE_API_URL || 'https://eliksir-backend-front-dashboard.onrender.com';
  const API_URL = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Retry logic for cold starts (Render.com can take 30s to wake up)
      let response;
      let lastError;
      const maxRetries = 3;
      
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout
          
          response = await fetch(`${API_URL}/content/gallery/public?category=wszystkie`, {
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          
          if (response.ok) {
            break; // Success, exit retry loop
          }
          
          lastError = `HTTP ${response.status}`;
          
          if (attempt < maxRetries) {
            // Wait before retry (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, attempt * 2000));
          }
        } catch (err) {
          lastError = err instanceof Error ? err.message : 'Network error';
          
          if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, attempt * 2000));
          }
        }
      }
      
      if (!response || !response.ok) {
        throw new Error(lastError || 'Failed after retries');
      }
      
      const data = await response.json();
      
      if (data.success && Array.isArray(data.images)) {
        const sortedImages = data.images
          .filter((img: GalleryImage) => img.url)
          .sort((a: GalleryImage, b: GalleryImage) => 
            (a.displayOrder || 0) - (b.displayOrder || 0)
          );
        
        setImages(sortedImages);
        
        // Report if no images found
        if (sortedImages.length === 0) {
          const monitor = (await import('@/lib/global-error-monitor')).getErrorMonitor();
          monitor?.captureError({
            message: 'HorizontalGallery: No active images found in database',
            type: 'manual',
            context: {
              endpoint: `${API_URL}/content/gallery/public`,
              userAction: 'Loading horizontal gallery',
              note: 'Check if images exist with isActive=true in ImageGalleryEnhanced',
            },
          });
        }
      } else {
        const errorMsg = `Invalid response format: ${JSON.stringify(data).substring(0, 100)}`;
        setError(errorMsg);
        
        const monitor = (await import('@/lib/global-error-monitor')).getErrorMonitor();
        monitor?.captureError({
          message: `HorizontalGallery: ${errorMsg}`,
          type: 'fetch',
          context: { endpoint: `${API_URL}/content/gallery/public`, response: data },
        });
      }
      
      setIsLoading(false);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to fetch images:', error);
      setError(`Network error: ${errorMsg}`);
      setIsLoading(false);
      
      // Report to Error Monitor
      const monitor = (await import('@/lib/global-error-monitor')).getErrorMonitor();
      monitor?.captureError({
        message: `HorizontalGallery fetch failed: ${errorMsg}`,
        type: 'network',
        context: {
          url: `${API_URL}/content/gallery/public`,
          userAction: 'Loading horizontal gallery',
          error: String(error),
        },
      });
    }
  };

  // Show loading state with info about potential cold start
  if (isLoading) {
    return (
      <Section className="bg-black py-3 md:py-4">
        <Container>
          <div className="text-center text-white py-8">
            <div className="animate-spin inline-block w-8 h-8 border-4 border-white border-t-transparent rounded-full mb-2"></div>
            <p className="text-sm">Ładowanie galerii...</p>
            <p className="text-xs text-white/60 mt-1">Może potrwać do 30s przy pierwszym uruchomieniu</p>
          </div>
        </Container>
      </Section>
    );
  }

  // Show error state (only in dev or for admins)
  if (error) {
    return (
      <Section className="bg-black py-3 md:py-4">
        <Container>
          <div className="text-center text-red-400 py-4">
            <p className="text-sm">⚠️ Gallery temporarily unavailable</p>
            {import.meta.env.DEV && <p className="text-xs mt-1">{error}</p>}
          </div>
        </Container>
      </Section>
    );
  }

  // Don't render if no images (but reported to Error Monitor above)
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
                loading="lazy"
                decoding="async"
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
