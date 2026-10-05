# skills

Personal Agent Skills collection. Upstream skills are vendored into `skills/` so the files live in this repo. First-party skills are written here. One command installs the whole set.

<!-- skills-index:start -->

## First-party

| Skill | Source | Description |
| --- | --- | --- |
| [design-style](skills/design-style/SKILL.md) | `.` | Initialize and maintain a root DESIGN.md from the user's style brief, following the Stitch DESIGN.md specification. Use when the user runs /design-style. |
| [gpui](skills/gpui/SKILL.md) | `.` | GPUI framework knowledge covering actions/keybindings, async/background tasks, context management (App/Window/Context<T>/AsyncApp), custom elements (low-level Element trait), entity state management, event system, focus handling, global state, layout/styling (flexbox/CSS-like), testing, plus real-world app architecture (bootstrap, custom titlebar/window chrome, cached render islands, streaming pumps, animation clocks, IME text input) and custom rich-text/markdown rendering. Use when working with any GPUI framework concept, building or structuring GPUI desktop applications, wiring window/menu/bootstrap code, debugging re-render performance or animation, implementing custom Elements or rich text, or needing guidance on GPUI-specific APIs and patterns. |
| [gpui-component](skills/gpui-component/SKILL.md) | `.` | How to use the gpui-component UI library in GPUI applications, and the normative Design and Coding Guides that govern it. Use when building UIs with gpui-component components (Button, Input, Select, Dialog, Tabs, Sidebar, List, Table, etc.), setting up the library, handling component state or theming, finding the right component for a UI need, and also when designing layouts, spacing, visual hierarchy, or interaction states, writing interface copy, or making application architecture, state-ownership, or public API decisions. |
| [iterate](skills/iterate/SKILL.md) | `.` | Run an exclusive feature, fix, refactor, note, or general planning workflow and write the result under docs/. Use when the user runs /iterate. |
| [project](skills/project/SKILL.md) | `.` | Manage this repo's project status in CONTEXT.md. Only accepts init, startup, release-solo, or release. Use when the user runs /project. |

## Vendored

