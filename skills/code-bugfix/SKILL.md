---
name: code-bugfix
description: "Finds the root cause with a tight red loop before any fix. Use when something errors, crashes, regresses, is slow, or used to work. Not for a diff review, a whole-codebase architecture review, or new features."
disable-model-invocation: true
---

# Code bugfix

User-invoked only: follow this skill only when the user ran `/code-bugfix`. When the work belongs to another skill, name it (for example `/code-bugfix`), say why, and stop. Do not invoke it yourself.

Prefix your first line with 🥷 inline, not as its own paragraph.

A diff review is `diff-review`, a whole-codebase review `architecture-review`, and a change to how the product looks across screens `design-system`. When exploring an area, first read its `docs/feature/` file, its open spec in `docs/spec/` (not `archived/`), and `docs/GLOSSARY.md`.

## Ground rules

- **Authorization.** "Diagnose", "investigate", "why", "look into", "排查", "看看" mean report only. Change product code only when the request says fix, change, implement, or optimize, or that authorization still holds for the same unfinished task. It never includes push, publish, or anything destructive. Commit when asked, or locally after each verified step when the repo's `AGENTS.md` has a Commits principle.
- **Redaction.** Replace every secret in a command, output, or capture with `<REDACTED>`. Pass credentials through environment variables. Quote only the lines that carry the signal.
- **Current evidence wins.** Memory, old notes, and earlier fixes are leads. Current code, logs, and the repro override them.

## Workflow

