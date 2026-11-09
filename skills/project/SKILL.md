---
name: project
description: Initialize or migrate this repo's principles into AGENTS.md, and make CLAUDE.md a symlink to it. Principles include how docs are organized and updated. Use when the user runs /project.
disable-model-invocation: true
---

# Project

User-invoked only. Do not start this skill unless the user ran `/project`. `/project` has no subcommand.

Work at the git repo root. This skill initializes and migrates the repo's principles. A principle is a standing rule for how the repo is organized and kept current. How `docs/` is organized and updated is one principle. Others are added the same way. This skill does not discuss an idea (`design-idea`), design a module (`design-code`), review a diff (`diff-review`), diagnose a bug (`code-fix`), or review the whole codebase (`codebase-review`).

Principles live only in `AGENTS.md`, under `## Principles`. `CLAUDE.md` is a relative symlink to `AGENTS.md`.

The project-status principle is [references/statuses.md](references/statuses.md). The docs principle is [references/docs.md](references/docs.md). Each other principle is stated by the user.

## Files

Use the names `AGENTS.md` and `CLAUDE.md`. If the same name exists in another case, rename it to that spelling before writing. `AGENT.md` is not this file. When `AGENTS.md` is missing and `AGENT.md` exists, rename `AGENT.md` to `AGENTS.md`.

**Migrate** before writing. Read the repo's existing agent instructions: `AGENTS.md`, a regular `CLAUDE.md`, `AGENT.md`, and any other file the repo already uses as agent guidance. Carry each current rule into `## Principles` once. Do not invent a rule that is not already written, except the two principles below when they are missing. Do not rewrite bodies under `docs/`. Do not migrate product data.

**Create `AGENTS.md`** when it is missing:

```markdown
# Agent notes

## Principles

### Project status

- **Status:** `startup`
- **Breaking changes:** <from the startup row>
- **Persist data:** <from the startup row>

<the table in references/statuses.md>

### Docs

<the procedure in references/docs.md>
```

Also create `docs/idea/`, `docs/feature/`, and `docs/design/` when missing.

**Update a principle** in place. The file states the rule as it stands now. Replace the text that is no longer the rule. Do not append how the rule changed, and do not add a second file for the same principle.

Leave every section outside `## Principles` as it is. `## Project status`, `## Status rules`, and `## Work` are the old shape of these two principles. When one of them is present, fold it into `## Principles` and remove the old heading.

**Link.** After `AGENTS.md` is in place, make `CLAUDE.md` a relative symlink to `AGENTS.md`. If `CLAUDE.md` is already that symlink, leave it. If it is a symlink elsewhere, replace the link. If it is a regular file, its rules belong in `AGENTS.md` first; then replace the file with the symlink. Tell the user what moved.

Confirm which principle changed, and that `CLAUDE.md` points at `AGENTS.md`.

Do not commit, push, or migrate data.
