---
name: feature-new
description: Decide a new feature before it is built. Check that it fits what the project says it is and that nothing already covers it, align its words with docs/GLOSSARY.md, then make the author earn the choice, steelman the option they rejected, and grill the strongest version. After the user confirms, write docs/feature/<slug>.md and update the glossary. Use when the user wants the project to do something it cannot do yet. Changing an existing feature is feature-iterate.
disable-model-invocation: true
---

# feature-new

User-invoked only: follow this skill only when the user ran `/feature-new`. When the work belongs to another skill, name it (for example `/feature-iterate`), say why, and stop. Do not invoke it yourself.

A new feature is ready to build when it fits the project, nothing already covers it, its words match the project's terms, the author has earned it, the option they dismissed has had its best case heard, and the strongest version of the feature has been attacked. Run those moves in that order. A feature that does not fit is not pressure-tested. A feature that already exists is an iteration.

Stop at the decision. Do not write an implement spec, an implementation plan, or code. Changing a feature that already exists is `feature-iterate`. An implement spec is `to-implement-spec`. A diff review is `diff-review`. A bug is `code-fix`. A whole-codebase review is `codebase-review`. Repo principles are `project`.

## When to use

- The user wants the project to do something it cannot do yet.
- The user asks to pressure-test a new feature before building it.
- A strong preference for a new feature shows up without a reason ("let's just add X").

## When not to use

- The feature exists, in a doc or in the code, and the user wants it to work differently. That is `feature-iterate`.
- They asked to build, explain, or debug the thing, not to decide it.
- The addition is trivial, reversible, and changes nothing a user can see.

## Stance

- Cross-examiner, then advocate for the rejected option, then attacker of the feature. Keep the three voices separate.
- What the project says it is comes first. Do not stretch it to fit the feature. Quote it.
- The glossary's words are the project's words. When the user's word differs from the glossary's for the same concept, name the glossary term and use it from then on.
- The user produces the argument. Do not invent their constraint, their metric, or their rejected alternative.
- "It's better" is not an answer. Ask better at what, measured how.
- In the steelman, side with the rejected option. Voice a practitioner who chose it on purpose, and name the constraints where it is the right call. If that option is genuinely bad, say so and do not invent merits.
- In the grill, attack the strongest version of the feature. Cite the assumption, then a concrete failure: the system, the input, the person who notices.
- A thin answer is data. Name it.

## Procedure

1. **Restate** the feature in one sentence: who can do what that they cannot do now. If you cannot tell, ask, and stop.
2. **Check the fit.** Read what the project says it is and what it already does:

   ```bash
   head -20 AGENTS.md README.md                 # what the project says it is
   ls docs/feature/ docs/idea/                  # features already decided
   rg -il '<subject>|<key term>' docs
   rg -n '<key term>' . --glob '!{node_modules,dist,build,vendor,target,docs}/**'
   ```

   - **Covered.** A feature doc, an older `docs/idea/` doc, or the code already does it. That is `feature-iterate`. Name the file or the code, and stop.
   - **Outside.** The feature contradicts what the project says it is, or a `## Not this` line of an existing feature. Quote the line and its file, ask whether the feature changes or the project does, and stop until the user answers. What the project says it is changes in `AGENTS.md` (`/project`) or the README, by the user.
   - **No description.** When neither `AGENTS.md` nor the README says what the project is, ask for one sentence and use it for this run.
3. **Align the terms.** Read `docs/GLOSSARY.md` when it exists. For each noun the feature introduces or leans on, follow "Before adding a term" in [references/glossary.md](references/glossary.md). Use the glossary's term in everything after this step. Draft an entry for each new term. A conflict becomes a question in this round.
4. **Earn the choice** from what the user has already said. The four fields are: the decision, the alternative they rejected, the constraint that makes the chosen option win, and the cost of being wrong plus the first signal they would see. A bare preference with none of these gets the unanswered questions and nothing else. When they have stated the feature and a rejected alternative, or they asked for the full test, fill the fields you can, mark the rest `missing`, and continue.
5. **Steelman the rejected option.** One paragraph in its best-case form. Three reasons a thoughtful practitioner would pick it. The strongest counter to the chosen feature from that view. A head-to-head on which constraint favours which side. The conditions under which they should revisit the rejection. If step 4 still has no rejected alternative, write that this move is blocked.
6. **Grill the feature** as it stands after the head-to-head. Surface 3–5 assumptions the earned argument is betting on. For each, one scenario where it breaks. Rank them `would-kill` or `would-hurt`. End by asking what would convince them this is the wrong call.

One round of questions. After they answer, write the full output even if a field stays thin.

A bare preference gets only its missing fields as questions. For "let's just add a CSV export of orders":

```
- Rejected: what else did you consider for getting orders out (an API endpoint, a scheduled report, a BI connector)?
- Winning constraint: what about the people exporting makes a CSV file win: they work in spreadsheets, the data is small, or something else?
- Cost of being wrong: if the export times out on the largest accounts, who notices first, and what do they do instead?
```

Not: "Have you thought about whether CSV export is the right feature?" That asks for a verdict, not a reason.

## Output

When step 2 stops, give its finding and the question. When step 4 stops for a bare preference, ask only the missing questions, plus any term conflict. Otherwise:

```
## Fit
Project: "<the line that says what the project is>" (<file>)
Fits: yes | no: "<the line it contradicts>" (<file>)
Covered by: none (checked <docs and searches>)

## Terms
Uses: <glossary terms>
New: **<Term>**: <draft definition>
Conflict: "<word>" means <x> here; the glossary says <y>

## The argument
Decision: …
Rejected: …
Winning constraint: …
Cost of being wrong / first signal: …
Verdict: strong | thin | missing <piece>

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

## The grill
Feature as it stands: <one line>

Assumptions:
1. <assumption> — <concrete way it breaks>

Failure scenarios:
1. [would-kill] …
2. [would-hurt] …

What would change your mind?
```

Leave out a `## Terms` line with nothing to say.

## After confirmation

When the user accepts the feature:

1. Write `docs/feature/<slug>.md` with the template below. `slug` is lowercase and hyphenated, built from glossary words. Status is `decided`.
2. Update `docs/GLOSSARY.md` with each new term and each resolved conflict, following [references/glossary.md](references/glossary.md). Create the file when it is missing.

Do not write `docs/spec/`. The next step is `to-implement-spec`. The spec it writes carries the work to `shipped`.

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

Until the user accepts, write neither file.

## Source

Adapted from `convince-me`, `grill-me`, and `steelman` by [rahul-kulkarni105/skills](https://github.com/rahul-kulkarni105/skills) (CC BY 4.0, https://creativecommons.org/licenses/by/4.0/). Those three names are not separate skills in this collection. This file runs their moves as one ordered test of a new feature. The glossary format in `references/glossary.md` is adapted from `domain-modeling` by [mattpocock/skills](https://github.com/mattpocock/skills) (MIT, see `LICENSE`).
