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

      {/* GitHub-Style Traffic Chart */}
      <div className="bg-eliksir-gray/50 rounded-eliksir border border-white/10 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-playfair text-xl text-eliksir-gold font-bold">
            Ruch na Stronie (14 dni)
          </h3>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-eliksir-gold"></div>
              <span className="text-white/70">Wyświetlenia</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-blue-400"></div>
              <span className="text-white/70">Użytkownicy</span>
            </div>
          </div>
        </div>
        
        {dailyStats?.daily && dailyStats.daily.length > 0 ? (
          <div className="space-y-4">
            <div className="relative h-64 bg-eliksir-dark/50 rounded-lg p-4">
              {/* Y-axis labels */}
              <div className="absolute left-0 top-4 bottom-4 w-16 flex flex-col justify-between text-right pr-3 text-white/40 text-xs font-mono">
                {[...Array(5)].map((_, i) => {
                  const maxVal = Math.max(
                    Math.max(...dailyStats.daily.map(d => d.views)),
                    Math.max(...dailyStats.daily.map(d => d.uniqueVisitors))
                  );
                  const val = Math.round(maxVal * (1 - i / 4));
                  return <span key={i}>{val}</span>;
                })}
              </div>
              
              {/* Chart area */}
              <div className="ml-16 mr-4 h-full relative">
                <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
                  {/* Grid lines */}
                  {[0, 25, 50, 75, 100].map(y => (
                    <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
                  ))}
                  
                  {/* Unique Visitors Line (Blue) */}
                  <polyline
                    fill="none"
                    stroke="#60A5FA"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={dailyStats.daily.map((day, i) => {
                      const x = (i / (dailyStats.daily.length - 1)) * 100;
                      const maxVal = Math.max(
                        Math.max(...dailyStats.daily.map(d => d.views)),
                        Math.max(...dailyStats.daily.map(d => d.uniqueVisitors))
                      );
                      const y = 100 - (day.uniqueVisitors / maxVal) * 95;
                      return `${x},${y}`;
                    }).join(' ')}
                  />
                  
                  {/* Views Line (Gold) */}
                  <polyline
                    fill="none"
                    stroke="#DAA520"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={dailyStats.daily.map((day, i) => {
                      const x = (i / (dailyStats.daily.length - 1)) * 100;
                      const maxVal = Math.max(
                        Math.max(...dailyStats.daily.map(d => d.views)),
                        Math.max(...dailyStats.daily.map(d => d.uniqueVisitors))
                      );
                      const y = 100 - (day.views / maxVal) * 95;
                      return `${x},${y}`;
                    }).join(' ')}
                  />
                  
                  {/* Data points */}
                  {dailyStats.daily.map((day, i) => {
                    const x = (i / (dailyStats.daily.length - 1)) * 100;
                    const maxVal = Math.max(
                      Math.max(...dailyStats.daily.map(d => d.views)),
                      Math.max(...dailyStats.daily.map(d => d.uniqueVisitors))
                    );
                    const yViews = 100 - (day.views / maxVal) * 95;
                    const yUsers = 100 - (day.uniqueVisitors / maxVal) * 95;
                    return (
                      <g key={i}>
                        <circle cx={x} cy={yViews} r="1.5" fill="#DAA520" className="hover:r-2 transition-all" />
                        <circle cx={x} cy={yUsers} r="1.5" fill="#60A5FA" className="hover:r-2 transition-all" />
                      </g>
                    );
                  })}
                </svg>
                
                {/* Hover tooltips */}
                <div className="absolute inset-0 flex">
                  {dailyStats.daily.map((day, i) => (
                    <div key={i} className="relative group flex-1 h-full cursor-crosshair">
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="absolute left-1/2 transform -translate-x-1/2 w-px h-full bg-white/20"></div>
                        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 -translate-y-full bg-eliksir-dark/95 backdrop-blur border border-white/20 rounded-lg px-3 py-2 text-xs whitespace-nowrap z-10 shadow-xl">
                          <div className="font-bold text-white mb-1">{new Date(day.date).toLocaleDateString('pl-PL', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                          <div className="flex items-center space-x-2 text-eliksir-gold">
                            <div className="w-2 h-2 rounded-full bg-eliksir-gold"></div>
                            <span>{day.views} wyświetleń</span>
                          </div>
                          <div className="flex items-center space-x-2 text-blue-400">
                            <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                            <span>{day.uniqueVisitors} użytkowników</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* X-axis date labels */}
            <div className="ml-16 mr-4 flex justify-between text-white/40 text-xs font-mono">
              {dailyStats.daily.filter((_, i) => i % Math.ceil(dailyStats.daily.length / 7) === 0).map((day) => (
                <span key={day.date}>
                  {new Date(day.date).toLocaleDateString('pl-PL', { month: 'short', day: 'numeric' })}
                </span>
              ))}
            </div>
            
            {/* Summary stats */}
            <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-white/10">
              <div className="text-center">
                <div className="text-2xl font-bold text-eliksir-gold">
                  {dailyStats.daily.reduce((sum, d) => sum + d.views, 0).toLocaleString('pl-PL')}
                </div>
                <div className="text-white/50 text-xs mt-1">Łącznie wyświetleń</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">
                  {Math.round(dailyStats.daily.reduce((sum, d) => sum + d.views, 0) / dailyStats.daily.length).toLocaleString('pl-PL')}
                </div>
                <div className="text-white/50 text-xs mt-1">Średnio dziennie</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  {Math.max(...dailyStats.daily.map(d => d.views)).toLocaleString('pl-PL')}
                </div>
                <div className="text-white/50 text-xs mt-1">Najlepszy dzień</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center">
            <p className="text-white/40">Zbieranie danych...</p>
          </div>
        )}
      </div>

      {/* Traffic Sources & Marketing Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Traffic Sources Breakdown */}
        <div className="bg-eliksir-gray/50 rounded-eliksir border border-white/10 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-playfair text-xl text-eliksir-gold font-bold">
              Źródła Ruchu
            </h3>
            <div className="text-xs text-white/40 font-mono">14 dni</div>
          </div>
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
              
              {/* Total Summary */}
              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-white/60 text-sm">Łącznie wizyt</span>
                <span className="text-white font-bold text-xl">
                  {dailyStats.trafficSources.reduce((sum, s) => sum + s.visits, 0).toLocaleString('pl-PL')}
                </span>
              </div>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center">
              <p className="text-white/40">Zbieranie danych...</p>
            </div>
          )}
        </div>
        
        {/* Marketing Insights & Recommendations */}
        <div className="bg-gradient-to-br from-eliksir-gray/80 to-eliksir-dark/80 rounded-eliksir border border-eliksir-gold/30 p-6 backdrop-blur">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-eliksir-gold/20 flex items-center justify-center">
              <span className="text-2xl">💡</span>
            </div>
            <h3 className="font-playfair text-xl text-eliksir-gold font-bold">
              Analiza i Rekomendacje
            </h3>
          </div>
          
          {dailyStats?.trafficSources && dailyStats.trafficSources.length > 0 ? (
            <div className="space-y-4">
              {/* Performance Alerts */}
              <div className="space-y-3">
                <div className="text-sm font-semibold text-white/80 mb-2">Alerty Marketingowe:</div>
                {dailyStats.trafficSources.map((source) => {
                  const total = dailyStats.trafficSources.reduce((sum, s) => sum + s.visits, 0);
                  const percentage = (source.visits / total * 100).toFixed(1);
                  const percentNum = Number(percentage);
                  
                  if (percentNum < 5) {
                    return (
                      <div key={source.source} className="flex items-start space-x-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                        <span className="text-red-400 text-xl">⚠️</span>
                        <div className="flex-1">
                          <div className="text-red-300 font-semibold text-sm">{source.source}</div>
                          <div className="text-red-200/70 text-xs mt-1">
                            Tylko {percentNum}% ruchu - wymaga zwiększenia aktywności
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }).filter(Boolean)}
                
                {dailyStats.trafficSources.every((source) => {
                  const total = dailyStats.trafficSources.reduce((sum, s) => sum + s.visits, 0);
                  const percentNum = Number((source.visits / total * 100).toFixed(1));
                  return percentNum >= 5;
                }) && (
                  <div className="flex items-start space-x-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <span className="text-green-400 text-xl">✓</span>
                    <div className="flex-1">
                      <div className="text-green-300 font-semibold text-sm">Świetnie!</div>
                      <div className="text-green-200/70 text-xs mt-1">
                        Wszystkie kanały marketingowe działają dobrze
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Action Items */}
              <div className="mt-6 space-y-3">
                <div className="text-sm font-semibold text-white/80 mb-2">Rekomendowane Działania:</div>
                {dailyStats.trafficSources.find(s => {
                  const total = dailyStats.trafficSources.reduce((sum, s) => sum + s.visits, 0);
                  return s.source === 'Google' && (s.visits / total) < 0.25;
                }) && (
                  <div className="p-3 bg-white/5 rounded-lg border border-white/10 hover:border-eliksir-gold/50 transition-colors">
                    <div className="flex items-start space-x-2">
                      <span className="text-lg">🔍</span>
                      <div className="flex-1">
                        <div className="text-white/90 text-sm font-medium">Popraw SEO</div>
                        <div className="text-white/60 text-xs mt-1">
                          Optymalizuj meta tagi, dodaj więcej treści, buduj linki zwrotne
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {dailyStats.trafficSources.find(s => {
                  const total = dailyStats.trafficSources.reduce((sum, s) => sum + s.visits, 0);
                  return s.source === 'Facebook' && (s.visits / total) < 0.15;
                }) && (
                  <div className="p-3 bg-white/5 rounded-lg border border-white/10 hover:border-eliksir-gold/50 transition-colors">
                    <div className="flex items-start space-x-2">
                      <span className="text-lg">📘</span>
                      <div className="flex-1">
                        <div className="text-white/90 text-sm font-medium">Zwiększ aktywność na FB</div>
                        <div className="text-white/60 text-xs mt-1">
                          Publikuj regularnie, angażuj społeczność, testuj reklamy
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {dailyStats.trafficSources.find(s => {
                  const total = dailyStats.trafficSources.reduce((sum, s) => sum + s.visits, 0);
                  return s.source === 'Instagram' && (s.visits / total) < 0.08;
                }) && (
                  <div className="p-3 bg-white/5 rounded-lg border border-white/10 hover:border-eliksir-gold/50 transition-colors">
                    <div className="flex items-start space-x-2">
                      <span className="text-lg">📸</span>
                      <div className="flex-1">
                        <div className="text-white/90 text-sm font-medium">Rozwijaj Instagram</div>
                        <div className="text-white/60 text-xs mt-1">
                          Dodaj Stories z linkiem, publikuj Reels, używaj hashtagów
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center">
              <p className="text-white/40">Zbieranie danych...</p>
            </div>
          )}
        </div>
      </div>

      {/* Top Pages */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
