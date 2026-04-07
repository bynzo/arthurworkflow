---
name: context-pruning
description: Token reduction strategies. Use before any agent call to minimize context window usage and stay under 40k tokens.
---

# Context pruning

## Strategies
1. **Signature-only**: non-target files → exported signatures only (imports + function/class/type signatures)
2. **Diff-only**: after first pass, send `git diff` not full files
3. **1-hop depth**: target file full + direct imports signatures + skip transitive
4. **Budget**: system ~3k + project ~2k + task files ~15k + supporting ~5k + history ~10k + output ~5k = 40k

## Compaction triggers
- 30k+ tokens → summarize oldest 50% of conversation
- 38k+ → signature-only for all non-target files
- 45k+ → emergency: keep only current task + target file

## Never send
node_modules, .git, dist, build, test fixtures (unless task is about tests)
