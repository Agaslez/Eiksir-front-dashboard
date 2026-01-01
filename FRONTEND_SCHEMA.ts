/**
 * SINGLE SOURCE OF TRUTH - Frontend Structure
 * Agent MUST follow this schema. Any deviation = BLOCKED.
 * Last updated: 2026-01-01
 */

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
    
    // Hardcoded URLs (use config.ts instead)
    /https:\/\/eliksir-backend-front-dashboard\.onrender\.com(?!.*from.*config)/gi,
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
