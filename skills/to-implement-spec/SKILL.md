---
name: to-implement-spec
description: "Turn a confirmed feature or change into an implement spec for the agent who builds it: map every behavior in docs/feature/<slug>.md to its owning module, design deep modules with real interface code, place the seams, state stored data and its migration, and order one-commit steps. Writes docs/spec/<slug>.md, moved to docs/spec/archived/ when the feature ships; durable decisions go to the feature doc, terms to docs/GLOSSARY.md. Use after feature-new or feature-iterate, or directly, with Feature: none, for a change with a clear target and nothing for a user to decide (a dependency upgrade and the API changes it brings, a migration off a deprecated API, a refactor picked from architecture-review). Not for deciding a feature, a diff review, a bug, or a whole-codebase review."
---

# to-implement-spec

Run this skill on `/to-implement-spec`, a request that matches the description, or a hand-off from another skill such as `rpi`. Started without `/to-implement-spec`: say so in one line, with the reason. Work that belongs to another skill: say which and why, then switch to it, or name it for the user (`/feature-iterate`) and stop.

The implement spec tells the builder how, concretely enough that implementing means typing, not deciding: which module owns each behavior, the interfaces of new or changed modules as real code in the project's language, the seams, how stored data changes, and the steps, one commit each. Design them as **deep modules**.

The output is `docs/spec/<slug>.md`, with the slug of `docs/feature/<slug>.md`. It is archived when the work ships and never read again, so it holds nothing that must outlive the work (step 12).

An idea outside this work goes to `note` in one line. Do not re-litigate a decision recorded in the feature doc unless the friction is strong enough to reopen it, and name it when you do. Reopening a feature decision is `feature-iterate`. A new feature is `feature-new`. A whole-codebase review is `architecture-review`. A diff is `diff-review`. A bug is `code-bugfix`. Repo principles are `project`.

## Vocabulary

Use these terms exactly, not component, service, unit, API, signature, or boundary.

- **Module**: anything with an interface and an implementation: a function, class, package, or tier-spanning slice.
- **Interface**: everything a caller must know to use the module correctly: the type signature, plus invariants, ordering constraints, error modes, required configuration, and performance characteristics.
- **Seam** *(Michael Feathers)*: a place where you can alter behaviour without editing in that place; the location of a module's interface.
- **Adapter**: a concrete thing that satisfies an interface at a seam.
- **Depth**: behaviour a caller or test can exercise per unit of interface they must learn, not a ratio of lines. **Deep**: a lot of behaviour behind a small interface. **Shallow**: the interface is nearly as complex as the implementation.
- **Leverage**: what callers get from depth. **Locality**: what maintainers get: change, bugs, knowledge, and verification sit in one place.

## Principles

- **Depth is a property of the interface.** Internal seams and swappable parts belong to the implementation and its tests.
- **The deletion test.** Imagine deleting the module. If complexity vanishes, it was a pass-through. If it reappears across N callers, it was earning its keep.
- **The interface is the test surface.** Callers and tests cross the same seam. A testable interface accepts its dependencies instead of constructing them, and returns results instead of hiding side effects.
- **One adapter means a hypothetical seam. Two adapters means a real one.** Production plus test is the usual pair.

## Procedure

Ask the user only what they can settle (which of two specs lands first, which meaning of a term stands, whether the code or a doc is right, which of two shapes to take), following [references/asking.md](references/asking.md).

