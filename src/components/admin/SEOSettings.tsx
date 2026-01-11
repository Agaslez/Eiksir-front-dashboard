import { API_URL } from '@/lib/config';
import { useEffect, useState } from 'react';

interface SEOData {
  keywords: string[];
  lastModified: string;
  modifiedBy: string;
}

export default function SEOSettings() {
  const [seoData, setSeoData] = useState<SEOData | null>(null);
  const [keywordsText, setKeywordsText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    fetchSEOSettings();
  }, []);

  const fetchSEOSettings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/api/settings/seo`);
      const data = await response.json();

      if (data.success) {
        setSeoData(data);
        setKeywordsText(data.keywords.join(', '));
      }
    } catch (error) {
      console.error('Failed to fetch SEO settings:', error);
      setMessage({ type: 'error', text: 'Nie udało się pobrać ustawień SEO' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setMessage(null);

      // Parse keywords from text (comma or newline separated)
      const keywords = keywordsText
        .split(/[,\n]+/)
        .map((kw) => kw.trim())
        .filter((kw) => kw.length > 0);

      if (keywords.length === 0) {
        setMessage({ type: 'error', text: 'Dodaj przynajmniej 1 keyword' });
        return;
      }

      if (keywords.length > 50) {
        setMessage({ type: 'error', text: 'Maksymalnie 50 keywords (masz: ' + keywords.length + ')' });
        return;
      }

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/settings/seo`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ keywords }),
      });

      const data = await response.json();

      if (data.success) {
        setSeoData(data);
        setKeywordsText(data.keywords.join(', '));
        setMessage({ type: 'success', text: '✅ Keywords zapisane! Frontend zaktualizuje się za ~2 min' });
        // Trigger frontend rebuild (optional - could add webhook here)
      } else {
        setMessage({ type: 'error', text: data.error || 'Błąd zapisu' });
      }
    } catch (error) {
      console.error('Failed to save SEO settings:', error);
      setMessage({ type: 'error', text: 'Nie udało się zapisać ustawień' });
    } finally {
      setIsSaving(false);
    }
  };

  const generatePreviewUrl = () => {
    const keywords = keywordsText
      .split(/[,\n]+/)
      .map((kw) => kw.trim())
      .filter((kw) => kw.length > 0);

    const query = keywords.slice(0, 5).join(' ');
    return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-white/60">Ładowanie ustawień SEO...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">🔍 SEO Keywords</h2>
        <p className="text-white/60">
          Zarządzaj słowami kluczowymi dla całej strony. Zmiany pojawią się na froncie po ~2 min.
        </p>
      </div>

      {/* Stats */}
      {seoData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#2a2a2a] rounded-lg p-4 border border-white/10">
            <div className="text-white/60 text-sm mb-1">Liczba keywords</div>
            <div className="text-2xl font-bold text-[#f59e0b]">
              {keywordsText.split(/[,\n]+/).filter((kw) => kw.trim().length > 0).length}
            </div>
            <div className="text-white/40 text-xs mt-1">max 50</div>
          </div>

          <div className="bg-[#2a2a2a] rounded-lg p-4 border border-white/10">
            <div className="text-white/60 text-sm mb-1">Ostatnia zmiana</div>
            <div className="text-sm font-medium text-white">
              {new Date(seoData.lastModified).toLocaleDateString('pl-PL', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
            <div className="text-white/40 text-xs mt-1">{seoData.modifiedBy}</div>
          </div>

          <div className="bg-[#2a2a2a] rounded-lg p-4 border border-white/10">
            <div className="text-white/60 text-sm mb-1">Status</div>
            <div className="text-sm font-medium text-green-400">✅ Zsynchronizowane</div>
            <div className="text-white/40 text-xs mt-1">index.html + API</div>
          </div>
        </div>
      )}

      {/* Editor */}
      <div className="bg-[#2a2a2a] rounded-lg p-6 border border-white/10">
        <label className="block text-white font-medium mb-2">Keywords (oddziel przecinkami)</label>
        <textarea
          value={keywordsText}
          onChange={(e) => setKeywordsText(e.target.value)}
          rows={8}
          className="w-full bg-[#1a1a1a] text-white rounded-lg p-4 border border-white/10 focus:border-[#f59e0b] focus:outline-none font-mono text-sm"
          placeholder="mobilny bar, bar koktajlowy, wesele Bełchatów, shot bar Łódź..."
        />
        <div className="mt-2 text-white/40 text-sm">
          💡 Wskazówki: Używaj lokalnych nazw (Bełchatów, Kleszczów, Łódź), dodaj long-tail keywords
          ("mobilny bar na wesele"), unikaj spamu (nie powtarzaj tego samego)
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-3 bg-[#f59e0b] text-white font-semibold rounded-lg hover:bg-[#ea8905] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSaving ? 'Zapisywanie...' : '💾 Zapisz Keywords'}
        </button>

        <button
          onClick={() => {
            setPreviewUrl(generatePreviewUrl());
            window.open(generatePreviewUrl(), '_blank');
          }}
          className="px-6 py-3 bg-[#2a2a2a] text-white font-medium rounded-lg hover:bg-[#3a3a3a] border border-white/10 transition-colors"
        >
          👀 Podgląd w Google
        </button>

        <button
          onClick={fetchSEOSettings}
          className="px-6 py-3 bg-[#2a2a2a] text-white font-medium rounded-lg hover:bg-[#3a3a3a] border border-white/10 transition-colors"
        >
          🔄 Odśwież
        </button>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`p-4 rounded-lg border ${
            message.type === 'success'
              ? 'bg-green-500/10 border-green-500/30 text-green-400'
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Preview Section */}
      <div className="bg-[#2a2a2a] rounded-lg p-6 border border-white/10">
        <h3 className="text-white font-semibold mb-4">📊 Jak to wygląda w HTML?</h3>
        <div className="bg-[#1a1a1a] rounded-lg p-4 font-mono text-sm text-white/80 overflow-x-auto">
          <code>
            {`<meta name="keywords" content="${keywordsText
              .split(/[,\n]+/)
              .map((kw) => kw.trim())
              .filter((kw) => kw.length > 0)
              .join(', ')}" />`}
          </code>
        </div>
      </div>

      {/* SEO Tips */}
      <div className="bg-[#2a2a2a] rounded-lg p-6 border border-white/10">
        <h3 className="text-white font-semibold mb-4">💡 SEO Best Practices</h3>
        <ul className="space-y-2 text-white/70 text-sm">
          <li>✅ <strong>Lokalne keywords:</strong> "mobilny bar Bełchatów" lepsze niż "mobilny bar"</li>
          <li>✅ <strong>Long-tail:</strong> "barman na wesele Łódź" = mniejsza konkurencja, wyższa konwersja</li>
          <li>✅ <strong>Intencja użytkownika:</strong> "cennik mobilnego baru" (szukają ceny = chcą kupić)</li>
          <li>❌ <strong>Keyword stuffing:</strong> Nie powtarzaj "mobilny bar" 20 razy</li>
          <li>❌ <strong>Zbyt ogólne:</strong> "bar" - za dużo konkurencji, mała relevancja</li>
          <li>
            📈 <strong>Testuj!</strong> Dodaj keyword, sprawdź po tygodniu pozycję w Google Search Console
          </li>
        </ul>
      </div>
    </div>
  );
}
