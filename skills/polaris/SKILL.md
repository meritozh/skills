---
name: polaris
description: Set a long-range goal for the project and the route to reach it, coarser and longer-lived than one feature. Pin what will be true when the goal is reached and the signal that shows it, check it against what the project says it is and how far today is from it, make the author earn the goal, compare routes and steelman the one set aside, break the chosen route into ordered parts, and grill the route. After the user confirms, write docs/polaris/<slug>.md. Also reviews an active goal: progress, a changed route, or reached. Use when the user has a direction bigger than one feature. Cutting a goal into features is to-features; one feature is feature-new or feature-iterate.
disable-model-invocation: true
---

# polaris

User-invoked only: follow this skill only when the user ran `/polaris`. When the work belongs to another skill, name it (for example `/feature-new`), say why, and stop. Do not invoke it yourself.

A goal says what will be true when it is reached, for whom, and how anyone can tell. Its route says which parts get there, in what order. A goal is coarser than a feature and outlives many of them. It is ready to cut into features when it fits the project, its end state and signal are pinned, today's distance to it is known, its words match the project's terms, the author has earned it, at least two routes were compared and the one set aside has had its best case heard, the chosen route is broken into ordered parts, and the route has been attacked. Run those moves in that order.

Run it with one sentence, or after talking the goal through. What the conversation already settled is an answer, so the skill asks only what is still open.

Stop at the goal and its route. Do not list features, write specs, or write code. Cutting the route into features is `to-features`. Deciding one feature is `feature-new`, and changing one is `feature-iterate`. What the project is, and its rules, are `project`. A single refactor is `to-implement-spec`.

## When to use

- The user has a direction bigger than one feature: a new kind of user, a new platform, a subsystem to replace, a reliability or speed target.
- `architecture-review` found a direction that spans many modules and needs features of its own.
- An active goal needs review: what has shipped toward it, whether the route still holds, whether it is reached.

## When not to use

- The direction fits in one feature. That is `feature-new` or `feature-iterate`.
- It changes what the project is. That is the opening of `AGENTS.md` (`/project`) or the README, by the user.

## Stance

- Outcome, not output. A goal says what will be true for a user or for the project, not what gets built. "Ship a plugin API" is a part. "Teams extend the editor without forking it" is a goal.
- A goal without a signal never ends. The signal is something someone can observe, and a number when one exists.
- Coarse on purpose. A part names a capability, not a screen, an endpoint, or a module. Detail belongs to the feature skills.
- Today comes from the feature docs and the code, not from memory.
- The glossary's words are the project's words. When the user's word differs from the glossary's for the same concept, name the glossary term and use it from then on.
- Cross-examiner, then interviewer, then advocate for the route set aside, then attacker of the chosen route. Keep the four voices separate.
- The user produces the argument. Do not invent their constraint, their metric, or their rejected alternative.
- The interviewer proposes and the user decides. Every question carries a recommended answer and its reason.
- A thin answer is data. Name it.

## Procedure

