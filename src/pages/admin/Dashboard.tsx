import { Activity, BarChart3, Calculator, Home, Image, LogOut, Mail, Search, Sparkles, User } from 'lucide-react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';

export default function Dashboard() {
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (isLoading) return <LoadingSpinner />;
  if (!isAuthenticated) return <Navigate to="/admin/login" />;

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gradient-to-br from-eliksir-dark via-eliksir-gray to-eliksir-dark">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-eliksir-gold/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-eliksir-gold/5 rounded-full blur-3xl" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 bg-gradient-to-r from-eliksir-dark/90 to-eliksir-gray/90 backdrop-blur-lg border-b border-white/10 shadow-2xl shadow-eliksir-gold/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            <div className="flex items-center space-x-8">
              <h1 className="font-playfair text-2xl font-bold">
                <span className="bg-gradient-to-r from-eliksir-gold via-eliksir-goldLight to-eliksir-gold bg-clip-text text-transparent">
                  ELIKSIR
                </span>
                <span className="text-white/50 text-sm ml-2">Admin</span>
              </h1>
              
              {/* Navigation Links */}
              <div className="hidden md:flex space-x-4">
                <button
                  onClick={() => navigate('/admin')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-eliksir transition-all ${
                    isActive('/admin') 
                      ? 'bg-eliksir-gold text-black font-medium' 
                      : 'text-white/70 hover:text-eliksir-gold hover:bg-white/5'
                  }`}
                >
                  <Home size={18} />
                  <span>Dashboard</span>
                </button>
                
                <button
                  onClick={() => navigate('/admin/content')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-eliksir transition-all ${
                    isActive('/admin/content') 
                      ? 'bg-eliksir-gold text-black font-medium' 
                      : 'text-white/70 hover:text-eliksir-gold hover:bg-white/5'
                  }`}
                >
                  <Image size={18} />
                  <span>Treść</span>
                </button>

                <button
                  onClick={() => navigate('/admin/calculator')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-eliksir transition-all ${
                    isActive('/admin/calculator') 
                      ? 'bg-eliksir-gold text-black font-medium' 
                      : 'text-white/70 hover:text-eliksir-gold hover:bg-white/5'
                  }`}
                >
                  <Calculator size={18} />
                  <span>Kalkulator</span>
                </button>

                <button
                  onClick={() => navigate('/admin/email')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-eliksir transition-all ${
                    isActive('/admin/email') 
                      ? 'bg-eliksir-gold text-black font-medium' 
                      : 'text-white/70 hover:text-eliksir-gold hover:bg-white/5'
                  }`}
                >
                  <Mail size={18} />
                  <span>Email</span>
                </button>

                <button
                  onClick={() => navigate('/admin/seo')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-eliksir transition-all ${
                    isActive('/admin/seo') 
                      ? 'bg-eliksir-gold text-black font-medium' 
                      : 'text-white/70 hover:text-eliksir-gold hover:bg-white/5'
                  }`}
                >
                  <Search size={18} />
                  <span>SEO</span>
                </button>
                
                <button
                  onClick={() => navigate('/admin/analytics')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-eliksir transition-all ${
                    isActive('/admin/analytics') 
                      ? 'bg-eliksir-gold text-black font-medium' 
                      : 'text-white/70 hover:text-eliksir-gold hover:bg-white/5'
                  }`}
                >
                  <BarChart3 size={18} />
                  <span>Analytics</span>
                </button>

                <button
                  onClick={() => navigate('/admin/health')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-eliksir transition-all ${
                    isActive('/admin/health') 
                      ? 'bg-eliksir-gold text-black font-medium' 
                      : 'text-white/70 hover:text-eliksir-gold hover:bg-white/5'
                  }`}
                >
                  <Activity size={18} />
                  <span>Health</span>
                </button>

                <button
                  onClick={() => navigate('/admin/ghost')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-eliksir transition-all ${
                    isActive('/admin/ghost') 
                      ? 'bg-eliksir-gold text-black font-medium' 
                      : 'text-white/70 hover:text-eliksir-gold hover:bg-white/5'
                  }`}
                >
                  <Sparkles size={18} />
                  <span>GHOST Bot</span>
                </button>
              </div>
            </div>

            {/* User Info & Logout */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3 px-4 py-2 bg-white/5 rounded-eliksir border border-white/10">
                <User size={18} className="text-eliksir-gold" />
                <span className="text-sm text-white/70">{user?.email}</span>
              </div>
              
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-300 rounded-eliksir border border-red-500/30 transition-all"
              >
                <LogOut size={18} />
                <span>Wyloguj</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-b from-eliksir-dark/50 to-eliksir-gray/50 backdrop-blur-lg border border-white/10 rounded-eliksir-lg p-6 shadow-2xl shadow-eliksir-gold/5">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 mt-12 py-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-white/30 text-xs">
            © {new Date().getFullYear()} ELIKSIR Bar • Panel Administracyjny v1.0
          </p>
        </div>
      </footer>
    </div>
  );
}
