---
description: Show token usage, cost, context load per agent, and session progress
agent: build
---
Display session metrics. Read .arthur/sessions/ for the latest session file.
If no session data exists, check OpenCode's built-in token display.

Format output as:
```
┌─────────────────────────────────────────────────────────────┐
│ TOKENS   in: XX,XXX / out: X,XXX    │ COST: ~$X.XX         │
│ CONTEXT  Queen: Xk | Scripter: Xk | Sentinel: Xk          │
│ MODELS   Queen: [model] | Scripter: [model] | Sentinel: [model] │
│ GIT      arthur/feat-{name}         │ STEP: N/M            │
│ PHASE    Plan: Xk | Execute: Xk | Review: Xk | Total: Xk  │
└─────────────────────────────────────────────────────────────┘
```

If session data is available in .arthur/sessions/, use it.
Otherwise estimate from the current conversation length.

Also remind: OpenCode natively shows token count in the TUI bottom bar.
For per-agent breakdown, each subagent session tracks its own tokens independently.
