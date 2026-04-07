---
description: Blind security and quality review of current branch
agent: sentinel
subtask: true
---
Blind review of current branch:
1. `git diff main...HEAD`
2. `npm test`
3. `npx eslint . --quiet` (if available)
4. `npx tsc --noEmit` (if tsconfig.json exists)

Review diff against the original request. Do NOT read conversation history.
Output: PASS or FAIL with issues list.
