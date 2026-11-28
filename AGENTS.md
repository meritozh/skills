# Agent notes

`skills/` is the collection: every directory in it with a `SKILL.md` is a published skill, written and maintained in this repo. Nothing is copied in from other repos.

- A skill's `name` frontmatter matches its directory name. `status` flags a mismatch and `install` refuses.
- Repo-local meta skills live in `.agents/skills/` (the Agent Skills project directory). They are not part of the published collection.
- `catalog.json` holds the install agents, the `groupings`, and the `shared` files. `groupings` is the source of truth for install/display groups; `sync` writes `.claude-plugin/marketplace.json`, `skills.sh.json`, and the README skills index from it. Do not edit those by hand.
- A file several skills carry lives once in `shared/<path>`; `catalog.json` `shared` lists the skills that get a copy at `skills/<skill>/<path>`. Edit the file in `shared/`, then run `node scripts/cli.mjs sync`. Never edit a copy: `status` shows it as `differs`, `install` refuses, and the next sync overwrites it.
- `shared/principles/` holds short working principles, and `shared/references/worker.md` holds the rules for every agent a skill starts. A skill links a principle at the step where it changes a decision, never as a list, and every agent brief starts with the worker line. Add a skill to a principle's `shared` entry only when the skill links it.
- `status` also lints each skill: the description is at most 1024 characters and quoted when it holds `: `, every relative link resolves, and every `/name`, `$name`, or "`name` skill" mention names a skill in `skills/` (other names go in `catalog.json` `notSkills`).
- A skill adapted from another project keeps that project's license in its own `LICENSE` and gets a paragraph in `NOTICE.md`.
- `install` publishes this repo to the global `npx skills` store. It does not delete unrelated skills already on the machine.
- Tests: `node --test scripts/cli.test.mjs`.
