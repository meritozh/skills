# Cleanup

Intermediate artifacts are not part of the work. Create them where they cannot be committed, and remove them when the work they serve is done.

- Scratch goes in `.scratch/<skill>/<slug>/` at the repo root, which is gitignored, with `<slug>` naming the feature, spec, or branch the work serves: throwaway scripts, harnesses, probes, and screenshots. Save other output there only when something reads it back: a later session resumes from it, several agents share it, or a long log is searched more than once. Output read once is piped through `tail` or `rg`, not saved. Nothing outside `.scratch/` reads from it or links to it, and it holds no decision a later reader needs. Delete your directory when its work is done (the spec archived, the branch merged); never another run's.
- Temporary worktrees go under `$TMPDIR` (else `/tmp`), never in the repo, so test runners and file watchers do not pick up a second copy of the code.
- Tag each temporary debug line with `[DEBUG-` and a short hex id, such as `[DEBUG-a4f2]`, so one search finds them all. A diagnostic worth keeping goes behind the project's debug flag instead.
- Before each commit and before the task ends, check:

  ```bash
  git status --short -uall                             # only intended files are changed or new
  rg -n '\[DEBUG-[0-9a-f]+\]' . --glob '!AGENTS.md'   # no temporary debug lines remain
  git worktree list                                    # remove the ones you added: git worktree remove --force <path>
  ```

- Remove only what you created in this task. Never delete or move files you did not create: untracked files that were there before you started, caches the project relies on (`node_modules`, `target`, `.venv`), or user data.
- A generated file the repo tracks is not scratch. Regenerate it with the project's command and commit it with the change that caused it.
- When cleanup cannot finish (a file is locked, a process is still running), say what is left and where.
