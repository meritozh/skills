---
name: to-implement-spec
description: Turn a confirmed feature or change into an implement spec that guides the agent who builds it. Map every behavior in docs/feature/<slug>.md to the module that owns it, design those modules as deep modules with real interface code, place the seams, state the stored data and its migration, and order the work into one-commit steps. Writes docs/spec/<slug>.md, which stays open until the feature ships and then moves to docs/spec/archived/; durable decisions go to the feature doc and terms to docs/GLOSSARY.md. Use after feature-new or feature-iterate, or for a refactor picked from codebase-review. Not for deciding a feature, a diff review, a bug, or a whole-codebase review.
disable-model-invocation: true
---

# to-implement-spec

User-invoked only: follow this skill only when the user ran `/to-implement-spec`. When the work belongs to another skill, name it (for example `/feature-iterate`), say why, and stop. Do not invoke it yourself.

The feature doc says what a user can do and why. The implement spec tells the agent who builds it how, concretely enough that implementing means typing, not deciding: which module owns each behavior, the interfaces of the modules the feature adds or changes as real code in the project's language, where the seams are, how stored data changes, and the steps to land it, one commit each.

Design those modules as **deep modules**. A deep module puts a lot of behaviour behind a small interface, at a clean seam, testable through that interface. The aim is leverage for callers, locality for maintainers, and testability for everyone.

The output is `docs/spec/<slug>.md`, with the same slug as `docs/feature/<slug>.md`. It is the one doc that describes what is not true yet, so it is open only while the work is: each step lands as one commit with a `Spec-Step` trailer, and the commit that finishes the work moves the file to `docs/spec/archived/`. Nobody edits it while it is worked, so progress lives in git, not in the file. An open spec means its feature is not done. An archived spec is a record that nothing reads again, so the spec holds nothing that must outlive the work. A decision worth keeping goes into the feature doc's `## Decisions`, and a term goes into `docs/GLOSSARY.md`, when the spec is written. What remains ends up in the code and its tests.

Do not re-litigate a decision already recorded in the feature doc unless the friction is strong enough to reopen it, and name it when you do. Reopening a feature decision is `feature-iterate`. Deciding a new feature is `feature-new`. A whole-codebase review is `codebase-review`. A diff is `diff-review`. A bug is `code-fix`. Repo principles are `project`.

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
- **Every behavior has one owner.** Each line of the feature doc maps to exactly one module. A behavior with no owner, or with two, is a design problem to settle here.

A testable interface accepts its dependencies instead of constructing them, returns results instead of hiding side effects, and stays small so the tests stay few.

## Procedure

1. **Load the decision.** Read `docs/feature/<slug>.md`, `docs/spec/<slug>.md`, and `docs/GLOSSARY.md` when they exist, and every other open spec (`docs/spec/*.md`). Do not read `docs/spec/archived/`: an archived spec is a plan as it once stood, and the feature doc and the code say what is true now.
   - No feature doc, and the feature or change has not been confirmed in the conversation: stop. A new feature is `feature-new`, and a change to an existing one is `feature-iterate`.
   - A spec for this feature already exists: the work is in progress and the feature changed. Update the spec in place so it matches the feature doc as it stands. Find the steps that landed: `git log --format='%(trailers:key=Spec-Step,valueonly)' <commit that added the spec>..HEAD`. Leave those as written, and rewrite the rest. A new step takes a new number: a step's number never changes and is never reused.
   - Another spec changes a module this feature also changes: name it. The two must agree on that module's interface. Ask which lands first, and write this spec against the state the other one leaves.
   - A refactor picked from `codebase-review` has no feature doc. Write `docs/spec/<slug>.md` named for the area, with `Feature: none`.
   - An older `docs/design/<slug>.md` for a module this work touches: move each decision that still holds into the `## Decisions` of the feature doc it serves, and each term into `docs/GLOSSARY.md`, then delete the file in the same change.
2. **Read the code it touches.** Find the entry points, the current callers, and the tests for the area:

   ```bash
   rg -n '<domain term>|<existing function>' . --glob '!{node_modules,dist,build,vendor,target}/**'
   rg -l '<existing function>' . | rg -i 'test|spec'
   ```

   Every claim about how the system works comes from this read, not from memory.
