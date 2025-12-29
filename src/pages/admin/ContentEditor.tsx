import { config } from '@/lib/config';
import { Save } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Section {
  id: string;
  title: string;
  content: {
    heading?: string;
    description?: string;
    subheading?: string;
    image?: string;
  };
}

export default function ContentEditor() {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const API_URL = config.apiUrl;

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/content/sections`);
      const data = await response.json();
      if (data.success) {
        setSections(data.sections || []);
      }
    } catch (error) {
      console.error('Error fetching sections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editingSection) return;

    setSaving(true);
    try {
      const token = localStorage.getItem('eliksir_jwt_token');
      const response = await fetch(`${API_URL}/api/content/sections/${editingSection.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: editingSection.content }),
      });

      if (response.ok) {
        alert('Sekcja zapisana!');
        fetchSections();
        setEditingSection(null);
      } else {
        alert('Błąd zapisu sekcji');
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Błąd zapisu sekcji');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-amber-500 border-r-transparent"></div>
          <p className="text-gray-600 mt-4">Ładowanie...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Content Editor</h2>

      <div className="space-y-4">
        {sections.map((section) => (
          <div key={section.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-gray-700">{section.title}</h3>
              <button
                onClick={() => setEditingSection({ ...section })}
                className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white text-sm rounded transition-colors"
              >
                Edytuj
              </button>
            </div>
            {section.content.heading && (
              <p className="text-sm text-gray-600"><strong>Heading:</strong> {section.content.heading}</p>
            )}
            {section.content.description && (
              <p className="text-sm text-gray-600 mt-2 line-clamp-3">
                <strong>Description:</strong> {section.content.description}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editingSection && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">{editingSection.title}</h3>

            {editingSection.content.heading !== undefined && (
              <div className="mb-4">
                <label htmlFor="heading-input" className="block text-sm font-medium text-gray-700 mb-1">Heading</label>
                <input
                  id="heading-input"
                  type="text"
                  value={editingSection.content.heading || ''}
                  onChange={(e) =>
                    setEditingSection({
                      ...editingSection,
                      content: { ...editingSection.content, heading: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
            )}

            {editingSection.content.subheading !== undefined && (
              <div className="mb-4">
                <label htmlFor="subheading-input" className="block text-sm font-medium text-gray-700 mb-1">Subheading</label>
                <input
                  id="subheading-input"
                  type="text"
                  value={editingSection.content.subheading || ''}
                  onChange={(e) =>
                    setEditingSection({
                      ...editingSection,
                      content: { ...editingSection.content, subheading: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
            )}

            {editingSection.content.description !== undefined && (
              <div className="mb-4">
                <label htmlFor="description-input" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  id="description-input"
                  value={editingSection.content.description || ''}
                  onChange={(e) =>
                    setEditingSection({
                      ...editingSection,
                      content: { ...editingSection.content, description: e.target.value },
                    })
                  }
                  rows={10}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">Użyj \n dla nowej linii</p>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditingSection(null)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
              >
                Anuluj
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Zapisywanie...' : 'Zapisz'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
