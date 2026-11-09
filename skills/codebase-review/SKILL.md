---
name: codebase-review
description: "Review any codebase by what its real changes cost and what its failures leave behind, measured against its own shape, history, and claims. Write a self-contained HTML report outside docs/. Use for a whole-codebase review. Not for a diff or PR review, and not for root-cause debugging."
disable-model-invocation: true
---

# Codebase review

User-invoked only: follow this skill only when the user ran `/codebase-review`. When the work belongs to another skill, name it (for example `/code-fix`), say why, and stop. Do not invoke it yourself.

Review the repositories the user names. The subject is any codebase. Judge it with its own evidence, not against an imported ideal (clean architecture, microservices, DDD, plugins). Two questions decide every judgment:

- **Change cost.** Do the changes this codebase actually makes stay local?
- **Failure residue.** When a step fails, what does the caller see, what state remains, and is a retry safe?

A finding needs a file and line, a trigger, a direction, and a check that would show the fix worked.

This is the whole-codebase review. A diff or PR review is `diff-review`. A bug is `code-fix`. Discussing an idea is `design-idea`. Designing one confirmed module is `design-code`. Repo principles are `project`.

This review is read-only. It does not edit the repositories, and its probes never touch user data or production services.

## Workflow

1. Pin the baseline for each repo.
2. Read the claims and map the entry points.
3. Identify the shape of each subsystem.
4. Find the two or three dominant forces.
5. Run the four lenses, then the checks for each shape.
6. Probe what reading cannot settle.
7. Score, write findings with a direction, and write the report.

## 1. Pin the baseline

Before any judgment, record for each repo the branch, the full commit, and the dirty and untracked counts, then a source fingerprint:

```bash
git rev-parse --abbrev-ref HEAD; git rev-parse HEAD
git status --porcelain | grep -vc '^??'    # dirty
git status --porcelain | grep -c '^??'     # untracked
git ls-files -z -co --exclude-standard | LC_ALL=C sort -zu \
  | xargs -0 shasum -a 256 2>/dev/null \
  | perl -pe 's/^([0-9a-f]{64})  (.*)$/$2\t$1/' > "$TMPDIR/<repo>-fingerprint.tsv"
shasum -a 256 < "$TMPDIR/<repo>-fingerprint.tsv"
```

The list is tracked plus unignored untracked files, sorted by path, one `path<TAB>sha256` line each; the last hash is the fingerprint. It binds the input you read. It is not a reproducible build. Say what a commit hash cannot rebuild: an ignored lockfile, a path dependency, or uncommitted work.

## 2. Claims and entry points

Read README, `AGENTS.md` or `CLAUDE.md`, `docs/`, and any architecture or design notes. Write each design promise in one line ("plugins never import the core", "one sync engine serves every provider"). Many codebases promise nothing in writing. Then infer the claims the structure implies (directory names, layer names, a `core/` beside `features/`) and mark each claim `written` or `inferred`.

List the real entry points: CLI commands, routes, UI screens, jobs, exported API. Size and entry-point commands are in [references/tools.md](references/tools.md).

Keep four kinds of evidence apart: a package dependency, a name in source, a production call path, and a command you ran are not interchangeable. Do not claim a line-by-line proof of every file, platform, or schedule.

## 3. Shape

Classify each subsystem by evidence: its manifest, its entry points, and its layout. A repo can hold several shapes. The shape decides where complexity belongs, so it decides what counts as a defect.

| Shape | Recognize by | Complexity belongs |
| --- | --- | --- |
| Multi-feature product or plugin host | Several user-facing features over shared machinery; `features/`, `plugins/`, `providers/`, a registry | In shared mechanisms; features only compose them |
| Library or SDK | A published package with exports and no main binary; callers are other code | Behind a small, deep public surface |
| Compiler, pipeline, or batch job | Stages that transform data: parse, lower, emit; extract, transform, load; a DAG | In the stages, with the intermediate representation as the contract between them |
| Service with storage | A server entry plus schema, migrations, or queues | At the authoritative write points and transaction boundaries |
| UI client | A component tree, a state store, routes or screens | In one owner per piece of state |
| CLI or tool | A bin entry, an argument parser, subcommands | In the command contract, with side effects isolated |

A monorepo or a multi-repo review adds one layer: the contracts between packages or repos, who owns each schema, and how it is versioned.

For each shape found, load its section of [references/shapes.md](references/shapes.md). Each section lists the shape's checks and the false findings to avoid for that shape.

## 4. Dominant forces

Pick the two or three forces that matter most to this product, each with evidence:

- **Where change happens**: files and modules by commit count.
- **Where failure costs most**: files touched by fix commits, and paths that handle money, user data, permissions, or user files.
- **Who extends it**: the team only, or third parties through a public API or plugins.
- **Who works in parallel**: owners in `CODEOWNERS`, or teams per package.

```bash
git log --since='1 year ago' --no-merges --format= --name-only | grep -v '^$' \
  | sort | uniq -c | sort -rn | head -20                                    # change hotspots
git log --since='1 year ago' --no-merges -i -E --grep='fix|bug|regress|hotfix' --format= --name-only \
  | grep -v '^$' | sort | uniq -c | sort -rn | head -20                     # fix concentration
```

