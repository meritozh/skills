# Project statuses

One of these three values is stored in the `## Project status` section of the repo-root `CONTEXT.md`.

| Status | Breaking changes | Persist data |
| --- | --- | --- |
| `startup` | Allowed whenever they make the long-term design better. Do not optimize for compatibility or the smallest diff. | May reset. No migration. |
| `release-solo` | Same as `startup`. | Must migrate. Do not reset. |
| `release` | Allowed for long-term better design, but also prefer the smallest compatible change when it does not trap the design. | Must migrate. Do not reset. |

`init` is not a status. It creates `CONTEXT.md` (status `startup`) and `docs/` if they are missing.
