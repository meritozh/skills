# Make operations idempotent

Apply when you design anything that changes state and can be stopped and run again: a migration, a job, a lifecycle step, a resumable run of agents.

- Each run reads the state that exists, compares it with the goal, and applies only the difference. It never trusts what the previous run meant to do.
- What a run leaves behind (a lock, a temporary file, a half-written record, a claimed job) is recognizable as stale by the next run. Write to a temporary path and rename it into place.

The test: what happens if it runs twice? What if the last run stopped at each possible point?
