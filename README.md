# skills

Personal Agent Skills collection. Upstream skills are vendored into `skills/` so the files live in this repo. First-party skills are written here. One command installs the whole set.

## Install

From a checkout:

```bash
npx skills add . -g -y
```

Or:

```bash
node scripts/cli.mjs install
```

That installs every skill under `skills/` into the shared `~/.agents/skills` store (Claude Code, Codex, and Cursor get agent-specific links). Grok reads that store already.

## Refresh remotes

Edit `catalog.json`, then:

```bash
node scripts/cli.mjs sync --dry-run
node scripts/cli.mjs sync
node scripts/cli.mjs status
```

`sync` clones each remote, copies the named skill folders into `skills/<name>/`, records commits in `sources.lock.json`, and deletes vendored skills that left the catalog. First-party skills are left alone.

## Add your own skill

Create `skills/<name>/SKILL.md` with `name` and `description` frontmatter. The local source in `catalog.json` is `"."` / `"*"`, so new folders are included automatically. Use `/catalog` in an agent session for the full workflow.

## Layout

```
catalog.json          # which remotes, which names
sources.lock.json     # vendored provenance (written by sync)
skills/<name>/        # the collection, readable in git
scripts/cli.mjs       # sync | status | install
third_party/          # upstream license files
```

`catalog.json` fields: `global` (must be true), `agents` (passed to `npx skills add`), `sources[]` with `source` (`owner/repo`, git URL, or `.`) and `skills` (names, or `*` for local).

Vendored work stays under its upstream license. See `NOTICE.md`.
