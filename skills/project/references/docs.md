# Docs

`docs/` holds the current state of the work, not a history of changes. One subject is one file: `docs/<category>/<slug>.md`, with `slug` lowercase and hyphenated. The one file outside a category is `docs/GLOSSARY.md`. The one history is `docs/spec/archived/`.

| Category | Holds | Updated when |
| --- | --- | --- |
| `polaris` | One long-range goal: what will be true when it is reached, the signal that shows it, the route and its parts, and the features cut from them | The user sets, reviews, or reroutes the goal, a feature on its list is decided, or the goal is reached. A dropped goal is deleted |
| `feature` | One feature: what a user can do, its limits, what it is not, and the decisions that shaped it with the option each rejected | The user confirms a new feature or a change to one, and when the code ships, changes, or removes it |
| `spec` | How the code will deliver one feature, under the same slug as its feature doc: the owner of each behavior, the interfaces of the modules it adds or changes, seams, stored data and its migration, and the steps to land it. Open only while that work is unfinished | Its feature changes, or the work finishes and the spec moves to `docs/spec/archived/` |

- `docs/GLOSSARY.md` is the project's one glossary: one term per concept, with the words to avoid. One word never names two things.
- A goal says `Status: active` while it is pursued, and `Status: reached` once its signal holds. A feature doc says `Status: decided` while it is ahead of the code, and `Status: shipped` once the code does what it says.
- Three kinds of doc describe what is not true yet: an active goal says where the project is going, a `decided` feature says what it will do, and an open spec says how the code will do it. An open spec, `docs/spec/<slug>.md`, means its feature is not done. A spec holds nothing that must outlive the work: decisions go in the feature doc, terms in the glossary.
- Work a spec step by step, in the order its `After` lines allow, and do not edit it while working it; only `to-implement-spec` changes a spec. Before work starts or resumes, check that the feature-doc hash in its header still matches `git hash-object docs/feature/<slug>.md`; when it does not, stop, because the spec must catch up with the feature first. Each step is one commit whose message ends with the trailer `Spec-Step: <slug>#<n>`. The commit that lands the last step sets the feature doc to `shipped` and moves the spec to `docs/spec/archived/<YYYY-MM-DD>-<slug>.md` with `git mv`, dated that day.
- `docs/spec/archived/` is a record, not a source. Nothing reads, searches, or updates it, except a review of the branch that archived a spec, or a user who asks. Its `.ignore` keeps ripgrep out. The feature doc and the code say what is true now.
- Find the existing file before writing: `ls docs/*/` and `rg -il '<subject>' docs`. Update that file. If more than one file covers the subject, ask which one stays. Create a file only when none exists.
- State what is true now: what it is and what it is not. Replace statements that stopped being true. Do not append how it changed, and do not write a plan (goals, steps, or future work) outside a goal or a spec.
- A code change that makes a doc untrue updates the doc in the same commit. A removed feature removes its doc.
- Outside `docs/spec/archived/`, no dated files, changelogs, or second files for one subject. History lives in git.
- The current state must be allowed by Project status for breaking changes and persisted data.
- Rules for agents live in `AGENTS.md`, not in `docs/`.
