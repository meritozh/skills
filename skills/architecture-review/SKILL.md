---
name: architecture-review
description: "Review a codebase's architecture across the whole project, typically after a stretch of iterations, against golden rules of good design: the universal rules the project skill writes into AGENTS.md (no spaghetti control flow, clear one-way layering, deep modules, effects at the edges, and so on), the repo's own Project rules, and the rules of each subsystem's domain (reads apart from writes in data processing, one writer per table in a service, one owner per state in a UI client, a small surface in a library). Judged by reading, not by metrics, then judged again for extensibility (where the next likely changes would land) and explainability (whether the code answers a newcomer's questions). Write a self-contained HTML report outside docs/ with a roadmap of improvements: one refactor goes to to-implement-spec, a direction that needs features of its own goes to polaris. Use for a periodic whole-codebase review. Not for a diff or PR review, and not for root-cause debugging."
disable-model-invocation: true
---

# Architecture review

User-invoked only: follow this skill only when the user ran `/architecture-review`. When the work belongs to another skill, name it (for example `/code-bugfix`), say why, and stop. Do not invoke it yourself.

Review the repositories the user names. This is a taste review: the codebase is read against golden rules of good design and judged by a reader, in the codebase's own names. No rule is a metric and no finding needs a number. A finding needs a rule, a place with file and line, what the code does there now, what the rule would have it look like here, and a direction. After the rules, the review gives its own judgment on two things the rules serve: how the code will take its next changes, and whether a reader can explain it.

The rules come from three places:

- The universal rules in [references/architecture.md](references/architecture.md). This file is shared with the `project` skill and is the same text `project` writes into `AGENTS.md` as `### Architecture`, so a repo that has run `project` has already agreed to them. Where the repo's `AGENTS.md` carries an older version of the text, read it as the version the repo agreed to, and note the difference.
- The domain rules in [references/rules.md](references/rules.md) for each kind of subsystem found. Each domain section ends with *Not a break here*: shapes a universal rule would flag that are correct in that domain.
- The repo's own rules: `### Project rules` in `AGENTS.md`, and any design notes in `docs/`.

When they disagree, the repo's own rule wins, then the domain's *Not a break here*, then the universal rule, and the report says so. A rule from a book that none of the three states is not a rule here. Write it as `taste` at the end of the report, outside the roadmap, and let the user decide whether to adopt it.

This is the whole-codebase review. A diff or PR review is `diff-review`. A bug is `code-bugfix`. Deciding a new feature is `feature-new`, and changing one is `feature-iterate`. Turning a chosen refactor into an implement spec is `to-implement-spec`. A long-range goal is `polaris`. Repo principles are `project`.

This review is read-only. It does not edit the repositories.

## Workflow

1. Pin what you read.
2. Read the claims and map the entry points.
3. Name the domain of each subsystem.
4. Choose where to read closely.
5. Read against the rules.
6. Judge extensibility and explainability.
7. Write findings and the report.

## 1. Pin what you read

For each repo, record the branch, the full commit, and whether the tree was dirty:

```bash
git rev-parse --abbrev-ref HEAD; git rev-parse HEAD; git status --porcelain | wc -l
```

This binds the report to a tree. Uncommitted work was reviewed as it stood; say so.

## 2. Claims and entry points

Read README, `AGENTS.md` or `CLAUDE.md`, `docs/` (skip `docs/spec/archived/`, which records finished plans), and any architecture or design notes. Write each design promise in one line ("plugins never import the core", "handlers only call the service layer"). Many codebases promise nothing in writing. Then infer the claims the structure implies (directory names, layer names, a `core/` beside `features/`) and mark each `written` or `inferred`. A claim is a rule this codebase set for itself; a broken claim ranks above a broken universal rule.

List the real entry points: CLI commands, routes, UI screens, jobs, exported API. Commands that help are in [references/tools.md](references/tools.md).

## 3. Domain

Name the kind of system each subsystem is, from its manifest, its entry points, and its layout. A repo can hold several. The domain decides which rules apply and where complexity is allowed to live, so it decides what counts as a break.

| Domain | Recognize by |
| --- | --- |
| Multi-feature product or plugin host | Several user-facing features over shared machinery; `features/`, `plugins/`, `providers/`, a registry |
| Library or SDK | A published package with exports and no main binary; callers are other code |
| Data processing: pipeline, batch job, or compiler | Stages that read data from one place, transform it, and write it to another: extract, transform, load; parse, lower, emit; a DAG or a scheduler |
| Service with storage | A server entry plus schema, migrations, or queues |
| UI client | A component tree, a state store, routes or screens |
| CLI or tool | A bin entry, an argument parser, subcommands |

A monorepo or multi-repo adds one more: the contracts between packages or repos. A domain not in [references/rules.md](references/rules.md): write its rules in the report's method section, from the repo's own claims and the universal rules, and propose adding them to the file.

## 4. Where to read closely

Read the whole codebase at the level of modules and imports. Read closely, function by function, where a break costs most: the entry paths, the core every feature passes through, the code that changes most, and anything a claim from step 2 names. `git log --since='1 year ago' --format= --name-only | sort | uniq -c | sort -rn | head -20` points at what changes most; it ranks nothing by itself.

Say in the report which modules were read closely and which were skimmed.

## 5. Read against the rules

Load the universal rules in [references/architecture.md](references/architecture.md), then the section of [references/rules.md](references/rules.md) for each domain found. For each subsystem, go rule by rule and decide one of three:

- **Holds.** The rule is how this code is written.
- **Bends.** Exceptions exist, each with a reason the reader can state: one transaction spans two modules; a hot loop inlines a call. Name the reason. A bend with a reason is not a finding.
- **Broken.** Breaking the rule is the norm in this subsystem, or one break sits on a central path.

