import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { config } from './lib/config';
import { ErrorBoundary } from './lib/error-monitoring';
import { initErrorMonitor } from './lib/global-error-monitor';

// Initialize global error monitoring BEFORE React renders
const baseUrl = config.apiUrl;
const API_URL = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;
initErrorMonitor(API_URL);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
