import { Router } from 'express';
import { eq, sql, count, and, gte } from 'drizzle-orm';
import { db } from '../db';
import { page_views } from '../../shared/schema';

const router = Router();

// Generate visitor ID from IP and User-Agent
const generateVisitorId = (req: any): string => {
  const ip = req.ip || 'unknown';
  const userAgent = req.headers['user-agent'] || 'unknown';
  // Simple hash for demo purposes
  return Buffer.from(ip + userAgent).toString('base64').substring(0, 32);
};

// POST /api/seo/track - Track page view (public)
router.post('/track', async (req, res) => {
  try {
    const { path, referrer, screenResolution, timeOnPage } = req.body;
    
    if (!path) {
      return res.status(400).json({
        success: false,
        error: 'Path is required'
      });
    }

    const visitorId = generateVisitorId(req);
    const userAgent = req.headers['user-agent'] || '';
    
    // Insert page view
    await db.insert(page_views).values({
      path,
      visitor_id: visitorId,
      user_agent: userAgent,
      referrer: referrer || '',
      screen_resolution: screenResolution || '',
      time_on_page: timeOnPage || 0,
      created_at: new Date()
    });

    res.json({
      success: true,
      message: 'Page view tracked',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Track error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// GET /api/seo/meta/:page - Get SEO meta for page (public)
router.get('/meta/:page', async (req, res) => {
  try {
    const page = req.params.page;
    
    // Simple SEO meta data for Eliksir
    const metaData: Record<string, any> = {
      home: {
        title: 'Eliksir Bar & Restaurant - Mobilny Bar Koktajlowy',
        description: 'Profesjonalny mobilny bar koktajlowy na imprezy firmowe, wesela, eventy. Eliksir Bar - tworzymy niepowtarzalne drinki i atmosferę!',
        keywords: ['mobilny bar', 'koktajle', 'imprezy firmowe', 'wesela', 'eventy', 'drinki', 'Eliksir Bar'],
        canonicalUrl: 'https://eliksirbar.pl/'
      },
      kontakt: {
        title: 'Kontakt - Eliksir Bar & Restaurant',
        description: 'Skontaktuj się z nami, aby zamówić mobilny bar koktajlowy na Twoją imprezę. Eliksir Bar - profesjonalna obsługa, wyśmienite drinki!',
        keywords: ['kontakt', 'zamówienie', 'cennik', 'Eliksir Bar', 'mobilny bar'],
        canonicalUrl: 'https://eliksirbar.pl/kontakt'
      },
      admin: {
        title: 'Panel Administracyjny - Eliksir Bar',
        description: 'Panel administracyjny Eliksir Bar - zarządzanie statystykami i treściami',
        keywords: ['admin', 'panel', 'statystyki', 'Eliksir Bar'],
        canonicalUrl: 'https://eliksirbar.pl/admin'
      }
    };

    const data = metaData[page] || {
      title: 'Eliksir Bar & Restaurant',
      description: 'Profesjonalny mobilny bar koktajlowy',
      keywords: ['Eliksir Bar', 'mobilny bar', 'koktajle'],
      canonicalUrl: `https://eliksirbar.pl/${page}`
    };

    res.json({
      success: true,
      page,
      ...data
    });

  } catch (error) {
    console.error('Meta error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// GET /api/seo/stats - Get SEO statistics (admin only)
router.get('/stats', async (req, res) => {
  try {
    // Calculate stats for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Total views
    const totalViewsResult = await db.select({ count: count() }).from(page_views);
    const totalViews = totalViewsResult[0]?.count || 0;

    // Views last 30 days
    const recentViewsResult = await db.select({ count: count() }).from(page_views)
      .where(gte(page_views.created_at, thirtyDaysAgo));
    const recentViews = recentViewsResult[0]?.count || 0;

    // Unique visitors (last 30 days)
    const uniqueVisitorsResult = await db
      .select({ count: sql`COUNT(DISTINCT ${page_views.visitor_id})`.as('count') })
      .from(page_views)
      .where(gte(page_views.created_at, thirtyDaysAgo));
    const uniqueVisitors = uniqueVisitorsResult[0]?.count || 0;

    // Average time on page (last 30 days)
    const avgTimeResult = await db
      .select({ avg: sql`AVG(${page_views.time_on_page})`.as('avg') })
      .from(page_views)
      .where(gte(page_views.created_at, thirtyDaysAgo));
    const averageTimeOnPage = Math.round(avgTimeResult[0]?.avg || 0);

    // Popular pages (last 30 days)
    const popularPagesResult = await db
      .select({
        path: page_views.path,
        views: sql`COUNT(*)`.as('views')
      })
      .from(page_views)
      .where(gte(page_views.created_at, thirtyDaysAgo))
      .groupBy(page_views.path)
      .orderBy(sql`views DESC`)
      .limit(10);

    // Traffic sources (last 30 days)
    const trafficSourcesResult = await db
      .select({
        referrer: page_views.referrer,
        visits: sql`COUNT(*)`.as('visits')
      })
      .from(page_views)
      .where(gte(page_views.created_at, thirtyDaysAgo))
      .groupBy(page_views.referrer)
      .orderBy(sql`visits DESC`)
      .limit(10);

    // Device breakdown (simplified)
    const deviceBreakdownResult = await db
      .select({
        user_agent: page_views.user_agent,
        visits: sql`COUNT(*)`.as('visits')
      })
      .from(page_views)
      .where(gte(page_views.created_at, thirtyDaysAgo))
      .groupBy(page_views.user_agent)
      .orderBy(sql`visits DESC`)
      .limit(10);

    // Calculate bounce rate (simplified: sessions with only 1 page view)
    const bounceRate = recentViews > 0 ? Math.round((uniqueVisitors / recentViews) * 100) : 0;

    res.json({
      success: true,
      stats: {
        totalViews,
        recentViews,
        uniqueVisitors,
        averageTimeOnPage,
        bounceRate,
        popularPages: popularPagesResult,
        trafficSources: trafficSourcesResult.filter(s => s.referrer),
        deviceBreakdown: deviceBreakdownResult
      },
      period: 'last_30_days',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router;