# Pointers

Loaded from `architecture-review` when a step needs to find where to read. These commands point the reader at code. None of them judges it, and none of their numbers goes into a finding. Prefer tools already installed. `npx`, `pipx run`, and similar download and run third-party code: ask before using them when the environment restricts that.

Always pass `rg` a path. With no path and a stdin that is not a terminal, as in most agent shells, it reads stdin and hangs.

## Size and entry points

```bash
tokei . 2>/dev/null || git ls-files | xargs wc -l 2>/dev/null | sort -rn | head -30
rg -n --type-add 'src:*.{ts,tsx,js,mjs,rs,go,py,swift,kt,java}' -t src \
  -e 'Command::new|\.command\(|@app\.(get|post)|router\.(get|post)|func main\(|createBrowserRouter|process\.argv' . | head -50
```

## Import graph

The fastest way to see the layering a codebase actually has, and to find a cycle or a dependency that points outward.

| Language | Module graph | Cycles |
| --- | --- | --- |
| JavaScript, TypeScript | `madge --extensions ts,tsx <src>` | `madge --extensions ts,tsx --circular <src>` |
| Go | `go list -f '{{.ImportPath}}: {{join .Imports " "}}' ./...` | The compiler rejects package cycles; check direction instead |
| Rust | `cargo tree` for crates; the `cargo-modules` subcommand for modules | `cargo-modules` |
| Python | `pydeps <package>` for a graph | `lint-imports` (import-linter) contracts |
| Java, Kotlin | `jdeps -summary <jar or classes dir>` | ArchUnit rules in tests |

Fallback for any language: list import lines and reduce them to module pairs.

```bash
rg -n --no-heading '^\s*(import|from|use|require|#include)\b' <src-dir> | head -100
```

## Where a shared module knows its callers

```bash
rg -n -w -e '<callerA>' -e '<callerB>' <shared-dir>
```

Each hit is a place to read: a shared module that names a caller, or branches on one.

## What changes most

```bash
git log --since='1 year ago' --no-merges --format= --name-only | grep -v '^$' \
  | sort | uniq -c | sort -rn | head -20
```

Read these closely first. The count says where to look, not what is wrong.
