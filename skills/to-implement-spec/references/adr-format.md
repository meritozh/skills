# ADR format

A decision that passes the tests below is a `###` entry under `## Decisions` in the feature doc it serves, `docs/feature/<slug>.md`. Never in the spec, and never in `docs/adr/`.

## Template

```md
### {Short title of the decision}

{1–3 sentences, in the present tense: the decision, and the constraint that makes it right.}
```

The heading states the decision as a fact; the paragraph says why.

Example:

```md
### Manual SQL instead of an ORM

Reports join six tables with window functions, and the ORM generates N+1 queries for them that cannot be tuned. Queries live in `reports/sql/` and are tested against PGlite.
```

## Optional sentences

Add these as sentences only when they earn a place.

- The alternative and the condition under which it wins instead, when a rejected alternative is worth remembering: "An ORM wins instead if reports stop needing window functions."
- The wrong-call signal, when a wrong call would show up somewhere not obvious: "If report queries start to repeat across files, revisit this."

When a decision changes, replace its text. The doc states the current decision, not its history.

## When to write one

All three must be true:

1. **Hard to reverse.** Changing your mind later has a real cost.
2. **Surprising without context.** A later reader will ask why it was done this way.
3. **A real trade-off.** Genuine alternatives existed, and one was picked for specific reasons.

If any test fails, skip it.

### What qualifies

- Architectural shape. "The write model is event-sourced. The read model is projected into Postgres."
- How contexts integrate. "Ordering and Billing communicate by domain events, not synchronous HTTP."
- Technology with lock-in: database, message bus, auth provider, deployment target. Not every library.
- Boundary and scope. "Customer data is owned by the Customer context. Other contexts reference it by id."
- A deliberate deviation from the obvious path. "Manual SQL instead of an ORM, because X."
- A constraint the code does not show. "We cannot use AWS, because of compliance." "Responses must be under 200ms, because of the partner contract."
- A non-obvious rejection. GraphQL was considered and REST was picked for a subtle reason.
