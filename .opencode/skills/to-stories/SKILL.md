---
name: to-stories
description: Black-box QA stories from technical issues. Use when given issues or tickets for one feature and asked for a tester- or PM-facing functional version.
---

Turn a set of related issues (mixed technical and functional) into one functional story per issue, for a QA tester and a product manager. The reader has the app open and nothing else, so every sentence is **black-box**: something a user sees, does, or reads in the UI. Each story is **self-contained**: it carries every fact the reader needs, and the issues, tickets, and specs it came from stay out of the document.

## 1. Read the whole set

Read every issue end to end: description, comments, linked issues, attachments, screenshots. Then hold the set as one feature: which issues depend on, extend, or overlap each other.

Done when you can state, per issue, (a) what a user can do or sees differently once it ships, and (b) the rules that define it, including those that appear only in comments or implementation notes. Implementation detail is evidence: read it to learn what the user will experience.

## 2. Translate to the UI

Convert each technical fact into its user-visible consequence:

| In the issue | In the story |
|---|---|
| Validation in API or schema | Message shown, field highlighted, submit blocked |
| Permission or role check | What each role sees, can click, or is told |
| Caching, async job, retry | Loading state, delay, what appears after refresh |
| Feature flag or config | Precondition in the Description |
| Error code or exception | The message text the user reads |
| Uniqueness or DB constraint | The "already exists" style message |
| Event, email, notification | The message the user receives |

Use UI labels and message wording exactly as the issues give them. Where the issues leave wording or behaviour unstated, record an **open question** for the PM.

Facts with no UI consequence, and open questions, go in your reply to the user (plain phrase, issue reference allowed there), outside the document.

Done when every technical fact has a UI consequence, an open question, or a place in the left-out list.

## 3. Write one story per issue

Use exactly these sections, in this order, with no others:

```
## <Plain-language title>

**User story**
As a <user type>, I want <capability> so that <benefit>.

**Description**
2-4 sentences: what changes for the user, where in the app, and the
starting state a tester needs (role, existing data, settings).

**Acceptance criteria**
1. Given <starting state>, when <user action>, then <visible result>.
2. ...

**Testing notes** (optional)
Test data or a non-obvious edge worth checking. Omit when empty.
```

Keep each story short. Pick the 3-6 criteria that *define* the behaviour: the happy path, plus the rules that change what the user sees (roles, limits, error messages). Each criterion states one starting state, one action, one visible result.

Make each story stand alone: its title, Description, and criteria read fully with no other story, ticket, or document open. Write the facts out in the story itself.

## 4. Check

Done when:

- Every rule from step 1(b) that defines the behaviour is covered by an acceptance criterion.
- A scan of the document finds only user vocabulary: screens, buttons, fields, messages, roles.
- The same scan finds no issue keys, ticket links, spec names, or phrases like "as per" or "see issue". Code terms (endpoints, status codes, tables, flags, class or field names) are rewritten as what the user sees.

## Output

Open the document with a 1-2 sentence feature summary and the recommended test order as a plain list of story titles. Then the stories in that order.

Deliver one Markdown file and present it. Use another format only when the user names one.