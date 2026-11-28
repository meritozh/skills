# Conformance

What "follows the design.md spec" means for `docs/design-system/`. The spec is [specification.md](specification.md), a snapshot of upstream `docs/spec.md` at commit `db977b3` (2026-11-18), and wins when this file disagrees.

## File shape

- **Where.** The root is `docs/design-system/DESIGN.md`, and everything it references lives under `docs/design-system/`.
- **Tokens** are YAML: front matter at the top (a line of exactly `---` before and after), fenced ` ```yaml ` blocks inside the sections, or both, merged into one token tree.
- **Each top-level key once** across the whole file: `colors` in the front matter and again in a block is an error.
- **Layout.** Keep an existing file's layout. A new file puts `version: alpha`, `name`, `description`, and `omitted` in the front matter, and each token group in one ` ```yaml ` block in its section, after the opening prose: `colors` in Colors, `typography` in Typography, `spacing` in Layout, `rounded` in Shapes, `motion` in Motion & Micro-interaction, `components` in Components.
- **Every ` ```yaml ` fence is parsed as tokens.** Put a non-token example in a ` ```text ` or ` ```css ` fence.
- **Sections** are `##` headings, at most once each; a `#` title is not a section. The spec's sections, in this order, with aliases in parentheses: Overview (Brand & Style), Colors, Typography, Layout (Layout & Spacing), Elevation & Depth (Elevation), Shapes, Motion & Micro-interaction (Motion & Micro-interactions, Motion), Voice & Content Strategy, Components, Do's and Don'ts. Leave out a section that does not apply. Put a project section the spec does not name (Iconography, Data Visualization) next to the section it extends. Voice & Content Strategy is prose only.

## Tokens

| Group | Value | Rules |
| --- | --- | --- |
| `colors` | Color | `primary` is required. Hex `#RRGGBB` by default; any CSS color string is valid, such as `oklch()` when the code uses it. Contrast is computed in sRGB. |
| `typography` | Typography | `fontFamily` (a full stack is allowed), `fontSize`, `fontWeight`, `lineHeight` (unitless preferred), `letterSpacing` (usually `em`), `fontFeature`, `fontVariation`. |
| `spacing` | Dimension or number | Numbers for counts and ratios, such as columns. |
| `rounded` | Dimension | A named scale, such as `none`, `sm`, `md`, `lg`, `full`. |
| `motion` | Motion | `duration` and `delay` in `ms`, `timingFunction` as a CSS easing (`ease-out`, `cubic-bezier(...)`). Name tokens by purpose (`state-change`, `surface-enter`), not by speed. |
| `components` | map of properties | `backgroundColor`, `textColor`, `typography`, `rounded`, `padding`, `size`, `height`, `width`. A variant or state is its own key with a related name: `button-primary`, `button-primary-hover`. |

- **Dimension** units are `px`, `em`, and `rem` only: a measure of about 65 characters is written as `rem` with the reason in prose. **Duration** is `ms`.
- **Groups.** `colors`, `typography`, `spacing`, and `rounded` take nested sub-maps, flattened to dot paths (`colors.light.surface`), for theme modes and breakpoints. Mode-agnostic roles stay at the top level. A flat and a grouped key that flatten to one name (`primary-light`, `primary.light`) are an error.
- **References** are `{path.to.token}`, pointing at a primitive value, or inside `components` at a composite (`{typography.label-md}`), never a group.
- **A component property the spec does not list** (a border, a shadow, a focus ring) draws a warning: write it in the component's prose or sheet, unless the user accepts the warning.
- **Elevation has no token group.** Write shadow and overlay values exactly in Elevation & Depth's prose, not as a custom key such as `shadows`.
- **`omitted`** lists a token group or section left out on purpose, with its reason:

  ```yaml
  omitted:
    - section: rounded
      reason: "Sharp corners everywhere; see Shapes."
  ```
- **Prose cites tokens** by reference, `{colors.primary}`, or by an exactly equal value.

## `@` references

- An inline code span whose whole content is `@<path>` or `@<path>#<fragment>`, with a file extension and no whitespace: `@components/button.html#button-primary`. Anything else is ordinary text.
- The path resolves from `docs/design-system/`, wherever the reference appears. A leading `/`, or a path that leaves `docs/design-system/`, is an error.
- Name product code in a plain code span with no `@`: "Buttons are implemented in `src/ui/Button.tsx`."
- Fragments: in Markdown, a heading's slug; in HTML, an element `id` or a `<!-- COMPONENT: name -->` marker. A missing file or fragment is a warning.

## Component sheets

