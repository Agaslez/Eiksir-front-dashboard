import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  Clock,
  DollarSign,
  Package,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { trackEvent } from '../../lib/error-monitoring';

interface StatCard {
  id: string;
  title: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
  color: string;
}

interface RecentReservation {
  id: string;
  customer: string;
  eventDate: string;
  guests: number;
  package: string;
  status: 'new' | 'confirmed' | 'preparation' | 'completed';
  total: number;
}

interface Activity {
  id: string;
  user: string;
  action: string;
  target: string;
  timestamp: string;
  icon: React.ReactNode;
}

export default function DashboardHome() {
  const [stats, setStats] = useState<StatCard[]>([
    {
      id: 'reservations',
      title: 'Nowe rezerwacje',
      value: 12,
      change: 25,
      icon: <Calendar className="w-6 h-6" />,
      color: 'bg-blue-500',
    },
    {
      id: 'revenue',
      title: 'Przychód (miesiąc)',
      value: '24,580 zł',
      change: 18,
      icon: <DollarSign className="w-6 h-6" />,
      color: 'bg-green-500',
    },
    {
      id: 'guests',
      title: 'Goście (miesiąc)',
      value: 420,
      change: 32,
      icon: <Users className="w-6 h-6" />,
      color: 'bg-purple-500',
    },
    {
      id: 'conversion',
      title: 'Konwersja',
      value: '4.2%',
      change: -2,
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'bg-amber-500',
    },
  ]);

  const [recentReservations, setRecentReservations] = useState<
    RecentReservation[]
  >([
    {
      id: 'RES-001',
      customer: 'Anna Nowak',
      eventDate: '2024-03-15',
      guests: 80,
      package: 'PREMIUM',
      status: 'confirmed',
      total: 3900,
    },
    {
      id: 'RES-002',
      customer: 'Jan Kowalski',
      eventDate: '2024-03-20',
      guests: 120,
      package: 'EXCLUSIVE',
      status: 'new',
      total: 5200,
    },
    {
      id: 'RES-003',
      customer: 'Maria Wiśniewska',
      eventDate: '2024-03-10',
      guests: 40,
      package: 'BASIC',
      status: 'preparation',
      total: 2900,
    },
    {
      id: 'RES-004',
      customer: 'Piotr Zieliński',
      eventDate: '2024-03-25',
      guests: 25,
      package: 'Family & Seniors',
      status: 'completed',
      total: 2600,
    },
  ]);

  const [activities, setActivities] = useState<Activity[]>([
    {
      id: '1',
      user: 'admin@eliksir-bar.pl',
      action: 'dodał nową rezerwację',
      target: 'RES-002',
      timestamp: '5 minut temu',
      icon: <Package className="w-4 h-4" />,
    },
    {
      id: '2',
      user: 'system',
      action: 'wygenerował listę zakupów',
      target: 'RES-001',
      timestamp: '1 godzinę temu',
      icon: <Package className="w-4 h-4" />,
    },
    {
      id: '3',
      user: 'editor@eliksir-bar.pl',
      action: 'zaktualizował treść strony',
      target: 'Strona główna',
      timestamp: '2 godziny temu',
      icon: <Package className="w-4 h-4" />,
    },
    {
      id: '4',
      user: 'system',
      action: 'wysłał potwierdzenie email',
      target: 'RES-003',
      timestamp: '3 godziny temu',
      icon: <Package className="w-4 h-4" />,
    },
  ]);

  useEffect(() => {
    trackEvent('admin_dashboard_view');

    // Symulacja live updates
    const interval = setInterval(() => {
      setStats((prev) =>
        prev.map((stat) => ({
          ...stat,
          value:
            stat.id === 'reservations'
              ? Math.floor(Math.random() * 5) + 10
              : stat.value,
        }))
      );
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'confirmed':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'preparation':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'completed':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pl-PL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 mt-2">
          Witaj w panelu administracyjnym Eliksir Bar. Ostatnie logowanie:
          dzisiaj, 14:30
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.id}
            className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-colors"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.color} p-3 rounded-lg`}>{stat.icon}</div>
              <div
                className={`flex items-center ${stat.change >= 0 ? 'text-green-400' : 'text-red-400'}`}
              >
                {stat.change >= 0 ? (
                  <ArrowUpRight className="w-4 h-4 mr-1" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 mr-1" />
                )}
                <span className="font-bold">{Math.abs(stat.change)}%</span>
              </div>
            </div>

            <div className="mb-2">
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-gray-400 text-sm">{stat.title}</div>
            </div>

            <div className="text-xs text-gray-500">vs. poprzedni miesiąc</div>
          </div>
        ))}
      </div>

      {/* Recent Reservations & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Reservations */}
        <div className="bg-gray-800 rounded-xl border border-gray-700">
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">
                Ostatnie rezerwacje
              </h2>
              <button
                className="text-amber-400 hover:text-amber-300 text-sm font-medium"
                onClick={() => trackEvent('admin_view_all_reservations')}
              >
                Zobacz wszystkie →
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-6 text-gray-400 font-medium">
                    ID
                  </th>
                  <th className="text-left py-3 px-6 text-gray-400 font-medium">
                    Klient
                  </th>
                  <th className="text-left py-3 px-6 text-gray-400 font-medium">
                    Data
                  </th>
                  <th className="text-left py-3 px-6 text-gray-400 font-medium">
                    Status
                  </th>
                  <th className="text-left py-3 px-6 text-gray-400 font-medium">
                    Kwota
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentReservations.map((res) => (
                  <tr
                    key={res.id}
                    className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors cursor-pointer"
                    onClick={() =>
                      trackEvent('admin_reservation_click', { id: res.id })
                    }
                  >
                    <td className="py-3 px-6">
                      <div className="font-mono text-amber-300 font-bold">
                        {res.id}
                      </div>
                    </td>
                    <td className="py-3 px-6">
                      <div className="font-medium text-white">
                        {res.customer}
                      </div>
                      <div className="text-sm text-gray-400">
                        {res.guests} osób • {res.package}
                      </div>
                    </td>
                    <td className="py-3 px-6 text-gray-300">
                      {formatDate(res.eventDate)}
                    </td>
                    <td className="py-3 px-6">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(res.status)}`}
                      >
                        {res.status === 'new' && 'Nowa'}
                        {res.status === 'confirmed' && 'Potwierdzona'}
                        {res.status === 'preparation' && 'Przygotowanie'}
                        {res.status === 'completed' && 'Zakończona'}
                      </span>
                    </td>
                    <td className="py-3 px-6">
                      <div className="font-bold text-white">
                        {res.total.toLocaleString('pl-PL')} zł
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-6 border-t border-gray-700">
            <div className="flex items-center text-sm text-gray-400">
              <AlertCircle className="w-4 h-4 mr-2" />
              <span>3 rezerwacje wymagają potwierdzenia</span>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-gray-800 rounded-xl border border-gray-700">
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">
                Ostatnia aktywność
              </h2>
              <Clock className="w-5 h-5 text-gray-400" />
            </div>
          </div>

          <div className="p-6 space-y-4">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-700/30 transition-colors"
              >
                <div className="p-2 bg-gray-700 rounded-lg">
                  {activity.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-white">
                      {activity.user}
                    </div>
                    <div className="text-xs text-gray-500">
                      {activity.timestamp}
                    </div>
                  </div>
                  <div className="text-gray-300 mt-1">
                    {activity.action}{' '}
                    <span className="text-amber-300 font-medium">
                      {activity.target}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-6 border-t border-gray-700">
            <div className="text-center">
              <button
                className="text-amber-400 hover:text-amber-300 text-sm font-medium"
                onClick={() => trackEvent('admin_view_all_activity')}
              >
                Załaduj więcej aktywności
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <h2 className="text-xl font-bold text-white mb-4">Szybkie akcje</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            className="flex items-center justify-center space-x-2 p-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-lg transition-all"
            onClick={() =>
              trackEvent('admin_quick_action', { action: 'add_reservation' })
            }
          >
            <Calendar className="w-5 h-5" />
            <span className="font-medium">Dodaj rezerwację</span>
          </button>

          <button
            className="flex items-center justify-center space-x-2 p-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 rounded-lg transition-all"
            onClick={() =>
              trackEvent('admin_quick_action', {
                action: 'generate_shopping_list',
              })
            }
          >
            <Package className="w-5 h-5" />
            <span className="font-medium">Generuj listę zakupów</span>
          </button>

          <button
            className="flex items-center justify-center space-x-2 p-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 rounded-lg transition-all"
            onClick={() =>
              trackEvent('admin_quick_action', { action: 'send_newsletter' })
            }
          >
            <Users className="w-5 h-5" />
            <span className="font-medium">Wyślij newsletter</span>
          </button>
        </div>
      </div>
    </div>
  );
}
