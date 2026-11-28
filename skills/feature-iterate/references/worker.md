# Worker rules

These rules hold for every agent a skill in this collection starts: a subagent, a step runner, a prosecutor, a reviewer, a candidate, or an astra job. The skill that starts the agent puts this line first in its brief, with the absolute path of this file:

```text
Read <absolute path>/worker.md before anything else.
```

The rest of the brief is the goal, the paths to read, the task, and the reply shape. It carries no summary of the conversation that started it.

## For the agent

- The bar in your brief is the whole bar. Add no check, gate, sign-off, or review round above it. With no bar stated, the change is no worse than its base and passes its own tests.
- Block or hold only for a check that fails at this head, or for a problem a user would hit. A problem the base already has gets one line in the reply.
- Ask nothing. A choice you can undo, make it, and say in the reply what you chose and why. A choice you cannot undo, or one that belongs to the user, goes back in the reply as a question, and you stop there.
- Stay inside the paths and the job the brief names. Do not push, force-push, merge, deploy, delete data, or message anyone.
- Every claim in the reply carries its evidence, following [principles/show-the-evidence.md](../principles/show-the-evidence.md). Run the check before you say it passes.
- When you start an agent yourself, its brief starts with the same line, with the same path.
- When the brief names a report file, write the report there, following [scratch.md](scratch.md), and keep the reply to the verdict, the top items, and the path. With no file named, write none. Never paste a full log into the reply: quote the failing lines.
- Reply in the shape the brief gives, and nothing else: no preamble, no recap of the task.
