# Skill: project-scan

Loaded by @queen before planning. Builds a compact project snapshot for context-efficient planning.

## Procedure

1. Read `.arthur/memory/root.md` — project overview, module map, conventions
2. Read `.arthur/memory/lessons.md` — past failures and fixes (skip if empty)
3. Run: `find . -name "package.json" -not -path "*/node_modules/*" -maxdepth 3`
   - Identify project type (mono-repo, single package, etc.)
4. Run: `ls src/ 2>/dev/null || ls app/ 2>/dev/null || ls lib/ 2>/dev/null`
   - Note top-level source directories
5. Run: `git log --oneline -10`
   - Note recent activity areas

## Output format (compact — keep under 500 tokens)

```
PROJECT SNAPSHOT
Type: [web-app|api|monorepo|library|pwa]
Stack: [e.g. Next.js, TypeScript, Prisma]
Source dirs: [src/, app/, lib/]
Recent activity: [e.g. auth, api/users, components/Dashboard]
Open concerns: [from lessons.md — top 3 recurring issues, or "none"]
```

## Rules
- Include ONLY what is relevant to the current task
- Do NOT dump full file contents — filenames and signatures only
- If `.arthur/memory/root.md` is up to date, skip the filesystem scan
- Cap output at 500 tokens
