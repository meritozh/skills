# Logging Techniques for Debugging

Every log answers a yes/no question: "if this prints X before Y, hypothesis A holds; otherwise A is dead." Drop a log that cannot rule a hypothesis in or out.

## Discriminating Content

Log ordering (sequence number or timestamp), input identity key, branch taken, old and new state, and error code with context. Place logs at boundaries (handler entry and exit, cache hit or miss with key, state setter with old value and caller, async callback entry, external API result), not inside tight loops. Never log credentials, PII, or full request or response bodies.

For races, flicker, or intermittent failures, also capture event identity, monotonic ordering, start and end, and thread, task, or queue identity. A log that changes the behavior is evidence of a timing, lifecycle, or concurrency problem, not a side effect to dismiss.

## Runner-Only Failures

When a script fails only under a runner (make target, CI job, test harness, cron) and passes standalone, do not add debug hacks to the script. Inject tracing through the environment the runner already passes through:

```bash
# xtrace-env.sh: sourced by every non-interactive bash via BASH_ENV
exec 19>>/path/to/persistent/xtrace.log
export BASH_XTRACEFD=19
export PS4='+ [$0:$LINENO] '
set -x
```

Run `BASH_ENV=/path/to/xtrace-env.sh make test` (or the runner's equivalent): every bash it spawns appends `file:line` traces to one file that survives temp-dir cleanup. Guard with a sentinel variable if nested shells would re-source it, and delete the env file when done.

## Native App Freeze Mode

Activate when a desktop or mobile native app reports beachball, not responding, tab-switch freeze, first-open lag, idle wake stall, overlay lockup, or a screenshot shows a frozen app.

Collect before changing code:

1. Exact user path and version: first or warm launch, the tab or window transition, idle duration, permissions, display count, and any setting that makes the freeze disappear.
2. Runtime capture while frozen: `sample <process>`, recent app logs, CPU and memory, thread count, and whether the main thread is blocked, spinning, or allocating.
3. First-frame surface: view body work, first `.task`, synchronous icon or metadata lookup, filesystem scans, URL parent walks, notification callbacks, and app or window wake handlers.
4. Blast search after the fix: grep the repo for the same API shape.

Common traps:

- Launch, terminate, permission, audio, display, or workspace notifications doing path walks, icon lookup, filesystem scans, or process enumeration on the main thread.
- First paint hydrating a full app list, directory tree, thumbnail set, or system status table before showing an interactive shell.
- An input-lock or full-screen overlay with no guaranteed teardown on Escape, app deactivation, permission denial, process termination, and window close.
- Timer or sampler work that survives hidden windows, long idle, sleep and wake, or reactivation.

Compile-only and source-only checks do not count here. Report the runtime capture and the root-cause frame or state transition.
