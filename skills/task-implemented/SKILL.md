---
name: task-implemented
description: Writes task-implemented.md at the repo root, summarizing the task just completed for a reviewer — no ticket needed. Invoke by name after finishing implementation work.
disable-model-invocation: true
---

Reconstructs a ticket after the fact, from the conversation instead of a written spec, so the code-review skill always has something to review against.

## Steps

1. Reread the conversation and identify the task actually implemented — the request that triggered the work, not any earlier or unrelated exchanges.
2. Write `task-implemented.md` at the repo root (overwrite if it already exists) with exactly these three sections:

   - **Goal** — what the task was trying to achieve, in one or two sentences.
   - **Before** — the relevant state or behavior prior to the change: what was missing, broken, or absent.
   - **What changed** — the resulting behavior or capability, described functionally.

   Completion criterion: every sentence in all three sections describes intent or behavior a non-technical stakeholder would recognize. No file names, function/class/variable names, library names, line numbers, or code snippets anywhere in the document — the reviewer agent pulls the technical diff from git itself.

   This holds even when the task itself is technical (a refactor, a module split, a dependency swap, etc..). Describe the *why* — what was getting harder to maintain, extend, or reason about — and the *outcome* in the same terms, never the mechanism.

3. Confirm the file was written and stop — do not summarize its contents back in the chat.