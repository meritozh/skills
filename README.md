# skills

Personal Agent Skills collection. Upstream skills are vendored into `skills/` so the files live in this repo. First-party skills are written here. One command installs the whole set.

<!-- skills-index:start -->

## First-party

| Skill | Source | Description |
| --- | --- | --- |
| [code-fix](skills/code-fix/SKILL.md) | `.` | Finds the root cause with a tight red loop before any fix. Use when something errors, crashes, regresses, is slow, or used to work. Not for a diff review, a whole-codebase architecture review, or new features. |
| [codebase-review](skills/codebase-review/SKILL.md) | `.` | Review any codebase by what its real changes cost and what its failures leave behind, measured against its own shape, history, and claims. Write a self-contained HTML report outside docs/. Use for a whole-codebase review. Not for a diff or PR review, and not for root-cause debugging. |
| [design-ui](skills/design-ui/SKILL.md) | `.` | Produces distinctive production UI, screenshot-grounded visual polish, and a root DESIGN.md in the Stitch format. Use when building or restyling pages, components, or typography, or when asked to write or update DESIGN.md from a style brief. Not for backend logic, data pipelines, or shippable print documents. |
| [diff-review](skills/diff-review/SKILL.md) | `.` | Reviews only the diff: a PR, uncommitted changes, or a change since a fixed point. Standards against the repo and a smell baseline, spec against the originating issue. Use when asked to review a diff before merge. Not for a whole-codebase review, root-cause debugging, shipping, or prose. |
| [feature-iterate](skills/feature-iterate/SKILL.md) | `.` | Move an existing feature forward. Load its doc and its code as they stand, pin what changes against what must not and what depends on today's behavior, align the words with docs/GLOSSARY.md, then make the author earn the change, steelman the option they rejected (by default, leaving the feature as it is), and grill the change where it meets today's callers, users, and data. After the user confirms, update docs/feature/<slug>.md in place and the glossary. Use when the user wants to change, extend, or narrow a feature that exists. A feature that does not exist yet is feature-new. |
| [feature-new](skills/feature-new/SKILL.md) | `.` | Decide a new feature before it is built. Check that it fits what the project says it is and that nothing already covers it, align its words with docs/GLOSSARY.md, then make the author earn the choice, steelman the option they rejected, and grill the strongest version. After the user confirms, write docs/feature/<slug>.md and update the glossary. Use when the user wants the project to do something it cannot do yet. Changing an existing feature is feature-iterate. |
| [go-work](skills/go-work/SKILL.md) | `.` | Carry out an implement spec, docs/spec/<slug>.md, until its feature ships. A coordinator reads the spec once and never edits it, hands each step to a subagent that lands it as one commit with a Spec-Step trailer, runs steps the spec marks independent in parallel in temporary worktrees, and resumes from git history. The commit that lands the last step sets the feature to shipped and archives the spec. Use after to-implement-spec. Not for writing or changing a spec, deciding a feature, a bug, or a review. |
| [project](skills/project/SKILL.md) | `.` | Initialize or update this repo's AGENTS.md by reading the repo, then asking the user what it cannot tell — status, the check before commit, boundaries, gotchas, and project rules. Writes the repo's commands and layout plus built-in principles for project status, docs, small local commits, cleanup, and architecture, and makes CLAUDE.md a symlink to it. Use when the user runs /project. |
| [to-implement-spec](skills/to-implement-spec/SKILL.md) | `.` | Turn a confirmed feature or change into an implement spec that guides the agent who builds it. Map every behavior in docs/feature/<slug>.md to the module that owns it, design those modules as deep modules with real interface code, place the seams, state the stored data and its migration, and order the work into one-commit steps. Writes docs/spec/<slug>.md, which stays open until the feature ships and then moves to docs/spec/archived/; durable decisions go to the feature doc and terms to docs/GLOSSARY.md. Use after feature-new or feature-iterate, or for a refactor picked from codebase-review. Not for deciding a feature, a diff review, a bug, or a whole-codebase review. |

## Vendored

| Skill | Source | Description |
| --- | --- | --- |
| [health](skills/health/SKILL.md) | [tw93/Waza](https://github.com/tw93/Waza) | Audits or prunes agent config, instruction drift, hooks or MCP, and AI maintainability. Use when Claude, Codex, or Pi setup looks wrong or guidance needs slimming. Not for application bugs or PR review. |
| [kami](skills/kami/SKILL.md) | [tw93/kami](https://github.com/tw93/kami) | Typeset professional documents with Kami templates: resumes, one-pagers, white papers, letters, portfolios, slide decks, and social media cards. Use when asked to 做 PDF / 排版 / 简历 / 一页纸 / PPT / slides / 小红书配图, or to create a Kami landing page. Not for auditing or restyling an existing product site. |
| [learn](skills/learn/SKILL.md) | [tw93/Waza](https://github.com/tw93/Waza) | Runs a six-phase research workflow from source bundle to publish-ready output. Use when researching an unfamiliar domain or compiling materials into one reference. Not for quick lookups or single-file reads. |
| [read](skills/read/SKILL.md) | [tw93/Waza](https://github.com/tw93/Waza) | Fetches URLs and PDFs, then summarizes or returns clean Markdown; can also search the web through DeepSeek when built-in search is thin. Use when asked to read, fetch, quote, cite, convert, or save a URL or PDF. Not for local text files already in the repo. |
| [write](skills/write/SKILL.md) | [tw93/Waza](https://github.com/tw93/Waza) | Rewrites and polishes Chinese or English prose, technical instructions, and product copy. Use when drafting, editing, localizing, or cutting AI tone. Not for code comments or commit messages. |

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
