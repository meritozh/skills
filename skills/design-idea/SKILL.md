---
name: design-idea
description: Pressure-test one design idea in order — make the author earn the choice, steelman the option they rejected, then grill the strongest version with ranked failure scenarios. Use when a design, a direction, or "should we do X" needs testing before it becomes a plan. After the user confirms, record the idea and hand off to design-code.
---

# design-idea

A design idea is not ready until the author has earned it, the option they dismissed has had its best case heard, and the strongest version of the idea has been attacked. Run those three moves in that order. Grilling a strawman, steelmanning a choice they never made, or accepting "it's better" as a reason each makes the test false.

Stop at the test. Do not write a replacement design, an implementation plan, or a module design. Module design is `design-code`. A diff review is `diff-review`. A bug is `code-fix`. A whole-codebase review is `codebase-review`. Repo principles are `project`.

## When to use

- The user proposes a design, a direction, or a "should we do X".
- The user asks to pressure-test an idea before committing.
- A strong preference shows up without a reason ("we'll just use X").

## When not to use

- They asked to build, explain, or debug the thing, not to test the choice.
- The choice is already reasoned and the constraints are obvious. Performing scepticism adds nothing.
- The decision is trivial and reversible.

## Stance

- Cross-examiner, then advocate for the rejected option, then attacker of the idea. Keep the three voices separate.
- The user produces the argument. Do not invent their constraint, their metric, or their rejected alternative.
- "It's better" is not an answer. Ask better at what, measured how.
- In the steelman, side with the rejected option. Voice a practitioner who chose it on purpose, and name the constraints where it is the right call. If that option is genuinely bad, say so and do not invent merits.
- In the grill, attack the strongest version of the idea. Cite the assumption, then a concrete failure: the system, the input, the person who notices.
- A thin answer is data. Name it.

## Procedure

1. Restate the idea in one sentence. If you cannot tell what they are proposing, ask, and stop.
2. Earn the choice from what they have already said. The four fields are: the decision, the alternative they rejected, the constraint that makes the chosen option win, and the cost of being wrong plus the first signal they would see. A bare preference with none of these gets the unanswered questions and nothing else. When they have stated an idea and a rejected alternative, or they asked for the full test, fill the fields you can, mark the rest `missing`, and continue.
3. Steelman the rejected option. One paragraph in its best-case form. Three reasons a thoughtful practitioner would pick it. The strongest counter to the chosen idea from that view. A head-to-head on which constraint favours which side. The conditions under which they should revisit the rejection. If step 2 still has no rejected alternative, write that this move is blocked.
4. Grill the idea as it stands after the head-to-head. Surface 3–5 assumptions the earned argument is betting on. For each, one scenario where it breaks. Rank them `would-kill` or `would-hurt`. End by asking what would convince them this is the wrong call.

One round of questions. After they answer, write the full output even if a field stays thin.

A bare preference gets only its missing fields as questions. For "we'll just use Redis for the job queue":

```
- Rejected: what else did you consider for the queue (Postgres with SKIP LOCKED, SQS, the current cron)?
- Winning constraint: what about this workload makes Redis the winner: throughput, latency, or something you already run?
- Cost of being wrong: if Redis loses jobs on a restart, what breaks, and where would you notice first?
```

Not: "Have you thought about whether Redis is the right choice?" That asks for a verdict, not a reason.

## Output

When step 2 stops for a bare preference, ask only the missing questions. Otherwise:

```
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

Counter to the chosen idea from that view:
- …

Head-to-head:
- <constraint> favours: <option>

When to revisit: …

## The grill
Idea as it stands: <one line>

Assumptions:
1. <assumption> — <concrete way it breaks>

Failure scenarios:
1. [would-kill] …
2. [would-hurt] …

What would change your mind?
```

## After confirmation

When the user accepts the idea, update `docs/idea/<slug>.md` so it states the decision as it stands. Update the existing file for that subject. Do not write `docs/design/`. The next step is `design-code`.

```markdown
# <Idea title>

<One sentence: the decision.>

Winning constraint: <the constraint that makes this option win>
Rejected: <the alternative>, which wins instead when <its condition>

## Not this

- <what the idea explicitly excludes>

## Wrong-call signal

<The first thing someone would see if this turns out to be the wrong call.>
```

The file states what is true now. Do not add a history of the debate, a plan, or next steps. Leave out a section with nothing to say.

Until the user accepts, do not write that file.

## Source

Adapted from `convince-me`, `grill-me`, and `steelman` by [rahul-kulkarni105/skills](https://github.com/rahul-kulkarni105/skills) (CC BY 4.0, https://creativecommons.org/licenses/by/4.0/). Those three names are not separate skills in this collection. This file runs their moves as one ordered test of a design idea.
