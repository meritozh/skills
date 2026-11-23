# Prosecution

What the prosecutor reads, the lenses it works for each kind of doc, the gate every objection passes, and the format it is written in. The prosecutor reads the doc, what the doc must agree with, and the code. Never the conversation that wrote it.

## Read

Read the doc whole first. Then what it must agree with:

```bash
head -40 AGENTS.md README.md 2>/dev/null              # what the project is
rg -n -A8 '^### (Project status|Project rules|Commands)' AGENTS.md
cat docs/GLOSSARY.md
ls docs/feature/ docs/spec/ docs/polaris/ 2>/dev/null
rg -il '<each key term of the doc>' docs              # other docs that use its terms
```

A file that does not exist is nothing to agree with, not an objection.

- **Feature doc:** the feature docs it names or that share its terms; the goal whose `## Features` links it (`rg -l '<slug>' docs/polaris`), with that goal's `Not this`; `docs/design-system/DESIGN.md` when the feature has a user interface.
- **Implement spec:** its feature doc, whole; every other open spec in `docs/spec/`; `### Commands` in `AGENTS.md`, and the manifests that define the commands its steps run (package scripts, `Makefile`, `justfile`); `DESIGN.md` when a step builds a user interface.

Then the code. For every name, path, number, command, "today it does", and "same as" in the doc, find it:

```bash
rg -n '<what the doc names>' . --glob '!{node_modules,dist,build,vendor,target}/**'
```

`docs/spec/archived/` is a record, not a source: do not read it. Its `.ignore` keeps ripgrep out.

## Every doc

### Truth

Every claim about the code, the stored data, or another doc is true now.

- A name (function, type, file, table, route, command, flag, environment variable) exists where the doc says, with the shape the doc gives it.
- "Today it does X" is what the code does. "Same as Y" matches Y. A number (a timeout, a limit, a retention) matches its source.
- A claim the code or another doc disproves is a blocker. A claim nobody could check, with no name and no place, fails Precision.
- A name that cannot be found, when the doc does not say the feature adds it, is an objection: the builder cannot tell whether to find it or build it. Say where you looked.

### Terms

The doc speaks the glossary's words.

- A word listed under another term's `_Avoid_`: that term is the word.
- A word for a concept the glossary already names: the glossary's word.
- One word for two things in the doc, or two words for one thing.
- A concept the doc leans on with no glossary entry, when another doc or the code calls it something else, or a reader could take it two ways.

### Agreement

Nothing the doc says contradicts:

- another line of the same doc. Read Behavior against `Not this`, Limits against Does, and Decisions against Behavior;
- what the project says it is, `### Project status` (whether breaking changes and resets are allowed), or `### Project rules`;
- another feature doc's Behavior or `Not this`, a goal's `Not this`, or `DESIGN.md`.

Two lines that cannot both hold are a blocker. Quote both.

### Precision

Every line says one thing that a builder can build and someone can check.

- Words two builders would read differently, when a builder must choose between readings: fast, large, many, recent, soon, appropriate, reasonable, gracefully, handle, support, robust, seamless, etc., and so on, if needed, where possible, should, may, similar to, TBD, for now; 适当, 合理, 及时, 尽快, 大量, 少量, 等, 视情况, 必要时, 尽量, 友好, 优雅地处理, 支持, 类似, 暂时. Each becomes a number, a named state, or a named outcome.
- A line no test and no person could check: no input, no action, or no outcome.
- No choice hangs on it, no objection: "quickly" in a summary sentence is fine.

## Feature doc

[feature-doc.md](feature-doc.md) is its form and its shape.

### Form

- One sentence of who can do what; `Status:`; `## Behavior` with Who, Entry, Does, Fails, Limits, Keeps; `## Decisions`; `## Not this`.
- An item may be left out only when it has nothing to say. A feature that stores anything needs Keeps, and one that can fail needs Fails. A missing item that has something to say is raised under Cases.
- The doc holds no debate history, open question, TODO, plan, step, or next step.
- Module, table, and class names belong to the spec, unless they are what a user meets: an endpoint's shape is the contract of an API feature.
- Each `## Decisions` entry has the constraint that makes it win, `Rejected:` with the condition it wins under, and `Wrong-call signal:`.

### Cases

