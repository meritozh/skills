---
name: catalog
description: Manage this skills collection. Create, rename, or remove a skill under skills/, adapt a skill from another repo, change install groups, share a file between skills, regenerate the README and configs with sync, check status, or install. Use when the user wants to change the collection, run /catalog, or asks 加一个 skill / 删掉一个 skill / 这个合集里有什么.
metadata:
  internal: true
---

# Catalog

Repo-local meta skill for maintaining this collection. It lives in `.agents/skills/catalog` so agents working in this repo can invoke it, and `npx skills add` will not ship it with the public set.

Every directory in `skills/` with a `SKILL.md` is a published skill, maintained here. Nothing is synced from other repos.

## Read first

- `catalog.json`: install agents, `groupings`, and `shared` files
- `AGENTS.md`: the repo's rules
- `NOTICE.md`: where adapted skills came from and under which license

Do not edit `~/.agents/.skill-lock.json`. Do not delete skills already installed on the machine; this CLI never prunes the global agent store.

## Commands

Run from the repo root.

```bash
node scripts/cli.mjs status
node scripts/cli.mjs sync --dry-run
node scripts/cli.mjs sync              # shared files, README index, group configs
node scripts/cli.mjs install --dry-run
node scripts/cli.mjs install
node --test scripts/cli.test.mjs
```

`sync` only changes this git repo. Show the diff and stop unless the user asked to commit.

## Create a skill

1. Name: lowercase, digits, hyphens; 2–64 characters; must match the directory name and be unused in `skills/`.
2. Create `skills/<name>/SKILL.md` with `name` and `description` frontmatter. `description` states what it does and when to use it, and is quoted when it contains `: ` or ` #`.
3. Put helpers in `scripts/`, `references/`, or `agents/` next to `SKILL.md`.
4. Add the name to a group in `catalog.json` `groupings`. A skill another skill invokes goes in the same group, so installing one group brings both.
5. `node scripts/cli.mjs sync`, then `status`: the skill must be `ok`.

## Adapt a skill from another repo

1. Read the upstream skill and its license. Do not copy the upstream tree in; write this repo's version under `skills/<name>/`.
2. Put the upstream license, with its copyright lines and a line saying what was adapted, in `skills/<name>/LICENSE`.
3. Add a paragraph to `NOTICE.md`: the source, copyright, license, and what changed.
4. Continue with "Create a skill" from step 4.

## Remove a skill

1. Delete `skills/<name>/`.
2. Remove the name from `groupings` and from every `shared` entry in `catalog.json`.
3. Grep the other skills for the name (`` `<name>` ``, `/<name>`) and fix each mention.
4. Drop its paragraph from `NOTICE.md` if it had one.
5. `sync`, then `status`.

## Share a file between skills

Each skill installs on its own, so a skill never points into another skill's directory. A file several skills need is copied into each.

1. Put the one source at `shared/<path>`, where `<path>` is where it sits inside each skill (`references/glossary.md`).
2. Add `{ "path": "<path>", "skills": [...] }` to `shared` in `catalog.json`.
3. `node scripts/cli.mjs sync`, then `status`: every copy must be `ok`.

To change the file, edit `shared/<path>` and run `sync`. A copy edited in place shows as `differs`, `install` refuses, and the next sync overwrites it.

## Install onto agents

```bash
node scripts/cli.mjs install
```

That runs `npx skills add <this-repo> --skill '*' -g` for the agents in `catalog.json`. Grok also reads `~/.agents/skills`, so do not add `-a grok`.

One-line install from a published clone of this repo:

```bash
npx skills add . -g -y
```
