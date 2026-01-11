#!/usr/bin/env node
/**
 * SINGLE SOURCE OF TRUTH VALIDATOR
 * Pre-commit hook - validates against FRONTEND_SCHEMA
 * BLOCKS commit if ANY rule is violated
 * 
 * ARCHITECT APPROVAL SYSTEM:
 * Odstępstwa możliwe tylko z zatwierdzeniem architekta w kodzie:
 * // ARCHITECT_APPROVED: [reason] - [date] - [architect_name]
 * 
 * Przykład:
 * console.log('debug'); // ARCHITECT_APPROVED: Critical prod debugging - 2026-01-01 - Stefano
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceRoot = path.resolve(__dirname, '..');

// ============================================
// ARCHITECT APPROVAL SYSTEM
// ============================================

/**
 * Sprawdza czy linia ma approval architekta
 * Format: // ARCHITECT_APPROVED: [reason] - [date] - [architect]
 */
function hasArchitectApproval(line) {
  const approvalPattern = /\/\/\s*ARCHITECT_APPROVED:\s*(.+?)\s*-\s*(\d{4}-\d{2}-\d{2})\s*-\s*([A-Za-z]+)/;
  const match = line.match(approvalPattern);
  
  if (match) {
    return {
      approved: true,
      reason: match[1].trim(),
      date: match[2],
      architect: match[3],
    };
  }
  
  return { approved: false };
}

/**
 * Sprawdza czy naruszenie ma approval w tej samej linii lub linii wyżej
 */
function checkApprovalForViolation(lines, lineIndex, violationType) {
  // Check same line
  const sameLine = lines[lineIndex];
  if (sameLine) {
    const approval = hasArchitectApproval(sameLine);
    if (approval.approved) {
      return approval;
    }
  }
  
  // Check line above
  if (lineIndex > 0) {
    const lineAbove = lines[lineIndex - 1];
    if (lineAbove) {
      const approval = hasArchitectApproval(lineAbove);
      if (approval.approved) {
        return approval;
      }
    }
  }
  
  return { approved: false };
}

// ============================================
// INLINE SCHEMA (copied from FRONTEND_SCHEMA.ts)
// ============================================
const SCHEMA = {
  requiredFiles: [
    'src/lib/config.ts',
    'src/lib/auto-healing.ts',
    'src/lib/component-health-monitor.ts',
    'src/components/Calculator.tsx',
    'src/components/Gallery.tsx',
    'src/components/HorizontalGallery.tsx',
    'package.json',
    'package-lock.json',
  ],
  
  forbiddenPatterns: [
    { pattern: /zajmij\s+sie/gi, name: 'GARBAGE_TEXT' },
    { pattern: /TODO_REMOVE/gi, name: 'TODO_REMOVE' },
    { pattern: /TEMP_[A-Z_]+/gi, name: 'TEMP_CODE' },
    { pattern: /HACK_[A-Z_]+/gi, name: 'HACK_CODE' },
    { pattern: /console\.log\s*\(/gi, name: 'CONSOLE_LOG', exceptions: ['e2e/', 'scripts/', '.spec.', '.test.'] },
    { pattern: /debugger;/gi, name: 'DEBUGGER', exceptions: ['e2e/'] },
  ],

  requiredImports: {
    'src/components/Calculator.tsx': [
      "import { API }",
      "fetchWithRetry",
      "useComponentHealth",
    ],
    'src/components/Gallery.tsx': [
      "import { API",
      "fetchWithRetry",
    ],
    'src/components/HorizontalGallery.tsx': [
      "import { API",
    ],
  },
};

// ============================================
// VALIDATION FUNCTIONS
// ============================================

let errors = [];
let warnings = [];
let approvals = []; // Track all architect approvals

function addError(message) {
  errors.push(`❌ ${message}`);
}

function addWarning(message) {
  warnings.push(`⚠️  ${message}`);
}

function addApproval(file, lineNum, approval) {
  approvals.push({
    file,
    line: lineNum,
    reason: approval.reason,
    date: approval.date,
    architect: approval.architect,
  });
}

function checkRequiredFiles() {
  console.log('\n📁 Checking required files...');
  let allExist = true;
  
  for (const file of SCHEMA.requiredFiles) {
    const filePath = path.join(process.cwd(), file);
    if (!fs.existsSync(filePath)) {
      addError(`MISSING REQUIRED FILE: ${file}`);
      allExist = false;
    }
  }
  
  if (allExist) {
    console.log('   ✅ All required files present');
  }
  return allExist;
}

function checkForbiddenPatterns() {
  console.log('\n🔍 Checking for forbidden patterns...');
  const srcPath = path.join(process.cwd(), 'src');
  let foundIssues = false;
  
  function scanDirectory(dir) {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const file of files) {
      const fullPath = path.join(dir, file.name);
      
      if (file.isDirectory() && !file.name.startsWith('.') && file.name !== 'node_modules') {
        scanDirectory(fullPath);
      } else if (file.isFile() && (file.name.endsWith('.ts') || file.name.endsWith('.tsx'))) {
        const relativePath = path.relative(process.cwd(), fullPath);
        const content = fs.readFileSync(fullPath, 'utf-8');
        const lines = content.split('\n');
        
        for (const forbidden of SCHEMA.forbiddenPatterns) {
          // Search line by line to check for approvals
          for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const matches = line.match(forbidden.pattern);
            
            if (matches) {
              // Check exceptions
              let isException = false;
              if (forbidden.exceptions) {
                for (const exc of forbidden.exceptions) {
                  if (relativePath.includes(exc)) {
                    isException = true;
                    break;
                  }
                }
              }
              
              if (!isException) {
                // Check for architect approval
                const approval = checkApprovalForViolation(lines, i, forbidden.name);
                
                if (approval.approved) {
                  addApproval(relativePath, i + 1, approval);
                  console.log(`   ✅ Approved deviation: ${relativePath}:${i + 1} (${approval.reason})`);
                } else {
                  addError(`FORBIDDEN PATTERN '${forbidden.name}' found in ${relativePath}:${i + 1} (line: "${line.trim()}")`);
                  foundIssues = true;
                }
              }
            }
          }
        }
      }
    }
  }
  
  if (fs.existsSync(srcPath)) {
    scanDirectory(srcPath);
  }
  
  if (!foundIssues) {
    console.log('   ✅ No forbidden patterns found');
  }
  return !foundIssues;
}

