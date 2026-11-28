---
name: feature-iterate
description: "Decide a change to an existing feature before it is built: research today's behavior and what depends on it, pin the change from today to after, choose the approach when there is more than one, and settle every behavior and dependent the change touches by asking with recommended answers, updating docs/feature/<slug>.md in place, as a draft until nothing is open. Use when the user wants an existing feature to do more, less, or something different and the change is not decided (改一下某个功能, 扩展, 调整行为), or picks an Iterate line from a goal's ## Features. Not for work too big for one feature (polaris), a bug where the doc is right (code-bugfix), a small reversible change, or a feature that does not exist yet (feature-new)."
---

# feature-iterate

Run this skill when the user ran `/feature-iterate`, or when the request matches the description. When you start it without `/feature-iterate`, say so in one line, with the reason, so the user can redirect. When the work belongs to another skill, say which and why: switch to it when you can invoke it, otherwise name it for the user and stop.

A feature is what one feature doc and one implement spec can carry. A change bigger than that is a goal, `polaris`. An existing feature already has users, callers, and stored data shaped by what it does today, so this skill settles what changes, what each of them meets after the change, and the approach. How the code does it is `to-implement-spec`. A feature that does not exist yet is `feature-new`, and code that fails a `shipped` doc that is right is `code-bugfix`.

The feature doc is the record of the work. It is updated in place, as a `draft` with its open questions in it while the change is open, so the work can stop and resume in another session, and it becomes `decided` when nothing is open. Its form is [references/feature-doc.md](references/feature-doc.md). A strict attack on it is `batman`'s job, after it is written, not this skill's. An idea that comes up and does not belong to this work goes to `note` in one line, and the work goes on.

## Procedure

1. **Research today.** Before asking anything, find the feature's doc and code, and what depends on them. For a wide search, use subagents when the harness has them, on the facts row of [references/models.md](references/models.md). Each brief starts with `Read <absolute path of this skill's directory>/references/worker.md before anything else.`; keep only their conclusions, with file:line, in this thread. Every claim cites its file and line ([principles/show-the-evidence.md](principles/show-the-evidence.md)).

   ```bash
   ls docs/feature/ docs/spec/
   rg -il '<subject>|<key term>' docs
   rg -n '<entry point>|<key term>' . --glob '!{node_modules,dist,build,vendor,target,docs}/**'
   ```

   - **No doc and no code:** that is `feature-new`. Switch.
   - **Code but no doc:** write today's behavior from the code, item by item of the shape, as the baseline.
   - **`decided`:** the doc is ahead of the code. The change builds on the doc.
   - **An open `docs/spec/<slug>.md`:** that change is being built. Find its landed steps (commits with `Spec-Step: <slug>#<n>`); the spec must catch up with this change before the work goes on.
   - **`shipped`, and doc and code disagree:** say where, and ask which is right.
   - **From a goal:** the change is an `Iterate` line in an active goal's `## Features`. Its sentence is the starting point, and it serves its part.
