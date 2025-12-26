import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import { users } from '../shared/schema';
import { db } from '../db';
import { JWTService, JWTUserPayload } from '../jwt-auth';

interface LoginRequest {
  email: string;
  password: string;
}

export class JWTAuthController {
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password }: LoginRequest = req.body;

      if (!email || !password) {
        res.status(400).json({
          success: false,
          error: 'Email and password are required'
        });
        return;
      }

      // Find user by email
      const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase()));

      if (!user) {
        res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
        return;
      }

      // Check if user is active
      if (!user.isActive) {
        res.status(403).json({
          success: false,
          error: 'Account is deactivated'
        });
        return;
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
        return;
      }

      // Update last login
      await db.update(users)
        .set({ 
          lastLogin: new Date(),
          updatedAt: new Date(),
          loginAttempts: 0 // Reset login attempts on successful login
        })
        .where(eq(users.id, user.id));

      // Create JWT payload
      const payload: JWTUserPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId || undefined
      };

      // Generate JWT token
      const accessToken = JWTService.generateToken(payload);

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
  }

  async getCurrentUser(req: Request & { user?: any }, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Not authenticated'
        });
        return;
      }

      res.json({
        success: true,
        user: {
          id: req.user.id,
          email: req.user.email,
          role: req.user.role,
          firstName: req.user.firstName || '',
          lastName: req.user.lastName || '',
          tenantId: req.user.tenantId || undefined
        }
      });

    } catch (error) {
      console.error('Get current user error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    try {
      // With JWT, logout is client-side (just remove token)
      // No server-side session to invalidate
      res.json({
        success: true,
        message: 'Logged out successfully'
      });

    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async healthCheck(req: Request, res: Response): Promise<void> {
    res.json({
      success: true,
      service: 'JWT Auth Service',
      status: 'operational',
      timestamp: new Date().toISOString()
    });
  }
}