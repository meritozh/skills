---
name: gpui
description: GPUI framework knowledge covering actions/keybindings, async/background tasks, context management (App/Window/Context<T>/AsyncApp), custom elements (low-level Element trait), entity state management, event system, focus handling, global state, layout/styling (flexbox/CSS-like), testing, plus real-world app architecture (bootstrap, custom titlebar/window chrome, cached render islands, streaming pumps, animation clocks, IME text input) and custom rich-text/markdown rendering. Use when working with any GPUI framework concept, building or structuring GPUI desktop applications, wiring window/menu/bootstrap code, debugging re-render performance or animation, implementing custom Elements or rich text, or needing guidance on GPUI-specific APIs and patterns.
---

## Navigation

**Building or structuring a whole app?** Start with
[real-world-apps.md](references/real-world-apps.md) — production architecture patterns
(bootstrap ordering, custom titlebar, cached render islands, streaming pumps, animation
clocks, generation-guarded async) distilled from two shipping GPUI apps. It's the map for
"how do experienced teams wire this together," which the API-focused files below don't
cover. For custom rich-text/markdown surfaces, see
[rich-text-and-paint.md](references/rich-text-and-paint.md).

Load the relevant reference file based on the task:

| Topic | File | When to load |
|-------|------|--------------|
| Actions & keybindings | [action.md](references/action.md) | `actions!`, `bind_keys`, `on_action`, `key_context` |
| Async & background tasks | [async.md](references/async.md) | `cx.spawn`, `background_spawn`, `Task`, async I/O |
| Context management | [context.md](references/context.md) | `App`, `Window`, `Context<T>`, `AsyncApp` |
| Custom elements (low-level) | [element.md](references/element.md) | `Element` trait, `request_layout`, `prepaint`, `paint` |
| Entity state | [entity.md](references/entity.md) | `Entity<T>`, `WeakEntity`, state management |
| Events & subscriptions | [event.md](references/event.md) | `cx.emit`, `cx.subscribe`, `cx.observe` |
| Focus & keyboard nav | [focus-handle.md](references/focus-handle.md) | `FocusHandle`, `track_focus`, Tab navigation |
| Global state | [global.md](references/global.md) | `Global` trait, `cx.set_global`, app-wide config |
| Layout & styling | [layout-style.md](references/layout-style.md) | `div()`, `h_flex()`, `v_flex()`, flexbox, overflow, positioning |
| ElementId | [element-id.md](references/element-id.md) | `ElementId`, `.id()`, uniqueness rules, stateful elements |
| Testing | [test.md](references/test.md) | `#[gpui::test]`, `TestAppContext`, `VisualTestContext` |

## Extended References

For deep-dive topics, additional reference files are available:

**Element trait:**
- [element-api.md](references/element-api.md) — complete API, hitbox system, event handling
- [element-patterns.md](references/element-patterns.md) — text, interactive, container, composite patterns
- [element-examples.md](references/element-examples.md) — full examples: text, interactive, complex elements
- [element-best-practices.md](references/element-best-practices.md) — performance, state, common pitfalls
- [element-advanced.md](references/element-advanced.md) — masonry/circular layouts, async updates, virtual lists

**Entity management:**
- [entity-api.md](references/entity-api.md) — complete Entity API, methods, lifecycle
- [entity-patterns.md](references/entity-patterns.md) — model-view, cross-entity communication, observer
- [entity-best-practices.md](references/entity-best-practices.md) — memory, performance, lifecycle
- [entity-advanced.md](references/entity-advanced.md) — collections, registry, debounce, state machines

**Testing:**
- [test-examples.md](references/test-examples.md) — testing examples and patterns
- [test-reference.md](references/test-reference.md) — complete testing API reference

**Real-world application patterns** (distilled from shipping GPUI apps):
- [real-world-apps.md](references/real-world-apps.md) — bootstrap & window setup, custom titlebar/chrome, root-view & cached render islands, app-scale state, streaming event pumps, self-parking animation clocks, custom Elements, IME input & key-context scoping, a pre-ship gotchas checklist
- [rich-text-and-paint.md](references/rich-text-and-paint.md) — custom markdown/rich-text: syntax highlighting without reflow, streaming fade veils, flatten/shape caching, cross-tree selection, tables via the layout engine, rounded washes with `canvas()`
