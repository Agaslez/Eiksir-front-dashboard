import '@testing-library/jest-dom';

// Polyfill fetch for Node.js environment
if (typeof global.fetch === 'undefined') {
  global.fetch = require('node-fetch');
}

// API BASE URL for tests
const API_URL = 'https://eliksir-backend-front-dashboard.onrender.com';

describe('Backend API Integration Tests', () => {
  describe('Calculator Config Endpoint', () => {
    it('GET /api/calculator/config returns config', async () => {
      const response = await fetch(`${API_URL}/api/calculator/config`);
      const data = await response.json();
      
      expect(response.ok).toBe(true);
      expect(data.success).toBe(true);
      expect(data.config).toBeDefined();
      expect(data.config.promoDiscount).toBeDefined();
      expect(data.config.pricePerExtraGuest).toBeDefined();
      expect(data.config.addons).toBeDefined();
    });

    it('config has correct structure', async () => {
      const response = await fetch(`${API_URL}/api/calculator/config`);
      const data = await response.json();
      
      const config = data.config;
      expect(typeof config.promoDiscount).toBe('number');
      expect(config.promoDiscount).toBeGreaterThanOrEqual(0);
      expect(config.promoDiscount).toBeLessThanOrEqual(1);
      
      expect(config.pricePerExtraGuest).toHaveProperty('basic');
      expect(config.pricePerExtraGuest).toHaveProperty('premium');
      expect(config.pricePerExtraGuest).toHaveProperty('exclusive');
      expect(config.pricePerExtraGuest).toHaveProperty('kids');
      expect(config.pricePerExtraGuest).toHaveProperty('family');
      expect(config.pricePerExtraGuest).toHaveProperty('business');
    });

    it('addons have correct structure', async () => {
      const response = await fetch(`${API_URL}/api/calculator/config`);
      const data = await response.json();
      
      const addons = data.config.addons;
      expect(addons.fountain).toHaveProperty('perGuest');
      expect(addons.fountain).toHaveProperty('min');
      expect(addons.fountain).toHaveProperty('max');
      
      expect(addons.keg).toHaveProperty('pricePerKeg');
      expect(addons.keg).toHaveProperty('guestsPerKeg');
      
      expect(addons.lemonade).toHaveProperty('base');
      expect(addons.lemonade).toHaveProperty('blockGuests');
      
      expect(typeof addons.hockery).toBe('number');
      expect(typeof addons.ledLighting).toBe('number');
    });

    it('PUT /api/calculator/config requires authentication', async () => {
      const response = await fetch(`${API_URL}/api/calculator/config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ promoDiscount: 0.15 }),
      });
      
      // Should return 401 Unauthorized without JWT
      expect(response.status).toBe(401);
    });
  });

  describe('Gallery Endpoint', () => {
    it('GET /api/content/gallery/public returns images', async () => {
      const response = await fetch(`${API_URL}/api/content/gallery/public?category=wszystkie`);
      const data = await response.json();
      
      expect(response.ok).toBe(true);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.images)).toBe(true);
    });

    it('images have required fields', async () => {
      const response = await fetch(`${API_URL}/api/content/gallery/public?category=wszystkie`);
      const data = await response.json();
      
      if (data.images.length > 0) {
        const image = data.images[0];
        expect(image).toHaveProperty('id');
        expect(image).toHaveProperty('url');
        expect(image).toHaveProperty('category');
        expect(image).toHaveProperty('displayOrder');
      }
    });

    it('filters images by category', async () => {
      const response = await fetch(`${API_URL}/api/content/gallery/public?category=wesela`);
      const data = await response.json();
      
      expect(response.ok).toBe(true);
      if (data.images.length > 0) {
        data.images.forEach((img: any) => {
          expect(img.category).toBe('wesela');
        });
      }
    });

    it('returns images sorted by displayOrder', async () => {
      const response = await fetch(`${API_URL}/api/content/gallery/public?category=wszystkie`);
      const data = await response.json();
      
      if (data.images.length > 1) {
        for (let i = 0; i < data.images.length - 1; i++) {
          expect(data.images[i].displayOrder).toBeLessThanOrEqual(
            data.images[i + 1].displayOrder
          );
        }
      }
    });

    it('returns only images with valid URLs', async () => {
      const response = await fetch(`${API_URL}/api/content/gallery/public?category=wszystkie`);
      const data = await response.json();
      
      data.images.forEach((img: any) => {
        expect(img.url).toBeTruthy();
        expect(img.url).toMatch(/^https?:\/\//);
      });
    });
  });

  describe('Content Sections Endpoint', () => {
    it('GET /api/content/sections returns sections', async () => {
      const response = await fetch(`${API_URL}/api/content/sections`);
      const data = await response.json();
      
      expect(response.ok).toBe(true);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.sections)).toBe(true);
    });

    it('sections have required fields', async () => {
      const response = await fetch(`${API_URL}/api/content/sections`);
      const data = await response.json();
      
      if (data.sections.length > 0) {
        const section = data.sections[0];
        expect(section).toHaveProperty('id');
        expect(section).toHaveProperty('name');
        expect(section).toHaveProperty('heading');
      }
    });

    it('includes Hero, About, and Services sections', async () => {
      const response = await fetch(`${API_URL}/api/content/sections`);
      const data = await response.json();
      
      const sectionNames = data.sections.map((s: any) => s.name);
      expect(sectionNames).toContain('hero');
      expect(sectionNames).toContain('about');
      expect(sectionNames).toContain('services');
    });

    it('PUT /api/content/sections/:id requires authentication', async () => {
      const response = await fetch(`${API_URL}/api/content/sections/1`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ heading: 'New Heading' }),
      });
      
      // Should return 401 Unauthorized without JWT
      expect(response.status).toBe(401);
    });
  });

  describe('Gallery Upload Endpoint', () => {
    it('POST /api/content/gallery/upload requires authentication', async () => {
      const formData = new FormData();
      formData.append('file', new Blob(['test']), 'test.jpg');
      formData.append('category', 'wesela');
      
      const response = await fetch(`${API_URL}/api/content/gallery/upload`, {
        method: 'POST',
        body: formData,
      });
      
      // Should return 401 Unauthorized without JWT
      expect(response.status).toBe(401);
    });
  });

  describe('Gallery Delete Endpoint', () => {
    it('DELETE /api/content/gallery/:id requires authentication', async () => {
      const response = await fetch(`${API_URL}/api/content/gallery/999`, {
        method: 'DELETE',
      });
      
      // Should return 401 Unauthorized without JWT
      expect(response.status).toBe(401);
    });
  });

  describe('CORS Configuration', () => {
    it('allows requests from Vercel domain', async () => {
      const response = await fetch(`${API_URL}/api/calculator/config`, {
        headers: {
          'Origin': 'https://eiksir-front-dashboard.vercel.app',
        },
      });
      
      expect(response.ok).toBe(true);
      // CORS headers should be present
      const accessControlHeader = response.headers.get('Access-Control-Allow-Origin');
      expect(accessControlHeader).toBeTruthy();
    });
  });

  describe('Error Handling', () => {
    it('returns 404 for non-existent endpoints', async () => {
      const response = await fetch(`${API_URL}/api/nonexistent`);
      expect(response.status).toBe(404);
    });

    it('returns proper error format', async () => {
      const response = await fetch(`${API_URL}/api/calculator/config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      
      if (!response.ok) {
        const data = await response.json();
        expect(data).toHaveProperty('error');
      }
    });
  });

  describe('Response Performance', () => {
    it('responds within acceptable time (< 2s)', async () => {
      const start = Date.now();
      await fetch(`${API_URL}/api/calculator/config`);
      const duration = Date.now() - start;
      
      expect(duration).toBeLessThan(2000);
    });

    it('gallery endpoint responds within 3s', async () => {
      const start = Date.now();
      await fetch(`${API_URL}/api/content/gallery/public?category=wszystkie`);
      const duration = Date.now() - start;
      
      expect(duration).toBeLessThan(3000);
    });
  });
});
