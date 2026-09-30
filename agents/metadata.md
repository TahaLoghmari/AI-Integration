## codebase-explorer

### Opencode

```txt
mode: subagent
model: openai/gpt-5.6-luna
permission:
  read: allow
  grep: allow
  glob: allow
  lsp: allow
  bash: allow
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
mode: subagent
model: openai/gpt-5.6-terra
permission:
  webfetch: allow
  websearch: allow
```

### Claude Code

```jsx
tools: (WebSearch, WebFetch);
model: claude - sonnet - 4 - 6;
effort: `medium`;
```

## db-query

### Opencode

```txt
mode: subagent
model: openai/gpt-5.6-luna
permission:
  bash: allow
```

### Claude code

```jsx
tools: (Glob, Grep, Read, Bash, LSP);
model: claude - sonnet - 4 - 6;
```

### Github Copilot

```jsx
user-invocable: false
target: vscode
model: GPT-5.6 Luna (copilot)
tools:
- read/terminalLastCommand
- execute/runInTerminal
- execute/getTerminalOutput
- read/terminalLastCommand
```
