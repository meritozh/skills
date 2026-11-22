# Domain rules

Loaded from `architecture-review` step 5, after the universal rules in [architecture.md](architecture.md). That file is shared with the `project` skill and is the same text `project` writes into a repo's `AGENTS.md` as `### Architecture`; the universal rules are therefore the rules a repo has already agreed to. Each domain section here adds the rules for one kind of system and ends with the shapes that look like a break but are correct there. Each rule is stated once, with the signs of a break, so a reader can recognize the judgment without computing it.

The rules draw on A Philosophy of Software Design, Clean Architecture, The Pragmatic Programmer, Domain-Driven Design, Designing Data-Intensive Applications, Release It!, and The Art of Unix Programming. None is quoted; each is written as a judgment a reader can make on this codebase.

A repo's own `### Project rules` in `AGENTS.md` outrank these when they disagree.

## Multi-feature product or plugin host

### Shared modules do not know the features

Shared behavior lives in modules whose interfaces do not name the features. A feature is a composition of those modules, registered at one composition site. The core does not implement a feature.

Break: a shared module that branches on a feature name; feature-specific types, enums, strings, or config keys in the core; each feature carrying its own copy of a behavior they all perform; adding a feature means editing the core's control flow.

Direction: invert, move.

### A feature can be deleted

Removing a feature deletes its directory and one line at the composition site, and the rest still builds.

Break: a feature's types imported by the core; a feature's tables read by another feature; a feature whose removal needs edits in several shared modules.

Direction: move, invert.

### Plugins talk to the host, not to each other

A plugin imports the host's contract and nothing from another plugin. The host owns registration, ordering, and teardown. A need two plugins share goes into the host.

Break: plugin A imports plugin B; two plugins that must load in order; a plugin that reaches around the host into its internals.

Direction: invert, move.

Not a break here: behavior used by one feature that was not extracted; a registration list in one composition file.

## Library or SDK

### Small surface, deep inside

The public surface is small and stable; the inside may be large. Nothing internal leaks through a signature. Errors speak the caller's language.

Break: internal types, raw records, or framework objects in a public signature; errors that expose internal module paths; a public type changed without a major version; exports the README's own examples never use.

Direction: merge, delete.

### Easy to use right, hard to use wrong

The obvious call does the safe thing. Dangerous behavior is opt-in and named. Two calls that must happen in order are one call.

Break: a default that loses data or blocks; a pair of methods that must be called in order with nothing enforcing it; a boolean parameter whose meaning the call site cannot show.

Direction: merge, pin.

### Nothing happens unless the caller asks

A library does no I/O, reads no environment, writes no logs, installs no handlers, and holds no process-wide state the caller did not set up. Each runtime dependency is a constraint pushed onto every caller.

Break: a library that logs to stdout, reads env vars, or registers a signal handler on import; a global singleton; a heavy dependency for one helper.

Direction: invert, delete.

Not a break here: a large internal module behind a small interface; no dependency injection in a library with no I/O.

## Data processing: pipeline, batch job, or compiler

### Reads apart from writes

Reading, transforming, and writing are separate stages. A reader changes nothing in its source. A transform does no I/O. A writer is the only writer of its output, and does not read the output back to decide what to write.

Break: a scan that stamps, marks, or counts rows as it reads them; a transform that queries a store mid-stream; a loader that reads the target to choose insert or update instead of writing idempotently; the same dataset, table, or partition written by two jobs; one shape forced on a read model and a write model whose readers need different ones.

Direction: split, pin.

### Stages with a named representation

Each boundary between stages has one representation. A stage reads only its input and owns its output, and can be tested from its input alone.

Break: a stage that reaches into another stage's internals or mutates a representation it does not own; stage tests that run the earlier stages to build their input; a stage whose output differs on rerun; a failed run that cannot restart at a stage boundary without manual cleanup.

Direction: split, move.

### Inputs are immutable; outputs are rebuildable

Raw inputs are never edited in place. Anything derived can be recomputed from its inputs by rerunning the job, with no manual step.

Break: a job that overwrites its own input; a derived table nobody can regenerate; a backfill that needs hand-run SQL; a fix applied to the output instead of to the job.

Direction: pin, split.

