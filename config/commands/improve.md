---
description: Analyze recent sessions and improve the harness (rules, skills, hooks)
agent: build
---
Self-improvement cycle. Load the `self-improve` skill, then:

1. Read .arthur/memory/lessons.md — find patterns in recent failures
2. Read .arthur/sessions/*.json — identify recurring issues
3. For each pattern, choose the right fix level:
   - **Deterministic** (best): new lint rule, test template, or hook script
   - **Skill** (good): new or updated SKILL.md for agents to load
   - **Rule** (ok): update AGENTS.md with new convention
4. Apply fixes at the right scope:
   - Project-level: .opencode/ in current project
   - Global-level: ~/.config/opencode/ for all projects
5. Report what was improved and why.
