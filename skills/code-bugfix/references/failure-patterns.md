# Failure Pattern Reference

For a bug that repeated, a first fix that did not hold, or a symptom of runtime state rather than local code.

## Stale Verifier Or Tool Cache

Signals: verifier output points at deleted temp worktrees, old generated files, or paths outside the repo; a clean checkout changes the path but not the result.

Checks:
- Confirm the reported path exists.
- Clear the tool cache only after proving the path is stale.
- Re-run the same verifier from the current repo root.

## Worker Queue Or DB Boundary

Signals: UI says work is running but no worker processes it; logs show scheduler activity but no queued row; retry fixes one item but not the pipeline.

Checks:
- Trace request -> enqueue -> worker pickup -> persistence -> UI refresh.
- Inspect queue rows or job state directly.
- Add a regression test around the enqueue boundary, not only the worker body.

## Generated Rebuild Boundary

Signals: source changed but generated output, app bundle, CLI artifact, archive, checksum, or release package still has the old behavior.

Checks:
- Identify the source-to-artifact rule.
- Verify the build system watches the source path.
- Inspect the generated artifact contents, not just the source diff.

## Guard Lifetime Race

Signals: a permission, auth, or state guard looks correct, but a delayed callback, relaunch, or alternate entry point bypasses it.

Checks:
- Trace guard creation, retention, invalidation, and every alternate entry point.
- Verify cold launch, warm launch, deep link/file open, and retry paths when they apply.
- Prefer explicit durable state over transient flags when the guard must survive relaunch.

## Atomic Temp Filename

Signals: concurrent runs collide, cleanup removes the wrong file, or a partially written output is observed.

Checks:
- Use unique temp directories or atomic rename.
- Scope cleanup to files the current run created.
- Test two concurrent or back-to-back runs when the tool supports it.

## Path, Cwd, Or Symlink Escape

Signals: an operation meant for one root touches a sibling directory, follows a symlink, or behaves differently from another working directory.

Checks:
- Resolve and compare canonical roots before writing or deleting.
- Reject paths outside the allowed root after symlink resolution.
- Reproduce from a non-default cwd and through any UI entry point that supplies paths.

## CLI Effect Scope Drift

Signals: preview, dry-run, size, count, or report output comes from one predicate, but execution mutates a broader or different set.

Checks:
- Trace display, dry-run, and mutation predicates to one source of truth.
- Compare planned paths or records with executor input in a regression test.
- Assert partial failures report the exact skipped and completed items.

## CLI Wrapper Or PATH Drift

Signals: the source tree works, but the installed command, package wrapper, PATH shim, completion, or package-manager install runs old code or a different binary.

Checks:
- Inspect built package contents, shebang, executable bit, and wrapper target.
- Reproduce through a temp prefix or package-manager install path, not only from source.
- Check PATH order, and use absolute system-tool paths where wrappers must not intercept.

## Interactive Stdin Or TTY Hang

Signals: CI stalls, a spinner never finishes, a subprocess reads from the script body, or an auth prompt appears in non-interactive mode.

Checks:
- Reproduce with stdin redirected, and with TTY and non-TTY paths separated.
- Add test-mode or no-auth guards around real prompts and system changes.
- Stub external prompt tools through PATH when timeout wrappers exec real binaries.

## Subprocess Pipe Backpressure

Signals: a child hangs only on large output, or the parent waits for exit before reading stdout/stderr.

Checks:
- Drain stdout and stderr while the process runs, or inherit or redirect streams when output is not needed.
- Test with output larger than a typical pipe buffer.
- Keep stderr tails or structured error output for diagnostics without holding the whole stream in memory.

## Signal Or Partial-Failure Mapping

Signals: cancel, timeout, SIGINT, or SIGTERM is reported as success or a normal failure; leftover temp files, locks, or operation logs make retries look complete.

Checks:
- Classify interrupted execution separately from success and expected validation failures.
- Assert temp cleanup, lock release, and operation-log state after interruption.
- Test retry and idempotency after a partial write.

## CLI Stream Contract Regression

Signals: automation breaks after a change to human logs, progress output, JSON shape, stdout/stderr routing, or exit codes.

Checks:
- Assert exit code, stdout, and stderr separately in CLI tests.
- Keep human diagnostics off stdout in machine-readable modes.
- Snapshot or parse JSON/schema output, and include non-interactive coverage.

## Snapshot Rebuild Drops Carried Field

Signals: data reaches the wire but a downstream view sees it empty; the field has a default (`var x: [T] = []`, `var y: Int? = nil`) so memberwise init compiles without it; only the path that rebuilds the snapshot (icon resolution, decoration, redaction) shows it.

Checks:
- Check that every path constructing the snapshot type passes the field; Swift does not warn.
- Add a unit test that fetches the snapshot, runs the rebuild path, and asserts the carried field equals the input.
- Prefer `with(...)` helpers or `inout` mutation over fresh memberwise init when one field changes.

## Multi-Sample Command Cold Start