3. **Map behavior to owners.** For every line under the feature doc's `## Behavior`, and every `## Not this` line the code must enforce, name the module that owns it. Settle a line with no owner or two owners before going on.
4. **Settle the terms.** Apply [Domain model](#domain-model) as names come up. A module named with a vague word gets a vague interface.
5. **Write the call site first.** For the two or three most common callers, write the code they would write against each new or changed module, in the project's language. This is the cheapest way to see an interface before it exists.
6. **Draft the interfaces.** Types and entry points, plus invariants, ordering, error modes, configuration, and performance. Then push each one smaller: fewer entry points, simpler parameters, more decided inside. Run the deletion test on every entry point and every new module.
7. **Place the seams.** Classify each dependency with [references/deepening.md](references/deepening.md). The category decides the adapter and the test stand-in. No seam without two adapters.
8. **State the data.** For each stored record the feature adds or changes: its shape, and its one writer. For existing records, what `### Project status` in `AGENTS.md` requires: under `startup`, whether a reset is acceptable; under `release-solo` and `release`, the migration, what each existing record becomes, and the state a failed run leaves.
9. **Name the tests.** For every row of the behavior map, the test that proves it through the interface. Limits and `Not this` lines get tests that assert the refusal. List the existing tests of shallow modules the new tests replace. If a behavior can only be tested past the interface, go back to step 6.
10. **Compare shapes when it is not obvious.** When two shapes are plausible, or the user asks for alternatives, run [references/design-it-twice.md](references/design-it-twice.md).
11. **Order the steps.** Split the work into steps that are one commit each under the Commits principle: one logical change that leaves the tree building and its tests passing, with the check that proves it. A refactor that makes room comes before the behavior that needs it. A test that pins a behavior lands with that behavior. A migration lands before the code that reads the new shape. Name each step in glossary terms. A step says what changes; the interfaces above already say how.

    Give each step its `After`: every step whose code it calls or whose data it reads, and every earlier step that changes a module or file it also changes. Steps that `After` does not order run in parallel, each in its own worktree, so two steps that touch one file must be ordered. When unsure, put the step after the one before it.
12. **Record what must outlive the spec.** Add each decision that passes the three tests in [references/adr-format.md](references/adr-format.md) to the feature doc's `## Decisions`. Add each resolved term to `docs/GLOSSARY.md`. A refactor's decision with no feature doc: tell the user, and suggest recording it as a project rule with `/project`.
13. **Write `docs/spec/<slug>.md`** with the template below. Take the hash after step 12's edits: `git hash-object docs/feature/<slug>.md`. When `docs/spec/archived/.ignore` is missing, create it holding `*`, so ripgrep and the tools built on it skip archived specs.
14. **Report.** Show the behavior map, the interfaces, one call site, the seams, and the steps with their `After`. Say that the spec, the feature doc, and the glossary must be committed before the work runs in another worktree, which sees only committed files. The next step is `/go-work`, best in a new session; review the result with `diff-review`.

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

### When the work is a refactor of existing code

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

Change the model as you go. Project terms live in `docs/GLOSSARY.md`, the project's one glossary. A name used only inside one module's code is the code's business and gets no entry.

- A term that conflicts with `docs/GLOSSARY.md`: say so and ask which meaning stands.
- A vague or overloaded term: propose one canonical term. "Account" is not an answer when Customer and User differ.
- A relationship under discussion: invent a concrete edge case that forces the boundary.
- A claim about how the system works: check the code. If they disagree, ask which is right.
- A resolved term: add it to `docs/GLOSSARY.md`, following [references/glossary.md](references/glossary.md). A term says what it is. It holds no implementation detail, spec, or decision.
- A decision: add it to the feature doc's `## Decisions` only when all three tests in [references/adr-format.md](references/adr-format.md) hold. Never to the spec.

## The implement spec

`docs/spec/<slug>.md` tells the implementing agent how to make the code do what the feature doc says, and what is left to do. It has no Status of its own: while it is open, the feature doc says `decided`. Leave out a section that has nothing to say.

````markdown
# <Feature title>: implement spec

Feature: `docs/feature/<slug>.md` @ `<git hash-object docs/feature/<slug>.md>`

This spec is open until the feature ships, and `/go-work` carries it out. Do not edit it while working it; only `to-implement-spec` changes it. Before work starts or resumes, check that the hash above still matches `git hash-object docs/feature/<slug>.md`; if it does not, the feature changed, so stop and rerun `to-implement-spec`. Each step is one commit whose message ends with the trailer `Spec-Step: <slug>#<n>`. The commit that lands the last step sets the feature doc's Status to `shipped` and moves this file to `docs/spec/archived/<YYYY-MM-DD>-<slug>.md` with `git mv`, dated that day. Nothing reads an archived spec again.

<One or two sentences: how the code delivers the feature.>

## Behavior map

| Feature doc line | Owner | Test |
| --- | --- | --- |
| Entry: "Export" on the Orders screen | `orders/export` | `starts an export job from the orders screen` |
| Limits: at most 50,000 orders | `orders/export` | `refuses an export over 50,000 orders` |

Replaces: <the existing tests of shallow modules that these make redundant>

## Modules

### `<module>` (new | changed)

```<project language>
<the types and entry points a caller uses, as real code>
```

- Invariants: <what is always true for a caller>
- Ordering: <what must happen before what>
- Errors: <each error mode and what the caller sees>
- Configuration: <what must be set, and its default>
- Performance: <the cost a caller can rely on>

Behind the seam: <what the implementation decides so callers do not have to>

Call site:

```<project language>
<the most common caller's code against this interface>
```

## Data

- Stored: <the record, its shape, and its one writer>
- Existing records: <the migration, what each record becomes, and what a failed run leaves> | none | reset (status `startup`)

## Dependencies

| Dependency | Category | Production adapter | Test adapter |
| --- | --- | --- | --- |
| Postgres | local-substitutable | `pg` pool | PGlite |
| Stripe | true external | `StripeClient` | `FakeStripe` |

## Steps

1. <One logical change, in glossary terms>. After: none. Check: `<command>`
2. <…>. After: 1. Check: `<command>`
3. <…>. After: 1. Check: `<command>`

## Not this

<What this implementation deliberately does not do or own.>
````

For a refactor with `Feature: none`, the header has no hash and no hash check, and the commit that lands the last step only archives the file.

## Source

Adapted from `codebase-design`, `domain-modeling`, and `improve-codebase-architecture` by [mattpocock/skills](https://github.com/mattpocock/skills). Copyright (c) 2026 Matt Pocock, MIT. Those three names are not separate skills in this collection.