1. **Load.** Read what the project says it is, and what already exists toward the goal:

   ```bash
   head -20 AGENTS.md README.md
   ls docs/polaris/ docs/feature/
   rg -il '<subject>|<key term>' docs
   ```

   - **The user named an existing goal**, or asked how one is going: follow [Review](#review).
   - **An active goal overlaps this one.** Name it, and ask whether the two merge or the boundary moves.
2. **Pin the goal.** One sentence: when it is reached, who can do what, or what is true. Then its signal, and its horizon: a rough time frame (weeks, a quarter, a year).
3. **Check the fit.** Quote the line that says what the project is. When the goal contradicts it, ask whether the goal changes or the project does, and stop until the user answers. When nothing says what the project is, ask for one sentence and use it for this run.
4. **Measure today.** From the feature docs and the code: what already serves the goal, with each feature's Status, and what is missing. A few lines, not an inventory.
5. **Align the terms.** Read `docs/GLOSSARY.md` when it exists. For each noun the goal introduces or leans on, follow "Before adding a term" in [references/glossary.md](references/glossary.md). Use the glossary's term in everything after this step. A conflict becomes a question.
6. **Earn the goal** from what the user has already said. The four fields are: the goal, the goal or course they set aside (staying the course counts), the constraint that makes this goal win now, and the cost of being wrong plus the first signal they would see. Ask the missing fields in one turn, with any term conflict, and wait. A thin answer goes on as thin: the route comparison and the grill test it.
7. **Compare routes.** Draft two or three routes, the user's included. A route is an ordered list of parts. For each: what a user gets first, what it risks, what it costs, and what it closes off. Give a head-to-head on the constraints from step 6, and your recommendation. When the user has picked, steelman the route set aside: its best case in one paragraph, the conditions where it wins, and when to revisit.
8. **Shape the parts.** For each part of the chosen route, settle the capability it adds, in glossary terms; its `After`, the parts it needs; the existing features it builds on or changes; and `Done when`, the signal that the part is in place. The first part gives a user something usable end to end, however thin, unless the user decides otherwise. What the goal excludes becomes a `Not this` line. Ask following [Questions](#questions).
9. **Grill the route** as shaped. Surface 3–5 assumptions it is betting on. For each, one scenario where it breaks. Rank them `would-kill` or `would-hurt`. End by asking what would convince them this is the wrong goal or the wrong route.

## Questions

- Ask one to three questions a turn: the ones whose answers do not wait on another open answer.
- Each question carries your recommended answer and its reason, so the user can answer yes. Ask for a decision, not an opinion.
- What the user already said, in this run or earlier in the conversation, is an answer. Do not ask it again.
- There is no fixed number of turns. Questions end when the goal, its signal, the route, and every part are settled.
- When the user stops early, list the open items and write nothing. The doc states a decided goal.

For "make the app work offline":

```
1. Signal: what would show the goal is reached?
   Recommended: a field user can record a visit with no connection, and it syncs within a minute of reconnecting, because field users are who asked (said earlier).
2. Horizon: one quarter?
   Recommended: yes. The sync engine is the long part (src/sync/ has no queue today), and a quarter fits one route.
```

Not: "What does offline mean to you?" It offers no answer to confirm or correct.

## Review

For an active goal in `docs/polaris/<slug>.md`:

1. Read the goal, and the Status of each feature doc its `## Features` links. Report progress per part: features shipped, decided, and not yet decided.
2. Check the signal. When it holds, ask whether the goal is reached. On yes, set `Status: reached`.
3. When the user wants a different route or new parts, run steps 7–9 on what has not shipped. Parts and features already decided stay unless the user drops them. The next step is `/to-features <slug>`, which revises the unlinked feature lines.
4. A goal the user drops: delete its doc. Its decided features keep their own docs.

## Output

When step 1 or 3 stops, give its finding and the question. When step 6 asks, give only the missing fields and any term conflict. During steps 7 and 8, each turn gives the routes or the parts, and its questions. When everything is settled:

```
## Goal
<one sentence>
Signal: …
Horizon: …

## Fit
Project: "<the line that says what the project is>" (<file>)
Fits: yes | no: "<the line it contradicts>" (<file>)

## Today
Serves the goal: <feature docs, each with its Status> | none
Missing: …

## Terms
Uses: <glossary terms>
New: **<Term>**: <draft definition>
Resolved: "<word>" → **<Term>**

## The argument
Goal: …
Set aside: …
Winning constraint: …
Cost of being wrong / first signal: …
Verdict: strong | thin | missing <piece>

## Routes
| Route | A user gets first | Risk | Cost | Closes off |
| --- | --- | --- | --- | --- |
| … | … | … | … | … |

Chosen: <route>, because <constraint>.
Steelman of <route set aside>: <one paragraph>
Wins when: …
Revisit when: …

## Parts
1. <Part>: <capability>. After: none. Builds on: <feature docs> | none. Done when: …
2. …

Not this:
- …

## The grill
Route as it stands: <one line>

Assumptions:
1. <assumption> — <concrete way it breaks>

Failure scenarios:
1. [would-kill] …
2. [would-hurt] …

What would change your mind?
```

Leave out a line with nothing to say.

## After confirmation

When the user accepts the goal:

1. Write `docs/polaris/<slug>.md` with the template in [references/polaris-doc.md](references/polaris-doc.md). Status is `active`. Leave out `## Features`: `to-features` writes it.
2. Update `docs/GLOSSARY.md` with each new term and each resolved conflict, following [references/glossary.md](references/glossary.md). Create the file when it is missing.

The next step is `/to-features <slug>`.

Until the user accepts, write nothing.

## Source

The argument, the steelman, and the grill are adapted from `convince-me`, `steelman`, and `grill-me` by [rahul-kulkarni105/skills](https://github.com/rahul-kulkarni105/skills) (CC BY 4.0, https://creativecommons.org/licenses/by/4.0/). This file applies them to a goal and its route. The glossary format in `references/glossary.md` is adapted from `domain-modeling` by [mattpocock/skills](https://github.com/mattpocock/skills) (MIT, see `LICENSE`).
