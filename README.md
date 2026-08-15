# skills

Personal Agent Skills collection. Upstream skills are vendored into `skills/` so the files live in this repo. First-party skills are written here. One command installs the whole set.

<!-- skills-index:start -->

## First-party

_None._

## Vendored

| Skill | Source | Description |
| --- | --- | --- |
| [ask-matt](skills/ask-matt/SKILL.md) | [mattpocock/skills](https://github.com/mattpocock/skills) | Ask which skill or flow fits your situation. A router over the skills in this repo. |
| [check](skills/check/SKILL.md) | [tw93/Waza](https://github.com/tw93/Waza) | Reviews code diffs, PRs, issue queues, release readiness, commits, pushes, publishing, and project audits. Use when users ask in any language for code review, issue or PR triage, release gates, publishing follow-through, or project audits. Not for debugging root causes or prose review. |
| [code-review](skills/code-review/SKILL.md) | [mattpocock/skills](https://github.com/mattpocock/skills) | Review the changes since a fixed point (commit, branch, tag, or merge-base) along two axes — Standards (does the code follow this repo's documented coding standards?) and Spec (does the code match what the originating issue/spec asked for?). Runs both reviews in parallel sub-agents and reports them side by side. Use when the user wants to review a branch, a PR, work-in-progress changes, or asks to "review since X". |
| [codebase-design](skills/codebase-design/SKILL.md) | [mattpocock/skills](https://github.com/mattpocock/skills) | Shared vocabulary for designing deep modules. Use when the user wants to design or improve a module's interface, find deepening opportunities, decide where a seam goes, make code more testable or AI-navigable, or when another skill needs the deep-module vocabulary. |
| [diagnosing-bugs](skills/diagnosing-bugs/SKILL.md) | [mattpocock/skills](https://github.com/mattpocock/skills) | Diagnosis loop for hard bugs and performance regressions. Use when the user says "diagnose"/"debug this", or reports something broken/throwing/failing/slow. |
| [domain-modeling](skills/domain-modeling/SKILL.md) | [mattpocock/skills](https://github.com/mattpocock/skills) | Build and sharpen a project's domain model. Use when discussing codebase terminology, writing or editing a CONTEXT.md, or recording or editing an ADR. |
| [grilling](skills/grilling/SKILL.md) | [mattpocock/skills](https://github.com/mattpocock/skills) | Grill the user relentlessly about a plan, decision, or idea. Use when the user wants to stress-test their thinking, or uses any 'grill' trigger phrases. |
| [health](skills/health/SKILL.md) | [tw93/Waza](https://github.com/tw93/Waza) | Runs a budget-aware agent-assisted engineering health audit for instruction/config drift, hooks/MCP, verifier surfaces, and AI maintainability. Use when users ask in any language to audit Claude, Codex, Pi, agent instructions, MCP or hooks, verifier coverage, or AI-maintainability drift. Not for debugging application code or reviewing PRs. |
| [hunt](skills/hunt/SKILL.md) | [tw93/Waza](https://github.com/tw93/Waza) | Finds root cause before applying fixes for errors, crashes, regressions, failing tests, broken behavior, and screenshot-reported defects. Use when users report in any language errors, crashes, broken behavior, regressions, failing tests, screenshot evidence, or something that used to work and now fails. Not for code review or new features. |
| [improve-codebase-architecture](skills/improve-codebase-architecture/SKILL.md) | [mattpocock/skills](https://github.com/mattpocock/skills) | Scan a codebase for deepening opportunities, present them as a visual HTML report, then grill through whichever one you pick. |
| [kami](skills/kami/SKILL.md) | [tw93/kami](https://github.com/tw93/kami) | Typeset professional documents and product landing pages: resumes, one-pagers, white papers, letters, portfolios, slide decks, landing pages. Warm parchment, ink-blue accent, serif-led hierarchy. CN uses TsangerJinKai02, EN uses Charter, JA uses YuMincho (best-effort). Triggers on "做 PDF / 排版 / 一页纸 / 白皮书 / 作品集 / 简历 / PPT / slides / Marp / markdown slides / マークダウンのスライド / 落地页 / 官网 / landing page / product page", or "build me a resume / make a one-pager / design a slide deck / turn this into a PDF / make this presentable / create a landing page". |
| [kill-ai-slop](skills/kill-ai-slop/SKILL.md) | [yetone/kill-ai-slop](https://github.com/yetone/kill-ai-slop) | Find and remove AI slop — the generic, machine-default visual and copy tics of vibe-coded products — from a web project. Use when the user asks to "kill AI slop", "de-slop", "remove the AI look", "make this not look AI-generated", or clean up a landing page / UI / docs that feels templated. Detects and fixes the catalogue of tells: indigo→violet gradients, gradient-clip headlines, the default semantic palette, one-hue status boxes, atmospheric gradients, serif-italic emphasis, highlighted keywords, AI copywriting voice ("not just X — it's Y"), emoji everywhere, glowing status dots, wobbling spinners, colored-left-border callouts, pastel icon tiles, glassmorphism, over-rounding, oversized shadows, borders that die at corners, badge & pill spam, AI-drawn SVG icons, kickers over every heading, flat type hierarchies, invented stat rows, 01/02/03 section markers, cards nested in cards, the default Inter/Space Grotesk look, and more. Works on HTML/CSS, React/Vue/Svelte/Astro, Tailwind, PHP, and Markdown copy. |
| [learn](skills/learn/SKILL.md) | [tw93/Waza](https://github.com/tw93/Waza) | Runs a six-phase research workflow that turns unfamiliar domains, source bundles, or collected material into publish-ready output. Use when users ask in any language to research, study, deep-dive, compile sources, synthesize unfamiliar material, or turn a source bundle into a coherent reference. Not for quick lookups or single-file reads. |
| [prototype](skills/prototype/SKILL.md) | [mattpocock/skills](https://github.com/mattpocock/skills) | Build a throwaway prototype to answer a design question. Use when the user wants to sanity-check whether a state model or logic feels right, or explore what a UI should look like. |
| [read](skills/read/SKILL.md) | [tw93/Waza](https://github.com/tw93/Waza) | Reads URLs and PDFs by fetching source content, defaulting to concise summaries for plain read requests and clean Markdown when asked to convert, save, quote, cite, or feed downstream work. Use when users ask in any language to read, fetch, check, summarize, quote, cite, convert, or save a URL or PDF. Not for local text files already in the repo. |
| [research](skills/research/SKILL.md) | [mattpocock/skills](https://github.com/mattpocock/skills) | Investigate a question against high-trust primary sources and capture the findings as a Markdown file in the repo. Use when the user wants a topic researched, docs or API facts gathered, or reading legwork delegated to a background agent. |
| [setup-matt-pocock-skills](skills/setup-matt-pocock-skills/SKILL.md) | [mattpocock/skills](https://github.com/mattpocock/skills) | Configure this repo for the engineering skills — set up its issue tracker, triage label vocabulary, and domain doc layout. Run once before first use of the other engineering skills. |
| [tdd](skills/tdd/SKILL.md) | [mattpocock/skills](https://github.com/mattpocock/skills) | Test-driven development. Use when the user wants to build features or fix bugs test-first, mentions "red-green-refactor", or wants integration tests. |
| [think](skills/think/SKILL.md) | [tw93/Waza](https://github.com/tw93/Waza) | Turns rough ideas into approved, decision-complete plans with validated structure before coding. Use when users ask in any language for planning, architecture, design direction, feasibility, value judgment, or whether a feature is worth doing before implementation. Not for bug fixes or small edits. |
| [to-spec](skills/to-spec/SKILL.md) | [mattpocock/skills](https://github.com/mattpocock/skills) | Turn the current conversation into a spec and publish it to the project issue tracker — no interview, just synthesis of what you've already discussed. |
| [triage](skills/triage/SKILL.md) | [mattpocock/skills](https://github.com/mattpocock/skills) | Move issues and external PRs through a state machine of triage roles — categorise, verify, grill if needed, and write agent-ready briefs. |
| [ui](skills/ui/SKILL.md) | [tw93/Waza](https://github.com/tw93/Waza) | Produces distinctive, production-grade UI for pages, components, visual interfaces, typography, and screenshot-driven polish. Use when users ask in any language for UI, page, component, frontend, typography, screenshot-grounded visual polish, or complaints that a screen looks unclear, ugly, inconsistent, or visually wrong. Not for backend logic or data pipelines. |
| [wayfinder](skills/wayfinder/SKILL.md) | [mattpocock/skills](https://github.com/mattpocock/skills) | Plan a huge chunk of work — more than one agent session can hold — as a shared map of decision tickets on your issue tracker, and resolve them one at a time until the way to the destination is clear. |
| [weread-skills](skills/weread-skills/SKILL.md) | [Tencent/WeChatReading](https://github.com/Tencent/WeChatReading) | 微信读书助手 — 搜索书籍、管理书架、查看笔记划线、浏览书评、阅读统计、发现推荐好书 |
| [write](skills/write/SKILL.md) | [tw93/Waza](https://github.com/tw93/Waza) | Rewrites and polishes prose in Chinese or English, removes AI-like wording, and reviews product localization copy while preserving intent for drafts, docs, release notes, launch copy, and social posts. Use when users ask in any language to draft, rewrite, proofread, localize, polish release notes, remove AI-like wording, or prepare launch and social copy. Not for code comments, commit messages, or inline docs. |

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
catalog.json                 # which remotes, which names
sources.lock.json            # vendored provenance (written by sync)
skills/<name>/               # the published collection
.agents/skills/catalog/      # repo-local meta skill
scripts/cli.mjs              # sync | status | install
third_party/                 # upstream license files
```

`catalog.json` fields: `global` (must be true), `agents` (passed to `npx skills add`), `sources[]` with `source` (`owner/repo`, git URL, or `.`) and `skills` (names, or `*` for local).

Vendored work stays under its upstream license. See `NOTICE.md`.