Walk the cases a user will meet, and find the line that decides each. A case no line decides is an objection, rated by [Severity](#severity). A case no user can reach is not one.

- **Who:** each kind of user; someone without the permission, and what they see.
- **Entry:** every way in; started twice, or from two places at once.
- **Does:** zero, one, and the most items; the first time ever; the next time; cancelled or undone halfway; records that existed before the feature ships.
- **Fails:** wrong input; each thing it depends on being down, by name; stopped halfway (a crash, a timeout, a closed tab); what is left behind (partial records, a charge, a sent message); what a retry does.
- **Limits:** every size, count, rate, and duration it consumes has a number or a refusal, and the user sees something at the limit.
- **Keeps:** what outlives the action, for how long, who can delete it, and what happens to it when its owner is deleted.
- **Together:** two users, two tabs, or two jobs on the same thing at once.
- **Meets:** every line of another feature doc that this feature makes untrue was changed there.

### Decisions

- The constraint a decision leans on holds: check it in the code or the docs.
- The rejected option is one a practitioner would really pick, not a straw man.
- The wrong-call signal is something a named person would actually see, somewhere they look.
- A choice in Behavior with two reasonable answers and a costly wrong one, and no entry, is an objection: the next person will reopen it.
- Attack a decision only with what its entry did not weigh: a constraint the code disproves, a case where the rejected option holds and the chosen one breaks, or a signal no one could see. Preferring the other option is not an objection.

### Size

One feature doc carries one feature that one spec can build. Unrelated kinds of user, or entry points that share no behavior, are two features in one doc: major.

## Implement spec

The spec's header and the docs principle in `AGENTS.md` are its form: each step is one commit that leaves the tree building and its tests passing, ending with a `Spec-Step` trailer; only `to-implement-spec` changes it; durable decisions live in the feature doc.

### Header

- `Feature: docs/feature/<slug>.md @ <hash>` matches `git hash-object docs/feature/<slug>.md`. A mismatch is a blocker, and it ends the prosecution: the spec answers an older feature.
- `Feature: none` only for a refactor, with no hash.

### Coverage

- Every Behavior line of the feature doc, and every `Not this` line the code must enforce, has a row in the behavior map with exactly one owner and one test.
- No row cites a line the feature doc does not have.
- Each test proves its line through the owner's interface. A test named for an internal helper tests past the interface. Limits and `Not this` rows assert the refusal.
- Every failure the feature doc's Fails names appears in some module's Errors.

### Interfaces

- Real code in the project's language, in the style of the code around it. Every type and function it names exists (`rg`) or is defined in the spec.
- Each call site works against the interface as written: names, arguments, return type, sync or async.
- Invariants, ordering, errors, configuration, and performance are stated wherever a caller depends on them.
- The deletion test: a module that only passes calls through, or whose callers still repeat the same sequence, is shallow.

### Seams

- Each seam has two adapters, production and test. A seam with one is hypothetical.
- Every dependency the modules touch is in the table, in a category that fits it (in-process, local-substitutable, remote but owned, true external), and its test adapter exists or a step builds it.

### Data

- Every stored record the spec adds or changes has its shape and its one writer.
- Existing records follow `### Project status`: under `startup`, the spec says whether a reset is acceptable; under `release-solo` and `release`, it gives the migration, what each existing record becomes, and the state a failed run leaves.
- The migration lands in a step before any step that reads the new shape.

### Steps

- Each step is one logical change that leaves the tree building and its tests passing on its own. No step calls code a later step adds. A test lands with the behavior it pins.
- `After` names every step whose code it calls or whose data it reads, and every earlier step that changes a module or file it also changes. Steps that `After` does not order run at once in separate worktrees: two of them touching one file is a blocker, because they collide.
- A refactor that makes room comes before the behavior that needs it.
- Each `Check` is a command the repo has, and it fails when the step is wrong. A check that runs nothing relevant (a filter matching no test, a lint for a logic change) is hollow.
- Step numbers are unique, and a landed step is never rewritten.

### Spec against feature

- The spec changes no decision of the feature doc. A conflict is a blocker; reopening the decision is `feature-iterate`.
- A choice the spec makes that is hard to reverse, surprising without context, and a real trade-off is recorded in the feature doc's `## Decisions`, not only in the spec.
- The spec's `Not this` drops no line of the feature doc.
- Another open spec that changes a module this one changes agrees on its interface, and the order between them is stated.
- User-interface steps name `DESIGN.md` tokens and components, never literal values.

## The gate

Every objection carries all four, or it is dropped:

1. **Where.** The line, quoted, with `file:line`. For something missing: the item it belongs under, and the case.
2. **Breaks when.** A concrete scenario: the user, caller, input, or state, and what goes wrong for whom.
3. **Evidence.** For a claim about the code or another doc, the `file:line` read in this battle. Memory is not evidence. An objection that makes no such claim, such as a case no line decides, needs none.
4. **To close.** What the doc must settle, or which of two lines must give.

Not objections:

- Wording no builder could misread.
- What the doc's form leaves out: a plan in a feature doc, or a decision in a spec that the feature doc already records.
- How to build it, raised against a feature doc.
- A case a `Not this` line already excludes, unless the exclusion breaks something.
- A feature or step the prosecutor would like to add.
- Preferring a rejected option, with nothing its entry did not weigh.

## Severity

| Severity | Meaning |
| --- | --- |
| blocker | Building from the doc as written builds the wrong thing, breaks something, or cannot be done: a claim the code disproves, two lines that cannot both hold, an undecided case on the main path, a line that built as written loses data or never ends, a spec step that cannot land green, parallel steps that collide, a stale spec |
| major | A case a user or caller will realistically reach is left undecided, or a line two builders would build differently |
| minor | A word off the glossary, a slip from the form, or wording a careful builder reads right and a hurried one might not |

## Format

Number the objections `#1`, `#2`, …, blockers first, then major, then minor.

```
#1 [blocker] Fails: "the export retries on failure"  (docs/feature/order-export.md:14)
Breaks when: the mail server is down for an hour. Nothing caps the retries, so the job runs all hour and the user sees "Preparing" with no end.
Evidence: the job runner has no retry cap of its own (src/jobs/runner.ts:40).
To close: the retry limit, and what the user sees after the last retry.
```

```
#2 [blocker] Steps 3 and 4 both change src/orders/export.ts, and neither is After the other  (docs/spec/order-export.md:88-89)
Breaks when: go-work runs them in parallel worktrees; the second cherry-pick conflicts and the run stops.
Evidence: step 3 adds ExportJob.cancel and step 4 adds the row limit, both inside src/orders/export.ts (Modules, docs/spec/order-export.md:41).
To close: which step comes first.
```

Dropped: "Fails could be more detailed." No line, no scenario, nothing to close.

End with one line: `lenses: <lenses worked> | read: <docs and code read>`. The lenses are truth, terms, agreement, and precision for every doc; then form, cases, decisions, and size for a feature doc, or header, coverage, interfaces, seams, data, steps, and spec against feature for a spec. A lens that does not apply is listed as `<lens>: n/a`.
