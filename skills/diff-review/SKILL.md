---
name: diff-review
description: "Reviews only the diff: a PR, uncommitted changes, or a change since a fixed point. Standards against the repo and a smell baseline, spec against the originating issue. Use when asked to review a diff before merge. Not for a whole-codebase review, root-cause debugging, shipping, or prose."
---

# Diff review

Run on `/diff-review`, a matching request, or a hand-off from another skill such as `rpi`. Started without `/diff-review`, say so in one line, with the reason. Work that belongs to another skill: say which and why, then switch to it, or name it (for example `/code-bugfix`) and stop.

Prefix your first line with 🥷 inline, not as its own paragraph. Do not trigger a host built-in `/review` from here.

Find what would hurt after this diff merges. The surface is the changed hunks, untracked files that belong to the change, and a sibling only when the diff fixes one instance of a shape. Other files are context, not findings.

Report only: never edit, commit, push, comment, merge, or close anything. The review writes only its round files, under `.scratch/diff-review/<slug>/`, where `<slug>` is the branch name with `/` replaced by `-` (for a PR, its head branch), as [references/scratch.md](references/scratch.md) says. A bug is `code-bugfix`, a whole-codebase review `architecture-review`, an unconfirmed feature or change `feature-new` or `feature-iterate`, an implement spec `to-implement-spec`, repo principles `project`.

Work steps 1 to 9 in order. For "review since X", a pinned commit, branch, or tag, or "standards versus spec", run step 1, then [references/two-axis.md](references/two-axis.md) in place of steps 2 to 9.

## 1. Protect the worktree

Run `git status --short --branch -uall`. Modified, staged, and untracked files are user work: review them, never move, hide, overwrite, clean, or discard them.

Never run `git switch`, `git checkout`, `git reset --hard`, `git clean`, any `git stash`, or `gh pr checkout` as setup. For a clean tree, use a separate worktree (step 8).

## 2. Resolve the diff

Infer the base from the request. Ask one question ([references/asking.md](references/asking.md)) only when two plausible bases would change the verdict.

| Request | How to get the diff |
| --- | --- |
| Local or uncommitted work | `git diff HEAD --stat` and `git diff HEAD`; `git ls-files -o --exclude-standard` for new files; `git log @{u}..HEAD --oneline` for unpushed commits when an upstream exists |
| A branch | `git diff <base-branch>...HEAD`; dirty files are a separate surface |
| A PR | `gh pr view <n> --json baseRefName,headRefOid,files,body` and `gh pr diff <n>`. Files at the PR head, without a checkout: `git fetch origin pull/<n>/head:refs/tmp/pr-<n>`, then `git show refs/tmp/pr-<n>:<path>` |
| Since the last release | The latest stable on the channel that ships (registry, store, or release host), as a tag: `git diff <tag>...HEAD` |
| Last N days | `base=$(git rev-list -1 --before="N days ago" HEAD)`, then `git diff "$base"...HEAD` |
| A known-good version | `git diff <good>...HEAD`. An unknown regression point is `code-bugfix` Bisect Mode |
| The whole project | Stop. That is `architecture-review` |

Read each untracked file; `git diff` never shows them. Freeze the base SHA, `git rev-parse HEAD`, and the file list. If `HEAD` or the worktree moves during the review, the verdict expires: re-read status and the full diff before signing off.

For a large or split diff, check the union of files read against the frozen list before calling it covered. Generated or locale files may share one check only when it covers every member. Name any file left unread.

## 3. Learn the project

Before judging, fill [references/project-context.md](references/project-context.md) from the repo's public files: verification commands, generated and protected files, risk paths.

- A check that runs only locally or only in CI says nothing about the other side.
- A documented project exception wins over this skill, and the report names it. Otherwise satisfy the stricter rule.
- Memory and earlier notes are leads, never a project rule.

## 4. Size and risk

| Depth | Size | Who reviews |
| --- | --- | --- |
| Quick | under 100 lines, 1 to 5 files | you |
| Standard | 100 to 500 lines, or 6 to 10 files | you, plus specialists whose trigger matches |
| Deep | over 500 lines, over 10 files, or auth, payments, or data mutation | you, all specialists, and the adversarial pass |

State the depth (size from `git diff --shortstat`). "全部", "deep", "深入", or "仔细" means full coverage of the frozen list regardless of size.

Static content (version strings, dates, one-for-one copy or locale changes) stays Quick at any size: read every line back and grep for consistency. Escalate when logic, generation rules, or user-facing meaning changes.

Risk follows paths, not size. A diff touching CI workflows, release or signing, an updater, auth, billing or license checks, an installer, privilege, or a deletion path needs a human maintainer's review, not an agent's or a bot's, named in the sign-off.

## 5. Scope

First, label the diff against the stated goal: **on target**, **drift**, or **incomplete**.

- Every changed file and new public surface traces to the goal in one sentence. What cannot, a refactor inside a fix, an unmentioned dependency, or a cleanup that adds UI, default config, workflow permissions, or release behavior is drift until shown necessary.
- A new setting, flag, environment variable, or command is drift without evidence of a real user split that one good default would not serve.
- Report each new file, option, fallback, layer, or abstraction the change still holds without as removable.

When findings cluster on one cause (a bug class patched again, problems from the architecture, a simple problem made complex), stop listing patches and state the route verdict first: keep, adjust, replace, or insufficient information. Name an alternative only when it removes the whole class at an acceptable migration cost. Skip this when the user settled the route or a feature doc or spec records it.

