# Cleanup

Intermediate artifacts are not part of the work. Create them where they cannot be committed, and remove them before the task ends.

- Scratch goes outside the repo, under `$TMPDIR` (else `/tmp`): throwaway scripts, harnesses, probes, captured logs, screenshots, reports, and temporary worktrees. When a tool must write inside the repo, use `.scratch/`, which is gitignored.
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