function checkRequiredImports() {
  console.log('\n📦 Checking required imports...');
  let allImportsPresent = true;
  
  for (const [filePath, requiredImports] of Object.entries(SCHEMA.requiredImports)) {
    const fullPath = path.join(process.cwd(), filePath);
    
    if (!fs.existsSync(fullPath)) {
      addWarning(`File ${filePath} not found (skipping import check)`);
      continue;
    }
    
    const content = fs.readFileSync(fullPath, 'utf-8');
    
    for (const requiredImport of requiredImports) {
      if (!content.includes(requiredImport)) {
        addError(`MISSING IMPORT in ${filePath}: ${requiredImport}`);
        allImportsPresent = false;
      }
    }
  }
  
  if (allImportsPresent) {
    console.log('   ✅ All required imports present');
  }
  return allImportsPresent;
}

function checkPackageLockSync() {
  console.log('\n🔒 Checking package-lock.json sync...');
  const packageJson = path.join(process.cwd(), 'package.json');
  const packageLock = path.join(process.cwd(), 'package-lock.json');
  
  if (!fs.existsSync(packageJson) || !fs.existsSync(packageLock)) {
    addError('package.json or package-lock.json missing');
    return false;
  }
  
  const pkgData = JSON.parse(fs.readFileSync(packageJson, 'utf-8'));
  const lockData = JSON.parse(fs.readFileSync(packageLock, 'utf-8'));
  
  // Check if versions match
  if (pkgData.name !== lockData.name) {
    addError('package.json and package-lock.json name mismatch');
    return false;
  }
  
  console.log('   ✅ package-lock.json in sync');
  return true;
}

// ============================================
// MAIN VALIDATION
// ============================================

console.log('═══════════════════════════════════════════════════');
console.log('🛡️  SINGLE SOURCE OF TRUTH VALIDATOR');
console.log('═══════════════════════════════════════════════════');

const checks = [
  checkRequiredFiles(),
  checkForbiddenPatterns(),
  checkRequiredImports(),
  checkPackageLockSync(),
];

console.log('\n═══════════════════════════════════════════════════');
console.log('📊 VALIDATION RESULTS');
console.log('═══════════════════════════════════════════════════');

if (approvals.length > 0) {
  console.log('\n✅ ARCHITECT APPROVALS:');
  approvals.forEach(a => {
    console.log(`   📄 ${a.file}:${a.line}`);
    console.log(`      Reason: ${a.reason}`);
    console.log(`      Approved by: ${a.architect} on ${a.date}`);
  });
}

if (warnings.length > 0) {
  console.log('\n⚠️  WARNINGS:');
  warnings.forEach(w => console.log(`   ${w}`));
}

// Validate backend URLs
console.log('\n🔍 Validating backend URLs...');
try {
  const result = execSync('node scripts/validate-backend-urls.cjs', { 
    cwd: workspaceRoot,
    encoding: 'utf-8',
    stdio: 'pipe'
  });
  console.log(result);
  console.log('   ✅ Backend URLs validated');
} catch (error) {
  console.error('❌ URL Validation Failed:', error.message);
  if (error.stdout) console.error('stdout:', error.stdout);
  if (error.stderr) console.error('stderr:', error.stderr);
  errors.push(`Backend URL validation failed: ${error.message}`);
}

if (errors.length > 0) {
  console.log('\n❌ ERRORS:');
  errors.forEach(e => console.log(`   ${e}`));
  console.log('\n❌ COMMIT BLOCKED - Fix errors above!');
  console.log('\n💡 TIP: Schema violations require architect approval:');
  console.log('   // ARCHITECT_APPROVED: [reason] - YYYY-MM-DD - [name]');
  console.log('   console.log("debug"); // forbidden code');
  console.log('═══════════════════════════════════════════════════\n');
  process.exit(1);
}

console.log('\n✅ ALL CHECKS PASSED');
console.log('✅ Single Source of Truth validated');
console.log('✅ Commit allowed');
console.log('═══════════════════════════════════════════════════\n');
process.exit(0);
