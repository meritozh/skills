---
name: feature-iterate
description: Move an existing feature forward. Load its doc and its code as they stand, pin what changes against what must not and what depends on today's behavior, align the words with docs/GLOSSARY.md, then make the author earn the change, steelman the option they rejected (by default, leaving the feature as it is), and grill the change where it meets today's callers, users, and data. After the user confirms, update docs/feature/<slug>.md in place and the glossary. Use when the user wants to change, extend, or narrow a feature that exists. A feature that does not exist yet is feature-new.
disable-model-invocation: true
---

# feature-iterate

User-invoked only: follow this skill only when the user ran `/feature-iterate`. When the work belongs to another skill, name it (for example `/feature-new`), say why, and stop. Do not invoke it yourself.

An existing feature already has users, callers, and stored data shaped by what it does today. A change is ready to build when its difference from today is pinned, the feature still fits the project, its words match the project's terms, the author has earned the change, the option they dismissed has had its best case heard, and the change has been attacked where it meets what already depends on the feature. Run those moves in that order.

Stop at the decision. Do not write a module design, an implementation plan, or code. A feature that does not exist yet is `feature-new`. Module design is `design-code`. A diff review is `diff-review`. A bug is `code-fix`. A whole-codebase review is `codebase-review`. Repo principles are `project`.

## When to use

- The user wants an existing feature to do more, less, or something different.
- The user asks to pressure-test a change to a feature before building it.
- A strong preference for a change shows up without a reason ("let's just make X do Y").

## When not to use

- Nothing like it exists yet, in a doc or in the code. That is `feature-new`.
- The code does not do what a `shipped` feature doc says, and the doc is right. That is a bug: `code-fix`.
- The change is trivial, reversible, and changes nothing a user, caller, or stored record can see.

## Stance

- Today's behavior comes from the code and the doc, not from memory. When they disagree, say where, and ask which is right before going on.
- Today's behavior is a real option. When the user names no other alternative, leaving the feature as it is stands as the rejected option. That is not inventing an alternative: it exists.
- The glossary's words are the project's words. When the user's word differs from the glossary's for the same concept, name the glossary term and use it from then on.
- Cross-examiner, then advocate for the rejected option, then attacker of the change. Keep the three voices separate.
- The user produces the argument. Do not invent their constraint, their metric, or a rejected alternative other than today's behavior.
- "It's better" is not an answer. Ask better at what, measured how, and for whom among today's users.
- In the grill, attack the strongest version of the change. Cite the assumption, then a concrete failure: the caller, the stored record, the user who notices.
- A thin answer is data. Name it.

## Procedure

1. **Load the feature.** Find its doc and its code:

   ```bash
   ls docs/feature/ docs/idea/
   rg -il '<subject>|<key term>' docs
   rg -n '<entry point>|<key term>' . --glob '!{node_modules,dist,build,vendor,target,docs}/**'
   ```

   - **No doc and no code.** That is `feature-new`. Say so and stop.
   - **Code but no doc.** Write down the feature as it stands today, from the code: its behavior, limits, and what it does not do. Show it as the baseline. It becomes the doc once the change is confirmed.
   - **An older `docs/idea/<slug>.md`** for the feature holds its decisions. Read it with the feature doc. It is folded in after confirmation.
   - **Status `decided`.** The doc is ahead of the code: an earlier change is not built yet. Say so. The new change builds on the doc, not on the code.
   - **Status `shipped`, and doc and code disagree.** Say where, and ask which is right.
2. **Pin the delta.** Restate the change in one sentence: from <today> to <after>. Then list:
   - What changes: behavior, entry, limits, and `## Not this` lines.
   - What must not change: the behavior the user wants kept.
   - What depends on today's behavior: callers (`rg` the entry points), other feature docs that mention it, stored data and its shape, and outside users such as API clients, saved files, and links.
   - What `### Project status` in `AGENTS.md` allows for this change: whether it may break callers, and whether stored data must migrate.
