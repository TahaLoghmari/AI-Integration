## codebase-explorer
### Opencode

```jsx
mode: subagent 
reasoningEffort: medium // If using OpenAI
model: github-copilot/claude-sonnet-4.6 || openai/gpt-5.6-luna
permission:
  read: allow
  grep: allow
  glob: allow
  lsp: allow
  bash: allow
  lsp: allow
```

### Claude Code

``` jsx
tools: Glob, Grep, Read, Bash, LSP
model: claude-sonnet-4-6
effort: `medium`
```

---

## figma-fetcher
### Opencode

```jsx
mode: subagent
reasoningEffort: medium // If using OpenAI
model: github-copilot/claude-sonnet-4.6 || openai/gpt-5.6-luna
permission:
  webfetch: allow
```

### Claude Code

``` jsx
tools: WebFetch
model: claude-sonnet-4-6
effort: `medium`
```

---

## web-search
### Opencode

```jsx
mode: subagent
reasoningEffort: medium // If using OpenAI
model: github-copilot/claude-sonnet-4.6 || openai/gpt-5.6-luna
permission:
  webfetch: allow
  websearch: allow
```

### Claude Code

``` jsx
tools: WebSearch, WebFetch
model: claude-sonnet-4-6
effort: `medium`
```
