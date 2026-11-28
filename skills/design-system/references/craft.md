# Craft

How to choose the values a design system writes down. When the committed direction truly needs to break a rule, break it on purpose and name the tradeoff in the reply. Never break the accessibility rules.

## Direction

- **Name a point, not a region.** A specific reference ("an airport departures board", "a field notebook") carries its values and its exclusions at once: a handout does not glow. Adjectives ("clean, modern, premium") land on the generic default.
- **Decompose a reference product into properties.** "Like Linear" becomes the button radius, how surfaces separate (shadow, background step, or border), and the accent family. For a data-heavy reference: the chart palette with exact values, grid line weight and opacity, axis label size and color, tooltip radius and shadow, and the empty state.
- **Read the code before the picture.** Lift a reference's values from its source when it has one. A fetched URL returns text, not layout: for a visual reference, ask for a screenshot.
- **Survey only the unfamiliar.** For an unfamiliar pattern, record one concrete decision from each of two or three mature products.

### Options

When the user asks for options, follow [../principles/compare-real-options.md](../principles/compare-real-options.md) and give three that differ on real dimensions: density, typographic personality, color temperature, layout structure, motion character, decoration. One stays close to the existing product or convention, one remixes the brand, one is deliberately unexpected, ordered from safe to bold. Options that differ only by accent color are one option.

### Brand presets

`npx getdesign@latest add <brand>` (from `VoltAgent/awesome-design-md`) writes a `DESIGN.md` extracted from a real brand's site into the current directory. Offer it while the direction is open; run it only with approval, in a scratch directory (`cd "$(mktemp -d)"`). Treat the result as seed material: decompose it into properties, drop whatever breaks a rule below, and name each override in the reply. Never adopt it whole.

## Theme

Choose light or dark from the audience and context.

| Context | Theme |
| --- | --- |
| Trading or analytics, long or night sessions | Dark |
| Children's reading or learning | Light |
| SRE or observability tooling | Dark |
| Planning, recipes, journaling | Light |
| Music or media browsing | Dark |
| Clinical or patient portal | Light |
| Vintage or artisanal brand | Warm light |

When the context does not decide, choose light. For both, design light first, then add a `dark` group over the same roles.

## Colors

- **Reason in OKLCH**, where equal steps look equal. Store hex unless the code uses `oklch()`.
- **Lower chroma near the extremes.** Around 85% lightness, chroma near 0.08, not 0.15; the same at the dark end.
- **Tint neutrals toward the brand hue**, chroma 0.005 to 0.01.
- **60-30-10 by visual weight:** 60% surface and neutral, 30% secondary text and rules, 10% accent.
- **No grey text on a colored fill.** Use a darker or lighter shade of the fill's own hue.
- **Every fill that text sits on has an `on-` color**, and the pair passes WCAG AA: 4.5:1 for body text; 3:1 for text at 24px or 18.66px bold and above, and for control edges.
- **Semantic roles are named once** (`error`, `warning`, `success`) and never borrowed from the accent.
- **Dark surfaces:** a near-black solid canvas (such as `#08090A`), with elevation as solid lighter steps equal to white at 2%, 4%, and 5% opacity over it. Borders at the equivalent of 5% (subtle) and 8% (standard). Text about `#F0F0F0`, not `#FFFFFF`.

## Typography

**Reject the reflex fonts** as a display face: Inter, DM Sans, DM Serif Display, DM Serif Text, Outfit, Plus Jakarta Sans, Instrument Sans, Instrument Serif, Space Grotesk, Space Mono, IBM Plex Sans, IBM Plex Serif, IBM Plex Mono, Syne, Fraunces, Newsreader, Lora, Crimson Pro, Crimson Text, Playfair Display, Cormorant, Cormorant Garamond. A justified product use (Inter in a dense data table) is allowed, with the reason in prose.

**Choose a face:**

