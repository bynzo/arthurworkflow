#!/bin/bash
# ArthurWorkflow post-edit hook
# Runs after every agent file edit. Fails loudly — never silently.

ERRORS=0

# Lint
if [ -f "biome.json" ] || [ -f "biome.jsonc" ]; then
  if command -v npx &>/dev/null; then
    npx biome check --write . 2>&1 || { echo "❌ Biome lint failed" >&2; ERRORS=$((ERRORS+1)); }
  else
    echo "⚠ biome configured but npx not available — skipping lint" >&2
  fi
elif [ -f ".eslintrc.json" ] || [ -f ".eslintrc.js" ] || [ -f "eslint.config.js" ] || [ -f "eslint.config.mjs" ]; then
  if command -v npx &>/dev/null; then
    npx eslint . --quiet --fix 2>&1 || { echo "❌ ESLint failed" >&2; ERRORS=$((ERRORS+1)); }
  else
    echo "⚠ eslint configured but npx not available — skipping lint" >&2
  fi
else
  echo "ℹ No linter configured — skipping lint check" >&2
fi

# TypeScript
if [ -f "tsconfig.json" ]; then
  if command -v npx &>/dev/null; then
    npx tsc --noEmit 2>&1 || { echo "❌ TypeScript errors" >&2; ERRORS=$((ERRORS+1)); }
  else
    echo "⚠ tsconfig.json found but npx not available — skipping typecheck" >&2
  fi
fi

if [ $ERRORS -gt 0 ]; then
  echo "🔴 post-edit: $ERRORS check(s) failed — fix before continuing" >&2
  exit 1
fi
