import { Router } from 'express';
import bcrypt from 'bcrypt';
import { eq, sql, count, gte } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import { db } from '../db';
import { users, page_views } from '../../shared/schema';
import aiRouter from './ai';
import configRouter from './config';
import echoRouter from './echo';

const api = Router();

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'eliksir-jwt-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// Helper: Generate JWT token
const generateToken = (user: any) => {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    tenantId: user.tenantId || undefined
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// Helper: Verify JWT token
const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, JWT_SECRET) as any;
  } catch (error) {
    return null;
  }
};

// Middleware: authenticateToken
export const authenticateToken = async (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      success: false, 
      error: 'Access token required' 
    });
  }

  const token = authHeader.split(' ')[1];
  const payload = verifyToken(token);
  
  if (!payload) {
    return res.status(401).json({ 
      success: false, 
      error: 'Invalid or expired token' 
    });
  }

  // Get user from database
  try {
    const [user] = await db.select().from(users).where(eq(users.id, payload.userId));
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        error: 'User not found' 
      });
    }

    if (!user.isActive) {
      return res.status(403).json({ 
        success: false, 
        error: 'Account is deactivated' 
      });
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      tenantId: user.tenantId || undefined
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
};

// Middleware: requireRole
export const requireRole = (...allowedRoles: string[]) => {
  return (req: any, res: any, next: any) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        error: 'Authentication required' 
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        error: 'Insufficient permissions' 
      });
    }

    next();
  };
};

// Helper: Generate visitor ID
const generateVisitorId = (req: any): string => {
  const ip = req.ip || 'unknown';
  const userAgent = req.headers['user-agent'] || 'unknown';
  return Buffer.from(ip + userAgent).toString('base64').substring(0, 32);
};

// Public auth endpoints
api.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    // Find user by email
    const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase()));
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        error: 'Account is deactivated'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Update last login
    await db.update(users)
      .set({ 
        lastLogin: new Date(),
        updatedAt: new Date(),
        loginAttempts: 0
      })
      .where(eq(users.id, user.id));

    // Generate JWT token
    const accessToken = generateToken(user);

    // Return success response
    res.json({
      success: true,
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        tenantId: user.tenantId || undefined
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

api.get('/auth/me', authenticateToken, (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

api.get('/auth/health', (req, res) => {
  res.json({
    success: true,
    service: 'Auth Service',
    status: 'operational',
    timestamp: new Date().toISOString()
  });
});

// SEO Endpoints
// POST /api/seo/track - Track page view (public)
api.post('/seo/track', async (req, res) => {
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
api.get('/seo/meta/:page', async (req, res) => {
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
api.get('/seo/stats', authenticateToken, requireRole('admin', 'owner'), async (req, res) => {
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

    // Calculate bounce rate (simplified)
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
        trafficSources: trafficSourcesResult.filter(s => s.referrer)
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

// Health check endpoint (public)
api.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: ['auth', 'ai', 'echo', 'seo'],
    version: '1.0.0',
  });
});

// Mount other routers (protected)
api.use('/ai', authenticateToken, aiRouter);
api.use('/config', authenticateToken, configRouter);
api.use('/echo', authenticateToken, echoRouter);

// 404 handler for API routes
api.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: `Endpoint ${req.method} ${req.originalUrl} not found`,
    availableEndpoints: [
      'POST /api/auth/login',
      'GET /api/auth/me',
      'GET /api/auth/health',
      'POST /api/seo/track',
      'GET /api/seo/meta/:page',
      'GET /api/seo/stats',
      'GET /api/health',
      'GET /api/config',
      'POST /api/config',
      'POST /api/ai/seo',
      'POST /api/ai/social',
      'GET /api/ai/health',
      'GET /api/echo',
      'POST /api/echo',
    ],
  });
});

export default api;