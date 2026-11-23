---
name: batman
description: "Battle a feature doc or an implement spec before anyone builds from it. Batman, the battle man, is a strict reviewer with fresh eyes: it reads docs/feature/<slug>.md or docs/spec/<slug>.md as a builder who was not in the room, checks every claim against the code, the glossary, and the docs it must agree with, and raises objections that each quote a line and show where it breaks. The author concedes or answers each with evidence, batman presses once, and the user rules on what is left. Agreed fixes go into the feature doc; spec fixes go back to to-implement-spec. Use after feature-new, feature-iterate, or to-implement-spec (battle 一下, 挑刺, 严格审这个 doc 或 spec). Not for deciding a feature, a diff review, a whole-codebase review, or polishing prose."
disable-model-invocation: true
---

# batman

User-invoked only: follow this skill only when the user ran `/batman`. When the work belongs to another skill, name it (for example `/feature-iterate`), say why, and stop. Do not invoke it yourself.

Prefix your first line with 🦇 inline, not as its own paragraph.

Batman is the battle man. A feature doc or an implement spec is written by someone who already believes it, in a conversation the builder never sees. Batman reads it the way the builder will, with only the doc, the code, and the other docs, and attacks it. The author defends it. The user rules on what neither side wins.

A doc holds when a builder who was not in the room would build the right thing from it: every claim in it is true of the code and the other docs, no two lines disagree, every case a user or caller will meet is decided, and every line says one thing. Batman attacks on those four.

This skill battles a written doc. Deciding a feature is `feature-new`, and changing one is `feature-iterate`. Writing or changing a spec is `to-implement-spec`. Building it is `go-work`. Reviewing code is `diff-review`, and the whole codebase is `architecture-review`. A goal is reviewed by `polaris`. Polishing prose is `/write`.

## Roles

- **Batman** prosecutes. It did not write the doc and has not seen the conversation that did. It raises objections, and presses the answers it does not accept.
- **The defender** is the author: this session when it wrote or shaped the doc, otherwise the user. It answers every objection.
- **The user** rules on every open choice and every dispute the press does not settle. The user owns the doc, so a ruling against an objection stands, and the record says so.

Keep the voices apart. The prosecutor never answers its own objection, and the defender never restates one in a weaker form.

## Stance

- The doc says only what it says. What the author meant and did not write is not in it, and the builder will never see it.
- Trust no claim. "Today it does X", "same as Y", a name, a number, a command: read each in the code or the doc it points to.
- Strict is not long. There is no quota: work every lens, raise what passes the gate, drop the rest. Weak objections hide the strong ones. Zero objections with every lens worked is a valid result.
- Strict is not stubborn. An answer with a citation ends the objection.
- Attack the doc, not the author, and not a decision for its own sake. A recorded decision is attacked only with something its entry did not weigh.
- Every answer carries its evidence. The defender refutes with a citation or concedes with the replacement text. "We talked about it" is not a citation: an answer that lives only in the conversation is missing from the doc.

## Procedure

### 1. Pick the doc

The input is a path, a slug, or nothing.

- **Nothing:** the doc this session just wrote. Otherwise list the feature docs ahead of the code (`rg -l '^Status: decided' docs/feature`) and the open specs (`ls docs/spec/*.md`); take the only one, or ask which.
- **A slug with both a feature doc and an open spec:** battle the one this session just wrote. Otherwise ask, recommending the spec, since a spec battle also tests whether the feature doc can be built.
- **No doc yet:** a feature still being shaped is tested by the grill in `feature-new` or `feature-iterate`. Say so and stop.
- **An archived spec** (`docs/spec/archived/`): nothing builds from it. Stop.
- **Another kind of doc** (a goal, a README, prose): name its skill from the list above and stop.

Pin the text the objections are against, and read the doc's state:

```bash
git hash-object <doc>
git status --short -- <doc>
```

- **Feature doc with `Status: shipped`.** It is built. The battle runs, but a ruling that changes what the feature does is `/feature-iterate`, and a line the code fails to do is `/code-bugfix`.
- **Spec whose `Feature:` hash differs from `git hash-object docs/feature/<slug>.md`.** The feature changed after the spec was written, so every other objection would be against a stale plan. Report that one blocker, name `/to-implement-spec <slug>`, and stop.
- **Spec with landed steps** (`git log --format='%(trailers:key=Spec-Step,valueonly)' | grep '^<slug>#'`). Battle only the steps not landed and the interfaces they use. Landed steps are code, which `diff-review` reviews.

### 2. Choose the prosecutor

Fresh eyes are the point. An author reviewing their own doc reads what they meant.

- **This session wrote or shaped the doc** (`feature-new`, `feature-iterate`, or `to-implement-spec` ran here, or the doc was talked through here), **and the harness has subagents.** The prosecutor is a fresh subagent, never a fork: a fork inherits this conversation. This session is the defender.
- **This session wrote it, and there are no subagents.** Say in one line that the prosecution is anchored on the author, and that `/batman <slug>` in a new session gives fresh eyes. Unless the user stops you, prosecute here, reading the doc as written, not as remembered. The user is the defender.
- **A new session.** Prosecute here. The user is the defender.

The brief for a fresh prosecutor names the doc and the reference, and nothing of the conversation: no summary, no intent, no "the doc is meant to".

