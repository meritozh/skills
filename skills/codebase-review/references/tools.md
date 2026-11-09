# Tools for a codebase review

Loaded from `codebase-review` when a step needs a measurement. Prefer tools already installed. `npx`, `pipx run`, and similar download and run third-party code: ask before using them when the environment restricts that. When no tool is available, fall back to the `rg` commands below and say the measurement is approximate.

Always pass `rg` a path. With no path and a stdin that is not a terminal, as in most agent shells, it reads stdin and hangs.

## Size and entry points

```bash
tokei . 2>/dev/null || git ls-files | xargs wc -l 2>/dev/null | sort -rn | head -30
rg -n --type-add 'src:*.{ts,tsx,js,mjs,rs,go,py,swift,kt,java}' -t src \
  -e 'Command::new|\.command\(|@app\.(get|post)|router\.(get|post)|func main\(|createBrowserRouter|process\.argv' . | head -50
```

## Import graph

| Language | Module graph | Cycles |
| --- | --- | --- |
| JavaScript, TypeScript | `madge --extensions ts,tsx <src>` | `madge --extensions ts,tsx --circular <src>` |
| Go | `go list -f '{{.ImportPath}}: {{join .Imports " "}}' ./...` | The compiler rejects package cycles; check direction instead |
| Rust | `cargo tree` for crates; the `cargo-modules` subcommand for modules | `cargo-modules` |
| Python | `pydeps <package>` for a graph; `lint-imports` (import-linter) to enforce layers | import-linter contracts |
| Java, Kotlin | `jdeps -summary <jar or classes dir>` | ArchUnit rules in tests |

Fallback for any language: list import lines and reduce them to module pairs.

```bash
rg -n --no-heading '^\s*(import|from|use|require|#include)\b' <src-dir> | head -100
```

## Clone detection

`jscpd --reporters console <src-dir>` covers most languages. Then judge each clone pair with the co-change check in `SKILL.md` Lens 1. A clone report alone is not a finding.

## Function span

With universal-ctags (`ctags --version` says Universal):

```bash
ctags -R --fields=+ne --output-format=json -f - <src-dir> \
  | jq -r 'select((.kind=="function" or .kind=="method") and .end) | [(.end - .line + 1), .path, .line, .name] | @tsv' \
  | sort -rn | awk -F'\t' '$1 > 100'
```

macOS ships a BSD `ctags` without these options. Without universal-ctags, use the language's own parser (`ast` in Python, `syn` in Rust, `go/ast`, the TypeScript compiler API). Do not estimate spans by eye.

## History

The change-hotspot, fix-concentration, co-change, and copy co-change commands live in `SKILL.md` steps 4 and 5, next to the judgments they feed.
