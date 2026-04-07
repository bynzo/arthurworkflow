---
name: failover
description: Model failover handling. Load when a model returns an error (rate limit, quota, timeout). Provides fallback chain from tiers.yaml.
---

# Failover

When a model call fails (429, 503, quota exceeded, timeout), follow this procedure:

## Automatic detection
If you receive an error from the current model, do NOT retry the same model.
Instead:

1. Read `tiers.yaml` at project root
2. Find the current agent's tier (Queen=tier1, Architect=tier1, Scripter=tier3, Sentinel=tier2, Documenter=tier3, Refactor=tier2)
3. Try the next model in that tier's fallback chain
4. If all models in the tier are exhausted, try the tier below (tier1→tier2→tier3)
5. If ALL models fail, pause and inform the user

## How to switch
Tell the user:
```
⚠ Model [current] unavailable. Switching to [fallback].
  To apply: update opencode.jsonc agents.[agent].model = "[fallback]"
  Then resume the current task.
```

The user must update `opencode.jsonc` because OpenCode reads model config at session start.
For mid-session switches, the user can also type: `@agent-name` with the new model set.

## For the Queen (planner)
If YOU (Queen) hit a rate limit while planning:
1. Simplify the plan — fewer tasks, less decomposition
2. Suggest the user switch your model in opencode.jsonc
3. Continue planning with reduced scope if possible

## Prevention
- Prefer Tier 3 models for bulk work (cheaper, higher rate limits)
- Reserve Tier 1 for planning and architecture only
- Track token usage via /tokens to anticipate quota exhaustion
