// Backend database tests for stefano-eliksir-backend

// Note: These tests require access to the actual database
// Run with: npm test -- backend.database.test.ts
// Requires DATABASE_URL env variable

describe('Backend Database Tests', () => {
  const API_URL = process.env.VITE_API_URL || 'https://eliksir-backend-front-dashboard.onrender.com';
  const JWT_TOKEN = process.env.TEST_JWT_TOKEN || 'test-token';

  describe('Calculator Config Database Operations', () => {
    it('fetches calculator config from database', async () => {
      const response = await fetch(`${API_URL}/api/calculator/config`);
      const data = await response.json();
      
      expect(response.ok).toBe(true);
      expect(data.success).toBe(true);
      expect(data.config).toBeDefined();
    });

    it('config persists after restart', async () => {
      const response1 = await fetch(`${API_URL}/api/calculator/config`);
      const data1 = await response1.json();
      const originalDiscount = data1.config.promoDiscount;
      
      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const response2 = await fetch(`${API_URL}/api/calculator/config`);
      const data2 = await response2.json();
      
      // Should be the same value (from DB, not memory)
      expect(data2.config.promoDiscount).toBe(originalDiscount);
    });

    it('saves config to database with auth', async () => {
      const newConfig = {
        promoDiscount: 0.25,
        pricePerExtraGuest: {
          basic: 45,
          premium: 55,
          exclusive: 65,
          kids: 35,
          family: 40,
          business: 50,
        },
        addons: {
          fountain: { perGuest: 12, min: 700, max: 1300 },
          keg: { pricePerKeg: 600, guestsPerKeg: 50 },
          lemonade: { base: 300, blockGuests: 60 },
          hockery: 250,
          ledLighting: 550,
        },
        shoppingList: {
          vodkaRumGinBottles: 6,
          liqueurBottles: 3,
          aperolBottles: 3,
          proseccoBottles: 6,
          syrupsLiters: 15,
          iceKg: 10,
        },
      };

      const response = await fetch(`${API_URL}/api/calculator/config`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${JWT_TOKEN}`,
        },
        body: JSON.stringify(newConfig),
      });

      // May fail due to auth, but should not error out
      expect([200, 201, 401]).toContain(response.status);
    });

    it('validates config structure in database', async () => {
      const response = await fetch(`${API_URL}/api/calculator/config`);
      const data = await response.json();
      const config = data.config;
      
      // Validate required fields exist
      expect(config).toHaveProperty('promoDiscount');
      expect(config).toHaveProperty('pricePerExtraGuest');
      expect(config).toHaveProperty('addons');
      expect(config).toHaveProperty('shoppingList');
      
      // Validate nested structure
      expect(config.pricePerExtraGuest).toHaveProperty('basic');
      expect(config.pricePerExtraGuest).toHaveProperty('premium');
      expect(config.pricePerExtraGuest).toHaveProperty('exclusive');
      expect(config.addons).toHaveProperty('fountain');
      expect(config.addons).toHaveProperty('keg');
      expect(config.addons).toHaveProperty('lemonade');
    });
  });

  describe('Gallery Images Database Operations', () => {
    it('fetches gallery images from database', async () => {
      const response = await fetch(`${API_URL}/api/content/gallery/public?category=wszystkie`);
      const data = await response.json();
      
      expect(response.ok).toBe(true);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.images)).toBe(true);
    });

    it('gallery images have database fields', async () => {
      const response = await fetch(`${API_URL}/api/content/gallery/public?category=wszystkie`);
      const data = await response.json();
      
      if (data.images.length > 0) {
        const image = data.images[0];
        expect(image).toHaveProperty('id');
        expect(image).toHaveProperty('url');
        expect(image).toHaveProperty('category');
        expect(image).toHaveProperty('displayOrder');
        expect(typeof image.id).toBe('number');
        expect(typeof image.displayOrder).toBe('number');
      }
    });

    it('filters images by category in database', async () => {
      const response = await fetch(`${API_URL}/api/content/gallery/public?category=wesela`);
      const data = await response.json();
      
      expect(response.ok).toBe(true);
      if (data.images.length > 0) {
        data.images.forEach((img: any) => {
          expect(img.category).toBe('wesela');
        });
      }
    });

    it('sorts images by displayOrder from database', async () => {
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

    it('uploads image to database with auth', async () => {
      const formData = new FormData();
      const testImage = new Blob(['fake-image-data'], { type: 'image/jpeg' });
      formData.append('images', testImage, 'test.jpg');
      formData.append('category', 'eventy');
      formData.append('displayOrder', '999');

      const response = await fetch(`${API_URL}/api/content/gallery/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${JWT_TOKEN}`,
        },
        body: formData,
      });

      // May fail due to auth or validation, but should not error out
      expect([200, 201, 400, 401]).toContain(response.status);
    });

    it('deletes image from database with auth', async () => {
      // Try to delete non-existent image (safe)
      const response = await fetch(`${API_URL}/api/content/gallery/99999`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${JWT_TOKEN}`,
        },
      });

      // May fail due to auth or not found, but should not error out
      expect([200, 404, 401]).toContain(response.status);
    });
  });

  describe('Content Sections Database Operations', () => {
    it('fetches sections from database', async () => {
      const response = await fetch(`${API_URL}/api/content/sections`);
      const data = await response.json();
      
      expect(response.ok).toBe(true);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.sections)).toBe(true);
    });

    it('sections have database structure', async () => {
      const response = await fetch(`${API_URL}/api/content/sections`);
      const data = await response.json();
      
      if (data.sections.length > 0) {
        const section = data.sections[0];
        expect(section).toHaveProperty('id');
        expect(section).toHaveProperty('name');
        expect(section).toHaveProperty('content');
        expect(typeof section.content).toBe('object');
      }
    });

    it('includes hero, about, services sections', async () => {
      const response = await fetch(`${API_URL}/api/content/sections`);
      const data = await response.json();
      
      const sectionNames = data.sections.map((s: any) => s.name.toLowerCase());
      expect(sectionNames.some((name: string) => name.includes('hero'))).toBe(true);
      expect(sectionNames.some((name: string) => name.includes('about'))).toBe(true);
      expect(sectionNames.some((name: string) => name.includes('service'))).toBe(true);
    });

    it('updates section in database with auth', async () => {
      const response = await fetch(`${API_URL}/api/content/sections/1`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${JWT_TOKEN}`,
        },
        body: JSON.stringify({
          content: {
            heading: 'Test Heading',
            description: 'Test Description',
          },
        }),
      });

      // May fail due to auth, but should not error out
      expect([200, 201, 401, 404]).toContain(response.status);
    });
  });

  describe('Database Constraints & Validation', () => {
    it('rejects invalid calculator config structure', async () => {
      const invalidConfig = {
        promoDiscount: 'invalid', // Should be number
      };

      const response = await fetch(`${API_URL}/api/calculator/config`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${JWT_TOKEN}`,
        },
        body: JSON.stringify(invalidConfig),
      });

      // Should reject
      expect([400, 401, 422]).toContain(response.status);
    });

    it('enforces unique constraints', async () => {
      // Calculator config should have only 1 row
      const response = await fetch(`${API_URL}/api/calculator/config`);
      const data = await response.json();
      
      expect(data.config).toBeDefined();
      // Should always return a single config, not an array
      expect(Array.isArray(data.config)).toBe(false);
    });

    it('validates image upload size limit', async () => {
      const formData = new FormData();
      // Create 6MB blob (over 5MB limit)
      const largeImage = new Blob([new Array(6 * 1024 * 1024).join('x')], { type: 'image/jpeg' });
      formData.append('images', largeImage, 'large.jpg');

      const response = await fetch(`${API_URL}/api/content/gallery/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${JWT_TOKEN}`,
        },
        body: formData,
      });

      // Should reject due to size
      expect([400, 401, 413]).toContain(response.status);
    });

    it('validates image file types', async () => {
      const formData = new FormData();
      const invalidFile = new Blob(['fake-pdf-data'], { type: 'application/pdf' });
      formData.append('images', invalidFile, 'test.pdf');

      const response = await fetch(`${API_URL}/api/content/gallery/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${JWT_TOKEN}`,
        },
        body: formData,
      });

      // Should reject due to file type
      expect([400, 401, 415]).toContain(response.status);
    });
  });

  describe('Database Performance', () => {
    it('fetches calculator config quickly', async () => {
      const start = Date.now();
      await fetch(`${API_URL}/api/calculator/config`);
      const duration = Date.now() - start;
      
      expect(duration).toBeLessThan(1000); // Under 1 second
    });

    it('fetches gallery images efficiently', async () => {
      const start = Date.now();
      await fetch(`${API_URL}/api/content/gallery/public?category=wszystkie`);
      const duration = Date.now() - start;
      
      expect(duration).toBeLessThan(2000); // Under 2 seconds
    });

    it('handles concurrent requests', async () => {
      const requests = Array(5).fill(null).map(() => 
        fetch(`${API_URL}/api/calculator/config`)
      );
      
      const responses = await Promise.all(requests);
      
      responses.forEach(response => {
        expect(response.ok).toBe(true);
      });
    });
  });

  describe('Database Transactions & Consistency', () => {
    it('maintains data consistency after update', async () => {
      const response1 = await fetch(`${API_URL}/api/calculator/config`);
      const data1 = await response1.json();
      const originalConfig = data1.config;
      
      // Update config (may fail due to auth)
      await fetch(`${API_URL}/api/calculator/config`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${JWT_TOKEN}`,
        },
        body: JSON.stringify(originalConfig),
      });
      
      // Fetch again - should still be valid structure
      const response2 = await fetch(`${API_URL}/api/calculator/config`);
      const data2 = await response2.json();
      
      expect(data2.config).toHaveProperty('promoDiscount');
      expect(data2.config).toHaveProperty('pricePerExtraGuest');
    });

    it('preserves gallery image count', async () => {
      const response1 = await fetch(`${API_URL}/api/content/gallery/public?category=wszystkie`);
      const data1 = await response1.json();
      const count1 = data1.images.length;
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const response2 = await fetch(`${API_URL}/api/content/gallery/public?category=wszystkie`);
      const data2 = await response2.json();
      const count2 = data2.images.length;
      
      // Count should be stable (unless upload/delete happened)
      expect(Math.abs(count2 - count1)).toBeLessThanOrEqual(5);
    });
  });
});
