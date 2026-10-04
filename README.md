# AI Integration

A collection of skills and supporting guidance for AI coding agents. Skills live in `skills/`; agent instructions and repository guidance live in `agents/`, `docs/`, and the root-level Markdown files.

## Installation
```
npx skills add TahaLoghmari/AI-Integration
```

## Repository map

- `skills/` — task-specific workflows and their reference files.
- `agents/subagents/` — instructions for specialist subagents.
- `agents/metadata.md` — shared agent metadata.
- `docs/agents/` — supporting documentation for agent workflows.
- `AGENTS.md` — guidance for agents working in this repository.
- `CODING_STANDARDS.md` — coding standards.

## Agents

The repository has two specialist subagents:

| Agent               | Use it when…                                                                                   |
| ------------------- | ---------------------------------------------------------------------------------------------- |
| `codebase-explorer` | You need to trace code, find where a feature lives, or locate an existing example to follow.   |
| `web-search`        | You need current external facts, such as official library/API documentation or usage guidance. |

## Skill dependencies

Arrows mean “the skill on the left calls or loads the skill on the right.”

```text
improve-codebase-architecture
  ├── codebase-design
  └── grill-me

prototype (UI path)
  └── frontend-design

wayfinder
  └── skills named in a ticket's Notes (context-dependent)
```

The repository also has a `grill-me` skill; the architecture skill refers to it as `grilling`. Most other skills have no fixed cross-skill dependency. Some refer to related skills as optional or situational guidance, rather than requiring them for every run.

## When to use each skill

| Skill                           | Use it when…                                                                            |
| ------------------------------- | --------------------------------------------------------------------------------------- |
| `bro`                           | You want the last message restated in plain, jargon-free language.                      |
| `codebase-design`               | Designing or improving module interfaces, seams, testability, or codebase navigability. |
| `code-review`                   | Reviewing a branch, PR, or working diff for both code quality/regressions and spec fit. |
| `correct`                       | The same agent mistake keeps recurring and you want to prevent it structurally.         |
| `frontend-design`               | Creating or reshaping a UI and need a deliberate, distinctive visual direction.         |
| `grill-me`                      | Stress-testing a plan or idea through structured questions until decisions are settled. |
| `implement`                     | Turning a defined task into an idiomatic, verified code change.                         |
| `improve-codebase-architecture` | Finding architectural friction and exploring opportunities to deepen modules.           |
| `prototype`                     | Quickly testing a UI or logic idea with throwaway code.                                 |
| `research`                      | Investigating a topic using high-trust sources and recording findings in the repo.      |
| `retro`                         | Reviewing a coding session to identify improvements to the agent environment.           |
| `show-me`                       | Explaining a topic with the smallest useful diagram, code sketch, or visual artifact.   |
| `task-implemented`              | Recording completed work in stakeholder-readable form for a reviewer.                   |
| `tdd`                           | Building a feature or fixing a bug test-first, including integration tests.             |
| `teach`                         | Learning a topic over multiple sessions with lessons and progress records.              |
| `to-spec`                       | Turning the current conversation into a spec without interviewing the user.             |
| `to-tickets`                    | Breaking a plan or spec into dependency-aware, vertical-slice tickets.                  |
| `visual-pr`                     | Explicitly requesting a concise, reviewer-friendly pull request description.            |
| `wayfinder`                     | Planning and resolving a large, uncertain effort through decision tickets.              |
| `writing-for-agents`            | Creating or editing agent-facing documentation, skills, or `AGENTS.md` / `CLAUDE.md`.   |

## Using the skills

Read the relevant `skills/<name>/SKILL.md` for its workflow. Supporting files in the same skill directory provide additional detail and are linked from that skill. Follow the repository guidance in `AGENTS.md` when contributing changes.