1. Write three words for the brand ("precise, minimal, fast").
2. Name the three fonts you would reach for by reflex, and reject them.
3. Pick a face from a foundry with a voice (Klim, Commercial Type, Colophon, Grilli Type, OH no Type, Village) or an open-source face that matches the words. Say why in one sentence of the Typography prose.

**Build the scale:**

- Name levels by role (`display`, `headline-lg`, `title`, `body-md`, `label-sm`, `caption`), 9 to 15 in all. One style per role, and at most three inside one small component.
- Line height as a unitless multiplier.
- Tracking scales with size: about `-0.022em` at 32px and above, `-0.012em` from 20 to 28px, `0` at 16px and below. Positive tracking only on uppercase labels, never on a large headline.
- A level with `fontFeature: '"tnum"'` for counters, timers, prices, and number columns.
- Responsive sizes go in breakpoint groups (`sm`, `lg`); sizes that do not change stay at the top level.
- A metric or label never tail-truncates: the format compacts, or the slot is sized for the longest value.

**CJK and mixed scripts:**

- Latin face first, then the system CJK face: `-apple-system, "SF Pro Text", "PingFang SC", "Noto Sans SC", sans-serif`.
- CJK body text takes a line height of about 1.7 to 1.8, its own level when the product reads mostly in CJK.
- Negative tracking is for Latin runs only; say so in the prose.
- A serif reading face needs an explicit CJK serif fallback (`"Songti SC", "Noto Serif SC", serif`).

## Layout

- **Spacing is one ladder**, on a 4px or 8px base, with named steps. To fix density, scale the whole ladder by one factor, not one gap.
- Outer container padding defaults to the inner gap.
- Gutters, margins, and column counts change by breakpoint group (`sm`, `md`, `lg`, `xl`).
- Body text measure about 65 characters.
- Every interactive target's hit area is at least 40 by 40px, and hit areas never overlap.
- Dense utility surfaces (dashboards, tables) take tighter rows and generous column gaps, at least 16px.
- An app shell (sidebar plus workspace) has no decorative backgrounds, and separates surfaces by background step and shadow only.

## Elevation & Depth

- Pick one way surfaces separate, and say it: shadow, tonal step, or border.
- In light mode, nested surfaces differ by at least 4% lightness, or the raised one carries at least `0 1px 3px rgba(0,0,0,0.10)`.
- In dark mode, depth is luminance steps, not shadow.
- Lifted surfaces take layered shadows; borders are for dividers, table cells, and layout.
- Never put blur under a solid 1px border.

## Shapes

- Commit to a named radius scale before any component: three or four tiers (`4px`, `8px`, `12px`, `full`) for most products, six to eight for a rich one.
- Nested corners are concentric: outer radius equals inner radius plus padding. Past 24px of padding, each layer takes its own radius.
- One radius per component type. Buttons are pill, square, or one fixed value, never a mix.

## Motion & Micro-interaction

- **Frequency decides whether anything moves.** Hundreds of times a day (a shortcut, a command palette): no motion, and nothing keyboard-initiated animates. Tens of times a day (hover, list navigation, disclosure): the shortest form that still reads. Occasional surfaces (modal, drawer, toast, sheet): the standard treatment. Rare moments (onboarding, completion): may carry delight.
- **Duration follows the element:** press feedback 100 to 160ms, tooltip and small popover 125 to 200ms, dropdown 150 to 250ms, modal and drawer 200 to 500ms. Interactive motion over 300ms needs a stated reason.
- **Easing has intent.** Entering decelerates: an exponential ease-out such as `cubic-bezier(0.16, 1, 0.3, 1)`. Leaving accelerates, shorter: about 150ms `ease-in`, the only place for `ease-in`. Moving in place is symmetric. No bounce, except where a finger or pointer still drives the motion (drag to dismiss, momentum).
- **A motion token is a sentence, not a number.** Name it for the interaction (`state-change`, `surface-enter`, `expand-collapse`), and say in prose where it is allowed and why it cannot be faster or slower.
- **Every action is acknowledged visibly**, by an immediate selected, open, or loading state, or press feedback where the result leaves a gap. Hover alone never acknowledges.
- Only `transform` and `opacity` animate. Never `transition: all`, and never width, height, padding, or margin.
- Enter from about `scale(0.95)` with opacity, never `scale(0)`. Popovers, menus, and tooltips grow from the control that opened them; modals stay centered.
- **Reduced motion keeps the signal.** Say what replaces each motion under `prefers-reduced-motion`: a still form of the same state (a determinate step, a text label), not nothing.
- Native code translates the CSS easing: SwiftUI `.timingCurve(...)` or `.spring(duration:bounce:)` and `accessibilityReduceMotion`; Compose `animate*AsState` with a `CubicBezierEasing`.

