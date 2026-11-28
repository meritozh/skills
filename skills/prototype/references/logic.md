# Logic prototype

One self-contained HTML file, a **shareable demo**, that lets anyone drive a state model by clicking buttons. Use it when the question is about business logic, state transitions, or the shape of data: the kind of thing that looks reasonable on paper and only feels wrong once real cases go through it.

It is one file with nothing to install, so it can go to a non-developer (a designer, a PM, a domain expert) who feels the model for themselves. When the question is what something should look like, use [ui.md](ui.md) instead.

## 1. State the question

Before any code, write down the state model and the question, as one paragraph in a visible intro at the top of the page, not in a comment, so it can be checked later.

## 2. Keep the logic in one portable module

Put the logic that answers the question in one `<script>` block, written as a small pure module that could be lifted into the real codebase later. The page around it is throwaway. This module is not.

Its shape follows the question:

- **A pure reducer**, `(state, action) => state`, when actions are discrete events and the state is one value.
- **A state machine** with explicit states and transitions, when which actions are legal right now is part of the question.
- **A few pure functions over a plain data type**, when there is no current state, only transformations.
- **A class or module with a clear method surface**, when the logic really owns ongoing internal state.

Pick the shape that fits the question, not the one easiest to wire to a page. Keep it pure: no DOM, no `document`, no button handler reaching inside. The page calls into the module, and nothing flows the other way, so the module lifts into the real code on its own.

## 3. Build the shareable file

One file of plain HTML, CSS, and JS: no framework, no bundler, no server, everything inline, so it opens with a double-click and survives being sent around.

Write it for a non-developer. Every label is in domain language: the buttons and the state read like the business, not like the reducer. Say in plain words what is happening.

Lay it out top to bottom:

1. **Title and one line** on what the demo lets you explore: the question from step 1.
2. **Current state.** The full relevant state as a readable panel of labelled fields, not a raw JSON dump, rendered again after every click. Where it helps, call out what just changed.
3. **Free-play buttons.** One per action, always available, so anyone can poke the model in any order. Each click dispatches its action and renders the state again.
4. **Guided walkthroughs.** A set of scenarios, one per tab. Each tab has a short plain description of the situation it sets up and what to watch for, and under it the ordered buttons to press. Each step is a real button: clicking it performs that action and moves to the next step. Starting a walkthrough resets to a known initial state, so the scenario runs the same way every time.

Pick scenarios for the awkward cases, the ones hard to reason about on paper: the happy path, a tricky edge case, and an attempt at something that should be illegal.

Keep it clean and restrained: clear type, generous spacing, one accent color. No animation and no gimmicks, nothing that competes with the state and the buttons.

## 4. Capture

When the prototype has answered its question, capture it as [the skill](../SKILL.md) says. For a logic prototype: the validated module is the decision and lifts into the real code; the HTML shell goes to the throwaway branch, where, being one file, it stays trivial to run again.

## Do not

- **Reach for a framework, bundler, or server.** A React app or a dev server defeats "shareable".
- **Ship the HTML shell.** The module behind it is the part worth keeping.
