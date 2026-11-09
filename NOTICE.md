# Third-party skills

This repository vendors selected Agent Skills from other projects.
Each vendored skill stays under its upstream license. Copies of those
licenses are stored under `third_party/` after `node scripts/cli.mjs sync`.

| Source | License |
| --- | --- |
| [tw93/Waza](https://github.com/tw93/Waza) | MIT |
| [tw93/kami](https://github.com/tw93/kami) | MIT |

Original files in this repository (the catalog, CLI, first-party skills, and docs) are MIT. See `LICENSE`.

`skills/design-idea/` is a first-party adaptation of `convince-me`, `grill-me`, and `steelman` from [rahul-kulkarni105/skills](https://github.com/rahul-kulkarni105/skills), © the upstream authors, [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Those three skills are no longer vendored here. The adaptation runs the three moves in a fixed order as one test of a design idea.

`skills/diff-review/` is a first-party adaptation of `check` from [tw93/Waza](https://github.com/tw93/Waza), Copyright (c) 2026 Tw93, MIT, and of `code-review` from [mattpocock/skills](https://github.com/mattpocock/skills), Copyright (c) 2026 Matt Pocock, MIT. See `skills/diff-review/LICENSE`. Neither name is vendored separately. The review surface is the diff. A fixed-point review adds the two-axis standards and spec pass.

`skills/code-fix/` is a first-party adaptation of `hunt` from [tw93/Waza](https://github.com/tw93/Waza), Copyright (c) 2026 Tw93, MIT, and of `diagnosing-bugs` from [mattpocock/skills](https://github.com/mattpocock/skills), Copyright (c) 2026 Matt Pocock, MIT. See `skills/code-fix/LICENSE`. Neither name is vendored separately. A tight red loop comes before any hypothesis or product change.

`skills/design-ui/` is a first-party adaptation of `ui` from [tw93/Waza](https://github.com/tw93/Waza), Copyright (c) 2026 Tw93, MIT, and of this repo's former `design-style` skill. See `skills/design-ui/LICENSE`. `ui` is no longer vendored. The root `DESIGN.md` follows `references/specification.md` (Stitch / [google-labs-code/design.md](https://github.com/google-labs-code/design.md)). Building UI and writing that file are one skill.

`skills/design-code/` is a first-party adaptation of `codebase-design`, `domain-modeling`, and `improve-codebase-architecture` from [mattpocock/skills](https://github.com/mattpocock/skills), Copyright (c) 2026 Matt Pocock, MIT. See `skills/design-code/LICENSE`. Those three skills are no longer vendored here. The adaptation keeps one vocabulary, one domain-model discipline, and one architecture review.
