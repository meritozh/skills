# Project statuses

One of these three values is stored in the project-status principle in the repo-root `AGENTS.md`.

| Status | Breaking changes | Persist data |
| --- | --- | --- |
| `startup` | Allowed whenever they make the long-term design better. Do not optimize for compatibility or the smallest diff. | May reset. No migration. |
| `release-solo` | Same as `startup`. | Must migrate. Do not reset. |
| `release` | Allowed for long-term better design, but also prefer the smallest compatible change when it does not trap the design. | Must migrate. Do not reset. |

A missing `AGENTS.md` is created with status `startup`.
