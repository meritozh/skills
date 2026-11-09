---
name: diff-review
description: "Reviews only the diff: a PR, uncommitted changes, or a change since a fixed point. Standards against the repo and a smell baseline, spec against the originating issue. Use when asked to review a diff before merge. Not for a whole-codebase review, root-cause debugging, shipping, or prose."
when_to_use: "diff review, review, 看看代码, 检查一下, 合并前, 看看PR, before merge, review since, code review"
dispatch_intent: "Diff-scoped review, before merge, two-axis standards and spec review of a change"
---

# Diff review

Prefix your first line with 🥷 inline, not as its own paragraph.

Do not re-trigger a host built-in `/review` from inside this skill.

Find what would hurt after this diff merges. The review surface is the diff: changed hunks, untracked files that belong to the change, and a sibling only when the diff fixes one instance of a shape. A file the diff does not touch is context, not a finding.

This skill is report-only. It does not edit files, apply fixes, commit, push, comment, merge, or close anything. A bug is `code-fix`. A whole-codebase review is `codebase-review`. An unconfirmed idea is `design-idea`. A confirmed module design is `design-code`. Repo principles are `project`. Prose review goes to `/write`.

Done means every file in the frozen diff was read, every finding passes the quality gate, and every verification claim comes from a command run in this session.

## Workflow

1. Protect the worktree.
2. Resolve the diff and freeze it.
3. Learn the project's rules and verification commands.
4. Size the diff and name its risk.
5. Check scope against the stated goal.
6. Read each hunk with its callers and consumers.
7. Run specialists (Standard and Deep only).
8. Verify on the changed surface.
9. Report findings, then sign off.

For "review since X", a pinned commit, branch, or tag, or "standards versus spec", run step 1, then load [references/two-axis.md](references/two-axis.md). It replaces steps 2 to 9. The quality gate and sign-off below still apply.

## 1. Protect the worktree

```bash
git status --short --branch -uall
```

Modified, staged, and untracked files are user work. Read them and review them. Do not move, hide, overwrite, clean, or discard them.

Never run these as review setup: `git switch`, `git checkout`, `git reset --hard`, `git clean`, any `git stash`, or `gh pr checkout`. When a clean tree is needed to build or test, use a separate worktree (step 8).

## 2. Resolve the diff

Infer the base from the request. Ask one narrow question only when two plausible bases would change the verdict.

| Request | How to get the diff |
| --- | --- |
| Local or uncommitted work | `git diff HEAD --stat` and `git diff HEAD`; `git ls-files -o --exclude-standard` for new files; `git log @{u}..HEAD --oneline` for unpushed commits when an upstream exists |
| A branch | `git diff <base-branch>...HEAD` (three dots diff against the merge base); dirty files are a separate surface |
| A PR | `gh pr view <n> --json baseRefName,headRefOid,files,body` and `gh pr diff <n>`. To read files at the PR head without a checkout: `git fetch origin pull/<n>/head:refs/tmp/pr-<n>`, then `git show refs/tmp/pr-<n>:<path>` |
| Since the last release | Find the latest stable from the channel that actually ships (registry, store, or release host), map it to a tag, then `git diff <tag>...HEAD` |
| Last N days | `base=$(git rev-list -1 --before="N days ago" HEAD)`, then `git diff "$base"...HEAD` |
| A known-good version | `git diff <good>...HEAD`. If the regression point itself is unknown, that is `code-fix` Bisect Mode |
| The whole project | Stop. That is `codebase-review` |

Untracked files never appear in `git diff`. Read each one.

Freeze before reviewing: the base SHA, `git rev-parse HEAD`, and the file list. If `HEAD` or the worktree moves during the review, the verdict expires. Re-read status and the full diff before signing off.

When the diff is split across reviewers or is large, check the union of files actually read against the frozen list before saying the diff is covered. Generated or locale files may share one check only when that check covers every member. Name any file left unread.

## 3. Learn the project

Read the public rules before judging: `AGENTS.md` or `CLAUDE.md`, `CONTRIBUTING.md`, README, manifests, CI workflows, `Makefile` or package scripts. Extract the verification commands, the generated and protected files, and the paths that carry risk. [references/project-context.md](references/project-context.md) is the checklist.

- Read the CI workflow, not the sentence describing it. A check that runs only locally or only in CI says nothing about the other side.
- A documented project exception wins over this skill, and the report names it. Otherwise satisfy the stricter rule.
- Memory and earlier notes are leads. The current diff, CI, and docs override them. Never cite private memory as a project rule.

