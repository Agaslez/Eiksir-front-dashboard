#!/usr/bin/env node
/**
 * SEO Keywords Synchronization Script
 * Pobiera keywords z backendu i aktualizuje index.html przed buildem
 * 
 * Fallback: Jeśli API nie działa, zostawia obecne keywords (bezpieczne!)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BACKEND_URL = process.env.VITE_API_URL || 'https://eliksir-backend-front-dashboard.onrender.com';
const INDEX_PATH = path.resolve(__dirname, '../index.html');

console.log('🔄 Synchronizacja SEO keywords z backendem...');
console.log(`📡 Backend: ${BACKEND_URL}`);

async function fetchKeywords() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/settings/seo`, {
      signal: AbortSignal.timeout(5000) // 5s timeout
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success || !Array.isArray(data.keywords)) {
      throw new Error('Invalid API response');
    }
    
    return data.keywords;
  } catch (error) {
    console.warn(`⚠️  Nie udało się pobrać keywords z API: ${error.message}`);
    return null;
  }
}

function updateIndexHtml(keywords) {
  try {
    // Wczytaj index.html
    let html = fs.readFileSync(INDEX_PATH, 'utf-8');
    
    // Znajdź obecne keywords (backup)
    const currentKeywordsMatch = html.match(/<meta name="keywords" content="([^"]+)"/);
    const currentKeywords = currentKeywordsMatch ? currentKeywordsMatch[1] : '';
    
    if (!keywords) {
      console.log('✅ Zachowano obecne keywords (API offline)');
      console.log(`📋 Keywords: ${currentKeywords.substring(0, 80)}...`);
      return;
    }
    
    // Nowe keywords
    const newKeywordsString = keywords.join(', ');
    
    // Zastąp w HTML
    const updatedHtml = html.replace(
      /<meta name="keywords" content="[^"]+"/,
      `<meta name="keywords" content="${newKeywordsString}"`
    );
    
    // Sprawdź czy coś się zmieniło
    if (html === updatedHtml) {
      console.log('ℹ️  Keywords nie uległy zmianie');
      return;
    }
    
    // Zapisz
    fs.writeFileSync(INDEX_PATH, updatedHtml, 'utf-8');
    
    console.log('✅ Keywords zaktualizowane w index.html!');
    console.log(`📋 Nowe keywords (${keywords.length}):`);
    keywords.slice(0, 10).forEach(kw => console.log(`   - ${kw}`));
    if (keywords.length > 10) {
      console.log(`   ... i ${keywords.length - 10} więcej`);
    }
    
  } catch (error) {
    console.error('❌ Błąd podczas aktualizacji index.html:', error.message);
    process.exit(1);
  }
}

// Main
(async () => {
  try {
    const keywords = await fetchKeywords();
    updateIndexHtml(keywords);
    console.log('🎉 Synchronizacja zakończona');
  } catch (error) {
    console.error('❌ Nieoczekiwany błąd:', error);
    process.exit(1);
  }
})();
