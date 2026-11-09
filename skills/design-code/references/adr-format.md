# ADR format

A decision that passes the tests below is a section of `docs/design/<slug>.md`. Do not create `docs/adr/`.

## Template

```md
# {Short title of the decision}

{1–3 sentences: the context, the decision, and why.}
```

An ADR can be one paragraph. The value is recording that a decision was made and why.

## Optional sections

Add these only when they earn a place. Most ADRs need none of them.

- **Status** frontmatter (`proposed | accepted | deprecated | superseded by ADR-NNNN`), when a decision is revisited.
- **Considered options**, when a rejected alternative is worth remembering.
- **Consequences**, when a downstream effect is not obvious.

## When to write one

All three must be true:

1. **Hard to reverse.** Changing your mind later has a real cost.
2. **Surprising without context.** A later reader will ask why it was done this way.
3. **A real trade-off.** Genuine alternatives existed, and one was picked for specific reasons.

If any test fails, skip the ADR. Easy to reverse: reverse it later. Not surprising: nobody will wonder. No real alternative: there is nothing to record beyond the obvious.

### What qualifies

- Architectural shape. "The write model is event-sourced. The read model is projected into Postgres."
- How contexts integrate. "Ordering and Billing communicate by domain events, not synchronous HTTP."
- Technology with lock-in: database, message bus, auth provider, deployment target. Not every library. The ones that would take a quarter to swap.
- Boundary and scope. "Customer data is owned by the Customer context. Other contexts reference it by id." The explicit no is as valuable as the yes.
- A deliberate deviation from the obvious path. "Manual SQL instead of an ORM, because X." This stops the next person from "fixing" a choice that was deliberate.
- A constraint the code does not show. "We cannot use AWS, because of compliance." "Responses must be under 200ms, because of the partner contract."
- A non-obvious rejection. GraphQL was considered and REST was picked for a subtle reason. Record it, or someone will suggest GraphQL again.