## 4. Size and risk

| Depth | Size | Who reviews |
| --- | --- | --- |
| Quick | under 100 lines, 1 to 5 files | you |
| Standard | 100 to 500 lines, or 6 to 10 files | you, plus specialists whose trigger matches |
| Deep | over 500 lines, over 10 files, or auth, payments, or data mutation | you, all specialists, and the adversarial pass |

`git diff --shortstat` gives the size. State the depth. "全部", "deep", "深入", or "仔细" means full coverage of the frozen list regardless of size.

Static content stays Quick even across many files: version strings, dates, one-for-one copy or locale changes. Read every line back and grep for consistency. Escalate only when logic, generation rules, or user-facing meaning changes.

Risk follows paths, not size. A diff touching CI workflows, release or signing, an updater, auth, billing or license checks, an installer, privilege, or a deletion path needs a human maintainer's review whatever its size. An agent, bot, or automated approval does not replace it. Say so in the sign-off.

## 5. Scope

Before hunting bugs, label the diff against the stated goal: **on target**, **drift**, or **incomplete**.

- Every changed file and new public surface traces to the goal in one sentence. A file that cannot, a refactor inside a fix, an unmentioned dependency, or a cleanup that adds UI, default config, workflow permissions, or release behavior is drift until shown necessary.
- For each new setting, flag, environment variable, or command, ask who would change it and why one good default would not serve them. With no evidence of a real user split, report it as drift.
- Over-design pass, every time: for each new file, option, fallback, layer, or abstraction, ask whether the change still holds with it removed. Report each one that does as removable.

When findings cluster on one cause (the same bug class patched again, problems that follow from the architecture, a simple problem made complex), stop listing patches. State the route verdict first: keep, adjust, replace, or insufficient information. Name an alternative only when it removes the whole class at an acceptable migration cost. Skip this when the user said the route is settled or a design doc records the decision.

## 6. Read the hunks

For each hunk, read the upstream callers and downstream consumers, not the function alone. Read the commit message before calling a change a regression: a deliberate maintainer change is a decision, not a finding. A new file name follows the convention already in its directory (locale, platform, or suffix).

**Sibling sweep.** When the diff fixes one instance of a shape, grep for the others (`rg -n '<signature>' .`, excluding vendored and generated directories; without the `.`, `rg` in an agent shell reads stdin and hangs). List each unswept sibling: a hard stop when it carries the same risk, advisory otherwise.

**Pattern checks.** Load only the matching section of [references/review-patterns.md](references/review-patterns.md) when the diff contains: a recurring or hard-to-observe bug, branching on captured output, a fixed sleep or timeout, a simplification or deletion, a restored symbol, a write over a user file, a destructive matcher, a rule computed in two places, a new test, a migration, an identifier the diff assumes exists, or a dependency change.

**Command and install surfaces.** When the diff touches a CLI entrypoint, installer, config or env handling, or a mutating command, work the CLI section of [references/release-surfaces.md](references/release-surfaces.md). When it touches a skill, plugin, package manifest, generated mirror, or published archive, work its Packaged Install section. Library tests and manifest JSON do not prove installed behavior. After a change to terminal output, run the command and read the real output.

**Hard stops.** Any of these blocks merge:

- **Destructive auto-execution.** A step marked safe or automatic that changes user-visible state (history, config, preferences, installed software) without confirmation.
- **Source and distribution out of sync.** Generated or bundled outputs not rebuilt, a new helper or reference missing from the built archive, or version fields that disagree across manifests, changelog, tags, and lockfiles.
- **Injection and secrets.** SQL, shell, or path built from input at an entry point. A credential hardcoded, logged, committed, or copied into docs.
- **Dependency surprise.** A new dependency or version bump the goal does not need. A declared dependency with zero imports is reported, not removed.
- **Unguarded safety sink.** Deleting or overwriting files, building shell or AppleScript commands, path or symlink traversal, sandbox or approval changes, signing or update feeds, or auth prompts without validation, rollback, and confirmation.
- **Hollow verifier.** A check that passes without running the real path: a skipped job that prints OK, an early return that leaves output empty so a true-on-empty assertion passes, a render reported fixed but never opened.

## 7. Specialists (Standard and Deep)

