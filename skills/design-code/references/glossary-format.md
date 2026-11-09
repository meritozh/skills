# Terms in the design doc

Terms live in `docs/design/<slug>.md`. Do not create a root `GLOSSARY.md` or `GLOSSARY-MAP.md`.

## Structure

Terms sit under `## Terms` in the design doc, after the one-line summary at the top of the file.

```md
## Terms

**Order**:
A customer's request for goods, from checkout until delivery or cancellation.
_Avoid_: Purchase, transaction

**Invoice**:
A request for payment sent to a customer after delivery.
_Avoid_: Bill, payment request

**Customer**:
A person or organization that places orders.
_Avoid_: Client, buyer, account
```

## Rules

- **Be opinionated.** When several words name one concept, pick one and list the others under `_Avoid_`.
- **Keep definitions tight.** One or two sentences. Define what it is, not what it does.
- **Only terms specific to this context.** General programming concepts (timeouts, error types, utility patterns) do not belong. Before adding a term, ask whether it is unique to this context.
- **Group terms under `###` subheadings** when clusters appear. A flat list is fine when the context is one area.

Several subjects stay in several design docs. The terms for a subject live in that subject's `docs/design/<slug>.md`.
