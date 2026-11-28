# Conditional Review Patterns

Load only the sections whose trigger is in the diff. Each is a hard stop when the failure can reach users, advisory otherwise.

## Recurring or hard-to-observe bugs

For a recurring visual, layout, timing, or stateful-UI bug, reject another tuned constant: pull the decision into a pure function and test the violated invariant (nonzero width, half-open hit regions, bounded offsets).

Do not demand a fake seam: if a shallow helper cannot exercise the real failure at its call site, report `no correct test seam`. For future callers bypassing a guard on a silent, costly primitive (direct deletion, raw privilege escalation, an unbounded external command), add a source-invariant test that enumerates call sites and rejects raw usage outside an explicit allowlist.

## Captured output and asynchronous completion

When code branches on an error message or captured output, probe what the string holds at runtime: with inherited stdio, `error.message` may hold only the command line. Prefer exit codes or known targets over reparsing prose.

Flag a fixed `sleep`, `asyncAfter`, `setTimeout`, frame count, or guessed timeout that stands in for an observable completion signal. Drive the next step from callbacks, navigation completion, frame changes, state flags, or wall-clock state.

## Simplification and deletion

For prose, rule, skill, or guidance consolidation, read the deletions back and classify every removed behavior as `folded into X`, `redundant with Y`, or `behavior removed`, listing the last explicitly. Deletion volume proves nothing.

For a dead-code or YAGNI claim, search the whole repository: entrypoints, docs, tests, generated dispatch tables, scripts, CI, packaging allowlists, manifests, and dynamic lookup patterns. Separate test-only from production references, and chase data read only indirectly. A dev tool exposed by the wrong package needs tighter distribution, not deletion.

## History-sensitive normalization

When a diff restores a recently removed symbol, string, asset, enum case, localization entry, or config field, confirm current main still consumes it; a parity test or stale rule is not proof.

Before making an outlier match its siblings, read the change or comment that introduced it; keep any protection the asymmetry gives.

## Non-atomic replacement of user files

When a diff writes to a path the user already has (`curl -o`, `>`, `tee`, open-truncate-write), truncating first leaves a corrupt file and no original after a failure partway. Require staging into a sibling temp file, swapped in once complete.

Staging does not cover signals: with no trap, an interrupt can strand the temp file and let the shell install partial content. `-fsSL`, `2>/dev/null`, or a swallowed exit code also hide what broke and what was left intact.

## Destructive matcher breadth

For recursion, mass deletion, traversal, ID-prefix wildcards, or fallback regex branches feeding a destructive sink, inspect:

- matcher breadth in every primary and fallback branch;
- protected-path coverage at the new entry point;
- user-confirmation paths; and
- whether the guard lives inside the deletion primitive rather than only at one caller.

Only exact identifiers and exact paths authorize deletion, not display names, vendor prefixes, common tokens, or user labels.

## Duplicated derivations

Flag a classification, ordering, threshold, count, or eligibility rule computed independently in two places (summary/list, preview/executor, score/explanation). Require one constant or pure function both use.

## Test surface fidelity

Judge each test by [principles/test-behavior.md](../principles/test-behavior.md). A test that pins a helper production never reaches, asserts the source form of a command or config string instead of the shipped entry point, passes on the unfixed code, or runs a path users never execute is a finding.

A red-green run misses two blind spots:

- **What the assertion cannot see.** A matcher scoped to tagged instances reads an untagged one as exempt. An input set built before the producer's own transformation never contains what production emits. A parity check comparing two copies is blind to what both miss.
- **What benign change turns it red.** An anchor on exact wording, a positional slice, or one spelling of a rule usually written another way survives the removal it exists to catch and fails on a rewrite. Anchor on the fact, the identifier, or the enclosing structure.

## Never-shipped migrations

Reject migration scaffolding, version-gated defaults, or old-key carry-forward logic when the preference, schema, or feature first appears in the current unreleased work. Compare with the last published tag; if the key did not ship, use the default path.

## Unknown identifiers

Search every function, type, variable, asset, command target, and config key the diff assumes exists; no hit outside the diff leaves it unproven. For a dynamic registry, check its generation or lookup path, not a name match.

## Dependency changes

Verify lockfile consistency in the declared environment: the full manifest, overrides, resolver configuration, and dependency diff, then the frozen/locked verification. Regenerate in an isolated checkout only to investigate a concrete discrepancy, with the complete inputs and declared toolchain. Equal bytes do not prove provenance; explain a difference rather than assume hand-editing. Confirm the resolved graph implements the requested change.

Automated security PRs get two checks their scanner does not do:

- **Whole-file reserialization.** Bots that rewrite a manifest can escape non-ASCII (emoji, CJK) or reorder keys, so diff the manifest against base in full, not only the version line.
- **Reachability.** Confirm the package is built into the shipped artifact (`cargo tree -i <pkg> --target all`, or the equivalent import/feature check) before repeating the advisory's severity.

Before moving anything near a version pin, find out why it exists: `git log -S'<pinned-name>' -- <manifest>` usually names the bug. A bump that satisfies the advisory but leaves a companion pin at its old version can be worse than no bump.
