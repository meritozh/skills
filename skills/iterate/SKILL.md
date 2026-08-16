---
name: iterate
description: Run an exclusive feature, fix, refactor, note, or general planning workflow and write the result under docs/. Use when the user runs /iterate.
disable-model-invocation: true
argument-hint: feature|fix|refactor|note|general start|finish|abort [input]
---

# Iterate

User-invoked only. Do not start this skill unless the user ran `/iterate`.

```
/iterate <feature|fix|refactor|note|general> <start|finish|abort> [input]
```

If category or action is missing or invalid, stop and print the usage line. Do not guess.

## Gates (every invocation)

Reject and tell the user why, without writing files, when any of these hold:

1. Root `CONTEXT.md` has no `## Project status` with a status of `startup`, `release-solo`, or `release`. Tell them to run `/project init` (or set a status) first.
2. This session still has unfinished work (open todos, a half-done edit the user asked for, a waiting question from another skill). Name what is still open.
3. `docs/.iterate-open.md` exists **and** this invocation is `start`. An open workflow is exclusive. Name the open category and tell them to `/iterate <that-category> finish` or `abort`.

`finish` / `abort` require `docs/.iterate-open.md`. If it is missing, stop. If its category does not match the category in the command, stop.

## `start`

1. Create `docs/.iterate-open.md`:

```markdown
---
category: <category>
status: open
---

# Notes

<user input, or empty>
```

2. If `[input]` is empty, ask what they want to talk about. If it is present, ask only for the details still needed to write a useful `docs/<category>/` note.
3. Stay in this interview: ask, wait, record answers into `docs/.iterate-open.md`. Do not write the final doc. Do not start another category.

The user ends the loop with `/iterate <category> finish` or `abort`. Until then, do not treat ordinary chat as finish.

## `finish`

1. Read `docs/.iterate-open.md` and this conversation since `start`.
2. Write one file: `docs/<category>/<yyyy-mm-dd>-<slug>.md`. Slug from the topic, lowercase hyphenated. Do not overwrite an existing path; add `-2` if needed.
3. Produce the doc with the best installed writer: `write` for `note` and `general`; `think` (or a structured plan) for `feature`, `fix`, and `refactor`. If that skill is not installed, write the same kind of document yourself.
4. Honor `CONTEXT.md` project status (breaking changes and persist-data rules).
5. Delete `docs/.iterate-open.md`.
6. Tell the user the path.

## `abort`

Delete `docs/.iterate-open.md`. Do not write anything under `docs/<category>/`. Discard the talk since `start`. Confirm abort in one sentence.
