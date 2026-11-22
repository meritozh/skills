# Conformance

What "follows the design.md spec" means for `docs/design-system/`. The spec itself is [specification.md](specification.md), a snapshot of upstream `docs/spec.md` at commit `db977b3` (2026-11-18). When this file and the spec disagree, the spec wins.

## Where it lives

- The root of the design system is `docs/design-system/DESIGN.md`. The spec calls the file `DESIGN.md`; keep that name.
- Every `@` reference resolves from `docs/design-system/`, so everything the file references lives under it.
- One design system per repo. A second `DESIGN.md` anywhere else is migrated or deleted, never kept in parallel.

## File shape

- **Tokens and prose.** Tokens are YAML: front matter at the top (a line of exactly `---` before and after), fenced ` ```yaml ` blocks inside the sections, or both. All blocks merge into one token tree.
- **Each top-level key once** across the whole file. `colors` in the front matter and again in a block is an error under the spec (the 0.4.0 linter only warns).
- **Layout.** Keep the layout an existing file already uses. A new file puts `version: alpha`, `name`, `description`, and `omitted` in the front matter, and each token group in one ` ```yaml ` block inside its own section, after the section's opening prose: `colors` in Colors, `typography` in Typography, `spacing` in Layout, `rounded` in Shapes, `motion` in Motion & Micro-interaction, `components` in Components. The prose and the values it explains then change together.
- **Every ` ```yaml ` fence is parsed as tokens.** An example that is not a token goes in a ` ```text ` or ` ```css ` fence.
- **Sections** are `##` headings, at most once each. An optional `#` title is not a section. The spec's sections, in this order, each under its name or an alias:

  | # | Section | Aliases |
  | --- | --- | --- |
  | 1 | Overview | Brand & Style |
  | 2 | Colors | |
  | 3 | Typography | |
  | 4 | Layout | Layout & Spacing |
  | 5 | Elevation & Depth | Elevation |
  | 6 | Shapes | |
  | 7 | Motion & Micro-interaction | Motion & Micro-interactions, Motion |
  | 8 | Voice & Content Strategy | |
  | 9 | Components | |
  | 10 | Do's and Don'ts | |

  A section that does not apply is left out. A project section the spec does not name (Iconography, Data Visualization, Accessibility) is preserved by every consumer; put it next to the section it extends. Voice & Content Strategy is prose only.

## Tokens

| Group | Value | Rules |
| --- | --- | --- |
| `colors` | Color | `primary` is required. Hex `#RRGGBB` by default; any CSS color string is valid, and contrast is computed in sRGB. Use the project's own format when its code uses `oklch()`. |
| `typography` | Typography | `fontFamily` (string; a full stack is allowed), `fontSize` (Dimension), `fontWeight` (number), `lineHeight` (unitless number preferred, or Dimension), `letterSpacing` (Dimension, usually `em`), `fontFeature`, `fontVariation`. Most systems have 9 to 15 levels. |
| `spacing` | Dimension or number | Numbers for counts and ratios, such as columns. |
| `rounded` | Dimension | A named scale, such as `none`, `sm`, `md`, `lg`, `full`. |
| `motion` | Motion | `duration` and `delay` in `ms`, `timingFunction` as a CSS easing (`ease-out`, `cubic-bezier(...)`, `steps(...)`). Name tokens by purpose (`state-change`, `surface-enter`, `surface-exit`), not by speed. |
| `components` | map of properties | Properties: `backgroundColor`, `textColor`, `typography`, `rounded`, `padding`, `size`, `height`, `width`. A variant or state is its own key with a related name: `button-primary`, `button-primary-hover`, `button-primary-disabled`. |

- **Dimension** units are `px`, `em`, and `rem` only. No `%`, `vh`, `ch`, `pt`, or `dp`: a measure of about 65 characters is written as `rem` with the reason in prose. **Duration** is `ms`.
- **Groups.** `colors`, `typography`, `spacing`, and `rounded` take nested sub-maps, flattened to dot paths (`colors.light.surface`). Use them for theme modes (`light`, `dark`) and breakpoints (`sm`, `md`, `lg`, `xl`). Mode-agnostic roles stay at the top level. A flat key and a grouped key that flatten to the same name (`primary-light` and `primary.light`) are an error.
- **References** are `{path.to.token}`. Outside `components` they point at a primitive value, never a group. Inside `components` they may point at a composite (`{typography.label-md}`).
- **A component property the spec does not list** (a border, a shadow, a focus ring) is accepted with a warning. Write it in the component's prose or its sheet instead, unless the user accepts the warning.
- **Elevation has no token group.** Write shadow and overlay values out exactly in Elevation & Depth's prose. A custom top-level key such as `shadows` is dropped by exports and draws `token-like-ignored`.
- **`omitted`** lists a token group or section left out on purpose, with its reason:

  ```yaml
  omitted:
    - section: rounded
      reason: "Sharp corners everywhere; see Shapes."
  ```
- **Prose cites tokens** by reference, `{colors.primary}`, or by value. A value written in prose equals its token, exactly.

## `@` references

- An inline code span whose whole content is `@<path>` or `@<path>#<fragment>`, with a file extension and no whitespace: `@components/button.html#button-primary`, `@guides/data-viz.md#palettes`. Without the code span, or without an extension, it is ordinary text.
- The path resolves from `docs/design-system/`, wherever the reference appears, guides included. A leading `/`, or a path that leaves `docs/design-system/`, is an error.
- So product code is never an `@` reference. Name it in a plain code span with no `@`: "Buttons are implemented in `src/ui/Button.tsx`."
- Fragments: in Markdown, a heading's slug; in HTML, an element `id` or a `<!-- COMPONENT: name -->` marker. A missing file or fragment is a warning.

