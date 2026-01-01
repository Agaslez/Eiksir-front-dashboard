import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ELIKSIR_STYLES } from '../../lib/styles';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-eliksir-dark via-eliksir-gray to-eliksir-dark">
      {/* Decorative elements */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-eliksir-gold/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-eliksir-gold/5 rounded-full blur-3xl" />
      
      <div className="relative z-10 w-full max-w-md px-4">
        <div className="bg-gradient-to-b from-eliksir-dark/80 to-eliksir-gray/80 backdrop-blur-lg border border-white/10 rounded-eliksir-lg shadow-2xl shadow-eliksir-gold/5 p-8">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <h1 className="font-playfair text-4xl font-bold mb-2">
              <span className="bg-gradient-to-r from-eliksir-gold via-eliksir-goldLight to-eliksir-gold bg-clip-text text-transparent">
                ELIKSIR
              </span>
            </h1>
            <p className="text-white/50 text-sm uppercase tracking-wider">
              Panel Administracyjny
            </p>
            <div className={ELIKSIR_STYLES.dividerShort} />
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-eliksir">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div>
              <label className={ELIKSIR_STYLES.label}>
                Adres Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={ELIKSIR_STYLES.input}
                placeholder="admin@eliksir-bar.pl"
                style={{ color: '#FFFFFF' }}
              />
            </div>

            {/* Password Input with visibility toggle */}
            <div>
              <label className={ELIKSIR_STYLES.label}>
                Hasło
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className={`${ELIKSIR_STYLES.input} pr-10`}
                  placeholder="••••••••"
                  style={{ color: '#FFFFFF' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-eliksir-gold transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`${ELIKSIR_STYLES.buttonPrimary} w-full ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-3 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Logowanie...
                </span>
              ) : 'Zaloguj się'}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <p className="text-center text-white/30 text-xs">
              © {new Date().getFullYear()} ELIKSIR Bar • Panel Administracyjny v1.0
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
