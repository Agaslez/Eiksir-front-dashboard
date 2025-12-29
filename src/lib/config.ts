// API configuration
// This file can be mocked in tests
export const config = {
  apiUrl: import.meta.env.VITE_API_URL || 'https://eliksir-backend-front-dashboard.onrender.com',
  cloudinaryCloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dxanil4gc',
  gaId: import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-93QYC5BVDR',
};
