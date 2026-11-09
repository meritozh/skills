# Commits

Commit locally as the work goes, one verified step at a time. Do not leave a task as one large uncommitted change, and do not end it with one commit that mixes everything.

- At the start of a task, note `git rev-parse HEAD`. The whole task can then be read as `git log --oneline <start>..HEAD` and reviewed as `git diff <start>..HEAD`.
- A step is one logical change that leaves the tree building and its tests passing. A refactor, a rename, or a formatting pass is its own commit, separate from a behavior change. A test that pins a bug may land with its fix.
- Before each commit, run the check for the surface you touched. Do not commit a red step. When a hook fails, fix the cause; never skip it with `--no-verify`.
- Stage only the files of this step: `git add <paths>`, then `git diff --cached --stat`. Never use `git add -A`, `git add .`, or `git commit -a` while the tree holds work you did not do.
- Subject: imperative, under 72 characters, says what changed. Body: why, and how it was verified when that is not obvious. A bug fix names the root cause.
- A change that makes a doc untrue updates that doc in the same commit.
- Never commit secrets, scratch files, debug lines, or build output.
- Commit on the current branch. Amending your own unpushed commit from this task is fine. Do not create or switch branches, rebase, or rewrite pushed history unless asked.
- Commits stay local. Push, tag, publish, or open a pull request only when asked.
