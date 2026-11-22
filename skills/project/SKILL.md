---
name: project
description: Initialize or update this repo's AGENTS.md by reading the repo, then asking the user what it cannot tell — status, the check before commit, boundaries, gotchas, and project rules. Writes the repo's commands and layout plus built-in principles for project status, docs, small local commits, cleanup, and architecture, and makes CLAUDE.md a symlink to it. Use when the user runs /project.
disable-model-invocation: true
---

# Project

User-invoked only. Do not start this skill unless the user ran `/project`. `/project` has no subcommand. When the work belongs to another skill, name it, say why, and stop. Do not invoke it yourself.

Work at the git repo root. This skill writes `AGENTS.md`: what an agent cannot quickly learn from the code, and the standing rules every agent follows while working here. It does not decide a new feature (`feature-new`), change an existing one (`feature-iterate`), write an implement spec (`to-implement-spec`), carry one out (`go-work`), review a diff (`diff-review`), diagnose a bug (`code-fix`), or review the whole codebase (`codebase-review`).

`AGENTS.md` has two sections this skill owns: `## Repo` holds the facts of this repo, and `## Principles` holds the rules. `CLAUDE.md` is a relative symlink to `AGENTS.md`.

## What belongs in AGENTS.md

Every agent reads the whole file at the start of every task, so every line is paid for on every task. A line earns its place only when all of these hold:

- **An agent would get it wrong without it.** If the README, a manifest, or a quick read of the code says it, leave it out.
- **It stays true for months.** Current bugs, sprint plans, and TODOs do not belong.
- **It is concrete.** A command, a path, a name, a limit, or a prohibition. "Write clean code" is not.
- **No tool already enforces it.** For a rule the formatter, linter, or type checker enforces, write the command, not the rule.
- **It is about this repo.** A personal preference, such as reply language or tone, belongs in the user's global agent file.
- **It is short.** An explanation longer than three lines goes into `docs/`, and the line links to it.

| Part | Holds | Comes from |
| --- | --- | --- |
| Opening line | What this repo is, in one or two sentences. Only when the README does not open with that | The repo, confirmed by the user |
| `### Commands` | Exact commands: setup, the check before commit, one test, run, and any other command agents need (codegen, migrate) | Manifests and CI, confirmed by the user |
| `### Layout` | Paths whose role the name does not say: generated or vendored code and how to update it, entry points, where a kind of code goes | The tree, confirmed by the user |
| `### Gotchas` | Facts that surprise: a required service or env var, code that looks dead but is loaded at runtime, a test that needs the network | The user |
| Built-in principles | Fixed text | `references/` |
| `### Project rules` | Do, do-not, and ask-before rules for this repo | The user, and migration |

Not in `AGENTS.md`: features and their decisions (`docs/feature/`), implement specs (`docs/spec/`), project terms (`docs/GLOSSARY.md`), change history, plans, secrets, and anything a tool already reports.

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
- A built-in principle whose text differs is replaced with the reference text. The project status value stays as it is unless the user changes it.
- A line under a built-in heading that the reference does not contain is a repo-specific rule. Move it to `### Project rules` once, and tell the user.

`### Project rules` holds the rules the user states and the rules migration carries over. This skill never invents a rule and never rewrites one unless the user asks.

## Procedure

### 1. Read

Before asking anything, read what the repo already says:

- Agent instructions: `AGENTS.md`, a regular `CLAUDE.md`, `AGENT.md`, `.cursorrules`, `.cursor/rules/`, `.github/copilot-instructions.md`, and any other file the repo already uses as agent guidance.
- The opening of `README.md`, and `CONTRIBUTING.md`.
- Manifests and task runners: `package.json` scripts, `Makefile`, `justfile`, `Cargo.toml`, `pyproject.toml`, `go.mod`, and their kin.
- CI config. The check that gates a merge is the best candidate for the check before commit.
- The top two levels of the tree, generated-file markers, vendored directories, `.env.example`, compose files.
- `git tag`, release config, and migrations: evidence for the project status.

### 2. Draft

Draft every part of the file from that evidence. For each line, keep where it came from (a file and line), or mark it `ask`. Run the filter in "What belongs in AGENTS.md" on every candidate, existing lines included. An existing line whose evidence is gone, such as a script no longer in the manifest or a path that no longer exists, is `stale`.

### 3. Ask

Talk to the user before writing. Ask only what the repo cannot answer. Attach your best guess and its evidence to every question, so the user can say yes, correct it, or skip it.

Ask in this order, and leave out every question that has nothing to ask:

