# ArthurWorkflow — Engineering manual

## 1. What it is

A harness-engineered configuration layer for [OpenCode CLI](https://opencode.ai) that transforms it into a multi-model orchestrated development system. It is not a standalone tool — it is a structured set of agents, commands, skills, hooks, and memory files that OpenCode loads natively.

**What you get:** 6 specialized agents with isolated contexts, 5 slash commands, 4 on-demand skills, 2 deterministic hooks, a failover tier system, and a self-improvement loop. Zero custom runtime code — pure configuration + 3 lightweight CLI scripts (init, doctor, status).

**What it solves:** Token waste from unfocused context, confirmation bias from shared agent memory, lack of deterministic verification, no cross-session learning, single-model dependency.

---

## 2. Architecture

```
User request
  │
  ▼
┌─────────────────────────────────────────────┐
│  GUIDES (feedforward)                       │
│  AGENTS.md · Skills · tiers.yaml            │
└──────────────────┬──────────────────────────┘
                   ▼
           Queen (plan agent)
           Tier 1 · temp 0.2 · read-only
                   │
                   ▼
          User approves plan ✓
                   │
                   ▼
    ┌──────────────────────────────┐
    │  Execution swarm             │   ◄── SENSORS (feedback)
    │  Isolated subagent sessions  │       post-edit.sh: lint + tsc
    │  ┌──────────────────────┐   │       after every file edit
    │  │ Architect  (Tier 1)  │   │
    │  │ Scripter   (Tier 3)  │   │
    │  │ Refactor   (Tier 2)  │   │
    │  │ Documenter (Tier 3)  │   │
    │  └──────────────────────┘   │
    └──────────────┬──────────────┘
                   ▼
           Sentinel (blind review)
           Tier 2 · temp 0.1
           Sees ONLY: ticket + git diff
                   │
              PASS │ FAIL → loops back to Queen
                   ▼
           Git merge + semver auto-bump
                   │
                   ▼
    ┌──────────────────────────────┐
    │  Self-improvement loop       │
    │  Lessons → AGENTS.md rules   │
    │  Patterns → new Skills       │
    │  Failures → new lint/hooks   │
    └──────────────────────────────┘
```

### Harness engineering principles applied

| Principle | Implementation |
|-----------|---------------|
| Role isolation | Generator (Scripter) and Evaluator (Sentinel) are separate agents with separate contexts |
| Deterministic sensors | post-edit.sh runs lint + typecheck after every edit — no LLM needed |
| Context firewalls | Each subagent runs in its own session; parent sees only prompt + result |
| Dynamic tool pruning | Each agent has explicit permission lists — Sentinel can't write, Queen can't edit |
| Memory compaction | Context pruning skill enforces 40k token budget with recursive summarization |
| Human-in-the-loop | User approves every plan before execution; /review before merge |
| Self-correction | /improve and /close extract lessons and create deterministic fixes |

### Context engineering principles applied

| Principle | Implementation |
|-----------|---------------|
| Signature-only loading | Non-target files sent as exported function signatures only |
| Diff-only after first pass | Subsequent calls receive git diff, not full files |
| 1-hop depth limit | Target file full content + direct imports as signatures + skip transitive |
| 40k token budget | System ~3k + project ~2k + task ~15k + supporting ~5k + history ~10k + output ~5k |
| Context rot prevention | Subagent isolation prevents accumulation; compaction at 30k threshold |
| Skills as progressive disclosure | Knowledge loaded on-demand, not preloaded into every call |

---

## 3. Components

### 3.1 Agents (`.opencode/agents/`)

| Agent | Mode | Tier | Temp | Permissions | Purpose |
|-------|------|------|------|-------------|---------|
| queen | subagent | 1 | 0.2 | read-only | Decomposes requests into atomic tasks with agent assignments |
| architect | subagent | 1 | 0.3 | ask write/edit | Creates interfaces, types, API contracts, file structure |
| scripter | subagent | 3 | 0.5 | allow write/edit | Implements features, writes tests, commits code |
| sentinel | subagent | 2 | 0.1 | deny write/edit | Blind review: sees only ticket + diff, never execution reasoning |
| documenter | subagent | 3 | 0.7 | allow write (docs only) | Updates README, JSDoc, CHANGELOG |
| refactor | subagent | 2 | 0.4 | allow write/edit | Restructures code without changing behavior |

### 3.2 Commands (`.opencode/commands/`)

| Command | Agent | Action |
|---------|-------|--------|
| `/plan <request>` | queen | Decompose request → structured plan → wait for approval |
| `/review` | sentinel | Blind review: git diff + tests + lint → PASS/FAIL |
| `/close` | build | Merge + semver bump + post-mortem + self-improve |
| `/improve` | build | Explicit harness improvement from accumulated lessons |
| `/tokens` | build | Display per-agent token usage, cost, context load |

### 3.3 Skills (`.opencode/skills/`)

| Skill | Loaded when |
|-------|-------------|
| context-pruning | Before any agent call that loads code files |
| git-workflow | When creating branches, committing, or merging |
| self-improve | During /close and /improve |
| failover | When a model returns rate limit or quota error |

### 3.4 Hooks (`.opencode/hooks/`)

| Hook | Trigger | Checks |
|------|---------|--------|
| post-edit.sh | After every agent file edit | ESLint/Biome + TypeScript typecheck |
| pre-merge.sh | Before merge to main | Full test suite + lint + typecheck |

These are **deterministic** — they run bash, not LLM calls. Fastest and most reliable harness sensors.

### 3.5 Configuration files

| File | Location | Purpose |
|------|----------|---------|
| AGENTS.md | Project root | Master orchestration rules, loaded into every agent context |
| opencode.jsonc | Project root | Model assignments per agent, permissions, compaction config |
| tiers.yaml | Project root | Failover chains per tier (priority-ordered model lists) |

### 3.6 Memory (`.arthur/`)

| Path | Purpose | Persists across sessions |
|------|---------|------------------------|
| .arthur/memory/root.md | Project overview, module index, conventions | Yes |
| .arthur/memory/lessons.md | Accumulated lessons from post-mortems | Yes |
| .arthur/sessions/*.json | Per-session metrics (tokens, models, results) | Yes |

---

## 4. Model tiers and failover

### Tier definitions

| Tier | Role | Agents | Budget guidance |
|------|------|--------|-----------------|
| Tier 1 (Strategic) | Best reasoning model | Queen, Architect | Use sparingly — planning only |
| Tier 2 (Balanced) | Good general model | Sentinel, Refactor | Moderate use — review + restructure |
| Tier 3 (Fast/Local) | Cheapest/fastest | Scripter, Documenter | Bulk use — implementation + docs |

### Failover behavior

Defined in `tiers.yaml`. Each tier lists models in priority order:

```yaml
tier1_strategic:
  - anthropic/claude-sonnet-4-20250514   # try first
  - google/gemini-2.5-pro                # fallback 1
  - openai/o3                            # fallback 2
```

When a model fails (429/503/quota), the agent loads the `failover` skill which:
1. Reads tiers.yaml
2. Identifies next model in the tier chain
3. Instructs user to update opencode.jsonc with the fallback model
4. If all tier models exhausted, degrades to next tier down (tier1→tier2→tier3)

**For fully automatic failover:** Use OpenRouter as provider. OpenRouter handles model switching transparently at the provider level.

### Context isolation per phase

Each subagent runs in a separate OpenCode session with its own context window. The parent (Build agent) sees only the prompt it sent and the final result.

| Phase | Context window contains | Does NOT contain |
|-------|------------------------|------------------|
| Queen (planning) | User request + project map + lessons | Code files (unless read via tools) |
| Architect | Task description + target file signatures | Queen's reasoning |
| Scripter | Task description + target files (full) | Queen's or Architect's reasoning |
| Sentinel | Original ticket text + git diff + test output | Any agent's reasoning or conversation |
| Documenter | Completed code + existing docs | Execution history |

This isolation is not a convention — it is an OpenCode architectural guarantee. Subagent sessions are physically separate context windows.

---

## 5. Self-improvement

The harness gets better after every session. Three fix levels, ordered by preference:

### Level 1: Deterministic fix (best)
Creates lint rules, test templates, or hook scripts. Prevents recurrence permanently. No LLM cost to enforce.

Example: Agent kept generating unvalidated inputs → `/improve` adds an ESLint rule.

### Level 2: Skill fix (good)
Creates or updates a SKILL.md. Loaded on-demand by agents when relevant.

Example: Agent struggled with service worker patterns → creates `pwa-patterns` skill.

### Level 3: Rule fix (adequate)
Appends convention to AGENTS.md. Always in every agent's context.

Example: "Always use Workbox for SW caching" added to conventions.

### Scope
- **Project-level**: Changes in `.opencode/` and `AGENTS.md` in current repo
- **Global-level**: Changes in `~/.config/opencode/` for all future projects
- The `/improve` command asks which scope before applying

---

## 6. Installation

### Prerequisites
- Node.js ≥ 20
- Git
- [OpenCode CLI](https://opencode.ai): `npm i -g opencode-ai@latest`
- At least one LLM provider authenticated: `opencode auth login <provider>`

### Install ArthurWorkflow

**From source (recommended):**
```bash
git clone https://github.com/arthur/arthurworkflow
cd arthurworkflow
npm install
npm link
```

**From npm (once published):**
```bash
npm install -g arthurworkflow
```

### Initialize a project
```bash
cd ~/your-project
git init                        # if not already a git repo
arthurworkflow init pwa         # templates: pwa | api | default
```

### Configure models

**Step 1:** Edit `tiers.yaml` — set your available models per tier in fallback order:
```yaml
tier1_strategic:
  - anthropic/claude-sonnet-4-20250514
  - google/gemini-2.5-pro
tier2_balanced:
  - google/gemini-2.0-flash
tier3_fast:
  - local.qwen3:32b
```

**Step 2:** Edit `opencode.jsonc` — assign primary model (first in tier) to each agent:
```jsonc
"queen":      { "model": "anthropic/claude-sonnet-4-20250514" },
"architect":  { "model": "anthropic/claude-sonnet-4-20250514" },
"scripter":   { "model": "local.qwen3:32b" },
"sentinel":   { "model": "google/gemini-2.0-flash" },
"documenter": { "model": "local.qwen3:32b" },
"refactor":   { "model": "google/gemini-2.0-flash" }
```

Run `opencode models` to see available model IDs.

**Step 3:** For Ollama local models:
```bash
ollama serve                                          # start Ollama
export LOCAL_ENDPOINT=http://localhost:11434/v1        # tell OpenCode
```

**Step 4:** Verify:
```bash
arthurworkflow doctor
```

---

## 7. Usage — operation manual

### Typical session

```bash
opencode                                    # launch OpenCode TUI

> Add offline caching with service worker   # just type your request naturally

# Automatic flow:
# 1. Queen decomposes → plan shown
# 2. You review → type "yes"
# 3. Branch arthur/feat-offline-sw auto-created
# 4. Agents execute (isolated sessions)
# 5. Hooks run lint+tsc after each edit
# 6. Sentinel blind review auto-triggered
# 7. Results shown → "Merge to main?"
# 8. You approve → merge + tag + cleanup + post-mortem

# That's it. One request in, shipped code out.
```

### Slash commands (optional shortcuts)
The workflow is automatic, but you can force individual phases:
- `/plan <request>` — run only the planning phase
- `/review` — run only the sentinel review
- `/close` — force merge + post-mortem
- `/improve` — explicit harness self-improvement cycle
- `/tokens` — show per-agent token usage

### Automated git flow

The git lifecycle is fully automated:
1. User request → Queen plans → creates `arthur/feat-{name}` branch after approval
2. Agents commit incrementally with conventional commits on that branch
3. Sentinel auto-reviews the diff between branch and main
4. On user approval → pre-merge hook → merge `--no-ff` → semver bump → tag → delete branch

### Token monitoring

OpenCode's native TUI shows total tokens in the bottom bar. The `/tokens` command adds:
- Per-agent breakdown (Queen: 2.1k, Scripter: 18.3k, Sentinel: 6.8k)
- Per-phase costs
- Independent context window utilization per agent
- Session archives in `.arthur/sessions/*.json`

### When things go wrong

| Problem | Solution |
|---------|----------|
| Model rate limited | Agents load `failover` skill → switch to next in tiers.yaml |
| Sentinel returns FAIL | Queen re-plans failed tasks → re-execute → re-review |
| Agent hallucinates | Hooks catch syntax/type errors deterministically. For logic errors, Sentinel catches at review. |
| Context too large | `context-pruning` skill auto-triggers at 30k tokens |
| Recurring failure pattern | `/improve` creates deterministic fix (lint rule or hook) |

---

## 8. File reference

### Package files (source)
```
arthurworkflow/
├── bin/
│   ├── cli.mjs              # Entry point: arthurworkflow init|doctor
│   ├── init.mjs              # Scaffolding logic
│   └── doctor.mjs            # Environment health check
├── config/
│   ├── AGENTS.md              # Master orchestration rules
│   ├── opencode.jsonc         # Model + permission config
│   ├── tiers.yaml             # Failover chains
│   ├── agents/                # 6 agent definitions (.md)
│   ├── commands/              # 5 commands (.md)
│   ├── skills/                # 4 skills (SKILL.md each)
│   └── hooks/                 # 2 bash scripts
├── templates/{default,pwa,api}/  # Memory root templates
├── package.json
├── LICENSE
└── README.md
```

### Project files (after `arthurworkflow init`)
```
your-project/
├── .opencode/
│   ├── agents/               # ← copied from config/agents/
│   ├── commands/              # ← copied from config/commands/
│   ├── skills/                # ← copied from config/skills/
│   └── hooks/                 # ← copied from config/hooks/
├── .arthur/
│   ├── memory/root.md         # Project overview (from template)
│   ├── memory/lessons.md      # Lessons learned (grows over time)
│   └── sessions/              # Session archives (JSON)
├── AGENTS.md                  # Master rules
├── opencode.jsonc             # Model config
└── tiers.yaml                 # Failover chains
```

---

## 9. Uninstallation

### Remove from a project
```bash
rm -rf .opencode/ .arthur/ AGENTS.md opencode.jsonc tiers.yaml
# Remove ArthurWorkflow section from .gitignore
```

### Remove globally
```bash
npm unlink -g arthurworkflow
# Or if installed via npm:
npm uninstall -g arthurworkflow
```

### Remove cloned source
```bash
rm -rf ~/path/to/arthurworkflow
```

---

## 10. Customization

### Add a new agent
Create `.opencode/agents/my-agent.md` with YAML frontmatter (description, mode, temperature, permission). It becomes available as `@my-agent`.

### Add a new skill
Create `.opencode/skills/my-skill/SKILL.md` with frontmatter (name, description). Agents can load it on-demand.

### Add a new command
Create `.opencode/commands/my-cmd.md` with frontmatter (description, agent). Available as `/my-cmd`.

### Add a new hook
Add a `.sh` script to `.opencode/hooks/`. Make it executable. Configure in opencode.jsonc if OpenCode supports hook triggers for your version.

### Global config (all projects)
Place agents, skills, commands in `~/.config/opencode/` instead of `.opencode/`. They apply to every project.

---

## 11. Limitations

- **Failover is semi-automatic**: agents detect the failure and instruct the user which model to switch to, but the user must update `opencode.jsonc`. Fully automatic failover requires using OpenRouter as provider.
- **Hooks require tools installed**: post-edit.sh needs eslint/biome and tsc in the project. If absent, hooks silently skip those checks.
- **Token tracking is approximate**: `/tokens` relies on session JSON files written by `/close`. Mid-session tracking uses OpenCode's native TUI counter.
- **No vector RAG**: v2 uses markdown files + grep for memory. Sufficient for solo dev. Vector search (ChromaDB/LanceDB) can be added via MCP server later.
- **OpenCode version dependency**: Tested with OpenCode v1.3.x. Agent/skill/command formats may change in future OpenCode versions.
