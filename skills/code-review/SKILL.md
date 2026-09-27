---
name: code-review
description: Review the changes since a fixed point (commit, branch, tag, or merge-base) along two axes: Code Quality & Regression (does the code follow this repo's coding standards and patterns, and did the changes preserve existing functionality without introducing regressions?) and Spec (does the code match what the originating issue/spec asked for?). Reviews both axes directly, one at a time, and reports them side by side. Use when the user wants to review a branch, a PR, work-in-progress changes, or asks to "review since X".
disable-model-invocation: true
---

Two-axis review of the diff since a fixed point the user provides, or if not provided between current code and main (run `git diff main...HEAD`):

- **Code Quality & Regression**: does the code conform to this repo's coding standards and patterns, and did the changes preserve existing functionality without introducing regressions?
- **Spec**: does the code faithfully implement the originating issue / spec?

Both axes are reviewed **directly, one at a time, in separate passes**: do not blend them into a single read-through of the diff. Complete and write up one axis in full before starting the other. This keeps the two lenses distinct even without separate agent contexts: forming Spec opinions while still hunting for quality issues (or vice versa) causes one axis to bleed into and mask the other, which is exactly what the separation is meant to prevent.

The issue tracker should have been provided to you.

### Pass 1: Code Quality & Regression

Re-read the diff (the full diff command and commit list) with only this lens active. Do not consult the spec/issue during this pass. Check the diff against CODING_STANDARDS.md for this repo's coding standards.

Report: per file/hunk where relevant:
(a) every place the diff violates a standard: cite the standard (the rule);
(b) any baseline smell you spot: name it and quote the hunk;
(c) any regression or behavior break introduced by the change: identify the previously working behavior, explain how the diff can break it, and cite the relevant hunk/file.

Distinguish hard violations from judgement calls: standard breaches can be hard, baseline smells are always judgement calls, and regressions should only be reported when there is concrete evidence or a strong code-path-based reason. Check existing callers, tests, interfaces, data flows, error handling, and backwards compatibility where relevant. Do not report pre-existing bugs unless the change makes them worse. Skip anything tooling enforces. Under 500 words.

Common smells to look for:

- **Mysterious Name**: a function, variable, or type whose name doesn't reveal what it does or holds. → rename it; if no honest name comes, the design's murky.
- **Duplicated Code**: the same logic shape appears in more than one hunk or file in the change. → extract the shared shape, call it from both.
- **Old Dead code**: code that is no longer used or reachable. → delete it.
- **Feature Envy**: a method that reaches into another object's data more than its own. → move the method onto the data it envies.
- **Data Clumps**: the same few fields or params keep travelling together (a type wanting to be born). → bundle them into one type, pass that.
- **Primitive Obsession**: a primitive or string standing in for a domain concept that deserves its own type. → give the concept its own small type.
- **Repeated Switches**: the same `switch`/`if`-cascade on the same type recurs across the change. → replace with polymorphism, or one map both sites share.
- **Shotgun Surgery**: one logical change forces scattered edits across many files in the diff. → gather what changes together into one module.
- **Divergent Change**: one file or module is edited for several unrelated reasons. → split so each module changes for one reason.
- **Speculative Generality**: abstraction, parameters, or hooks added for needs the spec doesn't have. → delete it; inline back until a real need shows.
- **Message Chains**: long `a.b().c().d()` navigation the caller shouldn't depend on. → hide the walk behind one method on the first object.
- **Middle Man**: a class or function that mostly just delegates onward. → cut it, call the real target direct.
- **Refused Bequest**: a subclass or implementer that ignores or overrides most of what it inherits. → drop the inheritance, use composition.
- **Regression / Behaviour Break**: existing functionality that the change can break, including changed contracts, altered control flow, invalid assumptions about callers/data, error-handling regressions, state/lifecycle issues, compatibility problems, or behavior that existing tests/call sites rely on. → verify the affected code paths and report the concrete breakage or credible failure scenario.

If the code is solid on this axis, say so plainly and report no findings: there's no quota to fill and no bias toward finding problems. Skip nitpicks, stylistic preferences, or issues raised just to have something to say.

Write this pass's findings up in full before moving on.

### Pass 2: Spec

Now re-read the diff again (same diff command and commit list), this time against the path or fetched contents of the spec. Set aside the Code Quality & Regression findings while doing this: don't let them shape what you flag here.

Report: (a) requirements the spec asked for that are missing or partial; (b) behaviour in the diff that wasn't asked for (scope creep); (c) requirements that look implemented but where the implementation looks wrong. Quote the spec line for each finding. Under 400 words.

If the code fully matches the spec, say so plainly and report no findings.

If the spec is missing, skip this pass and note this in the final report.

### Present

Present the two write-ups under `## Code Quality & Regression` and `## Spec` headings, verbatim or lightly cleaned. Do **not** merge or rerank findings: the two axes are deliberately separate (see _Why two axes_).

End with a one-line summary: total findings per axis, and the worst issue _within each axis_ (if any). Don't pick a single winner across axes — that's the reranking the separation exists to prevent.

## Why two axes

A change can pass one axis and fail the other:

- Code that follows every standard and doesn't break any existing functionality but implements the wrong thing → **Code Quality & Regression pass, Spec fail.**
- Code that does exactly what the issue asked but breaks the project's conventions or an existing functionality → **Code Quality & Regression fail, Spec pass.**

Reporting them separately, and reviewing them in separate passes, stops one axis from masking the other.

## Important note

Only report findings that are genuinely impactful and worth acting on. Skip nitpicks, stylistic preferences, or issues raised just to have something to say. There's no quota to fill and no bias toward finding problems: if the code is solid on an axis, say so plainly and report no findings there.

Delegate to as many exploration subagents as needed to assist you with exploration.