## Component sheets

A sheet is the canonical rendered form of one component family, for an agent to read before building it. Write one when the user asks for a component kit, or when the system defines a component the code does not have yet. When the code already has the component, name its file in prose instead.

- `components/<family>.html`, one self-contained file: inline `<style>`, no scripts, no external stylesheets, and no fonts except the families typography names, from their real source.
- Values come only from the tokens, as CSS custom properties at `:root`, named the way `design.md export --format css-tailwind` names them (`--color-primary`, `--radius-md`, `--spacing-sm`).
- Each variant follows its marker and carries the matching `id`: `<!-- COMPONENT: button-primary -->` before `<button id="button-primary">`. Every marker names a key in `components`.
- Show every state the component tokens and prose name as its own static instance (hover, focus, pressed, disabled, error), so one screenshot shows them all. Copy follows Voice & Content Strategy, and sample data follows [craft.md](craft.md).
- Reference it from Components, one line per family:

  ```text
  - **Buttons** → `@components/button.html`: `button-primary`, `button-primary-hover`, `button-secondary`
  ```

Render it before handing it off:

```bash
npx playwright screenshot --viewport-size=375,812  --full-page "file://$PWD/docs/design-system/components/<family>.html" "$TMPDIR/<family>-375.png"
npx playwright screenshot --viewport-size=1280,800 --full-page "file://$PWD/docs/design-system/components/<family>.html" "$TMPDIR/<family>-1280.png"
```

## Guides

`guides/<topic>.md` holds detail that one section outgrew: a chart palette with its rules, an icon set, illustration rules. DESIGN.md keeps the section, its tokens, and the rule a reader needs most, then references the guide (`@guides/<topic>.md#<heading>`). A guide holds no tokens: every value it uses is a token in DESIGN.md, cited.

## Lint, diff, export

```bash
npx --yes @google/design.md lint docs/design-system/DESIGN.md
```

Pass the path, not stdin, so `@` references resolve. Exit `1` means errors. The bar: no errors, no `contrast-ratio` warning, and every other warning fixed or named with its reason. An `orphaned-tokens` warning for a color used only outside components (a chart series, a focus ring) is acceptable when the prose says where it is used.

A change is diffed against the committed tree, copied whole so its references still resolve:

```bash
rm -rf "$TMPDIR/ds-before" && mkdir -p "$TMPDIR/ds-before"
git archive HEAD docs/design-system | tar -x -C "$TMPDIR/ds-before"
npx --yes @google/design.md diff "$TMPDIR/ds-before/docs/design-system/DESIGN.md" docs/design-system/DESIGN.md
```

`"regression": true` means more errors or warnings after the change. Read which, then fix them or name them.

When the project generates its token source from the file, regenerate it with the same command it uses, such as `npx --yes @google/design.md export --format css-tailwind docs/design-system/DESIGN.md > src/styles/theme.css`. Other formats: `json-tailwind` (Tailwind v3 `theme.extend`) and `dtcg` (W3C design tokens JSON).

## Where the published CLI lags the spec

The newest published CLI, `@google/design.md` 0.4.0 (2026-07-27), predates parts of the spec snapshot. Checked against it:

| The spec allows | 0.4.0 does | So |
| --- | --- | --- |
| A `motion` group | Warns `token-like-ignored`; export drops it | Keep it. Name the warning as CLI lag. Check units and names by hand |
| `@` references | Does not check them | Check by hand: each path exists under `docs/design-system/`, each fragment exists |
| A key defined twice is an error | Warns | Treat it as an error |
| Grouped tokens (`colors.light.surface`) | Parses and lints them; `export --format css-tailwind` fails with `INVALID_TOKEN_NAME` | When the project exports with `css-tailwind`, use flat names (`surface-dark`) and say why |
| Voice & Content Strategy, Motion & Micro-interaction | Does not know them, so does not check their order | Keep the spec order. Check it by hand |

A finding the spec contradicts is lag, not a defect: keep the spec's form, and say so in the reply. A newer CLI may close a row; re-check a row before relying on it.

## Hand checks

When the linter is unavailable, or for what it does not cover:

- Front matter delimiters, each top-level key once, no non-token ` ```yaml ` fence.
- Section headings: `##`, no duplicates, the spec's in order.
- `primary` exists. Every `{reference}` resolves to a primitive (a composite only inside `components`). No flat and grouped collision.
- Units: Dimensions in `px`, `em`, or `rem`; Durations in `ms`.
- Every text and fill pair in `components` passes WCAG AA, 4.5:1, computed in sRGB.
- Every `@` reference resolves, and every value in prose matches its token.

## A newer spec

```bash
gh api 'repos/google-labs-code/design.md/commits?path=docs/spec.md&per_page=5' --jq '.[] | .sha[0:7] + " " + .commit.committer.date[0:10] + " " + (.commit.message | split("\n")[0])'
npx --yes @google/design.md spec   # the spec bundled with the published CLI, which may lag main
```

When upstream has commits after `db977b3`, fetch `docs/spec.md`, read what changed, and hold the file to the newer spec for this run. Tell the user the snapshot in this skill is stale. Do not edit the installed skill.
