#!/usr/bin/env node
/**
 * Backend URL Consistency Validator
 * 
 * Sprawdza czy wszystkie pliki używają POPRAWNEGO backend URL.
 * Uruchamiany przez CI/Guardian przed każdym commitem.
 * 
 * Exit codes:
 * 0 - wszystko OK
 * 1 - znaleziono błędny URL
 */

const fs = require('fs');
const path = require('path');

// ✅ CANONICAL BACKEND URL
const CORRECT_URL = 'eliksir-backend-front-dashboard.onrender.com';

// ❌ DEPRECATED URLs - MUST NOT EXIST
const WRONG_URLS = [
  'stefano-eliksir-backend.onrender.com',
  'eliksir-backend.onrender.com', // Jeśli ktoś skróci
];

// 📁 Pliki do sprawdzenia
const FILES_TO_CHECK = [
  'src/lib/config.ts',
  '.babelrc.js',
  '.env.production',
  '.env.example',
  'vercel.json',
  'jest.setup.ts',
  'e2e/api-consistency.spec.ts',
  'src/__tests__/api.integration.test.tsx',
  'src/__tests__/backend.database.test.tsx',
  'src/__tests__/cloudinary.integration.test.tsx',
  'src/__mocks__/@/lib/config.ts',
];

console.log('🔍 Backend URL Consistency Validator');
console.log('=====================================\n');

let hasErrors = false;
let checkedFiles = 0;

FILES_TO_CHECK.forEach(filePath => {
  const fullPath = path.join(process.cwd(), filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.warn(`⚠️  ${filePath} - FILE NOT FOUND (skipping)`);
    return;
  }
  
  const content = fs.readFileSync(fullPath, 'utf8');
  checkedFiles++;
  
  // Sprawdź czy ma POPRAWNY URL
  const hasCorrectUrl = content.includes(CORRECT_URL);
  
  // Sprawdź czy ma BŁĘDNY URL
  const foundWrongUrls = WRONG_URLS.filter(wrongUrl => content.includes(wrongUrl));
  
  if (foundWrongUrls.length > 0) {
    console.error(`❌ ${filePath}`);
    foundWrongUrls.forEach(wrongUrl => {
      console.error(`   Found WRONG URL: ${wrongUrl}`);
    });
    hasErrors = true;
  } else if (hasCorrectUrl) {
    console.log(`✅ ${filePath}`);
  } else {
    console.warn(`⚠️  ${filePath} - no backend URL found (might be OK)`);
  }
});

console.log(`\n📊 Checked ${checkedFiles} files`);

if (hasErrors) {
  console.error('\n❌ VALIDATION FAILED');
  console.error(`\n✅ Use ONLY: ${CORRECT_URL}`);
  console.error(`❌ NEVER use: ${WRONG_URLS.join(', ')}`);
  process.exit(1);
}

console.log('\n✅ All backend URLs are consistent!');
process.exit(0);
