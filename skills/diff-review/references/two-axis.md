# Two-axis review

Loaded when the user pins a fixed point, or asks for standards versus spec. Run step 1 of `SKILL.md` (protect the worktree) first. This file then replaces steps 2 to 9. The quality gate and sign-off in `SKILL.md` still apply.

Two axes, reported apart:

- **Standards**: does the diff follow this repo's documented coding standards, plus the smell baseline below?
- **Spec**: does the diff implement the originating issue or spec?

Run the axes as parallel sub-agents with fresh context, then aggregate. Do not merge or rerank findings across axes. A change can pass one and fail the other.

The issue tracker should already be available. If it is not, say so and use what the repo and the user can point at.

## 1. Pin the fixed point

Use the fixed point the user named (SHA, branch, tag, `main`, `HEAD~5`). If they did not name one, ask.

Diff command: `git diff <fixed-point>...HEAD` (three-dot, against the merge-base). Commits: `git log <fixed-point>..HEAD --oneline`.

Confirm the ref resolves (`git rev-parse <fixed-point>`) and the diff is non-empty before spawning anyone. A bad ref or an empty diff stops here.

## 2. Spec source

Look in this order:

1. Issue references in the commit messages (`#123`, `Closes #45`, GitLab `!67`), fetched the way the tracker documents.
2. A path the user passed.
3. A spec under `docs/`, `specs/`, or `.scratch/` matching the branch or feature.
4. If nothing is found, ask. If the user says there is no spec, skip the Spec sub-agent and report "no spec available".

## 3. Standards sources

Search the repo for every file that documents how code should be written. When `CODING_STANDARDS.md` or `CONTRIBUTING.md` exists, it is on the list.

The smell baseline below always applies, even when the repo documents nothing.

- **The repo overrides.** A documented standard wins. Where it endorses something the baseline would flag, suppress the smell.
- **Always a judgement call.** Each smell is a labelled heuristic, never a hard violation. Skip anything tooling already enforces.

Each smell reads *what it is*, then *how to fix*. Match it against the diff:

- **Mysterious Name**: a function, variable, or type whose name does not reveal what it does or holds. Rename it. If no honest name comes, the design is murky.
- **Duplicated Code**: the same logic shape appears in more than one hunk or file in the change. Extract the shared shape and call it from both.
- **Feature Envy**: a method reaches into another object's data more than its own. Move the method onto the data it envies.
- **Data Clumps**: the same few fields or params travel together. Bundle them into one type and pass that.
- **Primitive Obsession**: a primitive or string stands in for a domain concept. Give the concept its own small type.
- **Repeated Switches**: the same `switch` or `if` cascade on the same type recurs. Replace it with polymorphism, or one map both sites share.
- **Shotgun Surgery**: one logical change forces scattered edits across many files. Gather what changes together into one module.
- **Divergent Change**: one file is edited for several unrelated reasons. Split it so each module changes for one reason.
- **Speculative Generality**: abstraction, parameters, or hooks for needs the spec does not have. Delete them. Inline until a real need shows.
- **Message Chains**: long `a.b().c().d()` navigation the caller should not depend on. Hide the walk behind one method on the first object.
- **Middle Man**: a class or function that mostly delegates. Cut it and call the real target.
- **Refused Bequest**: a subclass or implementer that ignores or overrides most of what it inherits. Drop the inheritance and use composition.

## 4. Spawn both sub-agents

Issue both calls together and aggregate what they return.

**Standards prompt** includes the diff command, the commit list, the standards files found above, and this smell baseline pasted in full. Brief: per file or hunk, (a) every place the diff violates a documented standard, citing file and rule; (b) any baseline smell, named, with the hunk quoted. Documented-standard breaches can be hard. Baseline smells are always judgement calls, and a documented repo standard overrides the baseline. Skip anything tooling enforces. Under 400 words.

**Spec prompt** includes the diff command, the commit list, and the spec path or its contents. Brief: (a) requirements missing or partial; (b) behaviour the spec did not ask for; (c) requirements that look implemented but wrong. Quote the spec line for each finding. Under 400 words.

## 5. Aggregate

Present the reports under `## Standards` and `## Spec`, verbatim or lightly cleaned. Do not merge or rerank them.

End with one line: findings per axis, and the worst issue within each axis. Do not pick a winner across axes.