The forces weight everything after this step: which subsystems get a deep read, which scores lead the summary, and which findings lead the roadmap. A poorly structured area that nobody changes and that rarely fails ranks low.

With a thin history (under about 50 commits, or one squashed import), say so. Lean on the written claims and the roadmap instead.

## 5. The four lenses

Run all four on every subsystem the forces make matter. Each lens has its evidence. A lens that does not apply to a subsystem is skipped with one line saying why.

### Lens 1: Change locality

**Replay real changes.** Take the most recent 5 to 10 feature or fix commits in the hot subsystems, skipping merges, formatting, and dependency bumps. Do not hand-pick them; write the selection rule in the report. Add one or two changes from the roadmap or open issues. For each, record the modules touched (`git show --stat <sha>`) and whether the core's control flow had to change.

**Measure co-change.** Count pairs of modules that change in the same commit. Set `depth` so a module is the unit this codebase names (a package, a crate, a top-level directory under `src/`):

```bash
git log --since='1 year ago' --no-merges --format='format:@@%n' --name-only \
| awk -F/ -v depth=2 -v maxmods=8 '
  function flush(  a,b,n){ n=0; for(a in seen) n++
    if(n>1 && n<=maxmods) for(a in seen) for(b in seen) if(a<b) pair[a"  <->  "b]++
    for(a in seen) delete seen[a] }
  /^@@$/ { flush(); next }
  NF     { m=$1; for(i=2;i<=depth && i<NF;i++) m=m"/"$i; seen[m]=1 }
  END    { flush(); for(p in pair) print pair[p] "\t" p }' | sort -rn | head -20
```

`maxmods` drops sweeping commits (mass renames, formatting) that would couple everything. Separate expected coupling (one generator writes both, one transaction spans both, a test and its subject, a schema and its migration) from unexpected coupling. Only unexpected coupling is a finding: it means a boundary sits in the wrong place.

**Judge duplication by co-change, not by shape.** Find candidates with a clone detector ([references/tools.md](references/tools.md)), then check whether the copies change together:

```bash
comm -12 <(git log --format=%H -- <copyA> | sort) <(git log --format=%H -- <copyB> | sort) | wc -l
```

Copies that change together are a finding (merge them). Copies that evolve apart stay; merging them would create the wrong abstraction.

### Lens 2: Dependency direction

Build the import graph between modules ([references/tools.md](references/tools.md)). Findings:

- A cycle between modules.
- Policy depending on detail: the core imports UI, a framework, or a concrete storage or network client.
- **A shared module that knows its callers.** It imports from a caller, or branches on a caller's name, type, or config key. This holds for every shape:

  ```bash
  rg -n -w -e '<callerA>' -e '<callerB>' <shared-dir> | cut -d: -f1 | sort | uniq -c | sort -rn
  ```

- A contract spread wide. Count the production files that touch it, by directory:

  ```bash
  rg -l '<ContractType>' --glob '!**/{test,tests,__tests__,spec}/**' --glob '!**/*.{test,spec}.*' . \
    | xargs -n1 dirname | sort | uniq -c | sort -rn
  ```

Name each dependency that runs both ways and the atomicity it buys. Some two-way dependencies are the price of one transaction; say so instead of flagging them.

### Lens 3: Facts and failure

List the facts this product must not get wrong: balances, documents, settings, job state, anything users would lose. For each fact, find every writer by searching for the persistence call with that fact's table, key, or path. One fact with several writers is a finding.

For each main path from step 2, walk it one step at a time: if this step fails, what does the caller see, what state remains, and is a retry safe? Look for transactions, idempotency keys, temp-then-rename for files, and compensation steps. A path whose failure leaves inconsistent state is a finding whatever the structure looks like.

Keep one state machine when the steps share hidden state. Moving code while that state stays behind is not a split, and splitting one commit into independent writers adds crash points.

### Lens 4: Interface depth and testability

- **Deletion test.** A module whose deletion would make complexity vanish was a pass-through. One whose deletion would spread complexity into its callers earns its keep. The vocabulary is `design-code`'s: module, interface, depth, seam, adapter.
- **Leaks.** Internal types, raw rows, or framework objects in a public signature.
- **Testability.** Can the core's tests run with no network, database, or UI? Do the tests drive the public entry, or mock the module's own internals?
- **Names.** A name is enough when a caller can state the invariant it guards without reading the implementation. A name fails when docs and code disagree, when one word names two things, or when one timing change forces a reading of several owners.
- **Reading surface.** Count functions whose span exceeds 100 and 200 lines ([references/tools.md](references/tools.md)). This count describes reading cost. It does not enter the score.

### Shape checks

After the lenses, run the checks in [references/shapes.md](references/shapes.md) for each shape found. For a multi-feature product, that includes the extraction test: shared behavior lives in a module that does not name the features, and each feature only composes it.

## 6. Probes

