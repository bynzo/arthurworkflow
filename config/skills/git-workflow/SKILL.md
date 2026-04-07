---
name: git-workflow
description: Branching, commit conventions, and semver rules for ArthurWorkflow sessions.
---

# Git workflow

## Branches
`arthur/{type}-{description}` — types: feat, fix, refactor, docs, test

## Commits
Conventional: `{type}({scope}): {description}` — types: feat, fix, refactor, test, docs, chore

## Versioning
On merge: feat→minor, fix/perf/refactor→patch, BREAKING CHANGE→major

## Lifecycle
1. Create: `git checkout -b arthur/feat-{name}`
2. Commit incrementally during execution
3. Review: @sentinel reviews full diff vs main
4. Merge: `git checkout main && git merge --no-ff arthur/feat-{name}`
5. Tag: `git tag v{version}`
6. Cleanup: `git branch -d arthur/feat-{name}`
