/**
 * SINGLE SOURCE OF TRUTH - Frontend Structure
 * Agent MUST follow this schema. Any deviation = BLOCKED.
 * Last updated: 2026-01-11
 */

// ============================================
// 🌍 PROJECT URLS - CANONICAL REFERENCES
// ============================================
export const PROJECT_URLS = {
  // Production Deployments
  frontend: {
    production: 'https://eiksir-front-dashboard.vercel.app',
    vercel: 'https://eiksir-front-dashboard.vercel.app',
    github: 'https://github.com/Agaslez/Eiksir-front-dashboard',
  },
  backend: {
    production: 'https://stefano-eliksir-backend.onrender.com',
    render: 'https://stefano-eliksir-backend.onrender.com',
    github: 'https://github.com/Agaslez/stefano-eliksir-backend',
  },
  // Development
  local: {
    frontend: 'http://localhost:5173',
    backend: 'http://localhost:3001',
  },
  // External Services
  database: {
    provider: 'Neon PostgreSQL',
    host: 'ep-falling-cell-a2xyj6mh.eu-central-1.aws.neon.tech',
    name: 'eliksir-database',
  },
  cdn: {
    cloudinary: 'https://res.cloudinary.com/drlkgoter',
    cloudName: 'drlkgoter',
  },
  analytics: {
    googleAnalytics: 'G-93QYC5BVDR',
    facebookPixel: '756005747529490',
  },
} as const;

// ============================================
// 📁 PROJECT PATHS - FILE SYSTEM STRUCTURE
// ============================================
export const PROJECT_PATHS = {
  // Workspace Root
  workspace: 'd:/REP/eliksir-website.tar',
  
  // Frontend Paths
  frontend: {
    root: 'd:/REP/eliksir-website.tar/eliksir-frontend',
    src: 'src',
    components: 'src/components',
    pages: 'src/pages',
    hooks: 'src/hooks',
    lib: 'src/lib',
    styles: 'src/styles',
    assets: 'public',
    e2e: 'e2e',
    dist: 'dist',
  },
  
  // Backend Paths
  backend: {
    root: 'd:/REP/eliksir-website.tar/stefano-eliksir-backend',
    server: 'server',
    routes: 'server/routes',
    db: 'server/db',
    migrations: 'server/db/migrations',
    shared: 'shared',
    uploads: 'server/uploads',
  },
  
  // Configuration Files (CRITICAL - NEVER HARDCODE URLS)
  config: {
    frontend: 'eliksir-frontend/src/lib/config.ts',  // ✅ ONLY place for frontend API URLs
    backend: 'stefano-eliksir-backend/server/config.ts', // ✅ ONLY place for backend config
    envExample: '.env.example',
    babel: '.babelrc.js',
    vite: 'vite.config.ts',
    tsconfig: 'tsconfig.json',
  },
} as const;

