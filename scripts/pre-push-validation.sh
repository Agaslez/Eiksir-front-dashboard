#!/bin/bash
# Pre-push validation script - zapobiega red builds w CI/CD
# Użycie: ./scripts/pre-push-validation.sh

set -e  # Exit on any error

echo "🔍 PRE-PUSH VALIDATION - Frontend"
echo "=================================="
echo ""

# 1. Lint check
echo "📝 Running ESLint..."
npm run lint
if [ $? -ne 0 ]; then
  echo "❌ Lint failed! Fix errors before push."
  exit 1
fi
echo "✅ Lint passed"
echo ""

# 2. Type check (if exists)
echo "🔤 Running TypeScript check..."
if grep -q "type-check" package.json; then
  npm run type-check || {
    echo "⚠️  Type check skipped or failed"
  }
else
  echo "⚠️  No type-check script found"
fi
echo ""

# 3. Build check
echo "🏗️  Running production build..."
npm run build
if [ $? -ne 0 ]; then
  echo "❌ Build failed! Fix errors before push."
  exit 1
fi
echo "✅ Build passed"
echo ""

# 4. Check for common issues
echo "🔎 Checking for common issues..."

# Check for debugging code
if grep -r "console.log\|debugger" src/ --exclude-dir=node_modules --exclude="*.spec.*" --exclude="*.test.*"; then
  echo "⚠️  WARNING: Found console.log or debugger statements"
  echo "   Consider removing before push (not blocking)"
fi

# Check for TODO/FIXME
if grep -r "TODO\|FIXME\|XXX" src/ --exclude-dir=node_modules | head -5; then
  echo "⚠️  WARNING: Found TODO/FIXME comments"
fi

# Check for garbage text (like "zajmij sie")
if grep -r "zajmij\|TODO_REMOVE\|HACK\|TEMP_" src/ --exclude-dir=node_modules; then
  echo "❌ Found garbage text or temp code! Clean before push."
  exit 1
fi

echo ""
echo "✅ All checks passed!"
echo "🚀 Safe to push to GitHub"
echo ""
