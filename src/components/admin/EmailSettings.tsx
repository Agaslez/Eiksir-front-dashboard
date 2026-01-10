import { CheckCircle, Mail, RefreshCw, Save, Send, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useToast } from '../../hooks/use-toast';
import { ELIKSIR_STYLES } from '../../lib/styles';

// Using console for logging with architect approvals
// ARCHITECT_APPROVED: Email settings debugging requires logging - 2026-01-10 - Stefan
const log = {
  info: console.info,
  error: console.error,
  warn: console.warn,
};

interface EmailSettings {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword: string;
  fromEmail: string;
  fromName: string;
  hasPassword?: boolean;
}

interface EmailLog {
  id: number;
  recipient: string;
  subject: string;
  status: string;
  sentAt: string;
}



export default function EmailSettings() {
  const [settings, setSettings] = useState<EmailSettings>({
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPassword: '',
    fromEmail: '',
    fromName: 'ELIKSIR Bar',
  });
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [passwordChanged, setPasswordChanged] = useState(false);
  const [newLogsCount, setNewLogsCount] = useState(0);
  const [lastLogId, setLastLogId] = useState<number | null>(null);
  const { toast } = useToast();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  // Load settings on mount
  useEffect(() => {
    loadSettings();
    loadLogs();
  }, []);

  // Auto-refresh logs every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadLogs(true); // Silent refresh
    }, 30000);
    return () => clearInterval(interval);
  }, [lastLogId]);

  const loadSettings = async () => {
    try {
      const response = await fetch(`${API_URL}/api/email/settings`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('eliksir_jwt_token')}`,
        },
      });
      const data = await response.json();
      if (data.success && data.settings) {
        setSettings(data.settings);
      }
    } catch (error) {
      // ARCHITECT_APPROVED: Error logging for settings load failure - 2026-01-10 - Stefan
      log.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLogs = async (silent = false) => {
    try {
      const response = await fetch(`${API_URL}/api/email/logs?limit=50`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('eliksir_jwt_token')}`,
        },
      });
      const data = await response.json();
      if (data.success && data.logs.length > 0) {
        const newLogs = data.logs;
        const newestId = newLogs[0]?.id;
        
        // Detect new logs
        if (lastLogId && newestId > lastLogId) {
          const newCount = newLogs.filter((log: EmailLog) => log.id > lastLogId).length;
          setNewLogsCount(newCount);
          if (!silent) {
            toast({
              title: "Nowe wiadomości",
              description: `${newCount} ${newCount === 1 ? 'nowa wiadomość' : 'nowych wiadomości'}`,
            });
          }
        }
        
        setLogs(newLogs);
        if (newestId) setLastLogId(newestId);
      }
    } catch (error) {
      if (!silent) {
        log.error('Error loading logs:', error);
      }
    }
  };



  const handleChange = (field: keyof EmailSettings, value: string | number) => {
    setSettings({ ...settings, [field]: value });
    
    // Track password changes
    if (field === 'smtpPassword' && value !== '••••••••') {
      setPasswordChanged(true);
    }
  };



  const handleTest = async () => {
    setTesting(true);
    try {
      // ARCHITECT_APPROVED: Debug logging for email test essential for troubleshooting SMTP issues - 2026-01-10 - Stefan
      log.info('[EmailSettings] Testing email configuration...');
      
      const response = await fetch(`${API_URL}/api/email/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('eliksir_jwt_token')}`,
        },
      });

      const data = await response.json();
      
      if (data.success) {
        log.info('[EmailSettings] ✅ Test successful:', data);
        toast({
          title: "✅ Email testowy wysłany!",
          description: `Sprawdź skrzynkę: ${settings.smtpUser}. Metoda: ${data.details?.method || 'SendGrid'}`,
        });
        loadLogs();
      } else {
        log.error('[EmailSettings] ❌ Test failed:', data);
        toast({
          title: "❌ Błąd wysyłania",
          description: data.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      log.error('[EmailSettings] ❌ Test error:', error);
      toast({
        title: "❌ Błąd połączenia",
        description: "Sprawdź połączenie z backendem",
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    if (!settings.smtpHost || !settings.smtpUser || !settings.fromEmail) {
      toast({
        title: "❌ Brak wymaganych pól",
        description: "Wypełnij wszystkie wymagane pola",
        variant: "destructive",
      });
      return;
    }

    if (!settings.hasPassword && !passwordChanged) {
      toast({
        title: "⚠️ Hasło nie ustawione",
        description: "Zapisz hasło email przed wysyłaniem",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      log.info('[EmailSettings] Saving configuration...');
      
      const response = await fetch(`${API_URL}/api/email/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('eliksir_jwt_token')}`,
        },
        body: JSON.stringify(settings),
      });

      const data = await response.json();
      
      if (data.success) {
        log.info('[EmailSettings] ✅ Settings saved');
        toast({
          title: "✅ Zapisano",
          description: "Ustawienia email zapisane pomyślnie",
        });
        setPasswordChanged(false);
        await loadSettings();
      } else {
        log.error('[EmailSettings] ❌ Save failed:', data);
        toast({
          title: "❌ Błąd zapisu",
          description: data.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      log.error('[EmailSettings] ❌ Save error:', error);
      toast({
        title: "❌ Błąd",
        description: "Błąd podczas zapisywania",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteLogs = async () => {
    if (!confirm('❌ Czy na pewno usunąć całą historię email?')) return;
    
    try {
      // Backend endpoint needed
      toast({
        title: "⚠️ Funkcja w przygotowaniu",
        description: "Usuwanie logów zostanie dodane wkrótce",
      });
    } catch (error) {
      log.error('Error deleting logs:', error);
      toast({
        title: "❌ Błąd",
        description: "Nie udało się usunąć logów",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="text-white/60">Ładowanie...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header with SendGrid Status */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="font-playfair text-3xl text-eliksir-gold font-bold">
            Ustawienia Email
          </h2>
          <p className="text-white/60 mt-1">
            Konfiguracja wysyłania email (SendGrid + SMTP fallback)
          </p>
        </div>
        <div className="flex items-center space-x-2 bg-green-500/10 border border-green-500/30 rounded-eliksir px-4 py-2">
          <CheckCircle className="text-green-400" size={20} />
          <span className="text-green-400 font-semibold">SendGrid Active</span>
        </div>
      </div>

      {/* Settings Form */}
      <div className="bg-eliksir-gray/50 rounded-eliksir border border-white/10 p-6 space-y-6">
        {/* SMTP Host */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-white/80 text-sm mb-2">
              Serwer SMTP
            </label>
            <input
              type="text"
              value={settings.smtpHost}
              onChange={(e) => handleChange('smtpHost', e.target.value)}
              className={ELIKSIR_STYLES.input}
              placeholder="poczta2559727.home.pl"
            />
          </div>
          <div>
            <label className="block text-white/80 text-sm mb-2">
              Port
            </label>
            <input
              type="number"
              value={settings.smtpPort || 587}
              onChange={(e) => handleChange('smtpPort', parseInt(e.target.value) || 587)}
              className={ELIKSIR_STYLES.input}
              placeholder="587"
            />
          </div>
        </div>

        {/* SMTP Credentials */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-white/80 text-sm mb-2">
              Email SMTP (Login)
            </label>
            <input
              type="email"
              value={settings.smtpUser}
              onChange={(e) => handleChange('smtpUser', e.target.value)}
              className={ELIKSIR_STYLES.input}
              placeholder="kontakt@eliksir-bar.pl"
            />
          </div>
          <div>
            <label className="block text-white/80 text-sm mb-2">
              Hasło Email
              {settings.hasPassword && !passwordChanged && (
                <span className="ml-2 text-green-400 text-xs">✓ Ustawione</span>
              )}
              {passwordChanged && (
                <span className="ml-2 text-yellow-400 text-xs">⚠️ Zmienione (Zapisz!)</span>
              )}
            </label>
            <input
              type="password"
              value={settings.smtpPassword}
              onChange={(e) => handleChange('smtpPassword', e.target.value)}
              className={ELIKSIR_STYLES.input}
              placeholder={settings.hasPassword ? '•••••••• (bez zmian)' : 'Wpisz hasło email'}
            />
          </div>
        </div>

        {/* From Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-white/80 text-sm mb-2">
              Email Nadawcy
            </label>
            <input
              type="email"
              value={settings.fromEmail}
              onChange={(e) => handleChange('fromEmail', e.target.value)}
              className={ELIKSIR_STYLES.input}
              placeholder="kontakt@eliksir-bar.pl"
            />
          </div>
          <div>
            <label className="block text-white/80 text-sm mb-2">
              Nazwa Nadawcy
            </label>
            <input
              type="text"
              value={settings.fromName}
              onChange={(e) => handleChange('fromName', e.target.value)}
              className={ELIKSIR_STYLES.input}
              placeholder="ELIKSIR Bar"
            />
          </div>
        </div>

        {/* Help Text */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-eliksir p-4">
          <h4 className="text-blue-400 font-bold mb-2">📧 Wysyłanie Email</h4>
          <div className="text-white/70 text-sm space-y-2">
            <p><strong>Serwer home.pl:</strong> poczta2559727.home.pl, Port: 587 lub 465</p>
            <p><strong>Login:</strong> Pełny adres email (kontakt@eliksir-bar.pl)</p>
            <p><strong>Hasło:</strong> Hasło do konta email</p>
            <p className="text-amber-400 mt-2">
              ⚡ Render blokuje porty SMTP - używamy SendGrid jako fallback (automatyczny)
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <button
            onClick={handleTest}
            disabled={testing || !settings.smtpUser}
            className={`${ELIKSIR_STYLES.buttonSecondary} flex items-center space-x-2`}
          >
            <Send size={20} />
            <span>{testing ? 'Wysyłanie...' : 'Wyślij Test'}</span>
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className={`${ELIKSIR_STYLES.buttonPrimary} flex items-center space-x-2`}
          >
            <Save size={20} />
            <span>{saving ? 'Zapisywanie...' : 'Zapisz Ustawienia'}</span>
          </button>
        </div>
      </div>

      {/* Email Logs */}
      <div className="bg-eliksir-gray/50 rounded-eliksir border border-white/10 p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-3">
            <h3 className="font-playfair text-xl text-eliksir-gold font-bold">
              Historia Wysłanych Wiadomości
            </h3>
            {newLogsCount > 0 && (
              <span className="bg-amber-500 text-black px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                {newLogsCount} nowych
              </span>
            )}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => loadLogs(false)}
              disabled={loading}
              className="flex items-center space-x-2 text-white/60 hover:text-white transition-colors disabled:opacity-50"
            >
              <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={handleDeleteLogs}
              className="flex items-center space-x-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 px-3 py-1 rounded-eliksir transition-colors"
              title="Usuń wszystkie logi"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
        
        {logs.length === 0 ? (
          <div className="text-center py-8 text-white/40">
            <Mail size={48} className="mx-auto mb-4" />
            <p>Brak historii wysłanych wiadomości</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-white/80">
              <thead className="text-white/60 border-b border-white/10">
                <tr>
                  <th className="text-left py-2 px-2">Data</th>
                  <th className="text-left py-2 px-2">Odbiorca</th>
                  <th className="text-left py-2 px-2">Temat</th>
                  <th className="text-center py-2 px-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-white/5">
                    <td className="py-2 px-2 whitespace-nowrap">
                      {new Date(log.sentAt).toLocaleString('pl-PL')}
                    </td>
                    <td className="py-2 px-2">{log.recipient}</td>
                    <td className="py-2 px-2">{log.subject}</td>
                    <td className="py-2 px-2 text-center">
                      {log.status === 'sent' ? (
                        <span className="text-green-400">✅</span>
                      ) : (
                        <span className="text-red-400">❌</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
