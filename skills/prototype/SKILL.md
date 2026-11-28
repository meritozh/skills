---
name: prototype
description: "Build throwaway code that answers one design question: a single self-contained HTML file that pushes a state model or business logic through the cases that are hard to reason about on paper, or several structurally different UI variants on one route, switched by a ?variant= param and a floating bar. Records the verdict and keeps the prototype on a throwaway branch, out of the main line. Use when the user wants to check whether a state model or logic holds up, or to see what a UI could look like before committing to it (做个原型, 试一下这个状态机, 出几版界面看看). Not for production code, a decided feature (to-implement-spec, go-work), or a screen's visual design (ui-design)."
---

# prototype

Run this skill when the user ran `/prototype`, or when the request matches the description. When you start it without `/prototype`, say so in one line so the user can redirect. When the work belongs to another skill, name it (for example `/to-implement-spec`), say why, and stop.

A prototype is **throwaway code that answers a question**: the run that settles a question instead of arguing it, as [principles/compare-real-options.md](principles/compare-real-options.md) says. The question decides the shape.

Its verdict feeds the skill that owns the decision: `feature-new` or `feature-iterate` when it settles how a feature behaves, `architect` or `to-implement-spec` when it settles a module's shape. This skill does not edit `docs/feature/` or `docs/spec/`.

## 1. Name the question and pick a branch

Write the question in one sentence. Then pick:

- **"Does this logic or state model hold up?"** → [references/logic.md](references/logic.md). One shareable HTML file, with free-play buttons and guided walkthroughs in tabs, that pushes the model through the cases hard to reason about on paper, and that a non-developer can drive.
- **"What should this look like?"** → [references/ui.md](references/ui.md). Several radically different UI variants on one route, switched by a URL search param and a floating bottom bar.

Ask when the question is ambiguous: a wrong pick wastes the whole prototype. When the user is not around, take the branch that fits the surrounding code (a backend module is logic, a page or component is UI) and state the assumption at the top of the prototype.

## 2. Rules for both branches

1. **Throwaway from day one, and marked as such.** Put the prototype next to the module or page it is for, so the context is obvious, and put `prototype` in its file or route name, so a reader sees it is not production. Follow the routing and file conventions the project already has; do not invent a new top-level structure.
2. **Trivial to run.** A UI prototype starts with one command from the project's task runner (`pnpm <name>`, `python <path>`, `bun <path>`). A logic prototype is one HTML file the user double-clicks.
3. **No persistence by default.** State lives in memory. Persistence is what a prototype might check, not what it leans on. When the question is about storage, use a scratch database or local file whose name says `PROTOTYPE-wipe-me`.
4. **Skip the polish.** No tests, no error handling beyond what keeps it running, no abstractions, no "what if we later need X". It answers one question, fast.
5. **Surface the state.** After every action (logic) and on every variant switch (UI), show the full relevant state, so the user sees what changed.
6. **Speak the domain.** Labels, states, and actions use the terms in `docs/GLOSSARY.md` when the repo has one, not the code's internal names.

## 3. Hand it over

Open the file for the user, or give the URL and the command that starts it. A dev server you start writes its output to `.scratch/prototype/<slug>/server.log` ([references/scratch.md](references/scratch.md)); read its tail only when the page fails. The useful moments are "wait, that should not be possible" and "I want the header from B with the sidebar from C": those are the bugs in the idea, and the design they want. When they ask for another action, scenario, or variant, add it.

## 4. Capture it when done

When the prototype has answered its question:

1. **The answer.** Write down the question and the verdict in two or three lines. The verdict rests on what the prototype was seen doing, a walkthrough run or a variant viewed, not on what its code should do, as [principles/prove-it-works.md](principles/prove-it-works.md) says.
2. **The prototype**, as a primary source, on a throwaway branch out of the main line. Do not stash, reset, or discard anything; the user's other uncommitted work rides along untouched.

   ```bash
   git switch -c prototype/<slug>
   git add <the prototype's files only>
   git commit -m "Prototype: <the question>" -m "Verdict: <the answer>"
   git switch -
   ```

   When a file mixes the user's own changes with prototype code, ask before staging it. Do not push unless asked. Stop the dev server you started and delete `.scratch/prototype/<slug>/`.
3. **The decision**, which goes to the skill that owns it: name `feature-new` or `feature-iterate` for a behavior, `architect` or `to-implement-spec` for a shape, with the verdict and the branch name. When the user asks to fold it into the real code now, rewrite it properly there; prototype code was written without tests or error handling. The pure logic module from a logic prototype is the exception: it was written to be lifted.
4. **The issue.** When the work has an issue, offer to leave a comment that points to the branch and states the verdict. Post it only when the user agrees.

## Report

```
question:  <one sentence>
branch:    logic / UI, <path or URL>, run with <command>
verdict:   <the answer> / open
captured:  prototype/<slug> at <hash> / not yet
next:      <skill that takes the decision>
```
