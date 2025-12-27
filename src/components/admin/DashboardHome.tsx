import { BarChart3, Clock, Eye, Globe, TrendingUp, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ELIKSIR_STYLES } from '../../lib/styles';

interface SEOStats {
  totalViews: number;
  uniqueVisitors: string | number;
  averageTimeOnPage: number;
  bounceRate: number;
  popularPages: Array<{ path: string; views: string | number }>;
  trafficSources: Array<{ referrer: string; visits: string | number }>;
  recentViews?: number;
}

export default function DashboardHome() {
  const [stats, setStats] = useState<SEOStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_URL}/api/seo/stats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('eliksir_jwt_token')}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-eliksir-gold">Ładowanie statystyk...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-playfair text-3xl text-eliksir-gold font-bold">
            Dashboard
          </h2>
          <p className="text-white/60 mt-1">
            Statystyki na żywo • Ostatnia aktualizacja: {lastUpdate.toLocaleTimeString('pl-PL')}
          </p>
        </div>
        <button
          onClick={fetchStats}
          className={ELIKSIR_STYLES.buttonSecondary}
        >
          Odśwież
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Views */}
        <div className="bg-gradient-to-br from-eliksir-gray to-eliksir-dark rounded-eliksir border border-white/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <Eye className="text-eliksir-gold" size={32} />
            <TrendingUp className="text-green-500" size={20} />
          </div>
          <div>
            <p className="text-white/60 text-sm">Łączne Wyświetlenia</p>
            <p className="text-3xl font-bold text-white mt-1">
              {stats?.totalViews.toLocaleString('pl-PL') || '0'}
            </p>
          </div>
        </div>

        {/* Unique Visitors */}
        <div className="bg-gradient-to-br from-eliksir-gray to-eliksir-dark rounded-eliksir border border-white/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <Users className="text-eliksir-gold" size={32} />
            <TrendingUp className="text-green-500" size={20} />
          </div>
          <div>
            <p className="text-white/60 text-sm">Unikalni Użytkownicy</p>
            <p className="text-3xl font-bold text-white mt-1">
              {stats?.uniqueVisitors.toLocaleString('pl-PL') || '0'}
            </p>
          </div>
        </div>

        {/* Avg Time */}
        <div className="bg-gradient-to-br from-eliksir-gray to-eliksir-dark rounded-eliksir border border-white/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <Clock className="text-eliksir-gold" size={32} />
          </div>
          <div>
            <p className="text-white/60 text-sm">Średni Czas</p>
            <p className="text-3xl font-bold text-white mt-1">
              {stats?.averageTimeOnPage ? `${stats.averageTimeOnPage}s` : '0s'}
            </p>
          </div>
        </div>

        {/* Bounce Rate */}
        <div className="bg-gradient-to-br from-eliksir-gray to-eliksir-dark rounded-eliksir border border-white/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <BarChart3 className="text-eliksir-gold" size={32} />
          </div>
          <div>
            <p className="text-white/60 text-sm">Współczynnik Odrzuceń</p>
            <p className="text-3xl font-bold text-white mt-1">
              {stats?.bounceRate ? `${stats.bounceRate}%` : '0%'}
            </p>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Pages */}
        <div className="bg-eliksir-gray/50 rounded-eliksir border border-white/10 p-6">
          <h3 className="font-playfair text-xl text-eliksir-gold font-bold mb-4">
            Najpopularniejsze Strony
          </h3>
          <div className="space-y-3">
            {stats?.popularPages?.map((page, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    index === 0 ? 'bg-eliksir-gold text-black' : 'bg-white/10 text-white/60'
                  }`}>
                    {index + 1}
                  </div>
                  <span className="text-white/80">{page.path}</span>
                </div>
                <span className="text-eliksir-gold font-bold">
                  {typeof page.views === 'string' ? parseInt(page.views) : page.views}
                </span>
              </div>
            )) || (
              <p className="text-white/40 text-center py-4">Brak danych</p>
            )}
          </div>
        </div>

        {/* Traffic Sources */}
        <div className="bg-eliksir-gray/50 rounded-eliksir border border-white/10 p-6">
          <h3 className="font-playfair text-xl text-eliksir-gold font-bold mb-4">
            Źródła Ruchu
          </h3>
          <div className="space-y-3">
            {stats?.trafficSources?.map((source, index) => {
              const total = stats.trafficSources.reduce((sum, s) => sum + (typeof s.visits === 'string' ? parseInt(s.visits) : s.visits), 0);
              const visits = typeof source.visits === 'string' ? parseInt(source.visits) : source.visits;
              const percentage = total > 0 ? (visits / total * 100).toFixed(1) : 0;
              
              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Globe className="text-eliksir-gold" size={16} />
                      <span className="text-white/80">{source.referrer}</span>
                    </div>
                    <span className="text-white/60 text-sm">
                      {percentage}% • {visits}
                    </span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-eliksir-gold to-eliksir-gold-dark h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            }) || (
              <p className="text-white/40 text-center py-4">Brak danych</p>
            )}
          </div>
        </div>
      </div>

      {/* Live Activity Indicator */}
      <div className="bg-gradient-to-r from-green-500/20 to-eliksir-gold/20 rounded-eliksir border border-green-500/30 p-4">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            <div className="absolute inset-0 w-3 h-3 bg-green-500 rounded-full animate-ping" />
          </div>
          <span className="text-white/80">
            Statystyki aktualizują się automatycznie co 30 sekund
          </span>
        </div>
      </div>
    </div>
  );
}