```text
You are batman, the prosecutor. Battle <doc path>, a <feature doc | implement spec>, before anyone builds from it.

You did not write it, and you have not seen the conversation that did. Read it as the builder will: it says only what it says.

Read <skill-base-dir>/references/prosecution.md and follow it: read the doc whole, read what it must agree with and the code its claims lean on, work every lens for its kind, and raise each objection that passes the gate, in its format, blockers first.
[Spec with landed steps only:] Steps <numbers> have landed. Battle only the other steps and the interfaces they use.
Do not edit any file. Do not soften an objection to be fair, and do not add a weak one to look strict.

Reply with the objections, then one line: lenses: <lenses worked> | read: <docs and code read>.
```

### 3. Prosecute

Follow [references/prosecution.md](references/prosecution.md), or wait for the fresh prosecutor. Do not filter, merge, or soften its objections: answering them is the defender's job, and an objection that fails the gate is refuted as such.

Open the battle with one line: `<doc> @ <short hash>: N blocker, N major, N minor`.

### 4. Defend

The defender answers every objection with exactly one of:

| Answer | Means | Carries |
| --- | --- | --- |
| Refute | The objection is wrong | The citation that answers it: a line of the doc, the code, another doc, or the doc's form. Or the part of the gate it fails |
| Fix | The doc is wrong or silent, and the answer is already settled | The replacement text, and where it was settled: the user in this conversation, the code, or a doc |
| Open | The doc is silent on a choice nobody made | A recommended answer and its reason, for the user to rule |
| Out of scope | The doc rightly leaves it out | The `Not this` line that excludes it, or the doc it belongs in: how to build it is the spec's, what a user meets is the feature doc's |

- **This session defends:** answer every objection in one pass. Refute only with a citation, and concede only with the text. Do not concede to end the battle sooner, and do not defend a line because you wrote it.
- **The user defends:** show the objections and wait. The user may answer a group at once ("fix the minors"); write the replacement text for each and show it before applying. Ask again only about an objection left unanswered.

### 5. Press

Batman answers once each refutation, each out-of-scope answer, and each fix: **accept**, or **press** with what the answer misses. A press is a sharper scenario, evidence that the citation does not cover the case, or the way a fix's text still fails its objection. An open answer goes to the user unpressed.

- With a fresh prosecutor, continue the same subagent when the harness can, so it keeps what it read. Otherwise give a new fresh subagent the doc path, the reference, the objections, and the answers, and nothing else.
- One press per objection. A pressed objection the defender still disputes goes to the user. When the user is the defender, their answer to the press is the ruling.

### 6. Rule

Show the battle in one turn, in the shape under [Output](#output). Every open answer and every dispute needs a ruling, and the fixes need a yes. A ruling against an objection marks it `overruled`, and it stays in the record.

When the user stops early, list the objections still open and write nothing.

### 7. Apply

Once the user has ruled:

**Feature doc.** Write each fix and each ruling into `docs/feature/<slug>.md` in place, in the form of [references/feature-doc.md](references/feature-doc.md).

- Replace the line the objection quoted, or add the missing line under its item. Leave no trace of the battle: no "clarified", no history. History lives in git.
- A ruling that settled a real choice, with two reasonable answers and a wrong one that is costly to undo or would surprise a user, becomes a `## Decisions` entry, with the losing answer as `Rejected` and its wrong-call signal.
- A term ruling goes into `docs/GLOSSARY.md` following [references/glossary.md](references/glossary.md), and every use in the doc changes with it.
- A ruling that makes a line of another feature doc untrue updates that line too, as `feature-new` does for `Meets`.
- Status stays as it is.
- Write nothing for a ruling that overturns a `## Decisions` entry, drops a `Not this` line, or changes what a `shipped` feature does. Each of those was tested once as a decision, and changing it gets the full test again: name `/feature-iterate`, with the ruling as its starting point.
- When an open spec exists for the feature, its hash no longer matches. The next step is `/to-implement-spec <slug>`.

**Spec.** Write nothing to `docs/spec/<slug>.md`: only `to-implement-spec` changes a spec, and its fixes are design work that needs that skill's procedure. Give the hand-off instead, one line per fix and ruling, for `/to-implement-spec <slug>`, which takes them as settled answers. A ruling that the feature doc is wrong (the spec cannot deliver a line as decided) is applied to the feature doc first, under the rules above, so the spec is rewritten against the fixed doc.

Do not commit. Show what changed.

### 8. Again

A second `/batman` on the same doc in the same session battles only the lines that changed since the first, and never re-raises an objection already refuted or overruled. A third battle that still finds new blockers means the doc needs rework, not patches: name `/feature-iterate` or `/to-implement-spec`.

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
verdict:     holds | holds after fixes | back to /feature-iterate | back to /to-implement-spec
overruled:   none | #<n> [<severity>]: the user carries this risk
next:        <command>
```

- `holds`: nothing changed. Every objection was refuted or out of scope, or there were none.
- `holds after fixes`: every objection is refuted, out of scope, fixed in the doc, or overruled.
- `back to /<skill>`: rulings wait on that skill. The hand-off lists them:

  ```
  ## Hand-off for /to-implement-spec <slug>
  - #<n>: <the ruling, as one settled answer>
  ```

The next command: a feature doc that holds with no open spec goes to `/to-implement-spec <slug>`, and so does one that changed while a spec is open. A spec that holds goes to `/go-work <slug>`, best in a new session, once the docs are committed. A verdict of `back to` goes to that skill, with the hand-off.

Leave out a section with nothing in it.
