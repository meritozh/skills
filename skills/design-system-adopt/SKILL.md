---
name: design-system-adopt
description: "Apply the design system in docs/design-system/ across the existing code: bring the token source in line with DESIGN.md, replace hard-coded colors, type, spacing, radii, shadows, and motion with its tokens, and give shared components the variants and states it names, in batches that keep the build and tests passing, then render to check. User-invoked only. Not for writing or changing the design system (design-system), building a new feature (to-implement-spec, go-work), or a broken render (code-bugfix)."
disable-model-invocation: true
---

# design-system-adopt

User-invoked only: follow this skill only when the user ran `/design-system-adopt`. When the work belongs to another skill, name it (for example `/design-system`), say why, and stop. Do not invoke it yourself.

The input is `docs/design-system/DESIGN.md`, and optionally a scope: a path, a component, or an area such as "settings". With no scope, the scope is every UI in the repo.

This skill makes the code follow the design system, and never changes the system. It changes values, not structure: what screens and components do, how they are laid out, and what their copy means stay as they are. A value the system has no token for, or a token that looks wrong once applied, is a change to the system: list it for `/design-system`. Do not invent a token, and do not edit `docs/design-system/`.

## Procedure

### 1. Read the system

- Read `docs/design-system/DESIGN.md` whole, and every component sheet and guide it references. With no file, name `/design-system`, and stop.
- Lint it: `npx --yes @google/design.md lint docs/design-system/DESIGN.md`. With errors, name `/design-system`, and stop: a system that does not parse cannot be applied. When `npx` or the network is unavailable, say so and go on.
- Read `AGENTS.md` for the build, test, and pre-commit commands, and for the project rules.

### 2. Map the project

Find each of these, with paths:

- **The UI code:** each app or package that renders UI, and its platform (web, iOS, Android, desktop).
- **The styling strategy** each one uses: CSS custom properties, CSS modules, Tailwind, CSS-in-JS, a theme object, a SwiftUI or Compose theme. Work inside it. Do not add a styling library or a second strategy.
- **The token source:** the one place the code reads design values from. When there is none, the first batch creates one in the project's own strategy: custom properties at `:root` for plain CSS, the theme for Tailwind, a theme file for native, or `design.md export` output when the project wants it generated.
- **The shared components** that match the system's `components` (buttons, inputs, chips, and the rest), and where each lives.
- **What not to touch:** vendored, generated, and third-party code, `node_modules`, build output, and `docs/`.

### 3. Inventory the drift

Search the scope for values written by hand, and count them by kind and by file. Adjust the paths and patterns to the platforms found:

```bash
ui='src app packages'   # the UI paths from step 2
skip='!**/{node_modules,dist,build,vendor,generated}/**'
rg -n -i '#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(|oklch\(' $ui -g "$skip"
rg -n 'font-family|fontFamily|font-size|fontSize|font-weight|fontWeight|line-height|lineHeight|letter-spacing' $ui -g "$skip"
rg -n '(padding|margin|gap|inset|top|left|right|bottom)[^;{]*\b[0-9.]+(px|rem)\b' $ui -g "$skip"
rg -n 'border-radius|borderRadius|box-shadow|boxShadow|cubic-bezier|transition|animation|\b[0-9]+ms\b' $ui -g "$skip"
rg -n '\w-\[[^]]+\]' $ui -g '*.{tsx,jsx,vue,svelte,html,astro}' -g "$skip"   # Tailwind arbitrary values
```

Native code has its own forms: `Color(red:` and `.font(.system(size:` in SwiftUI, `Color(0xFF` and `.dp` or `.sp` in Compose, color resources in XML.

Sort each value:

- **Exact:** it equals a token. Replace it with that token.
- **Near:** the same role and visibly the same value: a color a couple of percent off in lightness, a size or space 1px off a step, a duration within 20ms. Map it to that token, and show the mapping in the plan.
- **None:** no token fits. Leave it, and list it for `/design-system`.
- **Dead:** the rule, class, custom property, or theme key that holds it has no use a search for its name finds. Delete it.

Then the components. For each one the system names, compare the variants and states the code has with the ones the system gives (hover, focus, pressed, disabled, error), and its focus treatment.

Then the copy: button labels, headings, success and error messages that break a rule of Voice & Content Strategy that can be applied without judgment, such as title case, an exclamation mark on success, or "OK" and "Submit".

### 4. Plan, and confirm once

Show:

- The scope, the styling strategy of each platform, and the token source, with what changes in it.
- The counts: exact, near, none, and dead, by kind, with the top files.
- Every near mapping, as `value → token (uses)`.
- The component gaps: each missing state or variant.
- The copy that breaks Voice & Content Strategy. It changes only when the user says yes.
- The batches, in order.
- What goes to `/design-system`: the values with no token.

Wait for one go-ahead. The user may drop a batch, a mapping, or the copy.

### 5. Apply in batches

Each batch is one verifiable unit, by [principles/sequence-verifiable-units.md](principles/sequence-verifiable-units.md): it ends on the pre-commit check from `AGENTS.md`, with the build, the type check, and the tests passing. Run them in this order:

1. **Dead styles:** delete them first, by [principles/subtract-before-you-add.md](principles/subtract-before-you-add.md).
2. **The token source:** it matches the tokens value for value, named the way the project already names things.
3. **Global styles:** base type, text and surface colors, the focus ring, and the reduced-motion rules.
4. **Shared components:** their values become tokens, and they gain the states and variants the system gives them.
5. **The rest, one area at a time:** exact values, then the confirmed near mappings, then the confirmed copy.

In every batch:

- Replace a value with the token in the project's form (`var(--color-primary)`, `bg-primary`, `theme.colors.primary`), never with the token's literal value.
- Once the last caller of an old variable, class, or theme key has moved to the token, delete the old one in the same batch, by [principles/migrate-then-delete.md](principles/migrate-then-delete.md). Leave no alias that maps the old name to the new token.
- Add only what the system states and the code lacks, such as a focus ring or a disabled state. No new layout, behavior, or component.
- Update a visual snapshot only after looking at the new image.
- When the user wants commits, make one per batch, with a subject naming the batch.
- When a batch breaks something it cannot fix within its own scope, revert the batch, and report it.

### 6. Check

- Run the inventory again. Give the counts before and after, and say why each remaining value is left: no token, out of scope, or in a file not to touch.
- Render the main screens and every changed shared component, at 375 and 1280 wide, in light and dark when the system has both. Read every screenshot, by [principles/prove-it-works.md](principles/prove-it-works.md). Look for what a value change breaks: overflow from a bigger type level, contrast on a surface that changed, a focus ring clipped by `overflow: hidden`. When the host cannot render, say so, and name the screens the user should check.

## Output

- The scope, the token source, and the batches that landed, with commits when there are any.
- The inventory counts, before → after, and the dead styles and old names deleted.
- The screens and states rendered, and any left unchecked.
- For `/design-system`: each value with no token, and each token that did not fit once applied, with file and line.

Then stop.
