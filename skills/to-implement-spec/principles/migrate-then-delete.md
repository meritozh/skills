# Migrate callers, then delete the old API

Apply when a new interface replaces an old one, or a dependency upgrade changes the API this code calls.

- Move every caller to the new interface, then delete the old one, in the same piece of work. No compatibility layer, adapter, or deprecated alias stays behind.
- Change the tests to assert the new contract. Delete the tests that only protected the old internals.
- Keep a compatibility path only when someone outside the repo depends on the old one and `### Project status` in `AGENTS.md` says breaking them is not allowed. Then the path has a named end: the step or release that deletes it.
