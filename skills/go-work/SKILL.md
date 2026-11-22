---
name: go-work
description: Carry out an implement spec, docs/spec/<slug>.md, until its feature ships. A coordinator reads the spec once and never edits it, hands each step to a subagent that lands it as one commit with a Spec-Step trailer, runs steps the spec marks independent in parallel in temporary worktrees, and resumes from git history. The commit that lands the last step sets the feature to shipped and archives the spec. Use after to-implement-spec. Not for writing or changing a spec, deciding a feature, a bug, or a review.
disable-model-invocation: true
---

# go-work

User-invoked only: follow this skill only when the user ran `/go-work`. When the work belongs to another skill, name it (for example `/to-implement-spec`), say why, and stop. Do not invoke it yourself.

The input is one implement spec: a path, a slug, or nothing. With nothing, list the open specs (`ls docs/spec/*.md`). Take the only one, or ask which. With no open spec, name `/to-implement-spec` and stop.

This skill carries the spec out. It never changes what the spec says. A step that cannot be done as written stops the run. A wrong spec is `to-implement-spec`, and a wrong feature is `feature-iterate`. Reviewing the result is `diff-review`. A bug outside the spec is `code-bugfix`.

The session that runs this skill is the coordinator. It starts best in a new session, so that its context holds the spec and little else.

## Cost

Every turn re-sends the whole context. A prompt cache makes an unchanged prefix cheap, but whatever enters the context stays for every later turn: in one long context, step 1's file reads and test logs ride along through every step after it. So:

- **The coordinator stays small.** It holds the spec, the step list, and a few lines per step. It does not read code, print diffs, or keep test logs.
- **Each step runs in its own context**, a subagent that is discarded when the step lands. Only its short report comes back.
- **The spec is read once and never edited during the run.** Progress lives in git: each step's commit ends with the trailer `Spec-Step: <slug>#<n>`. No step re-reads a changed spec, parallel worktrees never conflict on it, and a run that stops resumes in a new session from `git log`.
- **Command output stays short.** Run a check as `<check> > "${TMPDIR:-/tmp}/go-work-<slug>.log" 2>&1; echo "exit=$?"`, and read only the tail of a failure (`tail -40`).
- **Parallel steps trade tokens for time.** Each parallel subagent builds its own picture of the code, and each new worktree starts with no installed dependencies and no build cache.

## Runner

Pick one at the start and use it for every step:

- **Fork:** a subagent that inherits this conversation. It starts with the spec and these rules already loaded, reuses this conversation's cached prefix, and keeps its tool output out of this context. Use it when the harness has one and this conversation is short. A fork of a long session, such as one that also decided the feature and wrote the spec, inherits all of that history.
- **Fresh subagent:** otherwise, when the harness has subagents. The brief names the spec and the step, and the subagent reads the spec once itself.
- **Inline:** when the harness has no subagents, or the spec has one step. Follow the brief below yourself: read only the lines you need, keep output short, and do not re-read the spec. When the context grows long (the harness warns, or earlier turns were summarized), finish the current step, stop, and tell the user to run `/go-work <slug>` in a new session. Nothing is lost, because progress is in git.

## Procedure

### 1. Start

```bash
git status --short
git ls-files --error-unmatch docs/spec/<slug>.md
git diff --quiet HEAD -- docs/spec/<slug>.md docs/feature/<slug>.md docs/GLOSSARY.md || echo uncommitted
git rev-parse HEAD                     # the run's start point
```

- **The spec is untracked, or the spec, its feature doc, or the glossary has uncommitted changes.** A worktree sees only commits. Show the files, and ask once whether to commit them as one docs commit. Do not start until they are committed.
- **Other uncommitted changes** stay as they are. Name them. Each step stages only its own files.
- **Read the spec once, whole.** Take setup and the check before commit from `### Commands` in `AGENTS.md`, which most harnesses have already loaded.
- **The feature hash.** The hash in the spec's header must equal `git hash-object docs/feature/<slug>.md`. When it does not, the feature changed after the spec was written: stop, and name `/to-implement-spec`. A spec with `Feature: none` has no hash.

