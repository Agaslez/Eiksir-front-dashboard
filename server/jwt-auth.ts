import jwt from 'jsonwebtoken';
import { eq } from 'drizzle-orm';
import { Request, Response, NextFunction } from 'express';
import { users } from '../shared/schema';
import { db } from './db';

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'eliksir-jwt-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// Interfaces
export interface JWTUserPayload {
  userId: number;
  email: string;
  role: string;
  tenantId?: number;
}

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
    tenantId?: number;
    firstName?: string;
    lastName?: string;
  };
}

// JWT Service
export class JWTService {
  static generateToken(payload: JWTUserPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  }

  static verifyToken(token: string): JWTUserPayload | null {
    try {
      return jwt.verify(token, JWT_SECRET) as JWTUserPayload;
    } catch (error) {
      return null;
    }
  }

  static decodeToken(token: string): JWTUserPayload | null {
    try {
      return jwt.decode(token) as JWTUserPayload;
    } catch (error) {
      return null;
    }
  }
}

// Auth Middleware
export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void | Response> => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      success: false, 
      error: 'Access token required' 
    });
  }

  const token = authHeader.split(' ')[1];
  
  // Verify JWT
  const payload = JWTService.verifyToken(token);
  if (!payload) {
    return res.status(401).json({ 
      success: false, 
      error: 'Invalid or expired token' 
    });
  }

  // Check if user still exists and is active
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

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId || undefined,
      firstName: user.firstName || undefined,
      lastName: user.lastName || undefined,
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

// Role-based access control
export const requireRole = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void | Response => {
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

// Admin role shortcut
export const requireAdmin = requireRole('admin', 'owner');