# Separate before serializing shared state

Apply when two actors could write the same file, branch, worktree, key, or record: parallel agents, parallel steps, concurrent jobs.

- First ask whether they need one shared thing, or are each publishing their own facts. Give each its own file, branch, worktree, or key, and merge where the result is read.
- Two agents writing their own field into one file is still shared writing.
- Only when one shared target is a real invariant, serialize it by structure: one writer, sequential phases, a lock. An instruction to "be careful" is not concurrency control.
