---
name: design-system
description: "Produce, iterate, and maintain the project's design system in docs/design-system/: a DESIGN.md that follows the google-labs-code/design.md spec (tokens for color, type, spacing, shape, motion, and components, with prose saying why and how), plus the component sheets and guides it references. Creates it from the product's code, an older DESIGN.md, or a style brief; changes it when the look, a token, or a component changes; audits it against the spec and the code. Use when the user wants to set up, change, or check the project's design system or visual style (设计系统, 设计规范, 视觉风格, 换主色, 加暗色模式, DESIGN.md). Not for applying it to the existing code (design-system-adopt, run by the user), building a feature (to-implement-spec, go-work), a broken render (code-bugfix), or print documents."
---

# design-system

Run this skill on `/design-system`, a request that matches the description, or UI work from `to-implement-spec` that needs a token or component the system lacks. Started without `/design-system`: say so in one line, with the reason. Work that belongs to another skill: say which and why, then switch to it, or name it for the user (`/to-implement-spec`) and stop.

The design system is how the product looks, moves, and writes: the exact values, and why. The tokens are the normative values; the prose carries the intent.

One run does one of three things:

- **Create:** write the first design system, from the product, an older design file, or a style brief.
- **Change:** decide a change (a direction, a token, a section, a component, a theme) and write it in place.
- **Audit:** check the system against the spec, itself, and the code, then fix what lives in `docs/design-system/`.

