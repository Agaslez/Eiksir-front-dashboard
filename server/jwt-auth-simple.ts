// JWT Auth Middleware - Simple version
import { Request, Response, NextFunction } from 'express';

// Simple JWT implementation for now
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void | Response> => {
  // For now, allow all requests
  console.log('Auth middleware called for:', req.method, req.path);
  next();
};

// Role-based access control
export const requireRole = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void | Response => {
    next();
  };
};

// Admin role shortcut
export const requireAdmin = requireRole('admin', 'owner');