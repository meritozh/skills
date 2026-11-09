---
name: design-code
description: Design a confirmed idea as deep modules in the project's language. Use after design-idea, when shaping a module interface, seam, and tests. Not for discussing an unconfirmed idea, a diff review, a bug, or a whole-codebase review.
---

# design-code

Design **deep modules** in the project's own language, after the user has confirmed the idea. A deep module puts a lot of behaviour behind a small interface, at a clean seam, testable through that interface. The aim is leverage for callers, locality for maintainers, and testability for everyone.

The output is `docs/design/<slug>.md`, stating the design as it stands, plus the interface as real code in the project's language. Update that file. Do not add a dated sibling. Do not re-litigate a decision already recorded there unless the friction is strong enough to reopen it, and name it when you do.

Discussing an unconfirmed idea is `design-idea`. A whole-codebase review is `codebase-review`. A diff is `diff-review`. A bug is `code-fix`. Repo principles are `project`.

## Vocabulary

Use these terms exactly. Do not substitute component, service, unit, API, signature, or boundary.

**Module**: anything with an interface and an implementation. A function, class, package, or tier-spanning slice.

**Interface**: everything a caller must know to use the module correctly. The type signature, plus invariants, ordering constraints, error modes, required configuration, and performance characteristics.

**Implementation**: the code inside a module. Distinct from **Adapter**: a small adapter can hold a large implementation (a Postgres repo), and a large adapter can hold a small implementation (an in-memory fake). Say adapter when the seam is the topic.

**Depth**: leverage at the interface. Behaviour a caller or test can exercise per unit of interface they must learn. **Deep**: a lot of behaviour behind a small interface. **Shallow**: the interface is nearly as complex as the implementation.

**Seam** *(Michael Feathers)*: a place where you can alter behaviour without editing in that place. The location of a module's interface. Where to put the seam is its own decision, separate from what sits behind it.

**Adapter**: a concrete thing that satisfies an interface at a seam. Role, not substance.

**Leverage**: what callers get from depth. More capability per unit of interface.

**Locality**: what maintainers get from depth. Change, bugs, knowledge, and verification sit in one place.

Rejected framings: depth as a ratio of implementation lines to interface lines (that rewards padding); "interface" as only a TypeScript `interface` or a class's public methods; "boundary" where this vocabulary says seam or interface.

## Principles

- **Depth is a property of the interface.** A deep module may contain small swappable parts. Those parts are not part of the interface. Internal seams belong to the implementation and its tests. The external seam is the interface.
- **The deletion test.** Imagine deleting the module. If complexity vanishes, it was a pass-through. If complexity reappears across N callers, it was earning its keep.
- **The interface is the test surface.** Callers and tests cross the same seam. Wanting to test past the interface means the module is the wrong shape.
- **One adapter means a hypothetical seam. Two adapters means a real one.** Do not add a seam unless something actually varies across it. Production plus test is the usual pair.

A testable interface accepts its dependencies instead of constructing them, returns results instead of hiding side effects, and stays small so the tests stay few.

## Procedure

1. **Load the decision.** Read `docs/idea/<slug>.md` and `docs/design/<slug>.md` when they exist. If there is no idea doc and the idea has not been confirmed in the conversation, stop: that is `design-idea`.
2. **Read the code it touches.** Find the entry points, the current callers, and the tests for the area:

   ```bash
   rg -n '<domain term>|<existing function>' . --glob '!{node_modules,dist,build,vendor,target}/**'
   rg -l '<existing function>' . | rg -i 'test|spec'
   ```

   Every claim about how the system works comes from this read, not from memory.
