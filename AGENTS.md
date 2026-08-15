# Agent notes

`catalog.json` is the source of truth for what this collection contains.

- `skills/` holds every skill in the collection, first-party and vendored, one directory per skill name.
- Remote skills are copied here by `node scripts/cli.mjs sync`. Do not copy upstream trees by hand.
- A skill is first-party when it lives in `skills/` and is **not** in `sources.lock.json`. Sync will not overwrite those directories.
- A skill is vendored when `sources.lock.json` records its source. Edit the upstream list in `catalog.json` and re-run sync; do not patch vendored files in place unless the user is promoting them to first-party (see `skills/catalog/SKILL.md`).
- Skill names must be unique across all sources. On a clash, rename the first-party skill or drop one catalog claim.
- `install` publishes this repo to the global `npx skills` store. It does not delete unrelated skills already on the machine.
