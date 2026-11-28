---
name: rpi
description: "Run one piece of work from the first conversation to the PR in T3 Code, with astra (the Codex astra model, through delegate_task) as the fresh-eyed reviewer and builder. Three phases, one doc each: target and route (polaris, for work bigger than one feature), behavior and approach (feature-new or feature-iterate), and the implement spec (to-implement-spec), where a clear technical change such as a dependency upgrade starts. astra battles each doc with batman, builds with go-work, and reviews with diff-review. Every doc goes through technical-writing. The flow loops: an objection, a blocked step, or a finding sends the work back to the doc that must change. The user confirms every move between stages, and every choice, through the question tool. Tangents go to note. Use when the user runs /rpi in T3 Code. Not outside T3 Code, for a bug (code-bugfix), or for a small reversible change."
disable-model-invocation: true
---

# rpi

rpi is recursive project iterate: one piece of work goes round decide, battle, build, and review until it holds, and any stage can send it back up. Follow this skill only when the user ran `/rpi`. Never start it yourself.

This session is the **conductor**. It hands every job that needs fresh eyes or a long build to **astra**.

## Phases

Each phase writes one doc, which holds its settled answers and open questions. The run's progress lives in the [ledger](#ledger) and in git, never in a doc. Run files follow [references/scratch.md](references/scratch.md).

| Phase | Job | Skill | Doc | Done when |
| --- | --- | --- | --- | --- |
| 1. Target and route | What will be true, the signal, the route and its parts | `polaris`, then `to-features` | `docs/polaris/<slug>.md` | `active`, with `## Features` |
| 2. Behavior and approach | What a user meets when it ships, and the approach chosen | `feature-new` or `feature-iterate` | `docs/feature/<slug>.md` | `decided` |
| 3. Implement spec | The modules, interfaces, data, and steps that build it | `to-implement-spec` | `docs/spec/<slug>.md` | written |

