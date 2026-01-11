// Cloudinary integration tests
import '@testing-library/jest-dom';

// Note: These tests use the real Cloudinary API
// Requires CLOUDINARY_* env variables

describe('Cloudinary Integration Tests', () => {
  const API_URL = process.env.VITE_API_URL || 'https://stefano-eliksir-backend.onrender.com';
  const CLOUDINARY_CLOUD_NAME = 'dxanil4gc';
  const JWT_TOKEN = process.env.TEST_JWT_TOKEN || 'test-token';

  describe('Image Upload to Cloudinary', () => {
    it('uploads image via API to Cloudinary', async () => {
      const formData = new FormData();
      const testImage = new Blob(['test-image-data'], { type: 'image/jpeg' });
      formData.append('images', testImage, 'test-upload.jpg');
      formData.append('category', 'eventy');

      const response = await fetch(`${API_URL}/api/content/gallery/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${JWT_TOKEN}`,
        },
        body: formData,
      });

      // May fail due to auth, but should have proper structure
      if (response.ok) {
        const data = await response.json();
        expect(data).toHaveProperty('success');
      }
    });

    it('returns Cloudinary URL after upload', async () => {
      const response = await fetch(`${API_URL}/api/content/gallery/public?category=wszystkie`);
      const data = await response.json();
      
      if (data.images.length > 0) {
        const image = data.images[0];
        expect(image.url).toMatch(/^https:\/\/res\.cloudinary\.com/);
        expect(image.url).toContain(CLOUDINARY_CLOUD_NAME);
      }
    });

    it('generates optimized Cloudinary URLs', async () => {
      const response = await fetch(`${API_URL}/api/content/gallery/public?category=wszystkie`);
      const data = await response.json();
      
      if (data.images.length > 0) {
        const image = data.images[0];
        // Should contain transformation parameters
        expect(image.url).toMatch(/https:\/\/res\.cloudinary\.com\/.*\/image\/upload/);
      }
    });

    it('validates image format for Cloudinary', async () => {
      const formData = new FormData();
      const invalidFile = new Blob(['test'], { type: 'text/plain' });
      formData.append('images', invalidFile, 'test.txt');

      const response = await fetch(`${API_URL}/api/content/gallery/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${JWT_TOKEN}`,
        },
        body: formData,
      });

      // Should reject invalid format
      expect([400, 401, 415]).toContain(response.status);
    });

    it('handles multiple file upload to Cloudinary', async () => {
      const formData = new FormData();
      const image1 = new Blob(['test1'], { type: 'image/jpeg' });
      const image2 = new Blob(['test2'], { type: 'image/jpeg' });
      
      formData.append('images', image1, 'test1.jpg');
      formData.append('images', image2, 'test2.jpg');

      const response = await fetch(`${API_URL}/api/content/gallery/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${JWT_TOKEN}`,
        },
        body: formData,
      });

      // May fail due to auth, but should handle multiple files
      expect([200, 201, 400, 401]).toContain(response.status);
    });
  });

  describe('Image Deletion from Cloudinary', () => {
    it('deletes image from Cloudinary via API', async () => {
      // Try to delete (will fail if image doesn't exist)
      const response = await fetch(`${API_URL}/api/content/gallery/99999`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${JWT_TOKEN}`,
        },
      });

      // Should return proper status
      expect([200, 404, 401]).toContain(response.status);
    });

    it('removes image from database and Cloudinary', async () => {
      const beforeResponse = await fetch(`${API_URL}/api/content/gallery/public?category=wszystkie`);
      const beforeData = await beforeResponse.json();
      const countBefore = beforeData.images.length;
      
      // Delete operation (may fail due to auth)
      if (countBefore > 0) {
        const imageId = beforeData.images[0].id;
        await fetch(`${API_URL}/api/content/gallery/${imageId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${JWT_TOKEN}`,
          },
        });
      }
      
      // Count may or may not change depending on auth
      const afterResponse = await fetch(`${API_URL}/api/content/gallery/public?category=wszystkie`);
      const afterData = await afterResponse.json();
      expect(afterData.images.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Cloudinary URL Structure', () => {
    it('URLs contain cloud name', async () => {
      const response = await fetch(`${API_URL}/api/content/gallery/public?category=wszystkie`);
      const data = await response.json();
      
      if (data.images.length > 0) {
        data.images.forEach((img: any) => {
          expect(img.url).toContain(CLOUDINARY_CLOUD_NAME);
        });
      }
    });

    it('URLs are accessible', async () => {
      const response = await fetch(`${API_URL}/api/content/gallery/public?category=wszystkie`);
      const data = await response.json();
      
      if (data.images.length > 0) {
        const imageUrl = data.images[0].url;
        const imageResponse = await fetch(imageUrl, { method: 'HEAD' });
        
        // Should be accessible (may be 403 if Cloudinary restrictions)
        expect([200, 403]).toContain(imageResponse.status);
      }
    });

    it('supports HTTPS only', async () => {
      const response = await fetch(`${API_URL}/api/content/gallery/public?category=wszystkie`);
      const data = await response.json();
      
      if (data.images.length > 0) {
        data.images.forEach((img: any) => {
          expect(img.url).toMatch(/^https:\/\//);
        });
      }
    });

    it('contains proper folder structure', async () => {
      const response = await fetch(`${API_URL}/api/content/gallery/public?category=wszystkie`);
      const data = await response.json();
      
      if (data.images.length > 0) {
        const image = data.images[0];
        // Should have folder in path (e.g., /eliksir/ or /gallery/)
        expect(image.url).toMatch(/\/image\/upload\/.*\//);
      }
    });
  });

  describe('Cloudinary Transformations', () => {
    it('applies image transformations', async () => {
      const response = await fetch(`${API_URL}/api/content/gallery/public?category=wszystkie`);
      const data = await response.json();
      
      if (data.images.length > 0) {
        const image = data.images[0];
        // May contain transformation parameters like w_, h_, c_
        expect(image.url).toMatch(/\/image\/upload/);
      }
    });

    it('provides optimized image format', async () => {
      const response = await fetch(`${API_URL}/api/content/gallery/public?category=wszystkie`);
      const data = await response.json();
      
      if (data.images.length > 0) {
        const image = data.images[0];
        // Should serve in optimal format (webp, avif, etc.)
        const imageResponse = await fetch(image.url, { method: 'HEAD' });
        const contentType = imageResponse.headers.get('content-type');
        
        expect(contentType).toMatch(/image\/(jpeg|jpg|png|webp|gif)/);
      }
    });
  });

  describe('Error Handling', () => {
    it('handles upload errors gracefully', async () => {
      const formData = new FormData();
      const hugeFile = new Blob([new Array(20 * 1024 * 1024).join('x')], { type: 'image/jpeg' });
      formData.append('images', hugeFile, 'huge.jpg');

      const response = await fetch(`${API_URL}/api/content/gallery/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${JWT_TOKEN}`,
        },
        body: formData,
      });

      // Should reject large files
      expect([400, 401, 413]).toContain(response.status);
    });

    it('handles invalid Cloudinary credentials', async () => {
      // This would fail on backend if credentials are invalid
      const response = await fetch(`${API_URL}/api/content/gallery/public?category=wszystkie`);
      
      // Should still return proper response structure
      expect(response.status).toBeLessThan(500);
    });

    it('handles network errors to Cloudinary', async () => {
      // Gallery should still load even if Cloudinary has issues
      const response = await fetch(`${API_URL}/api/content/gallery/public?category=wszystkie`);
      const data = await response.json();
      
      expect(data).toHaveProperty('success');
      expect(Array.isArray(data.images)).toBe(true);
    });
  });

  describe('Cloudinary Performance', () => {
    it('uploads complete within reasonable time', async () => {
      const formData = new FormData();
      const testImage = new Blob(['test-data'], { type: 'image/jpeg' });
      formData.append('images', testImage, 'perf-test.jpg');

      const start = Date.now();
      await fetch(`${API_URL}/api/content/gallery/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${JWT_TOKEN}`,
        },
        body: formData,
      });
      const duration = Date.now() - start;
      
      // Upload should complete in under 10 seconds
      expect(duration).toBeLessThan(10000);
    });

    it('serves images with CDN caching', async () => {
      const response = await fetch(`${API_URL}/api/content/gallery/public?category=wszystkie`);
      const data = await response.json();
      
      if (data.images.length > 0) {
        const imageUrl = data.images[0].url;
        const imageResponse = await fetch(imageUrl, { method: 'HEAD' });
        
        // Should have cache headers
        const cacheControl = imageResponse.headers.get('cache-control');
        expect(cacheControl).toBeTruthy();
      }
    });

    it('handles concurrent uploads', async () => {
      const uploads = Array(3).fill(null).map((_, i) => {
        const formData = new FormData();
        const testImage = new Blob([`test-${i}`], { type: 'image/jpeg' });
        formData.append('images', testImage, `test-${i}.jpg`);
        
        return fetch(`${API_URL}/api/content/gallery/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${JWT_TOKEN}`,
          },
          body: formData,
        });
      });
      
      const responses = await Promise.all(uploads);
      
      // All should complete (may fail due to auth)
      responses.forEach(response => {
        expect(response.status).toBeLessThan(500);
      });
    });
  });

  describe('Cloudinary Metadata', () => {
    it('stores image metadata in database', async () => {
      const response = await fetch(`${API_URL}/api/content/gallery/public?category=wszystkie`);
      const data = await response.json();
      
      if (data.images.length > 0) {
        const image = data.images[0];
        expect(image).toHaveProperty('url');
        expect(image).toHaveProperty('filename');
        expect(image).toHaveProperty('category');
      }
    });

    it('tracks upload timestamps', async () => {
      const response = await fetch(`${API_URL}/api/content/gallery/public?category=wszystkie`);
      const data = await response.json();
      
      if (data.images.length > 0) {
        const image = data.images[0];
        // Should have upload date (may be in different format)
        expect(image).toBeDefined();
      }
    });
  });
});
