import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { db, users } from '../config/database.js';

const router = Router();

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'eliksir-jwt-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// Login endpoint
router.post('/login', async (req, res) => {
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

    // Verify password (handle both password and password_hash fields)
    const passwordHash = user.password_hash || '';
    if (!passwordHash) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    const isValidPassword = await bcrypt.compare(password, passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Update updated_at
    await db.update(users)
      .set({ 
        updated_at: new Date()
      })
      .where(eq(users.id, user.id));

    // Create JWT payload
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role
    };

    // Generate JWT token
    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    // Return success response
    res.json({
      success: true,
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name || ''
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

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        error: 'Email, password, and name are required'
      });
    }

    // Check if user already exists
    const existing = await db.select().from(users).where(eq(users.email, email.toLowerCase()));

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'User with this email already exists'
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const [newUser] = await db.insert(users).values({
      email: email.toLowerCase(),
      name,
      phone: phone || null,
      password_hash: passwordHash,
      role: 'customer'
    }).returning();

    // Create JWT payload
    const payload = {
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role
    };

    // Generate JWT token
    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    // Return success response
    res.status(201).json({
      success: true,
      accessToken,
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        name: newUser.name || ''
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get current user endpoint
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        error: 'Access token required' 
      });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify JWT
    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET) as any;
    } catch (error) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid or expired token' 
      });
    }

    // Get user from database
    const [user] = await db.select().from(users).where(eq(users.id, payload.userId));
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        error: 'User not found' 
      });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name || ''
      }
    });

  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Logout endpoint
router.post('/logout', (req, res) => {
  // With JWT, logout is client-side (just remove token)
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'JWT Auth Service',
    status: 'operational',
    timestamp: new Date().toISOString()
  });
});

export default router;
