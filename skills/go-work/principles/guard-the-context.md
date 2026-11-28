# Guard the context

Apply when a run reads a lot: large outputs, long files, wide searches, many rounds, or several agents.

- Send bulk reading to a subagent, and keep its conclusion in the main thread, not its raw output.
- Brief a subagent with paths, not pasted content.
- Cap each phase: the files it reads and the rounds it runs.
- A long run keeps its state in files and git, so a new session resumes from them instead of from memory.