Run steps 1 to 7 in order. Do not change product code before step 4 is done; steps 1 to 4 may add a test, a harness, or a probe. When a row in [Special cases](#special-cases) matches, load it before step 1: it changes how the loop is built, not whether you build one.

## 1. Build the loop

Do not read code to build a theory before a pass/fail signal for this bug exists. Try these in roughly this order:

1. **Failing test** at the seam that reaches the bug.
2. **HTTP script** against a dev server.
3. **CLI run** with a fixture, diffed against a known-good snapshot.
4. **Headless browser script** asserting DOM, console, or network.
5. **Replayed capture** of a real request, payload, or event log.
6. **Throwaway harness**: the smallest subset that hits the bug path, dependencies mocked.
7. **Property or fuzz loop** for "sometimes wrong" output.
8. **Bisection harness** between two known states (see Special cases).
9. **Differential loop**: the same input through old and new, diffed.
10. **Human in the loop**, last resort: copy [scripts/hitl-loop.template.sh](scripts/hitl-loop.template.sh), edit the steps, and run it. The user follows prompts and the values come back to you.

```bash
# exits 1 while the bug exists, 0 once fixed
curl -s "localhost:3000/api/orders/42" | jq -e '.total == 118.00'

# a flake: count failures over 50 runs instead of trusting one
for i in $(seq 50); do npm test -- -t 'sync merges edits' >/dev/null 2>&1 || echo fail; done | wc -l
```

The loop is done when you can show one command you already ran, with its redacted output, that drives the bug path, asserts the user's exact symptom, gives the same verdict every run, takes about 2 seconds, and runs unattended (a human only through the template). Make it deterministic: pin time, seed randomness, isolate the filesystem, freeze the network. For a flake, raise the reproduction rate to a pinned high rate: loop the trigger, parallelise, add load, narrow the timing window. A 50% flake is debuggable. 1% is not.

If you cannot build a loop, stop, list what you tried, and ask for an environment that reproduces it, a redacted capture (HAR, log dump, core dump, timestamped screen recording), or permission to add temporary instrumentation.

## 2. Reproduce and shrink

Run the loop and watch it go red with the failure the user described. A different failure is a different bug.

Cut inputs, callers, config, data, and steps one at a time, re-running after each cut. Stop when removing anything left makes the loop go green.

## 3. Hypotheses

Before testing, write 3 to 5 ranked, falsifiable hypotheses: "If X is the cause, changing Y makes the bug disappear, and changing Z makes it worse." Sharpen or drop one whose prediction you cannot state. Each must explain every symptom, including ones the reporter called unrelated.

```
1. Cache key in src/hooks/user.ts:42 omits userId → switching accounts shows the old profile.
   Predicts: adding userId to the key fixes it; two users with one tab reproduces it 100%.
```

Show the ranked list, then test. Do not wait on an absent user.

## 4. Probe and name the cause

Run the one probe that would fail if the top hypothesis were wrong. Change one variable at a time. Prefer a debugger or REPL breakpoint when available.

- Tag every temporary log with one prefix, such as `[DEBUG-a4f2]`. Keep a useful diagnostic behind the project's debug flag.
- Drop a hypothesis the evidence contradicts, even if the code "looks like" the cause, and re-orient on what the probe showed.
- After two failed fixes that rest on one premise, follow [principles/attack-the-premise.md](principles/attack-the-premise.md) before a third.

| Bug kind | Start with |
| --- | --- |
| Pure logic (wrong formula, off-by-one) | Static reading and a unit-level loop |
| Lifecycle, events, focus, async ordering | Logs while forming the hypothesis; stop after two guesses in a row |
| Paint, stacking, compositor | DevTools layers and computed styles before any log |
| Performance, or a regression in a number | A measured baseline (timer, profiler, query plan), then bisect. Every number follows [principles/explain-the-number.md](principles/explain-the-number.md) |
| Tooling or system symptoms | Measure the lower layer first: OS before post-processing, service before UI, toolchain before assertion, network before client |

What to log: [references/logging-techniques.md](references/logging-techniques.md).

The step is done when you can write:

> "I believe the root cause is [X] because [evidence]."

The evidence is a command and its output, or a file and line read this session ([principles/show-the-evidence.md](principles/show-the-evidence.md)).

Name a file, function, line, or condition, not "a state management issue".

## 5. Fix and lock it

Fix the cause within the authorized scope, with the smallest change that removes it ([principles/subtract-before-you-add.md](principles/subtract-before-you-add.md)). A prerequisite refactor, such as a shared interface change, is in scope once you say why. Ask only when the fix needs an unresolved behavior tradeoff or widens the task, not because of file count. Keep unrelated refactors out. Name an unrequested feature and route it to its own workflow after the diagnosis.

Turn the shrunk repro into a test at a seam that exercises the real bug pattern ([principles/test-behavior.md](principles/test-behavior.md)). Run it red on the unfixed code, fix, run it green, and re-run the original loop. If you forced the red by mutating code or a fixture, diff against a pristine copy. Prove the red run without touching the shared worktree:

```bash
git worktree add --detach "$TMPDIR/red" HEAD      # unfixed code
cp <new-test-file> "$TMPDIR/red/<same-path>"
(cd "$TMPDIR/red" && <test-command>)              # must fail, for the right reason
git worktree remove --force "$TMPDIR/red"
```

Two ways a regression test pins nothing:

- The framework lets an assertion fail mid-test without failing the test. Check with a two-line deliberate failure.
- A negative assertion on a string no version ever emitted. Pair every negative assertion with a positive one in the same test.

If no seam can go red (one caller when the bug needs several, a unit that cannot replay the chain), say the module shape prevents locking it down. Do not invent a test that cannot fail.

For a bug that recurred or was "fixed" before, the regression test goes in the project's suite, seen red, and the commit message says why it recurred and why this fix holds. Every fix commit names the winning hypothesis.

## 6. Sweep for siblings

Run this after every root-cause fix, and whenever the user says "举一反三" or "其他地方有没有同样问题".

Search for the pattern signature (the function, regex, API call, selector, lock, skipped validation, or input boundary that produced the bug):

```bash
rg -n '<signature>' . --glob '!{node_modules,dist,build,vendor,target}/**'
```

Always pass a path to `rg`. Without one, and with a non-terminal stdin, it hangs reading stdin.

For a class of bug ("handlers missing the lock"), search the shape, not only the literal text. Mark every match: same bug (fixed), safe (why), or unsure (ask). List unrelated bugs found on the way; fix them only if the user agrees.

## 7. Verify at the real runtime

Follow [principles/prove-it-works.md](principles/prove-it-works.md). Climb this ladder before calling it fixed:

1. Source trace: the function, state transition, or condition that produced the symptom.
2. The loop is green, deterministically.
3. Runtime state shows the path ran: queue or DB rows, caches, generated files, external logs.
4. The narrow test or build passes.
5. UI, native, rendering, or generated artifacts: open the real thing and check it by screenshot or a concrete checklist.

If the runtime check is impossible here, say why and hand off the exact screen, command, or artifact. When only the reporter's environment shows the bug, send a read-only probe: one command, one block to paste back, printing the environment and the disputed state and nothing that could carry a secret or private path. Discover their layout in the probe.

Before declaring done, remove every `[DEBUG-...]` line and delete throwaway harnesses (or follow the repo's Cleanup principle when it has one).

After a deep dig (a bisect, a reference-mode hunt, a runtime capture, or more than one dropped hypothesis), propose the cheap always-on signal that would have shown this bug at once: a boundary log line, an assertion, a health check, a metric, a lint. Add it only if the user agrees ([principles/encode-lessons.md](principles/encode-lessons.md)).

## Special cases

| Trigger | What changes |
| --- | --- |
| "以前是好的", "used to work", "broke after update", a known good version | Bisect, below |
| Same issue after a fix, a "good" screenshot, "it was right before" | Reference mode, below |
| Beachball, not responding, freeze on tab switch, first-open lag | Native App Freeze Mode in [references/logging-techniques.md](references/logging-techniques.md) |
| Fails only under make, CI, cron, or a test runner | Runner-Only Failures in the same file |
| PDF, page breaks, print layout, font rendering | [references/rendering-debug.md](references/rendering-debug.md) |
| IME, composition events, cursor drift, emoji splitting, encoding | [references/ime-unicode.md](references/ime-unicode.md) |
| A second fix for the same class, or runtime-state smell | [references/failure-patterns.md](references/failure-patterns.md) |

### Bisect

If the last good version is a few releases back, read `git diff <good>..HEAD -- <suspect path>` first. Bisect when the delta is too large to read.

Never bisect in a dirty checkout: use a temporary worktree. If you cannot create one, ask before cleaning or stashing anything.

```bash
git status --short --branch -uall                  # anything listed → use a worktree
git worktree add --detach "$TMPDIR/bisect" HEAD
cd "$TMPDIR/bisect"
git bisect start <bad> <good>
git bisect run ./repro.sh                          # exit 0 good, 1 bad, 125 skip
git bisect reset
cd - && git worktree remove --force "$TMPDIR/bisect"
```

Keep the bookkeeping in `git bisect`, including when you test a suspect commit by hand. When it names the culprit, read that diff down to the line.

### Reference mode

List every reported and visible symptom in the user's words. Name the reference (last good commit, old build, fixture, screenshot), define the pass/fail check before editing, then name the exact delta to it. Do not turn a broken render, race, font pipeline, or state path into "style polish". Pure taste about the product's look, with no broken path: tell the user to run `/design-system`, and stop.

## Hard rules

- **Same symptom after a fix, or "let me just try this":** stop and re-read the execution path from the start.
- **Three failed hypotheses:** stop and hand off (format below).
- **Rationalizations.** "I'm confident": run the probe. "Probably the same issue": re-read the path. "Works on my machine": list the environment differences. Never restart more than twice without new evidence.
- **External tool fails:** find out why (server down, key invalid, config wrong) before switching.
- **A magic number tuned three times:** replace the independent values with one named token and look for the missing constraint.

## Gotchas

| What happened | Rule |
| --- | --- |
| Patched the wrong copy of a duplicated surface | Trace backward from what actually renders before touching a file |
| Orchestrator said RUNNING while a stage was misconfigured | Test each pipeline stage alone |
| A race was diagnosed as stale state | Check event timestamps and ordering before state |
| Passed locally, failed in CI | Align runtime version, env vars, and timezone before chasing code |
| Broke via file association, drag-drop, deep link, or proxy, not from the app | Reproduce through the user's exact entry point |
| Fixed the reporter's setup, broke or missed the default | Say whether the fix changes the default path; prefer fixing the default |
| Broke after a theme, mode, or locale toggle, fine after restart | Trace the toggle's recompute path; do not tune styles while state is broken |
| Changed the algorithm, output stayed wrong | Invalidate or version persisted output from the old code in the same change |
| Fixed one refusal reason, the same gate refused the next user for another | Give every refusing branch a distinct code, reason, and next step |
| The user's observation and the log disagreed | Trust the observation; instrument the missing path |
| Patched a capability-gated feature on a surface without the capability | Confirm the simulator, device, or sandbox supports it first |

## Output

Open with one plain line: the outcome, and whether changes are committed.

```
Root cause:       <what was wrong, file:line>
Fix:              <what changed, file:line>
Loop:             <command> red → green
Regression guard: <test file:line, seen red> / none: <why no seam exists>
Tests:            <suite command> N passed, N failed
Sibling sweep:    N sites checked: N fixed, N safe / not run: <why>
Runtime check:    <screenshot, state, or command> / handed off: <what to check>
Signal:           <proposed always-on signal> / none: <no deep dig>
```

Status: **resolved**, **resolved with caveats** (name them), or **blocked**.

### Handoff after three failed hypotheses

Status **blocked**, then: the symptom in one sentence; the premise the hypotheses shared and how it was tested ([principles/attack-the-premise.md](principles/attack-the-premise.md)); each hypothesis, how it was tested, and why it was ruled out; the evidence collected (redacted log or stack excerpts, repro steps, versions, config); what is still unknown; and the next step, naming any access, tool, or context the user must supply.
