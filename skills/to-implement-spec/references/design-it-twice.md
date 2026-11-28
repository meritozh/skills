# Design it twice

For alternative interfaces to one deepening candidate. It applies [compare-real-options](../principles/compare-real-options.md). Terms are in [SKILL.md](../SKILL.md), dependency categories in [deepening.md](deepening.md).

## 1. Frame the problem space

Before spawning sub-agents, write for the user:

- The constraints any new interface must satisfy.
- Its dependencies, and the category of each.
- A rough code sketch that makes the constraints concrete. Not a proposal.

Show it, then go to step 2 without waiting.

## 2. Spawn sub-agents

Spawn 3 or more parallel sub-agents, each with a fresh context and a radically different interface to produce.

Each brief starts with `Read <absolute path of this skill's directory>/references/worker.md before anything else.` Then the technical brief: file paths, coupling, dependency category, what sits behind the seam, SKILL.md's vocabulary, and the terms in `docs/GLOSSARY.md`. Give each a different constraint:

- Minimize the interface: 1–3 entry points.
- Maximize flexibility: many use cases and extension.
- Optimize for the most common caller: the default case is trivial.
- A dependency crosses a real seam: design around ports and adapters.

Each sub-agent replies with:

1. Interface: types, methods, params, invariants, ordering, error modes.
2. A usage example.
3. What the implementation hides behind the seam.
4. Dependency strategy and adapters.
5. Trade-offs: where leverage is high and where thin.

## 3. Present and compare

Present the designs one at a time, then compare them in prose on depth, locality, and seam placement.

Recommend one design and say why, with the condition under which the runner-up would win. If pieces combine, propose the hybrid.
