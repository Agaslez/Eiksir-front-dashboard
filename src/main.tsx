import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { config } from './lib/config';
import { ErrorBoundary } from './lib/error-monitoring';
import { initErrorMonitor } from './lib/global-error-monitor';
import { initLogger } from './lib/logger';

// Initialize monitoring systems BEFORE React renders
const API_URL = config.apiUrl;

// 1. Initialize Logger (professional logging)
initLogger(API_URL);

// 2. Initialize Error Monitor (fetch interceptor + window errors)
initErrorMonitor(API_URL);

// ARCHITECT_APPROVED: Application startup log confirms all monitoring systems initialized - critical for production debugging - 2026-01-02 - Stefan
console.log('🚀 ELIKSIR Frontend Starting - Monitoring Active');

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
