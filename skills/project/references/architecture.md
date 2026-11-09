# Architecture

Design and change code so that the changes this repo actually makes stay local, and a failure leaves consistent state. Judge structure by those two outcomes, not by resemblance to a named style.

- **Deep modules.** A module puts a lot of behavior behind a small interface. Before adding a module, ask whether deleting it would spread complexity back into its callers. If not, do not add it. Prefer fewer entry points and simpler parameters, with more decided inside.
- **Shared code does not know its callers.** A shared module never imports from a caller, and never branches on a caller's name, type, or config key. Features compose shared modules. The core does not implement a feature.
- **Extract only what is already shared.** Lift behavior out when two callers already need it and change it together. Copies that evolve apart stay separate. Add no abstraction, option, or hook for a need that does not exist yet.
- **Dependencies point inward.** Core logic does not import UI, frameworks, or concrete storage and network clients. No import cycles between modules.
- **Seams where something varies.** Pass a dependency in at a seam only when it has two adapters; production and test count as two. Tests go through a module's interface, not its internals.
- **One writer per fact.** Each piece of state has one authoritative write point. A step that can fail leaves state consistent: transactions, idempotent retries, and write-to-temp-then-rename for files.
- **Code that changes together lives together.** When one kind of change keeps touching the same set of modules, move the boundary instead of patching each side again.
- **One name per concept.** Use the terms in `docs/design/`. One word never names two things.

How far a change may break existing interfaces and data follows Project status.
