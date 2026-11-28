---
name: go-work
description: "Carry out an implement spec, docs/spec/<slug>.md, until its feature ships: a coordinator reads the spec once, runs each step in its own subagent as one commit with a Spec-Step trailer, runs independent steps in parallel worktrees, resumes from git history, and archives the spec at the end. Use when the user asks to build, implement, continue, or resume a feature that has an open spec (开始实现, 继续做, 按 spec 实现). Not for code changes without a spec, or for writing or changing a spec, which is to-implement-spec."
---

# go-work

Run this skill when the user ran `/go-work`, or when the request matches the description. When you start it without `/go-work`, say so in one line, with the reason. When the work belongs to another skill, switch to it, or name it and stop.

The input is a spec path, a slug, or nothing. With nothing, list the open specs (`ls docs/spec/*.md`) and take the only one, or ask which. With no open spec, name `/to-implement-spec` and stop. A code change with no feature behind it needs no skill.

This skill never changes what the spec says. A wrong spec is `to-implement-spec`, a wrong feature is `feature-iterate`, reviewing the result is `diff-review`, and a bug outside the spec is `code-bugfix`.

Stop for the user only to ask which spec, whether to commit the docs, and which run goes on. Ask following [references/asking.md](references/asking.md). A blocked step is reported, not asked.

The session that runs this skill is the coordinator. In a long session, say so and use fresh subagents, not forks.

## Cost

Keep the coordinator's context small ([principles/guard-the-context.md](principles/guard-the-context.md)):

- **The coordinator** holds the spec, the step list, and a few lines per step. It does not read code, print diffs, or keep logs.
- **The spec is never edited during the run.** Progress lives in git: each step's commit ends with the trailer `Spec-Step: <slug>#<n>`, so a stopped run resumes in a new session from `git log`.
- **Command output stays short.** Run a check as `<check> > "${TMPDIR:-/tmp}/go-work-<slug>.log" 2>&1; echo "exit=$?"`, and read only the tail of a failure (`tail -40`).

## Runner

Pick one at the start for every step:

- **Fork:** a subagent that inherits this conversation. Use it when the harness has one and this conversation is short.
- **Fresh subagent:** otherwise, when the harness has subagents.
- **Inline:** when the harness has no subagents, or the spec has one step. Follow the brief below yourself, reading only the lines you need. When the context grows long (the harness warns, or earlier turns were summarized), finish the current step, stop, and tell the user to run `/go-work <slug>` in a new session.

## Procedure

### 1. Start

```bash
git status --short
git ls-files --error-unmatch docs/spec/<slug>.md
git diff --quiet HEAD -- docs/spec/<slug>.md docs/feature/<slug>.md docs/GLOSSARY.md || echo uncommitted
git rev-parse HEAD                     # the run's start point
```

- **The spec is untracked, or the spec, its feature doc, or the glossary has uncommitted changes.** Show the files, and ask once whether to commit them as one docs commit. Start only once they are committed.
- **Other uncommitted changes** stay as they are. Name them.
- **Read the spec once, whole.** Take setup and the check before commit from `### Commands` in `AGENTS.md`.
- **The feature hash** in the spec's header must equal `git hash-object docs/feature/<slug>.md`. When it does not, stop, and name `/to-implement-spec`. A spec with `Feature: none` has no hash.
- **Each step is a verifiable unit** ([principles/sequence-verifiable-units.md](principles/sequence-verifiable-units.md)). A step with no `Check:`, or with a Check that cannot fail when the step is wrong, cannot be done as written: stop, and name `/to-implement-spec`.

### 2. Find what landed

State comes from git ([principles/make-operations-idempotent.md](principles/make-operations-idempotent.md)). Run this on every start, including a resume.

```bash
base=$(git log -1 --diff-filter=A --format=%H -- docs/spec/<slug>.md)    # the commit that added this spec
git log --format='%(trailers:key=Spec-Step,valueonly)' "$base"..HEAD | grep '^<slug>#'
git log --all --not HEAD --grep='^Spec-Step: <slug>#' --format='%h %s'  # this spec's steps outside HEAD
git worktree list | grep "go-work-.*-<slug>-"                            # worktrees a stopped run left
```