### Schema is explicit at every boundary

Records crossing a stage carry a declared schema with stated evolution rules. A consumer survives a producer adding a field.

Break: a stage that infers types from the data at runtime; a column added with no schema change; a consumer that breaks on an unknown field; a dict of whatever between stages.

Direction: pin.

Not a break here: a large stage; one central representation every stage imports.

## Service with storage

### Thin handlers, a domain that decides

A handler parses, calls the domain, and responds. The domain decides in the business's language; a storage adapter persists. The domain model is not the table row.

Break: a handler that queries, decides, and writes inline; business rules in SQL, ORM hooks, or triggers; a domain type that is the database schema with methods on it.

Direction: split, move.

### One writer, one consistency boundary

Each table, aggregate, or key has one writer. A transaction spans exactly the facts that must agree; what spans more is eventual and named so. A retried call is idempotent.

Break: the same table written from several handlers; one request writing two stores without a transaction or an outbox; a transaction across several aggregates; a retried call with no idempotency key.

Direction: pin.

### Every outbound call can fail and end

A call to another service or store has a timeout and a decided response to failure. Nothing waits forever, retries without bound, or queues without a limit.

Break: a client with no timeout; a retry loop with no cap or backoff; an unbounded in-memory queue; one slow dependency that stalls every request.

Direction: pin, straighten.

### Schema changes ship with their migration

A schema change lands with a migration that old and new code can both run against during a deploy.

Break: a schema change with no migration; a migration that drops a column the running code still reads; a data fix done by hand.

Direction: pin.

Not a break here: handlers that call storage directly in a small service with one adapter; an API schema and a database schema that differ.

## UI client

### One owner per piece of state, derived state computed

Each piece of state has one owner. A value derivable from other state is computed where it is used, not stored beside its source.

Break: one fact held in two stores, or in a store and a component; a `count` kept beside the `items` it counts; a selection stored twice for two screens.

Direction: pin, delete.

### Data flows one way

State flows down; events flow up. A child does not reach into a parent or a sibling, and a shared component does not know which screen uses it.

Break: a child mutating a parent's state directly; two-way binding across components; a global event bus for sibling talk; a component that branches on the screen name.

Direction: invert, straighten.

### Render is pure; the view is humble

Rendering maps state to markup and does nothing else. Network calls, storage writes, and timers run in effects. Business rules live in a store or model testable without the DOM.

Break: a fetch inside render; business rules in a component; a component testable only by mounting the whole app.

Direction: split.

### Every data-driven screen has loading, empty, and error states

Break: a screen that shows nothing while loading; an empty list with no words; an error swallowed into a blank view.

Direction: pin.

Not a break here: component-local state no other component reads; similar-looking components on different screens that change independently.

## CLI or tool

### Parse, decide, act

Argument parsing, the decision, and the side effects are separate. Destructive operations go through one guarded path with confirmation or `--dry-run`. Configuration precedence (flags, env, file, defaults) is defined once.

Break: argument parsing mixed with the work; a destructive action in several commands, each with its own confirmation; precedence decided differently in two commands.

Direction: split, pin.

### Works in a pipe

Stdout is data, stderr is diagnostics, exit codes mean something, success is quiet, and a machine-readable mode exists when scripts consume the output. Nothing prompts when there is no terminal.

Break: progress messages on stdout; a zero exit on failure; a non-interactive run that blocks on a prompt; output only a human can parse.

Direction: pin, split.

Not a break here: one file per subcommand with some repeated argument parsing.

## Monorepo or multi-repo

### Contracts have an owner and a version

Every contract between packages or repos (a shared type, API, schema, event, or file format) has one owner and a version. A consumer depends on a package's public entry, not on deep paths into its source.

Break: a contract edited from both sides with no version; deep imports into another package's internals; a shared type copied across packages and kept in sync by hand.

Direction: pin, invert.

### A package builds and tests alone

Each package is built and tested from its own directory with its declared dependencies. Nothing depends on the repo layout or on a sibling's source or test helpers.

Break: a build that works only from the root; a test importing a sibling's test fixtures; a relative path crossing a package boundary.

Direction: move, invert.

Not a break here: small utilities duplicated across packages that change independently.
