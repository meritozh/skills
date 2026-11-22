# Craft

How to choose the values a design system writes down. These rules keep a system off the generic default. When the committed direction truly needs to break one, break it on purpose and name the tradeoff in the reply. The accessibility rules are never broken.

## Direction

- **Name a point, not a region.** A specific reference ("a 1970s graduate lecture handout", "an airport departures board", "a field notebook") carries its values and its exclusions at once: a handout does not glow. Adjectives ("clean, modern, premium") put the output at the center of everything those words describe, which is the generic default.
- **Decompose a reference product into properties.** "Like Linear" becomes three: the button radius, how surfaces separate (shadow, background step, or border), and the accent family. For a data-heavy reference: the chart palette with exact values, grid line weight and opacity, axis label size and color, tooltip radius and shadow, and the empty state. "Minimal" and "clean" are not properties.
- **Read the code before the picture.** When source and a screenshot of a reference both exist, lift values from the source. A fetched URL returns text, not layout: for a visual reference, ask for a screenshot.
- **Survey only the unfamiliar.** For a genuinely unfamiliar pattern, look at two or three mature products and record one concrete decision from each. Skip it for anything the product already settles.

### Options

When the user asks for options, give at least three that differ on real dimensions: density, typographic personality, color temperature, layout structure, motion character, amount of decoration. One stays close to the existing product or convention, one remixes the brand in a new way, one is deliberately unexpected. Order them from safe to bold. Three options that differ only by accent color are one option.

When the choice is taste (an icon, a weight, an accent, a motion feel), offer two labeled candidates unasked, so the reply is one letter.

### Brand presets

`npx getdesign@latest add <brand>` (from `VoltAgent/awesome-design-md`) writes a `DESIGN.md` extracted from a real brand's site into the current directory. Offer it while the direction is open, and run it only with the user's approval, in a scratch directory (`cd "$(mktemp -d)"`) so it cannot overwrite anything. Treat the result as seed material: decompose it into properties, drop whatever breaks a rule below (a reflex font, a banned pattern), and name each override in the reply. Never copy it in as the system.

## Theme

Choose light or dark from the audience and context. Neither is a default.

| Context | Theme | Why |
| --- | --- | --- |
| Trading or analytics, long or night sessions | Dark | Dense data, less glare |
| Children's reading or learning | Light | Welcoming, low fatigue |
| SRE or observability tooling | Dark | Read at a glance in low light |
| Planning, recipes, journaling | Light | Daytime, casual use |
| Music or media browsing | Dark | Surfaces recede so media leads |
| Clinical or patient portal | Light | Trust and legibility |
| Vintage or artisanal brand | Warm light | Dark clashes with the analog material |

When the context does not decide, choose light. When both are needed, design light first, then add dark as a `dark` group over the same roles.

## Colors

- **Reason in OKLCH**, which is perceptually uniform: equal steps look equal. Store hex unless the code uses `oklch()`.
- **Lower chroma near the extremes.** Around 85% lightness, chroma near 0.08 is enough; 0.15 looks garish. The same at the dark end.
- **Tint neutrals toward the brand hue**, chroma 0.005 to 0.01. It is barely visible and holds the palette together.
- **60-30-10 by visual weight:** 60% surface and neutral, 30% secondary text and rules, 10% accent.
- **No grey text on a colored fill.** Use a darker or lighter shade of the fill's own hue.
- **Every fill that text sits on has an `on-` color**, and the pair passes WCAG AA: 4.5:1 for body text; 3:1 for text at 24px or 18.66px bold and above, and for the edges of controls.
- **Semantic roles are named once** (`error`, `warning`, `success`) and never borrowed from the accent.
- **Dark surfaces:** a near-black solid canvas (for example `#08090A`), with elevation as lighter steps over it, the equivalent of white at 2%, 4%, and 5% opacity, written as solid colors. Borders at the equivalent of 5% (subtle) and 8% (standard). Text is not pure `#FFFFFF` at full strength; use about `#F0F0F0`.
- **Banned as a default:** purple-to-blue gradients, cyan-on-dark accent systems, and gradient text. They are the canonical model palette and say nothing about the brand.

## Typography

**Reject the reflex fonts** as a display face: Inter, DM Sans, DM Serif Display, DM Serif Text, Outfit, Plus Jakarta Sans, Instrument Sans, Instrument Serif, Space Grotesk, Space Mono, IBM Plex Sans, IBM Plex Serif, IBM Plex Mono, Syne, Fraunces, Newsreader, Lora, Crimson Pro, Crimson Text, Playfair Display, Cormorant, Cormorant Garamond. They dominate training data, so they signal that no decision was made. A justified product use (Inter in a dense data table) is allowed, with the reason in prose.

