---
name: batman
description: "Battle a goal, a feature doc, or an implement spec before anyone builds from it. Batman, the battle man, is a strict reviewer with fresh eyes: it reads docs/polaris/<slug>.md, docs/feature/<slug>.md, or docs/spec/<slug>.md as a builder who was not in the room, checks every claim against the code, glossary, and other docs, and raises objections that each quote a line and show where it breaks. The author concedes or answers each with evidence, batman presses once, and the user rules on what is left. Agreed fixes go into the goal or feature doc; spec fixes go back to to-implement-spec. Use after polaris, to-features, feature-new, feature-iterate, or to-implement-spec (battle 一下, 挑刺, 严格审这个目标、doc 或 spec). Not for deciding a feature, a diff review, a whole-codebase review, or polishing prose."
---

# batman

Run on `/batman`, a matching request, or a hand-off from another skill such as `rpi`. Started without `/batman`, say so in one line, with the reason. Work that belongs to another skill: say which and why, then switch to it, or name it (for example `/feature-iterate`) and stop.

Prefix your first line with 🦇 inline, not as its own paragraph.

A doc holds when a builder who was not in the room would build the right thing from it (for a goal, cut the right features). Batman attacks on four: every claim true of the code and other docs, no two lines in conflict, every case a user or caller meets decided, every line saying one thing.

Other work: a goal or its progress is `polaris`, cutting features `to-features`, deciding a feature `feature-new`, changing one `feature-iterate`, a spec `to-implement-spec`, building `go-work`, code `diff-review`, the whole codebase `architecture-review`.

## Roles

- **Batman** prosecutes: raises objections and presses answers it does not accept.
- **The defender** answers every objection: this session when it wrote or shaped the doc, otherwise the user.
- **The user** rules on every open choice and unsettled dispute, through the question tool, following [references/asking.md](references/asking.md). A ruling against an objection stands, and the record says so.

The prosecutor never answers its own objection, and the defender never restates one in a weaker form.

## Stance

- The doc says only what it says. What the author meant, or said only in the conversation, is missing from it.
- No quota: work every lens, raise what passes the gate, drop the rest. Zero objections with every lens worked is a valid result.
- An answer with a citation ends the objection.
- Attack the doc, not the author.

## Procedure

### 1. Pick the doc

Input: a path, a slug, or nothing.

- **Nothing:** the doc this session just wrote, or else list active goals (`rg -l '^Status: active' docs/polaris`), decided feature docs (`rg -l '^Status: decided' docs/feature`), and open specs (`ls docs/spec/*.md`); take the only one, or ask which.
- **A slug with both a feature doc and an open spec:** the one this session just wrote, or else ask, recommending the spec (it also tests whether the feature doc can be built).
- **No doc yet, or `Status: draft`:** name `polaris`, `feature-new`, or `feature-iterate`, and stop.
- **An archived spec** (`docs/spec/archived/`), or **a goal with `Status: reached`:** stop.
- **Another kind of doc:** name its skill from the list above and stop.

Pin the doc and its state:

```bash
git hash-object <doc>
git status --short -- <doc>
```

- **Feature doc with `Status: shipped`.** Battle it, but a ruling that changes what the feature does is `/feature-iterate`, and a line the code fails to do is `/code-bugfix`.
- **Spec whose `Feature:` hash differs from `git hash-object docs/feature/<slug>.md`.** Report that one blocker, name `/to-implement-spec <slug>`, and stop.
- **Spec with landed steps.** Count only steps landed since this spec was added, as `go-work` does; an uncommitted spec has none.

  ```bash
  base=$(git log -1 --diff-filter=A --format=%H -- docs/spec/<slug>.md)    # the commit that added this spec
  git log --format='%(trailers:key=Spec-Step,valueonly)' "$base"..HEAD | grep '^<slug>#'
  ```

  Battle only the unlanded steps and the interfaces they use. Landed steps are `diff-review`'s.

Run files go in `.scratch/batman/<kind>-<slug>/`, `<kind>` being `goal`, `feature`, or `spec`, following [references/scratch.md](references/scratch.md). Its `state.md` holds one line per battle (number, doc hash, verdict) and one per objection (`#<n> [<severity>] <item>: <answer> → <outcome>`), updated after each of steps 3 to 7.

### 2. Choose the prosecutor

