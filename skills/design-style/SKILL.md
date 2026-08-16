---
name: design-style
description: Initialize and maintain a root DESIGN.md from the user's style brief, following the Stitch DESIGN.md specification. Use when the user runs /design-style.
disable-model-invocation: true
argument-hint: style brief
---

# Design style

User-invoked only. Do not start this skill unless the user ran `/design-style`.

Write or update `DESIGN.md` at the git repo root. The file must follow [references/specification.md](references/specification.md) (Stitch / `google-labs-code/design.md` spec). Read that file before writing tokens or sections.

## Input

The arguments after `/design-style` are the user's style brief. If they are empty, ask what look they want (audience, mood, references, constraints). Do not invent a brand they did not describe.

If `DESIGN.md` already exists, treat this as an edit: keep tokens and prose the user did not ask to change.

## Write DESIGN.md

1. YAML front matter first: `version: alpha`, `name`, then tokens (`colors`, `typography`, `rounded`, `spacing`, `components` as needed). Use `{path.to.token}` for cross-references. Omit unused token groups via `omitted` with a reason rather than leaving empty stubs.
2. Markdown body `##` sections only in spec order: Overview, Colors, Typography, Layout, Elevation & Depth, Shapes, Components, Do's and Don'ts. Skip a section only when it does not apply.
3. Tokens are normative. Prose explains why and how to apply them. Every hex or size in prose must match a token.
4. Prefer hex colors. After writing, run `npx --yes @google/design.md lint DESIGN.md` if the network/tooling allows; fix errors the linter reports.

Do not create other design files. Do not implement UI in this skill.
