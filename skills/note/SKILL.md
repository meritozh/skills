---
name: note
description: "Jot down, in one line in docs/NOTES.md, an idea that comes up during other work and does not belong to it: a tangent, a future feature, a doubt about a route, a cleanup for later. Then go back to the work. Later, digest the notes: drop the ones already done, group the rest, and turn each group into a goal (polaris), a feature (feature-new or feature-iterate), or a spec (to-implement-spec), or keep it for later. Use when the user says 记一下, 先记下来, 以后再说, note this, when any skill meets an idea outside its scope, or when the user asks to go through the notes (消化 note, 整理 notes, what's in the notes)."
---

# note

Run this skill when the user ran `/note`, when the request matches the description, or when another skill hands it an idea.

The notes live in `docs/NOTES.md`, one line each. A note is not a decision and not a plan: it says only enough to find the idea again. Deciding it is the job of the skill it becomes.

## Add

1. Write the idea as one plain sentence, in the user's words or the glossary's terms, with no AI tells (`unslop`), under `## Notes` in `docs/NOTES.md`. Create the file when it is missing:

   ```markdown
   # Notes

   Ideas that came up during other work. `note` digests them into goals, features, and specs.

   ## Notes

   - 2026-11-28 Export could stream rows instead of building the file in memory. From: docs/spec/order-export.md, step 3
   ```

   The line is `- <YYYY-MM-DD> <the idea>. From: <where it came up>`: a doc and line, a batman objection, a review finding, or `conversation`.
2. When a note already says the same thing, add the new `From:` to it instead of a second line.
3. Say `Noted: <the idea>` in one line, and go back to the work. Do not analyse it, ask about it, or commit it on its own: it rides with the next docs commit.

## Digest

When the user asks to go through the notes:

1. **Read** `docs/NOTES.md`, and for each note the doc it came from and what has changed since (`git log --oneline -- <that doc>`).
2. **Drop what is done.** A note the code or a doc already covers, cited, is proposed for deletion.
3. **Group** the notes that are about the same thing.
4. **Propose a destination** for each group, with the reason:

   | Destination | When |
   | --- | --- |
   | `polaris` | it needs more than one feature |
   | `feature-new` / `feature-iterate` | one feature; whether a feature doc or the code already does something like it decides which |
   | `to-implement-spec`, `Feature: none` | a clear technical change with nothing for a user to decide |
   | `to-features` | a new line for an active goal's `## Features` |
   | keep | not ready to decide |
   | drop | not worth doing |

5. **Ask** with the question tool, following [references/asking.md](references/asking.md): one question per group, up to four a call, the recommended destination first, naming the notes in the group.
6. **Clean up.** Remove each note that was dropped or sent on; keep the rest. History lives in git. Delete the file when no note is left.
7. **Start.** Ask which destination goes first, and run that skill with the group's notes as its starting point. Under `rpi`, it becomes that run's route.
