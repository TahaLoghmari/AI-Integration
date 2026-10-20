---
name: retro
description: "Retrospective on a coding session and the repo's history: find the mistakes agents keep repeating and make each one impossible. Repeat each time the operator corrects you. Use for /retro."
disable-model-invocation: true
---

# Retro

The operator keeps correcting agents in this repo for the same mistakes. Change the agent's **environment** so the next agent can't make them.

Assume every contributor is an agent that sees only the files it opened, copies the nearest example, and takes the shortest path that compiles. Design the repo so a change that looks right from one file is right for the whole repo.

## Steps

1. Call the Skill tool with `writing-for-agents` for the writing style guide.

2. Gather evidence: the current session, recent commits, reverts, review comments, agent instruction files, and comments that explain workarounds. Group the mistakes into **classes**. A class counts once it has happened twice.

3. Look for candidates for improvement in these categories.

   - **Navigation**: how easy was it for the agent to find the right files? Are there hidden dependencies between files? Would a **navigation pointer** make it easier? _Use when_ the session took a long time to find a piece of information.
   - **Automated checks**: are there automated checks that could catch errors the agent made? Linting, typing, tests, filesystem linters? Read the repo's own check command first (its `package.json`/build-tool `lint`/`check` scripts, its CI workflow), so a check that already exists but sits unwired or silently broken is the finding, not a reinvention. A repo with no **guardrail** (no pre-commit hook and no CI job running its lint/typecheck/test command) is itself a finding: an un-linted repo is a standing missed opportunity, not a neutral default. _Use when_ the agent made a mistake an automated check could have caught, or the repo has no guardrail at all.
   - **Coding standards**: should the **reviewer agent** be given a new rule to enforce? Should an existing rule be removed or clarified? Classify the violation first: a **mechanical** one (a fixed syntactic pattern, a banned API, an import shape, a file-location rule) climbs the ladder in step 4 to a deterministic check; reserve `CODING_STANDARDS.md` for genuine **judgement calls**. _Use when_ the reviewer agent failed to catch a mistake.
   - **Global AGENTS.md**: are there any steering instructions that should be moved to coding standards (or automated checks) instead? _Use when_ the AGENTS.md file is particularly large - in the repo OR the user's global scope.
   - **Tool economy**: did the agent make expensive tool calls that could be streamlined? Is there any custom tooling (CLI's, MCP's) that is particularly token-inefficient? _Use when_ the agent made an expensive tool call.
   - **No-ops**: look for instructions in steering files that don't modify the agent's behavior. _Use when_ the steering files are large and unwieldy.
   - **Information access**: look for opportunities to increase the agent's access to information. Teeing dev server logs, readonly access to third-party services. _Use when_ a crucial piece of information was not available to the agent.

4. Fix each mistake class at the highest rung of the **ladder** that works:

   1. **Eliminate it with architecture.** Give each piece of state one owner and each task one supported way. Hide internals so the wrong import fails. Replace hand-synced lists with one source of truth. Delete old ways and dead code an agent would copy.
   2. **Enforce it with types so the bad state can't be written.** If bad code still compiles, add a lint or CI check whose error names the file, type, or function to use instead: a custom rule in the repo's own linter, a pre-commit hook, or a CI job, whichever the repo's language and existing guardrail make cheapest. If the pattern is already common, fail only when a change adds more.
   3. **Test the behavior.** Fix or delete any test that still passes when the behavior it checks breaks, or that fails when only the internals change.
   4. **Write docs or agent rules last, only for judgement calls** (cross-file consistency, "matches the surrounding style," anything no guardrail could ever substitute for). Nothing fails when an agent skips them. Rules go in `CODING_STANDARDS.md`.

5. Fix the most frequent classes now, one commit each. Prove each new check fails on a real past mistake. Run the same command locally and in CI. Exceptions go on the offending line with a reason, an expiry date, and a human's approval.

6. Keep a table in `CODING_STANDARDS.md` that pairs each rule with what enforces it. When the operator corrects you, fix the mistake and add the rule. If the rule was already there and nothing enforces it, that's a repeat, so fix it at the highest rung in the same change. Drop a rule once its mistake can't happen.

7. **Reply** with the candidates in order of severity. For each mistake class: its evidence, the level you picked, and why a higher level didn't work.

## Reference

### Implementation vs Review

Remember that all work goes through two stages: implementation and review. The implementation agent has the most **context pressure**. They are responsible for exploration, writing code, and debugging failures.

The review agent has the least context pressure - it receives a diff, so no exploration needed. It often does not need to write code or debug.

This means that the review agent should be responsible for imposing coding standards, not the implementation agent.

### Files

You have access to several files in the repo:

- `CLAUDE.md`/`AGENTS.md`: these files are pushed to the context window of any agent working in this repo. They should be used incredibly sparingly, usually only for **navigation pointers** to other files.
- `CODING_STANDARDS.md`: this file is read during review, not implementation. It holds the rule table (step 6). Add **navigation pointers** to docs folders if the standards file gets more than 1,000 lines long.
- Docs: use docs as references files, pointed to by other files. Look for existing docs before writing new ones.
- Skills: use skills for docs (since their description goes into the agent's context window), or for user-invoked commands. Follow the advice in the `writing-for-agents` skill.