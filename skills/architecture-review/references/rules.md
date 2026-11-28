# Domain rules

Loaded from `architecture-review` step 5, after [architecture.md](architecture.md). Each section ends with shapes that look like a break but are correct there.

## Multi-feature product or plugin host

### Shared modules do not know the features

Shared modules' interfaces do not name the features. A feature composes them, registered at one composition site.

Break: a shared module that branches on a feature name; feature-specific types, enums, strings, or config keys in the core; each feature copying a behavior they all perform; adding a feature edits the core's control flow.

Direction: invert, move.

### A feature can be deleted

Removing a feature deletes its directory and one composition-site line, and the rest builds.

Break: the core importing a feature's types; a feature reading another's tables.

Direction: move, invert.

### Plugins talk to the host, not to each other

A plugin imports the host's contract and nothing from another plugin. The host owns registration, ordering, teardown, and any need two plugins share.

Break: plugin A imports plugin B; two plugins that must load in order; a plugin reaching into the host's internals.

Direction: invert, move.

Not a break here: behavior used by one feature that was not extracted; a registration list in one composition file.

## Library or SDK

### Small surface, deep inside

The public surface is small and stable; the inside may be large. Errors speak the caller's language.

Break: internal types, raw records, or framework objects in a public signature; errors exposing internal paths; a public type changed without a major version.

Direction: merge, delete.

### Easy to use right, hard to use wrong

The obvious call does the safe thing. Dangerous behavior is opt-in and named.

Break: a default that loses data or blocks; two methods that must be called in order with nothing enforcing it; a boolean parameter whose meaning the call site cannot show.

Direction: merge, pin.

### Nothing happens unless the caller asks

A library does no I/O, reads no environment, writes no logs, installs no handlers, and holds no process-wide state the caller did not set up.

Break: logging, reading env vars, or registering a signal handler on import; a global singleton; a heavy dependency for one helper.

Direction: invert, delete.

Not a break here: a large internal module behind a small interface; no dependency injection in a library with no I/O.

## Data processing: pipeline, batch job, or compiler

### Reads apart from writes

Reading, transforming, and writing are separate stages. A reader changes nothing in its source. A transform does no I/O. A writer is the only writer of its output, and does not read it back to decide what to write.

Break: a scan that stamps or counts rows as it reads; a transform that queries a store mid-stream; a loader that reads the target to choose insert or update instead of writing idempotently; one table or partition written by two jobs; one shape forced on read and write models that need different ones.

Direction: split, pin.

### Stages with a named representation

Each stage boundary has one representation. A stage reads only its input, owns its output, and can be tested from its input alone.

Break: a stage that reaches into another's internals or mutates a representation it does not own; stage tests that run earlier stages to build input; output that differs on rerun; a failed run that cannot restart at a stage boundary.

Direction: split, move.

### Inputs are immutable; outputs are rebuildable

Raw inputs are never edited in place. Anything derived is recomputed by rerunning the job, with no manual step.

Break: a job that overwrites its input; a derived table nobody can regenerate; a backfill that needs hand-run SQL.

Direction: pin, split.

### Schema is explicit at every boundary

Records crossing a stage carry a declared schema with stated evolution rules.

Break: a stage that infers types from the data at runtime; a column added with no schema change; a consumer that breaks on an unknown field.

Direction: pin.

Not a break here: a large stage; one central representation every stage imports.

## Service with storage

### Thin handlers, a domain that decides

A handler parses, calls the domain, and responds. The domain decides in the business's language; a storage adapter persists.

Break: a handler that queries, decides, and writes inline; business rules in SQL, ORM hooks, or triggers; a domain type that is the table row with methods.

Direction: split, move.

### One writer, one consistency boundary

Each table, aggregate, or key has one writer. A transaction spans exactly the facts that must agree; what spans more is eventual and named so.

Break: one table written from several handlers; one request writing two stores without a transaction or outbox; a transaction across aggregates; a retried call with no idempotency key.

Direction: pin.

### Every outbound call can fail and end

A call to another service or store has a timeout and a decided response to failure.

Break: a client with no timeout; a retry loop with no cap or backoff; an unbounded in-memory queue.

Direction: pin, straighten.

### Schema changes ship with their migration

A schema change lands with a migration both old and new code run against during a deploy.

Break: a schema change with no migration; a migration that drops a column running code still reads; a data fix done by hand.

Direction: pin.

Not a break here: handlers that call storage directly in a small service with one adapter; an API schema and a database schema that differ.

## UI client

### One owner per piece of state, derived state computed

Each piece of state has one owner. A value derivable from other state is computed where it is used.

Break: one fact held in two stores, or in a store and a component; a `count` kept beside the `items` it counts.

Direction: pin, delete.

### Data flows one way

State flows down; events flow up.

Break: a child mutating a parent's state; two-way binding across components; a global event bus for siblings; a shared component branching on the screen name.

Direction: invert, straighten.

### Render is pure; the view is humble

Rendering maps state to markup. Network calls, storage writes, and timers run in effects. Business rules live in a store or model testable without the DOM.

Break: a fetch inside render; business rules in a component; a component testable only by mounting the app.

Direction: split.

### Every data-driven screen has loading, empty, and error states

Break: nothing shown while loading; an empty list with no words; an error swallowed into a blank view.

Direction: pin.

Not a break here: component-local state no other component reads; similar-looking components on different screens that change independently.

## CLI or tool

### Parse, decide, act

Argument parsing, the decision, and the side effects are separate. Destructive operations go through one guarded path with confirmation or `--dry-run`. Configuration precedence (flags, env, file, defaults) is defined once.

Break: parsing mixed with the work; a destructive action confirmed separately in several commands; precedence decided differently in two commands.

Direction: split, pin.

### Works in a pipe

Stdout is data, stderr is diagnostics, exit codes mean something, success is quiet, and scripts get a machine-readable mode.

Break: progress on stdout; a zero exit on failure; a non-interactive run blocking on a prompt; output only a human can parse.

Direction: pin, split.

Not a break here: one file per subcommand with some repeated argument parsing.

## Monorepo or multi-repo

### Contracts have an owner and a version

Every contract between packages or repos (a shared type, API, schema, event, or file format) has one owner and a version. A consumer depends on a package's public entry.

Break: a contract edited from both sides with no version; deep imports into another package; a shared type copied across packages by hand.

Direction: pin, invert.

### A package builds and tests alone

Each package builds and tests from its own directory with its declared dependencies.

Break: a build that works only from the root; a test importing a sibling's fixtures; a relative path crossing a package boundary.

Direction: move, invert.

Not a break here: small utilities duplicated across packages that change independently.
