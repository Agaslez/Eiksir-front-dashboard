import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  ShoppingCart,
  FileText,
  Image,
  Settings,
  Users,
  BarChart3,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
} from 'lucide-react';
import { logout, getUserRole } from '../../lib/auth';
import { trackEvent } from '../../lib/error-monitoring';

type NavItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  role: 'admin' | 'editor' | 'viewer';
  badge?: number;
};

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user] = useState(() => {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  });
  const navigate = useNavigate();

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
      path: '/admin/dashboard',
      role: 'viewer',
    },
    {
      id: 'reservations',
      label: 'Rezerwacje',
      icon: <Calendar className="w-5 h-5" />,
      path: '/admin/reservations',
      role: 'editor',
      badge: 3, // Nowe rezerwacje
    },
    {
      id: 'shopping-lists',
      label: 'Listy zakupów',
      icon: <ShoppingCart className="w-5 h-5" />,
      path: '/admin/shopping-lists',
      role: 'editor',
    },
    {
      id: 'content',
      label: 'Treść strony',
      icon: <FileText className="w-5 h-5" />,
      path: '/admin/content',
      role: 'editor',
    },
    {
      id: 'gallery',
      label: 'Galeria',
      icon: <Image className="w-5 h-5" />,
      path: '/admin/gallery',
      role: 'editor',
    },
    {
      id: 'customers',
      label: 'Klienci',
      icon: <Users className="w-5 h-5" />,
      path: '/admin/customers',
      role: 'admin',
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: <BarChart3 className="w-5 h-5" />,
      path: '/admin/analytics',
      role: 'admin',
    },
    {
      id: 'settings',
      label: 'Ustawienia',
      icon: <Settings className="w-5 h-5" />,
      path: '/admin/settings',
      role: 'admin',
    },
  ];

  const userRole = getUserRole() || 'viewer';
  const filteredNavItems = navItems.filter(
    (item) =>
      item.role === 'viewer' || item.role === userRole || userRole === 'admin'
  );

  const handleLogout = () => {
    trackEvent('admin_logout');
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 bg-gray-800 rounded-lg text-white"
        >
          {sidebarOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`
        fixed top-0 left-0 z-40 w-64 h-screen pt-16 transition-transform
        bg-gray-800 border-r border-gray-700
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}
      >
        <div className="h-full px-3 py-4 overflow-y-auto">
          {/* User info */}
          <div className="mb-6 p-4 bg-gray-700/50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full flex items-center justify-center">
                <span className="font-bold text-white">
                  {user?.name?.charAt(0) || 'A'}
                </span>
              </div>
              <div>
                <div className="font-medium text-white">
                  {user?.name || 'Administrator'}
                </div>
                <div className="text-sm text-gray-400 capitalize">
                  {userRole}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-1">
            {filteredNavItems.map((item) => (
              <NavLink
                key={item.id}
                to={item.path}
                className={({ isActive }) => `
                  flex items-center justify-between px-3 py-3 rounded-lg transition-colors
                  ${
                    isActive
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                  }
                `}
                onClick={() =>
                  trackEvent('admin_navigation', { page: item.id })
                }
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`${item.id === 'dashboard' ? 'text-amber-400' : 'text-gray-400'}`}
                  >
                    {item.icon}
                  </div>
                  <span className="font-medium">{item.label}</span>
                </div>
                {item.badge && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Logout button */}
          <div className="absolute bottom-4 left-0 right-0 px-3">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 w-full px-3 py-3 text-gray-300 hover:bg-gray-700/50 hover:text-white rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Wyloguj się</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:ml-64 pt-16">
        {/* Top bar */}
        <header className="fixed top-0 right-0 left-0 lg:left-64 z-30 bg-gray-800 border-b border-gray-700 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="search"
                  placeholder="Szukaj rezerwacji, klientów..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4 ml-4">
              <button className="relative p-2 text-gray-400 hover:text-white">
                <Bell className="w-6 h-6" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              <div className="hidden md:flex items-center space-x-2 text-sm">
                <div className="text-gray-400">Wersja:</div>
                <div className="px-2 py-1 bg-gray-700 rounded text-gray-300">
                  1.0.0
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="px-6 py-4 border-t border-gray-700 text-sm text-gray-400">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              © {new Date().getFullYear()} Eliksir Bar Mobilny. Wszelkie prawa
              zastrzeżone.
            </div>
            <div className="mt-2 md:mt-0 flex items-center space-x-4">
              <span>
                Status:{' '}
                <span className="text-green-400 font-medium">Online</span>
              </span>
              <span>•</span>
              <span>
                Ostatnia synchronizacja:{' '}
                {new Date().toLocaleTimeString('pl-PL')}
              </span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
