# Prove it works

Apply before you call any work done: a step, a fix, a migration, a review round, a run.

- Check the real thing: run the feature, read the value, open the rendered page, read the diff. A self-report, a file's mtime, cached output, and "it compiles" are proxies, not proof.
- A subagent's "done" is a claim. Check it against git and the check it names.
- When a check fails, suspect the way you observed before the system.
- Script the check when you can, so anyone can rerun it. Keep its output where the user can see it.
