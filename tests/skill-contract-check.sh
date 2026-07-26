#!/bin/sh
set -eu

ROOT=$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)
WRITING_SKILL="$ROOT/skills/developing-credible-articles/SKILL.md"
PUBLISHING_SKILL="$ROOT/skills/wechat-article-publisher/SKILL.md"

node - "$WRITING_SKILL" "$PUBLISHING_SKILL" <<'NODE'
const fs = require("node:fs");
const writing = fs.readFileSync(process.argv[2], "utf8");
const publishing = fs.readFileSync(process.argv[3], "utf8");
const example = writing.slice(writing.indexOf("## Compact Example"));
const required = "Good first response:\n\n> 这篇文章主要写给哪类人看？";
if (!example.includes(required)) {
  console.error("Compact example conflicts with First-Response State Rule");
  process.exit(1);
}

for (const [body, phrase] of [
  [writing, "无封面模式"],
  [writing, "第一句"],
  [writing, "主旨"],
  [publishing, "有封面图"],
  [publishing, "无封面图"],
  [publishing, "选择框"],
  [publishing, "Skill 分享"],
  [publishing, "观点思考"],
  [publishing, "图文"],
  [writing, "去 AI 味"],
]) {
  if (!body.includes(phrase)) {
    console.error(`Missing cover-mode contract: ${phrase}`);
    process.exit(1);
  }
}
NODE

test -f "$ROOT/VERSION"
test "$(tr -d '\n' < "$ROOT/VERSION")" = "1.1.0"

echo "skill contract checks passed"
