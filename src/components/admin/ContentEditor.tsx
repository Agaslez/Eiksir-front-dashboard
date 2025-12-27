import { Eye, EyeOff, Image as ImageIcon, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ELIKSIR_STYLES } from '../../lib/styles';
import ImageGalleryEnhanced from './ImageGalleryEnhanced';

interface ContentSection {
  id: string;
  name: string;
  title: string;
  description: string;
  imageUrl?: string;
}

export default function ContentEditor() {
  const [sections, setSections] = useState<ContentSection[]>([]);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [showGallery, setShowGallery] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      const response = await fetch(`${API_URL}/api/content/sections`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('eliksir_jwt_token')}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setSections(data.sections);
      }
    } catch (error) {
      console.error('Error fetching sections:', error);
    }
  };

  const handleUpdate = async (section: ContentSection) => {
    setSaving(true);
    try {
      const response = await fetch(`${API_URL}/api/content/sections/${section.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('eliksir_jwt_token')}`,
        },
        body: JSON.stringify({
          title: section.title,
          description: section.description,
          imageUrl: section.imageUrl,
        }),
      });

      if (response.ok) {
        await fetchSections();
        setEditingSection(null);
        alert('Sekcja zaktualizowana!');
      }
    } catch (error) {
      console.error('Error updating section:', error);
      alert('Błąd podczas aktualizacji');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (id: string, field: keyof ContentSection, value: string) => {
    setSections(sections.map(s =>
      s.id === id ? { ...s, [field]: value } : s
    ));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-playfair text-3xl text-eliksir-gold font-bold">
            Edytor Treści
          </h2>
          <p className="text-white/60 mt-1">
            Edytuj teksty i zdjęcia na stronie głównej
          </p>
        </div>

        {/* Toggle Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={() => setShowGallery(!showGallery)}
            className={`${ELIKSIR_STYLES.buttonSecondary} flex items-center space-x-2`}
          >
            <ImageIcon size={20} />
            <span>{showGallery ? 'Ukryj' : 'Pokaż'} Galerię</span>
          </button>
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className={`${ELIKSIR_STYLES.buttonSecondary} flex items-center space-x-2`}
          >
            {previewMode ? <EyeOff size={20} /> : <Eye size={20} />}
            <span>{previewMode ? 'Edycja' : 'Podgląd'}</span>
          </button>
        </div>
      </div>

      {/* Image Gallery */}
      {showGallery && (
        <div className="bg-eliksir-gray/30 p-6 rounded-eliksir border border-white/10">
          <ImageGalleryEnhanced />
        </div>
      )}

      {/* Content Sections */}
      <div className="grid gap-6">
        {sections.map((section) => (
          <div
            key={section.id}
            className="bg-eliksir-gray/50 rounded-eliksir border border-white/10 overflow-hidden"
          >
            {/* Section Header */}
            <div className="bg-gradient-to-r from-eliksir-gold to-eliksir-gold-dark p-4">
              <h3 className="font-playfair text-xl text-black font-bold">
                {section.name}
              </h3>
            </div>

            <div className="p-6 space-y-4">
              {previewMode ? (
                // Preview Mode
                <div className="space-y-4">
                  <div>
                    <h4 className="text-2xl font-playfair text-white mb-2">
                      {section.title}
                    </h4>
                    <p className="text-white/70 leading-relaxed">
                      {section.description}
                    </p>
                  </div>
                  {section.imageUrl && (
                    <img
                      src={`${API_URL}${section.imageUrl}`}
                      alt={section.name}
                      className="w-full max-w-md rounded-eliksir"
                    />
                  )}
                </div>
              ) : (
                // Edit Mode
                <>
                  {/* Title */}
                  <div>
                    <label className="block text-white/80 text-sm mb-2">
                      Tytuł
                    </label>
                    <input
                      type="text"
                      value={section.title}
                      onChange={(e) => handleChange(section.id, 'title', e.target.value)}
                      className={ELIKSIR_STYLES.input}
                      placeholder="Wprowadź tytuł..."
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-white/80 text-sm mb-2">
                      Opis
                    </label>
                    <textarea
                      value={section.description}
                      onChange={(e) => handleChange(section.id, 'description', e.target.value)}
                      rows={4}
                      className={ELIKSIR_STYLES.input}
                      placeholder="Wprowadź opis..."
                    />
                  </div>

                  {/* Image URL */}
                  <div>
                    <label className="block text-white/80 text-sm mb-2">
                      URL Zdjęcia
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={section.imageUrl || ''}
                        onChange={(e) => handleChange(section.id, 'imageUrl', e.target.value)}
                        className={ELIKSIR_STYLES.input}
                        placeholder="/uploads/images/example.jpg"
                      />
                      <button
                        onClick={() => setShowGallery(true)}
                        className={ELIKSIR_STYLES.buttonSecondary}
                      >
                        <ImageIcon size={20} />
                      </button>
                    </div>
                    {section.imageUrl && (
                      <img
                        src={`${API_URL}${section.imageUrl}`}
                        alt="Preview"
                        className="mt-2 w-32 h-32 object-cover rounded-eliksir"
                      />
                    )}
                  </div>

                  {/* Save Button */}
                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => handleUpdate(section)}
                      disabled={saving}
                      className={`${ELIKSIR_STYLES.buttonPrimary} flex items-center space-x-2`}
                    >
                      <Save size={20} />
                      <span>{saving ? 'Zapisywanie...' : 'Zapisz Zmiany'}</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {sections.length === 0 && (
        <div className="text-center py-12 bg-eliksir-gray/30 rounded-eliksir">
          <p className="text-white/40">Brak sekcji do edycji</p>
        </div>
      )}
    </div>
  );
}
