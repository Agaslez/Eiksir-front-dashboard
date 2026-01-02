import { API, BACKEND_URL } from '@/lib/config';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useComponentHealth } from '../lib/component-health-monitor';
import { Container } from './layout/Container';
import { Section } from './layout/Section';

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
  return `${BACKEND_URL}${url}`;
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
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    fetchImages();
  }, []);

  // Auto-retry every 60s if failed (max 3 auto-retries)
  useEffect(() => {
    if (error && retryCount < 3) {
      const timer = setTimeout(() => {
        // ARCHITECT_APPROVED: Auto-retry logging essential for monitoring cold start recovery - 2026-01-02 - Stefan
        console.log(`HorizontalGallery: Auto-retry #${retryCount + 1}`);
        setRetryCount(prev => prev + 1);
        fetchImages();
      }, 60000); // 60s

      return () => clearTimeout(timer);
    }
  }, [error, retryCount]);

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
          const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout (Render cold start)
          
          response = await fetch(API.galleryPanorama, {
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
      
      if (!response) {
        setError(lastError || "No response");
        setIsLoading(false);
        return;
      }
      
      // Bezpieczny parse - backend może zwrócić HTML/tekst przy 429/500
      // NIE rzucamy błędu przy !response.ok - 429 to normalna odpowiedź HTTP
      const raw = await response.text();
      let data;
      try {
        data = JSON.parse(raw);
      } catch {
        console.error('Invalid JSON from /gallery/public:', raw.substring(0, 100));
        setError('Invalid JSON response');
        setIsLoading(false);
        return;
      }
      
      if (data.success && Array.isArray(data.images)) {
        const sortedImages = data.images
          .filter((img: GalleryImage) => img.url)
          .sort((a: GalleryImage, b: GalleryImage) => 
            (a.displayOrder || 0) - (b.displayOrder || 0)
          );
        
        // ARCHITECT_APPROVED: Debug logging to diagnose panorama gallery visibility issue - 2026-01-02 - Stefan
        console.log('🖼️ HorizontalGallery loaded:', {
          totalImages: data.images.length,
          filteredImages: sortedImages.length,
          firstImage: sortedImages[0]?.url,
        });
        
        setImages(sortedImages);
        
        // Report if no images found
        if (sortedImages.length === 0) {
          const monitor = (await import('@/lib/global-error-monitor')).getErrorMonitor();
          monitor?.captureError({
            message: 'HorizontalGallery: No active images found in database',
            type: 'manual',
            context: {
              endpoint: API.galleryPanorama,
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
          context: { endpoint: API.galleryPanorama, response: data },
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
          url: API.galleryPanorama,
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

  // Show error state with retry button
  if (error) {
    return (
      <Section className="bg-black py-3 md:py-4">
        <Container>
          <div className="text-center text-red-400 py-4">
            <p className="text-sm">⚠️ Galeria tymczasowo niedostępna</p>
            {import.meta.env.DEV && <p className="text-xs mt-1">{error}</p>}
            <button
              onClick={() => fetchImages()}
              className="mt-2 px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-500 rounded-lg text-xs transition-colors"
            >
              🔄 Spróbuj ponownie
            </button>
          </div>
        </Container>
      </Section>
    );
  }

  // Show placeholder if no images (with retry button)
  if (images.length === 0) {
    return (
      <Section className="bg-black py-3 md:py-4">
        <Container>
          <div className="text-center text-white/60 py-4">
            <p className="text-sm">📸 Brak obrazów w galerii</p>
            <p className="text-xs mt-1">Dodaj zdjęcia w panelu admina (ImageGalleryEnhanced)</p>
            <button
              onClick={() => fetchImages()}
              className="mt-2 px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-500 rounded-lg text-xs transition-colors"
            >
              🔄 Odśwież galerię
            </button>
          </div>
        </Container>
      </Section>
    );
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
              className="flex-shrink-0 w-40 h-28 sm:w-48 sm:h-32 md:w-56 md:h-36 rounded-lg overflow-hidden border border-amber-500/20 hover:border-amber-500/40 transition-all duration-300"
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
