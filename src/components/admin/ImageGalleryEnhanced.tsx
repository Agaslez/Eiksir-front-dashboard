import { Check, Edit2, Eye, Filter, Trash2, Upload, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { fetchWithAuth } from '../../lib/auto-healing';
import { ELIKSIR_STYLES } from '../../lib/styles';

interface UploadedImage {
  id: number;
  filename: string;
  url: string;
  title: string;
  description: string;
  category: string;
  size: number;
  displayOrder?: number;
  uploadedAt: string;
}

const CATEGORIES = [
  { value: 'wszystkie', label: 'Wszystkie' },
  { value: 'wesela', label: 'Wesela' },
  { value: 'eventy-firmowe', label: 'Eventy firmowe' },
  { value: 'urodziny', label: 'Urodziny' },
  { value: 'drinki', label: 'Drinki' },
  { value: 'zespol', label: 'Zespół' },
];

export default function ImageGalleryEnhanced() {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<UploadedImage | null>(null);
  const [editingImage, setEditingImage] = useState<UploadedImage | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [activeCategory, setActiveCategory] = useState('wszystkie');
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  
  // Helper: Get full image URL (handles both relative and absolute URLs)
  const getImageUrl = (url: string) => {
    return url.startsWith('http://') || url.startsWith('https://') ? url : `${API_URL}${url}`;
  };

  useEffect(() => {
    fetchImages();
  }, [activeCategory]);

  const fetchImages = async () => {
    try {
      const url = activeCategory === 'wszystkie' 
        ? `${API_URL}/api/content/images`
        : `${API_URL}/api/content/images?category=${activeCategory}`;
        
      const response = await fetchWithAuth(url);
      const data = await response.json();
      if (data.success) {
        // Sort images by display order
        const sortedImages = data.images.sort((a: UploadedImage, b: UploadedImage) => 
          (a.displayOrder || 0) - (b.displayOrder || 0)
        );
        setImages(sortedImages);
      }
    } catch (error) {
      console.error('Error fetching images:', error);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);
    formData.append('title', '');
    formData.append('description', '');
    formData.append('category', activeCategory);

    setUploading(true);
    try {
      const response = await fetch(`${API_URL}/api/content/images/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('eliksir_jwt_token')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
        alert(`Upload failed: ${errorData.error || 'Unknown error'}`);
        return;
      }

      const data = await response.json();
      if (data.success) {
        await fetchImages();
        setEditingImage(data.image); // Open editor for new image
        e.target.value = '';
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Network error - check console for details');
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateImage = async () => {
    if (!editingImage) return;

    try {
      const response = await fetchWithAuth(`${API_URL}/api/content/images/${editingImage.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: editingImage.title,
          description: editingImage.description,
          category: editingImage.category,
        }),
      });

      const data = await response.json();
      if (data.success) {
        await fetchImages();
        setEditingImage(null);
        alert('✅ Zdjęcie zaktualizowane!');
      }
    } catch (error) {
      console.error('Error updating image:', error);
      alert('❌ Błąd podczas aktualizacji');
    }
  };

  const handleReorder = async (imageId: number, direction: 'up' | 'down') => {
    const sortedImages = [...images].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    const currentIndex = sortedImages.findIndex(img => img.id === imageId);
    
    if (currentIndex === -1) return;
    if (direction === 'up' && currentIndex === 0) return;
    if (direction === 'down' && currentIndex === sortedImages.length - 1) return;

    const swapIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    // Swap only the two images
    const image1 = sortedImages[currentIndex];
    const image2 = sortedImages[swapIndex];
    
    const newOrder = [
      { id: image1.id, order: swapIndex },
      { id: image2.id, order: currentIndex }
    ];

    try {
      const response = await fetchWithAuth(`${API_URL}/api/content/images/reorder`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ images: newOrder }),
      });

      const data = await response.json();
      if (data.success) {
        await fetchImages();
      } else {
        alert('❌ Błąd: ' + (data.error || 'Nieznany błąd'));
      }
    } catch (error) {
      console.error('Error reordering images:', error);
      alert('❌ Błąd podczas zmiany kolejności');
    }
  };

  const handleDelete = async (filename: string) => {
    if (!confirm('Czy na pewno chcesz usunąć to zdjęcie?')) return;

    try {
      const response = await fetchWithAuth(`${API_URL}/api/content/images/${filename}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchImages();
        if (selectedImage?.filename === filename) {
          setSelectedImage(null);
        }
      }
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(`${API_URL}${url}`);
    alert('URL skopiowany do schowka!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-playfair text-3xl text-eliksir-gold font-bold">
          Nasze realizacje
        </h2>
        <p className="text-white/60 mt-1">
          Galeria Eliksir Bar - Zobacz nasze najpiękniejsze realizacje
        </p>
      </div>

      {/* Actions Bar */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        {/* Category Filter */}
        <div className="flex items-center space-x-2">
          <Filter size={20} className="text-white/40" />
          <div className="flex space-x-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={`px-4 py-2 rounded-eliksir transition-all ${
                  activeCategory === cat.value
                    ? 'bg-eliksir-gold text-black font-semibold'
                    : 'bg-eliksir-gray/50 text-white hover:bg-eliksir-gray'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
        
        {/* Upload Button */}
        <label className={`${ELIKSIR_STYLES.buttonPrimary} cursor-pointer inline-flex items-center space-x-2`}>
          <Upload size={20} />
          <span>{uploading ? 'Wysyłanie...' : 'Dodaj Zdjęcie'}</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      {/* Image Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image) => (
          <div
            key={image.id}
            className={`relative group bg-eliksir-gray/50 rounded-eliksir border-2 transition-all overflow-hidden ${
              selectedImage?.id === image.id
                ? 'border-eliksir-gold'
                : 'border-white/10 hover:border-eliksir-gold/50'
            }`}
          >
            {/* Image */}
            <div className="aspect-square overflow-hidden">
              <img
                src={getImageUrl(image.url)}
                alt={image.title || image.filename}
                className="w-full h-full object-cover transition-transform group-hover:scale-110"
              />
            </div>

            {/* Info Overlay */}
            <div className="p-3 bg-gradient-to-t from-black/90 to-transparent absolute bottom-0 left-0 right-0">
              {image.title && (
                <p className="text-white font-semibold text-sm truncate">
                  {image.title}
                </p>
              )}
              {image.description && (
                <p className="text-white/70 text-xs truncate">
                  {image.description}
                </p>
              )}
              <p className="text-white/40 text-xs mt-1">
                {image.category} • {(image.size / 1024).toFixed(1)} KB
              </p>
            </div>

            {/* Actions */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col space-y-2">
              <button
                onClick={() => {
                  setSelectedImage(image);
                  setPreviewMode(true);
                }}
                className="p-2 bg-eliksir-dark/90 text-white rounded-eliksir hover:bg-eliksir-gold hover:text-black transition-colors"
                title="Podgląd"
              >
                <Eye size={16} />
              </button>
              <button
                onClick={() => handleReorder(image.id, 'up')}
                className="p-2 bg-eliksir-dark/90 text-white rounded-eliksir hover:bg-blue-500 transition-colors"
                title="Przesuń w górę"
              >
                ↑
              </button>
              <button
                onClick={() => handleReorder(image.id, 'down')}
                className="p-2 bg-eliksir-dark/90 text-white rounded-eliksir hover:bg-blue-500 transition-colors"
                title="Przesuń w dół"
              >
                ↓
              </button>
              <button
                onClick={() => setEditingImage(image)}
                className="p-2 bg-eliksir-dark/90 text-white rounded-eliksir hover:bg-eliksir-gold hover:text-black transition-colors"
                title="Edytuj"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => copyToClipboard(image.url)}
                className="p-2 bg-eliksir-dark/90 text-white rounded-eliksir hover:bg-eliksir-gold hover:text-black transition-colors"
                title="Kopiuj URL"
              >
                <Check size={16} />
              </button>
              <button
                onClick={() => handleDelete(image.filename)}
                className="p-2 bg-red-500/90 text-white rounded-eliksir hover:bg-red-600 transition-colors"
                title="Usuń"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {images.length === 0 && (
        <div className="text-center py-12">
          <Upload size={48} className="mx-auto text-white/20 mb-4" />
          <p className="text-white/40">
            {activeCategory === 'wszystkie' 
              ? 'Brak zdjęć. Dodaj pierwsze zdjęcie.' 
              : `Brak zdjęć w kategorii "${CATEGORIES.find(c => c.value === activeCategory)?.label}"`}
          </p>
        </div>
      )}

      {/* Edit Modal */}
      {editingImage && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="bg-eliksir-dark rounded-eliksir max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h3 className="text-xl font-playfair text-eliksir-gold">
                Edytuj zdjęcie
              </h3>
              <button
                onClick={() => setEditingImage(null)}
                className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-eliksir"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Preview */}
              <div className="aspect-video bg-black/20 rounded-eliksir overflow-hidden">
                <img
                  src={getImageUrl(editingImage.url)}
                  alt={editingImage.title}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Title */}
              <div>
                <label className="block text-white/80 text-sm mb-2">
                  Tytuł zdjęcia
                </label>
                <input
                  type="text"
                  value={editingImage.title}
                  onChange={(e) => setEditingImage({ ...editingImage, title: e.target.value })}
                  placeholder="np. Wesele w Pałacu"
                  className={ELIKSIR_STYLES.input}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-white/80 text-sm mb-2">
                  Opis zdjęcia
                </label>
                <textarea
                  value={editingImage.description}
                  onChange={(e) => setEditingImage({ ...editingImage, description: e.target.value })}
                  placeholder="np. Pełna obsługa baru na 120 osób"
                  rows={3}
                  className={ELIKSIR_STYLES.input}
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-white/80 text-sm mb-2">
                  Kategoria
                </label>
                <select
                  value={editingImage.category}
                  onChange={(e) => setEditingImage({ ...editingImage, category: e.target.value })}
                  className={ELIKSIR_STYLES.input}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Actions */}
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleUpdateImage}
                  className={ELIKSIR_STYLES.buttonPrimary}
                >
                  Zapisz zmiany
                </button>
                <button
                  onClick={() => setEditingImage(null)}
                  className={ELIKSIR_STYLES.buttonSecondary}
                >
                  Anuluj
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewMode && selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setPreviewMode(false)}
        >
          <button
            onClick={() => setPreviewMode(false)}
            className="absolute top-4 right-4 p-2 bg-white/10 text-white rounded-eliksir hover:bg-white/20"
          >
            <X size={24} />
          </button>
          <div className="max-w-5xl w-full text-center">
            <img
              src={getImageUrl(selectedImage.url)}
              alt={selectedImage.title}
              className="max-w-full max-h-[80vh] object-contain mx-auto"
              onClick={(e) => e.stopPropagation()}
            />
            {(selectedImage.title || selectedImage.description) && (
              <div className="mt-4 bg-eliksir-dark/80 rounded-eliksir p-4">
                {selectedImage.title && (
                  <h4 className="text-eliksir-gold font-playfair text-xl mb-2">
                    {selectedImage.title}
                  </h4>
                )}
                {selectedImage.description && (
                  <p className="text-white/70">{selectedImage.description}</p>
                )}
                <p className="text-white/40 text-sm mt-2">
                  {CATEGORIES.find(c => c.value === selectedImage.category)?.label}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