**Choose a face:**

1. Write three words for the brand ("precise, minimal, fast").
2. Name the three fonts you would reach for by reflex, and reject them.
3. Pick a face from a foundry with a voice (Klim, Commercial Type, Colophon, Grilli Type, OH no Type, Village) or an open-source face whose personality matches the words. Say why that face, in one sentence of the Typography prose.

**Build the scale:**

- Name levels by role (`display`, `headline-lg`, `title`, `body-md`, `label-sm`, `caption`), 9 to 15 in all. One style per role. More than three styles inside one small component is the smell.
- Line height as a unitless multiplier.
- Tracking scales with size: about `-0.022em` at 32px and above, `-0.012em` from 20 to 28px, `0` at 16px and below. Positive tracking on a large headline is always wrong. Uppercase labels may take positive tracking.
- A level with `fontFeature: '"tnum"'` for counters, timers, prices, and number columns.
- Responsive sizes go in breakpoint groups (`sm`, `lg`); sizes that do not change stay at the top level.
- Truncation is not a fit strategy. A metric or label never tail-truncates: the format compacts, or the slot is sized for the longest value.

**CJK and mixed scripts:**

- Latin face first, then the system CJK face: `-apple-system, "SF Pro Text", "PingFang SC", "Noto Sans SC", sans-serif`. Latin runs take the Latin face; Han falls through.
- CJK body text needs more line height than Latin: about 1.7 to 1.8. Give it its own level when the product reads mostly in CJK.
- Negative tracking is for Latin runs only. On Hanzi it reads as a rendering bug; say so in the prose.
- A serif reading face needs an explicit CJK serif fallback (`"Songti SC", "Noto Serif SC", serif`), or Chinese silently drops back to sans.

## Layout

- **Spacing is one ladder**, on a 4px or 8px base, with named steps. When the product reads too airy or too tight, scale the whole ladder by one factor; do not tune one gap.
- Outer container padding defaults to the inner gap.
- Gutters, margins, and column counts change by breakpoint group (`sm`, `md`, `lg`, `xl`).
- Body text measure about 65 characters, written as `rem` with the reason in prose.
- Every interactive target is at least 40 by 40px, by its hit area if not its visible size. Two hit areas never overlap.
- Dense utility surfaces (dashboards, tables) take tighter rows and generous column gaps, at least 16px.
- An app shell (sidebar plus workspace) turns decorative backgrounds off, and separates surfaces by background step and shadow only.

## Elevation & Depth

- Pick one way surfaces separate, and say it: shadow, tonal step, or border.
- In light mode, adjacent nested surfaces differ by at least 4% lightness, or the raised one carries at least `0 1px 3px rgba(0,0,0,0.10)`. A white card on near-white with a 5% shadow is noise, not depth.
- In dark mode, depth is luminance steps; a dark shadow on a dark canvas is invisible.
- Lifted surfaces take layered shadows; borders are for dividers, table cells, and layout separation.
- Glassmorphism is not a default surface. Blur under a solid 1px border breaks the layered illusion.
- Elevation has no token group: write each shadow and overlay out exactly in the prose.

## Shapes

- Commit to a named radius scale before any component: three or four tiers (`4px`, `8px`, `12px`, `full`) for most products, six to eight for a rich one.
- Nested corners are concentric: outer radius equals inner radius plus padding. Past 24px of padding, the layers are separate surfaces and each takes its own radius.
- One radius per component type. Buttons are pill, square, or one fixed value, never a mix.
- Banned: a side border wider than 1px as an accent. Use a dot, a short rule, a swatch, or a weight shift.

## Motion & Micro-interaction

- **Frequency decides whether anything moves.** Triggered hundreds of times a day (a shortcut, a command palette, a hotkey tab switch): no motion, because at that rate motion reads as lag. Nothing keyboard-initiated animates. Tens of times a day (hover, list navigation, disclosure): the shortest form that still reads. Occasional surfaces (modal, drawer, toast, sheet): the standard treatment. Rare moments (onboarding, a first result, completion): may carry delight.
- **Duration follows the element:** press feedback 100 to 160ms, tooltip and small popover 125 to 200ms, dropdown 150 to 250ms, modal and drawer 200 to 500ms. Anything interactive over 300ms needs a stated reason.
- **Easing has intent.** Entering decelerates: an exponential ease-out such as `cubic-bezier(0.16, 1, 0.3, 1)`. Leaving accelerates, shorter and softer: about 150ms `ease-in`, the only place `ease-in` belongs. Moving in place is symmetric. No bounce, except where a finger or pointer still drives the motion (drag to dismiss, momentum).
- **A motion token is a sentence, not a number.** Name it for the interaction (`state-change`, `surface-enter`, `expand-collapse`), and say in prose where it is allowed and why it cannot be faster or slower. That reason is what a later reader needs to change it safely.
- **Every action is acknowledged visibly.** An immediate selected, open, or loading state counts; press feedback fills only a gap the result leaves. Hover alone never acknowledges.
- Only `transform` and `opacity` animate. Never `transition: all`, and never width, height, padding, or margin.
- Nothing enters from `scale(0)`. Enter from about `scale(0.95)` with opacity. Popovers, menus, and tooltips grow from the control that opened them; modals stay centered.
- **Reduced motion keeps the signal.** Say what replaces each motion when `prefers-reduced-motion` is set: a still form of the same state (a determinate step, a text label), not nothing.
- Native code translates the CSS easing: SwiftUI `.timingCurve(...)` or `.spring(duration:bounce:)` and `accessibilityReduceMotion`; Compose `animate*AsState` with a `CubicBezierEasing`. Keep the token's purpose; translate the curve.

