# Rendering Bug Debug Reference

## Rendering Bug Mode

Activate on "PDF looks wrong", "page break issue", "font not rendering", or broken print layout. Review the CSS first, then reproduce if needed.

### WeasyPrint

- `rgba()` draws a double rectangle: use solid hex colors
- `page-break-inside: avoid` is often ignored: use explicit breaks
- Floats break at page boundaries: use flexbox or block
- External font URLs are blocked: embed fonts as base64 or host locally

### Font Loading

- Check `@font-face` src paths (relative vs. absolute)
- CORS must allow the render origin for external fonts
- WeasyPrint prefers WOFF/TTF; WOFF2 depends on version
- A missing font shows invisible text or a fallback glyph

### Page Overflow

- Compare content height with page height first
- Reduce `line-height`, `padding`, or `margin`
- `orphans: 3; widows: 3` in the `@page` body rule

### Browser Print CSS

- Confirm `@media print` rules exist and are not overridden
- `@page` margin must cover the unprintable area (~6mm minimum)
- `break-before: page` / `break-after: page` on section dividers
- Test with `window.print()` in DevTools, not only the preview
