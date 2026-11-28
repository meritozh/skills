---
name: to-features
description: "Cut an active polaris goal, docs/polaris/<slug>.md, into features. Each feature is one sentence of who can do what, marked new or as a change to an existing feature, mapped to the part of the route it serves, and ordered with After. Checks that every part is covered and every feature serves a part, sizes each to fit one feature doc and one implement spec, and puts a usable slice first. After the user confirms, writes the list into the goal's ## Features. Deciding each feature is feature-new or feature-iterate. Use after polaris, or after a goal's route changed."
---

# to-features

Run this skill when the user ran `/to-features`, when the request matches the description, or when another skill hands work to it, as `rpi` does. When you start it without `/to-features`, say so in one line, with the reason, so the user can redirect. When the work belongs to another skill, say which and why: switch to it when you can invoke it, otherwise name it for the user (for example `/polaris`) and stop.

A goal says where the project is going and which parts get there. This skill turns the parts into features that `feature-new` and `feature-iterate` take one at a time. It decides what each feature is and when it comes, not how it behaves: each line stays one sentence, and the feature skills shape the rest.

Stop at the list. Do not write feature docs, specs, or code. Setting or changing a goal and its route is `polaris`. Deciding a feature is `feature-new`, and changing one is `feature-iterate`.

## What a feature is here

- **One sentence.** Who can do what that they cannot do now, or, for an existing feature, from today to after.
- **Something a user meets.** Work no user can see on its own (a schema, a library, a refactor) is not a feature. It becomes a step in the spec of the first feature that needs it. Name that feature.
- **One feature doc and one spec.** A line that needs more than one kind of user or more than one entry point is too big: split it. A line that changes nothing a user can see on its own is too small: merge it into its neighbor. A line no part's `Done when` needs is cut ([principles/subtract-before-you-add.md](principles/subtract-before-you-add.md)).
- **New or iterate.** When a feature doc or the code already covers it, the line changes that feature. It is not a new one.

## Procedure

1. **Load the goal.** Read `docs/polaris/<slug>.md`. With no slug, list `docs/polaris/`, and take the only active goal or ask which. A goal that is not `active` has nothing to cut: say so and stop. Read `docs/GLOSSARY.md`, `ls docs/feature/`, and the feature docs the parts build on. Each `Iterate` mark and each claim about what a feature does today cites the doc or code line it came from ([principles/show-the-evidence.md](principles/show-the-evidence.md)).
2. **Read the existing list.** When `## Features` exists, this run follows a route change: keep each linked line, which is a decided feature, with its number, and revise only the unlinked lines. Cut those as you would for the new route from the start, not as edits to the old list ([principles/redesign-from-first-principles.md](principles/redesign-from-first-principles.md)).
3. **Cut each part** into features, in the order the parts' `After` gives. Each line gets its sentence, `New` or `Iterate <feature doc>`, its part, and its `After`: every feature whose behavior it needs. Before marking a line `New`, search for it:

   ```bash
   rg -il '<key term>' docs/feature
   rg -n '<key term>' . --glob '!{node_modules,dist,build,vendor,target,docs}/**'
   ```

   A feature doc or code that already does it makes the line `Iterate`.
4. **Put a usable slice first.** The first features give a user something to use end to end, however thin, unless the route says otherwise ([principles/experience-first.md](principles/experience-first.md)). A feature that only prepares for later ones does not come first.
5. **Check coverage.** Every part has at least one feature, and every feature serves one part. Each part's `Done when` is reached by its features and nothing more. A part no feature can cover, such as a data migration or a vendor contract: name it, and ask whether it becomes a step in one feature's spec or the route changes in `polaris`.
6. **Align the terms.** Name each feature in glossary terms. A new noun follows "Before adding a term" in [references/glossary.md](references/glossary.md). A conflict becomes a question.

Ask about the cut points: where a part splits, which feature comes first, and whether a line is new or iterate when the search is not conclusive. Ask with the question tool, following [references/asking.md](references/asking.md), each question with your recommended answer first and its reason. When the user stops early, list the open items and write nothing.

For a part "visits sync after reconnecting":

```
1. Split: one feature for queuing visits offline and one for syncing them, or one feature for both?
   Recommended: one. Queuing without sync changes nothing a user can see on its own.
2. First: is "a field user records a visit offline and sees it synced" the first slice?
   Recommended: yes. It reaches part 1's Done when alone; conflict handling can follow.
```

## Output

During the cut, each turn gives the draft list and its questions. When it is settled:

```
## Features for <goal title>

1. <who can do what>. New. Part: 1. After: none
2. <from today to after>. Iterate [<Feature title>](../feature/<slug>.md). Part: 1. After: 1
3. …

Coverage:
- Part 1, <part name>: features 1, 2. Done when <signal>: reached by <which features>
- Part 2, <part name>: feature 3

Not features: <work that becomes a spec step, and in which feature's spec> | none
First slice: features <numbers>: what a user can do once they ship
```

## After confirmation

Show the settled output, then ask once whether to write the list into the goal. When the user accepts:

1. Write it into the goal doc's `## Features`, in the form in [references/polaris-doc.md](references/polaris-doc.md). Lines already there keep their numbers; new lines take new ones.
2. Update `docs/GLOSSARY.md` with each new term and each resolved conflict, following [references/glossary.md](references/glossary.md).

The next step is `/feature-new` or `/feature-iterate` with the first undecided line, in order. Each one, once decided, turns its line into a link.

Until the user accepts, write nothing.

## Source

Original to this collection. The glossary format in `references/glossary.md` is adapted from `domain-modeling` by [mattpocock/skills](https://github.com/mattpocock/skills) (MIT, see `LICENSE`).
