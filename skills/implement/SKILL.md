---
name: implement
description: Implement a task idiomatically, verified by typecheck and tests
disable-model-invocation: true
---

Implement the task the user gave.

1. **Explore.** Fan out exploration subagents until every area you'll touch has its existing pattern located: naming, structure, neighbouring code, test style.
2. **Build.** Write code that reads as if the repo's authors wrote it: _idiomatic_. Invoke /tdd explicitly when the task looks like it calls for test-first work; otherwise build directly.
3. **Verify as you go.** Typecheck after each meaningful edit; run the single test file for the code you touched.
4. **Close.** Run the full test suites related to the work done, once. Done when typecheck is clean and those suites are green, with existing tests passing unchanged unless the task changes their behaviour.