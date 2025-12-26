import { Router } from 'express';

const router = Router();

router.get('/debug', (req, res) => {
  console.log('Debug endpoint called');
  res.json({
    success: true,
    message: 'Debug endpoint working',
    timestamp: new Date().toISOString(),
    headers: req.headers,
  });
});

router.post('/debug-login', async (req, res) => {
  try {
    console.log('Debug login called with body:', req.body);
    
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email and password required' 
      });
    }

    // Simple hardcoded check for now
    if (email === 'admin@eliksir-bar.pl' && password === 'Admin123!') {
      return res.json({
        success: true,
        message: 'Login successful (debug)',
        user: { email, role: 'owner' }
      });
    }

    res.status(401).json({
      success: false,
      error: 'Invalid credentials'
    });

  } catch (error) {
    console.error('Debug login error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

export default router;