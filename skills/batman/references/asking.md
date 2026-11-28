# Asking the user

The work runs without stopping for the user until it needs one of three things from them: a decision, information only they have, or their acknowledgement of something they must know before it goes on (a risk they will carry, a write about to happen). Each of those is a question asked with the harness's question tool: `AskUserQuestion` in Claude Code, `request_user_input` in Codex. A fact the code or a doc states, cited, is reported, not asked, and the work goes on.

A fact that running something would settle is not a question either. Whether a library supports a call, whether a query is fast enough, whether two shapes fit: run a spike or a prototype, and bring the result. Ask only what no run can settle: a product call, a preference, a risk the user carries.

A recommendation is a judgment, not agreement. When the honest answer is to drop the idea, cut the scope, or not build it, recommend that, and say why.

A recommendation is not a decision. When a choice would be settled, or the work would move to its next stage, on an answer you recommend, ask, even when it is the only reasonable answer: the user confirms it in one pick. Only the user's answer moves the work on.

Without a question tool, write the questions as text and end the turn.

## One call

- One call holds one to four questions whose answers do not wait on each other. When more are open, ask the ones others depend on first, then the rest in the next call.
- Each question stands alone. The user may see only the question while it is open, so name what it is about (the doc and line, the objection, the finding) and quote the words the choice hangs on.
- Context too long for a question, such as a table of routes, a draft shape, or a list of objections, goes to the user first with the harness's mid-turn message tool (`send_to_user` in T3 Code), then the questions follow. Without such a tool, keep each question self-contained.
- Give each question a short header, at most 12 characters: `Signal`, `Fails`, `#3 ruling`.

## Options

- Two to four options, each a distinct decision. The recommended answer comes first, with `(Recommended)` at the end of its label and its reason as its description.
- The tool always adds a free-text answer. Do not add an "Other" option.
- A field only the user can fill (what they rejected, the constraint that makes their choice win, a metric) still gets options: the two or three likely answers from the code and the conversation, so the user can pick one or write their own.
- Choices that are not exclusive, such as which fixes to apply, are one multi-select question.
- To confirm what is about to be written or run, ask once, with the thing named in the question: `Write it (Recommended)`, `Change something`, `Stop`.
- Something the user must know but does not decide is a `Go on? (Recommended)` / `Stop` question that states it.

## Answers

- An answer is final for the run. Do not ask it again, and do not ask what the conversation already settled.
- A free-text answer that is thin is still data: name it as thin, and go on with it.
- "Stop", or a dismissed question, ends the run the way the skill says for an early stop.