1. **Load the decision.** Read `docs/feature/<slug>.md`, `docs/spec/<slug>.md`, `docs/GLOSSARY.md` when they exist, and every other open spec (`docs/spec/*.md`). Do not read `docs/spec/archived/`.
   - No feature doc, and the feature or change was not confirmed in the conversation: stop. A new feature is `feature-new`, a change to an existing one `feature-iterate`.
   - A feature doc with `Status: draft`: its open questions belong to `feature-new` or `feature-iterate`. Name it and stop.
   - A spec for this feature exists (the feature changed, or a `/batman` hand-off holds rulings): update it in place to match the feature doc and apply every ruling without reopening it, redesigning the unlanded part as [principles/redesign-from-first-principles.md](principles/redesign-from-first-principles.md) says. A ruling that needs a feature doc change: stop and name `/feature-iterate`. Leave the landed steps as written (`git log --format='%(trailers:key=Spec-Step,valueonly)' <commit that added the spec>..HEAD`), and rewrite the rest. A new step takes a new number: a step's number never changes and is never reused.
   - Another spec changes a module this feature also changes: name it. The two must agree on its interface. Ask which lands first, and write this spec against the state the other leaves.
   - **A technical change** has no feature doc: a dependency upgrade, a migration off a deprecated API, a refactor picked from `architecture-review`. When this project's public API or behavior would change, that is `feature-iterate`. Pin the target, one sentence of what is true when done and the signal that shows it (every caller on the new major version, the old package gone), and confirm it in one question. Name the spec for the change, with `Feature: none` and the target as its summary. The steps move every caller and delete the old API, with no shim unless `### Project status` requires one, as [principles/migrate-then-delete.md](principles/migrate-then-delete.md) says.
   - **A dependency upgrade:** read the changelog and migration guide for every version crossed, and list each change that reaches this code, with its call sites (`rg`). Each is a row of the behavior map: what must keep working, and the test that proves it.
   - A user interface, and `docs/design-system/DESIGN.md` exists: read it. UI steps name its tokens and components, never literal values. A value or component it lacks: name `/design-system`, and settle it before writing those steps.
   - An older `docs/design/<slug>.md` for a module this work touches: move each decision that still holds into the feature doc's `## Decisions`, and each term into `docs/GLOSSARY.md`, then delete the file in the same change.
2. **Read the code it touches**: the entry points, the current callers, and the tests.

   ```bash
   rg -n '<domain term>|<existing function>' . --glob '!{node_modules,dist,build,vendor,target}/**'
   rg -l '<existing function>' . | rg -i 'test|spec'
   ```

   Claims about the system come from this read, never memory.
