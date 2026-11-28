# Two-axis review

This replaces `SKILL.md` steps 2 to 9. Its quality gate and sign-off still apply.

Two axes, reported apart:

- **Standards**: the repo's documented coding standards, plus the smell baseline below.
- **Spec**: the originating issue or spec.

If the issue tracker is not available, say so and use what the repo and the user can point at.

## 1. Pin the fixed point

Use the fixed point the user named (SHA, branch, tag, `main`, `HEAD~5`), or ask.

Diff: `git diff <fixed-point>...HEAD`. Commits: `git log <fixed-point>..HEAD --oneline`.

Before spawning anyone, confirm the ref resolves (`git rev-parse <fixed-point>`) and the diff is non-empty; otherwise stop.

## 2. Spec source

Look in this order:

1. Issue references in the commit messages (`#123`, `Closes #45`, GitLab `!67`).
2. A path the user passed.
3. The feature doc and implement spec the branch delivers (`docs/feature/<slug>.md`, `docs/spec/<slug>.md`), or a spec under `specs/` or `.scratch/` matching the branch. A branch that finishes the work moved its spec to `docs/spec/archived/<YYYY-MM-DD>-<slug>.md`; read it there. It is the one archived spec a review reads.
4. Otherwise ask. If the user says there is no spec, skip the Spec sub-agent and report "no spec available".

## 3. Standards sources

Every repo file that documents how code should be written, including `CODING_STANDARDS.md` or `CONTRIBUTING.md` when they exist. The smell baseline below always applies.

- **The repo overrides.** Where a documented standard endorses something the baseline would flag, suppress the smell.
- **Always a judgement call.** Each smell is a heuristic, never a hard violation. Skip anything tooling already enforces.

Each smell reads *what it is*, then *how to fix*:

- **Mysterious Name**: a name that does not reveal what it does or holds. Rename it; if no honest name comes, the design is murky.
- **Duplicated Code**: the same logic shape in more than one hunk or file. Extract it and call it from both.
- **Feature Envy**: a method uses another object's data more than its own. Move it onto that data.
- **Data Clumps**: the same few fields or params travel together. Bundle them into one type.
- **Primitive Obsession**: a primitive or string stands in for a domain concept. Give the concept its own small type.
- **Repeated Switches**: the same `switch` or `if` cascade on one type recurs. Use polymorphism, or one shared map.
- **Shotgun Surgery**: one logical change forces edits across many files. Gather what changes together into one module.
- **Divergent Change**: one file is edited for several unrelated reasons. Split it so each module changes for one reason.
- **Speculative Generality**: abstraction, parameters, or hooks for needs the spec does not have. Delete them.
- **Message Chains**: long `a.b().c().d()` navigation. Hide the walk behind one method on the first object.
- **Middle Man**: a class or function that mostly delegates. Cut it and call the real target.
- **Refused Bequest**: a subclass that ignores or overrides most of what it inherits. Use composition.

## 4. Spawn both sub-agents

Issue both calls together, in fresh context. Brief each with paths and commands, as [principles/guard-the-context.md](../principles/guard-the-context.md) says, starting with `Read <absolute path of this skill's directory>/references/worker.md before anything else.`, then the diff command and the commit list.

**Standards prompt** adds the standards files found above, and the absolute path of this file with the heading `## 3. Standards sources` for the smell baseline. Task: per file or hunk, (a) every place the diff violates a documented standard, citing file and rule; (b) any baseline smell, named, with the hunk quoted. Documented-standard breaches can be hard; baseline smells are judgement calls. Under 400 words.

**Spec prompt** adds the spec path, or the issue text when the spec is an issue with no file. Task: (a) requirements missing or partial; (b) behaviour the spec did not ask for; (c) requirements implemented wrong. Quote the spec line for each finding. Judge each test the spec names by [principles/test-behavior.md](../principles/test-behavior.md). Under 400 words.

## 5. Aggregate

Present the reports under `## Standards` and `## Spec`, verbatim or lightly cleaned, without merging or reranking.

End with one line: findings per axis, and the worst issue within each. Do not pick a winner across axes.
