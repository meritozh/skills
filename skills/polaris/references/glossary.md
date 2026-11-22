# Glossary

`docs/GLOSSARY.md` is the project's one glossary. It names every concept that a feature doc, a spec, or a conversation about the project needs one word for. One word never names two things. A name used only inside one module's code is the code's business and gets no entry.

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

When clusters appear, group terms under `##` subheadings. Keep terms alphabetical within a group.

## Before adding a term

Search the glossary, `_Avoid_` lines included:

```bash
rg -n -i '<word>' docs/GLOSSARY.md
```

- The word is a term with the same meaning: use it as it is.
- The word is under another term's `_Avoid_`: use that term instead.
- The word is a term with a different meaning: that is a conflict. Say so, and ask which meaning keeps the word. The other meaning gets a new name.
- No match: add the term.

## Rules

- **Be opinionated.** When several words name one concept, pick one and list the others under `_Avoid_`.
- **Keep definitions tight.** One or two sentences. Define what it is, not what it does.
- **Only this project's terms.** General programming concepts (timeouts, error types, utility patterns) do not belong.
- **No implementation detail, spec, or decision.** Those live in feature docs.
- **A rename updates every use.** The old word goes under `_Avoid_`, and every doc under `docs/` that uses it, except the archived specs in `docs/spec/archived/`, is updated in the same change. List the code that still uses the old word, so the implementation can rename it.
