---
name: feature-new
description: "Decide a new feature before it is built: pin who can do what they cannot do now, research what exists, choose the approach when there is more than one, and settle every behavior a user will meet by asking with recommended answers, in docs/feature/<slug>.md, written as a draft from the start and decided when nothing is open. Use when the user wants the project to do something it cannot do yet and the feature is not decided (想加一个功能, 设计一个新 feature), or picks a New line from a goal's ## Features. Not for work too big for one feature (polaris), building something already decided, a small reversible change, or changing an existing feature (feature-iterate)."
---

# feature-new

Run this skill when the user ran `/feature-new`, or when the request matches the description. When you start it without `/feature-new`, say so in one line, with the reason, so the user can redirect. When the work belongs to another skill, say which and why: switch to it when you can invoke it, otherwise name it for the user and stop.

A feature is what one feature doc and one implement spec can carry. Work bigger than that is a goal, `polaris`. This skill settles what the user will meet when the feature ships, and the approach that gives it to them. How the code does it is `to-implement-spec`. A feature that already exists, in a doc or the code, is `feature-iterate`.

The feature doc is the record of the work. It is written early as a `draft` with its open questions in it, so the work can stop and resume in another session, and it becomes `decided` when nothing is open. Its form is [references/feature-doc.md](references/feature-doc.md). A strict attack on it is `batman`'s job, after it is written, not this skill's. An idea that comes up and does not belong to this work goes to `note` in one line, and the work goes on.

## Procedure

1. **Research today.** Before asking anything, find what the project says it is, what already does something like this, and the code the feature will meet. For a wide search, use subagents when the harness has them, on the facts row of [references/models.md](references/models.md). Each brief starts with `Read <absolute path of this skill's directory>/references/worker.md before anything else.`; keep only their conclusions, with file:line, in this thread. Every claim cites its file and line ([principles/show-the-evidence.md](principles/show-the-evidence.md)).

   ```bash
   head -20 AGENTS.md README.md
   ls docs/feature/ docs/polaris/
   rg -il '<subject>|<key term>' docs
   rg -n '<key term>' . --glob '!{node_modules,dist,build,vendor,target,docs}/**'
   ```

   - **Covered:** a feature doc or the code already does it. That is `feature-iterate`: name where, and switch.
   - **From a goal:** the feature is a `New` line in an active goal's `## Features`. Its sentence is the starting point, and it serves its part.
   - **Outside:** it contradicts what the project says it is, or a `Not this` line of a feature or an active goal. Quote the line, and ask whether the feature or that line changes.
2. **Pin the target.** One sentence: who can do what that they cannot do now. Use the glossary's terms ([references/glossary.md](references/glossary.md)), and make a conflicting word a question. When the request is too thin to write the sentence, ask for it.
3. **Write the draft.** `docs/feature/<slug>.md`, `Status: draft`, with what is settled and every open item under `## Open questions`, each with its options and the recommended one.
4. **Choose the approach.** When more than one approach could give the user this (a CSV download, an API endpoint, a scheduled report), compare two or three that differ in structure in one table, judged by what the user gets, with your recommendation, and ask the user to pick ([principles/compare-real-options.md](principles/compare-real-options.md), [principles/experience-first.md](principles/experience-first.md)). A fact a spike or prototype could settle, such as whether a library supports the call or a query is fast enough, gets the spike, not a question.

   | Approach | What the user gets | Cost | Risk | Closes off |
   | --- | --- | --- | --- | --- |

   The chosen one becomes a `## Decisions` entry in the form's prose: the constraint that makes it win, the best other one with the condition under which it would win, and the wrong-call signal. When only one approach is reasonable, skip the table, and name the approach and why in the confirmation at step 7.
5. **Shape the behavior.** Settle every item of the shape in [references/feature-doc.md](references/feature-doc.md): Who and Entry, then Does, then Fails, Limits, and Keeps.
   - Fill what the conversation, the docs, and the code answer, and cite where. Only what is left goes under `## Open questions`.
   - A choice with two reasonable answers, where the wrong one is costly to undo or would surprise a user, becomes a `## Decisions` entry once it is answered.
   - What the user leaves out becomes a `Not this` line. Cut what the target sentence does not need; recommending that the feature, or a part of it, not be built is a valid answer ([principles/subtract-before-you-add.md](principles/subtract-before-you-add.md)).
   - `Meets`: each line of another feature doc this feature makes untrue.
6. **Settle the open questions.** Ask them following [Questions](#questions). After each answer, write it into its line of the doc and delete the question.
7. **Finish.** When `## Open questions` is empty, run `technical-writing` on the doc, then show its summary, approach, and Behavior, and ask once to confirm it as it stands. On yes, delete the section and set `Status: decided`. Then:
   - Update `docs/GLOSSARY.md` with each new term and resolved conflict, creating it when missing.
   - For each `Meets` line, change the line of the other feature doc that this feature makes untrue.
   - When the feature is a line in a goal's `## Features`, replace the line's sentence with a link to the doc, keeping its number, Part, and After.

Do not write `docs/spec/`. The next step is `to-implement-spec`, and `batman` on the doc first when a fresh-eyed attack is wanted. A feature with a user interface and no `docs/design/<slug>.md` goes through `ui-design` before the spec.

## Questions

- Ask the user only what is theirs to decide or only they know. A question the code or a doc answers is not theirs.
- Ask with the question tool, following [references/asking.md](references/asking.md), each question with a recommended answer first, its reason, and its source. Ask for a decision, not an opinion.
- When the user stops, the draft keeps its open questions. Say what is open and stop.

For a CSV export of orders:

```
Fails: an export of the largest account runs past the 30-second request timeout (src/http/server.ts:41). What does the user get?
- It runs in the background and emails a link (Recommended): those accounts hold up to 200,000 orders.
- It refuses exports over 50,000 orders: simpler, but the largest accounts cannot export at all.
```

Not: "What should happen on errors?" It names no case and offers no answer.

## Report

After each answer, one line: the doc, its Status, and what is still open. When the doc is decided: the feature sentence, the approach and the one rejected, each Behavior section, and the `Meets` changes made.

## Source

The approach comparison, with the rejected option and the condition under which it wins, descends from `convince-me` and `steelman` by [rahul-kulkarni105/skills](https://github.com/rahul-kulkarni105/skills) (CC BY 4.0, https://creativecommons.org/licenses/by/4.0/). The glossary format in `references/glossary.md` is adapted from `domain-modeling` by [mattpocock/skills](https://github.com/mattpocock/skills) (MIT, see `LICENSE`).
