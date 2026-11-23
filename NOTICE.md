# Third-party skills

This repository vendors selected Agent Skills from other projects.
Each vendored skill stays under its upstream license. Copies of those
licenses are stored under `third_party/` after `node scripts/cli.mjs sync`.

| Source | License |
| --- | --- |
| [tw93/Waza](https://github.com/tw93/Waza) | MIT |
| [tw93/kami](https://github.com/tw93/kami) | MIT |

Original files in this repository (the catalog, CLI, first-party skills, and docs) are MIT. See `LICENSE`.

`skills/feature-new/` and `skills/feature-iterate/` are first-party adaptations of `convince-me`, `grill-me`, and `steelman` from [rahul-kulkarni105/skills](https://github.com/rahul-kulkarni105/skills), © the upstream authors, [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Those three skills are no longer vendored here. Each runs the three moves in a fixed order: `feature-new` as one test of a new feature, `feature-iterate` as one test of a change to an existing feature. `skills/polaris/` applies the same three moves to a long-range goal and its route.

`references/glossary.md` in `skills/feature-new/`, `skills/feature-iterate/`, `skills/polaris/`, `skills/to-features/`, `skills/to-implement-spec/`, and `skills/batman/` is copied from `shared/references/glossary.md`, which adapts the glossary format of `domain-modeling` from [mattpocock/skills](https://github.com/mattpocock/skills), Copyright (c) 2026 Matt Pocock, MIT. See each skill's `LICENSE`, copied from `shared/LICENSE` where the glossary is the only adapted file.

`skills/diff-review/` is a first-party adaptation of `check` from [tw93/Waza](https://github.com/tw93/Waza), Copyright (c) 2026 Tw93, MIT, and of `code-review` from [mattpocock/skills](https://github.com/mattpocock/skills), Copyright (c) 2026 Matt Pocock, MIT. See `skills/diff-review/LICENSE`. Neither name is vendored separately. The review surface is the diff. A fixed-point review adds the two-axis standards and spec pass.

`skills/code-bugfix/` is a first-party adaptation of `hunt` from [tw93/Waza](https://github.com/tw93/Waza), Copyright (c) 2026 Tw93, MIT, and of `diagnosing-bugs` from [mattpocock/skills](https://github.com/mattpocock/skills), Copyright (c) 2026 Matt Pocock, MIT. See `skills/code-bugfix/LICENSE`. Neither name is vendored separately. A tight red loop comes before any hypothesis or product change.

`skills/design-system/` is a first-party adaptation of `ui` from [tw93/Waza](https://github.com/tw93/Waza), Copyright (c) 2026 Tw93, MIT, and of this repo's former `design-style` skill. See `skills/design-system/LICENSE`. `ui` is no longer vendored. The skill writes a project's design system to `docs/design-system/DESIGN.md` in the [google-labs-code/design.md](https://github.com/google-labs-code/design.md) format. Its `references/specification.md` is that project's `docs/spec.md`, Copyright 2026 Google LLC, Apache License 2.0, copied unmodified; see `skills/design-system/LICENSE-APACHE`.

`skills/to-implement-spec/` is a first-party adaptation of `codebase-design`, `domain-modeling`, and `improve-codebase-architecture` from [mattpocock/skills](https://github.com/mattpocock/skills), Copyright (c) 2026 Matt Pocock, MIT. See `skills/to-implement-spec/LICENSE`. Those three skills are no longer vendored here. The adaptation keeps one vocabulary, one domain-model discipline, and one architecture review.