export const FRONTEND_SCHEMA = {
  // ============================================
  // 1. REQUIRED FILES - must exist
  // ============================================
  requiredFiles: [
    'src/lib/config.ts',              // ✅ CRITICAL: API URLs centralization
    'src/lib/auto-healing.ts',        // ✅ CRITICAL: Retry logic
    'src/lib/component-health-monitor.ts', // ✅ CRITICAL: Component tracking
    'src/components/Calculator.tsx',  // ✅ CRITICAL: Main calculator
    'src/components/Gallery.tsx',     // ✅ CRITICAL: Gallery component
    'src/components/HorizontalGallery.tsx', // ✅ CRITICAL: Panorama scroll
    'package.json',
    'package-lock.json',
    'tsconfig.json',
    'vite.config.ts',
    '.gitignore',
  ],

  // ============================================
  // 2. FORBIDDEN PATTERNS - must NOT exist
  // ============================================
  forbiddenPatterns: [
    // Garbage text
    /zajmij\s+sie/gi,
    /TODO_REMOVE/gi,
    /TEMP_[A-Z_]+/gi,
    /HACK_[A-Z_]+/gi,
    /FIXME_URGENT/gi,
    
    // ❌ WRONG BACKEND URLS (common mistakes)
    /eliksir-backend-front-dashboard\.onrender\.com/gi,  // ❌ OLD URL - DO NOT USE
    /https:\/\/eliksir-backend-front-dashboard/gi,       // ❌ OLD URL - DO NOT USE
    
    // Hardcoded URLs (use config.ts instead)
    /https:\/\/stefano-eliksir-backend\.onrender\.com(?!.*from.*config)/gi,  // ⚠️ Must be in config.ts only
    /http:\/\/localhost:3001(?!.*from.*config)/gi,
    
    // Old API patterns
    /API_URL\s*=\s*['"]/gi,  // Use API from config.ts
    /BACKEND_URL\s*=\s*['"]/gi, // Must be in config.ts only
    
    // Debugging code (in non-test files)
    /console\.log\s*\(/gi,
    /debugger;/gi,
    /alert\s*\(/gi,
  ],

  // ============================================
  // 3. REQUIRED IMPORTS - components must use
  // ============================================
  requiredImports: {
    'src/components/Calculator.tsx': [
      "import { API } from '../lib/config'",  // ✅ MUST use centralized API
      "import { fetchWithRetry } from '../lib/auto-healing'",
      "import { useComponentHealth } from '../lib/component-health-monitor'",
    ],
    'src/components/Gallery.tsx': [
      "import { API } from '@/lib/config'",
      "import { fetchWithRetry } from '../lib/auto-healing'",
    ],
    'src/components/HorizontalGallery.tsx': [
      "import { API } from '@/lib/config'",
    ],
  },

  // ============================================
  // 4. REQUIRED API ENDPOINTS - must be defined
  // ============================================
  requiredApiEndpoints: [
    'API.health',
    'API.calculatorConfig',
    'API.galleryPanorama',
    'API.contentSections',
    'API.authHealth',
    'API.aiHealth',
  ],

  // ============================================
  // 5. FILE SIZE LIMITS - prevent bloat
  // ============================================
  fileSizeLimits: {
    'src/components/**/*.tsx': 1000,  // lines
    'src/lib/**/*.ts': 500,           // lines
    'src/pages/**/*.tsx': 800,        // lines
  },

  // ============================================
  // 6. PACKAGE.JSON RULES
  // ============================================
  packageJsonRules: {
    requiredScripts: [
      'dev',
      'build',
      'preview',
      'lint',
      'test:e2e',
      'validate',     // ✅ NEW: Pre-push check
      'pre-push',     // ✅ NEW: Full validation
    ],
    requiredDevDependencies: [
      '@playwright/test',
      'eslint',
      'typescript',
      'vite',
    ],
  },

  // ============================================
  // 7. CRITICAL LOGIC RULES
  // ============================================
  criticalRules: [
    {
      rule: 'ALL_FETCH_MUST_USE_RETRY',
      description: 'Every fetch() call must use fetchWithRetry() from auto-healing.ts',
      pattern: /fetch\s*\(/gi,
      allowedExceptions: [
        'src/lib/auto-healing.ts',  // Only here fetch() is allowed
        'e2e/',  // E2E tests can use raw fetch
      ],
    },
    {
      rule: 'ALL_COMPONENTS_MUST_USE_API_CONFIG',
      description: 'Components must import API from lib/config.ts, not hardcode URLs',
      pattern: /https?:\/\//gi,
      allowedExceptions: [
        'src/lib/config.ts',  // Only here URLs are defined
        'README.md',
        'docs/',
      ],
    },
    {
      rule: 'NO_SETLOADING_WITHOUT_FINALLY',
      description: 'setLoading(true) must have setLoading(false) in finally block',
      pattern: /setLoading\s*\(\s*true\s*\)/gi,
      requiresPattern: /finally\s*{[^}]*setLoading\s*\(\s*false\s*\)/gi,
    },
  ],
};

// Export for validation scripts
export default FRONTEND_SCHEMA;
