#!/bin/sh
set -eu

ROOT=$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)
OUTPUT=$(mktemp -d)
DEFAULT_OUTPUT=$(mktemp -d)
INJECTION_OUTPUT=$(mktemp -d)
trap 'rm -rf "$OUTPUT" "$DEFAULT_OUTPUT" "$INJECTION_OUTPUT"' EXIT

node "$ROOT/skills/wechat-article-publisher/scripts/prepare.mjs" \
  --input "$ROOT/tests/fixtures/article.md" \
  --output "$OUTPUT" \
  --title "一篇可信文章如何诞生" \
  --author "示例作者" \
  --summary "本地发布包验证" \
  --cover-copy "从想法到可信文章" \
  --brand "示例公众号" \
  --account-type "service"

test -s "$OUTPUT/article.html"
test -s "$OUTPUT/cover.svg"
test -s "$OUTPUT/cover.png"
test -s "$OUTPUT/metadata.json"
rg -q '示例公众号' "$OUTPUT/cover.svg"
! rg -q 'AI 与组织管理' "$OUTPUT/cover.svg"
jq -e '.publicPublishConfirmed == false' "$OUTPUT/metadata.json" >/dev/null
jq -e '.accountType == "service"' "$OUTPUT/metadata.json" >/dev/null

node "$ROOT/skills/wechat-article-publisher/scripts/prepare.mjs" \
  --input "$ROOT/tests/fixtures/article.md" \
  --output "$DEFAULT_OUTPUT" \
  --title "默认品牌测试" \
  --cover-copy "默认品牌"

rg -q '公众号文章' "$DEFAULT_OUTPUT/cover.svg"
! cmp -s "$OUTPUT/cover.png" "$DEFAULT_OUTPUT/cover.png"
jq -e '.accountType == "unknown"' "$DEFAULT_OUTPUT/metadata.json" >/dev/null

node "$ROOT/skills/wechat-article-publisher/scripts/prepare.mjs" \
  --input "$ROOT/tests/fixtures/injection-article.md" \
  --output "$INJECTION_OUTPUT" \
  --title "脚本注入测试" \
  --cover-copy "脚本注入测试"

! rg -q '</script><script>window.__injected' "$INJECTION_OUTPUT/article.html"
rg -q '\\u003c/script\\u003e' "$INJECTION_OUTPUT/article.html"

echo "prepare smoke test passed"
