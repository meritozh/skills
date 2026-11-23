---
name: feature-new
description: "Decide a new feature before it is built, from a one-line idea or a proposal already talked through: check that it fits the project, make the author earn it, shape every behavior a user will meet by asking with recommended answers, pressure-test it, then write docs/feature/<slug>.md and the glossary. Use when the user wants the project to do something it cannot do yet and the feature is not decided (想加一个功能, 设计一个新 feature), or picks a New line from a goal's ## Features. Not when they ask to build something already decided, for a small reversible change, or for changing an existing feature, which is feature-iterate."
---

# feature-new

Run this skill when the user ran `/feature-new`, or when the request matches [When to use](#when-to-use). When you start it without `/feature-new`, say so in one line, with the reason, so the user can redirect. When the work belongs to another skill, say which and why: switch to it when you can invoke it, otherwise name it for the user (for example `/to-implement-spec`) and stop.

A new feature is ready to build when it fits the project, nothing already covers it, its words match the project's terms, the author has earned it, every behavior a user will meet is decided, the option they dismissed has had its best case heard, and the shaped feature has been attacked. Run those moves in that order. A feature that does not fit is not shaped. A feature that already exists is an iteration.

Run it at the start, with one sentence, or after talking the feature through. Either way it takes the feature from where the conversation stands to a decided doc. What the conversation already settled is an answer, so the skill asks only what is still open.

Stop at the decision. Do not write an implement spec, an implementation plan, or code. Changing a feature that already exists is `feature-iterate`. An implement spec is `to-implement-spec`. A diff review is `diff-review`. A bug is `code-bugfix`. A whole-codebase review is `architecture-review`. Repo principles are `project`.

## When to use

- The user wants the project to do something it cannot do yet, even as one sentence with nothing worked out.
- The user has talked a new feature through and wants it tested and written down.
- A strong preference for a new feature shows up without a reason ("let's just add X").
- A line marked `New` in a goal's `## Features`, written by `to-features`.

## When not to use

- The feature exists, in a doc or in the code, and the user wants it to work differently. That is `feature-iterate`.
- They asked to build, explain, or debug the thing, not to decide it.
- The addition is trivial, reversible, and changes nothing a user can see.

## Stance

- Cross-examiner, then interviewer, then advocate for the rejected option, then attacker of the feature. Keep the four voices separate.
- What the project says it is comes first. Do not stretch it to fit the feature. Quote it.
- The glossary's words are the project's words. When the user's word differs from the glossary's for the same concept, name the glossary term and use it from then on.
- The user produces the argument. Do not invent their constraint, their metric, or their rejected alternative.
- The interviewer proposes and the user decides. Every question carries a recommended answer and its reason. A behavior the user has not confirmed is not settled.
- "It's better" is not an answer. Ask better at what, measured how.
- In the steelman, side with the rejected option. Voice a practitioner who chose it on purpose, and name the constraints where it is the right call. If that option is genuinely bad, say so and do not invent merits.
- In the grill, attack the shaped feature. Cite the assumption, then a concrete failure: the system, the input, the person who notices.
- A thin answer is data. Name it.

## Procedure

1. **Restate** the feature in one sentence: who can do what that they cannot do now. If you cannot tell, ask, and stop.
2. **Check the fit.** Read what the project says it is and what it already does:

   ```bash
   head -20 AGENTS.md README.md                 # what the project says it is
   ls docs/feature/ docs/idea/ docs/polaris/    # features already decided, and goals
   rg -il '<subject>|<key term>' docs
   rg -n '<key term>' . --glob '!{node_modules,dist,build,vendor,target,docs}/**'
   ```

   - **Covered.** A feature doc, an older `docs/idea/` doc, or the code already does it. That is `feature-iterate`. Name the file or the code, and stop.
   - **From a goal.** The feature is a line in an active goal's `## Features`. Read the goal: the feature serves its part, and the line's sentence is where the restatement starts.
   - **Outside.** The feature contradicts what the project says it is, a `## Not this` line of an existing feature, or a `## Not this` line of an active goal. Quote the line and its file, ask whether the feature changes or the project does, and stop until the user answers. What the project says it is changes in `AGENTS.md` (`/project`) or the README, by the user.
   - **No description.** When neither `AGENTS.md` nor the README says what the project is, ask for one sentence and use it for this run.
3. **Align the terms.** Read `docs/GLOSSARY.md` when it exists. For each noun the feature introduces or leans on, follow "Before adding a term" in [references/glossary.md](references/glossary.md). Use the glossary's term in everything after this step. Draft an entry for each new term. A conflict becomes a question.
4. **Earn the choice** from what the user has already said. The four fields are: the decision, the alternative they rejected, the constraint that makes the chosen option win, and the cost of being wrong plus the first signal they would see. Ask the missing fields in one turn, with any term conflict, and wait. When the user asked for the full test without them, mark them `missing` and go on. A thin answer goes on as thin: the steelman and the grill test it.
5. **Shape the behavior.** Settle every item of the shape in [references/feature-doc.md](references/feature-doc.md), for the feature as a user will meet it.
   - Fill what is known first, from the conversation, the feature docs, and the code. A question the code or a doc answers is not one for the user: look it up, and cite where.
   - Ask about the rest following [Questions](#questions), the items others depend on first: Who and Entry before Does, and Does before Fails, Limits, and Keeps.
   - A real choice has two reasonable answers, and the wrong one is costly to undo or would surprise a user. Mark it as a decision: the chosen answer, the rejected one, and the first sign the choice was wrong.
   - An item the user leaves out of this feature becomes a `Not this` line.
   - Each turn shows the shape: every item `settled` (from where: said, code, or doc), `proposed`, or `open`.
6. **Steelman the rejected option.** One paragraph in its best-case form. Three reasons a thoughtful practitioner would pick it. The strongest counter to the chosen feature from that view. A head-to-head on which constraint favours which side. The conditions under which they should revisit the rejection. If step 4 still has no rejected alternative, write that this move is blocked. Then, for each decision marked in step 5, give the rejected answer's best case in one or two sentences, and when it would win.
7. **Grill the feature** as shaped, after the head-to-head. Surface 3–5 assumptions the shape and the argument are betting on. For each, one scenario where it breaks. Rank them `would-kill` or `would-hurt`. End by asking what would convince them this is the wrong call.

## Questions

- Ask one to three questions a turn: the ones whose answers do not wait on another open answer.
- Each question carries your recommended answer and its reason, so the user can answer yes. Ask for a decision, not an opinion.
- What the user already said, in this run or earlier in the conversation, is an answer. Do not ask it again.
- There is no fixed number of turns. Questions end when every item of the shape is settled or is a `Not this` line.
- When the user stops early, list the open items and write nothing. The doc states a decided feature, and a feature with open items is not decided.

A bare preference gets only its missing fields as questions. For "let's just add a CSV export of orders":

```
- Rejected: what else did you consider for getting orders out (an API endpoint, a scheduled report, a BI connector)?
- Winning constraint: what about the people exporting makes a CSV file win: they work in spreadsheets, the data is small, or something else?
- Cost of being wrong: if the export times out on the largest accounts, who notices first, and what do they do instead?
```

Not: "Have you thought about whether CSV export is the right feature?" That asks for a verdict, not a reason.

A shape turn, later in the same run:

```
Shape: 5 of 8 settled. Proposed: Limits. Open: Fails, Keeps.

1. Fails: an export of the largest account runs past the 30-second request timeout (src/http/server.ts:41). What does the user get?
   Recommended: the export runs in the background and the user gets an email with a link, because those accounts hold up to 200,000 orders.
2. Keeps: how long does a finished export stay downloadable?
   Recommended: 7 days, then it is deleted, the same as invoice PDFs (docs/feature/invoice-pdf.md).
```

Not: "What should happen on errors?" It names no case and offers no answer.

## Output

When step 2 stops, give its finding and the question. When step 4 asks, give only the missing fields and any term conflict. During step 5, each turn gives the shape and its questions, as above. When the shape is done:

```
## Fit
Project: "<the line that says what the project is>" (<file>)
Fits: yes | no: "<the line it contradicts>" (<file>)
Covered by: none (checked <docs and searches>)

## Terms
Uses: <glossary terms>
New: **<Term>**: <draft definition>
Resolved: "<word>" → **<Term>**

## The argument
Decision: …
Rejected: …
Winning constraint: …
Cost of being wrong / first signal: …
Verdict: strong | thin | missing <piece>

## The shape
<each Behavior line, as it will read in the doc>
Meets: <feature doc>: <the line this feature makes untrue> | none
Not this: …
Decisions:
- <question>: <chosen> over <rejected>. Wrong-call signal: …

## The steelman
<one paragraph, or "blocked: no rejected alternative">

Three reasons a thoughtful practitioner picks <rejected option>:
1. …
2. …
3. …

Counter to the chosen feature from that view:
- …

Head-to-head:
- <constraint> favours: <option>

When to revisit: …

Rejected answers in the shape:
- <question>: <rejected answer> wins when …

## The grill
Feature as it stands: <one line>

Assumptions:
1. <assumption> — <concrete way it breaks>

Failure scenarios:
1. [would-kill] …
2. [would-hurt] …

What would change your mind?
```

Leave out a line with nothing to say.

## After confirmation

When the user accepts the feature:

1. Write `docs/feature/<slug>.md` with the template in [references/feature-doc.md](references/feature-doc.md). Each shape item becomes its `## Behavior` line, each decision a `## Decisions` entry, and each excluded item a `## Not this` line.
2. Update `docs/GLOSSARY.md` with each new term and each resolved conflict, following [references/glossary.md](references/glossary.md). Create the file when it is missing.
3. For each `Meets` line, update the line of that other feature doc that this feature makes untrue.
4. When the feature is a line in a goal's `## Features`, replace the line's sentence with a link to the feature doc. Keep its number, Part, and After.

Do not write `docs/spec/`. The next step is `to-implement-spec`. The spec it writes carries the work to `shipped`. To have a strict reviewer with fresh eyes attack the doc first, the user runs `/batman <slug>`.

Until the user accepts, write nothing.

## Source

Adapted from `convince-me`, `grill-me`, and `steelman` by [rahul-kulkarni105/skills](https://github.com/rahul-kulkarni105/skills) (CC BY 4.0, https://creativecommons.org/licenses/by/4.0/). Those three names are not separate skills in this collection. This file runs their moves as one ordered test of a new feature, with a shaping interview between the argument and the test. The glossary format in `references/glossary.md` is adapted from `domain-modeling` by [mattpocock/skills](https://github.com/mattpocock/skills) (MIT, see `LICENSE`).
