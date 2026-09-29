---
name: to-jira
description: Restate a feature's issue files as QA-verifiable Jira items in the feature's jira-items.md, creating the file or adding to it.
disable-model-invocation: true
---

# To Jira

Turn the issue files under `docs/features/<feature-slug>/issues/` into
`docs/features/<feature-slug>/jira-items.md`: one Jira item per issue, each a
functional **restatement** of that issue. An item describes **observable**
behaviour, what a QA tester can see and check in the product. The how stays in
the source issue file, which the item links to.

## Steps

### 1. Scope the run

- **Feature.** Take the slug from the arguments, or else from the current
  branch or conversation. If more than one feature fits, ask.
- **Issues.** Take a range or list from the arguments, or else every issue
  file. If `jira-items.md` exists, the run **adds** items for issues it lacks
  and leaves existing items as they are unless the user asks for a rewrite.
- **Prefix.** Reuse the item prefix already in `jira-items.md` (e.g.
  `SP-MFA`). For a new file, ask the user for one.

Done when you can name the feature folder, the exact issue files in scope,
and the prefix.

### 2. Read every source issue in full

Read each in-scope issue file end to end, including acceptance criteria,
out-of-scope notes and blockers. Read `spec.md` or `plan.md` only where an
issue leans on a term it does not define.

Also note the title of every issue that an in-scope issue depends on or
mentions, including ones outside the scope. You need those titles for
cross-references (see step 3).

Done when every in-scope issue is read and every referenced issue's title is
known.

### 3. Write the items

Use the item template below, in issue-number order. Follow the rules in the
Reference section.

- **New file:** begin with the file header and a **Shared terms** section.
- **Existing file:** append the new items after the last one. Update the issue
  range in the title and intro line. Add a shared term only if a new item
  needs one that is missing.

Done when every in-scope issue has exactly one item, and every acceptance
criterion in each source issue is covered by an item criterion or was left
out because it is internal (see step 4).

### 4. Check the restatement

Go through each new item against its source issue:

- **Every criterion is observable.** A tester can check it through the UI,
  an email, an API call, a pipeline run or the test database. A source
  criterion that only a code reader could check (e.g. "the handler is
  scoped") has no item criterion. It stays in the issue file.
- **No implementation leaks.** Search the new items for class names, method
  names, file paths other than the `Source` path, table names and code
  snippets, and restate each one as the behaviour it causes.
- **Cross-references are titles.** Search the new items for bare issue
  numbers and `<PREFIX>-NN` outside headings, `Source` paths and the file
  title, and replace each with the referenced item's title.

Done when all three checks pass for every new item.

## Reference

### File header (new file only)

```markdown
# <Feature name> — Jira items (issues <first>–<last>)

Functional restatements of `issues/<first>`–`issues/<last>` for Jira. Each item
describes observable behaviour a QA tester can verify; implementation detail
stays in the source issue file.

## Shared terms

- **<Term>** — <one-line meaning in product language>.

---
```

**Shared terms** define, once, the domain words that several items use:
roles, states and flags. Items then use a term without redefining it.

### Item template

```markdown
## <PREFIX>-<NN> — <Title>

**Type:** <Story | Bug | Story (<repo> repository) | Story (background job) | …> · **Depends on:** <titles, or none> · **Source:** `issues/<file>.md`

**User story**
As a <role>, I want <capability>, so that <benefit>.

**Description**
<The behaviour in product language: what the user sees and what changes, the cases where it applies and where it does not.>

**Acceptance criteria**
1. <One observable, checkable outcome.>

**Test notes**
- <How to set up or force a case, data needed, dependencies on other items.>

---
```

- **`<NN>` and `<Title>`** come from the issue file. The title may be
  reworded into product language.
- **Type:** use **Bug** when the issue fixes behaviour that is wrong today.
  Name the repository when the work lives outside this one.
- **Status:** add `· **Status:** Blocked — <reason>` after Type only when the
  issue is blocked on something outside the feature.
- **Priority note:** add a `**Priority note:**` line under the meta line only
  when the issue states an ordering constraint for release.
- **Test notes** are optional. Include them when a case needs forcing (past
  dates, mock responses, specific accounts), when a value must be read from
  the environment, or when a check depends on another item being deployed.

### Rules

- **Product language.** Name screens, messages, emails, roles and states, not
  classes, endpoints or tables. A mechanism appears only as its visible
  effect: "the account starts payment-details-enforced", not "a settings row
  is seeded".
- **Cross-references by title.** Refer to another issue by its title in
  italics, e.g. *MFA schema*. Use italics because titles can contain quotes.
  This applies to `Depends on`, descriptions, criteria and test notes. An
  issue with no item of its own is still referenced by its issue-file title.
- **Criteria.** Number them per item and write each as one outcome. Group
  them under italic sub-headings when an item covers several flows.
  - Keep the source's negative cases (feature flag off, External users,
    abandoned flows) as their own criteria, since QA regression depends on
    them.
- **Configurable values.** Where the source leaves a value to configuration
  or pending sign-off, write "the configured <value>". Never state a number
  the source does not fix.
- **Scope.** The item covers only what the issue delivers. Things the source
  lists as out of scope go in the Description only when a tester would
  otherwise expect them, e.g. "Self-registration behaves exactly as today".
