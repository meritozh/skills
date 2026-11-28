# Prosecution

The prosecutor never reads the conversation that wrote the doc.

## Read

Read the doc whole, then what it must agree with:

```bash
head -40 AGENTS.md README.md 2>/dev/null              # what the project is
rg -n -A8 '^### (Project status|Project rules|Commands)' AGENTS.md
cat docs/GLOSSARY.md
ls docs/feature/ docs/spec/ docs/polaris/ 2>/dev/null
rg -il '<each key term of the doc>' docs              # other docs that use its terms
```

A file that does not exist is not an objection.

- **Goal doc:** every feature doc its `Builds on` and `## Features` link, with its Status and `Not this`; the other active goals' `Not this` (`rg -l '^Status: active' docs/polaris`); [polaris-doc.md](polaris-doc.md).
- **Feature doc:** the feature docs it names or that share its terms; the `Not this` of the goal linking it (`rg -l '<slug>' docs/polaris`); `docs/design-system/DESIGN.md` when it has a user interface; [feature-doc.md](feature-doc.md).
- **Implement spec:** its feature doc, whole; every other open spec; `### Commands` and the manifests defining the commands its steps run (package scripts, `Makefile`, `justfile`); `DESIGN.md` when a step builds a user interface.

Then the code. Find every name, path, number, command, "today it does", and "same as" in the doc:

```bash
rg -n '<what the doc names>' . --glob '!{node_modules,dist,build,vendor,target}/**'
```

Do not read `docs/spec/archived/`.

## Every doc

### Truth

Every claim about the code, the stored data, or another doc is true now.

- Every name (function, type, file, table, route, command, flag, variable) exists where the doc says, with the shape it gives.
- "Today it does X" is what the code does. "Same as Y" matches Y. A number (a timeout, a limit) matches its source. A measured number (a latency, a size) without its run count, spread, and limiter is an objection ([explain-the-number.md](../principles/explain-the-number.md)).
- A claim the code or another doc disproves is a blocker. A claim with no name and no place fails Precision.
- A name you cannot find, that the doc does not say the feature adds, is an objection. Say where you looked.

### Terms

The doc speaks the glossary's words. Raise:

- a word listed under another term's `_Avoid_`, or another word for a concept the glossary names;
- one word for two things, or two words for one thing;
- a concept the doc leans on with no glossary entry, when another doc or the code calls it something else, or a reader could take it two ways.

### Agreement

Nothing the doc says contradicts:

- another line of the same doc. Read Behavior against `Not this`, Limits against Does, and Decisions against Behavior;
- what the project says it is, `### Project status`, or `### Project rules`;
- another feature doc's Behavior or `Not this`, a goal's `Not this`, or `DESIGN.md`.

Two lines that cannot both hold are a blocker. Quote both.

### Writing

The doc reads in its mode, per the `technical-writing` table: a goal explains, a feature doc is reference, a spec is a how-to.

- History of the work ("originally", "now", "after discussion", a struck or annotated old answer) or plan (a date, a horizon, a milestone, progress, a next step) is minor; major when a builder could read the old answer as current.
- An argument written as a stack of `Label: value` lines, missing the reason behind a decision or a route, is minor.
- Wording alone is not an objection: polishing prose is `technical-writing`.

### Precision

Every line says one thing a builder can build and someone can check.

- Words two builders would read differently, when the choice matters: fast, large, many, recent, soon, appropriate, reasonable, gracefully, handle, support, robust, seamless, etc., and so on, if needed, where possible, should, may, similar to, TBD, for now; 适当, 合理, 及时, 尽快, 大量, 少量, 等, 视情况, 必要时, 尽量, 友好, 优雅地处理, 支持, 类似, 暂时. Each becomes a number, a named state, or a named outcome.
- A line no test and no person could check: no input, no action, or no outcome.
- "quickly" in a summary sentence, with no choice hanging on it, is fine.

## Goal doc

[polaris-doc.md](polaris-doc.md) is its form. A goal is coarse on purpose. Raise what would make `to-features` or the feature skills cut the wrong thing, not what they will decide later.

### Form

- Every section of the template, with `## Features` only once `to-features` has run.
- No debate history, date, horizon, open question, or feature Status.

### Goal

- The goal is an outcome for a user or the project, not a thing to build ("Ship a plugin API" is a part).
- The signal is something a named person could observe, somewhere they look, with a number when one exists. An unobservable signal is a blocker.

