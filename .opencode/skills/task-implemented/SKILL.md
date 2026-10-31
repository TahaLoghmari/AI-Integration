---
name: task-implemented
description: Writes task-implemented.md at the repo root, recovering the task just completed from the conversation into a stakeholder-readable record for a reviewer. Use when the user asks to record what was implemented, or when the code-review skill needs a task-implemented.md that doesn't yet exist.
disable-model-invocation: true
---

There's no written ticket for this task: the conversation is the ticket. Recover the task from it in a form a non-technical stakeholder would recognize; the reviewer agent pulls the technical diff from git itself.

## Steps

1. Reread the conversation and identify the task actually implemented, the request that triggered the work, not any earlier or unrelated exchanges.
2. Write `task-implemented.md` at the repo root (overwrite if it already exists) with exactly these three sections:
   - **Goal**: what the task was trying to achieve, in one or two sentences.
   - **Before**: the relevant state or behavior prior to the change: what was missing, broken, or absent.
   - **What changed**: the resulting behavior or capability, described functionally.

   This holds even when the task itself is technical (a refactor, a module split, a dependency swap, etc.). Describe the _why_: what was getting harder to maintain, extend, or reason about, and the _outcome_ in the same terms, never the mechanism.

   Completion criterion: every sentence in all three sections describes intent or behavior a non-technical stakeholder would recognize. No file names, function/class/variable names, library names, line numbers, or code snippets anywhere in the document.

3. Confirm the file was written, then stop. Its contents live in the file, not in the chat, don't restate them there.
