# Notices

Every skill in this repository is maintained here. Some adapt work from other projects; each of those keeps the upstream license in its own directory, as listed below.

Original files in this repository (the catalog, CLI, skills, and docs) are MIT. See `LICENSE`.

`skills/polaris/`, `skills/feature-new/`, and `skills/feature-iterate/` descend from `convince-me` and `steelman` in [rahul-kulkarni105/skills](https://github.com/rahul-kulkarni105/skills), © the upstream authors, [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). What remains of them is the comparison of two or three options, and the record of the rejected one with the condition under which it wins. The cross-examination, steelman, and grill moves were removed: `batman` attacks the written doc instead.

`references/glossary.md` in `skills/feature-new/`, `skills/feature-iterate/`, `skills/polaris/`, `skills/to-features/`, `skills/to-implement-spec/`, and `skills/batman/` is copied from `shared/references/glossary.md`, which adapts the glossary format of `domain-modeling` from [mattpocock/skills](https://github.com/mattpocock/skills), Copyright (c) 2026 Matt Pocock, MIT. See each skill's `LICENSE`, copied from `shared/LICENSE` where the glossary is the only adapted file.

`skills/diff-review/` is an adaptation of `check` from [tw93/Waza](https://github.com/tw93/Waza), Copyright (c) 2026 Tw93, MIT, and of `code-review` from [mattpocock/skills](https://github.com/mattpocock/skills), Copyright (c) 2026 Matt Pocock, MIT. See `skills/diff-review/LICENSE`. The review surface is the diff. A fixed-point review adds the two-axis standards and spec pass.

`skills/code-bugfix/` is an adaptation of `hunt` from [tw93/Waza](https://github.com/tw93/Waza), Copyright (c) 2026 Tw93, MIT, and of `diagnosing-bugs` from [mattpocock/skills](https://github.com/mattpocock/skills), Copyright (c) 2026 Matt Pocock, MIT. See `skills/code-bugfix/LICENSE`. A tight red loop comes before any hypothesis or product change.

`skills/ui-design/` is an adaptation of [oil-oil/oil-ui](https://github.com/oil-oil/oil-ui), Copyright (c) 2026 oil-oil, MIT. See `skills/ui-design/LICENSE`. The adaptation moves working files to `.scratch/ui-design/` and finished design docs to `docs/design/`, drops the update check and the hand-off to oil-ui-pro, and routes user questions and prose through this collection's skills. `assets/fonts/instrument-serif/` is Instrument Serif under the SIL Open Font License; see its `OFL.txt`. `assets/vendor/alpine.min.js` is Alpine.js, MIT.

`skills/to-implement-spec/` is an adaptation of `codebase-design`, `domain-modeling`, and `improve-codebase-architecture` from [mattpocock/skills](https://github.com/mattpocock/skills), Copyright (c) 2026 Matt Pocock, MIT. See `skills/to-implement-spec/LICENSE`. The adaptation keeps one vocabulary, one domain-model discipline, and one architecture review.

`skills/architect/` and `skills/arena/` are adaptations of `architect` and `arena` from pstack in [cursor/plugins](https://github.com/cursor/plugins), Copyright (c) 2026 Lauren Tan, MIT, with the pstack principle skills they name (laziness-protocol, redesign-from-first-principles, prove-it-works, separate-before-serializing-shared-state) folded into the text. See each skill's `LICENSE`. The Cursor model list and runner slugs are replaced by whatever subagents and models the harness offers.

`skills/show-me/` is an adaptation of `show-me` from [humanlayer/skills](https://github.com/humanlayer/skills), Copyright (c) 2026 HumanLayer, MIT. See `skills/show-me/LICENSE`. It adds a published-Markdown destination so other skills can invoke it.

`skills/prototype/` is an adaptation of `prototype` from [mattpocock/skills](https://github.com/mattpocock/skills), Copyright (c) 2026 Matt Pocock, MIT. See `skills/prototype/LICENSE`. `LOGIC.md` and `UI.md` became `references/logic.md` and `references/ui.md`.

`skills/pr/` is an adaptation of `pr` from [mattpocock/skills](https://github.com/mattpocock/skills), Copyright (c) 2026 Matt Pocock, MIT, which credits `show-me` by Dex Horthy of HumanLayer. See `skills/pr/LICENSE`. The upstream copy of the show-me catalog is gone: the Summary visual comes from invoking this repo's `show-me` skill.

`shared/principles/`, copied into the skills that `catalog.json` lists under `shared` as `principles/<name>.md` with `principles/LICENSE`, adapts the `principle-*` skills and the reply, delegation, and skill-authoring rules of `poteto-mode` from [backnotprop/pstack](https://github.com/backnotprop/pstack), Copyright (c) 2026 Lauren Tan, MIT. `shared/references/worker.md` adapts its `worker.md`. The code-shape principles were left out, because `references/architecture.md` already holds them. Laziness Protocol merged into subtract-before-you-add, Exhaust the Design Space became compare-real-options, and show-the-evidence is new.

`skills/technical-writing/` and `skills/unslop/` are adaptations of `technical-writing` and `unslop` from [backnotprop/pstack](https://github.com/backnotprop/pstack), Copyright (c) 2026 Lauren Tan, MIT. See each skill's `LICENSE`. `technical-writing` adds the table of this collection's docs and their modes, the rules that keep them from reading as records or roadmaps, and the anchors other skills read. `unslop` is renumbered without gaps and adds Chinese patterns.
