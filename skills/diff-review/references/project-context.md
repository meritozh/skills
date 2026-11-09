# Project context for a diff review

Fill this from public files only: `AGENTS.md` or `CLAUDE.md`, `CONTRIBUTING.md`, README, manifests, CI workflows, `Makefile` or package scripts, and explicit instructions in the current thread. Never from private machine paths or memory.

Keep it short. It guides the review. It does not replace it.

## Where to look

```bash
ls AGENTS.md CLAUDE.md CONTRIBUTING.md README* Makefile justfile 2>/dev/null
ls .github/workflows 2>/dev/null
rg -n '"(scripts|test|lint|build)"' package.json 2>/dev/null
rg -n '^\[tool\.|^\[project\.scripts' pyproject.toml 2>/dev/null
```

Read the CI workflow files themselves. They are the real verification contract.

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

Leave a heading out when the project has no such surface.

## Never put in project context

- Credentials, key file names, tokens, or secret values.
- Maintainer-only machine paths or one-off personal preferences.
- Copies of a past review, scorecard, or incident.
- Issue numbers, commit hashes, or release tags from another project.

## Safety sinks

A diff that touches one of these needs explicit validation, rollback, and confirmation review:

- Deleting, moving, or overwriting user files, caches, history, preferences, or generated outputs.
- Building shell, AppleScript, SQL, URL, or filesystem paths from input.
- cwd handling, symlink resolution, traversal guards, sandbox permissions, approval checks, or auth prompts.
- Signing, notarization, update feeds, license or payment checks, or release asset generation.
- CI workflows, release or publish scripts, installers, or anything running with elevated privilege.

Review the smallest entry point that reaches the sink, then the downstream call. Missing validation or an unclear rollback is a hard stop.

## Risk tiers by path

The tier follows the paths a change touches, not its size or author. A one-line change to a workflow, updater, license check, installer, privilege helper, or deletion path gets the project's heaviest gate: its full test run, a security pass, and a human maintainer's review. An agent, bot, or automated approval never stands in for that human.

Take the tiers from the project's docs. When the project keeps a script that prints the gates for the changed paths, run it and paste its lines. The script is advice, not a pass: the gates it names may run where this session cannot prove they ran.