A sheet is the canonical rendered form of one component family. Write one when the user asks for a component kit, or the system defines a component the code lacks. When the code has it, name its file in prose instead.

- `components/<family>.html`, self-contained: inline `<style>`, no scripts or external stylesheets, and only the font families typography names, from their real source.
- Values come only from the tokens, as CSS custom properties at `:root`, named as `design.md export --format css-tailwind` names them (`--color-primary`, `--radius-md`).
- Each variant follows its marker and carries its `id`: `<!-- COMPONENT: button-primary -->` before `<button id="button-primary">`. Every marker names a key in `components`.
- Show every state the tokens and prose name as its own static instance (hover, focus, pressed, disabled, error). Copy follows Voice & Content Strategy, and sample data follows [craft.md](craft.md).
- Reference it from Components, one line per family:

  ```text
  - **Buttons** → `@components/button.html`: `button-primary`, `button-primary-hover`, `button-secondary`
  ```

Render it:

```bash
npx playwright screenshot --viewport-size=375,812  --full-page "file://$PWD/docs/design-system/components/<family>.html" "$TMPDIR/<family>-375.png"
npx playwright screenshot --viewport-size=1280,800 --full-page "file://$PWD/docs/design-system/components/<family>.html" "$TMPDIR/<family>-1280.png"
```

## Guides

`guides/<topic>.md` holds detail one section outgrew, such as a chart palette. DESIGN.md keeps the section, its tokens, and the rule a reader needs most, and references the guide (`@guides/<topic>.md#<heading>`). A guide holds no tokens; it cites DESIGN.md's.

## Lint, diff, export

```bash
npx --yes @google/design.md lint docs/design-system/DESIGN.md
```

Pass the path, not stdin, so `@` references resolve. Exit `1` means errors. An `orphaned-tokens` warning for a color used only outside components (a chart series) is acceptable when the prose says where it is used.

Diff a change against the committed tree, copied whole so references resolve:

```bash
rm -rf "$TMPDIR/ds-before" && mkdir -p "$TMPDIR/ds-before"
git archive HEAD docs/design-system | tar -x -C "$TMPDIR/ds-before"
npx --yes @google/design.md diff "$TMPDIR/ds-before/docs/design-system/DESIGN.md" docs/design-system/DESIGN.md
```

`"regression": true` means more errors or warnings after the change.

When the project generates its token source from the file, regenerate it with its own command, such as `npx --yes @google/design.md export --format css-tailwind docs/design-system/DESIGN.md > src/styles/theme.css`. Other formats: `json-tailwind` (Tailwind v3 `theme.extend`) and `dtcg` (W3C design tokens JSON).

## Where the published CLI lags the spec

The newest published CLI, `@google/design.md` 0.4.0 (2026-07-27), predates parts of the snapshot:

| The spec allows | 0.4.0 does | So |
| --- | --- | --- |
| A `motion` group | Warns `token-like-ignored`; export drops it | Keep it, name the warning as CLI lag, check units and names by hand |
| `@` references | Does not check them | Check each path and fragment by hand |
| A key defined twice is an error | Warns | Treat it as an error |
| Grouped tokens (`colors.light.surface`) | `export --format css-tailwind` fails with `INVALID_TOKEN_NAME` | When the project exports with `css-tailwind`, use flat names (`surface-dark`) and say why |
| Voice & Content Strategy, Motion & Micro-interaction | Does not check their order | Check the spec order by hand |

A finding the spec contradicts is lag: keep the spec's form, and say so in the reply. Re-check a row against a newer CLI before relying on it.

## Hand checks

Without the linter, or for what it does not cover:

- Front matter delimiters, each top-level key once, no non-token ` ```yaml ` fence.
- Section headings: `##`, no duplicates, the spec's in order.
- `primary` exists. Every `{reference}` resolves to a primitive (a composite only inside `components`). No flat and grouped collision.
- Units: Dimensions in `px`, `em`, or `rem`; Durations in `ms`.
- Every text and fill pair in `components` passes WCAG AA, 4.5:1, in sRGB.
- Every `@` reference resolves, and every value in prose matches its token.

## A newer spec

```bash
gh api 'repos/google-labs-code/design.md/commits?path=docs/spec.md&per_page=5' --jq '.[] | .sha[0:7] + " " + .commit.committer.date[0:10] + " " + (.commit.message | split("\n")[0])'
npx --yes @google/design.md spec   # the published CLI's spec, which may lag main
```

When upstream has commits after `db977b3`, fetch `docs/spec.md` and hold the file to the newer spec for this run. Tell the user the snapshot is stale. Do not edit the installed skill.
