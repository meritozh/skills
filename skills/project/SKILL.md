---
name: project
description: "Keep this repo's AGENTS.md, with CLAUDE.md as a symlink to it: the commands, layout, and gotchas an agent cannot learn quickly from the code, built-in principles for project status, docs, commits, cleanup, and architecture, and the project's own rules. Run the full setup when the user asks to set up or refresh the repo's agent rules (初始化项目规范, 更新 AGENTS.md). Also use it, briefly, when the user states a standing rule or preference for the whole repo mid-work (以后都…, 这个项目一律…, 我们不用…): record it in one line, unless AGENTS.md already says it. Not for a choice that holds only for the current task, how a feature behaves, a personal preference, or a long-range goal."
---

# Project

Run this skill on `/project` or a request that matches the description, in one of two modes:

- **[Full run](#full-run):** `/project` alone, or a request to set up or refresh the agent rules.
- **[Capture](#capture):** `/project` with a rule in its message, or one standing rule, boundary, design preference, command, gotcha, or status change stated mid-work. Record it, then go back to the work.

When you start it without `/project`, say so in one line, with the reason. When the work belongs to another skill, say which and why: switch to it when you can invoke it, otherwise name it for the user and stop.

Work at the git repo root. This skill owns two sections of `AGENTS.md`: `## Repo` for facts and `## Principles` for rules. `CLAUDE.md` is a relative symlink to `AGENTS.md`.

Not for this skill: a choice for the task at hand only (follow it and write nothing); how one feature behaves, or a term for `docs/GLOSSARY.md` (`feature-new`, `feature-iterate`); a long-range direction (`polaris`) or cutting it into features (`to-features`); an implement spec (`to-implement-spec` writes it, `go-work` carries it out); a visual style (`design-system`, in `docs/design-system/DESIGN.md`); a diff review (`diff-review`), a bug (`code-bugfix`), or a whole-codebase review (`architecture-review`); a personal preference such as reply language or tone (the user's global agent file).

## What belongs in AGENTS.md

A line goes in only when all of these hold:

- **An agent would get it wrong without it.** Leave out what the README, a manifest, or a quick read of the code says.
- **It stays true for months**, unlike current bugs, sprint plans, and TODOs.
- **It is concrete.** A command, a path, a name, a limit, or a prohibition, not "write clean code".
- **No tool already enforces it.** For a rule a formatter, linter, type checker, test, CI check, or hook enforces, write the command ([principles/subtract-before-you-add.md](principles/subtract-before-you-add.md)).
- **It is short.** Put an explanation longer than three lines in `docs/` and link it.

| Part | Holds | Comes from |
| --- | --- | --- |
| Opening line | What this repo is, in one or two sentences, only when the README does not open with that | The repo |
| `### Commands` | Exact commands: setup, check before commit, one test, run, and any other an agent needs (codegen, migrate) | Manifests and CI |
| `### Layout` | Paths whose name does not say their role: generated or vendored code and how to update it, entry points, where a kind of code goes | The tree |
| `### Gotchas` | Facts that surprise: a required service or env var, code that looks dead but is loaded at runtime, a test that needs the network | The user |
| Built-in principles | Fixed text | `references/` |
| `### Project rules` | Do, do-not, and ask-before rules for this repo | The user, and migration |

The user confirms every part drawn from the repo. Not in `AGENTS.md`: goals, features, implement specs, and project terms (they live in `docs/`), change history, plans, secrets, and anything a tool already reports.

## Built-in principles

| Heading in `AGENTS.md` | Text comes from |
| --- | --- |
| `### Project status` | [references/statuses.md](references/statuses.md) |
| `### Docs` | [references/docs.md](references/docs.md) |
| `### Commits` | [references/commits.md](references/commits.md) |
| `### Cleanup` | [references/cleanup.md](references/cleanup.md) |
| `### Architecture` | [references/architecture.md](references/architecture.md) |

Never write the files in `principles/` into `AGENTS.md`.

Copy each reference file below its `#` heading, unchanged, under its `AGENTS.md` heading. For Project status, write the status, its two fields from that row, then the table.

Every full run syncs each built-in principle to its reference:

- Add a missing one, and replace one whose text differs. Keep the project status value unless the user changes it.
- Move a line under a built-in heading that its reference lacks to `### Project rules` once, and tell the user.

`### Project rules` holds rules the user states and rules migration carries over. Never invent one, or rewrite one unless asked.

## Capture

1. **Test it** against [What belongs in AGENTS.md](#what-belongs-in-agentsmd): it must hold for every future task here. "以后都", "这个项目一律", "we never", and "always" are signals. If it may be meant for now only, ask once, with the line you would write: "Make this a project rule: <line>?"
2. **Find its place:** the part of `AGENTS.md` the table above names, or `### Project status` for a change of status.
3. **Check what is there.**
   - Already said, in substance: write nothing, and name the line that covers it.
   - It contradicts a `### Project rules` line: show both and ask which stands.
   - It contradicts a built-in principle: ask whether this repo overrides it. A yes goes under `### Project rules`, naming the principle.
   - It changes the project status: confirm it, then write the status and its two fields from [references/statuses.md](references/statuses.md).
4. **Propose a check.** When a tool could check the rule (a lint rule, a test, a CI check, a hook), propose that check with the line or instead of it ([principles/encode-lessons.md](principles/encode-lessons.md)), naming the tool and its config file. Add it only when the user agrees; then the line is the command that runs it.
5. **Write one line** with the user's meaning in the file's voice.
6. **Show it** with `git diff -- AGENTS.md`, and go back to the interrupted work. Do not commit.

Without `AGENTS.md`, ask whether to run the full setup now, with this rule as its first project rule.

A capture never touches built-in principles, repo facts, or `CLAUDE.md`.

## Full run

### 1. Read

Before asking anything, read:

- Agent instructions: `AGENTS.md`, a regular `CLAUDE.md`, `AGENT.md`, `.cursorrules`, `.cursor/rules/`, `.github/copilot-instructions.md`, and any other agent guidance.
- The opening of `README.md`, and `CONTRIBUTING.md`.
- Manifests and task runners: `package.json` scripts, `Makefile`, `justfile`, `Cargo.toml`, `pyproject.toml`, `go.mod`.
- CI config: the check that gates a merge is the best candidate for the check before commit.
- The top two levels of the tree, generated-file markers, vendored directories, `.env.example`, compose files.
- `git tag`, release config, and migrations: evidence for the project status.

### 2. Draft

Draft every part from that evidence, citing each line's file and line or marking it `ask`. Run the filter in "What belongs in AGENTS.md" on every candidate, existing lines included. Mark an existing line whose evidence is gone (a script no longer in the manifest, a missing path) `stale`, and an existing rule a tool already enforces `enforced`, naming the tool and its config line.

### 3. Ask

Ask only what the repo cannot answer, with your best guess and its evidence.

Ask in this order, skipping any with nothing to ask:

1. **Status.** On a new file: `startup`, `release-solo`, or `release`, with one line on what each allows. On an existing file, ask only when the evidence disagrees with the stored status.
2. **Check before commit.** When manifests and CI name several checks or none: which one an agent runs before each commit, and how to run one test.
3. **Conflicts.** Each migrated rule that contradicts a built-in principle: keep it, take the built-in, or drop it.
4. **Stale lines and loose sections.** Each `stale` line: drop, keep, or correct. Each `enforced` line: drop it (keeping the tool's command under `### Commands`) or keep it. Each other section with commands, layout, or rules, such as `## Development`: fold it into `## Repo` or `## Principles`, or leave it.
5. **Boundaries.** What an agent must never touch, or must ask before doing. Offer what you found: generated or vendored paths, migrations, lockfiles, deploy scripts, production config.
6. **Gotchas.** What a new contributor usually gets wrong here.
7. **Anything else** every agent here should know. Ask once, last.

How to ask:

- At most four questions a round, through the structured question tool when there is one, your guess first. Otherwise a numbered list in chat.
- Run another round only for what the answers raised. Never more than three rounds.
- Filter answers too. For one that fails, say which test and where it belongs, and ask once whether to write it anyway.
- Never ask the user to restate the repo or approve the built-in principles.
- On a re-run with nothing `ask`, `stale`, `enforced`, or in conflict, ask only question 7. Skip this step when the user's message already says what to change.

Until question 3 is answered, a conflicting repo rule goes to `### Project rules`. An unanswered status leaves a new file at `startup`.

### 4. Write

Use the names `AGENTS.md` and `CLAUDE.md`, renaming one in another case before writing. When `AGENTS.md` is missing and `AGENT.md` exists, rename `AGENT.md` to `AGENTS.md`.

**Migrate.** Carry each current rule from the step 1 agent instructions into `AGENTS.md` once: a fact into `## Repo`, a rule into the built-in principle it duplicates or into `### Project rules`. Do not rewrite bodies under `docs/` or migrate product data.

Fold an old-shape `## Project status`, `## Status rules`, or `## Work` into `## Principles` and remove the old heading. Leave every other section as it is unless the user chose to fold it in.

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

Leave out the opening line, a row, a subsection, or the whole `## Repo` when nothing in it passes the filter. Every built-in principle is always present.

Create `docs/feature/` when missing, and add `.scratch/` to `.gitignore` when not ignored yet (`git check-ignore -q .scratch/x || echo '.scratch/' >> .gitignore`).

**Update in place.** Replace text that is no longer true. Do not append how a rule changed, and do not add a second file for the same principle.

### 5. Link

Make `CLAUDE.md` a relative symlink to `AGENTS.md`, replacing a link that points elsewhere. If it is a regular file, move its rules into `AGENTS.md` first, then replace it, and tell the user what moved.

```bash
git mv agents.md AGENTS.md      # case-only rename of a tracked file; untracked: mv through a temporary name
ln -sfn AGENTS.md CLAUDE.md     # relative target, replaces an old link
readlink CLAUDE.md              # prints AGENTS.md
git ls-files -s CLAUDE.md       # mode 120000 once staged: git stores a symlink
```

On Windows without `core.symlinks=true` and symlink permission, `CLAUDE.md` becomes a text file holding `AGENTS.md`: say so, do not claim the link.

### 6. Finish

Show `git diff -- AGENTS.md .gitignore`, or the whole file when it is new. Name each principle added, replaced, or moved to `### Project rules`. List the lines written from evidence no question covered, so the user can strike them. Confirm that `CLAUDE.md` points at `AGENTS.md`.

Do not commit, push, or migrate data. The Commits principle governs the work that follows, not this run.
