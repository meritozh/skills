---
name: design-system
description: "Produce, iterate, and maintain the project's design system in docs/design-system/: a DESIGN.md that follows the google-labs-code/design.md spec (tokens for color, type, spacing, shape, motion, and components, with the prose that says why and how), plus the component sheets and guides it references. Creates it from the product's code, an older DESIGN.md, or a style brief; changes it when the look, a token, or a component changes; audits it against the spec and the code. Use when the user wants to set up, change, or check the project's design system or visual style (设计系统, 设计规范, 视觉风格, 换主色, 加暗色模式, DESIGN.md). Not for building or polishing a screen, which follows the design system through to-implement-spec and go-work, for a broken render (code-bugfix), or for print documents."
---

# design-system

Run this skill when the user ran `/design-system`, or when the request matches [When to use](#when-to-use). When you start it without `/design-system`, say so in one line, with the reason, so the user can redirect. When the work belongs to another skill, say which and why: switch to it when you can invoke it, otherwise name it for the user (for example `/to-implement-spec`) and stop.

The design system is the project's visual identity written down: how the product looks, moves, and writes, the exact values, and why they are those values. It lives in `docs/design-system/`, rooted at `DESIGN.md` in the format of [google-labs-code/design.md](https://github.com/google-labs-code/design.md). The tokens are the normative values. The prose carries the intent, and the prose is where the design lives. Everything that builds UI reads it: `to-implement-spec` names its tokens and components in a spec's steps, and `go-work` builds with them.

One run does one of three things:

- **Create:** write the first design system, from the product as it is, an older design file, or a style brief.
- **Change:** decide a change to the system and write it in place: a new direction, a token, a section, a component, a theme.
- **Audit:** check the system against the spec, against itself, and against the code, then fix what lives in `docs/design-system/`.

Stop at the system. Do not build, restyle, or polish product screens or components: a plan for that is `to-implement-spec`, and building it is `go-work`. The one piece of product code this skill keeps in step is the [token source](#what-it-writes). A render that is broken rather than disliked is `code-bugfix`. A feature's behavior is `feature-new` or `feature-iterate`. A report, deck, resume, or other paged document is a typesetting skill such as `kami`.

## When to use

- The project has no design system and the user wants one, from its current UI or from a brief.
- The user wants the look to change across the product: a palette, a typeface, density, radius, motion feel, voice, or dark mode.
- UI work needs a token or a component the system does not have yet. `to-implement-spec` sends it here.
- The user asks whether the design system holds up, the code seems to have drifted from it, or the design.md spec has moved.
- A `DESIGN.md` at the repo root, or another design file, should become the design system.

## When not to use

- One screen looks off, and the system already says what it should be. That is UI work against the system, not a change to it.
- The render is broken: overflow from a bug, a state that never clears, a font that fails to load. That is `code-bugfix`.
- A paged document. That is a typesetting skill.

## What it writes

```text
docs/design-system/
  DESIGN.md                  the design system; every run that writes touches it
  components/<family>.html   a component sheet, only when asked for or needed
  guides/<topic>.md          detail a section outgrew, only when DESIGN.md would bloat
```

- One design system per repo, at `docs/design-system/DESIGN.md`. No second `DESIGN.md` at the root or anywhere else.
- `DESIGN.md` follows [references/specification.md](references/specification.md), a snapshot of upstream `docs/spec.md`. What conforming means here, including the file layout, token rules, `@` references, component sheets, the linter, and where the published CLI lags the spec, is in [references/conformance.md](references/conformance.md). Read both before writing.
- How to choose the values is in [references/craft.md](references/craft.md). Read it before proposing a direction or a token.
- **The token source.** When the code reads its design values from one place (a CSS variables file, a Tailwind theme, a `design.md export` output, a native color asset catalog), that file mirrors the system. A confirmed change updates it in the same change, so the two never disagree. Screens and components that use those values are product code: list the ones a change affects, and leave them.
- The files state the system as it is now. No "previously", no changelog: history lives in git.
- No em dash (U+2014) in any file this skill writes.

## Stance

- The product is the first source. A shipped UI already has a system: lift its exact values from the theme, token, and style files, never from memory, and never from a screenshot when the code is there. Describe it before improving it.
- Current evidence wins. The code, the render, and the current `DESIGN.md` override memory and earlier preferences.
- A specific reference beats adjectives. "Clean and modern" names a region; "a 1970s graduate lecture handout" names a point and brings its own don'ts. "Feels like Linear" is not a direction until it is three properties: the button radius, how surfaces separate, and the accent family.
- Prose is the design. A token with no sentence saying where it goes and why gets misused. Every value written in prose equals its token.
- Off the generic default. If a stranger would say a model picked it (a reflex font, purple-to-blue, glass cards, a grid of identical shadow cards), it is not done. [references/craft.md](references/craft.md) lists the defaults to reject.
- The glossary's words are the project's words. The terminology in Voice & Content Strategy agrees with `docs/GLOSSARY.md`, and a conflict becomes a question.
- The interviewer proposes and the user decides. Infer what the evidence answers. Ask only what would change the system, and every question carries a recommended answer and its reason.

## Procedure

### 1. Load

```bash
ls docs/design-system/ docs/design-system/*/ 2>/dev/null
rg --files --hidden -g '!{.git,node_modules,dist,build}/**' . | rg -i '(^|/)design\.md$|(tokens|theme|colors|variables)\.(css|scss|ts|js|json)$|tailwind\.config|\.xcassets/|colors\.xml$|Theme\.kt$'
rg -l '@theme|:root\s*\{' -g '*.{css,scss}' . -g '!{node_modules,dist,build}/**'
head -20 AGENTS.md README.md
ls docs/GLOSSARY.md 2>/dev/null
```

- **No `docs/design-system/DESIGN.md`:** Create.
- **A `DESIGN.md` elsewhere**, at the root or in `docs/`: it is the seed. Say where it is, and once the user agrees, move it with `git mv <path> docs/design-system/DESIGN.md`. A tool that reads the old path needs the new one; name any the repo configures. Then run Audit on it before any change: it was likely written against an older spec.
- **It exists, and the user wants something different:** Change.
- **It exists, and the user asks how it holds up**, or ran `/design-system` with nothing else: Audit.
- **No UI in the repo and no brief:** ask for the audience, the mood, references, and constraints. Do not invent a brand.

### 2. Create

1. **Read the product.** From the token source, the global styles, and the shipped components: every color and where it is used, the type families and sizes, the spacing steps, radii, shadows, durations and easings, and the copy on buttons, errors, and empty states. Skip `.git`, `node_modules`, `dist`, and lockfiles. Near-duplicates (three greys a few percent apart, 13px beside 14px) are questions, not tokens.
2. **Resolve the direction.** Answer five questions from evidence, in this order: the product as read, the team's other shipped products, the conversation and the user's brief. Model-default palettes and fonts are the last resort.
   1. Who uses it, where, and how often. This sets density and theme; see the theme matrix in [references/craft.md](references/craft.md).
   2. The direction, as one specific reference.
   3. The signature: one typeface, color system, layout logic, or motion, made obvious.
   4. Hard constraints: platforms, the token pipeline the code uses, the contrast minimum (WCAG AA at least), locales and scripts, and light, dark, or both.
   5. Motion and voice: quiet, or one named signature interaction; and the voice in two or three words, with what they rule out.

   An existing product may answer all five with no question. State the strongest inferred answer for each open one, ask following [Questions](#questions), and wait. When the user wants options, follow the options guide in [references/craft.md](references/craft.md). A brand preset is offered, never run unasked.
3. **Draft the tokens**, group by group, following [references/conformance.md](references/conformance.md): `colors` (a `primary`, and an `on-` color for every fill that text sits on), `typography` (named by role), `spacing`, `rounded`, `motion`, then `components` for the atoms the product uses, with a key per variant and state. A product being described keeps its values unless the user agreed to change them. Merging near-duplicates is a decision: show it as from → to, with the use counts.
4. **Write the prose**, section by section in spec order: Overview, Colors, Typography, Layout, Elevation & Depth, Shapes, Motion & Micro-interaction, Voice & Content Strategy, Components, Do's and Don'ts. Each section says why and how, and cites its tokens. Leave out a section that does not apply, and put a token group left out in `omitted` with its reason. Do's and Don'ts is a short, deliberate list of what this direction is most at risk of, not every ban in craft.
5. **Write the files**, then [Check](#5-check). Nothing is committed: the user reviews the written files.

### 3. Change

1. **Pin the delta.** One sentence: from today to after, quoting today's tokens and lines. Then list what changes (tokens, prose, components, sheets), what must not change, and what depends on today's values. For each changed token, search the code for its name, its CSS custom property or theme key, and its literal value, and count the files.
2. **Decide.** A change of direction reruns Create step 2 for the questions it reopens. A taste choice (an accent, a weight, a radius, a motion feel) comes as two labeled candidates, shown as tokens, so the reply can be one letter; a color candidate carries its contrast ratio against what it sits on. Ask following [Questions](#questions).
3. **Write it in place** once confirmed: every token, every prose line that cites a changed value, every component that references it, every sheet that shows it, and the token source. Replace lines. Add no history.
4. **[Check](#5-check)**, then diff against the committed version as in [references/conformance.md](references/conformance.md). Fix a regression, or name it with its reason.

### 4. Audit

Run every check, then report. Fix nothing before the report.

1. **Against the spec.** Lint the file. Sort each finding into fix, justified (with the reason), or CLI lag. Then run the hand checks in [references/conformance.md](references/conformance.md) for what the published linter does not cover.
2. **Against a newer spec.** Compare the snapshot's commit with upstream, as in [references/conformance.md](references/conformance.md). When `docs/spec.md` has moved, read the change, and list what the file should adopt.
3. **Against itself.** Every value in prose equals its token. Every `{token}` in prose and components resolves. Every component names its states. Every sheet's markers match a component key, and its values match the tokens.
4. **Against the code.** The token source against the tokens, value by value. Then the drift: literals in product code that match no token, fonts the code loads that typography does not name, durations and easings typed inline. Give counts and the top files, not an inventory.
5. **Against the glossary.** The terminology in Voice & Content Strategy against `docs/GLOSSARY.md`.

For each finding, say which side is right. When the system is right and the code drifted, the fix is UI work: list it. When the code is right, the system is stale: the fix is a Change. Apply the `docs/design-system/` fixes the user accepts, then Check.

### 5. Check

Every run that writes ends here.

- Lint `docs/design-system/DESIGN.md` with the command in [references/conformance.md](references/conformance.md): no errors, no contrast warning, and every other warning fixed or named in the reply. When the network or `npx` is unavailable, say so and run the hand checks.
- When the project builds its token source with `design.md export`, run that export and confirm it succeeds.
- Render every component sheet written or changed, at 375 and 1280 wide, and read every screenshot. Check each state it shows, and that focus is visible. When the host cannot render, say so and name the file to open.

## Questions

- Ask one to three questions a turn: the ones whose answers do not wait on another open answer.
- Each question carries your recommended answer and its reason, so the user can answer yes. Ask for a decision, not an opinion.
- What the user, the code, or a doc already says is an answer. Do not ask it again.
- Silence on a stated assumption accepts it. A contradicting answer reopens only that question.
- When the user stops early, list what is open and write nothing.

For "set up a design system" in a repo whose theme has three near-identical greys:

```text
1. Direction: the app reads like a lab notebook today (monospace labels, hairline rules, no shadows). Keep that as the reference?
   Recommended: yes. Every shipped screen already follows it (src/styles/theme.css, src/ui/Table.tsx).
2. Greys: #6B7280, #6C727F, and #71717A all set muted text. Merge them into one token, neutral-500 = #6B7280?
   Recommended: yes. #6B7280 has 41 of the 52 uses, and the other two read the same at 14px.
```

Not: "What style do you want?" It offers nothing to confirm.

## Output

Create and Change end with:

- The direction in one sentence, and the two or three choices that are not obvious (typeface, color, layout logic), each with its reason.
- The files written, and the token source when it changed.
- The check: the lint summary, each warning kept and why, any CLI lag, and the sheets rendered or left unrendered.
- The product code that no longer matches the system: the count, the top files, and the next step, which is `/to-implement-spec` for a rollout across screens.

Audit ends with the findings grouped by check, each with file and line, which side is right, and the fix; then what was fixed once the user agreed.

## Source

Adapted from `ui` by [tw93/Waza](https://github.com/tw93/Waza) (MIT, see `LICENSE`) and this repo's former `design-style` skill. The DESIGN.md format in `references/specification.md` is from [google-labs-code/design.md](https://github.com/google-labs-code/design.md) (Apache 2.0, see `LICENSE-APACHE`). Craft rules in `references/craft.md` credit their sources in that file.
