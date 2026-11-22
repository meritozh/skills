# ADR format

A decision that passes the tests below is a `###` entry under `## Decisions` in the feature doc it serves, `docs/feature/<slug>.md`. Never in the spec, which is archived and no longer read once the work is done. Do not create `docs/adr/`.

## Template

```md
### {Short title of the decision}

{1–3 sentences: the context, the decision, and why.}
```

One paragraph is enough. The value is recording that a decision was made and why.

Example:

```md
### Manual SQL instead of an ORM

Reports join six tables with window functions, and the ORM generated N+1 queries we could not tune. Queries live in `reports/sql/` and are tested against PGlite.
```

## Optional lines

Add these under the paragraph, in the feature doc's format, only when they earn a place. Most decisions need none of them.

- `- Rejected: <the alternative>, which wins instead when <its condition>.` when a rejected alternative is worth remembering.
- `- Wrong-call signal: <the first thing someone would see>.` when a wrong call would show up somewhere not obvious.

When a decision changes, replace its text. The doc states the current decision, not its history.

## When to write one

All three must be true:

1. **Hard to reverse.** Changing your mind later has a real cost.
2. **Surprising without context.** A later reader will ask why it was done this way.
3. **A real trade-off.** Genuine alternatives existed, and one was picked for specific reasons.

If any test fails, skip it. Easy to reverse: reverse it later. Not surprising: nobody will wonder. No real alternative: there is nothing to record beyond the obvious.

### What qualifies

- Architectural shape. "The write model is event-sourced. The read model is projected into Postgres."
- How contexts integrate. "Ordering and Billing communicate by domain events, not synchronous HTTP."
- Technology with lock-in: database, message bus, auth provider, deployment target. Not every library. The ones that would take a quarter to swap.
- Boundary and scope. "Customer data is owned by the Customer context. Other contexts reference it by id." The explicit no is as valuable as the yes.
- A deliberate deviation from the obvious path. "Manual SQL instead of an ORM, because X." This stops the next person from "fixing" a choice that was deliberate.
- A constraint the code does not show. "We cannot use AWS, because of compliance." "Responses must be under 200ms, because of the partner contract."
- A non-obvious rejection. GraphQL was considered and REST was picked for a subtle reason. Record it, or someone will suggest GraphQL again.
