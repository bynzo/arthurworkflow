#!/bin/bash
# ArthurWorkflow pre-merge hook
# Runs full validation before merge. Blocks merge on any failure.

echo "Running pre-merge checks..."
ERRORS=0

# Tests
if [ -f "package.json" ] && grep -q '"test"' package.json 2>/dev/null; then
  npm test 2>&1 || { echo "❌ Tests failed" >&2; ERRORS=$((ERRORS+1)); }
else
  echo "⚠ No test script in package.json — skipping tests" >&2
fi

# TypeScript
if [ -f "tsconfig.json" ]; then
  if command -v npx &>/dev/null; then
    npx tsc --noEmit 2>&1 || { echo "❌ TypeScript errors" >&2; ERRORS=$((ERRORS+1)); }
  else
    echo "⚠ tsconfig.json found but npx not available" >&2
  fi
fi

# Lint
if [ -f "biome.json" ] || [ -f "biome.jsonc" ]; then
  npx biome check . 2>&1 || { echo "❌ Lint errors" >&2; ERRORS=$((ERRORS+1)); }
elif [ -f ".eslintrc.json" ] || [ -f ".eslintrc.js" ] || [ -f "eslint.config.js" ] || [ -f "eslint.config.mjs" ]; then
  npx eslint . --quiet 2>&1 || { echo "❌ Lint errors" >&2; ERRORS=$((ERRORS+1)); }
fi

if [ $ERRORS -gt 0 ]; then
  echo "🔴 pre-merge: $ERRORS check(s) failed — merge blocked" >&2
  exit 1
fi
echo "✅ All pre-merge checks passed"
