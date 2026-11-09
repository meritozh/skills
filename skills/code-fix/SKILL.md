---
name: code-fix
description: "Finds the root cause with a tight red loop before any fix. Use when something errors, crashes, regresses, is slow, or used to work. Not for a diff review, a whole-codebase architecture review, or new features."
disable-model-invocation: true
---

# Code fix

User-invoked only: follow this skill only when the user ran `/code-fix`. When the work belongs to another skill, name it (for example `/code-fix`), say why, and stop. Do not invoke it yourself.

Prefix your first line with 🥷 inline, not as its own paragraph.

A patch applied to a symptom creates a new bug somewhere else. This skill finds the cause first, then fixes it, then proves the fix.

A diff review is `diff-review`. A whole-codebase review is `codebase-review`. Subjective visual taste is `design-ui`. When exploring an area, read its `docs/idea/` and `docs/design/` files first.

## Ground rules

- **Authorization.** "Diagnose", "investigate", "why", "look into", "排查", "看看" mean report only. Change product code only when the request says fix, change, implement, or optimize, or when that authorization is still in force for the same unfinished task. A fix authorization never includes push, publish, or anything destructive. Commit when asked, or when the repo's `AGENTS.md` has a Commits principle: then commit each verified step locally as it says.
- **Redaction.** Replace every secret in a command, output, or capture with `<REDACTED>`. Build loops on environment variables so credentials stay out of the transcript. Quote only the lines that carry the signal.
- **Current evidence wins.** Memory, old notes, and earlier fixes are leads. Current code, logs, and the repro override them.

## Workflow

1. Build a red-capable loop.
2. Reproduce and shrink.
3. Write 3 to 5 ranked hypotheses.
4. Probe until one survives, and state the root cause in one sentence.
5. Fix the cause, and lock it with a regression test that was seen red.
6. Sweep the repo for the same shape.
7. Verify at the real runtime and report.

