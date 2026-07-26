#!/bin/sh
set -eu

ROOT=$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)

test -f "$ROOT/README.md"
test -f "$ROOT/LICENSE"
test -f "$ROOT/VERSION"
test -f "$ROOT/.gitignore"
test -f "$ROOT/.github/workflows/ci.yml"
test -f "$ROOT/skills/developing-credible-articles/SKILL.md"
test -f "$ROOT/skills/wechat-article-publisher/SKILL.md"
test -f "$ROOT/skills/wechat-article-publisher/config.example.json"
test ! -e "$ROOT/skills/wechat-article-publisher/config.json"
SKILL_COUNT=$(find "$ROOT/skills" -mindepth 1 -maxdepth 1 -type d | wc -l | tr -d ' ')
test "$SKILL_COUNT" -eq 2

rg -q 'developing-credible-articles' "$ROOT/README.md"
rg -q 'wechat-article-publisher' "$ROOT/README.md"
rg -q 'npx skills add stanleyhuangbs/wechat-article-skills' "$ROOT/README.md"
rg -q '不会自动公开发布' "$ROOT/README.md"
rg -q 'macOS Keychain' "$ROOT/README.md"
rg -q 'WECHAT_APP_SECRET' "$ROOT/README.md"
rg -q '40164' "$ROOT/README.md"
rg -q 'IP 白名单' "$ROOT/README.md"
rg -q 'tests/public-package-check.sh' "$ROOT/README.md"

if rg -l --hidden --no-ignore \
  -g '!.git/**' \
  -g '!tests/public-package-check.sh' \
  "(gh[pousr]_[A-Za-z0-9]{20,}|sk-[A-Za-z0-9_-]{20,}|wx[0-9a-fA-F]{16}|-----BEGIN [A-Z ]*PRIVATE KEY-----|WECHAT_APP_SECRET\\s*=\\s*[A-Za-z0-9_-]{16,}|appSecret\"?\\s*[:=]\\s*\"[^\"]{8,}\")" \
  "$ROOT"; then
  echo "Potential secret material found" >&2
  exit 1
fi

echo "public package checks passed"
