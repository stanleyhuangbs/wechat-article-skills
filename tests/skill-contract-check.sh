#!/bin/sh
set -eu

ROOT=$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)
SKILL="$ROOT/skills/developing-credible-articles/SKILL.md"

node - "$SKILL" <<'NODE'
const fs = require("node:fs");
const file = process.argv[2];
const body = fs.readFileSync(file, "utf8");
const example = body.slice(body.indexOf("## Compact Example"));
const required = "Good first response:\n\n> 这篇文章主要写给哪类人看？";
if (!example.includes(required)) {
  console.error("Compact example conflicts with First-Response State Rule");
  process.exit(1);
}
NODE

echo "skill contract checks passed"
