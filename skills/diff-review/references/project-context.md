# Project context for a diff review

Fill this, briefly, from the public files below and explicit instructions in the current thread, never from private machine paths or memory.

## Where to look

```bash
ls AGENTS.md CLAUDE.md CONTRIBUTING.md README* Makefile justfile 2>/dev/null
ls .github/workflows 2>/dev/null
rg -n '"(scripts|test|lint|build)"' package.json 2>/dev/null
rg -n '^\[tool\.|^\[project\.scripts' pyproject.toml 2>/dev/null
```

Read the CI workflow files themselves.

## What to extract

```markdown
## Commands
- Format: `<command>`
- Fast check: `<command>`
- Full verification: `<command>`, and which of these CI actually runs

## Generated and protected files
- `<artifact>` is generated from `<source>` by `<command>`; a diff touching `<source>` must regenerate it.
- `<path>` is protected: changed only on explicit request.
- Packaging builds from `<git ls-files | allowlist | directory>`; a new helper, reference, or script must be inside it.

## Risk paths
- `<path or glob>`: why it is risky, and the extra gate the project names.

## Known flakes
- `<test or job>`: how to tell the flake from a real failure.
```

Leave out a heading the project has no surface for.

Never put in it secrets or key file names, maintainer-only paths or preferences, copies of a past review or incident, or another project's issue numbers, hashes, or tags.

## Safety sinks

These need validation, rollback, and confirmation:

- Deleting, moving, or overwriting user files, caches, history, preferences, or generated outputs.
- Building shell, AppleScript, SQL, URL, or filesystem paths from input.
- cwd handling, symlink resolution, traversal guards, sandbox permissions, approval checks, or auth prompts.
- Signing, notarization, update feeds, license or payment checks, or release asset generation.
- CI workflows, release or publish scripts, installers, or anything running with elevated privilege.

Review the smallest entry point reaching the sink, then the downstream call. Missing validation or an unclear rollback is a hard stop.

## Risk tiers by path

Take the tiers from the project's docs. Run a project script that prints the gates for the changed paths, if one exists, and paste its lines as advice, not a pass: its gates may run where this session cannot prove they ran.
