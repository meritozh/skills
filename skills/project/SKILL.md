---
name: project
description: Manage this repo's project status in CONTEXT.md. Only accepts init, startup, release-solo, or release. Use when the user runs /project.
disable-model-invocation: true
argument-hint: init|startup|release-solo|release
---

# Project

User-invoked only. Do not start this skill unless the user ran `/project`.

Argument must be exactly one of: `init`, `startup`, `release-solo`, `release`. If missing or anything else, stop and print:

```
Usage: /project <init|startup|release-solo|release>
```

Status definitions: [references/statuses.md](references/statuses.md). That file is the only definition of what each status allows.

## Locate CONTEXT.md

Work at the git repo root. Status lives only in the root `CONTEXT.md`, section `## Project status`. Do not invent a second status file. Leave every other section (Language, etc.) untouched unless `init` is creating the file.

## `init`

1. If `CONTEXT.md` already has `## Project status`, stop and say so. Use `/project startup` (or another status) to change it.
2. If `CONTEXT.md` is missing, create it. Title from the directory name. One-line description if the repo already states one (README first paragraph); otherwise leave a short placeholder.
3. Write or insert this section (status `startup`):

```markdown
## Project status

- **Status:** `startup`
- **Breaking changes:** Allowed whenever they make the long-term design better. Do not optimize for compatibility or the smallest diff.
- **Persist data:** May reset. No migration.
```

4. Create these directories if missing: `docs/feature/`, `docs/fix/`, `docs/refactor/`, `docs/note/`, `docs/general/`.
5. Tell the user the status is `startup` and where the files are.

## `startup` | `release-solo` | `release`

1. If `CONTEXT.md` is missing, stop. Tell the user to run `/project init`.
2. Replace only the `## Project status` section. Keep the rest of the file. Use the matching row in [references/statuses.md](references/statuses.md) for the two bullet lines.
3. Confirm the new status in one sentence.

Do not commit, push, or migrate data. This skill only updates `CONTEXT.md` (and scaffolds on `init`).
