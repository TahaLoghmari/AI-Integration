---
name: to-techspec
description: Turn the current conversation context and codebase understanding into a Technical Specification published to the project issue tracker. Use when user wants to create a Technical Specification from the current context.
disable-model-invocation: true
---

This skill takes the current conversation context and codebase understanding and produces a Technical Specification. Do NOT interview the user — synthesize what you already know from the conversation and codebase.

The issue tracker and triage label vocabulary should have been provided to you.

## Process

1. **Explore the codebase** — understand the current architecture in the area being changed: existing components, data models, API patterns, naming conventions, and any ADRs or prior decisions that apply. Use the project's domain vocabulary throughout the spec.

2. **Identify the components** — sketch the major components to build or modify. For each, identify its interface boundary: what goes in, what comes out, what it does not do. Actively look for deep modules — components that encapsulate significant complexity behind a simple, stable interface.

   Share the component breakdown with the user and confirm it matches their intent before writing the full spec.

3. **Write the Technical Specification** using the template below, then publish it to the project issue tracker as `.scratch/<feature-slug>/TECHSPEC.md`. Apply the `ready-for-agent` triage label.

## Template

```
# Technical Specification: <Feature Name>

Status: ready-for-agent

## Overview

1–3 paragraphs. What is being built, which approach was chosen and why (briefly), and which existing systems it touches. This is the executive summary for a technical reader — assume they know the codebase.

## Architecture Context

How this fits into the existing system. Which existing components are upstream or downstream. Keep it brief — enough to frame the design decisions be
low.

## Assumptions

Explicit list of what this spec takes for granted. Things the implementation can rely on without re-solving. Examples: "auth is handled by existing m
iddleware", "this runs synchronously within a request", "the upstream service guarantees idempotency". Unexamined assumptions become bugs.

## Alternatives Considered

Brief summary of what else was evaluated and why this approach was chosen. One paragraph or a short list. Helps future maintainers understand why the
 design is the way it is without re-litigating the decision.

## Dependencies

New external services, third-party libraries, or internal modules being pulled in that aren't already in use in this area. Note version constraints o
r integration requirements.

## Data Model

New types, schema changes, database migrations. Use type-shape snippets where prose would be imprecise — keep them compact (no boilerplate, just the decision-encoding parts). Note any migration strategy required.

## Component Design

One subsection per major component. For each:

### <ComponentName>

**Role**: What this component is responsible for.

**Interface**:
- Inputs: what it receives
- Outputs: what it returns or emits
- Contract: invariants, preconditions, error conditions

**Key decisions**: Any non-obvious implementation choices and the reasoning.

**Boundaries**: What this component explicitly does NOT do.

## API Contracts

If the feature exposes or modifies HTTP endpoints, list them here. For each:

- Method + path
- Request shape (body/query params)
- Response shape (success + error)
- Auth requirements

Use compact type shapes where they encode the contract more precisely than prose.

## Data Flow

Step-by-step walkthrough of the primary scenario — how data enters the system, passes through each component, and exits. Also describe the primary error path.

## Error Handling Strategy

How errors are categorized (expected vs. unexpected), how they propagate across layers, what gets logged and at what severity, and how errors surface to the caller or user.

## Non-Functional Requirements

- **Performance**: Latency/throughput targets, expected data volumes.
- **Security**: Auth, authorization, data sensitivity, attack surface.
- **Scalability / Constraints**: Any limits to be aware of.

Omit any that are not relevant.

## Testing Strategy

- What constitutes a good test for this feature (test external behavior, not implementation details)
- Which components to test and at what level (unit / integration / e2e)
- Prior art: similar tests already in the codebase to use as a reference

## Migration / Rollout

If the change involves schema migrations, breaking API changes, feature flags, or a phased rollout — describe the deployment sequence here. Otherwise omit this section.

## Open Questions & Risks

Unresolved decisions, known unknowns, technical risks that should be considered before implementation begins. Number them for easy reference.

## Out of Scope

Explicit exclusions — things a reader might expect to be here but are not, and why.
```

## Spec Writing Principles

**Code snippets are welcome** — unlike a PRD, a techspec is the right place for type shapes, schema definitions, interface signatures, and API contracts. Include them when prose would be imprecise. Keep them to the decision-encoding parts only — no scaffolding or boilerplate.

**No file paths** — avoid referencing specific file paths unless absolutely necessary; they go stale. Reference component and module names instead.

**Precision over length** — a short, precise spec is better than a long vague one. If a section isn't relevant, omit it rather than writing filler.

**Respect existing patterns** — the spec should describe how the feature integrates with current conventions (naming, error shapes, auth patterns, testing patterns), not invent new ones without justification.