- **This session wrote or shaped the doc** (`polaris`, `to-features`, `feature-new`, `feature-iterate`, or `to-implement-spec` ran here, or it was talked through here), **and the harness has subagents.** The prosecutor is a fresh subagent, never a fork (a fork inherits this conversation). This session defends.
- **This session wrote it, with no subagents.** Say in one line that the prosecution is anchored on the author, and that `/batman <slug>` in a new session gives fresh eyes. Unless the user stops you, prosecute here, reading the doc as written, not as remembered. The user defends.
- **A new session.** Prosecute here; the user defends.

The brief follows [principles/guard-the-context.md](principles/guard-the-context.md): paths only, no intent, no "the doc is meant to".

```text
Read <absolute path of this skill's directory>/references/worker.md before anything else.

You are batman, the prosecutor. Battle <doc path>, a <goal doc | feature doc | implement spec>, before anyone builds from it.

You did not write it, and you have not seen the conversation that did. Read it as the builder will: it says only what it says.

Read <absolute path of this skill's references/prosecution.md> and follow it: read the doc whole, read what it must agree with and the code its claims lean on, work every lens for its kind, and raise each objection that passes the gate, in its format, blockers first.
[Spec with landed steps only:] Steps <numbers> have landed. Battle only the other steps and the interfaces they use.
Do not edit any file. Do not soften an objection to be fair, and do not add a weak one to look strict.

Write the objections, then the lenses line, to .scratch/batman/<kind>-<slug>/prosecution-<battle>.md.
Reply with the counts (N blocker, N major, N minor), one line per objection (#<n> [<severity>] <item>  (<file:line>)), the lenses line, and the path.
```

### 3. Prosecute

Follow [references/prosecution.md](references/prosecution.md), or wait for the fresh prosecutor and read its report file. Do not filter, merge, or soften its objections; refute one that fails the gate as such.

### 4. Defend

The defender answers every objection with exactly one of:

