module.exports = {
  presets: [
    ['@babel/preset-typescript', { jsxTransform: 'react-jsx' }],
    '@babel/preset-react',
  ],
  plugins: [
    ['babel-plugin-transform-vite-meta-env', {
      env: {
        VITE_API_URL: 'https://stefano-eliksir-backend.onrender.com',
        VITE_CLOUDINARY_CLOUD_NAME: 'dxanil4gc',
        VITE_GA_MEASUREMENT_ID: 'G-93QYC5BVDR',
      },
    }],
  ],
};
