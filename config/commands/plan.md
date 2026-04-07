---
description: Decompose a request into a plan with agent assignments
agent: build
---
Execute a full planning cycle for: $ARGUMENTS

## Step 1: Plan (via @queen)
Invoke @queen with the request. The Queen will:
1. Load `context-pruning` and `failover` skills
2. Read .arthur/memory/root.md and .arthur/memory/lessons.md
3. Check `git status` and `git log --oneline -5`
4. Produce a structured plan with tasks, agents, tiers, context containers
5. Include a suggested branch name: `arthur/{type}-{short-description}`

## Step 2: Present plan to user
Show the Queen's plan. Ask: "Approve this plan? (yes/no/refine)"
Do NOT proceed until the user explicitly approves.

## Step 3: Create branch (after approval only)
Once approved, run:
```bash
git checkout -b arthur/{branch-name-from-plan}
```
Confirm the branch was created.

## Step 4: Begin execution
Dispatch tasks to the assigned agents (@architect, @scripter, @documenter, @refactor) as subagent calls, following the plan order.

Each agent works in its own isolated session. Load the `git-workflow` skill for commit conventions.
