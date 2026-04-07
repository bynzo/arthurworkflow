# ArthurWorkflow

## How it works
When the user describes a task, you (the Build agent) automatically run the full workflow. The user does NOT need to type slash commands — just describe what they want.

## Automatic workflow
On ANY user request that involves code changes:

1. **Plan**: Invoke @queen to decompose the request. Present the plan. Wait for user approval.
2. **Branch**: After approval, run `git checkout -b arthur/{type}-{short-name}`.
3. **Execute**: Dispatch tasks to @architect, @scripter, @documenter, @refactor per the plan. Each runs as isolated subagent (context firewall).
4. **Verify**: After all tasks, run `bash .opencode/hooks/post-edit.sh` for deterministic checks.
5. **Review**: Invoke @sentinel for blind review (ticket + diff only). If FAIL → re-plan failed tasks, loop.
6. **Present**: Show diff summary, test results, sentinel verdict. Ask: "Merge to main?"
7. **Close**: On approval → pre-merge hook → merge --no-ff → semver bump → tag → delete branch → post-mortem via `self-improve` skill.

## Skip planning for simple tasks
If the request is trivial (rename, typo fix, single-line change), skip @queen — just branch, fix, review, merge.

## Slash commands (optional shortcuts)
- `/plan <request>` — force planning phase only
- `/review` — force sentinel review without merge
- `/close` — force merge + post-mortem
- `/improve` — explicit harness self-improvement
- `/tokens` — show session metrics

## Model tiers (configure in opencode.jsonc + tiers.yaml)
- **Tier 1** (Strategic): planning, architecture
- **Tier 2** (Balanced): review, refactoring
- **Tier 3** (Fast/Local): implementation, docs
- **Failover**: on rate limit/quota, load `failover` skill → switch to next model in `tiers.yaml`

## Context rules
- Target: ≤40k tokens per agent call
- Subagents = context firewalls (parent sees only prompt + result)
- Load skills on-demand, never preload everything
- Execution agents see: task + code. Sentinel sees: ticket + diff only.

## Self-improvement
After each session closure:
1. Deterministic fix (lint rule, hook, test) — preferred
2. Skill fix (new/updated SKILL.md) — good
3. Rule fix (AGENTS.md update) — adequate

## Conventions
- Conventional commits, feature branches (`arthur/`), semver
- Small functions (<50 lines), explicit error handling, tests required
- JSDoc on public APIs
