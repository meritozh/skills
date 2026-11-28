# skills

Personal Agent Skills collection. Every skill is written and maintained here, under `skills/`. One command installs the whole set.

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
| Answer a design question with throwaway code before deciding it | `prototype` | a `prototype/<slug>` branch and a verdict |
| Plan how the code delivers it | `to-implement-spec` | `docs/spec/<slug>.md` |
| Shape a change that has no spec before coding it, then hold the code to that shape | `architect`; `arena` when the design is large or contested | the skeleton, then the code; `arena` adds a synthesis note |
| Battle the goal, feature doc, or spec with a strict reviewer before it is built | `batman` | fixes in the goal or feature doc; feature lines go back to `to-features`, spec fixes to `to-implement-spec` |
| Build it, step by step | `go-work` | commits; the spec moves to `docs/spec/archived/` |
| Review a diff during the work | `diff-review` | a report |
| Write the PR, with a visual summary, evidence, and merge danger | `pr`, which calls `show-me` | the PR title and body |
| Fix a bug | `code-bugfix` | the fix and the test that pins it |
| Jot down an idea outside the current work, then digest the notes into goals, features, and specs | `note` | `docs/NOTES.md` |
| Write or rewrite any of these docs, a PR body, or a commit message so it reads right the first time, and cut AI tells | `technical-writing`, which runs `unslop` | the doc, rewritten in its mode |
| Review the architecture after some iterations | `architecture-review` | an HTML report; one refactor goes to `to-implement-spec`, a bigger direction to `polaris` |

A small piece of work starts at `feature-new` or `feature-iterate` and skips the goal. A clear technical change, such as a dependency upgrade, starts at `to-implement-spec` with `Feature: none`.

In T3 Code, `rpi` (recursive project iterate) runs the chain from the first conversation to the PR: this session decides and writes the docs, astra (the Codex astra model) battles each doc with `batman`, builds with `go-work`, and reviews with `diff-review`, a failure at any stage sends the work back to the doc that must change, and every move between stages waits for your answer.

Every doc these skills write states what is true, in the present tense: a goal explains, a feature doc is reference, and a spec is a how-to. None of them is a meeting record or a roadmap. `technical-writing` holds the rules, and each skill runs it before a doc leaves it.

`show-me` draws the smallest visual that makes a point. Use it on its own, or through `pr` (the Summary) and `architect` (the two shapes).

<!-- skills-index:start -->

## Skills

