import { AlertCircle, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createAuthToken } from '../../lib/auth';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // W produkcji to będzie z backendu
  const VALID_CREDENTIALS = [
    { email: 'admin@eliksir-bar.pl', password: 'Admin123!', role: 'admin' },
    { email: 'editor@eliksir-bar.pl', password: 'Editor123!', role: 'editor' },
    { email: 'viewer@eliksir-bar.pl', password: 'Viewer123!', role: 'viewer' },
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Symulacja opóźnienia sieci
      await new Promise((resolve) => setTimeout(resolve, 800));

      const user = VALID_CREDENTIALS.find(
        (cred) => cred.email === email && cred.password === password
      );

      if (!user) {
        throw new Error('Nieprawidłowy email lub hasło');
      }

      // W produkcji: fetch do backendu
      // const response = await fetch('/api/admin/login', {
      //   method: 'POST',
      //   body: JSON.stringify({ email, password })
      // });

      // Tworzenie tokenu JWT
      const token = await createAuthToken({
        id: '1', // W produkcji z backendu
        email: user.email,
        role: user.role as 'admin' | 'editor' | 'viewer',
      });

      // Zapis w localStorage
      localStorage.setItem('auth_token', token);
      localStorage.setItem(
        'user_data',
        JSON.stringify({
          email: user.email,
          role: user.role,
          name: user.email.split('@')[0],
        })
      );

      // Przekierowanie do dashboardu
      navigate('/admin');
    } catch (err: any) {
      setError(err.message || 'Wystąpił błąd podczas logowania');

      // Logowanie błędu (w produkcji do Sentry)
      console.error('Login error:', err);

      // Rate limiting simulation
      localStorage.setItem(
        'login_attempts',
        (parseInt(localStorage.getItem('login_attempts') || '0') + 1).toString()
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-900 via-black to-amber-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-500 rounded-full mb-4">
            <Lock className="w-8 h-8 text-black" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Panel Admina</h1>
          <p className="text-amber-200/70">Eliksir Bar Mobilny</p>
        </div>

        <div className="bg-black/50 backdrop-blur-sm border border-amber-500/30 rounded-xl p-8 shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-amber-200 mb-2">
                <Mail className="inline w-4 h-4 mr-2" />
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/50 border border-amber-500/30 rounded-lg px-4 py-3 text-white placeholder-amber-200/50 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all"
                placeholder="admin@eliksir-bar.pl"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-amber-200 mb-2">
                <Lock className="inline w-4 h-4 mr-2" />
                Hasło
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/50 border border-amber-500/30 rounded-lg px-4 py-3 text-white placeholder-amber-200/50 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all pr-12"
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-amber-200/70 hover:text-amber-300"
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              <p className="text-xs text-amber-200/50 mt-2">
                Min. 8 znaków, wielka litera, cyfra, znak specjalny
              </p>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-amber-500/50 bg-black/50 text-amber-500 focus:ring-amber-500"
                  disabled={loading}
                />
                <span className="ml-2 text-sm text-amber-200/70">
                  Zapamiętaj mnie
                </span>
              </label>

              <button
                type="button"
                className="text-sm text-amber-400 hover:text-amber-300 transition-colors"
                disabled={loading}
              >
                Zapomniałeś hasła?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold py-3 px-4 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  Logowanie...
                </>
              ) : (
                'Zaloguj się'
              )}
            </button>

            <div className="text-center pt-4 border-t border-amber-500/20">
              <p className="text-sm text-amber-200/50">Demo konta:</p>
              <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
                <div className="bg-black/30 p-2 rounded">
                  <div className="font-medium text-amber-300">Admin</div>
                  <div className="text-amber-200/70 truncate">
                    admin@eliksir-bar.pl
                  </div>
                  <div className="text-amber-200/50">Admin123!</div>
                </div>
                <div className="bg-black/30 p-2 rounded">
                  <div className="font-medium text-amber-300">Editor</div>
                  <div className="text-amber-200/70 truncate">
                    editor@eliksir-bar.pl
                  </div>
                  <div className="text-amber-200/50">Editor123!</div>
                </div>
                <div className="bg-black/30 p-2 rounded">
                  <div className="font-medium text-amber-300">Viewer</div>
                  <div className="text-amber-200/70 truncate">
                    viewer@eliksir-bar.pl
                  </div>
                  <div className="text-amber-200/50">Viewer123!</div>
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-amber-200/50">
            ⚠️ W produkcji zmień domyślne hasła!
          </p>
          <p className="text-xs text-amber-200/30 mt-2">
            Wersja:{' '}
            {process.env.NODE_ENV === 'production'
              ? 'Production'
              : 'Development'}
          </p>
        </div>
      </div>
    </div>
  );
}
