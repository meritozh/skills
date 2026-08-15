---
name: catalog
description: Manage this skills collection. Add or remove an upstream skill in catalog.json, create a first-party skill under skills/, vendor remotes with sync, or check status. Use when the user wants to change the collection, add a skill from another repo, create their own skill here, run /catalog, or asks 加一个 skill / 同步合集 / 这个合集里有什么.
---

# Catalog

This repo is a personal skills collection. `catalog.json` is the only list of what belongs here. Remote skills are copied into `skills/` so they can be read in git. First-party skills are written here and never overwritten by sync.

## Read first

- `catalog.json` — intent: which remotes, which skill names, which agents `install` targets
- `sources.lock.json` — provenance of vendored skills (created by sync)
- `AGENTS.md` — rules for first-party vs vendored
- `NOTICE.md` — upstream licenses

Do not vendor by hand. Do not edit `~/.agents/.skill-lock.json`. Do not delete skills that status marks as extra on the machine; this CLI never prunes the global agent store.

## Commands

Run from the repo root.

```bash
node scripts/cli.mjs status
node scripts/cli.mjs sync --dry-run
node scripts/cli.mjs sync
node scripts/cli.mjs install --dry-run
node scripts/cli.mjs install
```

`update` is an alias of `sync`. After a real `sync`, the vendored trees are git changes; show the diff and stop unless the user asked to commit.

## Add an upstream skill

1. Confirm the source (`owner/repo` or a git URL) and the skill name (`npx skills add <source> --list` if unknown).
2. Add the name to that source's `skills` array in `catalog.json`. Create the source object if it is new.
3. If the name already exists as a first-party directory in `skills/` or is listed under another source, stop and say so. Rename or drop one claim.
4. `node scripts/cli.mjs sync --dry-run`, then `sync`.
5. `node scripts/cli.mjs status` — the new name must be `ok`.

## Remove an upstream skill from the collection

1. Delete the name from `catalog.json`.
2. Run `sync`. The CLI deletes that vendored directory and its lock entry.
3. If the user still wants the files as their own fork, do **not** run sync after only editing the catalog. Instead: remove the name from `sources.lock.json`, remove it from the remote `skills` array, leave `skills/<name>/` in place. It becomes first-party. Then later syncs will refuse to overwrite it.

## Create a first-party skill

1. Name: lowercase, digits, hyphens; 2–64 characters; must match the directory name.
2. Create `skills/<name>/SKILL.md` with `name` and `description` frontmatter. `description` states what it does and when to use it.
3. Put helpers in `scripts/` or `references/` next to `SKILL.md`.
4. Do not pick a name listed under a remote source in `catalog.json`.
5. `source: "."` with `skills: ["*"]` already includes every first-party skill. No catalog edit.
6. `node scripts/cli.mjs status` should list it under First-party.

## Install onto agents

`sync` only updates this git repo. Installing onto Claude / Codex / Cursor / Grok:

```bash
node scripts/cli.mjs install
```

That runs `npx skills add <this-repo> --skill '*' -g`. Grok also reads `~/.agents/skills`, so do not add `-a grok`.

One-line install from a published clone of this repo:

```bash
npx skills add . -g -y
```
