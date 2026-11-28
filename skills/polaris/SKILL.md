---
name: polaris
description: "Set a long-range goal and the route to it, for work too big for one feature: what will be true when it is reached and the signal that shows it, today's distance from it, the route chosen from two or three, and its ordered parts, written to docs/polaris/<slug>.md. Also reviews an active goal's progress, route, or reached state. Use when the user describes a direction bigger than one feature (a north star, a roadmap, a new platform or kind of user, a subsystem to replace, a reliability or speed target; 目标, 方向, 路线图), or asks how a goal is going. Not for one feature, which is feature-new or feature-iterate."
---

# polaris

Run this skill when the user ran `/polaris`, or when the request matches the description. When you start it without `/polaris`, say so in one line, with the reason, so the user can redirect. When the work belongs to another skill, say which and why: switch to it when you can invoke it, otherwise name it for the user and stop.

Work comes in two sizes. A **feature** is what one feature doc and one implement spec can carry. A **goal** is bigger: it needs several features, so it first needs a target and a route. This skill sets the goal and its route and stops there. Cutting the route into features is `to-features`; deciding each feature is `feature-new` or `feature-iterate`; planning the code is `to-implement-spec`. A goal that turns out to fit one feature goes to `feature-new` or `feature-iterate`.

The goal doc is the record of the work. It is written early as a `draft` with its open questions in it, so the work can stop and resume in another session, and it becomes `active` when nothing is open. Its form is [references/polaris-doc.md](references/polaris-doc.md). A strict attack on it is `batman`'s job, after it is written, not this skill's. An idea that comes up and does not belong to this work goes to `note` in one line, and the work goes on.

## Procedure

1. **Research today.** Before asking anything, find what already exists toward the goal: what the project says it is, the goals and features that touch it, and the code. For a wide search, use subagents when the harness has them. Each brief starts with `Read <absolute path of this skill's directory>/references/worker.md before anything else.`; keep only their conclusions, with file:line, in this thread. Every claim cites its file and line ([principles/show-the-evidence.md](principles/show-the-evidence.md)).

   ```bash
   head -20 AGENTS.md README.md
   ls docs/polaris/ docs/feature/
   rg -il '<subject>|<key term>' docs
   ```

   - An existing goal named, or asked about: follow [Review](#review).
   - An active goal overlaps this one: ask whether they merge or the boundary moves.
2. **Pin the target.** One sentence of who can do what, or what is true, when the goal is reached. Its signal: something a named person can observe, with a number when one exists. A goal has no date or horizon: the doc says where the work goes, not when. Check it against the line that says what the project is; a contradiction is a question for the user. Use the glossary's terms ([references/glossary.md](references/glossary.md)), and make a conflicting word a question.
3. **Write the draft.** `docs/polaris/<slug>.md`, `Status: draft`, with the paragraph on today from step 1, what is settled, and every open item under `## Open questions`, each with its options and the recommended one.
4. **Choose the route.** Draft two or three routes that differ in structure, the user's included, and weigh what a user gets first ([principles/compare-real-options.md](principles/compare-real-options.md), [principles/experience-first.md](principles/experience-first.md)). A route is an ordered list of parts. A fact a spike or prototype could settle, such as whether a library or a sync model holds up, gets the spike, not a question. Compare the routes in one table, with your recommendation, and ask the user to pick:

   | Route | A user gets first | Risk | Cost | Closes off |
   | --- | --- | --- | --- | --- |

   The chosen route goes under `## Route` as one paragraph: the constraint that makes it win, the best route set aside with the condition under which it would win, and the first thing someone would see if the route is wrong.
5. **Shape the parts.** For each part of the route: the capability it adds, in glossary terms (not a screen, an endpoint, or a module), and why it comes at this point; `After`, the parts it needs; `Builds on`, the features it uses or changes; `Done when`, its signal. The first part gives a user something usable end to end, unless the user decides otherwise. Every `Done when` holding should make the goal's signal hold. What the goal excludes becomes a `Not this` line. Cut parts the signal does not need; recommending that a part not be built is a valid answer ([principles/subtract-before-you-add.md](principles/subtract-before-you-add.md)).
6. **Settle the open questions.** Ask them following [Questions](#questions). After each answer, write it into its line of the doc and delete the question.
7. **Finish.** When `## Open questions` is empty, run `technical-writing` on the doc, then show the goal sentence, the signal, the route, and the parts, and ask once to confirm the goal as it stands. On yes, delete the section and set `Status: active`. Update `docs/GLOSSARY.md` with each new term and each resolved conflict, creating it when missing. Leave out `## Features`: `to-features` writes it.

The next step is `to-features <slug>`, then `batman` on the goal when a fresh-eyed attack is wanted.

## Questions

- Fill what the code and the docs answer yourself, and cite where. Ask the user only what is theirs to decide or only they know.
- Ask with the question tool, following [references/asking.md](references/asking.md), each question with a recommended answer first and its reason. Ask for a decision, not an opinion.
- When the user stops, the draft keeps its open questions. Say what is open and stop.

For "make the app work offline":

```
Signal: what shows the goal is reached?
- A field user records a visit with no connection, and it syncs within a minute of reconnecting (Recommended): field users are who asked.
- Every screen works offline: wider, and nobody asked for the admin screens.
```

Not: "What does offline mean to you?" It offers no answer to confirm or correct.

## Review

For an active goal:

1. Read the goal and the Status of each feature doc its `## Features` links. Report per part: features shipped, decided, and not yet decided.
2. When the signal holds, ask whether the goal is reached. On yes, set `Status: reached`.
3. When the user wants a different route or new parts, run steps 4–6 on what has not shipped, drafting the route you would choose had the new requirement been there from the start ([principles/redesign-from-first-principles.md](principles/redesign-from-first-principles.md)). Parts and features already decided stay unless the user drops them. The next step is `to-features <slug>`.
4. A goal the user drops: delete its doc. Its decided features keep their own docs.

## Report

After each answer, one line: the doc, its Status, and what is still open. When the doc is active: the goal sentence, the signal, the route and the one set aside, and the parts with their `After`.

## Source

The route comparison, with the rejected route and the condition under which it wins, descends from `convince-me` and `steelman` by [rahul-kulkarni105/skills](https://github.com/rahul-kulkarni105/skills) (CC BY 4.0, https://creativecommons.org/licenses/by/4.0/). The glossary format in `references/glossary.md` is adapted from `domain-modeling` by [mattpocock/skills](https://github.com/mattpocock/skills) (MIT, see `LICENSE`).