3. **Check the fit.** The feature after the change still fits what the project says it is (`head -20 AGENTS.md README.md`). Removing a `## Not this` line widens the feature's scope; name it as a decision of its own. A change that reaches into another feature's scope: name that doc, and ask whether the two merge or the boundary moves.
4. **Align the terms.** Read `docs/GLOSSARY.md` when it exists. For each noun the change introduces, renames, or leans on, follow [references/glossary.md](references/glossary.md). Use the glossary's term in everything after this step. A conflict becomes a question in this round.
5. **Earn the change** from what the user has already said. The five fields are: the change, the alternative they rejected (today's behavior when they named none), the constraint that makes the change win, the migration cost (what today's users, callers, and stored data go through), and the cost of being wrong plus the first signal they would see. A bare preference with none of these gets the unanswered questions and nothing else. When they have stated the change, or they asked for the full test, fill the fields you can, mark the rest `missing`, and continue.
6. **Steelman the rejected option.** One paragraph in its best-case form. When it is today's behavior, argue for leaving the feature alone: what its users rely on, what the change costs them, and what smaller fix exists inside the current shape. Three reasons a thoughtful practitioner would pick it. The strongest counter to the change from that view. A head-to-head on which constraint favours which side. The conditions under which they should revisit the rejection.
7. **Grill the change** as it stands after the head-to-head, aimed at what depends on today's behavior. Surface 3–5 assumptions the earned argument is betting on. For each, one scenario where it breaks. Rank them `would-kill` or `would-hurt`. End by asking what would convince them this is the wrong call.

One round of questions. After they answer, write the full output even if a field stays thin.

A bare preference gets only its missing fields as questions. For "let's just add line items to the CSV export":

```
- Rejected: what else did you consider: a second export for line items, or keeping the export as it is?
- Winning constraint: who needs line items in the same file, and what do they do with it that two files would break?
- Migration cost: people who import today's file will get a different shape. Who are they, and what do they have to change?
- Cost of being wrong: if a downstream import breaks, where would it show up first?
```

Not: "Are you sure the export should change?" That asks for a verdict, not a reason.

## Output

When step 1 stops, give its finding. When step 5 stops for a bare preference, ask only the missing questions, plus any open question from steps 1–4. Otherwise:

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
Conflict: "<word>" means <x> here; the glossary says <y>

## The argument
Change: …
Rejected: <option> (today's behavior | named by the user)
Winning constraint: …
Migration cost: …
Cost of being wrong / first signal: …
Verdict: strong | thin | missing <piece>

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

## The grill
Change as it stands: <one line>

Assumptions:
1. <assumption> — <concrete way it breaks>

Failure scenarios:
1. [would-kill] …
2. [would-hurt] …

What would change your mind?
```

Leave out a `## Terms` line with nothing to say.

## After confirmation

When the user accepts the change:

1. Update `docs/feature/<slug>.md` in place, so it states the feature as it stands after the change:
   - Replace every line the change makes untrue: the summary, `## Behavior`, and `## Not this`. Do not append "previously", "now", or a changelog. History lives in git.
   - When the change was a real choice with a rejected option, add a `###` entry under `## Decisions`. When it overturns an earlier decision, replace that entry instead.
   - Set Status to `decided`. The commit that makes the code do what the doc says sets `shipped`.
   - With no doc yet, write one from the baseline plus the change, with the template below.
   - Fold an older `docs/idea/<slug>.md` into `## Decisions`, and delete it in the same change.
   - When the slug no longer names the feature, rename the file with `git mv` and update every link to it.
2. Update `docs/GLOSSARY.md` with each new term, rename, and resolved conflict, following [references/glossary.md](references/glossary.md). Create the file when it is missing.
3. When another feature doc states something the change makes untrue, update that line too.

Do not write `docs/design/`. When the change needs a new module or a changed interface, the next step is `design-code`. Otherwise the next step is implementation.

```markdown
# <Feature title>

<One sentence: who can do what.>

Status: decided

## Behavior

- Entry: <where a user starts it: a command, a screen, an endpoint>
- Does: <what happens, in glossary terms>
- Limits: <sizes, rates, permissions, what it refuses>

## Decisions

### <Short title>

<One to three sentences: the decision and the constraint that makes it win.>

- Rejected: <the alternative>, which wins instead when <its condition>.
- Wrong-call signal: <the first thing someone would see if this turns out to be the wrong call>.

## Not this

- <what the feature explicitly excludes>
```

The file states the feature as decided. Do not add a history of the debate, a plan, or next steps. Leave out a section with nothing to say.

Until the user accepts, write nothing.

## Source

Adapted from `convince-me`, `grill-me`, and `steelman` by [rahul-kulkarni105/skills](https://github.com/rahul-kulkarni105/skills) (CC BY 4.0, https://creativecommons.org/licenses/by/4.0/). Those three names are not separate skills in this collection. This file runs their moves as one ordered test of a change to an existing feature. The glossary format in `references/glossary.md` is adapted from `domain-modeling` by [mattpocock/skills](https://github.com/mattpocock/skills) (MIT, see `LICENSE`).