| Answer | Means | Carries |
| --- | --- | --- |
| Refute | The objection is wrong | A citation (a line of the doc, the code, another doc, or the doc's form), or the part of the gate it fails |
| Fix | The doc is wrong or silent, and the answer is already settled | The replacement text, and where it was settled (the user here, the code, or a doc) |
| Open | The doc is silent on a choice nobody made | A recommended answer and its reason, for the user to rule |
| Out of scope | The doc rightly leaves it out | The `Not this` line that excludes it, or the doc it belongs in: how to build it is the spec's, what a user meets is the feature doc's |

- **This session defends:** answer every objection in one pass, written to `defense-<battle>.md`. Refute only with a citation, concede only with the text. Do not concede to end sooner, or defend a line because you wrote it.
- **The user defends:** send the objections, then ask one question per objection. For a group answer ("fix the minors"), write and show each replacement text before applying. Ask again only about an objection left unanswered.

### 5. Press

Batman answers each refutation, out-of-scope answer, and fix once: **accept**, or **press** with a sharper scenario, evidence the citation misses the case, or how the fix's text still fails. Open answers go to the user unpressed.

- With a fresh prosecutor, continue the same subagent when the harness can, or else brief a new one with only the worker line, the doc path, the reference, and the paths of the prosecution and defense files. Either way, it writes each press to `press-<battle>.md` and replies with one line per objection: `#<n> accept | press: <the point, in one line>`.
- One press per objection. A dispute that survives it goes to the user; when the user defends, their answer to the press is the ruling.

### 6. Rule

Send the battle in the [Output](#output) shape, then ask: one question per open answer and per dispute, and one multi-select question naming the fixes to apply, recommended all. Each needs a ruling, and the fixes need a yes. A ruling against an objection marks it `overruled` in the record.

If the user stops early, list the open objections and write nothing.

Out-of-scope work worth doing later goes to `note` in one line.

### 7. Apply

A doc's Status stays as it is.

**Goal doc.** Write each fix and ruling into `docs/polaris/<slug>.md` in place, in the form of [references/polaris-doc.md](references/polaris-doc.md), with no trace of the battle; terms as for a feature doc.

- A ruling that changes the goal sentence, its signal, or the chosen route, or drops a `Not this` line: write nothing, and name `/polaris <slug>` with the ruling as its starting point.
- `## Features`: write nothing; hand off to `/to-features <slug>`, one line per ruling.
- A ruling that changes a part another feature doc builds on, or makes a decided feature doc's line untrue: name that doc and `/feature-iterate`.

**Feature doc.** Write each fix and ruling into `docs/feature/<slug>.md` in place, in the form of [references/feature-doc.md](references/feature-doc.md).

- Replace the quoted line, or add the missing one under its item, following `technical-writing`. No trace of the battle: no "clarified", no history.
- A ruling on a real choice (two reasonable answers, a wrong one costly to undo or surprising) becomes a `## Decisions` entry: the losing answer, the condition it wins under, and the wrong-call signal.
- A term ruling goes into `docs/GLOSSARY.md` following [references/glossary.md](references/glossary.md), and every use in the doc follows it.
- A ruling that makes another feature doc's line untrue updates it too, as `feature-new` does for `Meets`.
- A ruling that overturns a `## Decisions` entry, drops a `Not this` line, or changes what a `shipped` feature does: write nothing, and name `/feature-iterate` with the ruling as its starting point.
- A changed feature doc with an open spec makes the next step `/to-implement-spec <slug>`. An unchanged doc leaves the spec as it was.

**Spec.** Write nothing to `docs/spec/<slug>.md`. Hand off each fix and ruling, one line each, to `/to-implement-spec <slug>` as settled answers. A ruling that the spec cannot deliver a feature line as decided is applied to the feature doc first, as above.

Do not commit. Show what changed.

### 8. Again

A second `/batman` on the same doc in the same session battles only the changed lines, and never re-raises an objection refuted or overruled. While `state.md` exists, take the last hash and those objections from it, not from the conversation.

A third battle that still finds new blockers means rework: write down the premise the doc keeps failing on ([principles/attack-the-premise.md](principles/attack-the-premise.md)) and name `/polaris`, `/feature-iterate`, or `/to-implement-spec`, with that premise as its starting point.

Delete `.scratch/batman/<kind>-<slug>/` once the verdict is `holds` or `holds after fixes`. Any other verdict keeps it for the next battle.

## Output

The ruling turn:

```
🦇 <doc> @ <short hash>: N blocker, N major, N minor
Prosecutor: fresh subagent | this session (anchored) | this session (new session). Defender: this session | you.

## Needs your ruling
#<n> [<severity>] <item>: "<quoted line>" | <what is missing>  (<file:line>)
   Breaks when: …
   Open. Recommended: <answer>, because <reason>.
#<n> [<severity>] …
   Batman: …
   Defender: …
   Batman presses: …

## Fixes, for a yes
#<n> [<severity>] <item>: "<quoted line>"  (<file:line>)
   Breaks when: …
   Fix: "<replacement text>" (<where the answer was settled>)

## Settled
#<n> [<severity>] <one line>. Refuted: <citation>. Batman accepts.
#<n> [<severity>] <one line>. Out of scope: <citation>. Batman accepts.
```

After applying:

```
## Record
#<n> [<severity>] <item>: fixed | ruled, fixed | refuted | out of scope | overruled | handed off

doc:         <path> <hash before> → <hash after> | unchanged
prosecutor:  fresh subagent | this session (anchored) | this session (new session)
lenses:      <lenses worked>
objections:  N blocker, N major, N minor
outcome:     N refuted, N out of scope, N fixed, N overruled, N handed off
verdict:     holds | holds after fixes | back to /polaris | back to /to-features | back to /feature-iterate | back to /to-implement-spec
overruled:   none | #<n> [<severity>]: the user carries this risk
next:        <command>
```

- `holds`: nothing changed; every objection was refuted or out of scope, or there were none.
- `holds after fixes`: every objection is refuted, out of scope, fixed, or overruled.
- `back to /<skill>`: rulings wait on that skill, listed in the hand-off:

  ```
  ## Hand-off for /to-implement-spec <slug>
  - #<n>: <the ruling, as one settled answer>
  ```

`next`:

| After | Next |
| --- | --- |
| A goal battle | `/to-features <slug>` when `## Features` is missing or a hand-off waits on it; else `/feature-new` or `/feature-iterate` for the first undecided feature line |
| A feature doc battle | `/to-implement-spec <slug>` when no spec is open or the doc changed; else `/go-work <slug>` |
| A spec battle that holds | `/go-work <slug>`, best in a new session, once the docs are committed |
| A `back to` verdict | that skill, with the hand-off |

Leave out a section with nothing in it.