## Voice & Content Strategy

- Sentence case on every heading, button, label, and menu item.
- Success takes no exclamation mark: "Saved", not "Saved!". Errors never open with "Oops", and say what failed and the next action, in the active voice: "We couldn't load your invoices. Try again."
- Banned words in product copy: Elevate, Seamless, Unleash, Delve, Tapestry, Game-changer, Next-Gen, "In the world of".
- Button labels are verb phrases naming the outcome ("Create workspace"), never "OK" or "Submit".
- Empty copy appears only after a finished request returns nothing; while work is in flight, the state says so.
- Numbers, dates, and units: one format each, tabular where values update or align.
- Sample data in sheets and examples is real-sounding: culturally varied names (Priya Mehta, Lars Eriksson), companies with a domain (Meridian Logistics), organic numbers (`99.94%`, `47.2%`), no Lorem Ipsum, no Acme, no repeated dates or avatars.

## Components

- Define the atoms the product uses (buttons, inputs, chips, lists, tooltips, checkboxes, radios, its own), with a key per variant and state.
- Every interactive component states its focus treatment in prose: a visible ring, its color and width. Never `outline: none` without a replacement.
- A container that swaps content by state (a status bar, an action slot) keeps one font size; states differ by fill, stroke, color, or icon.
- Destructive actions stay recoverable: no one-tap bulk delete over rows a user cannot identify.
- **Data-dense products:** numbers right-aligned in tabular figures, labels left-aligned; row separators at about `rgba(0,0,0,0.06)` in light and `rgba(255,255,255,0.05)` in dark, with the solid equivalents as tokens; alternating rows only past about 12 columns. A chart palette (categorical, sequential, diverging) with exact values and the rule for each, in `guides/data-viz.md` when large; bars for categories, lines for time, scatter for correlation, a pie only for two to four parts.

## Do's and Don'ts

Avoid these patterns as defaults. The section lists only the guardrails this direction is at risk of breaking; a long list means the reference is too vague. Draw from these, with their rewrites:

| Don't | Do instead |
| --- | --- |
| A side border over 1px as an accent | A dot, a short rule, a swatch, or a weight shift |
| Gradient text | A solid brand color or a weight shift |
| Glass blur as the default surface | Background steps and shadow |
| Purple-to-blue or cyan-on-dark accents | A palette from the brand words, by the color rules above |
| A rounded shadow card as the default container | Cardless sections; a card only where containment means something |
| A modal where the action needs no focus lock | Inline expansion, a panel, or a route |
| `transition: all`, or animating layout properties | Named `transform` and `opacity` transitions |
| A reflex display font | The face-choosing steps above |
| A three-part hero with two side-by-side CTAs, three identical cards, a generic top nav | A layout that only works for this content |

The template test: if completely different content would fit the system's patterns unchanged, it is a template, not a design.

---

*The reflex fonts, font choice, OKLCH rules, theme matrix, banned patterns, and motion rules are adapted from [pbakaus/impeccable](https://github.com/pbakaus/impeccable) (Apache 2.0). Sample-data rules and the template test are inspired by [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill). The direction rules follow the [design.md philosophy](https://github.com/google-labs-code/design.md/blob/main/PHILOSOPHY.md).*
