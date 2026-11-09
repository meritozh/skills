---
name: project
description: Initialize or update this repo's principles in AGENTS.md, and make CLAUDE.md a symlink to it. Built-in principles cover project status, docs, small local commits, cleanup of intermediate artifacts, and architecture. Use when the user runs /project.
disable-model-invocation: true
---

# Project

User-invoked only. Do not start this skill unless the user ran `/project`. `/project` has no subcommand. A status change or a new rule comes from the user's words in the same message.

Work at the git repo root. This skill writes the repo's principles: the standing rules every agent follows while working here. It does not discuss an idea (`design-idea`), design a module (`design-code`), review a diff (`diff-review`), diagnose a bug (`code-fix`), or review the whole codebase (`codebase-review`).

Principles live only in `AGENTS.md`, under `## Principles`. `CLAUDE.md` is a relative symlink to `AGENTS.md`.

## Built-in principles

| Heading in `AGENTS.md` | Text comes from |
| --- | --- |
| `### Project status` | [references/statuses.md](references/statuses.md) |
| `### Docs` | [references/docs.md](references/docs.md) |
| `### Commits` | [references/commits.md](references/commits.md) |
| `### Cleanup` | [references/cleanup.md](references/cleanup.md) |
| `### Architecture` | [references/architecture.md](references/architecture.md) |

Each reference file is the text of its principle: copy everything below its `#` heading, unchanged, under the heading in `AGENTS.md`. Project status is the one with a value: write the status, its two fields from that row, then the table.

Every run brings each built-in principle to the current text of its reference:

- A missing built-in principle is added.
- A built-in principle whose text differs is replaced with the reference text. The project status value stays as it is unless the user asked to change it.
- A line under a built-in heading that the reference does not contain is a repo-specific rule. Move it to `### Project rules` once, and tell the user.

`### Project rules` holds the rules the user states and the rules migration carries over. This skill never invents one and never rewrites one unless the user asks.

## Files

Use the names `AGENTS.md` and `CLAUDE.md`. If the same name exists in another case, rename it to that spelling before writing. `AGENT.md` is not this file. When `AGENTS.md` is missing and `AGENT.md` exists, rename `AGENT.md` to `AGENTS.md`.

**Migrate** before writing. Read the repo's existing agent instructions: `AGENTS.md`, a regular `CLAUDE.md`, `AGENT.md`, and any other file the repo already uses as agent guidance. Carry each current rule into `## Principles` once: into the built-in principle it duplicates, or into `### Project rules`. A rule that contradicts a built-in principle goes to `### Project rules` and is named to the user; the repo's rule wins until the user decides. Do not rewrite bodies under `docs/`. Do not migrate product data.

`## Project status`, `## Status rules`, and `## Work` are the old shape of these principles. When one is present, fold it into `## Principles` and remove the old heading. Leave every other section outside `## Principles` as it is.

**Shape.** `AGENTS.md` after a run:

```markdown
# Agent notes

## Principles

### Project status

- **Status:** `startup`
- **Breaking changes:** <from that status row>
- **Persist data:** <from that status row>

<the table in references/statuses.md>

### Docs

<references/docs.md below its heading>

### Commits

<references/commits.md below its heading>

### Cleanup

<references/cleanup.md below its heading>

### Architecture

<references/architecture.md below its heading>

### Project rules

- <each rule the user stated or migration carried over>
```

A new `AGENTS.md` starts at status `startup`. Leave out `### Project rules` while it has no rule.

Also create `docs/idea/`, `docs/feature/`, and `docs/design/` when missing, and add `.scratch/` to `.gitignore` when it is not ignored yet (`git check-ignore -q .scratch/x || echo '.scratch/' >> .gitignore`).

**Update in place.** `AGENTS.md` states each rule as it stands now. Replace text that is no longer the rule. Do not append how a rule changed, and do not add a second file for the same principle.

## Link

After `AGENTS.md` is in place, make `CLAUDE.md` a relative symlink to `AGENTS.md`. If `CLAUDE.md` is already that symlink, leave it. If it is a symlink elsewhere, replace the link. If it is a regular file, its rules belong in `AGENTS.md` first; then replace the file with the symlink. Tell the user what moved.

```bash
git mv agents.md AGENTS.md      # case-only rename of a tracked file; untracked: mv through a temporary name
ln -sfn AGENTS.md CLAUDE.md     # relative target, replaces an old link
readlink CLAUDE.md              # prints AGENTS.md
git ls-files -s CLAUDE.md       # mode 120000 once staged means git stores a symlink
```

On Windows, git writes a symlink only with `core.symlinks=true` and symlink permission. Without them `CLAUDE.md` becomes a text file holding `AGENTS.md`. Say so instead of claiming the link exists.

## Finish

Show what changed: `git diff -- AGENTS.md .gitignore`, or the whole file when it is new. Name each principle added, replaced, or moved to `### Project rules`, and confirm that `CLAUDE.md` points at `AGENTS.md`.

Do not commit, push, or migrate data. A change to the repo's rules is reviewed by the user before it is committed; the Commits principle governs the work that follows, not this run.