1. **Status.** On a new file: `startup`, `release-solo`, or `release`. Give one line on what each allows, and your guess from tags, releases, and migrations. On an existing file, ask only when the evidence disagrees with the stored status.
2. **Check before commit.** When manifests and CI name several checks or none: which one an agent runs before each commit, and how to run a single test.
3. **Conflicts.** For each migrated rule that contradicts a built-in principle: keep the repo's rule, take the built-in, or drop it.
4. **Stale lines and loose sections.** For each `stale` line: drop, keep, or correct. For each other section that holds commands, layout, or rules, such as `## Development` or `## Testing`: fold it into `## Repo` or `## Principles`, or leave it.
5. **Boundaries.** What an agent must never touch, or must ask before doing. Offer what you found: generated or vendored paths, migrations, lockfiles, deploy scripts, production config.
6. **Gotchas.** What a new contributor, human or agent, usually gets wrong here. Offer what you found. Only the user can fully answer this one.
7. **Anything else** every agent here should know. Ask once, last.

How to ask:

- At most four questions in a round. When the agent has a structured question tool, use it, with your guess as the first option. Otherwise ask a numbered list in chat.
- Run a second round only for what the answers raised, then write. Never run more than three rounds.
- An answer passes the same filter. When one fails it, say which test it fails and where it belongs instead, and ask once whether to write it anyway.
- Do not ask the user to restate what the repo already says, and do not ask them to approve the built-in principles.
- On a re-run where nothing is `ask`, `stale`, or in conflict, ask only question 7. When the user's message already says what to change, skip this step.

Until the user answers question 3, a conflicting repo rule goes to `### Project rules`. An unanswered status question leaves a new file at `startup`.

### 4. Write

Use the names `AGENTS.md` and `CLAUDE.md`. If the same name exists in another case, rename it to that spelling before writing. `AGENT.md` is not this file. When `AGENTS.md` is missing and `AGENT.md` exists, rename `AGENT.md` to `AGENTS.md`.

**Migrate.** Carry each current rule from the agent instructions read in step 1 into `AGENTS.md` once: a fact into `## Repo`, a rule into the built-in principle it duplicates or into `### Project rules`. Do not rewrite bodies under `docs/`. Do not migrate product data.

`## Project status`, `## Status rules`, and `## Work` are the old shape of the principles. When one is present, fold it into `## Principles` and remove the old heading. Leave every other section outside `## Repo` and `## Principles` as it is, unless the user chose to fold it in.

**Shape.** `AGENTS.md` after a run:

```markdown
# Agent notes

<One or two sentences on what this repo is.>

## Repo

### Commands

| Purpose | Command |
| --- | --- |
| Setup | `<command>` |
| Check before commit | `<command>` |
| Test one | `<command>` |
| Run | `<command>` |

### Layout

- `<path>/`: <its role, when the name does not say it>

### Gotchas

- <a fact that surprises>

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

Leave out the opening line, a row, a subsection, or the whole `## Repo` when it has nothing that passes the filter. Every built-in principle is always present.

Also create `docs/feature/` when missing, and add `.scratch/` to `.gitignore` when it is not ignored yet (`git check-ignore -q .scratch/x || echo '.scratch/' >> .gitignore`).

**Update in place.** `AGENTS.md` states each fact and rule as it stands now. Replace text that is no longer true. Do not append how a rule changed, and do not add a second file for the same principle.

### 5. Link

After `AGENTS.md` is in place, make `CLAUDE.md` a relative symlink to `AGENTS.md`. If `CLAUDE.md` is already that symlink, leave it. If it is a symlink elsewhere, replace the link. If it is a regular file, its rules belong in `AGENTS.md` first; then replace the file with the symlink. Tell the user what moved.

```bash
git mv agents.md AGENTS.md      # case-only rename of a tracked file; untracked: mv through a temporary name
ln -sfn AGENTS.md CLAUDE.md     # relative target, replaces an old link
readlink CLAUDE.md              # prints AGENTS.md
git ls-files -s CLAUDE.md       # mode 120000 once staged means git stores a symlink
```

On Windows, git writes a symlink only with `core.symlinks=true` and symlink permission. Without them `CLAUDE.md` becomes a text file holding `AGENTS.md`. Say so instead of claiming the link exists.

### 6. Finish

Show what changed: `git diff -- AGENTS.md .gitignore`, or the whole file when it is new. Name each principle added, replaced, or moved to `### Project rules`. List the lines written from evidence that no question covered, so the user can strike them. Confirm that `CLAUDE.md` points at `AGENTS.md`.

Do not commit, push, or migrate data. A change to the repo's rules is reviewed by the user before it is committed; the Commits principle governs the work that follows, not this run.
