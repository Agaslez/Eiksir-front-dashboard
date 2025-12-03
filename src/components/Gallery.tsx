import { ChevronLeft, ChevronRight, Heart, Maximize2, Share2, X } from 'lucide-react';
import { useState } from 'react';
import { trackEvent } from '../lib/error-monitoring';

const galleryImages = [
  {
    id: 1,
    src: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=800',
    alt: 'Bar mobilny na weselu',
    category: 'wesele',
    title: 'Wesele w Pałacu',
    description: 'Pełna obsługa baru na 120 osób',
    likes: 42,
  },
  {
    id: 2,
    src: 'https://images.unsplash.com/photo-1536935338788-846bb9981813?auto=format&fit=crop&w=800',
    alt: 'Event firmowy z barem',
    category: 'firmowe',
    title: 'Event integracyjny',
    description: 'Bar dla 80 pracowników korporacji',
    likes: 28,
  },
  {
    id: 3,
    src: 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?auto=format&fit=crop&w-800',
    alt: 'Urodziny z barem koktajlowym',
    category: 'urodziny',
    title: '40. urodziny',
    description: 'Kameralna impreza z autorskimi drinkami',
    likes: 35,
  },
  {
    id: 4,
    src: 'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=800',
    alt: 'Koktajle premium',
    category: 'drinki',
    title: 'Nasze signature drinki',
    description: 'Autorskie kompozycje smakowe',
    likes: 56,
  },
  {
    id: 5,
    src: 'https://images.unsplash.com/photo-1544148103-0773bf10d330?auto=format&fit=crop&w=800',
    alt: 'Dekoracja baru',
    category: 'dekoracje',
    title: 'Stylowa aranżacja',
    description: 'Dopracowane w każdym detalu',
    likes: 31,
  },
  {
    id: 6,
    src: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=800',
    alt: 'Barman przy pracy',
    category: 'zespół',
    title: 'Nasz zespół',
    description: 'Profesjonalni barmani z pasją',
    likes: 49,
  },
];

const Gallery = () => {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState('wszystkie');

  const categories = [
    { id: 'wszystkie', label: 'Wszystkie' },
    { id: 'wesele', label: 'Wesela' },
    { id: 'firmowe', label: 'Eventy firmowe' },
    { id: 'urodziny', label: 'Urodziny' },
    { id: 'drinki', label: 'Drinki' },
    { id: 'zespół', label: 'Zespół' },
  ];

  const filteredImages = activeCategory === 'wszystkie' 
    ? galleryImages 
    : galleryImages.filter(img => img.category === activeCategory);

  const handlePrev = () => {
    if (selectedImage !== null) {
      const prevIndex = selectedImage === 0 ? filteredImages.length - 1 : selectedImage - 1;
      setSelectedImage(prevIndex);
      trackEvent('gallery_nav', { direction: 'prev', imageId: filteredImages[prevIndex].id });
    }
  };

  const handleNext = () => {
    if (selectedImage !== null) {
      const nextIndex = selectedImage === filteredImages.length - 1 ? 0 : selectedImage + 1;
      setSelectedImage(nextIndex);
      trackEvent('gallery_nav', { direction: 'next', imageId: filteredImages[nextIndex].id });
    }
  };

  const handleLike = (imageId: number) => {
    trackEvent('gallery_like', { imageId });
    // W rzeczywistej aplikacji tutaj byłby zapis do backendu
  };

  const handleShare = (image: typeof galleryImages[0]) => {
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
    <section id="galeria" className="py-20 bg-black">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-amber-400 uppercase tracking-[0.3em] text-sm mb-4">
            Nasze realizacje
          </p>
          <h2 className="font-playfair text-4xl md:text-5xl font-bold text-white mb-3">
            Galeria Eliksir Bar
          </h2>
          <p className="text-white/60 text-sm md:text-base max-w-2xl mx-auto">
            Zobacz nasze najpiękniejsze realizacje. Każda impreza to wyjątkowa historia, 
            a my jesteśmy dumni, że możemy być jej częścią.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
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
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      image.category === 'wesele' ? 'bg-pink-500/20 text-pink-300' :
                      image.category === 'firmowe' ? 'bg-blue-500/20 text-blue-300' :
                      image.category === 'urodziny' ? 'bg-purple-500/20 text-purple-300' :
                      'bg-amber-500/20 text-amber-300'
                    }`}>
                      {image.category === 'wesele' && 'Wesele'}
                      {image.category === 'firmowe' && 'Firmowe'}
                      {image.category === 'urodziny' && 'Urodziny'}
                      {image.category === 'drinki' && 'Drinki'}
                      {image.category === 'dekoracje' && 'Dekoracje'}
                      {image.category === 'zespół' && 'Zespół'}
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
                  <h3 className="text-xl font-bold text-white mb-1">{image.title}</h3>
                  <p className="text-gray-300 text-sm">{image.description}</p>
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

        {/* Stats */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center space-x-8 text-gray-400">
            <div>
              <div className="text-2xl font-bold text-amber-400">{galleryImages.length}+</div>
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
              src={filteredImages[selectedImage].src}
              alt={filteredImages[selectedImage].alt}
              className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
            />
            
            <div className="mt-6 text-center">
              <h3 className="text-2xl font-bold text-white mb-2">
                {filteredImages[selectedImage].title}
              </h3>
              <p className="text-gray-300 mb-4">
                {filteredImages[selectedImage].description}
              </p>
              <div className="flex items-center justify-center space-x-6">
                <button
                  onClick={() => handleLike(filteredImages[selectedImage].id)}
                  className="flex items-center space-x-2 text-gray-400 hover:text-red-400"
                >
                  <Heart className="w-5 h-5" />
                  <span>{filteredImages[selectedImage].likes}</span>
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
    </section>
  );
};

export default Gallery;