| Skill | Description |
| --- | --- |
| [architect](skills/architect/SKILL.md) | Design the shape of a non-trivial change before writing code: trace every part of the system it touches, sketch two different shapes as real types, signatures, and module boundaries, pick the one where each piece of state has one owner, each task has one way to do it, and callers need to know least, then write that skeleton and stay with the implementation, redesigning instead of patching when workarounds repeat. Use when the user runs /architect or asks to architect or design a change before coding (先设计再写, 设计一下结构). Not for a documented feature that needs an implement spec (to-implement-spec), a large or contested design (arena), a question that has to be felt (prototype), or a whole-codebase review (architecture-review). |
| [architecture-review](skills/architecture-review/SKILL.md) | Review a codebase's architecture across the whole project, typically after a stretch of iterations, against golden rules of good design: the universal rules the project skill writes into AGENTS.md (no spaghetti control flow, clear one-way layering, deep modules, effects at the edges), the repo's own Project rules, and each subsystem's domain rules (reads apart from writes in data processing, one writer per table in a service, one owner per state in a UI client, a small surface in a library). Judged by reading, not by metrics, then for extensibility (where the next likely changes land) and explainability (whether the code answers a newcomer's questions). Writes a self-contained HTML report outside docs/ with ranked directions: one refactor goes to to-implement-spec, a direction that needs features of its own goes to polaris. Use for a periodic whole-codebase review. Not for a diff or PR review, and not for root-cause debugging. |
| [arena](skills/arena/SKILL.md) | Run several independent candidates at the same task in parallel, each in its own worktree or directory, then judge them against a rubric fixed before any of them started, with a cross-judge from another model family when the harness has one; pick the strongest as the base, graft the best parts of the others into it by hand, and verify the result. Use when the user runs /arena or asks to throw a task into the arena, or when one attempt at a non-trivial artifact (a design, an interface, an algorithm, a document) would lock in the wrong shape. Costs one agent per candidate plus a judge. Not for a small change, a bug (code-bugfix), or a design one sketch can settle (architect). |
| [batman](skills/batman/SKILL.md) | Battle a goal, a feature doc, or an implement spec before anyone builds from it. Batman, the battle man, is a strict reviewer with fresh eyes: it reads docs/polaris/<slug>.md, docs/feature/<slug>.md, or docs/spec/<slug>.md as a builder who was not in the room, checks every claim against the code, glossary, and other docs, and raises objections that each quote a line and show where it breaks. The author concedes or answers each with evidence, batman presses once, and the user rules on what is left. Agreed fixes go into the goal or feature doc; spec fixes go back to to-implement-spec. Use after polaris, to-features, feature-new, feature-iterate, or to-implement-spec (battle 一下, 挑刺, 严格审这个目标、doc 或 spec). Not for deciding a feature, a diff review, a whole-codebase review, or polishing prose. |
| [code-bugfix](skills/code-bugfix/SKILL.md) | Finds the root cause with a tight red loop before any fix. Use when something errors, crashes, regresses, is slow, or used to work. Not for a diff review, a whole-codebase architecture review, or new features. |
| [design-system](skills/design-system/SKILL.md) | Produce, iterate, and maintain the project's design system in docs/design-system/: a DESIGN.md that follows the google-labs-code/design.md spec (tokens for color, type, spacing, shape, motion, and components, with prose saying why and how), plus the component sheets and guides it references. Creates it from the product's code, an older DESIGN.md, or a style brief; changes it when the look, a token, or a component changes; audits it against the spec and the code. Use when the user wants to set up, change, or check the project's design system or visual style (设计系统, 设计规范, 视觉风格, 换主色, 加暗色模式, DESIGN.md). Not for applying it to the existing code (design-system-adopt, run by the user), building a feature (to-implement-spec, go-work), a broken render (code-bugfix), or print documents. |
| [design-system-adopt](skills/design-system-adopt/SKILL.md) | Apply the design system in docs/design-system/ across the existing code: bring the token source in line with DESIGN.md, replace hard-coded colors, type, spacing, radii, shadows, and motion with its tokens, and give shared components the variants and states it names, in batches that keep the build and tests passing, then render to check. User-invoked only. Not for writing or changing the design system (design-system), building a new feature (to-implement-spec, go-work), or a broken render (code-bugfix). |
| [diff-review](skills/diff-review/SKILL.md) | Reviews only the diff: a PR, uncommitted changes, or a change since a fixed point. Standards against the repo and a smell baseline, spec against the originating issue. Use when asked to review a diff before merge. Not for a whole-codebase review, root-cause debugging, shipping, or prose. |
| [feature-iterate](skills/feature-iterate/SKILL.md) | Decide a change to an existing feature before it is built: research today's behavior and what depends on it, pin the change from today to after, choose the approach when there is more than one, and settle every behavior and dependent the change touches by asking with recommended answers, updating docs/feature/<slug>.md in place, as a draft until nothing is open. Use when the user wants an existing feature to do more, less, or something different and the change is not decided (改一下某个功能, 扩展, 调整行为), or picks an Iterate line from a goal's ## Features. Not for work too big for one feature (polaris), a bug where the doc is right (code-bugfix), a small reversible change, or a feature that does not exist yet (feature-new). |
| [feature-new](skills/feature-new/SKILL.md) | Decide a new feature before it is built: pin who can do what they cannot do now, research what exists, choose the approach when there is more than one, and settle every behavior a user will meet by asking with recommended answers, in docs/feature/<slug>.md, written as a draft from the start and decided when nothing is open. Use when the user wants the project to do something it cannot do yet and the feature is not decided (想加一个功能, 设计一个新 feature), or picks a New line from a goal's ## Features. Not for work too big for one feature (polaris), building something already decided, a small reversible change, or changing an existing feature (feature-iterate). |
| [go-work](skills/go-work/SKILL.md) | Carry out an implement spec, docs/spec/<slug>.md, until its feature ships: a coordinator reads the spec once, runs each step in its own subagent as one commit with a Spec-Step trailer, runs independent steps in parallel worktrees, resumes from git history, and archives the spec at the end. Use when the user asks to build, implement, continue, or resume a feature that has an open spec (开始实现, 继续做, 按 spec 实现). Not for code changes without a spec, or for writing or changing a spec, which is to-implement-spec. |
| [note](skills/note/SKILL.md) | Jot down, in one line in docs/NOTES.md, an idea that comes up during other work and does not belong to it: a tangent, a future feature, a doubt about a route, a cleanup for later. Then go back to the work. Later, digest the notes: drop the ones already done, group the rest, and turn each group into a goal (polaris), a feature (feature-new or feature-iterate), or a spec (to-implement-spec), or keep it for later. Use when the user says 记一下, 先记下来, 以后再说, note this, when any skill meets an idea outside its scope, or when the user asks to go through the notes (消化 note, 整理 notes, what's in the notes). |
| [polaris](skills/polaris/SKILL.md) | Set a long-range goal and the route to it, for work too big for one feature: what will be true when it is reached and the signal that shows it, today's distance from it, the route chosen from two or three, and its ordered parts, written to docs/polaris/<slug>.md. Also reviews an active goal's progress, route, or reached state. Use when the user describes a direction bigger than one feature (a north star, a roadmap, a new platform or kind of user, a subsystem to replace, a reliability or speed target; 目标, 方向, 路线图), or asks how a goal is going. Not for one feature, which is feature-new or feature-iterate. |
| [pr](skills/pr/SKILL.md) | Write a pull request's title and body from its diff: a Summary whose visual comes from the show-me skill, Evidence as before and after from checks actually run, and Merge Danger as a one-way or two-way door and a blast radius. Opens or updates the PR only when asked. Use when the user asks to write or update a PR description, or to open a PR for the current branch (写 PR, 开 PR, PR 描述). Not for reviewing a diff (diff-review), for commit messages, or for building the change (go-work). |
| [project](skills/project/SKILL.md) | Keep this repo's AGENTS.md, with CLAUDE.md as a symlink to it: the commands, layout, and gotchas an agent cannot learn quickly from the code, built-in principles for project status, docs, commits, cleanup, and architecture, and the project's own rules. Run the full setup when the user asks to set up or refresh the repo's agent rules (初始化项目规范, 更新 AGENTS.md). Also use it, briefly, when the user states a standing rule or preference for the whole repo mid-work (以后都…, 这个项目一律…, 我们不用…): record it in one line, unless AGENTS.md already says it. Not for a choice that holds only for the current task, how a feature behaves, a personal preference, or a long-range goal. |
| [prototype](skills/prototype/SKILL.md) | Build throwaway code that answers one design question: a single self-contained HTML file that pushes a state model or business logic through the cases that are hard to reason about on paper, or several structurally different UI variants on one route, switched by a ?variant= param and a floating bar. Records the verdict and keeps the prototype on a throwaway branch, out of the main line. Use when the user wants to check whether a state model or logic holds up, or to see what a UI could look like before committing to it (做个原型, 试一下这个状态机, 出几版界面看看). Not for production code, a decided feature (to-implement-spec, go-work), or the design system (design-system). |
| [rpi](skills/rpi/SKILL.md) | Run one piece of work from the first conversation to the PR in T3 Code, with astra (the Codex astra model, through delegate_task) as the fresh-eyed reviewer and builder. Three phases, one doc each: target and route (polaris, for work bigger than one feature), behavior and approach (feature-new or feature-iterate), and the implement spec (to-implement-spec), where a clear technical change such as a dependency upgrade starts. astra battles each doc with batman, builds with go-work, and reviews with diff-review. Every doc goes through technical-writing. The flow loops: an objection, a blocked step, or a finding sends the work back to the doc that must change. The user confirms every move between stages, and every choice, through the question tool. Tangents go to note. Use when the user runs /rpi in T3 Code. Not outside T3 Code, for a bug (code-bugfix), or for a small reversible change. |
| [show-me](skills/show-me/SKILL.md) | Show the current topic, or a topic another skill hands over, with the smallest visual that makes the point: pseudocode, a call tree, a component tree, a file tree, a Mermaid diagram, a diff-shaped sketch of what changes, or one focused HTML page when Markdown cannot carry it. Every name in the visual is read from the code, not recalled. Use when the user asks to show, draw, diagram, or visualize how code, a flow, a structure, or a change fits together (画个图, 给我看看, 可视化, 怎么串起来的), and when another skill such as pr or architect needs a visual. Not for typesetting a document, charting data, or a design system (design-system). |
| [technical-writing](skills/technical-writing/SKILL.md) | Write or rewrite a technical doc so a tired engineer understands it on the first read: one Diátaxis mode per doc, sentences to the reader in the Google developer style, one instruction per sentence (STE), no sentence open to two readings (Global English), then unslop. Knows the docs this collection writes (goal, feature doc, implement spec, glossary, notes, AGENTS.md, PR body, commit message), the mode of each, and that none of them is a meeting record or a roadmap. Keeps every anchor a skill reads. Use when the user asks to write, rewrite, or review a doc, README, RFC, PR description, or commit message for clarity (改写文档, 写清楚, 文档太乱), and from the skills that write docs (polaris, feature-new, feature-iterate, to-implement-spec, to-features, pr, rpi) before a doc leaves them. Not for product UI copy, or for deciding what a doc says, which is the skill that owns it. |
| [to-features](skills/to-features/SKILL.md) | Cut an active polaris goal, docs/polaris/<slug>.md, into features. Each feature is one sentence of who can do what, marked new or as a change to an existing feature, mapped to the part of the route it serves, and ordered with After. Checks that every part is covered and every feature serves a part, sizes each to fit one feature doc and one implement spec, and puts a usable slice first. After the user confirms, writes the list into the goal's ## Features. Deciding each feature is feature-new or feature-iterate. Use after polaris, or after a goal's route changed. |
| [to-implement-spec](skills/to-implement-spec/SKILL.md) | Turn a confirmed feature or change into an implement spec for the agent who builds it: map every behavior in docs/feature/<slug>.md to its owning module, design deep modules with real interface code, place the seams, state stored data and its migration, and order one-commit steps. Writes docs/spec/<slug>.md, moved to docs/spec/archived/ when the feature ships; durable decisions go to the feature doc, terms to docs/GLOSSARY.md. Use after feature-new or feature-iterate, or directly, with Feature: none, for a change with a clear target and nothing for a user to decide (a dependency upgrade and the API changes it brings, a migration off a deprecated API, a refactor picked from architecture-review). Not for deciding a feature, a diff review, a bug, or a whole-codebase review. |
| [unslop](skills/unslop/SKILL.md) | Cut AI tells from a piece of writing, by a numbered catalog of patterns: AI vocabulary, filler, hedges, forced threes, dashes, bold labels, metaphor nouns, chatbot phrases, and the Chinese equivalents (值得注意的是, 赋能, 闭环, 不仅…更…). Keeps the meaning and the tone, and leaves code, paths, and quoted text alone. Use when the user asks to unslop or de-AI a text (去 AI 味, 去掉套话), and from technical-writing, which runs it on every doc it touches. Not for choosing a doc's structure or mode, which is technical-writing. |

_Generated by `node scripts/cli.mjs sync`. Do not edit this table by hand._

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

## Add a skill

Create `skills/<name>/SKILL.md` with `name` and `description` frontmatter; `name` matches the directory. Every directory in `skills/` is in the collection. Add the name to a group in `catalog.json` `groupings`, then run `node scripts/cli.mjs sync`. Use `/catalog` in an agent session for the full workflow.

## Share a file between skills

Each skill installs on its own, so a file several skills need is copied into each of them. Keep the one source in `shared/<path>`, list the skills in `catalog.json` `shared`, and run:

```bash
node scripts/cli.mjs sync
node scripts/cli.mjs status
```

`sync` copies the shared files to `skills/<skill>/<path>` and regenerates the README index and group configs. `status` marks a copy that drifted from its source, and `install` refuses until it matches.

## Layout

```
catalog.json                 # agents, groupings, and shared files
skills/<name>/               # the published collection
shared/<path>                # one source for a file several skills carry
.claude-plugin/marketplace.json  # CLI groups (generated)
skills.sh.json               # skills.sh groups (generated)
.agents/skills/catalog/      # repo-local meta skill
scripts/cli.mjs              # sync | status | install
```

`catalog.json` fields: `global` (must be true), `agents` (passed to `npx skills add`), `notGrouped`, `groupings[]` with `name`, `title`, `description`, and `skills`, and `shared[]` with `path` (relative to a skill, and to `shared/`) and `skills` (names that get a copy).

Some skills adapt work from other projects and keep its license in their own directory. See `NOTICE.md`.
