---
name: self-improve
description: Harness self-improvement. Analyzes failures and creates deterministic fixes (hooks, lint rules, skills, AGENTS.md updates). Use at /close or /improve.
---

# Self-improvement

The harness must get better after every session. Fix levels ordered by preference:

## 1. Deterministic fix (best — prevents recurrence permanently)
- Add lint rule to .eslintrc / biome.json
- Add test template to project
- Add or update hook script in .opencode/hooks/
- Example: agent kept forgetting to validate inputs → add eslint rule `no-unvalidated-input`

## 2. Skill fix (good — loaded on demand)
- Create new SKILL.md in .opencode/skills/{name}/
- Or update existing skill with new guidance
- Example: agent struggled with service workers → create `pwa-patterns` skill

## 3. Rule fix (adequate — always in context)
- Append new convention to AGENTS.md
- Keep it concise — AGENTS.md is a table of contents, not an encyclopedia
- Example: "Always use Workbox for SW caching"

## Scope
- **Project**: .opencode/ and AGENTS.md in current repo
- **Global**: ~/.config/opencode/ for all future projects
- Ask user which scope before applying global changes

## Session archive format
```json
{
  "id": "session_{timestamp}",
  "request": "original request",
  "branch": "arthur/feat-name",
  "status": "merged|failed",
  "models_used": ["tier-1/model", "tier-3/model"],
  "tokens": { "queen": 2100, "scripter": 18300, "sentinel": 6800 },
  "sentinel_result": "PASS|FAIL",
  "lessons": ["lesson text"],
  "improvements_applied": ["what was improved"]
}
```
