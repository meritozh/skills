---
name: technical-writing
description: "Write or rewrite a technical doc so a tired engineer understands it on the first read: one Diátaxis mode per doc, sentences to the reader in the Google developer style, one instruction per sentence (STE), no sentence open to two readings (Global English), then unslop. Knows the docs this collection writes (goal, feature doc, implement spec, glossary, notes, AGENTS.md, PR body, commit message), the mode of each, and that none of them is a meeting record or a roadmap. Keeps every anchor a skill reads. Use when the user asks to write, rewrite, or review a doc, README, RFC, PR description, or commit message for clarity (改写文档, 写清楚, 文档太乱), and from the skills that write docs (polaris, feature-new, feature-iterate, to-implement-spec, to-features, ui-design, pr, rpi) before a doc leaves them. Not for product UI copy, or for deciding what a doc says, which is the skill that owns it."
---

# technical-writing

Run this skill when the user ran `/technical-writing`, when the request matches the description, or when another skill hands it a doc. It changes how a doc says things, never what it decides: a claim, a number, an option, or a decision stays as it is.

Write so a tired engineer understands on the first read.

- Cut every word that does no work.
- Use the short, everyday word.
- Write the real symbol, file, flag, or command name, not a synonym or a description of it.
- Don't invent jargon. Say what a named pattern means the first time.
- When a rule makes a sentence worse, fix the sentence another way, or leave it.

## Not a record, not a roadmap

Every doc in this collection states what is true, or what will be true when the work ships, as it stands today. Git holds how it got there.

- Write in the present tense. "The export streams rows", not "the export will now stream rows" or "we changed the export to stream rows".
- Leave out the history of the work: who asked, what was discussed, the order things were decided in, "originally", "previously", "updated to", "after review", "new:". An overturned decision is replaced, not annotated.
- Leave out the plan around the work: dates, horizons, quarters, milestones, owners, estimates, progress per item, and "next steps". The one `Status:` line and the order an implement spec's steps must land in are the exceptions, because skills read them.
- A list item is a fact a reader looks up, or a step a reader takes. An argument is prose: a decision, a route, and the reason behind them are sentences, not a stack of `Label: value` lines.
- Order something only when the order is real: steps that depend on earlier steps, or parts that need parts before them. Then say why the order holds.

## The docs this collection writes

One doc, one mode. When a doc needs a second mode, split it, or keep the second mode to one section with a heading that says so.

| Doc | Mode | Reader | It reads as |
| --- | --- | --- | --- |
| `docs/polaris/<slug>.md` | explanation | anyone deciding what to build next | why this goal, what reaching it looks like, and why this route over the others |
| `docs/feature/<slug>.md` | reference, with `## Decisions` as its one explanation section | a builder, a reviewer, a support engineer | how the feature behaves, item by item, as a user meets it |
| `docs/spec/<slug>.md` | how-to | the agent who builds it | commands and interfaces, never narration |
| `docs/design/DESIGN.md` | reference | anyone building or reviewing a screen | the tokens, components, and rules every screen follows |
| `docs/design/<task>.md` | explanation | anyone changing that screen | the chosen direction, and why it fits this product |
| `docs/GLOSSARY.md` | reference | everyone | one definition per term |
| `docs/NOTES.md` | a list | the next digest | one plain sentence per idea |
| `AGENTS.md` | reference | an agent new to the repo | commands, layout, and rules |
| PR body | briefing | a reviewer who has one minute | what changed, the proof, and the risk |
| commit message | briefing | someone reading `git log` | an imperative subject under 72 characters, and why in the body |

The modes:

- **Tutorial: learning by doing.** Say what the learner will build. Every step produces a visible result, and you say what they should see.
- **How-to: steps to a goal.** Solve the reader's problem. Assume competence. Action only. Name the guide by the task.
- **Reference: facts for lookup.** Only describe. Be dry, complete, and sure. Mirror the structure of the thing described.
- **Explanation: understanding and why.** One bounded topic. Give context: constraints, alternatives, and the conditions under which they win. Opinion is allowed here and nowhere else.

## Sentences

**To the reader (Google developer style).**

- Talk to the reader as "you", in the present tense. A doc that describes a product talks about its users by role: "an admin", "the importer".
- Say who does what. Passive is fine only when the actor is unknown or beside the point.
- Write instructions as commands. Put the condition before the instruction, and the common case first.
- No buzzwords, no figurative language, no "please", and never "simply", "easy", or "quickly".
- Don't pre-announce. Don't start consecutive sentences with the same phrase.
- Link with words that say where the link goes.
- Headings carry the point, in sentence case. One h1 per page, no skipped levels.
- Numbered lists for sequences, bullets for everything else. Introduce a list with a complete sentence. Keep items parallel.
- Code, paths, and identifiers go in code font. UI elements go in bold. Use serial commas. Drop "etc.".

**One at a time (STE).**

- One instruction per sentence. One thought per sentence everywhere else.
- Split an instruction longer than about 20 words, and any other sentence longer than about 25.
- Put the warning or condition before the step it guards.
- Give each word one meaning, and pick one word per action.

**One reading only (Global English).**

- Keep "only" and "not" next to the word they change.
- Break up long noun strings.
- Make every "it", "they", and "this" point at one obvious thing. Never point "this" or "which" at a whole clause.
- Keep the small words that show structure, such as "that" and "the".
- Say which parts "and" or "or" joins.
- Use periods, not semicolons or dashes. No slashes, and no "(s)".
- Call each thing by one name, everywhere: the glossary's name, when `docs/GLOSSARY.md` has one.
- Skip idioms, Latin abbreviations, and metaphors.

**Rhythm.** Mix sentence lengths. Keep the long sentence that carries one thought. Be specific: not "schema changes can cause issues" but "a column rename fails the build".

**Chinese.** The same rules hold. Write short sentences with a subject and a verb, name the thing instead of using 其, 该, or 此, and keep terms in the glossary's language. `unslop` 30–36 lists the Chinese tells.

## Procedure

For a doc handed over by another skill, or a file the user names:

1. **Name the doc's reader and mode** from the table. A doc outside the table: pick the mode from what its reader does with it.
2. **Fix the anchors.** Skills read some lines by their exact form. Keep them as they are: the `Status:` line, the `Feature:` header, the headings the doc's template names, the `## Open questions` entries, the `After:` and `Check:` of steps, the numbers of parts, features, and steps, trailers, links, citations with their file and line, code, and glossary terms.
3. **Rewrite** each section against [Not a record, not a roadmap](#not-a-record-not-a-roadmap), its mode, and [Sentences](#sentences).
4. **Run `unslop`** on the result.
5. **Check the meaning.** Compare old and new claim by claim: nothing added, nothing dropped, no number changed. A sentence with two readings that the doc does not settle is not yours to settle. Under the skill that owns the doc, it becomes an open question. Otherwise, ask the user which reading holds.
6. **Report** one line per kind of change, such as `history removed: 3 lines`, `labels to prose: ## Route`, `unslop 19 ×4`.

A skill that hands a doc over goes on with the rewritten doc. This skill asks nothing of the user except a reading the doc does not settle.

## Source

Adapted from `technical-writing` in [backnotprop/pstack](https://github.com/backnotprop/pstack), Copyright (c) 2026 Lauren Tan, MIT. See `LICENSE`. The table of this collection's docs, the record and roadmap rules, the anchors, and the procedure are new.
