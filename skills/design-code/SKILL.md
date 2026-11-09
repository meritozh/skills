---
name: design-code
description: Design a confirmed idea as deep modules in the project's language. Use after design-idea, when shaping a module interface, seam, and tests. Not for discussing an unconfirmed idea, a diff review, a bug, or a whole-codebase review.
---

# design-code

Design **deep modules** in the project's own language, after the user has confirmed the idea. A deep module puts a lot of behaviour behind a small interface, at a clean seam, testable through that interface. The aim is leverage for callers, locality for maintainers, and testability for everyone.

Read `docs/idea/<slug>.md` when it exists. Write the current implementation design to `docs/design/<slug>.md`. Update that file. Do not add a dated sibling. Do not re-litigate a decision already recorded there unless the friction is strong enough to reopen it, and name it.

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

When designing an interface, ask whether it can have fewer methods, simpler parameters, and more complexity hidden inside.

A testable interface accepts its dependencies instead of constructing them, returns results instead of hiding side effects, and stays small so the tests stay few.

## Domain model

Change the model as you go, inside `docs/design/<slug>.md`.

- A term that conflicts with the terms already in the design doc: say so and ask which meaning stands.
- A vague or overloaded term: propose one canonical term. "Account" is not an answer when Customer and User differ.
- A relationship under discussion: invent a concrete edge case that forces the boundary.
- A claim about how the system works: check the code. If they disagree, ask which is right.
- A resolved term: update the terms in that design doc. Read [references/glossary-format.md](references/glossary-format.md) before writing. A term says what it is. It holds no implementation detail, spec, or decision.
- A decision: record it in that design doc only when all three tests in [references/adr-format.md](references/adr-format.md) hold.

## Shape a module

Classify the candidate's dependencies with [references/deepening.md](references/deepening.md) before placing a seam. That file owns the four dependency categories and the replace-don't-layer test rule.

When the user wants alternative interfaces for one module, follow [references/design-it-twice.md](references/design-it-twice.md). Record the chosen interface in `docs/design/<slug>.md`.

## Source

Adapted from `codebase-design`, `domain-modeling`, and `improve-codebase-architecture` by [mattpocock/skills](https://github.com/mattpocock/skills). Copyright (c) 2026 Matt Pocock, MIT. Those three names are not separate skills in this collection.
