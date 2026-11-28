# Pointers

Loaded from `architecture-review` to find where to read. These commands point at code and judge nothing; none of their numbers goes into a finding. Prefer tools already installed. Ask before `npx`, `pipx run`, and similar when the environment restricts downloading code.

Always pass `rg` a path, or it reads stdin and hangs in most agent shells.

## Size and entry points

```bash
tokei . 2>/dev/null || git ls-files | xargs wc -l 2>/dev/null | sort -rn | head -30
rg -n --type-add 'src:*.{ts,tsx,js,mjs,rs,go,py,swift,kt,java}' -t src \
  -e 'Command::new|\.command\(|@app\.(get|post)|router\.(get|post)|func main\(|createBrowserRouter|process\.argv' . | head -50
```

## Import graph

Shows the actual layering, cycles, and dependencies that point outward.

| Language | Module graph | Cycles |
| --- | --- | --- |
| JavaScript, TypeScript | `madge --extensions ts,tsx <src>` | `madge --extensions ts,tsx --circular <src>` |
| Go | `go list -f '{{.ImportPath}}: {{join .Imports " "}}' ./...` | The compiler rejects package cycles; check direction instead |
| Rust | `cargo tree` for crates; the `cargo-modules` subcommand for modules | `cargo-modules` |
| Python | `pydeps <package>` for a graph | `lint-imports` (import-linter) contracts |
| Java, Kotlin | `jdeps -summary <jar or classes dir>` | ArchUnit rules in tests |

Fallback for any language: reduce import lines to module pairs.

```bash
rg -n --no-heading '^\s*(import|from|use|require|#include)\b' <src-dir> | head -100
```

## Where a shared module knows its callers

```bash
rg -n -w -e '<callerA>' -e '<callerB>' <shared-dir>
```

Each hit is a place to read.

## What changes most

```bash
git log --since='1 year ago' --no-merges --format= --name-only | grep -v '^$' \
  | sort | uniq -c | sort -rn | head -20
```

Read these closely first.
