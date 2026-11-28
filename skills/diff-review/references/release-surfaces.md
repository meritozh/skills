# Command and install surfaces

Loaded from `diff-review` step 6. Library or source tests, manifest JSON, and a local import do not prove installed behavior.

## CLI Command Surface

Check the contract as installed: help/version, subcommands/flags, exit codes, stdout/stderr, JSON/schema output, TTY/non-interactive paths, env/config precedence, shebang/executable bit, PATH shim, and package-manager install path when applicable.

Review a mutating command as a safety sink (`project-context.md`): dry-run or confirmation, operation log or rollback, retry/idempotency, signal/partial-failure handling, and test-mode guards for auth prompts or real system changes. For cleanup, uninstall, prune, reset, or cache removal, ask: can a normal user verify each selected item is safe, and is the deleted content locally rebuildable, not a downloaded dependency or user data? If either is no, require narrower matching, explicit user selection, or a visible, non-destructive item.

## Packaged Install Surface

1. Identify the install path a real user gets: package manager, release archive, marketplace entry, plugin source path, or installer script default ref.
2. Build the package exactly as the project docs require, then inspect the archive or mirror for every new script, reference, template, rule, manifest, and executable bit. For a cached build or test pass, trace new bundled resources and fixtures into the cache key; in a disposable copy, change one new and one known-covered input separately, and each must invalidate the reused pass.
3. Run an isolated install smoke: fresh temp home/config/cache, add the marketplace or package, install, list, and invoke the smallest entrypoint that proves scripts and references resolve from the installed path.
4. Filter generated mirrors and archives for cache and noise files (`__pycache__`, `*.pyc`, `.pytest_cache`, `.ruff_cache`, `.mypy_cache`, `.DS_Store`, local logs, screenshots) unless the project ships them.
5. If network, auth, or host tooling prevents the install smoke, state the missing layer as a blocker or gap.
