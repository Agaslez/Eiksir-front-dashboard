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

interface DailyStats {
  date: string;
  views: number;
  uniqueVisitors: number;
}

interface TrafficSource {
  source: string;
  visits: number;
}

interface DailyStatsResponse {
  daily: DailyStats[];
  trafficSources: TrafficSource[];
}

export default function DashboardHome() {
  const [stats, setStats] = useState<SEOStats | null>(null);
  const [dailyStats, setDailyStats] = useState<DailyStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  const fetchStats = async () => {
    try {
      const [statsRes, dailyRes] = await Promise.all([
        fetch(`${API_URL}/api/seo/stats`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('eliksir_jwt_token')}`,
          },
        }),
        fetch(`${API_URL}/api/seo/stats/daily?days=14`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('eliksir_jwt_token')}`,
          },
        }),
      ]);
      
      const statsData = await statsRes.json();
      const dailyData = await dailyRes.json();
      
      if (statsData.success) {
        setStats(statsData.data);
      }
      if (dailyData.success) {
        setDailyStats(dailyData.data);
      }
      setLastUpdate(new Date());
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
        {/* Daily Views Line Chart */}
        <div className="bg-eliksir-gray/50 rounded-eliksir border border-white/10 p-6">
          <h3 className="font-playfair text-xl text-eliksir-gold font-bold mb-4">
            Odwiedziny (ostatnie 14 dni)
          </h3>
          {dailyStats?.daily && dailyStats.daily.length > 0 ? (
            <div className="space-y-4">
              <div className="relative h-48">
                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-right pr-2 text-white/40 text-xs">
                  <span>{Math.max(...dailyStats.daily.map(d => d.views))}</span>
                  <span>{Math.round(Math.max(...dailyStats.daily.map(d => d.views)) / 2)}</span>
                  <span>0</span>
                </div>
                
                {/* Chart area */}
                <div className="ml-14 h-full relative">
                  <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
                    {/* Grid lines */}
                    <line x1="0" y1="0" x2="100" y2="0" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
                    <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
                    <line x1="0" y1="100" x2="100" y2="100" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
                    
                    {/* Line chart */}
                    <polyline
                      fill="none"
                      stroke="url(#lineGradient)"
                      strokeWidth="2"
                      points={dailyStats.daily.map((day, i) => {
                        const x = (i / (dailyStats.daily.length - 1)) * 100;
                        const maxViews = Math.max(...dailyStats.daily.map(d => d.views));
                        const y = 100 - (day.views / maxViews) * 100;
                        return `${x},${y}`;
                      }).join(' ')}
                    />
                    
                    {/* Area under line */}
                    <polygon
                      fill="url(#areaGradient)"
                      opacity="0.3"
                      points={[
                        '0,100',
                        ...dailyStats.daily.map((day, i) => {
                          const x = (i / (dailyStats.daily.length - 1)) * 100;
                          const maxViews = Math.max(...dailyStats.daily.map(d => d.views));
                          const y = 100 - (day.views / maxViews) * 100;
                          return `${x},${y}`;
                        }),
                        '100,100'
                      ].join(' ')}
                    />
                    
                    {/* Gradient definitions */}
                    <defs>
                      <linearGradient id="lineGradient" x1="0" x2="1" y1="0" y2="0">
                        <stop offset="0%" stopColor="#DAA520" />
                        <stop offset="100%" stopColor="#FFD700" />
                      </linearGradient>
                      <linearGradient id="areaGradient" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#DAA520" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#DAA520" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                  </svg>
                  
                  {/* Hover points */}
                  <div className="absolute inset-0 flex justify-between items-end">
                    {dailyStats.daily.map((day, i) => {
                      const maxViews = Math.max(...dailyStats.daily.map(d => d.views));
                      const height = (day.views / maxViews) * 100;
                      return (
                        <div key={i} className="relative group flex-1" style={{ height: '100%' }}>
                          <div 
                            className="absolute bottom-0 w-full cursor-pointer"
                            style={{ height: `${height}%` }}
                          >
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-16 left-1/2 transform -translate-x-1/2 bg-eliksir-dark border border-eliksir-gold rounded px-3 py-2 text-xs whitespace-nowrap z-10">
                              <div className="text-white font-bold">{day.views} wyświetleń</div>
                              <div className="text-white/60">{new Date(day.date).toLocaleDateString('pl-PL', { month: 'short', day: 'numeric' })}</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              
              {/* X-axis labels */}
              <div className="ml-14 flex justify-between text-white/40 text-xs">
                <span>{new Date(dailyStats.daily[0].date).toLocaleDateString('pl-PL', { month: 'short', day: 'numeric' })}</span>
                <span>{new Date(dailyStats.daily[dailyStats.daily.length - 1].date).toLocaleDateString('pl-PL', { month: 'short', day: 'numeric' })}</span>
              </div>
            </div>
          ) : (
            <p className="text-white/40 text-center py-12">Brak danych</p>
          )}
        </div>

        {/* Traffic Sources Breakdown with Alerts */}
        <div className="bg-eliksir-gray/50 rounded-eliksir border border-white/10 p-6">
          <h3 className="font-playfair text-xl text-eliksir-gold font-bold mb-4">
            Źródła Ruchu • Marketing
          </h3>
          {dailyStats?.trafficSources && dailyStats.trafficSources.length > 0 ? (
            <div className="space-y-4">
              {dailyStats.trafficSources.map((source, index) => {
                const total = dailyStats.trafficSources.reduce((sum, s) => sum + s.visits, 0);
                const percentage = total > 0 ? (source.visits / total * 100).toFixed(1) : 0;
                const percentNum = Number(percentage);
                
                // Alert thresholds
                const isLow = percentNum < 5;
                const isGood = percentNum >= 20;
                
                // Source icons
                const sourceIcons: Record<string, string> = {
                  'Google': '🔍',
                  'Facebook': '📘',
                  'Instagram': '📸',
                  'Direct': '🔗',
                  'LinkedIn': '💼',
                  'Other': '🌐'
                };
                
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">{sourceIcons[source.source] || '🌐'}</span>
                        <div>
                          <span className="text-white/80 font-semibold">{source.source}</span>
                          {isLow && (
                            <span className="ml-2 text-xs bg-red-500/20 text-red-300 px-2 py-0.5 rounded-full">
                              ⚠️ Niski ruch
                            </span>
                          )}
                          {isGood && (
                            <span className="ml-2 text-xs bg-green-500/20 text-green-300 px-2 py-0.5 rounded-full">
                              ✓ Dobry
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-eliksir-gold font-bold text-lg">{percentNum}%</div>
                        <div className="text-white/40 text-xs">{source.visits} wizyt</div>
                      </div>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all ${
                          isGood ? 'bg-gradient-to-r from-green-500 to-green-400' :
                          isLow ? 'bg-gradient-to-r from-red-500 to-red-400' :
                          'bg-gradient-to-r from-eliksir-gold to-eliksir-goldLight'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              
              {/* Marketing Recommendations */}
              <div className="mt-6 p-4 bg-eliksir-gold/10 rounded-eliksir border border-eliksir-gold/30">
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">💡</div>
                  <div>
                    <div className="font-bold text-white mb-1">Rekomendacje:</div>
                    <ul className="text-white/70 text-sm space-y-1">
                      {dailyStats.trafficSources.find(s => s.source === 'Google' && (s.visits / dailyStats.trafficSources.reduce((sum, s) => sum + s.visits, 0)) < 0.3) && (
                        <li>• Popraw SEO - zbyt mały ruch z Google</li>
                      )}
                      {dailyStats.trafficSources.find(s => s.source === 'Facebook' && (s.visits / dailyStats.trafficSources.reduce((sum, s) => sum + s.visits, 0)) < 0.1) && (
                        <li>• Zwiększ aktywność na Facebooku</li>
                      )}
                      {dailyStats.trafficSources.find(s => s.source === 'Instagram' && (s.visits / dailyStats.trafficSources.reduce((sum, s) => sum + s.visits, 0)) < 0.05) && (
                        <li>• Rozwijaj Instagram - dodaj Stories z linkiem</li>
                      )}
                      {!dailyStats.trafficSources.some(s => (s.source === 'Google' || s.source === 'Facebook' || s.source === 'Instagram') && (s.visits / dailyStats.trafficSources.reduce((sum, s) => sum + s.visits, 0)) < 0.1) && (
                        <li>• ✓ Świetnie! Marketing działa dobrze</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-white/40 text-center py-12">Brak danych</p>
          )}
        </div>
      </div>

      {/* Original Charts Row */}
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
