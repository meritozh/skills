# UI prototype

Build **several radically different UI variants** on one route, switched from a floating bottom bar. The user flips between them in the browser, picks one or takes parts of several, and the rest is thrown away.

When the question is about logic or state rather than looks, this is the wrong branch. Use [logic.md](logic.md).

## Two sub-shapes, and A is strongly preferred

A UI variant is far easier to judge **inside the rest of the app**: the real header, the real sidebar, the real data, the real density. On an empty route every variant looks fine. Use sub-shape A whenever there is a plausible existing page to host the variants.

### A: inside an existing page (the default)

The route exists. The variants render **on that route**, chosen by a `?variant=` search param. The existing data fetching, params, and auth stay; only the rendering swaps.

Something that has no page yet but would naturally live inside one (a new section of the dashboard, a new card on the settings screen, a new step in an existing flow) is still sub-shape A: mount the variants in the host page.

### B: a new page (last resort)

Only when the thing has no existing page to live in: a new top-level surface, or a flow that cannot be embedded anywhere sensible.

Make a **throwaway route** under the routing convention the project already uses, with `prototype` in its path or file name, and the same `?variant=` param. Before choosing B, check once more that no existing page could host it. An empty route hides the design problems a populated one exposes.

Both sub-shapes use the same bottom bar.

## 1. State the question and pick N

Three variants by default. Past five they stop being radically different and start being noise, so cap there.

Write the plan in one line at the top of the prototype's main file:

> Three variants of the settings page, switched with `?variant=`, on the existing `/settings` route.

## 2. Make the variants radically different

Hold each variant to:

- the page's purpose and the data it already has;
- the project's component library and styling (Tailwind, shadcn, MUI, plain CSS, whatever it uses), and the tokens in `docs/design-system/DESIGN.md` when the repo has one;
- a clear component name, such as `VariantA`, `VariantB`, `VariantC`.

Variants differ in **structure**: layout, information hierarchy, the primary action. Not in color or copy. Three slightly different card grids are wallpaper, not a prototype. When two drafts come out alike, redo one with an explicit constraint, such as "no card grid".

Build each variant for the person who uses the page, as [experience-first](../principles/experience-first.md) says: it shows the states the user meets, empty and error included, and a few controls done well beat many rough ones. This covers what the page shows. The code still skips tests and error handling.

## 3. Wire them together

One switcher on the route:

```tsx
// pseudocode: adapt to the project's framework
const variant = searchParams.get('variant') ?? 'A'
return (
  <>
    {variant === 'A' && <VariantA {...data} />}
    {variant === 'B' && <VariantB {...data} />}
    {variant === 'C' && <VariantC {...data} />}
    <PrototypeSwitcher variants={['A', 'B', 'C']} current={variant} />
  </>
)
```

In sub-shape A, the existing data fetching stays above the switcher and only the rendered subtree changes per variant. In sub-shape B, the throwaway route mounts the same switcher.

## 4. Build the floating switcher

A small fixed bar at the bottom center of the screen, with three parts:

- **Left arrow:** the previous variant, wrapping around.
- **Label:** the current variant key and its name when it has one, such as `B (sidebar layout)`.
- **Right arrow:** the next variant, wrapping around.

Behavior:

- An arrow updates the URL search param through the framework's router (`router.replace` in Next, `navigate` in React Router), so a variant can be shared and survives a reload.
- The `←` and `→` keys cycle too, except while an `<input>`, `<textarea>`, or `[contenteditable]` has focus.
- It looks unlike the page (a high-contrast pill, a soft shadow), so nobody mistakes it for part of the design.
- It never ships: gate it on `process.env.NODE_ENV !== 'production'` or the project's equivalent, so a stray merge cannot show it to users.

Put it in one shared component where the project keeps shared UI, so both sub-shapes reuse it.

## 5. Hand it over

Give the URL and the `?variant=` keys.

## 6. Capture and clean up

When a variant has won, capture the answer (which variant, and why) and the prototype as [the skill](../SKILL.md) says. All the variants go to the throwaway branch; variant components and a switcher left in the main line rot fast and confuse the next reader. In the main line:

- **Sub-shape A:** the winner is folded into the existing page; the losing variants and the switcher are gone.
- **Sub-shape B:** the winner becomes a real route; the throwaway route and the switcher are gone.

## Do not

- **Share too much between variants.** A shared header is fine; a shared layout defeats the point. Each variant is free to throw out the layout.
- **Wire variants to real mutations.** Read-only is fine. A variant that must mutate points at a stub: the question is how it looks, not whether the backend works.
- **Promote a variant to production as it is.** It was written under prototype rules, without tests or error handling. Rewrite it properly when folding it in.