## 6. Read the hunks

Read each hunk's callers and consumers. Read the commit message before calling a change a regression: a deliberate maintainer change is not a finding. A new file name follows its directory's convention (locale, platform, or suffix).

**Sibling sweep.** When the diff fixes one instance of a shape, grep for the others (`rg -n '<signature>' .`, excluding vendored and generated directories; keep the `.`, or `rg` reads stdin and hangs). Each unswept sibling is a hard stop when it carries the same risk, advisory otherwise.

**Pattern checks.** Work each section of [references/review-patterns.md](references/review-patterns.md) whose trigger the diff contains.

**Command and install surfaces.** For a CLI entrypoint, installer, config or env handling, or a mutating command, work the CLI section of [references/release-surfaces.md](references/release-surfaces.md); for a skill, plugin, package manifest, generated mirror, or published archive, its Packaged Install section. After a change to terminal output, run the command and read the real output.

**Hard stops.** Any of these blocks merge:

- **Destructive auto-execution.** A step marked safe or automatic that changes user-visible state (history, config, installed software) without confirmation.
- **Source and distribution out of sync.** Generated or bundled outputs not rebuilt, a new file missing from the built archive, or version fields that disagree across manifests, changelog, tags, and lockfiles.
- **Injection and secrets.** SQL, shell, or a path built from input at an entry point; a credential hardcoded, logged, committed, or copied into docs.
- **Dependency surprise.** A new dependency or bump the goal does not need. Report a declared dependency with zero imports; do not remove it.
- **Unguarded safety sink**, as [references/project-context.md](references/project-context.md) lists them.
- **Hollow verifier.** A check that passes without running the real path: a skipped job that prints OK, an empty output passing a true-on-empty assertion, a render reported fixed but never opened.

## 7. Specialists (Standard and Deep)

Follow [references/persona-catalog.md](references/persona-catalog.md). Wait for every reviewer you started, or name its scope as unreviewed. Never say "no issues" while a reviewer is pending.

## 8. Verify

Run the project's own check for the changed surface, on the real artifact ([principles/prove-it-works.md](principles/prove-it-works.md)); with none documented, `bash <skill-base-dir>/scripts/run-tests.sh` from the target root runs a candidate. Report the exit status and failing lines, not passing logs.

- In a dirty or multi-agent checkout, verify in isolation:

  ```bash
  git worktree add --detach "$TMPDIR/review-wt" HEAD
  # only when the change under review is uncommitted: apply its paths, copy its untracked files
  git diff HEAD -- <paths in the change> | git -C "$TMPDIR/review-wt" apply
  # build and test inside $TMPDIR/review-wt, then
  git worktree remove --force "$TMPDIR/review-wt"
  ```

- Classify a failure as setup (missing tool, flaky service, bootstrap noise) or product. The repo is not broken until the test body actually ran.
- For a PR, read CI as data: `gh pr checks <n>` or `gh run view <id> --json status,conclusion`, not logs piped through `tail`. Zero check runs means nothing was verified.
- Judge every new or changed test, and every finding about a test, by [principles/test-behavior.md](principles/test-behavior.md). A bug fix needs a regression test that fails on the old code; ask whether it was run red. An updated snapshot proves nothing.
- A performance or size claim, anywhere, follows [principles/explain-the-number.md](principles/explain-the-number.md).
- For agent instructions and skills, check behavior (tool calls, the files they produce, forbidden side effects), not keywords. Run a new checker on one known-good and one known-bad case before trusting it.
- With no runnable check, say "based on reading the code", never "I verified".

## 9. Report

### Quality gate

Every finding needs all four, or it is dropped or made advisory:

1. The exact `file:line`.
2. The input or state that triggers the bad outcome.
3. Evidence that callers and consumers were read, labeled per [principles/show-the-evidence.md](principles/show-the-evidence.md). A `guess` is not a finding.
4. A severity a senior reviewer would raise in a real PR.

Refresh line numbers and state before citing them. Other reviewers' notes are leads, not evidence.

CRITICAL and HIGH also show why existing guards (validation, types, an upstream catch, a framework default) do not prevent it, or are MEDIUM at most.

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
Guards (read): the key is generated inside the loop (line 82), so the server cannot dedupe.
Check: fake server that commits then times out once; expect exactly one row.
```

Dropped: "Consider adding error handling to `upload()`." No line, no trigger, no consequence.

Zero findings against a stated surface is a complete review; never pad with noise.

### Shape

Open with the verdict and the base..head reviewed. Then findings by bug class, highest severity first, each class listing every site with `file:line`. Issues the diff did not introduce go in a separate `pre-existing` list, outside the verdict. With nothing found, write `no issues found` against the stated surface.

An invariant the diff adds that the docs do not hold yet is doc debt. Updating `AGENTS.md` is `project`.

Write each round's report, findings and sign-off, to `.scratch/diff-review/<slug>/round-<n>.md`. A first round removes older `round-*.md` files there. From the second round, review only the new diff, read the earlier round files for what was already reported (a fresh agent, such as an `rpi` astra job, has no other record), and never re-report a finding already reported. Delete the directory once the branch merges.

- A class that returns in a second round: suggest the structural fix at its source ([principles/encode-lessons.md](principles/encode-lessons.md)).
- A third round that still finds new problems goes back to the step 5 route verdict, which names the premise the fixes keep failing on, written down and tested first ([principles/attack-the-premise.md](principles/attack-the-premise.md)).

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