### 2. Find what landed

```bash
base=$(git log -1 --diff-filter=A --format=%H -- docs/spec/<slug>.md)    # the commit that added this spec
git log --format='%(trailers:key=Spec-Step,valueonly)' "$base"..HEAD | grep '^<slug>#'
git log --all --not HEAD --grep='^Spec-Step: <slug>#' --format='%h %s'  # this spec's steps outside HEAD
```

- A step has landed when a commit since `base` carries its trailer.
- This spec's steps outside `HEAD`, on another branch or in another worktree, mean another run is working it, or a run left them unmerged. Name them, and stop until the user says which run goes on. Runs on different specs, in different worktrees, can go at once.
- A step is ready when it has not landed and every step in its `After` has.

### 3. Run the ready steps

Repeat until every step has landed or one is blocked.

- **One ready step**, or the user asked for one at a time: run it in this worktree.
- **Several ready steps:** run up to three at once, or as many as the user said, each in its own temporary worktree from `HEAD`. Steps the spec does not order with `After` change different modules and files. Start them together.

  ```bash
  git worktree add --detach "${TMPDIR:-/tmp}/go-work-<repo>-<slug>-<n>" HEAD
  ```

  A detached worktree adds no branch. Run the setup command in it first. When setup is a cold build that takes minutes, as in a large Rust or C++ tree, run the steps one after another instead.

Each step gets this brief. A fork already holds the spec and `AGENTS.md`, so it skips reading them.

```text
Land step <n> of the implement spec docs/spec/<slug>.md.
[Parallel steps only:] Work only in <worktree path>, and run every command there.

Read the spec once. Follow AGENTS.md; read it only if it is not already in your context. Do exactly step <n>, with the interfaces, data, and tests the spec gives for it. Steps <landed numbers> have landed. Do not redo them, and do not start another step.
- Do not edit the spec. When the step cannot be done as written (an interface does not fit, a test cannot pass, the step needs a change the spec does not name), stop without committing and say why.
- Run the step's Check with its output to a log file. Read only the tail of a failure.
- Stage only this step's files. Make one commit: an imperative subject under 72 characters, a blank line, then the trailer `Spec-Step: <slug>#<n>`.
- Do not push, create branches, or touch another worktree.

Reply in at most three lines:
landed <hash> | blocked: <why>
check: <command> exit <code>
note: <only what a later step must know, such as a name that differs from the spec>
```

### 4. Take each report

- **Verify the commit** without reading its diff: `git show --stat --format='%h %s%n%(trailers:key=Spec-Step,valueonly)' <hash>`. The trailer is there, and the files fit the step.
- **Bring parallel steps into this worktree** in step-number order: `git cherry-pick <hash>`, then run the step's Check. On a conflict, `git cherry-pick --abort`, and run that step again here on the new `HEAD`. Then remove its worktree: `git worktree remove --force <path>`.
- **A Check that fails here** goes back once with the log tail: to the same subagent when the harness can continue one, else to a new one. The fix amends that commit. A second failure blocks the step.
- **A blocked step** ends the run. Let the steps already running finish, bring in the ones that landed, and stop. Report the reason and the steps still open. Do not patch the spec or work around it.
- **Keep only the report lines.** Do not re-read the spec: it has not changed.

### 5. Finish

When the last step has landed:

1. Run the check before commit on the whole tree, quietly. A failure stops the run: report it with the log tail.
2. Amend the last step's commit so it also closes the spec: set the feature doc's Status to `shipped`, and run `git mv docs/spec/<slug>.md docs/spec/archived/<YYYY-MM-DD>-<slug>.md`, dated today. When `docs/spec/archived/.ignore` is missing, create it holding `*`. Then `git commit --amend --no-edit`; when that commit is already pushed, make a new commit instead. A spec with `Feature: none` is only archived.
3. Run `git worktree list`, remove every worktree this run added, and run `git worktree prune`.
4. Report `git log --oneline <start>..HEAD`, any blocked step, and the final check. The next step is `/diff-review` on `<start>..HEAD`. Do not push.
