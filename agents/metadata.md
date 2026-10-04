## codebase-explorer

### Opencode

```txt
description: "Use proactively to gain context before acting: trace how a feature works, locate where code lives, or find exemplars to model new work after. Findings are orientation; verify in the source before any critical decision."
mode: subagent
model: openai/gpt-5.6-luna
permissions:
  - action: edit
    resource: "*"
    effect: deny
```

### Claude Code

```jsx
tools: (Glob, Grep, Read, Bash, LSP);
model: claude - sonnet - 4 - 6;
effort: `medium`;
```

---

## web-search

### Opencode

```txt
description: "Web research outside the codebase: library/API docs, current facts, usage examples. Use proactively when the answer lives on the web, not in local files."
mode: subagent
model: openai/gpt-5.6-terra
permissions:
  - action: "*"
    resource: "*"
    effect: deny
  - action: webfetch
    resource: "*"
    effect: allow
  - action: websearch
    resource: "*"
    effect: allow
```

### Claude Code

```jsx
tools: (WebSearch, WebFetch);
model: claude - sonnet - 4 - 6;
effort: `medium`;
```
