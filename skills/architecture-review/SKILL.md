---
name: architecture-review
description: "Review a codebase's architecture across the whole project, typically after a stretch of iterations, against golden rules of good design: the universal rules the project skill writes into AGENTS.md (no spaghetti control flow, clear one-way layering, deep modules, effects at the edges), the repo's own Project rules, and each subsystem's domain rules (reads apart from writes in data processing, one writer per table in a service, one owner per state in a UI client, a small surface in a library). Judged by reading, not by metrics, then for extensibility (where the next likely changes land) and explainability (whether the code answers a newcomer's questions). Writes a self-contained HTML report outside docs/ with ranked directions: one refactor goes to to-implement-spec, a direction that needs features of its own goes to polaris. Use for a periodic whole-codebase review. Not for a diff or PR review, and not for root-cause debugging."
disable-model-invocation: true
---

# Architecture review

User-invoked only: follow this skill only when the user ran `/architecture-review`; never invoke it yourself. Work that belongs to another skill: name it (`/code-bugfix`), say why, and stop.

Review the repositories the user names, read-only, against golden rules of good design, judged in the codebase's own names. No rule is a metric and no finding needs a number. A number the report shows follows [principles/explain-the-number.md](principles/explain-the-number.md) and points at where to read, never at a verdict. A finding needs a rule, a place with file and line, what the code does there now, what the rule would have it look like here, and a direction.

The rules come from three places:

- The universal rules in [references/architecture.md](references/architecture.md), which `project` writes into `AGENTS.md` as `### Architecture`. An older version in the repo's `AGENTS.md` is the version the repo agreed to; note the difference.
- The domain rules in [references/rules.md](references/rules.md) for each kind of subsystem found, each ending with *Not a break here*.
- The repo's own rules: `### Project rules` in `AGENTS.md`, and any design notes in `docs/`.

When they disagree, the repo's own rule wins, then the domain's *Not a break here*, then the universal rule, and the report says so. A rule none of the three states is `taste`, written at the end of the report, outside the ranked list.

A diff or PR review is `diff-review`. A bug is `code-bugfix`. A new feature is `feature-new`, changing one `feature-iterate`. A chosen refactor's spec is `to-implement-spec`. A long-range goal is `polaris`. Repo principles are `project`.

## 1. Pin what you read

Record each repo's branch, full commit, and whether the tree was dirty:

```bash
git rev-parse --abbrev-ref HEAD; git rev-parse HEAD; git status --porcelain | wc -l
```

Say that uncommitted work was reviewed as it stood.

Run files (agent reports, tool output, notes) go in `.scratch/architecture-review/<slug>/` of the repo you run from, as [references/scratch.md](references/scratch.md) says, when `git check-ignore -q .scratch/x` shows it ignored. Otherwise put them in `${TMPDIR:-/tmp}/<date>-<repo>-architecture-review/`: the review changes nothing in the repo, `.gitignore` included. Below, `<run>` is that directory. A pointer from [references/tools.md](references/tools.md) whose output runs long, such as an import graph or `cargo tree`, writes to `<run>/<name>.log`; `rg` the log for what you need.

## 2. Claims and entry points

Read README, `AGENTS.md` or `CLAUDE.md`, `docs/` (skip `docs/spec/archived/`), and any architecture or design notes. Write each design promise in one line ("plugins never import the core"), marked `written` with its file and line. Then infer the claims the structure implies (directory names, layer names, a `core/` beside `features/`), marked `inferred` with the paths it follows from ([principles/show-the-evidence.md](principles/show-the-evidence.md)). A broken claim ranks above a broken universal rule.

List the real entry points: CLI commands, routes, UI screens, jobs, exported API ([references/tools.md](references/tools.md)).

## 3. Domain

Name the kind of system each subsystem is, from its manifest, entry points, and layout. A repo can hold several.

| Domain | Recognize by |
| --- | --- |
| Multi-feature product or plugin host | Several user-facing features over shared machinery; `features/`, `plugins/`, `providers/`, a registry |
| Library or SDK | A published package with exports and no main binary; callers are other code |
| Data processing: pipeline, batch job, or compiler | Stages that read, transform, and write data: extract, transform, load; parse, lower, emit; a DAG or a scheduler |
| Service with storage | A server entry plus schema, migrations, or queues |
| UI client | A component tree, a state store, routes or screens |
| CLI or tool | A bin entry, an argument parser, subcommands |

A monorepo or multi-repo adds the contracts between packages or repos. A domain not in [references/rules.md](references/rules.md): write its rules in the report's method section, from the repo's claims and the universal rules, and propose adding them to the file.

## 4. Where to read closely

Read the whole codebase at module and import level. Read function by function where a break costs most: the entry paths, the core every feature passes through, the code that changes most ([references/tools.md](references/tools.md)), and anything a claim from step 2 names. Say in the report which modules were read closely and which were skimmed.

With subagents, send the wide reading to them ([principles/guard-the-context.md](principles/guard-the-context.md)): one per subsystem or package, on the facts row of [references/models.md](references/models.md), whose brief starts with `Read <absolute path of this skill's directory>/references/worker.md before anything else.`, names its paths and a report file `<run>/<subsystem>.md` for its modules, imports, and entry points, and asks for a reply of the places worth reading closely, each with file and line, and the path. Open a report when a finding rests on it. The judgment in steps 5 and 6 stays in the main thread.

## 5. Read against the rules

For each subsystem, go through the universal rules and its domain's section, rule by rule, and decide one of three:

- **Holds.** The rule is how this code is written.
- **Bends.** Exceptions exist, each with a reason the reader can state (one transaction spans two modules). Name the reason.
- **Broken.** Breaking it is the norm in this subsystem, or one break sits on a central path.

