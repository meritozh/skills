---
name: pr
description: "Write a pull request's title and body from its diff: a Summary whose visual comes from the show-me skill, Evidence as before and after from checks actually run, and Merge Danger as a one-way or two-way door and a blast radius. Opens or updates the PR only when asked. Use when the user asks to write or update a PR description, or to open a PR for the current branch (写 PR, 开 PR, PR 描述). Not for reviewing a diff (diff-review), for commit messages, or for building the change (go-work)."
---

# pr

Run this skill when the user ran `/pr`, or when the request matches the description. When you start it without `/pr`, say so in one line so the user can redirect. When the work belongs to another skill, name it (for example `/diff-review`), say why, and stop.

A PR body is read by a reviewer who was not in the conversation and has to decide whether to merge. It answers three questions, in this order: what changed (**Summary**), does it work (**Evidence**), and what goes wrong if it does not (**Merge Danger**). Every claim in it follows [principles/show-the-evidence.md](principles/show-the-evidence.md).

This skill writes the title and body. It does not review the diff (`diff-review`), fix what it finds (`code-bugfix`), or change the code. Something wrong that you notice on the way goes into your reply to the user, not into the body.

## 1. Resolve the diff

Do not switch branches, stash, reset, or check out anything. Read the diff where it is.

```bash
git status --short --branch
gh pr view --json number,url,baseRefName,title,body 2>/dev/null   # an open PR for this branch
```

- **Base.** The open PR's base. Otherwise the remote's default branch (`git symbolic-ref --short refs/remotes/origin/HEAD`). Otherwise ask, with the question tool following [references/asking.md](references/asking.md).
- **The change.** `git diff <base>...HEAD --stat`, then the hunks, and `git log <base>..HEAD --format='%h %s%n%b'`. Read the hunks, not only the commit subjects.
- **Uncommitted changes** are not in the PR. Name them to the user. Do not describe them in the body.
- **Where it came from.** A `Spec-Step: <slug>#<n>` trailer points to `docs/feature/<slug>.md` and the spec under `docs/spec/` or `docs/spec/archived/`. An issue number in a commit or the branch name points to the issue. Read the feature doc's opening and its `## Decisions`; they say why.
- **The repo's PR template** (`.github/pull_request_template.md`, `.github/PULL_REQUEST_TEMPLATE/`, `docs/pull_request_template.md`) wins over the template below: fill its sections, and put Summary, Evidence, and Merge Danger where they fit in it.

## 2. Title

Imperative, under 72 characters, in the domain's terms from `docs/GLOSSARY.md`. Follow the convention the repo's history already uses (`git log --oneline -20`), such as a Conventional Commits prefix. The title says what the change does for its user, not which files it touches.

## 3. Summary

One sentence of why: the outcome or the problem, in the user's domain language, linked to the feature doc or the issue when there is one.

Then invoke the `show-me` skill for the visual, with this brief:

```text
Topic: the change <base>...<head> in this repo. Draw it from the diff.
Reader: a reviewer who was not in this conversation.
Destination: published Markdown, a GitHub PR body. Fenced text, diff, mermaid, or code blocks only.
Wanted: the one visual, two at most, that shows what this change does to the shape of the code: usually a diff-shaped sketch against the structure that already exists.
```

Put what it returns under the sentence of why. Do not draw the visual yourself, or reword the names in it.

When `show-me` cannot be invoked because it is not installed, stop before writing the body and tell the user: `npx skills add meritozh/skills --skill show-me -g`.

## 4. Evidence

Concrete proof that the change works, as a before and after, by [principles/prove-it-works.md](principles/prove-it-works.md). Every result comes from something run in this session or from CI on this PR. Never write a result you did not see.

- A claim with no command, output, or link beside it carries its label: `measured`, `read`, `inferred`, or `guess`. Only a `measured` result or CI is proof that it works.
- A number (a speedup, a size, a latency, a pass rate) follows [principles/explain-the-number.md](principles/explain-the-number.md): it carries its run count, its spread, and what bounds it. Without all three it is not evidence. Leave it out, or label it `guess`.
- Never hand the reviewer a check you could run. Run it, and put the result here.

- **S-tier: a screenshot,** when the change is visual and the environment can capture it. The CLI cannot upload an image into a PR body, so put an HTML comment where it goes, `<!-- screenshot: <what to capture, where> -->`, and tell the user to attach it.
- **A-tier: a run.** Test results or console output. Show the exact test that now passes and failed before, as pseudocode, plus the command and its exit code. For a bug fix, the before is the test failing on the base. When nobody has run it red yet, run it on the base in a detached worktree, and remove the worktree after:

  ```bash
  git worktree add --detach "${TMPDIR:-/tmp}/pr-base" <base>
  # copy in the new test only, run it there, expect it to fail
  git worktree remove --force "${TMPDIR:-/tmp}/pr-base"
  ```

- **CI.** `gh pr checks` on an open PR. Zero check runs is no evidence, not a pass.
- **Nothing to show.** Write `Not verified: <why>`.

Keep quoted output to the lines that carry the signal.

## 5. Merge Danger

**Door.** A two-way door can be walked back: revert the merge and everything is as it was. A one-way door cannot: a data migration or deletion, a stored format that old code cannot read, a removed or changed public interface that other code already calls, a published package or release, a message sent to users, a secret rotated. When the door is one-way, say which part makes it so and what a rollback would still lose.

**Blast Radius.** One word for how far a mistake reaches, such as `none`, `local`, `module`, `app`, `consumers`, `users`, or `data`. Then, when it is not `none`, the ramifications: a layout shift, a phone-sized screen, a broken consumer of a changed interface, a slower path, a different default. Check each one you can (search the callers, render the screen, run the path) and move the result to Evidence. List for the reviewer only what you could not check, and why. A change to CI, release or signing, auth, billing, an installer, or a deletion path is named here, and needs a human reviewer whatever its size.

## 6. The body

Use the domain's terms from `docs/GLOSSARY.md`. Run `technical-writing` on the title and body before showing them.

```markdown
## Summary

<one sentence of why, with the feature doc or issue linked>

<the visual from show-me>

## Evidence

- **Before:** <screenshot, output, or the failing test run>
  **After:** <screenshot, output, or the passing test run>

## Merge Danger

**Door:** <one-way or two-way>

<optional: what makes it one-way, and what a rollback still loses>

**Blast Radius:** <one word>

<optional: ramifications you could not check, and why>
```

End with `Closes #<n>` when the PR finishes an issue, and with any attribution lines the harness requires. Add no other section unless the repo's PR template asks for it.

When an open PR already has a body, keep what this template does not produce (a checklist from the repo's template, notes the author wrote by hand) and replace the rest.

## 7. Deliver

Write the body to `${TMPDIR:-/tmp}/pr-<branch>.md` and show the title and body to the user.

Open or update the PR only when the user asked for that:

- Push the branch when it has commits the remote lacks: `git push -u origin HEAD`. Never force-push unless the user asked for it.
- No open PR: `gh pr create --base <base> --title "<title>" --body-file <file>`, or the harness's own PR tool when it has one.
- An open PR: `gh pr edit <n> --title "<title>" --body-file <file>`.

Report the PR's URL, and any screenshot placeholder the user still has to fill.
