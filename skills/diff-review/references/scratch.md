# Scratch

`.scratch/` at the repo root is where a run puts a file it will read back later and nobody commits. `project` adds it to `.gitignore`. In a repo where it is not ignored yet, run:

```bash
git check-ignore -q .scratch/x || echo '.scratch/' >> .gitignore
```

A skill that promises to change nothing in the repo, such as a review, does not edit `.gitignore`: when `.scratch/` is not ignored, it writes under `${TMPDIR:-/tmp}/<skill>-<slug>/` instead.

## Write only when it pays

A file costs tokens twice: once to write, once to read back. Write one only when that is cheaper than the alternative:

- **Resume.** A later session, or a fresh agent such as the next review round, needs what this one learned, and rebuilding it from git and the docs would cost more than reading a short file.
- **Sharing.** Agents running at once, or one after another, need the same material, and passing it through each brief would copy it into every context.
- **Rereading.** A long output, such as a slow test suite's log or an import graph, will be searched more than once, and rerunning the command costs more than keeping the file.

Everything else stays out of files. A reply that is already short goes back as the reply. A command whose output you read once is piped through `tail -40` or `rg`, not saved. A note the doc will hold goes into the doc. Never write a full report "in case": when nobody is named to read it, do not write it.

## Layout

A run writes under `.scratch/<skill>/<slug>/`. `<slug>` is the slug of the doc the run serves (a goal, feature, or spec), else the branch name with `/` replaced by `-`, else a short task name. Two runs never share a directory. A run that resumes reuses its own.

A run's `state.md` holds what is done, what was ruled, and what comes next, one line each. Git and the docs win over it: when they disagree, fix `state.md` and go on.

## Rules

- Nothing outside `.scratch/` links to it or reads from it: no doc, code, test, build config, commit message, or PR body.
- A decision, a term, or a fact someone needs later goes into its doc. `.scratch/` holds no decisions.
- Temporary git worktrees go under `${TMPDIR:-/tmp}`, never in `.scratch/`, so test runners and file watchers in the repo do not pick up a second copy of the code. An agent working in such a worktree writes to the main checkout's `.scratch/`, by absolute path.
- No secrets, tokens, or unredacted user data.
- Delete `.scratch/<skill>/<slug>/` when the work it served is done (the spec archived, the branch merged, the doc decided), unless the user asks to keep it. Never delete another run's directory.