"Clear layering" is not a layer count; it is whether a reader can name what each layer is for and which way every dependency points. The 规则核对表 lists only the rules that apply to a subsystem; a rule with nothing to say is left out, not marked holds.

What is not a finding:

- A bend with a stated reason.
- A shape listed under the domain's *Not a break here*.
- A style no rule states. That is `taste`.
- "This module is complex": no rule, place, or direction.

## 6. Extensibility and explainability

For each subsystem that matters:

**Extensibility: where the next changes land.** Name the two or three changes it is most likely to face next: from `docs/polaris/`, feature docs with `Status: decided`, open issues, and the kind of change recent commits keep making. For each, say where it would land today: which modules it edits, whether it changes the core's control flow, what it must know about other modules, and which rule breaks stand in its way. Say what to change first so it becomes one module's business. Name one change that would stay local today.

**Explainability: whether the code answers a reader.** Name the two or three questions a newcomer asks: where is X decided, what happens when Y fails, which of these two modules do I change. Follow each from its entry point and say whether its names, layering, and interfaces answer it, or the answer needs reading implementations across modules. Then say what would make the code explain itself: a name that states the invariant, a boundary that gathers scattered logic, a comment at the interface where the code cannot.

Advice with a place and a direction is a finding under its rule. Broader advice ("the names in `sync/` describe mechanism, not intent") goes to the 扩展性与可解释性 section with the finding ids it rests on. Both rank alongside rule findings.

## 7. Findings, directions, and their ranking

Each finding takes one direction. When more than one fits, Delete first, then Merge, then the rest ([principles/subtract-before-you-add.md](principles/subtract-before-you-add.md)).

| Direction | When |
| --- | --- |
| Delete | A pass-through, an abstraction with one use, or generality nothing composes |
| Straighten | Control flow hides what happens: flatten the nesting, guard then happy path, one place per outcome |
| Split | One module or function does two jobs: a read and a write, a decision and an effect, two layers |
| Move | Code sits in the wrong layer, or away from the data it changes |
| Merge | Two shallow modules are always used together, or one only passes through to the other |
| Invert | A dependency points outward: the core defines the interface and the detail implements it |
| Pin | A fact has several writers, or an error has several handlers; give it one |
| Leave | The break is in cold code, or fixing it costs more than it saves; say which |

A direction that replaces an interface follows [principles/migrate-then-delete.md](principles/migrate-then-delete.md).

The check is a re-read, not a measurement: the same place, after the change, and the rule holds there in a way the report states in advance.

A rule broken in many places, or again after a fix, also gets `Encode: <check>` on the finding: a lint, test, or CI check such as an import-linter contract or `madge --circular` ([principles/encode-lessons.md](principles/encode-lessons.md)).

```
F2  The nightly load reads and writes orders in one pass
Rule:       Reads apart from writes (data processing); one owner per piece of state (AGENTS.md)
Where:      jobs/nightly/load_orders.py:40-180
Now:        the scan that reads orders stamps last_seen on each row as it goes;
            the loader queries orders_daily to choose insert or update
Here:       the scan yields rows and changes nothing; the transform is pure;
            the load writes orders_daily idempotently and is the only job that does
Direction:  split, pin
Check:      re-read jobs/nightly: the read stage has no write; orders_daily has one writer
```

Rank the directions by what the next likely change needs (an item that unblocks a change from step 6 first), then by how central the break is (entry path or core before a leaf), then how widespread, then what must land first. The ranking is an order, not a plan: no dates, owners, estimates, or phases. The review names the direction, not the interface. The item the user picks goes to `to-implement-spec` as a refactor. A direction that needs features of its own goes to `polaris` as an architecture goal.

## Report

Write one self-contained HTML file: inline CSS, no external fonts or scripts. Give each finding an id (`F1`, `F2`, ...), linked from the summary and the ranked list. Long code excerpts go in `<details>`.

Match the section structure below. Subsection titles name this codebase.

1. **执行摘要**
   - 规则核对表: rules as rows, subsystems as columns; each cell holds, bends, or broken, with the finding id.
   - 扩展性与可解释性一句话: for each subsystem that matters, one line on how it takes its next change and one on whether a reader can explain it.
   - 最优先事项: the first findings, each with its rule, direction, and check.
2. **项目全景**
   - 产品目标与当前能力.
   - 子系统与所属领域: each subsystem's domain and the evidence for it.
   - 声明的分层与实际依赖: written and inferred claims beside the dependencies actually found.
   - 代码规模与精读范围: what was read closely and what skimmed, and any size or change count with what it counts.
3. **规则逐条核对.** One part per rule that applies: where it holds, where it bends and why, where it is broken, with file and line.
4. **扩展性与可解释性**
   - 下一步改动会落在哪: each likely change from step 6, where it lands today, what stands in its way, and what to change first.
   - 代码能否自己解释: each reader's question from step 6, how the code answers it today, and what would make it answer by itself.
5. **子系统详评.** One part per subsystem: its domain, the rules that matter most to it, the judgment, and its findings.
6. **改进方向排序.** Each item with its finding ids, rule, direction, check, and any `Encode:` proposal, in rank order.
7. **未采纳的 taste.** Styles the reviewer would prefer that no rule states, for the user to adopt or ignore.
8. **方法与证据.** The commit from step 1, the rules used and where each came from (including whether the repo's `AGENTS.md` carries the universal rules), and the claims list.

Skip a subsection only when it does not apply, and say why.

Save it outside the repo: `$TMPDIR`, else `/tmp`, else `%TEMP%` on Windows, file `<date>-<repo>-architecture-review.html`, or a path the user names that is not under `docs/`. Do not add it to the repo. Open it (`open` on macOS, `xdg-open` on Linux, `start` on Windows) and give the absolute path. Then delete `<run>`, unless the user asks to keep it.
