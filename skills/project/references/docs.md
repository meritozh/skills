# Docs

`docs/` holds the current state of the work, not a history of changes. One subject is one file: `docs/<category>/<slug>.md`, with `slug` lowercase and hyphenated.

| Category | Holds | Updated when |
| --- | --- | --- |
| `idea` | A confirmed decision: what it is, what it is not, and the constraint that makes it win | The user accepts or changes the idea |
| `design` | How a module or subsystem is built: terms, interface, seams, tests, and decisions | Its design is settled or changes |
| `feature` | What a user can do now: the entry point, the behavior, and the limits | A feature ships, changes, or is removed |

- Find the existing file before writing: `ls docs/*/` and `rg -il '<subject>' docs`. Update that file. If more than one file covers the subject, ask which one stays. Create a file only when none exists.
- State what is true now: what it is and what it is not. Replace statements that stopped being true. Do not append how it changed, and do not write a plan (goals, steps, or future work).
- A code change that makes a doc untrue updates the doc in the same commit. A removed feature removes its doc.
- No dated siblings, changelogs, or second files for one subject. History lives in git.
- The current state must be allowed by Project status for breaking changes and persisted data.
- Rules for agents live in `AGENTS.md`, not in `docs/`.