## Voice & Content Strategy

- Two or three words for the voice, with what they rule out ("calm, exact: no exclamation marks, no hype").
- Sentence case on every heading, button, label, and menu item. Title Case on every heading is the most common model tell.
- Success states take no exclamation mark: "Saved", not "Saved!". Errors never open with "Oops". An error says what failed and the next action, in the active voice: "We couldn't load your invoices. Try again."
- Banned words in product copy: Elevate, Seamless, Unleash, Delve, Tapestry, Game-changer, Next-Gen, "In the world of". Name the specific value instead.
- Terminology comes from `docs/GLOSSARY.md`: one word per concept, and the synonyms to avoid.
- Button labels are verb phrases naming the outcome ("Create workspace"), never "OK" or "Submit".
- Loading is not empty. Empty copy appears only after a finished request returns nothing; while work is in flight, the state says so.
- Numbers, dates, and units: one format each, with tabular figures where values update or align.
- Sample data in sheets and examples is real-sounding: culturally varied names (Priya Mehta, Lars Eriksson, Nia Okafor), companies with a domain (Meridian Logistics), organic numbers (`99.94%`, `47.2%`), no Lorem Ipsum, no Acme, no repeated dates or avatars.

## Components

- Define the atoms the product actually uses: buttons, inputs, chips, lists, tooltips, checkboxes, radios, and the product's own. A key per variant and state.
- Every interactive component states its focus treatment in prose: a visible ring, its color and width. `outline: none` without a replacement is never allowed.
- A container that swaps content by state (a status bar, an action slot) keeps one font size across every state; states differ by fill, stroke, color, or icon.
- Cards only where the content needs containment. A rounded shadow card as the default container is template thinking.
- Modals only where the action needs focus lock. Otherwise inline expansion, a detail panel, or a route.
- Destructive and cleanup actions keep recoverability: no one-tap bulk delete over rows a user cannot identify.
- **Data-dense products:** numbers right-aligned in tabular figures, labels left-aligned; row separators at about `rgba(0,0,0,0.06)` in light and `rgba(255,255,255,0.05)` in dark, with the solid equivalents as tokens; alternating rows only past about 12 columns. A chart palette (categorical, sequential, diverging) with exact values and the rule for each; bars for categories, lines for time, scatter for correlation, a pie only for two to four parts. A large palette with its rules goes to `guides/data-viz.md`.

## Do's and Don'ts

Each line is a guardrail this direction is at risk of breaking. A strong reference already excludes most things; a long list means the reference is too vague. Draw from these patterns, each with its rewrite, only where the direction invites them:

| Don't | Do instead |
| --- | --- |
| A side border over 1px as an accent | A dot, a short rule, a swatch, or a weight shift |
| Gradient text | A solid brand color or a weight shift |
| Glass blur as the default surface | Background steps and shadow |
| Purple-to-blue or cyan-on-dark accents | A palette from the brand words, by the color rules above |
| A rounded shadow card as the default container | Cardless sections; a card only where containment means something |
| A modal for ordinary overflow | Inline expansion, a panel, or a route |
| `transition: all`, or animating layout properties | Named `transform` and `opacity` transitions |
| A reflex display font | The face-choosing steps above |
| A three-part hero with two side-by-side CTAs, three identical cards, a generic top nav | A layout that only works for this content |

The template test: if completely different content would fit the system's patterns without a change, the system describes a template, not a design.

---

*The reflex fonts, font choice, OKLCH rules, theme matrix, banned patterns, and motion rules are adapted from [pbakaus/impeccable](https://github.com/pbakaus/impeccable) (Apache 2.0). Sample-data rules and the template test are inspired by [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill). The direction rules follow the [design.md philosophy](https://github.com/google-labs-code/design.md/blob/main/PHILOSOPHY.md).*
