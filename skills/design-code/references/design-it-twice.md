# Design it twice

Use this when the user wants alternative interfaces for one deepening candidate. The first idea is unlikely to be the best. Terms are defined in [SKILL.md](../SKILL.md). Dependency categories are in [deepening.md](deepening.md).

## 1. Frame the problem space

Before spawning sub-agents, write a user-facing explanation:

- The constraints any new interface must satisfy.
- The dependencies it relies on, and which category each falls into.
- A rough code sketch that makes the constraints concrete. Not a proposal.

Show this to the user, then go to step 2. They read while the sub-agents work.

## 2. Spawn sub-agents

Spawn 3 or more sub-agents in parallel, each with a fresh context. Each produces a radically different interface for the deepened module.

Prompt each with its own technical brief: file paths, coupling, dependency category, what sits behind the seam. The brief is independent of the user-facing explanation. Give each a different constraint:

- Minimize the interface: 1–3 entry points, maximum leverage per entry point.
- Maximize flexibility: many use cases and extension.
- Optimize for the most common caller: the default case is trivial.
- When a dependency crosses a real seam: design around ports and adapters.

The brief uses the vocabulary in SKILL.md and the `## Terms` of the design doc, so every design names things the same way.

Each sub-agent outputs:

1. Interface: types, methods, params, invariants, ordering, error modes.
2. A usage example.
3. What the implementation hides behind the seam.
4. Dependency strategy and adapters.
5. Trade-offs: where leverage is high, where it is thin.

## 3. Present and compare

Present the designs one at a time, then compare them in prose on depth, locality, and seam placement.

Recommend one design and say why. If pieces from different designs combine, propose the hybrid. Give a strong read, not a menu.