3. **Map behavior to owners.** For every statement under the feature doc's `## Behavior`, and every `## Not this` line the code must enforce, name the one module that owns it. Settle a line with no owner or two owners before going on.
4. **Settle the terms** with [Domain model](#domain-model) as names come up.
5. **Write the call site first**: the two or three most common callers' code against each new or changed module.
6. **Draft the interfaces.** Types and entry points, plus invariants, ordering, error modes, configuration, and performance. Push each smaller: fewer entry points, simpler parameters, more decided inside. Run the deletion test on every entry point and every new module.
7. **Place the seams.** Classify each dependency with [references/deepening.md](references/deepening.md); the category decides the adapter and the test stand-in. No seam without two adapters.
8. **State the data.** Each stored record the feature adds or changes: its shape, and its one writer. Existing records, per `### Project status` in `AGENTS.md`: under `startup`, whether a reset is acceptable; under `release-solo` and `release`, the migration, what each existing record becomes, and the state a failed run leaves. A migration is safe to rerun after it stops at any point ([principles/make-operations-idempotent.md](principles/make-operations-idempotent.md)).
9. **Name the tests.** For every behavior map row, the test that proves it through the interface, judged by [principles/test-behavior.md](principles/test-behavior.md). Limits and `Not this` lines get tests that assert the refusal. List the existing tests of shallow modules the new tests replace. If a behavior can only be tested past the interface, go back to step 6.
10. **Compare shapes when it is not obvious.** When two shapes are plausible, or the user asks for alternatives, run [references/design-it-twice.md](references/design-it-twice.md), following [principles/compare-real-options.md](principles/compare-real-options.md). A spike or benchmark that settles it goes in the spec as its result.
11. **Order the steps** as [principles/sequence-verifiable-units.md](principles/sequence-verifiable-units.md) says: one logical change and one commit each, with the check that proves it. Removals come first ([principles/subtract-before-you-add.md](principles/subtract-before-you-add.md)): dead code, the shallow modules being replaced, and the refactor that makes room come before the behavior that needs them. A test lands with the behavior it pins. A migration lands before the code that reads the new shape. Name steps in glossary terms. A step says what changes, not how.

    Give each step its `After`: every step whose code it calls or whose data it reads, and every earlier step that changes a module or file it also changes. Steps that `After` does not order run in parallel worktrees, so two steps that touch one file must be ordered ([principles/separate-shared-state.md](principles/separate-shared-state.md)). When unsure, order it after the step before.
12. **Record what must outlive the spec.** Add each decision that passes the three tests in [references/adr-format.md](references/adr-format.md) to the feature doc's `## Decisions`, and each resolved term to `docs/GLOSSARY.md`. A decision in a spec with `Feature: none`: tell the user, and suggest recording it as a project rule with `/project`.
13. **Write `docs/spec/<slug>.md`** with the template below. Take the hash after step 12's edits: `git hash-object docs/feature/<slug>.md`. When `docs/spec/archived/.ignore` is missing, create it holding `*`, so ripgrep skips archived specs. Then run `technical-writing` on the spec and on every line step 12 added to the feature doc.
14. **Report** the behavior map, the interfaces, one call site, the seams, and the steps with their `After`. Say that the spec, the feature doc, and the glossary must be committed before work runs in another worktree. The next step is `/go-work`, best in a new session, or `/batman <slug>` first for a fresh-eyed attack on the spec; review the result with `diff-review`.

### What depth looks like

Shallow: every caller repeats the same sequence.

```ts
const raw = await cache.get(userKey(id));
let user = raw && !isExpired(raw) ? parse(raw) : null;
if (!user) {
  user = await api.fetchUser(id);
  await cache.set(userKey(id), serialize(user), USER_TTL);
}
```

Deep: caching, expiry, refetch, and in-flight dedupe live in one place.

```ts
const user = await users.get(id);
```

### When the work is a refactor of existing code

Find where change happens before choosing what to deepen:

```bash
git log --since='6 months ago' --name-only --format= | rg -v '^$' | sort | uniq -c | sort -rn | head -20
```

Friction signals in those hot spots: one concept spread over many small modules; callers repeating one sequence; pure functions extracted for testability while the bugs live in how they are called; one concept's change editing several modules per commit; an area untested, or testable only past its interface. Deepen only where the deletion test shows complexity would spread back into callers.

## Domain model

Project terms live in `docs/GLOSSARY.md`.

- A term that conflicts with the glossary, or a claim the code contradicts: ask which is right.
- A vague or overloaded term: propose one canonical term. "Account" is not an answer when Customer and User differ.
- A relationship under discussion: invent a concrete edge case that forces the boundary.
- A resolved term: add it to `docs/GLOSSARY.md`, following [references/glossary.md](references/glossary.md).

## The implement spec

The spec has no Status of its own: while it is open, the feature doc says `decided`. Omit a section with nothing to say.

````markdown
# <Feature title>: implement spec

Feature: `docs/feature/<slug>.md` @ `<git hash-object docs/feature/<slug>.md>`

This spec is open until the feature ships, and `/go-work` carries it out. Do not edit it while working it; only `to-implement-spec` changes it. Before work starts or resumes, check that the hash above still matches `git hash-object docs/feature/<slug>.md`; if it does not, the feature changed, so stop and rerun `to-implement-spec`. Each step is one commit whose message ends with the trailer `Spec-Step: <slug>#<n>`. The commit that lands the last step sets the feature doc's Status to `shipped` and moves this file to `docs/spec/archived/<YYYY-MM-DD>-<slug>.md` with `git mv`, dated that day. Nothing reads an archived spec again.

<One or two sentences: how the code delivers the feature. With `Feature: none`: the target, and the signal that shows it is done.>

## Behavior map

| Feature doc line | Owner | Test |
| --- | --- | --- |
| Where it starts: "An admin starts an export from **Export** on the Orders screen." | `orders/export` | `starts an export job from the orders screen` |
| Limits: "An export holds at most 50,000 orders." | `orders/export` | `refuses an export over 50,000 orders` |

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

With `Feature: none`, the header has no hash and no hash check, the behavior map lists what must keep working with its test, and the last step's commit only archives the file.

## Source

Adapted from `codebase-design`, `domain-modeling`, and `improve-codebase-architecture` by [mattpocock/skills](https://github.com/mattpocock/skills). Copyright (c) 2026 Matt Pocock, MIT. Those three names are not separate skills in this collection.