When reading cannot settle a claim, run a probe in a temporary directory or against a substitute for the external system. Never against user data or production services. Record the command, the output that matters, and what the probe cannot prove.

## 7. Score, findings, and directions

Score each subsystem on the lenses its forces make matter, and each written or inferred claim against its lens.

- **5**: the replayed changes stayed inside one module or the composition site; a failure leaves consistent state and a retry is safe.
- **3**: the changes needed edits in the core or in two or more modules; a failure is recoverable by retry or a documented manual step.
- **1**: the changes scattered across many modules, or a failure leaves inconsistent state, or a declared behavior cannot be delivered.

A score between anchors is a judgment, not a formula. Put the phenomenon beside the score, with file and line. Every score needs at least one behavioral evidence: a replayed change or a probe that ran. A score backed only by names in source is marked `unverified`.

Each finding takes one direction:

| Direction | When the evidence shows |
| --- | --- |
| Move | Code changes together with data that lives in another module |
| Merge | Two shallow modules always change together, or callers always call them in sequence |
| Split | One module has two co-change clusters that never overlap |
| Invert | A dependency runs from policy to detail; the core defines the interface and the detail implements it |
| Pin | A fact has more than one writer; give it one |
| Delete | A pass-through by the deletion test, or generality nothing composes |
| Leave | The area is cold, or the change costs more than it saves; say which |

The acceptance check is measurable: replaying the same changes touches N modules instead of M, the cycle is gone, the core's tests run without a database, the fact has one writer.

```
F3  Adding a provider edits the sync core
Trigger:    adding a fourth storage provider, the change the roadmap issue asks for
Where:      src/sync/engine.ts:140-212 switches on provider name; src/sync/types.ts:18 enum Provider
Now:        the last 6 provider commits each touched 3 core files; S3 and GCS retry loops co-changed in 5 of 7 commits
Direction:  invert (a Provider interface owned by src/sync/), merge (one retry loop)
Check:      replaying those 6 commits touches zero files under src/sync/; S3 and GCS retry tests pass through one module
```

Not a finding: "the sync engine is complex". No trigger, no line, no direction, no check.

The roadmap orders findings by failure cost times hotspot weight, then by what must land first. The review names the direction, not the interface. The item the user picks goes to `design-code`.

## Report

Write one self-contained HTML file: inline CSS, no external fonts or scripts, so it opens offline. Give each finding an id (`F1`, `F2`, ...) and link to it from the summary and the roadmap. Put long evidence in `<details>`.

Match the section structure below. Do not copy a sample report's visual style, and do not copy its findings. Subsection titles name this codebase.

1. **执行摘要**
   - 按主导压力排序的评分: each score, the lens or claim it covers, and the phenomenon with file and line.
   - 最优先事项: the first findings, each with its direction and how to know it worked.
2. **项目全景**
   - 产品目标与当前能力.
   - 形状与子系统划分: each subsystem's shape and the evidence for it.
   - 主导压力: the two or three forces, with the hotspot and fix-concentration evidence.
   - 声明的分层与实际依赖: written and inferred claims beside the real import graph.
   - 代码规模与阅读面分布.
3. **架构层面评估**
   - 改动局部性: the replayed changes in a table, the selection rule, and the unexpected co-change pairs.
   - 依赖方向: cycles, policy-to-detail edges, and shared modules that know their callers.
   - 事实归属与权威写入点: the correctness kernel to protect, and each fact's writers.
   - 接口深度、可测性与复杂度预算.
   - 逐条核对设计声明.
4. **子系统详评.** One part per subsystem: its shape, what a caller can observe, what stays internal, the shape checks, and the judgment. Then the findings, product path separate from library callers when both exist.
5. **横切工程质量**
   - 实测结果与证据范围.
   - 热点为什么值得拆，哪些应该合在一起, decided by co-change.
   - 错误如何穿过模块.
   - 文档、版本与组合交付.
6. **失败与残留.** For each main path, what the caller sees when a step fails, what state remains, and whether a retry is safe. This is not a capacity or load estimate.
7. **改进路线图.** Each item with its finding ids, direction, and acceptance check, ordered by failure cost times hotspot weight, then by what must land first.
8. **方法、复核清单与证据**
   - 基线与方法: the baseline from step 1 including the fingerprint, the history window, and the replay selection rule.
   - 关键判断的复核入口: for each score, the files and commands to re-check it.
   - 隔离探针与源码索引.

Skip a subsection only when it does not apply, and say why.

Save it outside the repository's `docs/`. Default path: `$TMPDIR`, else `/tmp`, else `%TEMP%` on Windows, file `<date>-<repo>-codebase-review.html`. If the user names a path, that path is not under `docs/`. Do not add the file to the repo. Open it (`open` on macOS, `xdg-open` on Linux, `start` on Windows) and give the absolute path.

## Source

The section structure comes from a 2026-11-07 multi-repository review. The findings of that review are not part of this skill. Its architecture test, shared behavior lifted into modules that do not name the features, is now the multi-feature check in `references/shapes.md`. Its kernel, a shared module does not know its callers, is part of Lens 2 for every codebase.
