import { Mail, RefreshCw, Save, Send } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ELIKSIR_STYLES } from '../../lib/styles';

interface EmailSettings {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword: string;
  fromEmail: string;
  fromName: string;
}

interface EmailLog {
  id: number;
  recipient: string;
  subject: string;
  status: string;
  sentAt: string;
}

interface InboxMessage {
  id: number;
  fromEmail: string;
  fromName: string | null;
  subject: string;
  preview: string | null;
  receivedAt: string;
  isRead: boolean;
}

const EMAIL_PRESETS = {
  'home.pl': {
    smtpHost: 'poczta2559727.home.pl',
    smtpPort: 587,
  },
  'Gmail': {
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
  },
  'Onet': {
    smtpHost: 'smtp.poczta.onet.pl',
    smtpPort: 587,
  },
};

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
  const [inbox, setInbox] = useState<InboxMessage[]>([]);
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [loading, setLoading] = useState(true);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  // Load settings on mount
  useEffect(() => {
    loadSettings();
    loadLogs();
    loadInbox();
  }, []);

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
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLogs = async () => {
    try {
      const response = await fetch(`${API_URL}/api/email/logs?limit=20`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('eliksir_jwt_token')}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setLogs(data.logs);
      }
    } catch (error) {
      console.error('Error loading logs:', error);
    }
  };

  const loadInbox = async () => {
    try {
      const response = await fetch(`${API_URL}/api/email/inbox?limit=20`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('eliksir_jwt_token')}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setInbox(data.messages);
      }
    } catch (error) {
      console.error('Error loading inbox:', error);
    }
  };

  const handleChange = (field: keyof EmailSettings, value: string | number) => {
    setSettings({ ...settings, [field]: value });
  };

  const applyPreset = (preset: keyof typeof EMAIL_PRESETS) => {
    const presetConfig = EMAIL_PRESETS[preset];
    setSettings({ ...settings, ...presetConfig });
  };

  const handleTest = async () => {
    setTesting(true);
    try {
      const response = await fetch(`${API_URL}/api/email/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('eliksir_jwt_token')}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        alert('✅ Email testowy wysłany pomyślnie!');
        loadLogs(); // Refresh logs
      } else {
        alert('❌ Błąd: ' + data.error);
      }
    } catch (error) {
      console.error('Error testing email:', error);
      alert('❌ Błąd połączenia');
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
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
        alert('✅ Ustawienia zapisane pomyślnie!');
      } else {
        alert('❌ Błąd: ' + data.error);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('❌ Błąd podczas zapisywania');
    } finally {
      setSaving(false);
    }
  };

  const handleSyncInbox = async () => {
    setSyncing(true);
    try {
      const response = await fetch(`${API_URL}/api/email/inbox/sync`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('eliksir_jwt_token')}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        alert(`✅ Zsynchronizowano ${data.newMessages} nowych wiadomości`);
        loadInbox(); // Refresh inbox
      } else {
        alert('❌ Błąd: ' + data.error);
      }
    } catch (error) {
      console.error('Error syncing inbox:', error);
      alert('❌ Błąd podczas synchronizacji');
    } finally {
      setSyncing(false);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await fetch(`${API_URL}/api/email/inbox/${id}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('eliksir_jwt_token')}`,
        },
      });
      loadInbox(); // Refresh
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  if (loading) {
    return <div className="text-white/60">Ładowanie...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-playfair text-3xl text-eliksir-gold font-bold">
          Ustawienia Email
        </h2>
        <p className="text-white/60 mt-1">
          Konfiguracja serwera SMTP dla formularzy kontaktowych
        </p>
      </div>

      {/* Presets */}
      <div className="bg-eliksir-gray/50 rounded-eliksir border border-white/10 p-4">
        <label className="block text-white/80 text-sm mb-2">
          Szybka konfiguracja (Preset)
        </label>
        <select
          onChange={(e) => e.target.value && applyPreset(e.target.value as keyof typeof EMAIL_PRESETS)}
          className={ELIKSIR_STYLES.input}
        >
          <option value="">Wybierz preset...</option>
          <option value="home.pl">home.pl (poczta2559727.home.pl)</option>
          <option value="Gmail">Gmail (smtp.gmail.com)</option>
          <option value="Onet">Onet (smtp.poczta.onet.pl)</option>
        </select>
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
            </label>
            <input
              type="password"
              value={settings.smtpPassword}
              onChange={(e) => handleChange('smtpPassword', e.target.value)}
              className={ELIKSIR_STYLES.input}
              placeholder="••••••••••••••••"
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
          <h4 className="text-blue-400 font-bold mb-2">📧 Instrukcja home.pl</h4>
          <ol className="text-white/70 text-sm space-y-1 list-decimal list-inside">
            <li>Użyj pełnego adresu email jako login (kontakt@eliksir-bar.pl)</li>
            <li>Hasło to hasło do twojego konta email</li>
            <li>Serwer: poczta2559727.home.pl, Port: 587</li>
            <li>Dla Gmail: włącz weryfikację dwuetapową i wygeneruj hasło aplikacji</li>
          </ol>
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
          <h3 className="font-playfair text-xl text-eliksir-gold font-bold">
            Historia Wysłanych Wiadomości
          </h3>
          <button
            onClick={loadLogs}
            className="text-white/60 hover:text-white transition-colors"
          >
            <RefreshCw size={20} />
          </button>
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

      {/* Inbox */}
      <div className="bg-eliksir-gray/50 rounded-eliksir border border-white/10 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-playfair text-xl text-eliksir-gold font-bold">
            Odebrane Wiadomości (Skrzynka Odbiorcza)
          </h3>
          <button
            onClick={handleSyncInbox}
            disabled={syncing}
            className={`${ELIKSIR_STYLES.buttonSecondary} flex items-center space-x-2 text-sm`}
          >
            <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} />
            <span>{syncing ? 'Synchronizacja...' : 'Synchronizuj'}</span>
          </button>
        </div>
        
        {inbox.length === 0 ? (
          <div className="text-center py-8 text-white/40">
            <Mail size={48} className="mx-auto mb-4" />
            <p>Brak wiadomości. Kliknij "Synchronizuj" aby pobrać.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {inbox.map((msg) => (
              <div
                key={msg.id}
                onClick={() => markAsRead(msg.id)}
                className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                  msg.isRead
                    ? 'bg-white/5 border-white/5 text-white/60'
                    : 'bg-white/10 border-white/20 text-white font-semibold'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-eliksir-gold">{msg.fromName || msg.fromEmail}</span>
                    {msg.fromName && (
                      <span className="text-white/40 text-xs ml-2">({msg.fromEmail})</span>
                    )}
                  </div>
                  <span className="text-white/40 text-xs">
                    {new Date(msg.receivedAt).toLocaleString('pl-PL')}
                  </span>
                </div>
                <div className="text-white/80 mb-1">{msg.subject}</div>
                {msg.preview && (
                  <div className="text-white/50 text-sm">{msg.preview}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
