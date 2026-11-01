---
name: explain-pr
description: Walk me through the current branch's changes end to end, in plain words, so I can review the PR by hand.
disable-model-invocation: true
---

Explain the current branch's change so the person can review it manually and understand all of it.

## 1. Get the diff

1. Resolve the base: the user's fixed point if given, otherwise the default branch (`git symbolic-ref --short refs/remotes/origin/HEAD`, e.g. `origin/master`).
2. Run `git diff --stat <base>...HEAD` to see which files changed and how large the change is.
3. Run `git diff --no-color -U10 -M <base>...HEAD` to read the diff.
   - If the diff is very large, go file by file with `git diff --no-color -U10 <base>...HEAD -- <path>`.
   - Skip lockfiles, snapshots, and generated or minified files.
4. If a hunk lacks enough context to judge, read the full file with `git show HEAD:<path>`.
5. Run `git log <base>..HEAD` to read commit messages and understand intent.

Done when every non-skipped file's diff is read and the commits' intent is clear.

## 2. Trace

Build the full picture before writing a word of the explanation. Find each entry point (a request, a button, a command, a scheduled job, anything that sets the change running) and follow it through every changed file to where the result lands. When the diff leaves a hop unclear, grep for the unchanged callers and callees and read them.

Done when:

- every changed file sits in at least one traced flow;
- every new or changed function has its callers and what it calls named;
- files outside any flow (tests, config, migrations, docs) have their purpose pinned down: what each one sets up or proves;
- the PR's purpose fits in one sentence.

## 3. Explain

Talk like one person to another: short sentences, everyday words, the way you'd explain it to a sharp colleague who hasn't seen the code. Say what a codebase term means the first time it appears. State each thing once, simply.

In this order:

1. **The point**: what the PR does and why, in two or three sentences.
2. **The story**: follow each flow as it happens, from trigger to result. Name each file as the story reaches it, say what it's for, and say what it hands to the next one. Separate flows get separate stories.
3. **The side files**: tests, config, migrations, docs. What each one is for and what it connects to.
4. **Slow-down spots**: where the logic is subtle, the change is risky, or the diff is easy to misread, so the reviewer knows where to spend their attention.

Done when every changed file appears and every link between files is stated (who calls whom, what passes between them), so the reader can walk the diff unaided.