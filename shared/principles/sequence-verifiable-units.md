# Sequence work into verifiable units

Apply to work with more than one step: a spec, a migration, a sweep of similar edits, a batch of fixes, a stack of commits.

- Each unit starts from a green state, makes one change, and ends with a check. Do not start the next unit until the check passes.
- Run the check for every unit, even when a tool made the edit.
- Order the units so the sequence proves itself: the failing test before the fix, the removal before the reshape, the baseline before the change.
- Each commit stands on its own: it builds, and its tests pass.
