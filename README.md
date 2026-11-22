# skills

Personal Agent Skills collection. Upstream skills are vendored into `skills/` so the files live in this repo. First-party skills are written here. One command installs the whole set.

## Lifecycle

The engineering skills cover a project from its rules to its fixes. Each writes one kind of file, and the next reads it.

| When | Skill | Writes |
| --- | --- | --- |
| Set the repo's rules and what it is, then record each new standing rule as it comes up | `project` | `AGENTS.md` |
| Set a long-range goal and the route to it | `polaris` | `docs/polaris/<slug>.md` |
| Cut the goal into features | `to-features` | the goal's `## Features` |
| Set how the product looks, moves, and writes, then change and audit it | `design-system` | `docs/design-system/DESIGN.md` |
| Apply the design system across the existing code (run by hand) | `design-system-adopt` | the code, in batches |
| Decide a new feature, or a change to one | `feature-new`, `feature-iterate` | `docs/feature/<slug>.md`, `docs/GLOSSARY.md` |
| Plan how the code delivers it | `to-implement-spec` | `docs/spec/<slug>.md` |
| Build it, step by step | `go-work` | commits; the spec moves to `docs/spec/archived/` |
| Review a diff during the work | `diff-review` | a report |
| Fix a bug | `code-bugfix` | the fix and the test that pins it |
| Review the architecture after some iterations | `architecture-review` | an HTML report; one refactor goes to `to-implement-spec`, a bigger direction to `polaris` |

A small piece of work starts at `feature-new` or `feature-iterate` and skips the goal.

<!-- skills-index:start -->

## First-party

