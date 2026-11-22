---
name: feature-iterate
description: Move an existing feature forward, from a one-line goal or from a change already talked through. Load its doc and its code as they stand, pin what changes against what must not and what depends on today's behavior, align the words with docs/GLOSSARY.md, make the author earn the change, then shape every behavior the change touches and what each dependent meets afterward, asking with a recommended answer and reading the code instead of asking where it can. Steelman the option they rejected (by default, leaving the feature as it is) and grill the change where it meets today's callers, users, and data. After the user confirms, update docs/feature/<slug>.md in place and the glossary. Use when the user wants to change, extend, or narrow a feature that exists. A feature that does not exist yet is feature-new.
disable-model-invocation: true
---

# feature-iterate

User-invoked only: follow this skill only when the user ran `/feature-iterate`. When the work belongs to another skill, name it (for example `/feature-new`), say why, and stop. Do not invoke it yourself.

An existing feature already has users, callers, and stored data shaped by what it does today. A change is ready to build when its difference from today is pinned, the feature still fits the project, its words match the project's terms, the author has earned the change, every behavior it touches is decided for after the change, the option they dismissed has had its best case heard, and the change has been attacked where it meets what already depends on the feature. Run those moves in that order.

Run it at the start, with one sentence, or after talking the change through. Either way it takes the change from where the conversation stands to an updated doc. What the conversation already settled is an answer, so the skill asks only what is still open.

Stop at the decision. Do not write an implement spec, an implementation plan, or code. A feature that does not exist yet is `feature-new`. An implement spec is `to-implement-spec`. A diff review is `diff-review`. A bug is `code-bugfix`. A whole-codebase review is `architecture-review`. Repo principles are `project`.

## When to use

- The user wants an existing feature to do more, less, or something different, even as one sentence with nothing worked out.
- The user has talked a change through and wants it tested and written down.
- A strong preference for a change shows up without a reason ("let's just make X do Y").

## When not to use

- Nothing like it exists yet, in a doc or in the code. That is `feature-new`.
- The code does not do what a `shipped` feature doc says, and the doc is right. That is a bug: `code-bugfix`.
- The change is trivial, reversible, and changes nothing a user, caller, or stored record can see.

## Stance

- Today's behavior comes from the code and the doc, not from memory. When they disagree, say where, and ask which is right before going on.
- Today's behavior is a real option. When the user names no other alternative, leaving the feature as it is stands as the rejected option. That is not inventing an alternative: it exists.
- The glossary's words are the project's words. When the user's word differs from the glossary's for the same concept, name the glossary term and use it from then on.
- Cross-examiner, then interviewer, then advocate for the rejected option, then attacker of the change. Keep the four voices separate.
- The user produces the argument. Do not invent their constraint, their metric, or a rejected alternative other than today's behavior.
- The interviewer proposes and the user decides. Every question carries a recommended answer and its reason. A behavior the user has not confirmed is not settled.
- "It's better" is not an answer. Ask better at what, measured how, and for whom among today's users.
- In the grill, attack the shaped change. Cite the assumption, then a concrete failure: the caller, the stored record, the user who notices.
- A thin answer is data. Name it.

## Procedure

1. **Load the feature.** Find its doc and its code:

   ```bash
   ls docs/feature/ docs/idea/
   rg -il '<subject>|<key term>' docs
   rg -n '<entry point>|<key term>' . --glob '!{node_modules,dist,build,vendor,target,docs}/**'
   ```

   - **No doc and no code.** That is `feature-new`. Say so and stop.
   - **Code but no doc.** Write down the feature as it stands today, from the code, item by item of the shape in [references/feature-doc.md](references/feature-doc.md). Show it as the baseline. It becomes the doc once the change is confirmed.
   - **An older `docs/idea/<slug>.md`** for the feature holds its decisions. Read it with the feature doc. It is folded in after confirmation.
   - **Status `decided`.** The doc is ahead of the code: an earlier change is not built yet. Say so. The new change builds on the doc, not on the code.
   - **`docs/spec/<slug>.md` exists.** That earlier change is being built now. Say so, and find the steps that already landed, the commits with the trailer `Spec-Step: <slug>#<n>`: the spec must catch up with this change before the work goes on.
   - **Status `shipped`, and doc and code disagree.** Say where, and ask which is right.