Load [references/persona-catalog.md](references/persona-catalog.md). It decides which specialists run, how their claims are verified, and how the Deep adversarial pass works. Wait for every reviewer you started, or name its scope as unreviewed. Never say "no issues" while a reviewer is pending.

## 8. Verify

Run the project's own check for the changed surface. When none is documented, `bash <skill-base-dir>/scripts/run-tests.sh` from the target root prints and runs a candidate command. Report the exit status and the failing lines, not full passing logs.

- In a dirty or multi-agent checkout, a local pass is not proof: other work in the tree can supply a missing symbol or hide a break. Verify in isolation:

  ```bash
  git worktree add --detach "$TMPDIR/review-wt" HEAD
  # only when the change under review is uncommitted: apply its paths, copy its untracked files
  git diff HEAD -- <paths in the change> | git -C "$TMPDIR/review-wt" apply
  # build and test inside $TMPDIR/review-wt, then
  git worktree remove --force "$TMPDIR/review-wt"
  ```

- A failing check needs a cause: setup (missing tool, flaky service, bootstrap noise) or product. Do not call the repo broken until the test body actually ran.
- For a PR, read CI as data: `gh pr checks <n>` or `gh run view <id> --json status,conclusion`. Piping logs through `tail` hides the exit code. Zero check runs means nothing was verified, not that something passed.
- For a bug fix, a regression test must exist that fails on the old code. Ask whether it was run red. An updated snapshot does not prove the new output is right.
- For agent instructions and skills, a keyword check proves the text is there, not that an agent follows it. A behavior check inspects tool calls and the files they produce, including forbidden side effects. Before trusting a new checker, run it on one known-good and one known-bad case.
- With no runnable check, finish the review from reading and say so: "based on reading the code", never "I verified".

## 9. Report

### Quality gate

Every finding needs all four, or it is dropped or downgraded to advisory:

1. The exact `file:line`.
2. The input or state that triggers the bad outcome.
3. Evidence that callers and consumers were read.
4. A severity a senior reviewer would raise in a real PR.

Refresh line numbers and state in this turn before citing them. Earlier context and other reviewers' notes are leads, not evidence.

CRITICAL and HIGH also need why existing guards (validation, types, an upstream catch, a framework default) do not already prevent it. If you cannot show that, it is MEDIUM at most.

| Severity | Meaning |
| --- | --- |
| CRITICAL | Data loss, a security hole, or a broken main path as soon as it merges |
| HIGH | Wrong behavior on a realistic input |
| MEDIUM | Wrong on an edge case, or makes the next change risky |
| LOW | Advisory |

A finding that passes:

```
[HIGH] src/sync/upload.ts:88  retry after a timeout re-sends with a new idempotency key
Trigger: the first POST commits but times out; the retry creates a second row.
Guards: the key is generated inside the loop (line 82), so the server cannot dedupe.
Check: fake server that commits then times out once; expect exactly one row.
```

A finding that gets dropped: "Consider adding error handling to `upload()`." No line, no trigger, no consequence.

A clean review is a complete review. Zero findings against a stated surface is a valid result. Padding with low-confidence noise is worse than reporting nothing.

### Shape

Open with one plain line: the verdict and the base..head reviewed. Then findings grouped by bug class, highest severity first. Each class lists every site with `file:line`. Issues the diff did not introduce go in a separate `pre-existing` list and do not count toward the verdict. With nothing found, write `no issues found` against the stated surface.

When the diff adds an invariant the docs do not hold yet, name it as doc debt. Updating `AGENTS.md` is `project`.

Repeated reviews converge. From the second round, review only the new diff and never re-report a finding already reported. A third round that still finds new problems goes back to the route verdict in step 5. A class that returns in a second round is fixed at its source (a lint rule, a type, a gate), not site by site.

### Sign-off

```
status:        review only / blocked on <what>
reviewed:      <base-sha>..<head-sha>, plus N dirty or untracked files
size:          N files (+X -Y), depth quick / standard / deep
risk:          none / <paths>: human review needed
scope:         on target / drift: <what> / incomplete: <what>
removable:     none / <what>
user-visible:  none / <entry, UI, copy, or behavior changed>
findings:      N critical, N high, N medium, N low; N pre-existing
sibling sweep: N sites checked / not applicable
specialists:   security, architecture / none
doc debt:      none / <invariant not yet written down>
verification:  <command> -> pass / fail / not run (why)
```