| Skill | Source | Description |
| --- | --- | --- |
| [check](skills/check/SKILL.md) | [tw93/Waza](https://github.com/tw93/Waza) | Reviews diffs, PRs, release readiness, and publishing follow-through. Use when asked to review, triage issues or PRs, or ship. Not for debugging root causes or prose. |
| [code-review](skills/code-review/SKILL.md) | [mattpocock/skills](https://github.com/mattpocock/skills) | Review the changes since a fixed point (commit, branch, tag, or merge-base) along two axes: Standards (does the code follow this repo's documented coding standards?) and Spec (does the code match what the originating issue/spec asked for?). Runs both reviews in parallel sub-agents and reports them side by side. Use when the user wants to review a branch, a PR, work-in-progress changes, or asks to "review since X". |
| [codebase-design](skills/codebase-design/SKILL.md) | [mattpocock/skills](https://github.com/mattpocock/skills) | Shared vocabulary for designing deep modules. Use when the user wants to design or improve a module's interface, find deepening opportunities, decide where a seam goes, make code more testable or AI-navigable, or when another skill needs the deep-module vocabulary. |
| [convince-me](skills/convince-me/SKILL.md) | [rahul-kulkarni105/skills](https://github.com/rahul-kulkarni105/skills) | Force the user to justify their choice. Use when the user has stated a decision and you want to test whether it's reasoned or reflexive. Produces a Socratic exchange that exposes the actual reasoning (or its absence). |
| [diagnosing-bugs](skills/diagnosing-bugs/SKILL.md) | [mattpocock/skills](https://github.com/mattpocock/skills) | Diagnosis loop for hard bugs and performance regressions. Use when the user says "diagnose"/"debug this", or reports something broken/throwing/failing/slow. |
| [domain-modeling](skills/domain-modeling/SKILL.md) | [mattpocock/skills](https://github.com/mattpocock/skills) | Build and sharpen a project's domain model. Use when discussing codebase terminology, writing or editing a GLOSSARY.md, or recording or editing an ADR. |
| [grill-me](skills/grill-me/SKILL.md) | [rahul-kulkarni105/skills](https://github.com/rahul-kulkarni105/skills) | Aggressively challenge the user's plan, design, or claim. Use when the user says "grill me", "poke holes", "stress test", "challenge this", or otherwise invites adversarial scrutiny. Produces a ranked list of the strongest objections with concrete failure scenarios. |
| [health](skills/health/SKILL.md) | [tw93/Waza](https://github.com/tw93/Waza) | Audits agent config, instruction drift, hooks or MCP, and AI maintainability. Use when Claude, Codex, or Pi setup looks wrong. Not for application bugs or PR review. |
| [hunt](skills/hunt/SKILL.md) | [tw93/Waza](https://github.com/tw93/Waza) | Finds root cause before any fix. Use when something errors, crashes, regresses, or used to work. Not for code review or new features. |
| [improve-codebase-architecture](skills/improve-codebase-architecture/SKILL.md) | [mattpocock/skills](https://github.com/mattpocock/skills) | Scan a codebase for deepening opportunities, present them as a visual HTML report, then grill through whichever one you pick. |
| [kami](skills/kami/SKILL.md) | [tw93/kami](https://github.com/tw93/kami) | Typeset professional documents with Kami templates: resumes, one-pagers, white papers, letters, portfolios, and slide decks. Use when asked to 做 PDF / 排版 / 简历 / 一页纸 / PPT / slides, or to create a Kami landing page. Not for auditing or restyling an existing product site. |
| [kill-ai-slop](skills/kill-ai-slop/SKILL.md) | [yetone/kill-ai-slop](https://github.com/yetone/kill-ai-slop) | Find and remove AI slop — the generic, machine-default visual and copy tics of vibe-coded products — from a web project. Use when the user asks to "kill AI slop", "de-slop", "remove the AI look", "make this not look AI-generated", or clean up a landing page / UI / docs that feels templated. Detects and fixes the catalogue of tells: indigo→violet gradients, gradient-clip headlines, the default semantic palette, one-hue status boxes, atmospheric gradients, serif-italic emphasis, highlighted keywords, AI copywriting voice ("not just X — it's Y"), emoji everywhere, glowing status dots, wobbling spinners, colored-left-border callouts, pastel icon tiles, glassmorphism, over-rounding, oversized shadows, borders that die at corners, badge & pill spam, AI-drawn SVG icons, kickers over every heading, flat type hierarchies, invented stat rows, 01/02/03 section markers, cards nested in cards, the default Inter/Space Grotesk look, and more. Works on HTML/CSS, React/Vue/Svelte/Astro, Tailwind, PHP, and Markdown copy. |
| [learn](skills/learn/SKILL.md) | [tw93/Waza](https://github.com/tw93/Waza) | Runs a six-phase research workflow from source bundle to publish-ready output. Use when researching an unfamiliar domain or compiling materials into one reference. Not for quick lookups or single-file reads. |
| [pre-mortem](skills/pre-mortem/SKILL.md) | [rahul-kulkarni105/skills](https://github.com/rahul-kulkarni105/skills) | Imagine the project shipped and failed; explain why. Use before committing to a plan, design, or launch. Produces a vivid post-mortem dated in the future, working backwards from failure to its root causes. |
| [prototype](skills/prototype/SKILL.md) | [mattpocock/skills](https://github.com/mattpocock/skills) | Build a throwaway prototype to answer a design question. Use when the user wants to sanity-check whether a state model or logic feels right, or explore what a UI should look like. |
| [read](skills/read/SKILL.md) | [tw93/Waza](https://github.com/tw93/Waza) | Fetches URLs and PDFs, then summarizes or returns clean Markdown. Use when asked to read, fetch, quote, cite, convert, or save a URL or PDF. Not for local text files already in the repo. |
| [research](skills/research/SKILL.md) | [mattpocock/skills](https://github.com/mattpocock/skills) | Investigate a question against high-trust primary sources and capture the findings as a Markdown file in the repo. Use when the user wants a topic researched, docs or API facts gathered, or reading legwork delegated to a background agent. |
| [steelman](skills/steelman/SKILL.md) | [rahul-kulkarni105/skills](https://github.com/rahul-kulkarni105/skills) | Build the strongest version of an opposing view or rejected option. Use when the user has dismissed an alternative and you want to test that dismissal honestly. Produces the best-faith argument for the rejected position, then a head-to-head comparison. |
| [tdd](skills/tdd/SKILL.md) | [mattpocock/skills](https://github.com/mattpocock/skills) | Test-driven development. Use when the user wants to build features or fix bugs test-first, mentions "red-green-refactor", or wants integration tests. |
| [think](skills/think/SKILL.md) | [tw93/Waza](https://github.com/tw93/Waza) | Turns rough ideas into approved, decision-complete plans before coding. Use when planning architecture, judging whether to build, or writing a handoff. Not for bug fixes or small edits. |
| [ui](skills/ui/SKILL.md) | [tw93/Waza](https://github.com/tw93/Waza) | Produces distinctive production UI and screenshot-grounded visual polish. Use when building or restyling pages, components, or typography. Not for backend logic or data pipelines. |
| [wayfinder](skills/wayfinder/SKILL.md) | [mattpocock/skills](https://github.com/mattpocock/skills) | Plan a huge chunk of work (more than one agent session can hold) as a shared map of decision tickets on your issue tracker, and resolve them one at a time until the way to the destination is clear. |
| [weak-spots](skills/weak-spots/SKILL.md) | [rahul-kulkarni105/skills](https://github.com/rahul-kulkarni105/skills) | Enumerate failure modes and blind spots in a plan, design, or piece of code. Use when the user wants a structured audit ("where could this break", "what am I missing", "weak spots"). Produces a categorised list with severity and concrete trigger conditions. |
| [weread-skills](skills/weread-skills/SKILL.md) | [Tencent/WeChatReading](https://github.com/Tencent/WeChatReading) | 微信读书助手 — 搜索书籍、管理书架、查看笔记划线、浏览书评、阅读统计、发现推荐好书 |
| [write](skills/write/SKILL.md) | [tw93/Waza](https://github.com/tw93/Waza) | Rewrites and polishes Chinese or English prose and product copy. Use when drafting, editing, localizing, or cutting AI tone. Not for code comments or commit messages. |

_Generated by `node scripts/cli.mjs sync`. Do not edit these tables by hand._

<!-- skills-index:end -->

## Install

From a checkout:

```bash
npx skills add . -g -y
```

Or:

```bash
node scripts/cli.mjs install
```

That installs every skill under `skills/` into the shared `~/.agents/skills` store (Claude Code, Codex, and Cursor get agent-specific links). Grok reads that store already.

## Refresh remotes

Edit `catalog.json`, then:

```bash
node scripts/cli.mjs sync --dry-run
node scripts/cli.mjs sync
node scripts/cli.mjs status
```

`sync` clones each remote, copies the named skill folders into `skills/<name>/`, records commits in `sources.lock.json`, and deletes vendored skills that left the catalog. First-party skills are left alone.

## Add your own skill

Create `skills/<name>/SKILL.md` with `name` and `description` frontmatter. The local source in `catalog.json` is `"."` / `"*"`, so new folders are included automatically. Use `/catalog` in an agent session for the full workflow.

## Layout

```
catalog.json                 # remotes, names, and groupings
sources.lock.json            # vendored provenance (written by sync)
skills/<name>/               # the published collection
.claude-plugin/marketplace.json  # CLI groups (generated)
skills.sh.json               # skills.sh groups (generated)
.agents/skills/catalog/      # repo-local meta skill
scripts/cli.mjs              # sync | status | install
third_party/                 # upstream license files
```

`catalog.json` fields: `global` (must be true), `agents` (passed to `npx skills add`), `sources[]` with `source` (`owner/repo`, git URL, or `.`) and `skills` (names, or `*` for local).

Vendored work stays under its upstream license. See `NOTICE.md`.
