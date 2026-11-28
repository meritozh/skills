# Models

Pick the model for an agent by what its job produces:

| The job produces | Model | Effort |
| --- | --- | --- |
| Talk with the user, and the decisions and docs that need that talk | the user's own session (Claude Opus 5.5) | the user's setting |
| Candidates for someone to choose from: interface shapes, design concepts | `gpt-6.2-astra` | `xhigh` |
| Facts: code read, a search, research | `gpt-6.2-sol` | `high` |
| Code: a feature step, a test, a fix | `gpt-6.2-sol` | `xhigh` |
| A judgment: objections, a review, a score, a walkthrough | `gpt-6.2-astra`, or `claude-opus-5-5` when astra made what is judged | `xhigh` |

- A skill does its own work in the session that runs it. This table picks a model only where a skill starts an agent.
- A coordinator, an agent that starts other agents, takes the row of what it coordinates: a `go-work` run is code, a `diff-review` run is a judgment.
- A skill that needs seats on different models, such as `arena`, says so where it seats them.

## Starting the agent

- **T3 Code:** `delegate_task` with the row's model, on the Codex provider for `gpt-6.2-*` (option `reasoningEffort`) or the Claude provider for `claude-opus-5-5` (option `effort`). Call `orchestrator_capabilities` once per run first. Use the harness's own subagent only when it runs the same model at the same effort. A model the capabilities do not list stops that job: say so to the user, and do not swap in another.
- **Elsewhere:** the harness's own subagent, on the row's model when the harness lets you pick one, else on the session's model.

Whenever an agent ran on a model other than its row's, the report names the model it ran on. A judgment whose judge ran on the same model as the author says so.
