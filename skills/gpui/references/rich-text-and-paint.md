# Rich Text & Custom Paint in GPUI

Distilled from a production markdown/rich-text renderer built directly on GPUI's text
system (comet). GPUI's built-in `Markdown` element renders a whole document as one
element and gets selection "for free"; when you need **streaming**, **per-block
incremental updates**, **syntax highlighting**, or **custom washes**, you build a block
tree yourself and inherit a set of hard constraints. This file is the map of those
constraints. Read it before building any custom rich-text surface.

## Table of contents

1. [The governing principle: numbers drive layout, colors are paint](#1-the-governing-principle)
2. [Syntax highlighting without reflow](#2-syntax-highlighting-without-reflow)
3. [Streaming fade veil](#3-streaming-fade-veil)
4. [Cross-frame flatten/shape cache](#4-cross-frame-flattenshape-cache)
5. [Text selection across a rebuilt tree](#5-text-selection-across-a-rebuilt-tree)
6. [Tables via the layout engine](#6-tables-via-the-layout-engine)
7. [Custom washes with canvas()](#7-custom-washes-with-canvas)

---

## 1. The governing principle

**Numbers drive layout; colors are paint.** Anything that changes the *geometry* of text
(font, weight, glyph count, run length) forces cosmic-text to re-shape and can reflow the
page. Anything that only changes *color* (syntax tint, fade opacity, selection wash) is a
paint-time concern and must never touch layout. Every technique below is an application
of this rule. Violating it produces jitter, mis-measured heights, and stale caches.

Practical test you can assert in unit tests: after applying highlight/veil, the resulting
`TextRun`s must have **identical `font` and total length** to the plain runs — only
`color` (and cosmetic `background_color` / `underline` / `strikethrough`) differ.

```rust
assert!(runs.iter().all(|r| r.font == mono_font));
assert_eq!(runs.iter().map(|r| r.len).sum::<usize>(), line.len());
```

---

## 2. Syntax highlighting without reflow

Render code blocks **per line** so each line's height is exactly `1 × line_height` and the
block height is `lines × line_height` — known before any highlighting runs. Produce
syntax colors as an **exact-cover** set of `TextRun`s over the same monospace font;
highlighting only sets `run.color`:

```rust
let mut run = plain_run(span.range.len());   // same mono font, exact length
run.color = token_color(span.kind, theme);   // ONLY color changes
```

Because layout is fixed up front, Tree-sitter (or any highlighter) can run at paint time,
arrive late, or be recomputed on a theme change without ever moving a glyph.

---

## 3. Streaming fade veil

For streaming text (LLM output), commit text to layout **instantly** and dissolve a purely
cosmetic opacity "veil" over the newly appended suffix. It's layout-safe by construction:
splitting a run only by color leaves shaping identical, because adjacent same-font runs
shape as one word.

```rust
pub fn apply_veil(runs: Vec<TextRun>, spans: &[VeilSpan]) -> Vec<TextRun> {
    // split runs at span boundaries; multiply alpha into color/bg/underline/strikethrough only
    piece.color = piece.color.opacity(alpha);
    // ... font & length untouched
}
```

Key refinements that make it robust:

- **Diff against the previously rendered flat text** via a `common_prefix` snapped to char
  boundaries, so a non-append rewrite (`**bol` → `bold` as the parser resolves markup)
  keeps the settled prefix's fade and only re-veils the changed tail.
- **Cadence-adaptive durations**: track an EMA of inter-append gaps, clamp (e.g.
  120–400 ms), so fast bursts don't queue a visible backlog.
- **Seed from existing text** when re-attaching to a live session, so the whole reply
  doesn't fade in again on reconnect.

---

## 4. Cross-frame flatten/shape cache

An incremental parser only touches a suffix of top-level blocks, so everything below the
stable boundary is byte-identical frame to frame. Cache the flattened
`SharedString` + `TextRun`s per block, keyed by `(row_key, block_index)` **and a palette
generation**. Sync the palette first: if the theme generation moved, clear the whole cache
(otherwise you serve stale colors).

```rust
fn flatten_cached(cache: &RefCell<FlatCache>, key: (RowKey, usize), runs: &[Run],
                  theme: &Theme) -> Rc<FlatText> {
    let mut c = cache.borrow_mut();
    c.sync_palette();                                   // clears all if theme_generation() moved
    c.flats.entry(key).or_insert_with(|| Rc::new(flatten_runs(runs, theme))).clone()
}
```

This keeps the per-frame cost of a fading live row flat in total reply length — only the
changing tail block is re-flattened.

---

## 5. Text selection across a rebuilt tree

A single-element markdown gets selection free; a block tree must rebuild selection each
frame. The working approach:

- A thread-local `REGISTRY` collects each frame's painted text elements in **document =
  paint order**. A zero-size `canvas()` painted **first** each frame
  (`selection_frame_reset()`) clears it.
- Window-level mouse listeners, **re-registered every paint**, drive drags spanning
  paragraphs. Use `index_for_position` for hit-testing and `range_rects` to compute
  per-visual-line wash boxes.
- Handle soft-wrap affinity (a caret at a wrap point belongs to the end of the previous
  visual line or the start of the next) — this is the fiddliest part and deserves unit
  tests.

The selection wash is painted as background quads (a paint concern, §1), never by altering
the text runs' geometry.

---

## 6. Tables via the layout engine

Don't compute column widths manually. Shape each cell **unwrapped** to get its max-content
width, then let Taffy do proportional distribution: set `flex_grow` / `flex_shrink` from
the natural width, `flex_basis(px(0))`, and `min_w(min(natural, px(96)))`, and wrap the
whole table in `overflow_x_scroll`. This reproduces content-proportional columns (the
common CSS table behavior) exactly, and degrades to horizontal scroll when the table
can't fit.

---

## 7. Custom washes with canvas()

`TextRun::background_color` only paints **square** boxes. For rounded inline-code
backgrounds (or any decoration that must align to laid-out glyphs), put a `canvas()` as an
**earlier sibling** of the text (so it paints underneath), read the text element's own
`TextLayout`, and paint rounded quads directly:

```rust
let underlay = canvas(
    |_, _, _| (),                                    // no prepaint state
    move |_, _, window, _| {
        for range in &code_ranges {
            for rect in range_rects(&layout, range, PAD_X, INSET_Y) {
                window.paint_quad(quad(rect, px(RADIUS), wash, px(0.0),
                    transparent_black(), BorderStyle::default()));
            }
        }
    },
).absolute().size_full();

div().relative().child(underlay).child(text_el)      // canvas first ⇒ beneath text
```

The same `canvas()` + `PathBuilder::stroke` + `window.paint_path` pattern draws progress
rings, spinners, and any vector decoration that has to line up with laid-out content.