| Skill | Source | Description |
| --- | --- | --- |
| [architecture-review](skills/architecture-review/SKILL.md) | `.` | Review a codebase's architecture across the whole project, typically after a stretch of iterations, against golden rules of good design: the universal rules the project skill writes into AGENTS.md (no spaghetti control flow, clear one-way layering, deep modules, effects at the edges, and so on), the repo's own Project rules, and the rules of each subsystem's domain (reads apart from writes in data processing, one writer per table in a service, one owner per state in a UI client, a small surface in a library). Judged by reading, not by metrics, then judged again for extensibility (where the next likely changes would land) and explainability (whether the code answers a newcomer's questions). Write a self-contained HTML report outside docs/ with a roadmap of improvements: one refactor goes to to-implement-spec, a direction that needs features of its own goes to polaris. Use for a periodic whole-codebase review. Not for a diff or PR review, and not for root-cause debugging. |
| [code-bugfix](skills/code-bugfix/SKILL.md) | `.` | Finds the root cause with a tight red loop before any fix. Use when something errors, crashes, regresses, is slow, or used to work. Not for a diff review, a whole-codebase architecture review, or new features. |
| [design-system](skills/design-system/SKILL.md) | `.` | Produce, iterate, and maintain the project's design system in docs/design-system/: a DESIGN.md that follows the google-labs-code/design.md spec (tokens for color, type, spacing, shape, motion, and components, with the prose that says why and how), plus the component sheets and guides it references. Creates it from the product's code, an older DESIGN.md, or a style brief; changes it when the look, a token, or a component changes; audits it against the spec and the code. Use when the user wants to set up, change, or check the project's design system or visual style (设计系统, 设计规范, 视觉风格, 换主色, 加暗色模式, DESIGN.md). Not for applying it to the existing code (design-system-adopt, run by the user), building a feature (to-implement-spec, go-work), a broken render (code-bugfix), or print documents. |
| [design-system-adopt](skills/design-system-adopt/SKILL.md) | `.` | Apply the design system in docs/design-system/ across the existing code: bring the token source in line with DESIGN.md, replace hard-coded colors, type, spacing, radii, shadows, and motion with its tokens, and give shared components the variants and states it names, in batches that keep the build and tests passing, then render to check. User-invoked only. Not for writing or changing the design system (design-system), building a new feature (to-implement-spec, go-work), or a broken render (code-bugfix). |
| [diff-review](skills/diff-review/SKILL.md) | `.` | Reviews only the diff: a PR, uncommitted changes, or a change since a fixed point. Standards against the repo and a smell baseline, spec against the originating issue. Use when asked to review a diff before merge. Not for a whole-codebase review, root-cause debugging, shipping, or prose. |
| [feature-iterate](skills/feature-iterate/SKILL.md) | `.` | Decide a change to an existing feature before it is built: load its doc and code, pin the delta and what depends on today's behavior, make the author earn it, shape every behavior the change touches by asking with recommended answers, pressure-test it, then update docs/feature/<slug>.md in place. Use when the user wants an existing feature to do more, less, or something different and the change is not decided (改一下某个功能, 扩展, 调整行为), or picks an Iterate line from a goal's ## Features. Not for a bug where the doc is right (code-bugfix), a small reversible change, or a feature that does not exist yet (feature-new). |
| [feature-new](skills/feature-new/SKILL.md) | `.` | Decide a new feature before it is built, from a one-line idea or a proposal already talked through: check that it fits the project, make the author earn it, shape every behavior a user will meet by asking with recommended answers, pressure-test it, then write docs/feature/<slug>.md and the glossary. Use when the user wants the project to do something it cannot do yet and the feature is not decided (想加一个功能, 设计一个新 feature), or picks a New line from a goal's ## Features. Not when they ask to build something already decided, for a small reversible change, or for changing an existing feature, which is feature-iterate. |
| [go-work](skills/go-work/SKILL.md) | `.` | Carry out an implement spec, docs/spec/<slug>.md, until its feature ships: a small coordinator reads the spec once, runs each step as one commit with a Spec-Step trailer in its own subagent, runs independent steps in parallel worktrees, resumes from git history, and archives the spec at the end. Use when the user asks to build, implement, continue, or resume a feature that has an open spec (开始实现, 继续做, 按 spec 实现). Not for code changes without a spec, or for writing or changing a spec, which is to-implement-spec. |
| [polaris](skills/polaris/SKILL.md) | `.` | Set a long-range goal for the project and the route to reach it: the end state and the signal that shows it, two or three routes compared, the chosen route broken into ordered parts, written to docs/polaris/<slug>.md. Also reviews an active goal's progress, route, or reached state. Use when the user describes a direction bigger than one feature (a north star, a roadmap, a new platform or kind of user, a subsystem to replace, a reliability or speed target; 目标, 方向, 路线图), or asks how a goal is going. Not for one feature, which is feature-new or feature-iterate. |
| [project](skills/project/SKILL.md) | `.` | Keep this repo's AGENTS.md: the commands, layout, and gotchas an agent cannot learn quickly from the code, built-in principles for project status, docs, commits, cleanup, and architecture, and the project's own rules, with CLAUDE.md as a symlink to it. Run the full setup when the user asks to set up or refresh the repo's agent rules (初始化项目规范, 更新 AGENTS.md). Also use it, briefly, when the user states a standing rule or preference for the whole repo in the middle of other work (以后都…, 这个项目一律…, 我们不用…): record it in one line, unless AGENTS.md already says it. Not for a choice that holds only for the current task, how a feature behaves, a personal preference, or a long-range goal. |
| [to-features](skills/to-features/SKILL.md) | `.` | Cut an active polaris goal, docs/polaris/<slug>.md, into features. Each feature is one sentence of who can do what, marked new or as a change to an existing feature, mapped to the part of the route it serves, and ordered with After. Checks that every part is covered and every feature serves a part, sizes each to fit one feature doc and one implement spec, and puts a usable slice first. After the user confirms, writes the list into the goal's ## Features. Deciding each feature is feature-new or feature-iterate. Use after polaris, or after a goal's route changed. |
| [to-implement-spec](skills/to-implement-spec/SKILL.md) | `.` | Turn a confirmed feature or change into an implement spec that guides the agent who builds it. Map every behavior in docs/feature/<slug>.md to the module that owns it, design those modules as deep modules with real interface code, place the seams, state the stored data and its migration, and order the work into one-commit steps. Writes docs/spec/<slug>.md, which stays open until the feature ships and then moves to docs/spec/archived/; durable decisions go to the feature doc and terms to docs/GLOSSARY.md. Use after feature-new or feature-iterate, or for a refactor picked from architecture-review. Not for deciding a feature, a diff review, a bug, or a whole-codebase review. |

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

## Share a file between skills

Each skill installs on its own, so a file several skills need is copied into each of them. Keep the one source in `shared/<path>`, list the skills in `catalog.json` `shared`, and run:

```bash
node scripts/cli.mjs sync --local
```

`--local` skips the remotes: it copies the shared files to `skills/<skill>/<path>` and regenerates the README and group configs. `status` marks a copy that drifted from its source, and `install` refuses until it matches.

## Add your own skill

Create `skills/<name>/SKILL.md` with `name` and `description` frontmatter. The local source in `catalog.json` is `"."` / `"*"`, so new folders are included automatically. Use `/catalog` in an agent session for the full workflow.

## Layout

```
catalog.json                 # remotes, names, groupings, and shared files
sources.lock.json            # vendored provenance (written by sync)
skills/<name>/               # the published collection
shared/<path>                # one source for a file several skills carry
.claude-plugin/marketplace.json  # CLI groups (generated)
skills.sh.json               # skills.sh groups (generated)
.agents/skills/catalog/      # repo-local meta skill
scripts/cli.mjs              # sync | status | install
third_party/                 # upstream license files
```

`catalog.json` fields: `global` (must be true), `agents` (passed to `npx skills add`), `sources[]` with `source` (`owner/repo`, git URL, or `.`) and `skills` (names, or `*` for local), and `shared[]` with `path` (relative to a skill, and to `shared/`) and `skills` (first-party names that get a copy).

Vendored work stays under its upstream license. See `NOTICE.md`.