### Route

Work it as [Decisions](#decisions) below, with the route as the decision; the rejected route's condition says when it wins.

### Parts

- Each part names a capability in glossary terms, not a screen, endpoint, or module.
- `After` names every part whose capability it needs. A cycle, or a part that needs one it does not wait for, is a blocker.
- Each `Builds on` link resolves to a feature that does what the part leans on. A part needing a feature to change, with no Iterate line or `Builds on` saying so, is an objection.
- Each `Done when` can be checked, and all of them holding makes the Signal hold; a gap is major.
- The first part gives a user something usable end to end, unless the doc says why not.

### Features

Only when `## Features` exists.

- Every part has a feature line, and every line serves one existing part.
- A feature line's `After` agrees with its part's, and names only existing lines.
- A `New` line has no feature doc yet; an `Iterate` line, or any linked line, links one that exists.
- Each line is one sentence of who can do what, sized to one feature doc and one spec.

## Feature doc

[feature-doc.md](feature-doc.md) is its form.

### Form

- Every section of the template, each Behavior item under its heading. An item may be left out only when it has nothing to say. Raise a missing item under Cases.
- No debate history, open question, TODO, plan, step, or next step.
- Module, table, and class names belong to the spec, unless a user meets them (an API feature's endpoint shape).
- Each `## Decisions` entry has the template's parts: constraint, best alternative with its winning condition, wrong-call signal.

### Cases

Find the line that decides each case a user will meet. An undecided reachable case is an objection, rated by [Severity](#severity).

- **Who:** each kind of user; someone without the permission, and what they see.
- **Entry:** every way in; started twice, or from two places at once.
- **Does:** zero, one, and the most items; the first time and the next; cancelled or undone halfway; records from before the feature ships.
- **Fails:** wrong input; each dependency down, by name; stopped halfway (a crash, a timeout, a closed tab); what is left behind (partial records, a charge, a sent message); what a retry does. For a job or action that can stop anywhere, a line decides what a rerun does from each stopping point ([principles/make-operations-idempotent.md](../principles/make-operations-idempotent.md)).
- **Limits:** every size, count, rate, and duration it consumes has a number or a refusal, and the user sees something at the limit.
- **Keeps:** what outlives the action, for how long, who can delete it, and what happens when its owner is deleted.
- **Together:** two users, two tabs, or two jobs on the same thing at once.
- **Meets:** each other feature doc's line this feature makes untrue was changed there.

### Decisions

- The constraint a decision leans on holds: check it in the code or the docs.
- The rejected option is one a practitioner would really pick.
- A named person would see the wrong-call signal, somewhere they look.
- A choice in Behavior with two reasonable answers and a costly wrong one, and no entry, is an objection.
- Attack a decision only with what its entry did not weigh: a constraint the code disproves, or a case where the rejected option holds and the chosen one breaks.

### Size

One feature doc is one feature one spec can build. Unrelated kinds of user, or entry points sharing no behavior, are two features: major.

## Implement spec

The spec's header and the docs principle in `AGENTS.md` are its form.

### Header

- `Feature: docs/feature/<slug>.md @ <hash>` matches `git hash-object docs/feature/<slug>.md`. A mismatch is a blocker that ends the prosecution.
- `Feature: none` only for a change with nothing for a user to decide (a dependency upgrade, an API migration, a refactor), with no hash, and its target and signal in the summary. One that changes what a user or an outside caller meets is a blocker: that needs a feature doc, through `feature-iterate`.

### Coverage

- Every Behavior line of the feature doc, and every `Not this` line the code must enforce, has a behavior-map row with exactly one owner and one test, and no row cites a line the doc lacks.
- Each test proves its line through the owner's interface, not an internal helper. Limits and `Not this` rows assert the refusal.
- A named test that fails either imagined edit in [principles/test-behavior.md](../principles/test-behavior.md) does not cover its row: major.
- Every failure the feature doc's Fails names appears in some module's Errors.

### Interfaces

- Real code in the project's language and style. Every type and function it names exists (`rg`) or is defined in the spec.
- Each call site works against the interface as written: names, arguments, return type, sync or async.
- Invariants, ordering, errors, configuration, and performance are stated where a caller depends on them.
- The deletion test: a module that only passes calls through, or whose callers still repeat the same sequence, is shallow.

### Seams

- Each seam has two adapters, production and test; one with only one is hypothetical.
- Every dependency the modules touch is in the table in a fitting category (in-process, local-substitutable, remote but owned, true external), and its test adapter exists or a step builds it.

### Data

- Every stored record the spec adds or changes has its shape and its one writer.
- Existing records follow `### Project status`: under `startup`, the spec says whether a reset is acceptable; under `release-solo` and `release`, it gives the migration, what each existing record becomes, and the state a failed run leaves.
- A migration or backfill a second run breaks, or that leaves a half-written state the next run cannot recognize, is a blocker ([principles/make-operations-idempotent.md](../principles/make-operations-idempotent.md)).
- The migration lands in a step before any step that reads the new shape.

### Steps

- Each step is one logical change, one commit with a `Spec-Step` trailer, that leaves the tree building and its tests passing. No step calls code a later step adds. A test lands with the behavior it pins.
- `After` names every step whose code it calls or whose data it reads, and every earlier step that changes a module or file it also changes. Two unordered steps touching one file are a blocker: they run in parallel worktrees and collide.
- A refactor that makes room comes before the behavior that needs it.
- Each `Check` is a command the repo has, and it fails when the step is wrong. A check running nothing relevant (a filter matching no test, a lint for a logic change) is hollow.
- Step numbers are unique, and a landed step is never rewritten.

### Spec against feature

- The spec changes no feature-doc decision. A conflict is a blocker; reopening it is `feature-iterate`.
- A spec choice that is hard to reverse, surprising, and a real trade-off is in the feature doc's `## Decisions`, not only the spec.
- The spec's `Not this` drops no line of the feature doc.
- Another open spec changing a module this one changes agrees on its interface, and their order is stated.
- User-interface steps name `DESIGN.md` tokens and components, never literal values.

## The gate

Every objection carries all four, or it is dropped:

1. **Where.** The line, quoted, with `file:line`. For something missing: the item it belongs under, and the case.
2. **Breaks when.** A concrete scenario: the user, caller, input, or state, and what goes wrong for whom.
3. **Evidence.** For a claim about the code or another doc, the `file:line` read in this battle, labeled per [principles/show-the-evidence.md](../principles/show-the-evidence.md); a `guess` is not evidence. An objection that makes no such claim, such as an undecided case, needs none.
4. **To close.** What the doc must settle, or which of two lines must give.

Not objections:

- What the doc's form leaves out: a plan in a feature doc, or a decision in a spec that the feature doc already records.
- How to build it, raised against a feature doc. What a feature does, raised against a goal.
- A case a `Not this` line already excludes, unless the exclusion breaks something.
- A feature or step the prosecutor would like to add.
- Preferring a rejected option.

## Severity

| Severity | Meaning |
| --- | --- |
| blocker | Building from the doc as written builds the wrong thing, breaks something, or cannot be done (for a goal, its features cannot reach its signal), such as an undecided case on the main path, a line that built as written loses data or never ends, or a spec step that cannot land green |
| major | A case a user or caller will realistically reach is left undecided, or a line two builders would build differently |
| minor | A word off the glossary, a slip from the form, or wording a careful builder reads right and a hurried one might not |

## Format

Number the objections `#1`, `#2`, …, blockers first, then major, minor.

```
#1 [blocker] Fails: "the export retries on failure"  (docs/feature/order-export.md:14)
Breaks when: the mail server is down for an hour. Nothing caps the retries, so the job runs all hour and the user sees "Preparing" with no end.
Evidence (read): the job runner has no retry cap of its own (src/jobs/runner.ts:40).
To close: the retry limit, and what the user sees after the last retry.
```

```
#2 [blocker] Steps 3 and 4 both change src/orders/export.ts, and neither is After the other  (docs/spec/order-export.md:88-89)
Breaks when: go-work runs them in parallel worktrees; the second cherry-pick conflicts and the run stops.
Evidence (read): step 3 adds ExportJob.cancel and step 4 adds the row limit, both inside src/orders/export.ts (Modules, docs/spec/order-export.md:41).
To close: which step comes first.
```

Dropped: "Fails could be more detailed." No line, no scenario, nothing to close.

End with one line: `lenses: <lenses worked> | read: <docs and code read>`. The lenses are the `###` headings under Every doc and under the doc's kind; list one that does not apply as `<lens>: n/a`.
