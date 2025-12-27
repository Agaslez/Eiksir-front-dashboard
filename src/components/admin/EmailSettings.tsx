import { Mail, Save, Send } from 'lucide-react';
import { useState } from 'react';
import { ELIKSIR_STYLES } from '../../lib/styles';

interface EmailSettings {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword: string;
  fromEmail: string;
  fromName: string;
}

export default function EmailSettings() {
  const [settings, setSettings] = useState<EmailSettings>({
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    smtpUser: '',
    smtpPassword: '',
    fromEmail: '',
    fromName: 'ELIKSIR Restaurant',
  });
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  const handleChange = (field: keyof EmailSettings, value: string | number) => {
    setSettings({ ...settings, [field]: value });
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
        body: JSON.stringify({ testEmail: settings.smtpUser }),
      });

      const data = await response.json();
      if (data.success) {
        alert('✅ Email testowy wysłany pomyślnie!');
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
      // In production, you'd save to database
      alert('✅ Ustawienia zapisane (funkcja w rozwoju)');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('❌ Błąd podczas zapisywania');
    } finally {
      setSaving(false);
    }
  };

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
              placeholder="smtp.gmail.com"
            />
          </div>
          <div>
            <label className="block text-white/80 text-sm mb-2">
              Port
            </label>
            <input
              type="number"
              value={settings.smtpPort}
              onChange={(e) => handleChange('smtpPort', parseInt(e.target.value))}
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
              placeholder="your-email@gmail.com"
            />
          </div>
          <div>
            <label className="block text-white/80 text-sm mb-2">
              Hasło Aplikacji
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
              placeholder="noreply@eliksir.pl"
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
              placeholder="ELIKSIR Restaurant"
            />
          </div>
        </div>

        {/* Help Text */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-eliksir p-4">
          <h4 className="text-blue-400 font-bold mb-2">📧 Instrukcja Gmail</h4>
          <ol className="text-white/70 text-sm space-y-1 list-decimal list-inside">
            <li>Przejdź do ustawień konta Google</li>
            <li>Włącz weryfikację dwuetapową</li>
            <li>Wygeneruj hasło aplikacji (App Password)</li>
            <li>Użyj hasła aplikacji powyżej zamiast hasła konta</li>
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

      {/* Email Log (Future Feature) */}
      <div className="bg-eliksir-gray/50 rounded-eliksir border border-white/10 p-6">
        <h3 className="font-playfair text-xl text-eliksir-gold font-bold mb-4">
          Historia Wysłanych Wiadomości
        </h3>
        <div className="text-center py-8 text-white/40">
          <Mail size={48} className="mx-auto mb-4" />
          <p>Funkcja w rozwoju</p>
        </div>
      </div>
    </div>
  );
}