Do not build, restyle, or polish product screens or components; the one piece of product code this skill writes is the [token source](#what-it-writes). Route the rest:

- One screen looks off, and the system already says what it should be: `/design-system-adopt <path>`.
- A plan for new UI is `to-implement-spec`, and building it is `go-work`.
- A broken render (overflow, a state that never clears, a font that fails to load) is `code-bugfix`.
- A feature's behavior is `feature-new` or `feature-iterate`. A report, deck, resume, or other paged document is a typesetting skill.

## What it writes

```text
docs/design-system/
  DESIGN.md                  the design system; every run that writes touches it
  components/<family>.html   a component sheet, only when asked for or needed
  guides/<topic>.md          detail a section outgrew, only when DESIGN.md would bloat
```

- `DESIGN.md` follows [references/specification.md](references/specification.md), a snapshot of upstream `docs/spec.md`, as [references/conformance.md](references/conformance.md) applies it. Read both before writing.
- Read [references/craft.md](references/craft.md) before proposing a direction or token.
- **The token source.** When the code reads its design values from one place (a CSS variables file, a Tailwind theme, a `design.md export` output, a native color asset catalog), that file mirrors the system, and a confirmed change updates it in the same change. List the screens and components a change affects, and leave them.
- One `DESIGN.md` per repo. The files state the system as it is now: no "previously", no changelog.
- No em dash (U+2014) in any file this skill writes.

## Stance

- The product is the first source. Lift a shipped UI's exact values from its theme, token, and style files, never from memory or a screenshot when the code is there. Describe before improving. The code, the render, and the current `DESIGN.md` override earlier preferences.
- A specific reference beats adjectives: "a 1970s graduate lecture handout", not "clean and modern".
- Every token has a sentence saying where it goes and why. Every value written in prose equals its token.
- Off the generic default: if a stranger would say a model picked it, it is not done.
- The terminology in Voice & Content Strategy agrees with `docs/GLOSSARY.md`; a conflict becomes a question.
- A token or variant earns its place by a use in the product or a sheet ([principles/subtract-before-you-add.md](principles/subtract-before-you-add.md)).

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
- **A `DESIGN.md` elsewhere**, at the root or in `docs/`: it is the seed. Say where it is, and once the user agrees, `git mv <path> docs/design-system/DESIGN.md`. Name any tool the repo configures to read the old path. Then run Audit on it before any change.
- **It exists, and the user wants something different:** Change.
- **It exists, and the user asks how it holds up**, or gave no request: Audit.
- **No UI and no brief:** ask for the audience, mood, references, and constraints. Do not invent a brand.

### 2. Create

1. **Read the product.** From the token source, the global styles, and the shipped components: every color and where it is used, type families and sizes, spacing steps, radii, shadows, durations and easings, and the copy on buttons, errors, and empty states. Near-duplicates (three greys a few percent apart, 13px beside 14px) are questions, not tokens.
2. **Resolve the direction.** Answer five questions from evidence, in this order: the product as read, the team's other shipped products, the conversation and brief. Model defaults are the last resort.
   1. Who uses it, where, and how often. This sets density and theme (the theme matrix in [references/craft.md](references/craft.md)). Choose these users' experience over the builders' convenience ([principles/experience-first.md](principles/experience-first.md)).
   2. The direction, as one specific reference.
   3. The signature: one typeface, color system, layout logic, or motion, made obvious.
   4. Hard constraints: platforms, the token pipeline the code uses, the contrast minimum (WCAG AA at least), locales and scripts, and light, dark, or both.
   5. Motion and voice: quiet, or one named signature interaction; and the voice in two or three words, with what they rule out.

   For each one evidence leaves open, state the strongest inferred answer, ask following [Questions](#questions), and wait. A direction with no precedent, or one the user wants options for, follows [principles/compare-real-options.md](principles/compare-real-options.md) and the options guide in [references/craft.md](references/craft.md). A brand preset is offered, never run unasked.
3. **Draft the tokens**, group by group, following [references/conformance.md](references/conformance.md): `colors`, `typography`, `spacing`, `rounded`, `motion`, then `components` for the atoms the product uses, with a key per variant and state it has. A described product keeps its values unless the user agreed to change them. Show a merge of near-duplicates as from → to, with the use counts.
4. **Write the prose**, section by section in spec order. Each says why and how, and cites its tokens. Do's and Don'ts lists only what this direction is most at risk of.
5. **Write the files**, then [Check](#5-check). Commit nothing.

### 3. Change

1. **Pin the delta.** One sentence from today to after, quoting today's tokens and lines. List what changes (tokens, prose, components, sheets), what must not, and what depends on today's values. Search the code for each changed token's name, CSS custom property or theme key, and literal value, and count the files.
2. **Decide.** A change of direction reruns Create step 2 for the questions it reopens, users' experience over builders' convenience ([principles/experience-first.md](principles/experience-first.md)). A taste choice (an accent, a weight, a radius, a motion feel) comes as two labeled candidates shown as tokens, so the reply can be one letter ([principles/compare-real-options.md](principles/compare-real-options.md)); a color candidate carries its contrast ratio against what it sits on. Ask following [Questions](#questions).
3. **Write it in place** once confirmed: every token, and every prose line, component, and sheet that cites a changed value, and the token source. Delete a token or variant the change leaves unused. Replace lines; add no history.
4. **[Check](#5-check)**, then diff against the committed version as in [references/conformance.md](references/conformance.md). Fix a regression, or name it with its reason.

### 4. Audit

Run every check, then report; fix nothing before the report. Each finding carries its source ([principles/show-the-evidence.md](principles/show-the-evidence.md)).

1. **Against the spec.** Lint the file. Sort each finding into fix, justified (with the reason), or CLI lag. Then run the hand checks in [references/conformance.md](references/conformance.md).
2. **Against a newer spec.** Compare the snapshot's commit with upstream ([references/conformance.md](references/conformance.md)). When `docs/spec.md` has moved, list what the file should adopt.
3. **Against itself.** Every value in prose equals its token. Every `{token}` in prose and components resolves. Every component names its states. Every sheet's markers match a component key, and its values match the tokens.
4. **Against the code.** The token source against the tokens, value by value. The drift: literals in product code that match no token, fonts loaded that typography does not name, inline durations and easings. The reverse: tokens and variants nothing in the code or sheets uses, each a candidate to delete. Give counts and the top files.
5. **Against the glossary.** The terminology in Voice & Content Strategy against `docs/GLOSSARY.md`.

For each finding, say which side is right. Code that drifted: list the fix for `/design-system-adopt`. A stale system: the fix is a Change. Apply the `docs/design-system/` fixes the user accepts, then Check.

### 5. Check

Every writing run ends here.

- Lint `DESIGN.md` with the command in [references/conformance.md](references/conformance.md): no errors, no contrast warning, every other warning fixed or named in the reply. Without the network or `npx`, say so and run the hand checks.
- When the project builds its token source with `design.md export`, run that export and confirm it succeeds.
- Render every sheet written or changed at 375 and 1280 wide, and read every screenshot ([principles/prove-it-works.md](principles/prove-it-works.md)): each state it shows, and visible focus. When the host cannot render, say so and name the file to open.

## Questions

- Ask one to three questions a turn whose answers do not wait on another open answer.
- Ask only what would change the system and no evidence answers.
- Each question carries your recommended answer and its reason. Ask for a decision, not an opinion.
- Silence on a stated assumption accepts it. A contradicting answer reopens only that question.
- When the user stops early, list what is open and write nothing.

For "set up a design system" in a repo whose theme has three near-identical greys:

```text
1. Direction: the app reads like a lab notebook today (monospace labels, hairline rules, no shadows). Keep that as the reference?
   Recommended: yes. Every shipped screen already follows it (src/styles/theme.css, src/ui/Table.tsx).
2. Greys: #6B7280, #6C727F, and #71717A all set muted text. Merge them into one token, neutral-500 = #6B7280?
   Recommended: yes. #6B7280 has 41 of the 52 uses, and the other two read the same at 14px.
```

Not: "What style do you want?"

## Output

Create and Change end with:

- The direction in one sentence, and the two or three non-obvious choices (typeface, color, layout logic), each with its reason.
- The files written, and the token source when it changed.
- The check: the lint summary, each warning kept and why, any CLI lag, and the sheets rendered or not.
- The product code that no longer matches the system: the count, the top files, and the next step, which is `/design-system-adopt`.

Audit ends with the findings grouped by check, each with its source, which side is right, and the fix; then what was fixed once the user agreed.

## Source

Adapted from `ui` by [tw93/Waza](https://github.com/tw93/Waza) (MIT, see `LICENSE`) and this repo's former `design-style` skill. The DESIGN.md format in `references/specification.md` is from [google-labs-code/design.md](https://github.com/google-labs-code/design.md) (Apache 2.0, see `LICENSE-APACHE`). Craft rules in `references/craft.md` credit their sources in that file.
