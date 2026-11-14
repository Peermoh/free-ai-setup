# build-review

Two read-only reviewers for any project.

| Agent | When | What you get |
|---|---|---|
| `direction-reviewer` | **Before** building: a new idea, app, feature, video | GO / ADJUST / STOP, the smallest first step, risks, questions |
| `app-reviewer` | **After** building, before merge | Checks run, findings by severity with file:line, ready to merge yes/no |

## Install

```bash
claude plugin marketplace add Peermoh/free-ai-setup
claude plugin install build-review@free-ai-setup
```

## Use

Ask in plain words, or name the agent:

- "Use direction-reviewer on this: I want to build …"
- "Use app-reviewer on my changes before I merge."

## Workflow

```
idea → prompt-coach → direction-reviewer → plan mode → build → app-reviewer → merge
```