[Route](#route) picks the phase to start at. astra battles each phase's doc before the next phase starts.

## Roles

- **The conductor** (this session) talks with the user, writes the docs with the phase skills, and defends in a battle. It keeps the conclusions astra reports, checked against git, and never reads code diffs or build logs ([principles/guard-the-context.md](principles/guard-the-context.md)).
- **astra** is a T3 Code child agent on the Codex provider's astra model. It does four jobs: prosecute a doc (batman), build a spec (go-work), review the result (diff-review), and fix accepted findings. Each job is a new `delegate_task`. Its brief starts with `Read <absolute path of this skill's directory>/references/worker.md before anything else.`, then holds paths and the job, and nothing of this conversation, not even its intent.
- **The user** answers the deciding skills' questions, rules on every objection and finding, and confirms every move between stages.

## Stage skills

- **In this session:** invoke each stage skill with the skill tool. Where it says to end a turn and wait, ask with the question tool instead and go on with the answer. Where it names the next skill for the user to run, run that skill yourself. A stage skill that is not installed stops the run: name `npx skills add meritozh/skills --skill '*' -g`.
- **In astra:** after the worker line, a brief names its skill as `$<name>`, which Codex reads as an explicit invocation.

## Checkpoints

The run moves from one stage to another, forward or back, only on the user's answer. At the end of every stage, ask one question with the header `Next`, naming the stage that finished and its result (the doc and its Status, the battle verdict, the build or review report). The options are the recommended next stage first, the strongest other move (a back edge, another feature line, another stage), and `Stop`.

Checkpoints fall at: where to start, the size of the work, each doc becoming `active` or `decided` (→ battle), each battle's verdict (→ the next phase, or a back edge), each feature line to take, the build gate, the end of the build (→ review, or a back edge when a step blocked), each review (→ fix, or the PR gate), the PR gate, and after the PR (→ the next feature line).

A checkpoint that carries a ruling or a gate asks them in the same call. Nothing moves on a recommendation alone: even the only reasonable next stage waits for the user's pick.

## Setup

1. **astra.** Call `orchestrator_capabilities` with `search: "astra"`. Take the provider whose models include an id ending in `-astra` and that can run a child task, and the newest such model (`gpt-6.2-astra` before `gpt-6-astra`). With none, say astra is unavailable and stop. Never fall back to another model or to native subagents. Keep the model's default options unless the user names an effort.
2. **The tree.** `git status --short --branch`. Name uncommitted changes that are not this work's docs, and never stage them.
3. **Where the work stands.** Derive the next stage from the repo, not memory ([principles/make-operations-idempotent.md](principles/make-operations-idempotent.md)):

   ```bash
   rg -l '^Status: active' docs/polaris 2>/dev/null
   rg -l '^Status: decided' docs/feature 2>/dev/null
   ls docs/spec/*.md 2>/dev/null
   git log --format='%h %(trailers:key=Spec-Step,valueonly)' -20 | rg '#'
   ```

   | The repo shows | Start at |
   | --- | --- |
   | Nothing for this work | [Route](#route) |
   | The user asks to work from the notes | `note` digest; each note picked becomes a route |
   | A goal or feature doc with `Status: draft` | its skill, to settle its open questions |
   | An active goal with no `## Features` | `to-features` |
   | An active goal with a feature line not yet decided | that line's `feature-new` or `feature-iterate` |
   | A feature doc `decided`, no open spec | `to-implement-spec` |
   | An open spec with no landed step | battle the spec, unless the ledger says it holds at the spec's current hash |
   | An open spec with some steps landed | the build gate, which resumes `go-work` |
   | A spec archived by commits not yet reviewed | review |

   Recommend the row that fits. Then read the ledger, `.scratch/rpi/<slug>/state.md` (`ls .scratch/rpi`), for verdicts, rulings, and accepted risks; where it disagrees with the repo, the repo wins.

## Route

Pick the size:

- **A goal** (`polaris`): it needs more than one feature to get there.
- **A feature**: one feature doc and one spec can carry it. Look up whether a feature doc or the code already does something like it, which means `feature-iterate` over `feature-new`, and show what you found in the question.
- **A technical change** (`to-implement-spec`, `Feature: none`): the target is clear and nothing a user or an outside caller meets changes: a dependency upgrade and the API changes it brings to this code, a migration off a deprecated API, a refactor. A change to this project's own public API or behavior is a feature.

Recommend a size, with the reason. A goal whose route turns out to be one part becomes a feature. A bug is `code-bugfix`, and a small reversible change needs no flow: say so and stop.

## Flow

```
1 target and route    polaris ──► to-features ──► ⚔ goal ──► next feature line ─┐
                                                                                 ▼
2 behavior, approach  feature-new | feature-iterate ──► ⚔ feature ──────────────┐
                                                                                 ▼
3 implement spec      to-implement-spec ◄── a clear technical change starts here
                      ──► ⚔ spec ──► [build gate]
                      ──► astra go-work ──► astra diff-review ⇄ astra fix ──► [PR gate] ──► pr
```

`⚔` is a [battle](#battle). Each arrow is a [checkpoint](#checkpoints). [Back edges](#back-edges) say where each failure goes.

Take a goal's feature lines one at a time, in `After` order, each from its feature skill to its PR. After a PR, the checkpoint offers the next line, recommended when nothing blocks it.

## Battle

Run `batman` with astra as the prosecutor:

1. **Pin the doc.** `git hash-object <doc>`. The doc may be uncommitted.
2. **Prosecute.** `delegate_task` with the astra target, `role: "review"`, `isolation: "shared"`, `title: "batman: <doc>"`, and batman's prosecutor brief (batman step 2) as the task, with the absolute path of batman's `references/prosecution.md` and batman's report file. Then follow the `next` it returns. Do not poll.
3. **Defend** every objection in one pass, as batman step 4 says.
4. **Press.** A new `delegate_task` with batman step 5's press brief, and nothing else. One press round.
5. **Rule.** Send the ruling turn in batman's Output shape, then ask for the rulings as batman step 6 says. A battle with nothing to rule still ends at its checkpoint, which shows the verdict.
6. **Apply** as batman step 7 says.

A battle after a doc changed attacks only the changed lines: the brief names them with their line numbers, and lists the objections already refuted or overruled, which it must not raise again. A third battle of one doc that still finds new blockers means the doc needs rework: write down the premise it keeps failing on ([principles/attack-the-premise.md](principles/attack-the-premise.md)), and go back to the skill that wrote it with that premise.

## Back edges

When a stage fails, the checkpoint recommends going back to the doc that must change. Every doc after it is stale: re-check it in order before going forward.

| What happened | Go back to | Then run again |
| --- | --- | --- |
| A goal ruling changes the goal, its signal, or the route | `polaris` (Review step 3) | `to-features` when parts changed; ⚔ goal on the changed lines |
| A goal ruling on `## Features` | `to-features`, with the hand-off | ⚔ goal on the changed lines |
| A feature skill finds the feature contradicts the goal | `polaris` | everything after the goal |
| A feature-doc fix was applied | nothing: batman wrote it | `to-implement-spec` when a spec exists (its hash is stale); ⚔ spec |
| A feature ruling overturns a `## Decisions` entry or a `Not this` line | `feature-iterate` | ⚔ feature; `to-implement-spec`; ⚔ spec |
| A spec ruling | `to-implement-spec`, with the hand-off | ⚔ spec on the changed steps |
| The spec cannot deliver a feature line as decided | the feature doc first (batman's rule), then `to-implement-spec` | ⚔ feature on the changed lines; ⚔ spec |
| `go-work` blocked: the step cannot be done as written | `to-implement-spec`; landed steps stay | ⚔ spec on the changed steps; build gate |
| `go-work` blocked: the feature is wrong | `feature-iterate` | ⚔ feature; `to-implement-spec`; ⚔ spec; build gate |
| A review finding: the code misses the docs | [astra fix](#review) | review the new diff |
| A review finding: the docs are wrong | `feature-iterate`, which takes a new spec for the change | the whole chain from ⚔ feature |

A stage that runs again changes only what the failure touched.

## Build gate

The build starts when the spec battle holds (`holds` or `holds after fixes`, no hand-off waiting) and the spec's `Feature:` hash equals `git hash-object docs/feature/<slug>.md` (a spec with `Feature: none` has no hash). Send the user:

- the goal, feature doc, and spec, each with its battle verdict;
- every `overruled` objection, as a risk the user carries;
- the steps, and which run in parallel.

Then ask one question, `Build`: `Commit the docs and build (Recommended)`, `Change a doc first`, `Stop`. On build:

1. On the default branch, `git switch -c <slug>`.
2. Commit the goal, the feature doc, the spec, `docs/GLOSSARY.md`, and `docs/NOTES.md`, whichever changed, as one docs commit. Stage only those paths. Record `start=$(git rev-parse HEAD)`.
3. `delegate_task` to astra, `role: "implementation"`, `isolation: "shared"`, `title: "go-work: <slug>"`:

   ```text
   Read <absolute path of this skill's directory>/references/worker.md before anything else.

   $go-work <slug>

   You are the coordinator of this run. The spec, the feature doc, and the glossary are committed. When a step is blocked, finish the steps already running, stop, and report why.

   Reply in two lines: done | blocked at step <n>: <why>, then the final check and its exit code.
   ```

4. Check the report against git ([principles/prove-it-works.md](principles/prove-it-works.md)): `git log --format='%h %s %(trailers:key=Spec-Step,valueonly)' <start>..HEAD`, and whether the spec moved to `docs/spec/archived/`. A blocked step goes to [Back edges](#back-edges).

## Review

1. `delegate_task` to astra, `role: "review"`, `isolation: "shared"`, `title: "diff-review: <slug>"`:

   ```text
   Read <absolute path of this skill's directory>/references/worker.md before anything else.

   $diff-review <start>..HEAD

   The feature is docs/feature/<slug>.md (or, with Feature: none, the target in the spec's summary). It was built from docs/spec/archived/<file>. Report only.

   Reply with the verdict and sign-off, one line per finding (#<n> [<severity>] <file:line> <title>), and the path of the round file diff-review writes.
   ```

2. Send the findings with the sign-off, then ask one question per finding: **fix** (the code misses the docs), **accept** (the user carries it), or **change the docs** (`feature-iterate`), recommended first. A clean review goes straight to the PR gate, which is its checkpoint.
3. **Fix.** Record `fix_start=$(git rev-parse HEAD)`. A new `delegate_task` to astra, `role: "implementation"`, `isolation: "shared"`, naming the accepted findings and the round file:

   ```text
   Read <absolute path of this skill's directory>/references/worker.md before anything else.

   Fix review findings <numbers> of .scratch/diff-review/<slug>/round-<n>.md in this checkout. For each: write the test that fails on the current code, through the interface a caller uses, run it red, fix the code, run it green. One commit per finding class, an imperative subject under 72 characters. Do not edit docs/.

   Reply with one line per finding: fixed <hash> | could not: <why>, then the check you ran and its exit code.
   ```

4. Review again with a new astra job on `<fix_start>..HEAD`, saying it is round 2: diff-review reads the earlier round files and does not report their findings again. When a third round still finds new problems, show diff-review's route verdict, with the premise the fixes keep failing on ([principles/attack-the-premise.md](principles/attack-the-premise.md)), and let the user choose between the docs and a rework.

## PR gate

When the review is clean or every finding is ruled, send `git log --oneline <start>..HEAD`, the review verdict, and the risks the user accepted. Then ask one question, `PR`: `Write, push, and open it (Recommended)`, `Write it only`, `Stop`. Run `pr`, which calls `show-me` for the Summary. Push and open only on the first answer. Never force-push or merge.

## Ledger

End every turn that moves the run with the ledger, and write the same lines to `.scratch/rpi/<slug>/state.md`, each ⚔ there with the doc's short hash, plus one line per ruling and accepted risk:

```
rpi · <slug> · astra: <model>
goal     docs/polaris/<slug>.md   ⚔ holds after fixes
feature  docs/feature/<slug>.md   ⚔ holds @ <short hash>
spec     docs/spec/<slug>.md      ⚔ back to /to-implement-spec: 2 hand-offs
build    not started | <start>..HEAD, 4/6 steps | blocked at step 3: <why>
review   round 1: 1 high, 2 medium | clean
next     <the stage that runs next>
```

Leave out a line that does not apply yet. `.scratch/rpi/<slug>/` takes the slug of the run's first doc. Delete `.scratch/rpi/<slug>/` when no feature line of the goal is left. diff-review deletes its own directory once the branch merges.

## Rules

- Never send a later astra round to a running child's thread.
- One writer at a time ([principles/separate-shared-state.md](principles/separate-shared-state.md)). While astra builds or fixes, the conductor writes nothing. A prosecutor and a reviewer edit nothing.
- Between the user's answers, work without stopping. Ask only through the question tool, following [references/asking.md](references/asking.md): the stage skills' questions, every ruling, and every checkpoint. Never end a turn to wait for a reply in text.
- The docs say what is true, not how the run got there: no meeting record, no roadmap, no dates or progress. The run's progress lives in the ledger and git. Every doc goes through `technical-writing` before it is battled. The stage skills run it. Run it yourself on sections you change outside a stage skill, such as an applied ruling.
- An idea outside the current work, from the user, a battle, or a review, goes to `note` in one line, and the run goes on.
- Never push, force-push, or merge outside the PR gate. Commit only the docs commit at the build gate. astra commits the code.
- When the user stops, show the ledger and stop. `/rpi` later resumes from the repo and `state.md`.
