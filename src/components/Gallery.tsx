import { config } from '@/lib/config';
import {
    ChevronLeft,
    ChevronRight,
    Heart,
    Maximize2,
    RefreshCw,
    Share2,
    X
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { trackEvent } from '../lib/error-monitoring';
import { Container } from './layout/Container';
import { Section } from './layout/Section';

// Ensure API_URL always ends with /api
const baseUrl = config.apiUrl;
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
  alt?: string;
  category: string;
  title: string;
  description: string;
  displayOrder?: number;
  isActive?: boolean;
}

const Gallery = () => {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState('wszystkie');
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch images from backend API
  useEffect(() => {
    const fetchImages = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/content/gallery/public?category=wszystkie`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success && Array.isArray(data.images)) {
          // Backend now filters active images and returns displayOrder
          const sortedImages = data.images
            .filter((img: GalleryImage) => img.url)
            .sort((a: GalleryImage, b: GalleryImage) => 
              (a.displayOrder || 0) - (b.displayOrder || 0)
            );
          setGalleryImages(sortedImages);
        }
      } catch (error) {
        console.error('Failed to fetch gallery images:', error);
        trackEvent('gallery_fetch_error', { error: String(error) });
        // Keep empty array on error - show empty gallery instead of crash
        setGalleryImages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  const categories = [
    { id: 'wszystkie', label: 'Wszystkie' },
    { id: 'wesela', label: 'Wesela' },
    { id: 'eventy-firmowe', label: 'Eventy firmowe' },
    { id: 'imprezy-prywatne', label: 'Imprezy prywatne' },
  ];

  const filteredImages =
    activeCategory === 'wszystkie'
      ? galleryImages
      : galleryImages.filter((img) => img.category === activeCategory);

  if (loading) {
    return (
      <Section id="galeria" className="bg-black">
        <Container>
          <div className="text-center py-20">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-amber-500 border-r-transparent"></div>
            <p className="text-white/60 mt-4">Ładowanie galerii...</p>
          </div>
        </Container>
      </Section>
    );
  }

  const handlePrev = () => {
    if (selectedImage !== null) {
      const prevIndex =
        selectedImage === 0 ? filteredImages.length - 1 : selectedImage - 1;
      setSelectedImage(prevIndex);
      trackEvent('gallery_nav', {
        direction: 'prev',
        imageId: filteredImages[prevIndex].id,
      });
    }
  };

  const handleNext = () => {
    if (selectedImage !== null) {
      const nextIndex =
        selectedImage === filteredImages.length - 1 ? 0 : selectedImage + 1;
      setSelectedImage(nextIndex);
      trackEvent('gallery_nav', {
        direction: 'next',
        imageId: filteredImages[nextIndex].id,
      });
    }
  };

  const handleLike = (imageId: number) => {
    trackEvent('gallery_like', { imageId });
    // W rzeczywistej aplikacji tutaj byłby zapis do backendu
  };

  const handleShare = (image: (typeof galleryImages)[0]) => {
    const shareText = `Zobacz realizację Eliksir Bar: ${image.title} - ${image.description}`;
    if (navigator.share) {
      navigator.share({
        title: image.title,
        text: shareText,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(shareText);
      alert('Link skopiowany do schowka!');
    }
    trackEvent('gallery_share', { imageId: image.id });
  };

  return (
    <Section id="galeria" className="bg-black">
      {/* TYTUŁ W KONTENERZE */}
      <Container>
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-amber-400 uppercase tracking-[0.3em] text-sm mb-4">
            Nasze realizacje
          </p>
          <h2 className="font-playfair text-4xl md:text-5xl font-bold text-white mb-3">
            Galeria Eliksir Bar
          </h2>
          <p className="text-white/60 text-sm md:text-base max-w-2xl mx-auto">
            Zobacz nasze najpiękniejsze realizacje. Każda impreza to wyjątkowa
            historia, a my jesteśmy dumni, że możemy być jej częścią.
          </p>
        </div>
      </Container>

      {/* GALERIA W KONTENERZE */}
      <Container>
        {/* Category Filters + Refresh Button */}
        <div className="flex flex-wrap justify-center items-center gap-2 mb-8">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => {
                setActiveCategory(category.id);
                trackEvent('gallery_filter', { category: category.id });
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategory === category.id
                  ? 'bg-amber-500 text-black'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {category.label}
            </button>
          ))}
          
          {/* Refresh Button */}
          <button
            onClick={async () => {
              setLoading(true);
              const response = await fetch(`${API_URL}/content/gallery/public?category=wszystkie`);
              const data = await response.json();
              if (data.success) {
                const sortedImages = data.images
                  .filter((img: GalleryImage) => img.url)
                  .sort((a: GalleryImage, b: GalleryImage) => 
                    (a.displayOrder || 0) - (b.displayOrder || 0)
                  );
                setGalleryImages(sortedImages);
              }
              setLoading(false);
              trackEvent('gallery_refresh', { category: activeCategory });
            }}
            disabled={loading}
            className="px-4 py-2 rounded-full text-sm font-medium transition-all bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-50 flex items-center gap-2"
            title="Odśwież galerię"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Odśwież
          </button>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredImages.map((image, index) => (
            <div
              key={image.id}
              className="group relative overflow-hidden rounded-xl bg-gray-900 border border-gray-800 hover:border-amber-500/50 transition-all duration-300 cursor-pointer"
              onClick={() => {
                setSelectedImage(index);
                trackEvent('gallery_image_click', { imageId: image.id });
              }}
            >
              {/* Image */}
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={getImageUrl(image.url)}
                  alt={image.alt || image.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        image.category === 'wesela'
                          ? 'bg-pink-500/20 text-pink-300'
                          : image.category === 'eventy-firmowe'
                            ? 'bg-blue-500/20 text-blue-300'
                            : image.category === 'imprezy-prywatne'
                              ? 'bg-purple-500/20 text-purple-300'
                              : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {image.category === 'wesela' && 'Wesele'}
                      {image.category === 'eventy-firmowe' && 'Event Firmowy'}
                      {image.category === 'imprezy-prywatne' && 'Impreza Prywatna'}
                      {image.category === 'wszystkie' && 'Ogólne'}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLike(image.id);
                      }}
                      className="p-2 bg-black/50 rounded-full text-white hover:text-red-400"
                    >
                      <Heart className="w-5 h-5" />
                    </button>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1 text-center">
                    {image.title}
                  </h3>
                  <p className="text-gray-300 text-sm text-center">
                    {image.description}
                  </p>
                </div>
              </div>

              {/* Quick actions */}
              <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShare(image);
                  }}
                  className="p-2 bg-black/50 rounded-full text-white hover:bg-black/70"
                  title="Udostępnij"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImage(index);
                  }}
                  className="p-2 bg-black/50 rounded-full text-white hover:bg-black/70"
                  title="Powiększ"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Stats - w kontenerze */}
        <div className="mt-12">
          <div className="text-center">
            <div className="inline-flex items-center space-x-8 text-gray-400">
              <div>
                <div className="text-2xl font-bold text-amber-400">
                  {galleryImages.length}+
                </div>
                <div className="text-sm">Realizacji</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-amber-400">100%</div>
                <div className="text-sm">Zadowolonych klientów</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-amber-400">24/7</div>
                <div className="text-sm">Dostępność</div>
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* Lightbox Modal */}
      {selectedImage !== null && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4">
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 text-white hover:text-amber-400 z-10"
          >
            <X className="w-8 h-8" />
          </button>

          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-amber-400 z-10"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>

          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-amber-400 z-10"
          >
            <ChevronRight className="w-8 h-8" />
          </button>

          <div className="max-w-4xl w-full">
            <img
              src={getImageUrl(filteredImages[selectedImage].url)}
              alt={filteredImages[selectedImage].alt || filteredImages[selectedImage].title}
              className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
            />

            <div className="mt-6 text-center">
              <h3 className="text-2xl font-bold text-white mb-2 text-center">
                {filteredImages[selectedImage].title}
              </h3>
              <p className="text-gray-300 mb-4 text-center">
                {filteredImages[selectedImage].description}
              </p>
              <div className="flex items-center justify-center space-x-6">
                <button
                  onClick={() => handleLike(filteredImages[selectedImage].id)}
                  className="flex items-center space-x-2 text-gray-400 hover:text-red-400"
                >
                  <Heart className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleShare(filteredImages[selectedImage])}
                  className="flex items-center space-x-2 text-gray-400 hover:text-amber-400"
                >
                  <Share2 className="w-5 h-5" />
                  <span>Udostępnij</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Section>
  );
};

export default Gallery;
