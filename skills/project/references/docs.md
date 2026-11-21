# Docs

`docs/` holds the current state of the work, not a history of changes. One subject is one file: `docs/<category>/<slug>.md`, with `slug` lowercase and hyphenated. The one file outside a category is `docs/GLOSSARY.md`.

| Category | Holds | Updated when |
| --- | --- | --- |
| `feature` | One feature: what a user can do, its limits, what it is not, and the decisions that shaped it with the option each rejected | The user confirms a new feature or a change to one, and when the code ships, changes, or removes it |
| `design` | How a module or subsystem is built: terms used only inside it, interface, seams, tests, and decisions | Its design is settled or changes |

- `docs/GLOSSARY.md` names every concept that more than one feature or module uses: one term per concept, with the words to avoid. A term used inside one module only lives under `## Terms` in that module's design doc. One word never names two things across both.
- A feature doc says `Status: decided` while it is ahead of the code, and `Status: shipped` once the code does what it says. The commit that makes the code match sets `shipped`.
- Find the existing file before writing: `ls docs/*/` and `rg -il '<subject>' docs`. Update that file. If more than one file covers the subject, ask which one stays. Create a file only when none exists.
- State what is true now: what it is and what it is not. Replace statements that stopped being true. Do not append how it changed, and do not write a plan (goals, steps, or future work).
- A code change that makes a doc untrue updates the doc in the same commit. A removed feature removes its doc.
- No dated siblings, changelogs, or second files for one subject. History lives in git.
- The current state must be allowed by Project status for breaking changes and persisted data.
- Rules for agents live in `AGENTS.md`, not in `docs/`.
