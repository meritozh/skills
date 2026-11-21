# Glossary

Terms live at two levels. One word never names two things across both.

- `docs/GLOSSARY.md` holds every concept that more than one feature or module uses. It is the project's one glossary.
- `## Terms` in `docs/design/<slug>.md` holds a term used inside that one module only.

When another feature or module starts using a design-doc term, move the term to `docs/GLOSSARY.md` and delete it from the design doc in the same change.

## Structure

```md
# Glossary

**Customer**:
A person or organization that places orders.
_Avoid_: Client, buyer, account

**Order**:
A customer's request for goods, from checkout until delivery or cancellation.
_Avoid_: Purchase, transaction
```

When clusters appear, group terms under `##` subheadings in `docs/GLOSSARY.md`, or `###` subheadings under a design doc's `## Terms`. Keep terms alphabetical within a group.

## Before adding a term

Search both levels, `_Avoid_` lines included:

```bash
rg -n -i '<word>' docs/GLOSSARY.md docs/design
```

- The word is a term with the same meaning: use it as it is.
- The word is under another term's `_Avoid_`: use that term instead.
- The word is a term with a different meaning: that is a conflict. Say so, and ask which meaning keeps the word. The other meaning gets a new name.
- No match: add the term at the level where it is used.

## Rules

- **Be opinionated.** When several words name one concept, pick one and list the others under `_Avoid_`.
- **Keep definitions tight.** One or two sentences. Define what it is, not what it does.
- **Only this project's terms.** General programming concepts (timeouts, error types, utility patterns) do not belong.
- **No implementation detail, spec, or decision.** Those live in feature and design docs.
- **A rename updates every use.** The old word goes under `_Avoid_`, and every doc under `docs/` that uses it is updated in the same change. List the code that still uses the old word, so the implementation can rename it.
