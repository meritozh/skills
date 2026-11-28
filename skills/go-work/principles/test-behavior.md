# Test behavior, not implementation

Apply when you write, change, keep, or review a test.

A test is a claim about what users of the code can observe through its interface: return values, errors, state they can read back, and effects on outside systems. Private helpers, call order inside the module, and intermediate data are implementation.

Judge each test against two imagined edits:

- **Break the behavior.** Return a wrong value, skip or double an effect. A test that still passes proves nothing. The usual causes are a loose assertion, an expected value computed by the code under test, and an assertion on data the test built itself.
- **Change the internals** and keep every observable result. A test that fails is pinned to the implementation.

Keep a test that catches the first edit and survives the second. Rewrite or delete the rest. Derive the expected value from the requirement, not from the code. Assert the error type callers branch on, not its message.