2. **Pin the delta.** Restate the change in one sentence: from <today> to <after>. Then list:
   - What changes: behavior, entry, limits, and `## Not this` lines.
   - What must not change: the behavior the user wants kept.
   - What depends on today's behavior: callers (`rg` the entry points), other feature docs that mention it, stored data and its shape, and outside users such as API clients, saved files, and links.
   - What `### Project status` in `AGENTS.md` allows for this change: whether it may break callers, and whether stored data must migrate.
3. **Check the fit.** The feature after the change still fits what the project says it is (`head -20 AGENTS.md README.md`). Removing a `## Not this` line widens the feature's scope; name it as a decision of its own. A change that reaches into another feature's scope: name that doc, and ask whether the two merge or the boundary moves.
4. **Align the terms.** Read `docs/GLOSSARY.md` when it exists. For each noun the change introduces, renames, or leans on, follow [references/glossary.md](references/glossary.md). Use the glossary's term in everything after this step. A conflict becomes a question.
5. **Earn the change** from what the user has already said. The five fields are: the change, the alternative they rejected (today's behavior when they named none), the constraint that makes the change win, the migration cost (what today's users, callers, and stored data go through), and the cost of being wrong plus the first signal they would see. Ask the missing fields in one turn, with any term conflict, and wait. When the user asked for the full test without them, mark them `missing` and go on. A thin answer goes on as thin: the steelman and the grill test it.
6. **Shape the change.** Walk the shape in [references/feature-doc.md](references/feature-doc.md) over the feature as it will stand after the change.
   - Start each item from today's line, from the doc or step 1's baseline, and mark it `same` or `changes`. Settle the after-state of every item that changes.
   - Settle what each dependent from step 2 meets after the change: a caller's new contract, what each stored record becomes, what an outside user notices. `### Project status` bounds the answers.
   - Fill what is known first, from the conversation, the feature docs, and the code. A question the code or a doc answers is not one for the user: look it up, and cite where.
   - Ask about the rest following [Questions](#questions), the items others depend on first.
   - A real choice has two reasonable answers, and the wrong one is costly to undo or would surprise a user. Mark it as a decision: the chosen answer, the rejected one, and the first sign the choice was wrong.
   - A part the user leaves out of this change keeps today's behavior, or becomes a `Not this` line.
   - Each turn shows the shape: every changing item and every dependent `settled` (from where: said, code, or doc), `proposed`, or `open`.
7. **Steelman the rejected option.** One paragraph in its best-case form. When it is today's behavior, argue for leaving the feature alone: what its users rely on, what the change costs them, and what smaller fix exists inside the current shape. Three reasons a thoughtful practitioner would pick it. The strongest counter to the change from that view. A head-to-head on which constraint favours which side. The conditions under which they should revisit the rejection. Then, for each decision marked in step 6, give the rejected answer's best case in one or two sentences, and when it would win.
8. **Grill the change** as shaped, after the head-to-head, aimed at what depends on today's behavior. Surface 3–5 assumptions the shape and the argument are betting on. For each, one scenario where it breaks. Rank them `would-kill` or `would-hurt`. End by asking what would convince them this is the wrong call.

## Questions

- Ask one to three questions a turn: the ones whose answers do not wait on another open answer.
- Each question carries your recommended answer and its reason, so the user can answer yes. Ask for a decision, not an opinion.
- What the user already said, in this run or earlier in the conversation, is an answer. Do not ask it again.
- There is no fixed number of turns. Questions end when every changing item and every dependent is settled, or is a `Not this` line.
- When the user stops early, list the open items and write nothing. The doc states a decided feature, and a change with open items is not decided.

A bare preference gets only its missing fields as questions. For "let's just add line items to the CSV export":

```
- Rejected: what else did you consider: a second export for line items, or keeping the export as it is?
- Winning constraint: who needs line items in the same file, and what do they do with it that two files would break?
- Migration cost: people who import today's file will get a different shape. Who are they, and what do they have to change?
- Cost of being wrong: if a downstream import breaks, where would it show up first?
```

Not: "Are you sure the export should change?" That asks for a verdict, not a reason.

A shape turn, later in the same run:

```
Shape: 3 of 5 settled. Open: Does, the nightly import.

1. Does: today one row is one order. After the change, is one row one line item, with the order's columns repeated?
   Recommended: yes, because the spreadsheets that read it filter by product (said earlier).
2. Dependent: the nightly import reads one row per order (scripts/import-orders.ts:58). What does it get after the change?
   Recommended: today's file stays under its old name until the import moves, because Project status is `release` and a breaking change needs a migration path.
```

Not: "Will this affect anything else?" Step 2 already found what it affects; ask what each one gets.

## Output

When step 1 stops, give its finding. When step 5 asks, give only the missing fields, plus any open question from steps 1–4. During step 6, each turn gives the shape and its questions, as above. When the shape is done:

```
## Today
Feature: <docs/feature/<slug>.md, or "no doc: baseline from <code paths>">
Status: shipped | decided
Behavior today: <one or two lines>

## The delta
From: …
To: …
Kept: …
Depends on today: <callers, docs, stored data, outside users>
Project status: <status>: <what it allows for this change>

## Fit
Fits: yes | <scope change or collision, with the quoted line and file>

## Terms
Uses: <glossary terms>
New: **<Term>**: <draft definition>
Renamed: <old word> → **<Term>**
Resolved: "<word>" → **<Term>**

## The argument
Change: …
Rejected: <option> (today's behavior | named by the user)
Winning constraint: …
Migration cost: …
Cost of being wrong / first signal: …
Verdict: strong | thin | missing <piece>

## The shape
<item>: <today> → <after>, for each item that changes
Same: <items that do not change>
Dependents:
- <caller, stored data, or outside user>: <what it meets after the change>
Meets: <other feature doc>: <the line this change makes untrue> | none
Decisions:
- <question>: <chosen> over <rejected>. Wrong-call signal: …

## The steelman
<one paragraph>

Three reasons a thoughtful practitioner picks <rejected option>:
1. …
2. …
3. …

Counter to the change from that view:
- …

Head-to-head:
- <constraint> favours: <option>

When to revisit: …

Rejected answers in the shape:
- <question>: <rejected answer> wins when …

## The grill
Change as it stands: <one line>

Assumptions:
1. <assumption> — <concrete way it breaks>

Failure scenarios:
1. [would-kill] …
2. [would-hurt] …

What would change your mind?
```

Leave out a line with nothing to say.

## After confirmation

When the user accepts the change:

1. Update `docs/feature/<slug>.md` in place, so it states the feature as it stands after the change. [references/feature-doc.md](references/feature-doc.md) gives its form.
   - Replace every line the change makes untrue: the summary, each changed `## Behavior` line, and `## Not this`. Do not append "previously", "now", or a changelog. History lives in git.
   - Add a `###` entry under `## Decisions` for the change itself when it was a real choice with a rejected option, and for each decision marked in step 6. When one overturns an earlier decision, replace that entry instead.
   - Set Status to `decided`. The commit that makes the code do what the doc says sets `shipped`.
   - With no doc yet, write one from the baseline plus the change, with the template.
   - Fold an older `docs/idea/<slug>.md` into `## Decisions`, and delete it in the same change.
   - When the slug no longer names the feature, rename it and its open `docs/spec/<slug>.md` with `git mv`, and update every link to them. Leave archived specs as they are. When the spec has landed steps, rename after the feature ships instead: those commits name the old slug.
2. Update `docs/GLOSSARY.md` with each new term, rename, and resolved conflict, following [references/glossary.md](references/glossary.md). Create the file when it is missing.
3. For each `Meets` line, update the line of that other feature doc that the change makes untrue.

Do not write `docs/spec/`. The next step is `to-implement-spec`, which brings the feature's spec in line with the changed doc, then implementation.

Until the user accepts, write nothing.

## Source

Adapted from `convince-me`, `grill-me`, and `steelman` by [rahul-kulkarni105/skills](https://github.com/rahul-kulkarni105/skills) (CC BY 4.0, https://creativecommons.org/licenses/by/4.0/). Those three names are not separate skills in this collection. This file runs their moves as one ordered test of a change to an existing feature, with a shaping interview between the argument and the test. The glossary format in `references/glossary.md` is adapted from `domain-modeling` by [mattpocock/skills](https://github.com/mattpocock/skills) (MIT, see `LICENSE`).
