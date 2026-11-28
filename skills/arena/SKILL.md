---
name: arena
description: "Run several independent candidates at the same task in parallel, each in its own worktree or directory, then judge them against a rubric fixed before any of them started, with a cross-judge from another model family when the harness has one; pick the strongest as the base, graft the best parts of the others into it by hand, and verify the result. Use when the user runs /arena or asks to throw a task into the arena, or when one attempt at a non-trivial artifact (a design, an interface, an algorithm, a document) would lock in the wrong shape. Costs one agent per candidate plus a judge. Not for a small change, a bug (code-bugfix), or a design one sketch can settle (architect)."
disable-model-invocation: true
---

# arena

User-invoked only: follow this skill only when the user ran `/arena`. When the work belongs to another skill, name it (for example `/architect`), say why, and stop. Do not invoke it yourself.

**Cost.** Each candidate and the judge build their own picture of the code from scratch. Before launching, say how many agents will run.

Open a todo list, or the harness's plan, with one entry per phase before launching anything: Frame, Fan out, Cross-judge, Pick, Graft, Verify.

Files the candidates, the judge, and you all read go in `.scratch/arena/<slug>/`, as [references/scratch.md](references/scratch.md) says: each candidate's rationale and the judge's report.

## A. Frame

Every candidate gets the same brief: the brief is the contract.

1. **The artifact.** State what each candidate produces, as a brief: the goal, the constraints, the files and docs to read first, and what done looks like.
2. **The rubric.** 3 to 6 concrete criteria you can grade on this task, such as "each piece of state has one owner", "a caller needs only `open` and `close`", "handles a reconnect mid-write", "test X passes". Write it now, before seeing any output. Candidates see only the brief, never the rubric. A criterion graded by a measured number (a latency, a size, a pass rate) states the result that decides it and the noise floor, as [principles/explain-the-number.md](principles/explain-the-number.md) says.
3. **The runners.** Three by default, never fewer than two, rarely more than five. Candidates must differ in structure, not in detail, as [principles/compare-real-options.md](principles/compare-real-options.md) says.
   - When the harness can run subagents on other models, seat one candidate each on `gpt-6.2-astra`, `gpt-6.2-sol`, and `claude-opus-5-5` ([references/models.md](references/models.md)), each a fresh agent, never this session, which has seen the rubric: different training gives different shapes. When a model is unavailable, take the nearest of the same family or drop the seat, keep at least two, and say so.
   - Otherwise run your own model several times.
   - Give each seat one direction as an added line in its brief, and keep the rest shared: the user's named design directions when they want those compared, otherwise, when seats share one model family, a different structural one (where the state lives, where the boundary falls, who calls whom).
4. **The places.** Each candidate gets its own worktree or directory, and no two share one, as [principles/separate-shared-state.md](principles/separate-shared-state.md) says. For code, a detached worktree: `git worktree add --detach "${TMPDIR:-/tmp}/arena-<slug>-<n>" HEAD`. Otherwise a directory, `.scratch/arena/<slug>/candidate-<n>/`. A worktree sees only commits: when the task depends on uncommitted work, say so and ask whether to commit it first.

## B. Fan out

Launch every candidate in one message, in the background when the harness allows it. Keep each candidate's work in its path and its reply short, as [principles/guard-the-context.md](principles/guard-the-context.md) says: you read the artifacts from disk in D, not from the replies. Each gets:

```text
Read <absolute path of this skill's directory>/references/worker.md before anything else.

<the brief from Frame>

Work only in <path>. Produce the artifact there. For code, make one local commit in that worktree.
Then write <repo>/.scratch/arena/<slug>/rationale-<n>.md: the shape you chose in three to five lines, the alternatives you considered, and why you rejected each.
Reply with the path, the commit hash if any, and one line on the shape.
```

When a candidate produces nothing, go on with the rest and note the dropout. With fewer than two left, stop and report.

## C. Cross-judge

After every candidate has finished, launch one read-only judge. Seat it on `gpt-6.2-astra` when the harness offers it, else on a model family other than yours; when you do not know your own model, say the check did not run. A judge on the same model as a candidate is told no authors, and the report says it shared a model with one. Its brief starts with the same worker line, then gives the brief, the rubric, and the candidate paths labelled only `candidate-1` to `candidate-N`, never by the model that made them. Ask for a score on each criterion for each candidate, a line of evidence for each score (`file:line` or a quote), and a recommended base, all written to `.scratch/arena/<slug>/judge.md`; the reply is the recommended base, the leading candidate per criterion, and the path. A score that rests on a measured number reports its run count, spread, and what bounds it, as [principles/explain-the-number.md](principles/explain-the-number.md) says.

It runs while you do D. When no judge can run, skip it and say so.

## D. Pick a base

Read every candidate end to end, with its rationale, before picking. Score each one criterion by criterion with evidence, not on an overall feel. Then compare with the judge. Agreement on the base confirms the pick. Disagreement means one of you is biased or the rubric was ambiguous: read the judge's evidence for that criterion in `judge.md` and both rationales, decide, and name the criterion that split you.

Pick the base a future maintainer can extend most easily without breaking its invariants. When two tie, take the cleaner boundary or the smaller interface, then the smaller change.

## E. Graft

Walk each losing candidate once more for what is worth porting: usually one or two things each, not most of it. Fold each graft in by hand, as if the base had had the idea from the start, and carry it through its types, callers, tests, and docs, so the result is one design under one mental model. Do not paste blocks across.

- **They converged** on one shape: that is strong agreement. Note it and ship the shared shape. No graft is needed.
- **They diverged wildly:** the frame was too loose. Tighten the brief or the rubric and run again rather than averaging the divergence. A second run costs as much as the first, so ask before starting it.

Bring the base into the user's tree without committing: `git cherry-pick --no-commit <hash>` for code, or copy the files for anything else. Then make the grafts there.

## F. Verify

Verify the synthesized artifact as [principles/prove-it-works.md](principles/prove-it-works.md) says: run the code and its tests, render the page, read the actual output. A candidate's report of its own run is not proof.

When verification finds a problem the arena missed, either the frame was wrong (frame again, run again) or a candidate had caught it and the graft missed it (back to E). Do not paper over it. When two grafts have failed the same check, follow [principles/attack-the-premise.md](principles/attack-the-premise.md) before a third.

Remove every worktree this run added (`git worktree remove --force <path>`, then `git worktree prune`) and `.scratch/arena/<slug>/` once the user no longer wants to read the losing candidates. Name them in the note until then.

## Output

One synthesized artifact, uncommitted in the user's tree unless they asked for a commit, and a synthesis note beside it:

```
base:        candidate-<n> (<seat>), because <rubric terms>
judge:       <seat>: agreed / disagreed on <criterion> / skipped (why)
grafts:      <what> from candidate-<m>; ...
rejected:    <what> from candidate-<k>, because <why>
shape:       converged / diverged; dropouts: none / <which>
verify:      <command> -> pass / fail
candidates:  <paths>, removed / kept until <when>
```