Judge in the codebase's own names. "Clear layering" is not a layer count; it is whether a reader can name what each layer is for and which way every dependency points. "No spaghetti" is not a nesting limit; it is whether the reader learns what happens before how, and whether each outcome is handled in one place. Each rule states what it asks and the signs of a break, so the judgment is recognizable without being computed. With this many rules, the 规则核对表 in the report lists only the rules that apply to a subsystem; a rule with nothing to say about a subsystem is left out, not marked holds.

What is not a finding:

- A bend with a stated reason.
- A domain's correct shape judged by another domain's rule. Each domain section lists these under *Not a break here*.
- A style you prefer that no rule states. That is `taste`.
- "This module is complex." No rule, no place, no direction.

## 6. Extensibility and explainability

The rules are the vocabulary. This step is the review's own judgment of what they serve, for each subsystem that matters, in the codebase's own names. It is reading and reasoning, not counting.

**Extensibility: where the next changes land.** Name the two or three changes this codebase is most likely to face next: from `docs/polaris/`, from feature docs with `Status: decided`, from open issues, and from the kind of change the recent commits keep making. For each, walk through where it would land today: which modules it edits, whether it must change the core's control flow, what it has to know about other modules to be safe, and which rule breaks stand in its way. Then say what to change first so that this change becomes one module's business. A change that would stay local as the code is today is worth saying too; it tells the user where the structure already pays off.

**Explainability: whether the code answers a reader.** Name the two or three questions a newcomer to this subsystem asks: where is X decided, what happens when Y fails, why does Z exist, which of these two modules do I change. For each, follow the code from its entry point and say whether the structure answers it, through its names, its layering, and what its interfaces say, or whether the answer needs reading implementations across several modules and holding them in mind at once. Then say what would make the code explain itself: a name that states the invariant, a boundary that gathers scattered logic, a module whose interface says what the body does, a comment at the interface where the code cannot.

Each of these produces advice. Advice with a place and a direction is written as a finding under its rule. Advice broader than one place, such as "this subsystem has no seam where the next feature needs one" or "the names in `sync/` describe mechanism, not intent", goes to the report's 扩展性与可解释性 section with the finding ids it rests on. Both carry the same weight in the roadmap as a rule finding.

## 7. Findings, directions, and the roadmap

Each finding takes one direction:

| Direction | When |
| --- | --- |
| Straighten | Control flow hides what happens: flatten the nesting, guard then happy path, one place per outcome |
| Split | One module or function does two jobs: a read and a write, a decision and an effect, two layers |
| Move | Code sits in the wrong layer, or away from the data it changes |
| Merge | Two shallow modules are always used together, or one only passes through to the other |
| Invert | A dependency points outward: the core defines the interface and the detail implements it |
| Pin | A fact has several writers, or an error has several handlers; give it one |
| Delete | A pass-through, an abstraction with one use, or generality nothing composes |
| Leave | The break is in cold code, or fixing it costs more than it saves; say which |

The check is a re-read, not a measurement: the same place, after the change, and the rule holds there in a way the report states in advance.

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

Not a finding: "the nightly job is messy". No rule, no place, no direction, no check.

Order the roadmap by what the next likely change needs (an item that unblocks a change from step 6 ranks first), then by how central the break is (an entry path or the core before a leaf), then by how widespread (the norm in a subsystem before a single spot), then by what must land first. The review names the direction, not the interface. The item the user picks goes to `to-implement-spec` as a refactor. A direction too big for one spec, one that spans many modules and needs features of its own, goes to `polaris` as an architecture goal.

## Report

Write one self-contained HTML file: inline CSS, no external fonts or scripts, so it opens offline. Give each finding an id (`F1`, `F2`, ...) and link to it from the summary and the roadmap. Put long code excerpts in `<details>`.

Match the section structure below. Do not copy a sample report's visual style, and do not copy its findings. Subsection titles name this codebase.

1. **执行摘要**
   - 规则核对表: rules as rows, subsystems as columns; each cell holds, bends, or broken, with the finding id.
   - 扩展性与可解释性一句话: for each subsystem that matters, one line on how it takes its next change and one on whether a reader can explain it.
   - 最优先事项: the first findings, each with its rule, direction, and check.
2. **项目全景**
   - 产品目标与当前能力.
   - 子系统与所属领域: each subsystem's domain and the evidence for it.
   - 声明的分层与实际依赖: written and inferred claims beside the dependencies actually found.
   - 代码规模与精读范围: what was read closely and what was skimmed.
3. **规则逐条核对.** One part per rule that applies: where it holds, where it bends and why, where it is broken, with file and line.
4. **扩展性与可解释性**
   - 下一步改动会落在哪: each likely change from step 6, where it lands today, what stands in its way, and what to change first.
   - 代码能否自己解释: each reader's question from step 6, how the code answers it today, and what would make it answer by itself.
5. **子系统详评.** One part per subsystem: its domain, the rules that matter most to it, the judgment, and its findings.
6. **改进路线图.** Each item with its finding ids, rule, direction, and check, in roadmap order.
7. **未采纳的 taste.** Styles the reviewer would prefer that no rule states, for the user to adopt or ignore.
8. **方法与证据.** The commit from step 1, the rules used and where each came from (including whether the repo's `AGENTS.md` carries the universal rules), and the claims list.

Skip a subsection only when it does not apply, and say why.

Save it outside the repository's `docs/`. Default path: `$TMPDIR`, else `/tmp`, else `%TEMP%` on Windows, file `<date>-<repo>-architecture-review.html`. If the user names a path, that path is not under `docs/`. Do not add the file to the repo. Open it (`open` on macOS, `xdg-open` on Linux, `start` on Windows) and give the absolute path.