Do not change product code before step 4 is done. Steps 1 to 4 may add a test, a harness, or a probe. When a row in [Special cases](#special-cases) matches, load it before step 1: it changes how the loop is built, not whether you build one.

## 1. Build the loop

This is the skill. Hypotheses, bisection, and instrumentation all consume a pass/fail signal for this bug. Reading code to build a theory before that signal exists is the failure this skill prevents.

Try these in roughly this order:

1. **Failing test** at whatever seam reaches the bug.
2. **HTTP script** against a running dev server.
3. **CLI run** with a fixture, diffing stdout against a known-good snapshot.
4. **Headless browser script** asserting on DOM, console, or network.
5. **Replayed capture.** Save a real request, payload, or event log and replay that path alone.
6. **Throwaway harness.** The smallest subset of the system that hits the bug path, with mocked dependencies.
7. **Property or fuzz loop** for "sometimes wrong" output.
8. **Bisection harness** when the bug appeared between two known states (see Special cases).
9. **Differential loop.** The same input through old and new, then diff.
10. **Human in the loop.** Last resort. Copy [scripts/hitl-loop.template.sh](scripts/hitl-loop.template.sh), edit the steps, and run it; the user follows prompts and the captured values come back to you.

What a loop looks like:

```bash
# exits 1 while the bug exists, 0 once fixed
curl -s "localhost:3000/api/orders/42" | jq -e '.total == 118.00'

# a flake: count failures over 50 runs instead of trusting one
for i in $(seq 50); do npm test -- -t 'sync merges edits' >/dev/null 2>&1 || echo fail; done | wc -l
```

Then tighten it: faster, a sharper assertion on the user's exact symptom, and deterministic (pin time, seed randomness, isolate the filesystem, freeze the network). A 2-second deterministic loop is the goal. A 30-second flaky one is barely better than none. For a non-deterministic bug, chase a higher reproduction rate: loop the trigger, parallelise, add load, narrow the timing window. A 50% flake is debuggable. 1% is not.

The loop is done when you can show one command you already ran, with its redacted output, that is:

- **Red-capable**: it drives the bug path and asserts the user's exact symptom.
- **Deterministic**: the same verdict every run, or a pinned high rate for a flake.
- **Fast**: seconds, not minutes.
- **Agent-runnable**: unattended, or a human only through the template.

If you cannot build a loop, stop. List what you tried. Ask for an environment that reproduces it, a redacted capture (HAR, log dump, core dump, timestamped screen recording), or permission to add temporary instrumentation. Do not hypothesise without a loop.

## 2. Reproduce and shrink

Run the loop and watch it go red. The failure must be the one the user described, in their words. A different failure is a different bug.

Shrink the repro: cut inputs, callers, config, data, and steps one at a time, re-running after each cut. Stop when removing anything left makes the loop go green.

## 3. Hypotheses

Write 3 to 5 ranked hypotheses before testing any. Each one is falsifiable: "If X is the cause, changing Y makes the bug disappear, and changing Z makes it worse." If you cannot state the prediction, sharpen it or drop it.

A hypothesis must explain every observed symptom, including the ones the reporter called unrelated. Covering only the first symptom is a guess, not a cause.

```
1. Cache key in src/hooks/user.ts:42 omits userId → switching accounts shows the old profile.
   Predicts: adding userId to the key fixes it; two users with one tab reproduces it 100%.
2. Logout does not clear the query cache → ...
```

Show the ranked list, then test. Do not wait on an absent user.

## 4. Probe and name the cause

Run the one probe that would fail if the top hypothesis were wrong. Change one variable at a time. Prefer a debugger or REPL breakpoint when one is available.

- A log is a yes/no question: "if this prints X before Y, A survives." Tag every temporary log with one prefix, such as `[DEBUG-a4f2]`, so cleanup is one grep.
- If adding a log changes the behavior, that is evidence of a timing, lifecycle, or concurrency problem.
- A diagnostic worth keeping goes behind the project's debug flag. Everything else is removed before you finish.
- When the evidence contradicts the hypothesis, drop it completely and re-orient on what the probe showed. Do not keep one because the code "looks like" the cause.

Which tool:

| Bug kind | Start with |
| --- | --- |
| Pure logic (wrong formula, off-by-one) | Static reading and a unit-level loop |
| Lifecycle, events, focus, async ordering | Logs while forming the hypothesis; two guesses in a row is the stop signal |
| Paint, stacking, compositor | DevTools layers and computed styles before any log |
| Performance | A measured baseline (timer, profiler, query plan), then bisect. Report before and after numbers |
| Tooling or system symptoms | Measure the lower layer first: OS versus post-processing, service versus UI, toolchain versus assertion, network versus client |

Full playbook: [references/logging-techniques.md](references/logging-techniques.md).

The step is done when you can write:

> "I believe the root cause is [X] because [evidence]."

Name a file, function, line, or condition. "A state management issue" is not testable. "Stale cache in `useUser` at `src/hooks/user.ts:42` because the dependency array is missing `userId`" is.

## 5. Fix and lock it

Fix the cause within the authorized scope. A prerequisite refactor, such as a shared interface change, is in scope once you say why it is needed. Ask only when the fix needs an unresolved behavior tradeoff or widens the task. File count alone is not a reason to ask. Keep unrelated refactors out. A bug-fix authorization does not cover an unrequested feature; name the feature and route it to its own workflow after the diagnosis.

Turn the shrunk repro into a test at a seam that exercises the real bug pattern. Run it red on the unfixed code, apply the fix, run it green, then re-run the original loop. If you forced the red by mutating code or a fixture, diff against a pristine copy before trusting it.

Prove the red run without touching the shared worktree:

```bash
git worktree add --detach "$TMPDIR/red" HEAD      # unfixed code
cp <new-test-file> "$TMPDIR/red/<same-path>"
(cd "$TMPDIR/red" && <test-command>)              # must fail, for the right reason
git worktree remove --force "$TMPDIR/red"
```

Two ways a regression test pins nothing:

- The framework lets an assertion fail mid-test without failing the test, so only the last assertion counts. Check with a two-line deliberate failure before trusting it.
- The test asserts that a wrong string is absent, and that string was never emitted by any version. Pair every negative assertion with a positive one in the same test.

If no seam can go red on this bug (one caller when the bug needs several, a unit that cannot replay the chain), say so: the module shape is preventing the bug from being locked down. Do not invent a test that cannot fail.

For a bug that recurred or was "fixed" before, the fix is not done until the regression test lives in the project's suite, was run red, and the commit message says why it recurred and why this fix holds. Every fix commit names the winning hypothesis.

## 6. Sweep for siblings

Run this after every root-cause fix, and whenever the user says "举一反三" or "其他地方有没有同样问题".

Extract the pattern signature (the function, regex, API call, selector, lock, skipped validation, or input boundary that produced the bug) and search for it:

```bash
rg -n '<signature>' . --glob '!{node_modules,dist,build,vendor,target}/**'
```

Always pass a path to `rg`. With no path and a stdin that is not a terminal, as in most agent shells, it reads stdin and hangs.

For a class of bug ("handlers missing the lock"), search the surrounding shape, not only the literal text. For every match, write one of: same bug (fixed), safe (why), or unsure (ask). Do not skip a match silently. Unrelated bugs found on the way are listed, not fixed, unless the user agrees.

## 7. Verify at the real runtime

Climb this ladder before calling it fixed:

1. Source trace: the function, state transition, or condition that produced the symptom.
2. The loop goes green, deterministically.
3. Runtime state proves the path ran: queue rows, DB rows, caches, generated files, external logs.
4. The narrow test or build passes.
5. For UI, native, rendering, or generated artifacts: open the real thing and check it with a screenshot or a concrete checklist. Compile-only is not enough.

If the runtime check is impossible here, say why and hand off the exact screen, command, or artifact to check. When only the reporter's environment shows the bug, send a read-only probe they can paste: one command, one block to paste back, printing the environment and the disputed state and nothing that could carry a secret or private path. Discover their layout in the probe; do not assume yours.

Before declaring done: every `[DEBUG-...]` line is gone, throwaway harnesses are deleted (or follow the repo's Cleanup principle when it has one), and the original loop no longer reproduces.

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

If the last good version is a few releases back, read `git diff <good>..HEAD -- <suspect path>` first. The regression is often visible there. Bisect only when the delta is too large.

Never bisect in a dirty checkout. Use a temporary worktree. If one cannot be created, stop and ask before cleaning or stashing anything.

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

List every reported and visible symptom in the user's words. Name the reference (last good commit, old build, fixture, screenshot). Define the pass/fail check before editing, then name the exact delta between current and reference. Do not turn a broken render, race, font pipeline, or state path into "style polish". Pure taste: tell the user to run `/design-ui`, and stop.

## Hard rules

- **Same symptom after a fix, or "let me just try this":** stop. The hypothesis is unfinished. Re-read the execution path from the start.
- **Three failed hypotheses:** stop and hand off (format below).
- **Rationalizations.** "I'm confident" means run the probe. "Probably the same issue" means re-read the path. "Works on my machine" means list the environment differences. Never restart more than twice without new evidence.
- **External tool fails:** find out why (server down, key invalid, config wrong) before switching tools.
- **A magic number tuned three times:** the bug is structural. Replace the independent values with one named token and look for the missing constraint.
- **"Slow" needs numbers:** baseline, fix, re-measure. "Feels faster" is not evidence.

## Gotchas

| What happened | Rule |
| --- | --- |
| Patched the wrong copy of a duplicated surface | Trace backward from what actually renders before touching a file |
| Orchestrator said RUNNING while a stage was misconfigured | Test each pipeline stage alone |
| A race was diagnosed as stale state | Check event timestamps and ordering before state |
| Passed locally, failed in CI | Align runtime version, env vars, and timezone before chasing code |
| Worked from the app, broke via file association, drag-drop, deep link, or proxy | Reproduce through the exact entry point the user used; cold-launch init differs |
| Fixed the reporter's setup, changed nothing for others or broke the default | State whether the fix changes the default path for everyone; prefer fixing the default |
| Broke after a theme, mode, or locale toggle, fine after restart | Trace the toggle's recompute path; do not tune styles while state is broken |
| Changed the algorithm, output stayed wrong | The reader may hit persisted output from the old code; invalidate or version the cache in the same change |
| Fixed one refusal reason, the same gate blocked the next user for another | Enumerate every branch that can refuse; give each a distinct code, reason, and next step |
| The user's observation and the log disagreed | Trust the observation; the gap is an un-instrumented path |
| Patched a capability-gated feature on a surface that lacks the capability | Confirm the simulator, device, or sandbox supports it before writing a fix |

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
```

Status: **resolved**, **resolved with caveats** (name them), or **blocked**.

### Handoff after three failed hypotheses

Status **blocked**, then: the symptom in one sentence; each hypothesis with how it was tested and why it was ruled out; the evidence collected (redacted log or stack excerpts, repro steps, versions, config); what is still unknown; and the next step, naming any access, tool, or context the user must supply.
