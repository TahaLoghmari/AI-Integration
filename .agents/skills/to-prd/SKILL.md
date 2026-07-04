---
name: to-prd
description: Turn the current conversation context into a PRD and publish it to the project issue tracker. Use when user wants to create a PRD from the current context.
disable-model-invocation: true
---

This skill takes the current conversation context and produces a purely functional PRD — focused on users, outcomes, and business value. Do NOT interview the user — just synthesize what you already know. Do NOT include any technical content (no modules, APIs, schemas, code, or architecture details).

## Process

1. Write the PRD using the template below, then publish it to the project issue tracker.

<prd-template>

## Problem Statement

The problem that the user is facing, from the user's perspective.

## Solution

The solution to the problem, from the user's perspective. Describe what the product will do, not how it will be built.

## User Stories

A LONG, numbered list of user stories. Each user story should be in the format of:

1. As an <actor>, I want a <feature>, so that <benefit>

<user-story-example>
1. As a mobile bank customer, I want to see balance on my accounts, so that I can make better informed decisions about my spending
</user-story-example>

This list should be extensive and cover all aspects of the feature — happy paths, edge cases, and different actor types.

## Acceptance Criteria

A list of functional acceptance criteria — observable conditions that must be true for this feature to be considered done, written entirely from the user's perspective. No technical details.

- [ ] When a user does X, they see Y
- [ ] Users can do Z without needing to...

## Out of Scope

A description of the things that are out of scope for this PRD.

## Further Notes

Any further notes about the feature — business context, stakeholder constraints, open questions, dependencies on other teams.

</prd-template>
