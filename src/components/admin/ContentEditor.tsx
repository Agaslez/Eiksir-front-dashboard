import {
  Eye,
  FileText,
  Globe,
  Heading,
  Image,
  Link,
  List,
  Monitor,
  Save,
  Search,
  Smartphone,
  Tablet,
  Trash2,
  Type,
  Upload,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { trackEvent } from '../../lib/error-monitoring';

interface PageContent {
  id: string;
  title: string;
  slug: string;
  metaTitle: string;
  metaDescription: string;
  heroImage: string;
  content: Array<{
    id: string;
    type: 'heading' | 'paragraph' | 'image' | 'list' | 'quote' | 'cta';
    content: string;
    settings?: Record<string, any>;
  }>;
  seoScore: number;
  lastUpdated: string;
  published: boolean;
}

const ContentEditor = () => {
  const [pages, setPages] = useState<PageContent[]>([
    {
      id: 'home',
      title: 'Strona Główna',
      slug: '',
      metaTitle:
        'Eliksir Bar Mobilny - Profesjonalny Bar Koktajlowy na Imprezy',
      metaDescription:
        'Profesjonalny bar mobilny na Twoje wesele, event firmowy lub imprezę prywatną w Bełchatowie i okolicach. Autorskie drinki, doświadczony zespół.',
      heroImage:
        'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1600',
      content: [
        { id: '1', type: 'heading', content: 'Eliksir Bar Mobilny' },
        {
          id: '2',
          type: 'paragraph',
          content:
            'Profesjonalny bar koktajlowy na Twoje wesele, event firmowy lub imprezę prywatną.',
        },
        { id: '3', type: 'cta', content: 'Wyceń swoją imprezę' },
      ],
      seoScore: 85,
      lastUpdated: '2024-01-20',
      published: true,
    },
    {
      id: 'offers',
      title: 'Oferta',
      slug: 'oferta',
      metaTitle: 'Oferta Baru Mobilnego - Pakiety na Imprezy | Eliksir Bar',
      metaDescription:
        'Sprawdź nasze pakiety barowe: BASIC, PREMIUM, EXCLUSIVE. Dopasowane do każdego typu imprezy i budżetu.',
      heroImage:
        'https://images.unsplash.com/photo-1536935338788-846bb9981813?auto=format&fit=crop&w=1600',
      content: [
        { id: '1', type: 'heading', content: 'Nasze Pakiety' },
        {
          id: '2',
          type: 'paragraph',
          content: 'Dopasowane do każdego typu imprezy i budżetu.',
        },
      ],
      seoScore: 78,
      lastUpdated: '2024-01-18',
      published: true,
    },
    {
      id: 'calculator',
      title: 'Kalkulator',
      slug: 'kalkulator',
      metaTitle: 'Kalkulator Wyceny Baru Mobilnego | Eliksir Bar',
      metaDescription:
        'Oblicz orientacyjną cenę swojego eventu z naszym kalkulatorem. Szybka wycena online.',
      heroImage:
        'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?auto=format&fit=crop&w=1600',
      content: [],
      seoScore: 92,
      lastUpdated: '2024-01-22',
      published: true,
    },
  ]);

  const [selectedPage, setSelectedPage] = useState<PageContent>(pages[0]);
  const [previewMode, setPreviewMode] = useState<
    'desktop' | 'tablet' | 'mobile'
  >('desktop');
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    trackEvent('admin_content_editor_view');
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    trackEvent('admin_content_save', { pageId: selectedPage.id });

    // Symulacja zapisu
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setPages((prev) =>
      prev.map((p) =>
        p.id === selectedPage.id
          ? {
              ...selectedPage,
              lastUpdated: new Date().toISOString().split('T')[0],
            }
          : p
      )
    );

    setIsSaving(false);
    alert('Zmiany zostały zapisane!');
  };

  const handleAddContent = (type: PageContent['content'][0]['type']) => {
    const newContent = {
      id: Date.now().toString(),
      type,
      content: '',
      settings: type === 'image' ? { alt: '', caption: '' } : undefined,
    };

    setSelectedPage((prev) => ({
      ...prev,
      content: [...prev.content, newContent],
    }));

    trackEvent('admin_content_add', { type });
  };

  const handleUpdateContent = (
    id: string,
    updates: Partial<PageContent['content'][0]>
  ) => {
    setSelectedPage((prev) => ({
      ...prev,
      content: prev.content.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    }));
  };

  const handleRemoveContent = (id: string) => {
    setSelectedPage((prev) => ({
      ...prev,
      content: prev.content.filter((item) => item.id !== id),
    }));
    trackEvent('admin_content_remove', { contentId: id });
  };

  const calculateSeoScore = (page: PageContent): number => {
    let score = 0;

    // Meta title length
    if (page.metaTitle.length >= 50 && page.metaTitle.length <= 60) score += 25;
    else if (page.metaTitle.length > 30 && page.metaTitle.length < 70)
      score += 15;

    // Meta description length
    if (
      page.metaDescription.length >= 150 &&
      page.metaDescription.length <= 160
    )
      score += 25;
    else if (
      page.metaDescription.length > 120 &&
      page.metaDescription.length < 170
    )
      score += 15;

    // Hero image
    if (page.heroImage) score += 15;

    // Content length
    if (page.content.length > 2) score += 20;

    // Published status
    if (page.published) score += 15;

    return Math.min(score, 100);
  };

  const filteredPages = pages.filter(
    (page) =>
      page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      page.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPreviewWidth = () => {
    switch (previewMode) {
      case 'desktop':
        return '100%';
      case 'tablet':
        return '768px';
      case 'mobile':
        return '375px';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Edytor treści</h1>
          <p className="text-gray-400 mt-2">
            Zarządzaj treścią strony i optymalizuj SEO
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 rounded-lg text-black font-bold flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Zapisywanie...' : 'Zapisz zmiany'}
          </button>
          <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Podgląd na żywo
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Page List */}
        <div className="lg:col-span-1">
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Szukaj stron..."
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-amber-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              {filteredPages.map((page) => (
                <button
                  key={page.id}
                  onClick={() => setSelectedPage(page)}
                  className={`w-full text-left p-4 rounded-lg transition-colors ${
                    selectedPage.id === page.id
                      ? 'bg-amber-500/20 border border-amber-500/50'
                      : 'bg-gray-700/50 hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-bold text-white">{page.title}</div>
                    <div
                      className={`text-xs px-2 py-1 rounded ${
                        page.published
                          ? 'bg-green-500/20 text-green-300'
                          : 'bg-yellow-500/20 text-yellow-300'
                      }`}
                    >
                      {page.published ? 'Opublikowana' : 'Szkic'}
                    </div>
                  </div>
                  <div className="text-sm text-gray-400 mb-1">
                    /{page.slug || '(strona główna)'}
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">
                      SEO: {page.seoScore}/100
                    </span>
                    <span className="text-gray-500">{page.lastUpdated}</span>
                  </div>
                </button>
              ))}
            </div>

            <button className="w-full mt-4 p-3 border-2 border-dashed border-gray-600 hover:border-amber-500/50 rounded-lg text-gray-400 hover:text-amber-400 transition-colors">
              + Dodaj nową stronę
            </button>
          </div>

          {/* SEO Score Card */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 mt-4">
            <h3 className="font-bold text-white mb-3">Analiza SEO</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Ogólny wynik</span>
                  <span className="font-bold text-amber-400">
                    {calculateSeoScore(selectedPage)}/100
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-amber-500 to-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${calculateSeoScore(selectedPage)}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Meta tytuł</span>
                  <span
                    className={
                      selectedPage.metaTitle.length >= 50 &&
                      selectedPage.metaTitle.length <= 60
                        ? 'text-green-400'
                        : 'text-amber-400'
                    }
                  >
                    {selectedPage.metaTitle.length} znaków
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Meta opis</span>
                  <span
                    className={
                      selectedPage.metaDescription.length >= 150 &&
                      selectedPage.metaDescription.length <= 160
                        ? 'text-green-400'
                        : 'text-amber-400'
                    }
                  >
                    {selectedPage.metaDescription.length} znaków
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Obrazek hero</span>
                  <span
                    className={
                      selectedPage.heroImage ? 'text-green-400' : 'text-red-400'
                    }
                  >
                    {selectedPage.heroImage ? 'Tak' : 'Brak'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Status</span>
                  <span
                    className={
                      selectedPage.published
                        ? 'text-green-400'
                        : 'text-yellow-400'
                    }
                  >
                    {selectedPage.published ? 'Opublikowana' : 'Szkic'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Column - Content Editor */}
        <div className="lg:col-span-2">
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            {/* Page Settings */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  <Type className="inline w-4 h-4 mr-2" />
                  Tytuł strony
                </label>
                <input
                  type="text"
                  value={selectedPage.title}
                  onChange={(e) =>
                    setSelectedPage({ ...selectedPage, title: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  <Link className="inline w-4 h-4 mr-2" />
                  Przyjazny URL
                </label>
                <div className="flex items-center">
                  <span className="bg-gray-700 px-3 py-3 rounded-l border border-r-0 border-gray-600 text-gray-400">
                    eliksir-bar.pl/
                  </span>
                  <input
                    type="text"
                    value={selectedPage.slug}
                    onChange={(e) =>
                      setSelectedPage({ ...selectedPage, slug: e.target.value })
                    }
                    className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-r text-white focus:outline-none focus:border-amber-500"
                    placeholder="(puste dla strony głównej)"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  <Globe className="inline w-4 h-4 mr-2" />
                  Meta tytuł (SEO)
                </label>
                <input
                  type="text"
                  value={selectedPage.metaTitle}
                  onChange={(e) =>
                    setSelectedPage({
                      ...selectedPage,
                      metaTitle: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
                  maxLength={70}
                />
                <div className="text-xs text-gray-500 mt-1">
                  {selectedPage.metaTitle.length}/70 znaków (optymalnie 50-60)
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Meta opis (SEO)
                </label>
                <textarea
                  value={selectedPage.metaDescription}
                  onChange={(e) =>
                    setSelectedPage({
                      ...selectedPage,
                      metaDescription: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-500 h-32"
                  maxLength={170}
                />
                <div className="text-xs text-gray-500 mt-1">
                  {selectedPage.metaDescription.length}/170 znaków (optymalnie
                  150-160)
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  <Image className="inline w-4 h-4 mr-2" />
                  Obrazek główny (Hero)
                </label>
                <div className="flex gap-4">
                  <input
                    type="text"
                    value={selectedPage.heroImage}
                    onChange={(e) =>
                      setSelectedPage({
                        ...selectedPage,
                        heroImage: e.target.value,
                      })
                    }
                    className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
                    placeholder="URL obrazka"
                  />
                  <button className="px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-white">
                    <Upload className="w-4 h-4" />
                  </button>
                </div>
                {selectedPage.heroImage && (
                  <div className="mt-3">
                    <img
                      src={selectedPage.heroImage}
                      alt="Podgląd"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Content Blocks */}
            <div className="mt-8 pt-6 border-t border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Bloki treści</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleAddContent('heading')}
                    className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white"
                    title="Dodaj nagłówek"
                  >
                    <Heading className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleAddContent('paragraph')}
                    className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white"
                    title="Dodaj akapit"
                  >
                    <FileText className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleAddContent('image')}
                    className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white"
                    title="Dodaj obrazek"
                  >
                    <Image className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleAddContent('list')}
                    className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white"
                    title="Dodaj listę"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {selectedPage.content.map((block) => (
                  <div key={block.id} className="bg-gray-700/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm text-gray-400">
                        {block.type === 'heading' && 'Nagłówek'}
                        {block.type === 'paragraph' && 'Akapit'}
                        {block.type === 'image' && 'Obrazek'}
                        {block.type === 'list' && 'Lista'}
                        {block.type === 'quote' && 'Cytat'}
                        {block.type === 'cta' && 'Przycisk CTA'}
                      </div>
                      <button
                        onClick={() => handleRemoveContent(block.id)}
                        className="p-1 text-gray-400 hover:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {block.type === 'heading' && (
                      <input
                        type="text"
                        value={block.content}
                        onChange={(e) =>
                          handleUpdateContent(block.id, {
                            content: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-xl font-bold"
                        placeholder="Wpisz nagłówek..."
                      />
                    )}

                    {block.type === 'paragraph' && (
                      <textarea
                        value={block.content}
                        onChange={(e) =>
                          handleUpdateContent(block.id, {
                            content: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white h-32"
                        placeholder="Wpisz treść..."
                      />
                    )}

                    {block.type === 'image' && (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={block.content}
                          onChange={(e) =>
                            handleUpdateContent(block.id, {
                              content: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white"
                          placeholder="URL obrazka"
                        />
                        <input
                          type="text"
                          value={block.settings?.alt || ''}
                          onChange={(e) =>
                            handleUpdateContent(block.id, {
                              settings: {
                                ...block.settings,
                                alt: e.target.value,
                              },
                            })
                          }
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white"
                          placeholder="Tekst alternatywny (alt)"
                        />
                        {block.content && (
                          <img
                            src={block.content}
                            alt={block.settings?.alt || ''}
                            className="w-full h-48 object-cover rounded"
                          />
                        )}
                      </div>
                    )}

                    {block.type === 'cta' && (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={block.content}
                          onChange={(e) =>
                            handleUpdateContent(block.id, {
                              content: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white"
                          placeholder="Tekst przycisku"
                        />
                        <div className="p-4 bg-gray-800 rounded border border-gray-600">
                          <button className="px-6 py-3 bg-amber-500 text-black font-bold rounded-lg">
                            {block.content || 'Przykładowy przycisk'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {selectedPage.content.length === 0 && (
                  <div className="text-center py-12 border-2 border-dashed border-gray-600 rounded-lg">
                    <FileText className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400">
                      Brak treści. Dodaj pierwszy blok!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Preview Controls */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPreviewMode('desktop')}
                className={`p-2 rounded-lg ${previewMode === 'desktop' ? 'bg-amber-500/20 text-amber-400' : 'bg-gray-700 text-gray-400'}`}
              >
                <Monitor className="w-5 h-5" />
              </button>
              <button
                onClick={() => setPreviewMode('tablet')}
                className={`p-2 rounded-lg ${previewMode === 'tablet' ? 'bg-amber-500/20 text-amber-400' : 'bg-gray-700 text-gray-400'}`}
              >
                <Tablet className="w-5 h-5" />
              </button>
              <button
                onClick={() => setPreviewMode('mobile')}
                className={`p-2 rounded-lg ${previewMode === 'mobile' ? 'bg-amber-500/20 text-amber-400' : 'bg-gray-700 text-gray-400'}`}
              >
                <Smartphone className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedPage.published}
                  onChange={(e) =>
                    setSelectedPage({
                      ...selectedPage,
                      published: e.target.checked,
                    })
                  }
                  className="rounded border-gray-600 bg-gray-700 text-amber-500 focus:ring-amber-500"
                />
                <span className="ml-2 text-sm text-gray-400">Opublikowana</span>
              </label>
            </div>
          </div>

          {/* Preview */}
          <div className="mt-4 bg-gray-900 rounded-xl border border-gray-700 p-6">
            <div className="flex justify-center mb-4">
              <div
                className="border border-gray-600 rounded-lg overflow-hidden bg-white"
                style={{ width: getPreviewWidth() }}
              >
                {/* Preview Header */}
                <div className="bg-gray-800 p-4 border-b border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                    <div className="text-xs text-gray-400">
                      eliksir-bar.pl/{selectedPage.slug}
                    </div>
                  </div>
                </div>

                {/* Preview Content */}
                <div className="p-6">
                  {selectedPage.heroImage && (
                    <img
                      src={selectedPage.heroImage}
                      alt="Hero"
                      className="w-full h-48 object-cover rounded-lg mb-6"
                    />
                  )}

                  {selectedPage.content.map((block) => (
                    <div key={block.id} className="mb-4">
                      {block.type === 'heading' && (
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">
                          {block.content || 'Przykładowy nagłówek'}
                        </h1>
                      )}
                      {block.type === 'paragraph' && (
                        <p className="text-gray-700 mb-4">
                          {block.content ||
                            'Przykładowy akapit tekstu. Tutaj znajdzie się treść Twojej strony.'}
                        </p>
                      )}
                      {block.type === 'cta' && block.content && (
                        <button className="px-6 py-3 bg-amber-500 text-black font-bold rounded-lg hover:bg-amber-600 transition-colors">
                          {block.content}
                        </button>
                      )}
                    </div>
                  ))}

                  {selectedPage.content.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      Brak treści do wyświetlenia
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="text-center text-sm text-gray-500 mt-4">
              Podgląd:{' '}
              {previewMode === 'desktop'
                ? 'Desktop'
                : previewMode === 'tablet'
                  ? 'Tablet'
                  : 'Mobile'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentEditor;