2. **Pin the change.** One sentence: from <today> to <after>, in the glossary's terms ([references/glossary.md](references/glossary.md)). Then list what changes, what must stay, and what depends on today's behavior: callers (`rg` the entry points), other feature docs, stored data, and outside users such as API clients, saved files, and links. `### Project status` in `AGENTS.md` bounds the answers: whether callers may break, and whether stored data must migrate. A change that contradicts a `Not this` line of an active goal, or reaches into another feature's scope, is a question for the user.
3. **Write the draft.** Update `docs/feature/<slug>.md` in place (or write it from the baseline), `Status: draft`, with every open item under `## Open questions`, each with its options and the recommended one.
4. **Choose the approach.** When more than one approach could make the change (a new column in today's export, a second export, a setting), compare two or three that differ in structure in one table, judged by what the user gets, with your recommendation, and ask the user to pick ([principles/compare-real-options.md](principles/compare-real-options.md), [principles/experience-first.md](principles/experience-first.md)). Today's behavior is always one of the options. A fact a spike or prototype could settle, such as whether a library supports the call or a query is fast enough, gets the spike, not a question.

   | Approach | What users get | What it breaks for today's dependents | Cost | Closes off |
   | --- | --- | --- | --- | --- |

   The chosen one becomes a `## Decisions` entry in the form's prose: the constraint that makes it win, the best other one with the condition under which it would win, and the wrong-call signal. When an earlier decision is overturned, replace its entry. When only one approach is reasonable, skip the table, and name the approach and why in the confirmation at step 7.
5. **Shape the change.** For each item of the shape, start from today's line and mark it same or changes. Settle the after-state of every item that changes as if it had always been the design, not a patch on today's ([principles/redesign-from-first-principles.md](principles/redesign-from-first-principles.md)), and what each dependent from step 2 meets after the change. When the change replaces an interface its dependents use, they move to the new one and the old one goes in the same change, unless `### Project status` keeps a path with a named end ([principles/migrate-then-delete.md](principles/migrate-then-delete.md)).
   - Fill what the conversation, the docs, and the code answer, and cite where. Only what is left goes under `## Open questions`.
   - A choice with two reasonable answers, where the wrong one is costly to undo or would surprise a user, becomes a `## Decisions` entry once it is answered.
   - What the user leaves out of the change keeps today's behavior, or becomes a `Not this` line. Cut what the change sentence does not need; recommending less than asked, or no change, is a valid answer ([principles/subtract-before-you-add.md](principles/subtract-before-you-add.md)).
6. **Settle the open questions.** Ask them following [Questions](#questions). After each answer, write it into its line of the doc and delete the question.
7. **Finish.** When `## Open questions` is empty, run `technical-writing` on the doc, then show its summary, approach, and Behavior, and ask once to confirm it as it stands. On yes, delete the section and set `Status: decided`. The doc describes the feature as it stands after the change, as if it always worked this way: no "previously", "now", or changelog. Then:
   - Update `docs/GLOSSARY.md` with each new term, rename, and resolved conflict.
   - For each `Meets` line, change the line of the other feature doc that the change makes untrue.
   - When the change is a line in a goal's `## Features`, link the line to the doc and keep its sentence after the link, with its number, Part, and After.
   - When the slug no longer names the feature, rename the doc and its open spec with `git mv`, and update every link. When the spec has landed steps, rename after the feature ships instead: those commits name the old slug.

Do not write `docs/spec/`. The next step is `to-implement-spec`, which brings the spec in line with the changed doc, and `batman` on the doc first when a fresh-eyed attack is wanted. A change to what a user sees on a screen updates `docs/design/<slug>.md` through `ui-design` before the spec.

## Questions

- Ask the user only what is theirs to decide or only they know. A question the code or a doc answers is not theirs.
- Ask with the question tool, following [references/asking.md](references/asking.md), each question with a recommended answer first, its reason, and its source. Ask for a decision, not an opinion.
- When the user stops, the draft keeps its open questions. Say what is open and stop.

For adding line items to the orders CSV export:

```
Dependent: the nightly import reads one row per order (scripts/import-orders.ts:58). What does it get after the change?
- Today's file stays under its old name until the import moves (Recommended): Project status is `release`, so a breaking change needs a migration path.
- The import moves in the same change: one file, but the import and the export ship together.
```

Not: "Will this affect anything else?" Step 2 already found what it affects; ask what each one gets.

## Report

After each answer, one line: the doc, its Status, and what is still open. When the doc is decided: the change from today to after, the approach and the one rejected, each item that changed, what each dependent meets, and the `Meets` changes made.

## Source

The approach comparison, with the rejected option and the condition under which it wins, descends from `convince-me` and `steelman` by [rahul-kulkarni105/skills](https://github.com/rahul-kulkarni105/skills) (CC BY 4.0, https://creativecommons.org/licenses/by/4.0/). The glossary format in `references/glossary.md` is adapted from `domain-modeling` by [mattpocock/skills](https://github.com/mattpocock/skills) (MIT, see `LICENSE`).
