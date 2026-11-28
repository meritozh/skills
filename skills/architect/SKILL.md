---
name: architect
description: "Design the shape of a non-trivial change before writing code: trace every part of the system it touches, sketch two different shapes as real types, signatures, and module boundaries, pick the one where each piece of state has one owner, each task has one way to do it, and callers need to know least, then write that skeleton and stay with the implementation, redesigning instead of patching when workarounds repeat. Use when the user runs /architect or asks to architect or design a change before coding (先设计再写, 设计一下结构). Not for a documented feature that needs an implement spec (to-implement-spec), a large or contested design (arena), a question that has to be felt (prototype), or a whole-codebase review (architecture-review)."
disable-model-invocation: true
---

# architect

User-invoked only: follow this skill only when the user ran `/architect`. When the work belongs to another skill, name it (for example `/arena`), say why, and stop. Do not invoke it yourself.

Make the shape a choice: trace what the change touches, sketch two shapes, pick one on stated grounds, write it as a skeleton, then hold the implementation to it until it is done or proves wrong.

A feature with a doc in `docs/feature/`, whose shape another agent builds, is `to-implement-spec`. A question that has to be felt, not argued ("does this state model hold up", "what should this look like"), is `prototype`. A review of the whole codebase is `architecture-review`. A large or contested design is `/arena`: name it and stop. It is contested when it crosses several subsystems, more than one module could reasonably own the state, the user and you disagree on the shape, or a wrong shape is expensive to undo.

## 1. Trace

Read every system the change touches before sketching: the entry points, the modules that own the state involved, the callers and consumers of whatever changes, stored data and its format, and the tests on that surface. Read `AGENTS.md` (its `### Architecture` and `### Project rules`) and `docs/GLOSSARY.md` when they exist.

Write the trace down in a few lines: each piece of state the change touches, and the module that owns it today.

## 2. Sketch two shapes

Two shapes that differ in structure, as [principles/compare-real-options.md](principles/compare-real-options.md) says: in where the state lives, where a boundary falls, or who calls whom. Not one shape and a strawman, and not the same shape with other names.

For each shape:

- the module tree, new and changed files marked;
- the types and signatures as real code in the project's language, bodies left out;
- the call tree of the main path.

Draw both in the same form so they compare line by line. When the `show-me` skill is installed, invoke it to present them.

## 3. Pick

Judge both shapes against these, in order:

1. **One owner per piece of state.** Each fact lives in one module, which alone changes it.
2. **One way to do each task.** No two paths that reach the same outcome.
3. **Callers need to know least.** The smaller interface, with fewer concepts a caller must hold and fewer orders of calls it must respect.
4. **The rules in [references/architecture.md](references/architecture.md)**, and the repo's `### Project rules`, which win when they disagree.
5. **On a tie, the smaller change**, as [principles/subtract-before-you-add.md](principles/subtract-before-you-add.md) says.

Give the pick in one line, and why the other shape lost in the terms above. When the user is here, show both with the pick marked as recommended and let them confirm. When they are not, go on and say so.

When neither shape passes 1 and 2, the trace missed something: go back to step 1. When both pass and the stakes are high, the design is contested: name `/arena`.

When the user asked only for a design, stop here.

## 4. Write the skeleton

Write the picked shape as code before any behavior: the files, the types, the signatures, and stub bodies that fail loudly (`throw new Error('todo')`, `todo!()`, `raise NotImplementedError`). Make it pass the project's type check or build. The skeleton is the contract the implementation fills in.

## 5. Stay in the loop

Fill the skeleton in, yourself or through subagents on the code row of [references/models.md](references/models.md), and check each piece against the shape as it lands. Each subagent brief starts with `Read <absolute path of this skill's directory>/references/worker.md before anything else.` Subagents that run at once each get their own files or worktree, as [principles/separate-shared-state.md](principles/separate-shared-state.md) says. Tests drive the interface the skeleton defines, as [principles/test-behavior.md](principles/test-behavior.md) says.

- **A signature has to change.** Decide whether the sketch was wrong or the implementation is taking a shortcut. Fix the one that is wrong, and say which.
- **A workaround appears:** a flag threaded through layers to reach one consumer, a special case for one caller, a second copy of a fact, a callback that reaches back up a layer, a cast to get past a type. The first one is a note. The second of the same kind means the shape is wrong.
- **When the shape is wrong, redesign instead of patching**, as [principles/redesign-from-first-principles.md](principles/redesign-from-first-principles.md) says. Sketch the new shape, go back through step 3, and move every caller to it in one pass, deleting the old shape as [principles/migrate-then-delete.md](principles/migrate-then-delete.md) says.

Done means the stubs are gone and the project's own checks pass, run in this session, as [principles/prove-it-works.md](principles/prove-it-works.md) says.

## Report

```
trace:      <state> -> <owner>; ...
shapes:     A <one line>; B <one line>
pick:       A / B, because <terms from step 3>; the other lost on <criterion>
redesigns:  none / <what forced it, and the new shape in one line>
deviations: none / <signature that changed from the sketch, and why>
checks:     <command> -> pass / fail / not run (why)
```