Signals: a CLI tool that takes `-l N` / `--samples N` / `--repeat N` returns one block of zeros and one of real data; aggregating all blocks yields zeros.

Checks:
- Read the tool's man page for cold-start semantics. `top -l 2`, `iostat -d 2`, and `vm_stat 1 2` share this shape.
- Slice the output to the latest sample (`.suffix(perSampleSize)` on parsed lines, or the second instance of the header row).
- When unsure, raise `-l` to 3 and confirm samples 2 and 3 agree.

## Locale-Dependent Subprocess Output

Signals: a parsed number, percentage, size, or duration is right in one region and zero, truncated, or wrong in another; the parser was already patched once for another field.

Checks:
- Force a fixed locale (`LC_ALL=C` or the equivalent) at the spawn boundary of every subprocess whose output is parsed, instead of repairing each parser for decimal commas, digit grouping, or translated labels.
- Treat translated output as a format change: field order, units, and label names can all move.

## Single-Probe Existence Check

Signals: an "is it installed / running / registered / active" verdict is wrong for users who share an install method, packaging convention, or OS feature, and drives a destructive or user-visible action (flagged as orphaned, offered for deletion, a feature silently disabled).

Checks:
- List every legitimate way the subject can exist, and confirm the probe sees all of them. One index query, PATH lookup, process name, or interface-name prefix is a partial view: indexes can be disabled or skip a packaging convention, nested components go unregistered, and OS-owned interfaces can share a third-party name.
- Distinguish "probe timed out" from "subject absent". A timed-out fast path falls through to a direct check, never to a negative verdict.
- When the verdict authorizes removal, require corroboration from a second source before the destructive branch.

## Aggregation Key Variant

Signals: a count, roll-up, or per-category breakdown is short; the missing items share a derived key variant (`<base>-system`, a suffix, a prefix, a localized string).

Checks:
- Before adding a category, grep every write site for this class of key and enumerate the real variants.
- Match with `hasPrefix`, a regex, or an explicit variant list, not exact equality on the base key.
- Add a fixture row for each known variant, so a new key shape fails the test.

## Whole-Buffer Decode Collapse

Signals: a parser returns nothing for one user who has an accented device name, a non-ASCII filename, or an unusual process argument; every row is gone, not one garbled.

Checks:
- Find every strict decode of bytes from a child process, a device, or the filesystem (`String(data:encoding:)`, `from_utf8`, `decode('utf-8')` with no `errors=`). One invalid byte nils the whole buffer.
- Decode leniently where the bytes are a report to parse. Keep the strict decode, failing closed, only where the bytes are a signature or checksum being verified.
- Check what an empty result means downstream: a guard that reads an empty process list as "nothing is running" fails open.
- Point callers at exit status and timeout for real failure, not decode success.

## Denied Read Returns A Plausible Value

Signals: a metric is right for your own processes or files and zero, stale, or absent for root-owned or other-user ones. No error is logged.

Checks:
- Run the call across owned and non-owned subjects and count successes in each group. Report those counts as the evidence.
- Check whether the fallback for a denied read means the same as the primary source. Two meanings in one column is the bug.
- Prefer a source that answers uniformly for every subject over a precise one that silently degrades for some.

## Recovery Gated On The Artifact It Restores

Signals: a repair, reinstall, or self-heal path hits the same dead end every run, and nothing shows it ever succeeded.

Checks:
- Check whether the repair's own precondition is true in the broken state it exists to fix.
- Verify every absolute tool path in a repair command exists on the platform: a wrong path breaks an `&&` chain silently. Add a test that walks each path and asserts it is executable.
- Assert the observable end state (the service is registered, the file exists, the probe answers), not the source shape of the repair command.
- Make the repair write the artifact, query the system, and log the raw result.

## Watchdog Tuned To The Fast Path

Signals: a healthy operation is reported as failed or stalled on slow links, cold caches, network volumes, or large payloads; a retry fails at the same elapsed time.

Checks:
- For each timeout, name the slowest healthy case (a large download on a slow link, a first-of-day index rebuild, a cache rebuild after cleanup) and confirm it clears that with margin.
- Set a detector threshold below the measurement from its motivating incident, not at a rounder number. Confirm it stays quiet on healthy runs, and check what it prints when nothing crosses the line.
- Replace "no output for N seconds" with a real liveness probe (a growing temp file, a byte counter, a heartbeat), and keep the timeout as the stall guard.
- Enumerate every exit from the region a watchdog guards, including thrown errors and forks into an alternate path, and cancel the watchdog on each.
- If a second bound already covers a hung run, remove the extra timer.

## Display-String Comparison

Signals: a comparison on user-facing text never resolves: a perpetual "update available", a diff that always reports changed, a match that never fires.

Checks:
- Check whether the compared format is a contract. Version display strings, filenames from a URL tail, and localized labels are not.
- Compare the machine-facing identity (a build number, a content hash, an id), falling back to the display form only when either side lacks it.
- When the fallback stays, suppress the verdict where both strings hold the same tokens in a different arrangement.
- Fix every channel that repeats the comparison, not only the one in the report.
