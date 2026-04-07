# ArthurWorkflow

Harness-engineered [OpenCode](https://opencode.ai) wrapper. Multi-model Queen/Swarm orchestration with deterministic sensors, context firewalls, and self-improving agents.

## Quick start

```bash
# Install
git clone https://github.com/bynzo/arthurworkflow.git
cd arthurworkflow && npm install && npm link

# In your project
cd ~/my-project && git init
arthurworkflow init pwa

# Configure: edit opencode.jsonc (models) + tiers.yaml (failover)
arthurworkflow doctor

# Use — just type naturally, workflow is automatic
opencode
> Add offline caching with service worker
# Queen plans → you approve → agents execute → sentinel reviews → merge
```

## What's included

- **6 agents**: queen (planner), architect, scripter, sentinel (blind reviewer), documenter, refactor
- **5 commands**: /plan, /review, /close, /improve, /tokens
- **4 skills**: context-pruning, git-workflow, self-improve, failover
- **2 hooks**: post-edit (lint+tsc), pre-merge (full test suite)
- **Failover**: tiers.yaml defines model priority chains per tier
- **Self-improvement**: /close and /improve create deterministic fixes from failures

## Full documentation

See **[MANUAL.md](MANUAL.md)** for complete architecture, harness engineering principles, context engineering details, operation guide, and customization.

## License

MIT
