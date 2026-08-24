# Real-World GPUI App Architecture

Distilled from two production GPUI desktop apps built on Zed's GPUI (waku, comet).
The other reference files teach the *APIs*; this one teaches how experienced teams
**structure a whole app** with them. Where two independent codebases converged on the
same idiom, that idiom is load-bearing — treat convergent patterns as defaults, not
options.

## Table of contents

1. [App bootstrap & window setup](#1-app-bootstrap--window-setup)
2. [Root view & top-level layout](#2-root-view--top-level-layout)
3. [State management at app scale](#3-state-management-at-app-scale)
4. [Render patterns & reusable components](#4-render-patterns--reusable-components)
5. [Async: streaming, pumps, and stale-result guards](#5-async-streaming-pumps-and-stale-result-guards)
6. [Animation without pinning the CPU](#6-animation-without-pinning-the-cpu)
7. [Custom Element implementations](#7-custom-element-implementations)
8. [Input, focus & key-context scoping](#8-input-focus--key-context-scoping)
9. [Gotchas checklist](#9-gotchas-checklist)

---

## 1. App bootstrap & window setup

### Keep `main` trivial; put boot logic in a library `run()`

`main.rs` should own only platform attributes (e.g. `windows_subsystem = "windows"`
so a release GUI build spawns no console) and call a library function. Everything else
lives in `run()` so it is testable and re-entrant.

```rust
// main.rs
#![cfg_attr(all(target_os = "windows", not(debug_assertions)), windows_subsystem = "windows")]
fn main() { myapp::run(); }
```

### Order the `app.run` closure by paint dependency

The bootstrap closure is a sequence, and the order matters. **Theme/appearance must be
the last global set before the first window opens**, or the window flashes the wrong
palette while other settings load. Each subsystem exposes a `pub fn init(cx: &mut App)`;
call them all here rather than scattering setup into `Render` impls.

```rust
Application::new().with_assets(Assets).run(move |cx: &mut App| {
    gpui_tokio::init(cx);                 // if you bridge tokio for real I/O
    register_fonts(cx);
    theme::init(cx);                      // appearance BEFORE first paint
    input::init(cx);                      // each module owns its key bindings
    menu::init(cx);
    let state = cx.new(|cx| AppState::new(cx));
    AppState::bootstrap(state.clone(), cx);   // kick off async engine attach
    cx.set_global(ReopenState { state: state.clone() });
    open_main_window(state, cx);
    cx.set_menus(app_menus());            // AFTER window: keymap snapshotted here
    cx.activate(true);
});
```

Side-effecting subprocess/daemon setup happens **before** `.run()` and its handle is
*moved* into the closure, then threaded into the root entity as a constructor argument
— not fetched from a global later.

### Custom titlebar: the non-obvious flags

A modern desktop app draws its own header while keeping native window controls. The flag
combination that actually works:

```rust
WindowOptions {
    titlebar: Some(TitlebarOptions {
        title: None,                                   // strip is custom-drawn
        appears_transparent: true,                     // client area extends over the frame
        traffic_light_position: cfg!(target_os = "macos")
            .then(|| point(px(14.0), px(14.0))),
    }),
    app_owns_titlebar_drag: cfg!(target_os = "macos"), // stops AppKit dead-zoning the strip
    window_decorations: cfg!(target_os = "linux").then_some(WindowDecorations::Client),
    window_background: WindowBackgroundAppearance::Blurred, // must match your re-apply loop
    app_id: Some("myapp".into()),
    window_bounds: Some(window_bounds),
    display_id,                                        // see below
    ..Default::default()
}
```

- `appears_transparent: true` + a custom header is how you get your own titlebar while
  keeping native traffic-lights on macOS. Gate every OS-varying field with `cfg!(...)`
  inline instead of duplicating the whole struct.
- If `window_background` here disagrees with the value your appearance/theme re-apply
  path sets, macOS vibrancy dies on the first theme change and never returns. Also
  re-apply the window background **after** the window exists, because `WindowOptions` is
  applied before the view attaches.

### `WindowBounds` are display-relative — you cannot restore raw pixels

To persist window position across restarts (and unplugged monitors), save the **display
UUID**, re-resolve it against currently-connected displays, pass `display_id` in
`WindowOptions`, and clamp the origin so the titlebar stays grabbable.

```rust
let display = saved.display_uuid
    .and_then(|uuid| cx.displays().into_iter().find(|d| d.uuid().ok() == Some(uuid)));
let display_id = display.as_ref().map(|d| d.id());
let anchor = display.or_else(|| cx.primary_display());
// clamp saved.x/y so at least a grab-width of titlebar stays on-screen
```

### Reopen: rebuild the window around a still-running engine

On macOS, closing the last window (⌘W) keeps the process alive. Stash a `ReopenState`
global holding the engine-backed root entity so the dock icon can reconstruct the view
without re-bootstrapping:

```rust
cx.on_reopen(|cx| {
    if cx.windows().is_empty()
        && let Some(reopen) = cx.try_global::<ReopenState>() {
        open_main_window(reopen.state.clone(), cx);
    }
});
```

### Native menus are app-level and label-owning

`cx.set_menus(...)` snapshots the keymap at call time, so call it **after** the window
and keymap are final. Menu items own their label strings, so switching UI language means
rebuilding and re-calling `set_menus`, not just repainting. On macOS, forgetting
`set_menus` leaves `NSApp.mainMenu` nil — no ⌘Q, no system menu bar. Use
`MenuItem::os_action("Copy", Copy, OsAction::Copy)` so the OS Edit menu drives the
focused input through the native responder chain; use plain `MenuItem::action` for verbs
with no OS equivalent (Undo, custom commands).

### Fonts: register static weights, especially on Linux

GPUI's cosmic-text path (Linux) rasterizes a variable font at its **default instance
only** — it never applies the `wght` axis, so every weight silently paints at 400 unless
you register the static 500/600/700 faces. macOS/CoreText applies the axis natively.

---

## 2. Root view & top-level layout

### One large root entity, not a deep tree of tiny entities

Both apps centralize essentially all mutable app state in a single root entity
(`AppState` / the root view struct) rather than a fashionable tree of many small
entities. This makes cross-cutting operations — a stream delta that touches a session, a
sidebar badge, and the transcript — a single `&mut self` mutation instead of a message
dance between entities. Child widgets that own genuinely independent state (a text input,
a terminal) still get their own `Entity<T>` held as a field.

### The root `render` does three jobs

1. set `key_context("AppRoot")` — the scope key bindings resolve against;
2. attach every root-level `on_action` handler via `cx.listener(Self::method)`;
3. compose the top-level flex layout.

Actual pixels live in child views / render helpers, not inline in the root.

```rust
fn render(&mut self, _w: &mut Window, cx: &mut Context<Self>) -> impl IntoElement {
    div()
        .id("app-root")
        .key_context("AppRoot")
        .on_action(cx.listener(Self::toggle_sidebar))
        .on_action(cx.listener(Self::navigate_back))
        .flex()
        .size_full()
        .when(self.sidebar_width > 0.0, |root| root.child(self.sidebar_pane()))
        .child(self.main_pane())
}
```

### Bound the re-render blast radius with `.cached()` islands

A monolithic root would rebuild its entire element tree on every `cx.notify()`. Split
`render` into "islands" and wrap each in `.cached(StyleRefinement)`; GPUI reuses the
island's laid-out tree when its inputs are unchanged even though the root re-rendered.
This is *the* technique that makes the one-big-entity architecture fast.

```rust
root.child(self.sidebar_pane.clone().cached(StyleRefinement::default().w(px(width))))
```

For an expensive sub-view, gate the rebuild on a cheap **snapshot** whose `PartialEq`
compares `Rc` pointers (`Rc::ptr_eq`) instead of deep-comparing data — an O(1) "did this
change?" check in a hot path.

### An animated show/hide panel must LEAVE the tree when closed

Sizing a collapsed panel to zero width is a trap: it keeps rebuilding on every notify.
Retire the tween to `None` when it completes and gate the child on width:

```rust
fn slide_width(slide: &mut Option<WidthTween>, target: f32) -> f32 {
    match slide.as_mut().and_then(|s| s.width_toward(target)) {
        Some(w) => w,
        None => { *slide = None; target }   // done → drop tween so .when() can remove child
    }
}
// render: .when(width > 0.0, |root| root.child(panel))
```

---

## 3. State management at app scale

### Theme/config as a `Global` read through a `Copy` snapshot accessor

Config that everything reads but rarely writes belongs in a `Global`, exposed through a
static accessor that returns an owned `Copy` value (so render closures can capture it
freely) with a safe fallback:

```rust
struct ActiveTheme(Theme);
impl Global for ActiveTheme {}

impl Theme {
    pub fn current(cx: &App) -> Theme {         // Theme is a Copy struct of Hsla fields
        cx.try_global::<ActiveTheme>().map(|a| a.0).unwrap_or_else(Theme::dark)
    }
}
// every render fn starts: let theme = Theme::current(cx);
```

**`refresh_windows()` vs `notify()`:** if theme colors are read imperatively at paint
time (`Theme::current(cx)`) rather than captured into any entity's state, an appearance
change must call `cx.refresh_windows()` — no entity's `notify` would repaint them.
Pair the global with a monotonic **generation counter** so downstream caches (e.g.
markdown render) invalidate when the palette changes; a content-only cache key would
serve dark text on a light background after a theme switch.

### A generic subscription pump reduces RPC streams into the root entity

The recurring shape for live data: a generic spawner that subscribes to a stream, parses
each message, applies it through a **pure `fn` reducer**, and self-terminates when the
entity is dropped. Hold the tasks in a `Vec<Task<()>>` field so dropping the entity
cancels them.

```rust
fn spawn_watch<T: DeserializeOwned + 'static>(
    cx: &mut Context<AppState>, handle: EngineHandle, method: &'static str,
    apply: fn(&mut AppState, T),
) -> Task<()> {
    cx.spawn(async move |this, cx| loop {
        match handle.subscribe(method).await {
            Ok(mut rx) => while let Some(msg) = rx.recv().await {
                let Ok(parsed) = serde_json::from_value::<T>(msg) else { continue };
                if this.update(cx, |s, cx| { apply(s, parsed); cx.notify(); }).is_err() {
                    return;                         // entity dropped → stop the pump
                }
            },
            Err(_) => cx.background_executor().timer(RETRY_DELAY).await,   // resubscribe
        }
    })
}
// attach: watch_tasks.push(spawn_watch(cx, h.clone(), WATCH_SESSIONS, AppState::apply_sessions));
```

Pure reducers (`apply_*`) are trivially unit-testable without a running app.

### Subscriptions stay alive by ownership

Store `Subscription` handles from `cx.subscribe` / `cx.observe` in a field, conventionally
`_subscriptions: Vec<Subscription>` (leading underscore = kept alive, not read). Dropping
the parent drops the subscriptions. An "adapter entity" that wraps a reusable widget
(`Entity<TextInput>`) and re-emits its own domain event is the standard composition unit.

### A `Loadable<T>` enum standardizes every async slot

```rust
pub enum Loadable<T> { Idle, Loading, Ready(T), Error(String) }
```

Idle (never requested) → Loading (skeletons) → Ready / Error (inline message + Retry).
One tiny type gives every picker and settings pane a consistent lifecycle.

### Reject stale async results with a generation guard

Any state that an async task can write carries a monotonic counter bumped on
invalidation; the task remembers the counter it started with and its write is dropped if
the counter moved. This prevents a slow fetch from overwriting a newer value. The
reusable form is a keyed cache read from `render`:

```rust
match self.branches.read(&path) {
    Query::Ready(v) => Some(v.clone()),
    Query::Pending => None,                 // someone else is already fetching
    Query::Missing(token) => {              // first asker owns the fetch; token carries the generation
        cx.spawn(async move |this, cx| {
            let v = cx.background_executor().spawn(fetch).await;
            this.update(cx, |this, cx| {
                if this.branches.fulfill(token, v) { cx.notify(); }  // fulfill rejects stale gens
            })
        }).detach();
        None
    }
}
```

Two rules the cache encodes: **in-flight entries are never evicted** (dropping one would
strand its token), and **abandoning a token only removes the matching generation** so a
failed old fetch can't cancel a newer request for the same key.

---

## 4. Render patterns & reusable components

### Snapshot the theme, build with `div()`, style with `.when` / `.when_some`

```rust
pub fn icon_button(id: impl Into<ElementId>, path: &'static str, theme: Theme) -> Stateful<Div> {
    div().id(id)
        .size(px(22.0)).rounded(px(6.0))
        .flex().items_center().justify_center()
        .hover(|el| el.bg(theme.overlay))          // closure refines style for the state
        .active(|el| el.bg(theme.overlay_strong))
        .child(icon(path, 13.0, theme.text_tertiary))
}
```

Pass `Theme` **by value** into helpers (it's `Copy`) instead of re-fetching the global —
cheap, pure, testable. Use `.when(bool, |el| ...)` for conditional style,
`.when_some(Option, |el, v| ...)` for optional children, and `.min_w_0().truncate()` for
text that must ellipsize inside a flex row.

### Reusable widgets: `#[derive(IntoElement)]` + builder API + delegated traits

Wrap a `base: Stateful<Div>`, expose chainable setters, implement `RenderOnce`, and
forward `Styled` / `ParentElement` / `InteractiveElement` to `self.base` so the widget
can be styled and given children like a raw `div()` at the call site.

```rust
#[derive(IntoElement)]
pub struct Chip { base: Stateful<Div>, label: SharedString, selected: bool }

impl Chip {
    pub fn new(id: impl Into<ElementId>) -> Self { Self { base: div().id(id), /*..*/ } }
    pub fn selected(mut self, v: bool) -> Self { self.selected = v; self }
}
impl Styled for Chip { fn style(&mut self) -> &mut StyleRefinement { self.base.style() } }
impl ParentElement for Chip {
    fn extend(&mut self, e: impl IntoIterator<Item = AnyElement>) { self.base.extend(e); }
}
impl RenderOnce for Chip {
    fn render(self, _w: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = Theme::current(cx);
        self.base.when(self.selected, |el| el.bg(theme.overlay)).child(self.label)
    }
}
```

A "component library expressed as free functions returning `Div`" (`popover_card`,
`menu_row`, `btn_ghost`, `btn_primary`) is an equally valid, terser alternative that keeps
styling centralized.

### Always virtualize long scroll regions

Never build an un-virtualized list of domain rows. Use `list(state, row_builder)`; only
visible rows are constructed. Bind a `&mut self` method as the builder with
`cx.processor(Self::render_row)`, or capture a `WeakEntity` and upgrade per row:

```rust
list(self.list.clone(), cx.processor(Self::render_row))
    .size_full()
    .with_sizing_behavior(ListSizingBehavior::Auto)
```

### Repeated elements need domain-derived `ElementId`s, not list indexes

An `ElementId` built from a list index changes identity when the list reorders, breaking
focus, animation, and scroll anchoring. Derive it from a stable domain key
(`("session", session_id)`).

### Per-frame work scheduled from render, guarded against re-entry

For springs/measurement-dependent layout, schedule `window.on_next_frame` (or
`window.request_animation_frame`) from inside `render`, guarded by a `*_scheduled: bool`
so exactly one callback is ever in flight. Each tick `notify`s, re-enters render, and
reschedules until the animation parks. Carry a generation/`layout_revision` token on
measurement callbacks so a stale one can't mutate newer state.

---

## 5. Async: streaming, pumps, and stale-result guards

### The universal three-step, and never block the UI thread

```rust
cx.spawn(async move |this, cx| {                      // holds a WeakEntity + async cx
    let result = cx.background_executor().spawn(do_work()).await;  // heavy/blocking work off-thread
    this.update(cx, |this, cx| { this.apply(result); cx.notify(); })  // write back on UI thread
}).detach();                                          // detach if you don't await it
```

**Never do I/O in `render`.** Two executors, chosen by purpose:
`cx.background_executor().spawn(...)` for CPU/blocking work; a tokio bridge
(`gpui_tokio::Tokio::spawn(cx, fut)`) for real async I/O / RPC. Both hand results back to
the UI thread through `entity.update(cx, ...)`.

### Coalesce many async producers into ONE pump — never notify per-event

Streaming data (AI tokens, log lines, probe results) arrives far faster than is useful.
If each producer calls `cx.notify()`, you get 40+ re-renders/sec and a pinned CPU. Instead
funnel producers into queues, drain them in a single pump, and notify **once** per pass
with a commit-rate floor (~120 ms ≈ 8 Hz is plenty for text):

```rust
// drain each queue with bitwise | (NOT ||) so no queue is starved by short-circuiting:
if self.drain_stream(cx) | self.drain_output(cx) | self.drain_probes(cx) {
    cx.notify();                                   // exactly one repaint per drain
}
```

Producers mutate central state + set a dirty flag; the pump decides when to repaint. Drive
the pump loop off a channel `recv().await` so it parks at zero cost when idle, and let the
drain return a schedule describing the next wake.

### Graceful teardown

`cx.on_app_quit(|cx| async move { ... })` returns a future awaited before exit — use it to
flush/drain an embedded engine (snapshots, in-flight writes) so nothing is lost on quit.

---

## 6. Animation without pinning the CPU

This is the single most common performance mistake in GPUI apps, and both codebases
solved it the same way.

### `with_animation` is only for one-shot, single-element transitions

`.with_animation(id, Animation::new(dur).with_easing(..), |el, delta| ...)` gives a
one-shot entry/exit on **one** element (a toast sliding in). Its two sharp edges:

1. **It requests a redraw every display frame while mounted.** A single looping spinner
   built this way pins the whole window at the display's refresh rate (120 Hz on
   ProMotion). Never use it for loaders or any continuous animation.
2. **Its clock is keyed by element id and replays from 0 on remount** — and reusing a
   same-id element can inherit a *finished* clock and snap to the end. Give an exit
   animation a fresh id (`"{id}-out"`).
3. It can only animate the element it's on, **not a sibling's layout.** A panel sliding
   open must animate the *container width* that pushes its sibling — `with_animation`
   can't express that.

### Looping animation → one shared, self-parking clock keyed on `EntityId`

Run a single ~30 fps timer as a `Global`. Views that render a loader take a short "lease";
the clock notifies only leased views and **parks itself** (stops scheduling) when the last
lease lapses, so an idle window schedules nothing. Multiple loaders share one epoch so they
stay phase-locked.

```rust
struct PulseClock { epoch: Instant, leases: HashMap<EntityId, Instant>, running: bool }
impl Global for PulseClock {}

fn pulse_lease(view: EntityId, cx: &mut App) {
    let clock = cx.default_global::<PulseClock>();
    clock.leases.insert(view, Instant::now() + LEASE);
    if clock.running { return; }
    clock.running = true;
    cx.spawn(async move |cx| loop {
        cx.background_executor().timer(TICK).await;              // ~30fps, refresh-independent
        let park = cx.update(|cx| {
            let clock = cx.default_global::<PulseClock>();
            clock.leases.retain(|_, until| *until > Instant::now());
            if clock.leases.is_empty() { clock.running = false; return true; }
            /* notify only leased views */ false
        }).unwrap_or(true);
        if park { break; }
    }).detach();
}
```

A loader element resolves its phase from the clock at render time and renews its lease.
Also honor `cx.reduce_motion()` / a reduced-motion setting.

### Sibling-reflowing motion → a manual wall-clock tween on the entity

Store `WidthTween { from, to, started: Instant }` on the entity and compute the eased
value each frame (see §2). Because it reads a monotonic wall clock, it "can never replay
from 0 mid-exit," unlike an element-id-keyed animation. Two extra traps:
`CubicBezier::eval` hard-clamps to [0,1] but f32 rounding can produce a hair outside it and
GPUI asserts on the delta — clamp defensively; and backdrop blur ignores element opacity,
so ramp the *blur radius* manually during an exit or the glass slab pops off at unmount.

---

## 7. Custom Element implementations

Drop to the `Element` trait only when `div()` can't express the geometry. The three
methods map to **layout → geometry resolution → drawing**, and `paint` is where OS input
and low-level draw calls happen.

### The minimal delegating wrapper (visual effect over a child)

For a paint-time effect (blur, gradient fade), return `id() -> None`, forward
`request_layout` / `prepaint` straight to the child, and do the effect only in `paint`:

```rust
fn paint(&mut self, _id, bounds, _req, _pre, window, cx) {
    window.paint_layer(bounds, |window| {                 // one layer enforces paint ordering
        window.paint_backdrop_blur(bounds, Corners::all(px(radius)), px(blur));
        self.child.paint(window, cx);
    });
}
```

Wrapping in a single `paint_layer` matters: GPUI orders primitives by kind (quads, icons,
images), so without it a backdrop blur reorders relative to the content it should sit
behind. **Read overflow/scroll state at paint time, not render time** — render-time gating
rides the previous frame's offset and leaves a fade stuck on the final frame of a content
shrink.

### Text field: full three-phase Element + IME wiring

A text caret, selection rects, and IME candidate placement need a real Element:
`request_layout` builds a `StyledText` with per-run styling (selection, marked IME text)
and reserves caret space; `prepaint` computes caret x and selection rects; `paint` draws
them and wires input:

```rust
window.handle_input(&self.focus, ElementInputHandler::new(bounds, self.input.clone()), cx);
window.on_mouse_event(/* keep tracking a drag-select that leaves bounds */);
```

`handle_input` in `paint` is what tells the OS *where* the field is (so the IME candidate
window appears correctly) and routes input to the entity's `EntityInputHandler`.

### `canvas()` for arbitrary quads/paths

When a built-in can't paint what you need (e.g. `TextRun::background_color` only paints
square boxes but you want rounded inline-code washes), put a `canvas()` **before** the
text as a sibling so it paints underneath, read the text's own `TextLayout`, and paint
rounded quads / stroked paths directly (`window.paint_quad`, `window.paint_path`).

### Floating overlays need a custom "measure then reposition" Element

`anchored()` does **not** auto-flip to stay on-screen (unlike web popover libs). For a
dropdown that must fit, lay the child out `Position::Absolute`, compute a placement that
flips/clamps in `prepaint`, and shift it with
`window.with_element_offset(offset, |w| self.child.prepaint(w, cx))`. Floating layers must
call `.occlude()` — hitboxes are paint-order only, so without it clicks on a menu row also
fire whatever sits underneath. Pick the side explicitly (`anchored_menu_above` /
`_below`) and add `.snap_to_window_with_margin(px(8.0))`.

---

## 8. Input, focus & key-context scoping

### Editing verbs are actions bound to a context, not hardcoded key matches

Declare actions in one `actions!` block, bind keys once in `init(cx)` scoped to a
`key_context`, and chain one `on_action(cx.listener(Self::method))` per action in the
widget's `render`. This keeps the keymap rebindable and lets the same handlers back menu
items.

```rust
actions!(editor, [Backspace, Left, Right, SelectAll, Copy, Cut, Paste, Undo, Redo]);
// init: cx.bind_keys([KeyBinding::new("backspace", Backspace, Some("TextInput")), ...]);
// render: div().key_context("TextInput").on_action(cx.listener(Self::backspace))...
```

### Key contexts scope meaning; the same chord can mean different things by depth

`KeyBinding::new(chord, Action, Some("Context"))` resolves against the deepest matching
`key_context` in the element tree. The same `escape` / `secondary-c` can map to different
actions at different scopes, and path syntax (`"AppRoot > TextInput"`) lets a deeper scope
override. `secondary-` abstracts Cmd (macOS) vs Ctrl (elsewhere). **Attach a context and
its `on_action` handlers conditionally** so a mode's keys exist only while its UI is open —
this is how "arrow keys navigate the popup while open, normal otherwise" works without a
global mode flag:

```rust
.when(autocomplete_open, |el| {
    el.key_context("Autocomplete").on_action(cx.listener(Self::autocomplete_next))
})
```

### Real text input = `EntityInputHandler`, not key matching

Implement `EntityInputHandler` (`text_for_range`, `selected_text_range`,
`marked_text_range`, `replace_text_in_range`, `replace_and_mark_text_in_range`) to get
IME composition (CJK, dead keys, emoji picker). Design your input event enum to
**distinguish a text edit from a caret/selection change** — caret blink and selection moves
must NOT emit `Edited` or notify parents, or every blink re-renders the tree.

### Button-like activation needs a modifier guard

A focusable `div` acting as a button should respond to click *and* bare Enter/Space, but
must check `!event.keystroke.modifiers.modified()` first, or it swallows `Cmd-Enter` /
`Shift-Space` from their real owners.

### OS file drop

`.drag_over::<ExternalPaths>(|style, ..| style.bg(wash))` for hover feedback +
`.on_drop(cx.listener(|this, paths: &ExternalPaths, ..| ...))`. The type parameter selects
which drag payload the handler responds to (external files vs internal reorder use
different payload types).

---

## 9. Gotchas checklist

Fast scan before shipping a GPUI feature:

- [ ] No I/O in `render` — everything async goes through `cx.spawn` + background executor.
- [ ] Async producers don't `notify` per-event — they feed a coalesced pump that notifies
      once per pass with a commit-rate floor.
- [ ] Stale async writes are rejected via a generation counter / fetch token.
- [ ] Looping animations use a shared self-parking clock, **not** `with_animation`.
- [ ] Sibling-reflowing motion uses a manual wall-clock tween; animation deltas are clamped
      to [0,1].
- [ ] A closed animated panel is removed from the tree, not sized to zero.
- [ ] Long lists are virtualized (`list()`), and repeated rows use domain-derived
      `ElementId`s.
- [ ] A monolithic root splits `render` into `.cached()` islands.
- [ ] Theme read via a `Global` + `Copy` accessor; appearance changes call
      `refresh_windows()` when colors are read at paint time; caches keyed on a palette
      generation.
- [ ] `WindowBounds` restored via display UUID + clamp, not raw pixels.
- [ ] `window_background` in `WindowOptions` matches the theme re-apply path (vibrancy).
- [ ] Static font weights registered (Linux variable-font axis is ignored).
- [ ] `cx.set_menus` called after the window/keymap are final; `os_action` used for
      native Edit-menu verbs.
- [ ] Floating layers `.occlude()`; `anchored()` side chosen explicitly (no auto-flip).
- [ ] Text input implements `EntityInputHandler` (IME); `Edited` distinguished from caret
      moves.
- [ ] Reduced-motion setting honored.
