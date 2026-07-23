#!/bin/sh
set -eu

ROOT=$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

rsync -a --exclude .git "$ROOT/" "$TMP/package/"
printf 'WECHAT_APP_SECRET=%s%s\n' 'abcdefghijklmnop' 'qrstuvwxyz' > "$TMP/package/.env"
git -C "$TMP/package" init -q
git -C "$TMP/package" add -A
git -C "$TMP/package" add -f .env

if sh "$TMP/package/tests/public-package-check.sh" >"$TMP/stdout" 2>"$TMP/stderr"; then
  echo "Expected ignored credential file to fail the package check" >&2
  exit 1
fi

rg -q 'Potential secret material found' "$TMP/stderr"

rsync -a --exclude .git "$ROOT/" "$TMP/example-package/"
secret_value="$(printf '%s%s' 'abcdefghijklmnop' 'qrstuvwxyz')"
jq --arg secret "$secret_value" \
  '. + {appSecret:$secret}' \
  "$TMP/example-package/skills/wechat-article-publisher/config.example.json" \
  > "$TMP/example-config.json"
mv "$TMP/example-config.json" \
  "$TMP/example-package/skills/wechat-article-publisher/config.example.json"

if sh "$TMP/example-package/tests/public-package-check.sh" \
  >"$TMP/example-stdout" 2>"$TMP/example-stderr"; then
  echo "Expected credential-shaped example config to fail the package check" >&2
  exit 1
fi

rg -q 'Potential secret material found' "$TMP/example-stderr"
echo "safety scan regression passed"