- A step has landed when a commit since `base` carries its trailer.
- This spec's steps outside `HEAD` mean another run is working it or left them unmerged. Name them, and stop until the user says which run goes on. Runs on other specs, in other worktrees, can go at once.
- A leftover `go-work-<repo>-<slug>-<n>` worktree with no commit outside `HEAD` is stale. Remove it.
- A step is ready when it has not landed and every step in its `After` has.

### 3. Run the ready steps

Repeat until every step has landed or one is blocked.

- **One ready step**, or the user asked for one at a time: run it here.
- **Several ready steps:** start up to three at once, or as many as the user said. Each gets its own temporary worktree from `HEAD` ([principles/separate-shared-state.md](principles/separate-shared-state.md)):

  ```bash
  git worktree add --detach "${TMPDIR:-/tmp}/go-work-<repo>-<slug>-<n>" HEAD
  ```

  Run the setup command in it first. When setup is a cold build that takes minutes, run the steps one after another instead.

Each step gets this brief. A fork skips reading the spec and `AGENTS.md`.

```text
Read <absolute path of this skill's directory>/references/worker.md before anything else.

Land step <n> of the implement spec docs/spec/<slug>.md.
[Parallel steps only:] Work only in <worktree path>, and run every command there.

Read the spec once. Follow AGENTS.md; read it only if it is not already in your context. Do exactly step <n>, with the interfaces, data, and tests the spec gives for it. Steps <landed numbers> have landed. Do not redo them or start another step.
- Do not edit the spec. When the step cannot be done as written (an interface does not fit, a test cannot pass, the step needs a change the spec does not name), stop without committing and say why.
- Each test you add follows <absolute path of this skill's principles/test-behavior.md>. Its expected values come from the spec, not from the code.
- Run the step's Check with its output to a log file. Read only the tail of a failure.
- Stage only this step's files. Make one commit: an imperative subject under 72 characters, a blank line, then the trailer `Spec-Step: <slug>#<n>`. The subject says what the step changes, in glossary terms, as `technical-writing` gives a commit message.
- Do not create branches or touch another worktree.

Reply in at most three lines:
landed <hash> | blocked: <why>
check: <command> exit <code>
note: <only what a later step must know, such as a name that differs from the spec>
```

### 4. Take each report

A report is a claim ([principles/prove-it-works.md](principles/prove-it-works.md)):

- **Verify the commit** without reading its diff: `git show --stat --format='%h %s%n%(trailers:key=Spec-Step,valueonly)' <hash>`. The trailer is there, and the files fit the step.
- **Run the step's Check here** on the landed commit. For a parallel step, first bring it into this worktree in step-number order: `git cherry-pick <hash>`. On a conflict, `git cherry-pick --abort`, and run that step again here on the new `HEAD`. Then remove its worktree: `git worktree remove --force <path>`.
- **A Check that fails here** goes back once with the log tail: to the same subagent when the harness can continue one, else to a new one. The fix amends that commit.
- **A second failure** blocks the step. Before any third attempt, follow [principles/attack-the-premise.md](principles/attack-the-premise.md). A premise that the spec states is a wrong spec, and goes to `to-implement-spec`.
- **A blocked step** ends the run. Let running steps finish, bring in the ones that landed, and stop. Report the reason and the steps still open. Do not work around it.
- **Keep only the report lines.** Do not re-read the spec.

### 5. Finish

When the last step has landed:

1. Run the check before commit on the whole tree, quietly. On a failure, stop and report the log tail.
2. Amend the last step's commit so it also closes the spec: set the feature doc's Status to `shipped`, and run `git mv docs/spec/<slug>.md docs/spec/archived/<YYYY-MM-DD>-<slug>.md`, dated today. When `docs/spec/archived/.ignore` is missing, create it holding `*`. Then `git commit --amend --no-edit`; when that commit is already pushed, make a new commit instead. A spec with `Feature: none` is only archived.
3. Remove every worktree this run added (`git worktree list`), then run `git worktree prune`.
4. Report `git log --oneline <start>..HEAD`, any blocked step and its reason, and the final check. The next step is `/diff-review` on `<start>..HEAD`. Do not push.