3. **Settle the terms.** Apply [Domain model](#domain-model) as names come up. A module named with a vague word gets a vague interface.
4. **Write the call site first.** For the two or three most common callers, write the code they would write against the new module, in the project's language. This is the cheapest way to see an interface before it exists.
5. **Draft the interface.** Types and entry points, plus invariants, ordering, error modes, configuration, and performance. Then push it smaller: fewer entry points, simpler parameters, more decided inside. Run the deletion test on every entry point and every new module.
6. **Place the seams.** Classify each dependency with [references/deepening.md](references/deepening.md). The category decides the adapter and the test stand-in. No seam without two adapters.
7. **Name the tests.** List the behaviours the tests assert through the interface, and which existing tests of shallow modules they replace. If a behaviour can only be tested past the interface, go back to step 5.
8. **Compare shapes when it is not obvious.** When two shapes are plausible, or the user asks for alternatives, run [references/design-it-twice.md](references/design-it-twice.md) and record the chosen one.
9. **Write `docs/design/<slug>.md`** with the template below. Record a decision only when it passes the three tests in [references/adr-format.md](references/adr-format.md).
10. **Report.** Show the interface, one call site, and the seams. The next step is implementation; review the result with `diff-review`.

### What depth looks like

Shallow: every caller repeats the same sequence, so every caller holds the knowledge.

```ts
const raw = await cache.get(userKey(id));
let user = raw && !isExpired(raw) ? parse(raw) : null;
if (!user) {
  user = await api.fetchUser(id);
  await cache.set(userKey(id), serialize(user), USER_TTL);
}
```

Deep: the caching, expiry, refetch, and in-flight dedupe live in one place.

```ts
const user = await users.get(id);
```

The interface of `users.get` also states what the code does not show: it may return data up to `USER_TTL` old, concurrent calls for one id share one fetch, and a network failure throws `UserUnavailable` instead of returning stale data.

### When the idea is a refactor of existing code

Look where change actually happens before choosing what to deepen:

```bash
git log --since='6 months ago' --name-only --format= | rg -v '^$' | sort | uniq -c | sort -rn | head -20
```

Friction signals in those hot spots:

- Understanding one concept means bouncing between many small modules.
- Callers repeat the same sequence of calls (the shallow example above).
- Pure functions were extracted for testability, but the bugs live in how they are called.
- A change to one concept edits several modules in one commit.
- An area is untested, or only testable past its interface.

Apply the deletion test to each suspect. Deepen only where deleting the module would spread complexity back into callers.

## Domain model

Change the model as you go, inside `docs/design/<slug>.md`.

- A term that conflicts with the terms already in the design doc: say so and ask which meaning stands.
- A vague or overloaded term: propose one canonical term. "Account" is not an answer when Customer and User differ.
- A relationship under discussion: invent a concrete edge case that forces the boundary.
- A claim about how the system works: check the code. If they disagree, ask which is right.
- A resolved term: add it under `## Terms` using [references/glossary-format.md](references/glossary-format.md). A term says what it is. It holds no implementation detail, spec, or decision.
- A decision: add it under `## Decisions` only when all three tests in [references/adr-format.md](references/adr-format.md) hold.

## The design doc

`docs/design/<slug>.md` states what is true of the design now. It is not a plan: no goals, steps, or future work. Leave out a section that has nothing to say.

````markdown
# <Subject>

<One or two sentences: what this module does for its callers, and why it exists.
Link docs/idea/<slug>.md when it exists.>

## Terms

**Order**:
A customer's request for goods, from checkout until delivery or cancellation.
_Avoid_: Purchase, transaction

## Interface

```<project language>
<the types and entry points a caller uses, as real code>
```

- Invariants: <what is always true for a caller>
- Ordering: <what must happen before what>
- Errors: <each error mode and what the caller sees>
- Configuration: <what must be set, and its default>
- Performance: <the cost a caller can rely on>

## Behind the seam

<What the implementation decides so callers do not have to.>

## Dependencies

| Dependency | Category | Production adapter | Test adapter |
| --- | --- | --- | --- |
| Postgres | local-substitutable | `pg` pool | PGlite |
| Stripe | true external | `StripeClient` | `FakeStripe` |

## Tests

<The behaviours asserted through the interface, and the old tests they replace.>

## Decisions

### <Short title>

<One to three sentences: the context, the decision, and why.>

## Not this

<What this design deliberately does not do or own.>
````

## Source

Adapted from `codebase-design`, `domain-modeling`, and `improve-codebase-architecture` by [mattpocock/skills](https://github.com/mattpocock/skills). Copyright (c) 2026 Matt Pocock, MIT. Those three names are not separate skills in this collection.
