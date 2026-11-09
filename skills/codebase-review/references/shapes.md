# Shape checks

Loaded from `codebase-review` step 5 for each shape found in step 3. Every section has the checks for that shape and the false findings to avoid. A false finding is a structure that would be a defect in another shape but is correct here.

The four lenses still run on every shape. These checks add to them.

## Multi-feature product or plugin host

Shared behavior comes out of the features that already share it, and into a module whose interface does not name those features. A feature is a composition of those modules. The core does not implement a feature.

1. List the features from the docs or the real entry points. Do not invent a taxonomy.
2. Take one behavior that at least two features perform. It has been extracted when it lives in a module that does not name a feature, and each feature only composes that module with others. It has not been extracted when each feature carries its own copy, or a shared module branches on a feature name.
3. Count feature-specific names in the core: types, enums, strings, and config keys.

   ```bash
   rg -n -w -e '<featureA>' -e '<featureB>' <core-dir> | cut -d: -f1 | sort | uniq -c | sort -rn
   ```

4. Replay one change that adds or extends a feature (Lens 1). A feature that only recombines existing capabilities touches the composition site alone. If it must edit the core's control flow, the abstraction still has that feature's shape.

Anchors for this check: 5, two or more features share the mechanism and the core path names no feature. 3, the current features run but a new feature still needs a branch or a registration in the core. 1, the core implements the features and there is no composable layer.

False findings:

- Behavior used by only one feature, not yet extracted. Extract only what already appears in more than one feature.
- A registration list in one composition file. Registration at the composition site is the design; registration inside core control flow is the defect.
- A plugin framework nothing composes does not raise the score. Flag it as Delete.

## Library or SDK

1. Measure the public surface: exported symbols, entry points, and configuration options. Compare it with what the README's examples actually use.
2. Look for leaks: internal types, raw records, or framework objects in public signatures; errors that expose internal module paths.
3. Check the stability promise: semver or changelog discipline, and whether a public type changed without a major version.
4. Count runtime dependencies. Each one is a constraint pushed onto every caller.

False findings:

- A large internal module behind a small interface. That is depth, not a god object.
- No dependency injection in a library with no I/O. In-process code needs no seam.

## Compiler, pipeline, or batch job

1. Name the stages and the representation that crosses each boundary (AST, IR, row batch, file format).
2. Each stage is testable from its input representation alone. Check that stage tests construct the representation directly, not by running earlier stages.
3. No stage reads another stage's internals or mutates a representation it does not own.
4. Rerunning a stage on the same input gives the same output, and a failed run can restart at a stage boundary without manual cleanup.

False findings:

- A large stage. A stage is as big as its job; judge it by its boundary, not its size.
- One central representation that every stage imports. That is the contract, not coupling.

## Service with storage

1. Map the authoritative write points: which handlers and jobs write which tables, keys, or queues (Lens 3).
2. Check transaction boundaries against the facts they protect. One request that writes two stores without a transaction or an outbox is a crash point.
3. Check retries: every retried call carries an idempotency key or is naturally idempotent.
4. Check the migration path: schema changes ship with migrations, and old and new code can run against the schema during a deploy.

False findings:

- Handlers that call storage directly in a small service. A repository layer with one adapter is a hypothetical seam.
- Duplication between the API schema and the database schema when they evolve apart. They are different contracts.

## UI client

1. For each piece of state, find its owner. One fact held in several stores, caches, or component states is a finding.
2. Rendering is separate from effects: network calls, storage writes, and timers do not run inside render paths.
3. Loading, empty, and error states exist for each data-driven screen.
4. A shared component that branches on the screen using it knows its callers (Lens 2).

False findings:

- Component-local state that no other component reads. Local is correct.
- Similar-looking components on different screens that change independently. Leave them.

## CLI or tool

1. The command contract is explicit: exit codes, stdout for data, stderr for diagnostics, a machine-readable mode when scripts consume the output.
2. Side effects are isolated: destructive operations go through one guarded path with confirmation or `--dry-run`.
3. Configuration precedence is defined once (flags, env, config file, defaults) and tested.
4. Non-interactive runs never block on a prompt.

False findings:

- One file per subcommand with some repeated argument parsing. Flag it only when the copies co-change.

## Monorepo or multi-repo

1. List the contracts between packages or repos: shared types, APIs, schemas, events, file formats.
2. For each contract, name its owner and its versioning. A contract edited from both sides without a version is a finding.
3. Run the co-change measure across package or repo boundaries. Cross-repo co-change is the most expensive kind.
4. Check that a package's consumers depend on its public entry, not on deep imports into its source tree.

False findings:

- Duplicated small utilities across packages that change independently. Independent packages may own their own copies.
