import { Check, Eye, Trash2, Upload, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ELIKSIR_STYLES } from '../../lib/styles';

interface UploadedImage {
  filename: string;
  url: string;
  size: number;
  uploadedAt: string;
}

export default function ImageGallery() {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  
  // Helper: Get full image URL (handles both relative and absolute URLs)
  const getImageUrl = (url: string) => {
    return url.startsWith('http://') || url.startsWith('https://') ? url : `${API_URL}${url}`;
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const response = await fetch(`${API_URL}/api/content/images`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('eliksir_jwt_token')}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setImages(data.images);
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

    setUploading(true);
    try {
      const response = await fetch(`${API_URL}/api/content/images/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('eliksir_jwt_token')}`,
        },
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        await fetchImages();
        e.target.value = '';
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (filename: string) => {
    if (!confirm('Czy na pewno chcesz usunąć to zdjęcie?')) return;

    try {
      const response = await fetch(`${API_URL}/api/content/images/${filename}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('eliksir_jwt_token')}`,
        },
      });

      if (response.ok) {
        await fetchImages();
        if (selectedImage === filename) {
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-playfair text-3xl text-eliksir-gold font-bold">
            Galeria Zdjęć
          </h2>
          <p className="text-white/60 mt-1">
            Zarządzaj zdjęciami na stronie
          </p>
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
            key={image.filename}
            className={`relative group bg-eliksir-gray/50 rounded-eliksir border-2 transition-all ${
              selectedImage === image.filename
                ? 'border-eliksir-gold'
                : 'border-white/10 hover:border-eliksir-gold/50'
            }`}
          >
            {/* Image */}
            <div className="aspect-square overflow-hidden rounded-t-eliksir">
              <img
                src={getImageUrl(image.url)}
                alt={image.filename}
                className="w-full h-full object-cover transition-transform group-hover:scale-110"
              />
            </div>

            {/* Info */}
            <div className="p-3">
              <p className="text-white/70 text-xs truncate" title={image.filename}>
                {image.filename}
              </p>
              <p className="text-white/40 text-xs">
                {(image.size / 1024).toFixed(1)} KB
              </p>
            </div>

            {/* Actions */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
              <button
                onClick={() => {
                  setSelectedImage(image.filename);
                  setPreviewMode(true);
                }}
                className="p-2 bg-eliksir-dark/90 text-white rounded-eliksir hover:bg-eliksir-gold hover:text-black transition-colors"
                title="Podgląd"
              >
                <Eye size={16} />
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

            {/* Selected indicator */}
            {selectedImage === image.filename && (
              <div className="absolute top-2 left-2">
                <div className="bg-eliksir-gold text-black rounded-full p-1">
                  <Check size={16} />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty state */}
      {images.length === 0 && (
        <div className="text-center py-12">
          <Upload size={48} className="mx-auto text-white/20 mb-4" />
          <p className="text-white/40">Brak zdjęć. Dodaj pierwsze zdjęcie.</p>
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
          <img
            src={`${API_URL}/uploads/images/${selectedImage}`}
            alt="Preview"
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
