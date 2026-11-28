# IME / Unicode Debugging Reference

Check these before forming a hypothesis in a webview-hosted or native macOS app.

## IME State Desync

**Symptom**: Latin characters work but CJK input is dropped, doubled, or committed at the wrong time.

**Cause candidates**:
- Input method switch mid-composition: the IME commits the preedit to a stale target, then the new mode replays the keystrokes.
- `keydown` handler consuming events during composition: suppress the confirmation event's bound submit or navigation action while preserving normal IME text commitment. Do not queue that action for `compositionend`; see the event-ordering section for when `isComposing` is already false.
- Split focus: in Tauri, the webview and the native title bar can both hold focus, so a click on a native control mid-composition commits incomplete preedit.

**Instruments**:
- Log the `compositionstart`, `compositionupdate`, `compositionend` sequence; confirm it fires in order without gaps.
- Log the `data` field of each `compositionupdate`; a sudden empty string signals a forced commit.

## Cursor Position Drift After IME Commit

**Symptom**: After confirming a CJK word, the cursor jumps or the selection collapses.

**Cause candidates**:
- DOM mutation during composition: a React, Svelte, or Vue re-render while `isComposing` is true resets the selection. Batch state updates and flush on `compositionend`.
- Mixed offset units: string lengths and DOM text offsets count UTF-16 code units, string iteration counts code points, and visible-character operations may need grapheme clusters. Convert to the receiving API's unit; swapping `str.length` for `[...str].length` can itself cause drift.

## Emoji ZWJ Sequence Splitting

**Symptom**: A multi-person or profession emoji (`👩‍🚒`) renders as separate emoji, or the ZWJ (`U+200D`) shows as a visible character.

**Cause candidates**:
- `str.slice(0, n)` at a UTF-16 offset inside the sequence. Use `Intl.Segmenter` with `granularity: 'grapheme'` for visible-character truncation.
- The font renders each code point separately. Check which font is used with `canvas.measureText` or `document.fonts`.
- A JSON encoder normalizes or escapes `U+200D`. Check the raw bytes of the stored string.

**Test**: `[...'👩‍🚒'].length` is 3 code points; `[...new Intl.Segmenter(undefined, {granularity: 'grapheme'}).segment('👩‍🚒')].length` is 1 grapheme cluster. Test offsets separately against the consuming API.

## `compositionend` / `keydown` Event Ordering

**Symptom**: The action bound to Enter or Tab fires during IME confirmation, submitting incomplete input.

**Cause candidate**: `compositionend` can come before the confirmation `keydown`, leaving `isComposing` false, or after it. Capture the actual order for the affected IME and host.

**Verification target**: IME confirmation commits text without submitting; a later deliberate Enter submits once. A flag cleared on `compositionend` has the same gap as `isComposing`. Derive the confirmation-key guard from logged key and composition events, not a timeout, and replay both orderings plus a normal Enter in regression tests.

## macOS Text System vs Webview Conflict

**Symptom**: `Cmd+Z` undoes preedit characters instead of committed words, or system text shortcuts (Cmd+Shift+Left) differ inside the webview.

**Cause**: WKWebView has its own text system. Check the host's key-handling config (Tauri's `preventDefaultFor` in `tauri.conf.json` or `app.json`, or the equivalent) for `preventDefault` rules that are too broad.

## Quick Checklist

- [ ] `isComposing` checked before acting on keyboard events?
- [ ] No DOM mutation while `isComposing` is true?
- [ ] Offset units match the receiving API, with grapheme boundaries for visible-character operations?
- [ ] ZWJ sequences verified with `Intl.Segmenter`?
- [ ] Confirmation-key guard tested against both event orderings and a later deliberate action?
- [ ] `tauri.conf.json` `preventDefaultFor` not too broad?
