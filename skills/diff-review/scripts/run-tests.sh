#!/usr/bin/env bash
# Fallback: guess and run a verification command when the project documents none.
# Run from the project root. Prints the chosen command first, then runs it.
# Exits non-zero on failure, or with 2 when nothing could be detected.
set -euo pipefail

has_script() { [ -f package.json ] && grep -q "\"$1\"[[:space:]]*:" package.json; }

js_runner() {
  if [ -f pnpm-lock.yaml ]; then echo pnpm
  elif [ -f yarn.lock ]; then echo yarn
  elif [ -f bun.lockb ] || [ -f bun.lock ]; then echo bun
  else echo npm
  fi
}

cmd=""
if [ -f Cargo.toml ]; then
  cmd="cargo check --all-targets && cargo test"
elif [ -f go.mod ]; then
  cmd="go vet ./... && go test ./..."
elif [ -f package.json ]; then
  r=$(js_runner)
  parts=()
  has_script typecheck && parts+=("$r run typecheck")
  [ ${#parts[@]} -eq 0 ] && [ -f tsconfig.json ] && parts+=("npx tsc --noEmit")
  has_script lint && parts+=("$r run lint")
  has_script test && parts+=("$r test")
  if [ ${#parts[@]} -gt 0 ]; then
    cmd=$(printf ' && %s' "${parts[@]}"); cmd=${cmd:4}
  fi
elif [ -f Makefile ] && grep -q '^test:' Makefile; then
  cmd="make test"
elif [ -f pyproject.toml ] || [ -f pytest.ini ] || find . -maxdepth 2 -name 'test_*.py' -not -path './.venv/*' | grep -q .; then
  if [ -f uv.lock ]; then cmd="uv run pytest"; else cmd="python3 -m pytest"; fi
fi

if [ -z "$cmd" ]; then
  echo "no verification command detected; read CI workflows and project docs, or ask the user" >&2
  exit 2
fi

echo "+ $cmd"
bash -c "$cmd"
