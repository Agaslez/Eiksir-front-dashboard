// API configuration
// This file can be mocked in tests

export const BACKEND_URL = import.meta.env.VITE_API_URL || "https://eliksir-backend-front-dashboard.onrender.com";

export const API = {
  health: `${BACKEND_URL}/api/health`,
  calculatorConfig: `${BACKEND_URL}/api/calculator/config`,
  galleryPublic: `${BACKEND_URL}/api/content/gallery/public`,
  galleryPanorama: `${BACKEND_URL}/api/content/gallery/public?category=wszystkie`,
  contentSections: `${BACKEND_URL}/api/content/sections`,
  authHealth: `${BACKEND_URL}/api/auth/health`,
  aiHealth: `${BACKEND_URL}/api/ai/health`,
};

// Legacy export for backward compatibility
export const config = {
  apiUrl: BACKEND_URL,
  cloudinaryCloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dxanil4gc',
  gaId: import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-93QYC5BVDR',
};
