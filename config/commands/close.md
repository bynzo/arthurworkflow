---
description: Merge, version bump, post-mortem, self-improve
agent: build
---
Session closure sequence:

1. **Check branch**: Run `git branch --show-current`. If on `main` or `master`, abort — nothing to merge.

2. **Verify review**: Check if @sentinel has approved. If not, run `/review` first and wait for PASS.

3. **Run pre-merge hook**: `bash .opencode/hooks/pre-merge.sh` — if it fails, abort merge.

4. **Merge**:
   ```bash
   BRANCH=$(git branch --show-current)
   git checkout main
   git merge --no-ff "$BRANCH"
   ```

5. **Version bump**: Analyze commits on the merged branch:
   - Any `feat:` → minor bump
   - Only `fix:`/`perf:`/`refactor:` → patch bump
   - `BREAKING CHANGE` in body → major bump
   - Update version in package.json, commit: `chore: bump version to X.Y.Z`
   - Tag: `git tag vX.Y.Z`

6. **Post-mortem** — load `self-improve` skill:
   - Extract lessons → append to .arthur/memory/lessons.md
   - If new convention found → propose update to AGENTS.md
   - If recurring failure → propose new lint rule or hook
   - Archive session stats to .arthur/sessions/session_{date}.json

7. **Cleanup**: `git branch -d "$BRANCH"`

8. **Report**: tokens used per agent, models used, version change.
