import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';

interface SEOStats {
  totalViews: number;
  recentViews: number;
  uniqueVisitors: number;
  averageTimeOnPage: number;
  bounceRate: number;
  popularPages: Array<{ path: string; views: number }>;
  trafficSources: Array<{ referrer: string; visits: number }>;
}

export default function Analytics() {
  const { user } = useAuth();
  const [stats, setStats] = useState<SEOStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get token from localStorage (AuthContext stores it there)
        const token = localStorage.getItem('eliksir_jwt_token');
        
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await fetch(`${API_BASE_URL}/api/seo/stats`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Unauthorized - please login again');
          }
          throw new Error(`Failed to fetch stats: ${response.status}`);
        }

        const data = await response.json();
        if (data.success && data.data) {
          setStats(data.data);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load analytics');
        console.error('Error fetching SEO stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [API_BASE_URL]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">SEO Analytics</h2>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">SEO Analytics</h2>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 font-medium">Error loading analytics</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">SEO Analytics</h2>
          <p className="text-gray-600 mt-1">
            Statistics for the last 30 days � Updated just now
          </p>
        </div>
        <div className="text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
          Admin: {user?.email}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-700 font-medium">Total Views</p>
              <p className="text-3xl font-bold text-purple-900 mt-2">
                {stats?.totalViews.toLocaleString()}
              </p>
            </div>
            <div className="bg-purple-600 text-white p-3 rounded-full">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
          </div>
          <p className="text-xs text-purple-600 mt-3">All-time page views</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700 font-medium">Recent Views</p>
              <p className="text-3xl font-bold text-blue-900 mt-2">
                {stats?.recentViews.toLocaleString()}
              </p>
            </div>
            <div className="bg-blue-600 text-white p-3 rounded-full">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <p className="text-xs text-blue-600 mt-3">Last 30 days</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700 font-medium">Unique Visitors</p>
              <p className="text-3xl font-bold text-green-900 mt-2">
                {stats?.uniqueVisitors.toLocaleString()}
              </p>
            </div>
            <div className="bg-green-600 text-white p-3 rounded-full">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-xs text-green-600 mt-3">Distinct users (30 days)</p>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-5 border border-amber-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-amber-700 font-medium">Avg. Time on Page</p>
              <p className="text-3xl font-bold text-amber-900 mt-2">
                {stats?.averageTimeOnPage}s
              </p>
            </div>
            <div className="bg-amber-600 text-white p-3 rounded-full">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-xs text-amber-600 mt-3">Seconds per visit</p>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Bounce Rate</h3>
          <div className="flex items-center">
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-red-500 rounded-full" 
                  style={{ width: `${Math.min(stats?.bounceRate || 0, 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-sm text-gray-600 mt-2">
                <span>0%</span>
                <span>100%</span>
              </div>
            </div>
            <div className="ml-4">
              <span className="text-2xl font-bold text-gray-800">{stats?.bounceRate}%</span>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-3">
            Percentage of single-page sessions
          </p>
        </div>

        <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Traffic Sources</h3>
          <div className="space-y-3">
            {stats?.trafficSources && stats.trafficSources.length > 0 ? (
              stats.trafficSources.slice(0, 3).map((source, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                    </div>
                    <span className="text-gray-700 truncate max-w-[150px]">
                      {source.referrer || 'Direct'}
                    </span>
                  </div>
                  <span className="font-semibold text-gray-800">
                    {source.visits} visits
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No traffic source data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Popular Pages */}
      <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Popular Pages</h3>
        <div className="space-y-3">
          {stats?.popularPages && stats.popularPages.length > 0 ? (
            stats.popularPages.map((page, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-purple-600 font-bold">{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{page.path}</p>
                    <p className="text-sm text-gray-500">Page URL</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-800">{page.views.toLocaleString()} views</p>
                  <p className="text-sm text-gray-500">Last 30 days</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm p-3 bg-white rounded-lg border border-gray-100">
              No page view data available
            </p>
          )}
        </div>
      </div>

      <div className="mt-6 text-sm text-gray-500 text-center">
        <p>Data updates automatically. Last tracked page view was recorded recently.</p>
      </div>
    </div>
  );
}
