#!/bin/sh
set -eu

ROOT=$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)
TMP=$(mktemp -d)
SERVER_PID=
cleanup() {
  if [ -n "$SERVER_PID" ]; then
    kill "$SERVER_PID" 2>/dev/null || true
    wait "$SERVER_PID" 2>/dev/null || true
  fi
  rm -rf "$TMP"
}
trap cleanup EXIT

PORT_FILE="$TMP/port"
REQUEST_LOG="$TMP/requests.log"

stop_server() {
  if [ -n "$SERVER_PID" ]; then
    kill "$SERVER_PID" 2>/dev/null || true
    wait "$SERVER_PID" 2>/dev/null || true
    SERVER_PID=
  fi
}

start_server() {
  mode=$1
  : > "$REQUEST_LOG"
  rm -f "$PORT_FILE"
  node "$ROOT/tests/mock-wechat-server.mjs" "$PORT_FILE" "$REQUEST_LOG" "$mode" &
  SERVER_PID=$!
  for _attempt in $(jot 50); do
    test -s "$PORT_FILE" && break
    sleep 0.1
  done
  test -s "$PORT_FILE"
  API_BASE="http://127.0.0.1:$(cat "$PORT_FILE")"
}

start_server draft-reject

printf '<article id="wechat-content"><p>有效正文</p></article>\n' > "$TMP/article.html"
printf '<article id="wechat-content">   </article>\n' > "$TMP/empty.html"
printf 'not-a-real-png\n' > "$TMP/cover.png"
printf 'not-a-real-jpg\n' > "$TMP/cover.jpg"

run_invalid() {
  expected=$1
  metadata=$2
  html=$3
  cover=$4
  if WECHAT_APP_ID=example WECHAT_APP_SECRET=example \
    WECHAT_API_BASE="$API_BASE" \
    node "$ROOT/skills/wechat-article-publisher/scripts/upload-draft.mjs" \
      --metadata "$metadata" \
      --html "$html" \
      --cover "$cover" >"$TMP/stdout" 2>"$TMP/stderr"; then
    echo "Expected validation failure: $expected" >&2
    exit 1
  fi
  rg -q "$expected" "$TMP/stderr"
  ! rg -q 'fetch failed' "$TMP/stderr"
}

jq -n --arg title "$(printf 'T%.0s' $(jot 33))" \
  '{title:$title,author:"",summary:""}' > "$TMP/title.json"
run_invalid 'title exceeds 32 characters' "$TMP/title.json" "$TMP/article.html" "$TMP/cover.png"

jq -n --arg author "$(printf 'A%.0s' $(jot 17))" \
  '{title:"标题",author:$author,summary:""}' > "$TMP/author.json"
run_invalid 'author exceeds 16 characters' "$TMP/author.json" "$TMP/article.html" "$TMP/cover.png"

jq -n --arg summary "$(printf 'S%.0s' $(jot 121))" \
  '{title:"标题",author:"",summary:$summary}' > "$TMP/summary.json"
run_invalid 'summary exceeds 120 characters' "$TMP/summary.json" "$TMP/article.html" "$TMP/cover.png"

printf '{"title":"标题","author":"","summary":""}\n' > "$TMP/valid.json"
run_invalid 'article content is empty' "$TMP/valid.json" "$TMP/empty.html" "$TMP/cover.png"
run_invalid 'cover must be a PNG file' "$TMP/valid.json" "$TMP/article.html" "$TMP/cover.jpg"
run_invalid 'cover is not a valid PNG' "$TMP/valid.json" "$TMP/article.html" "$TMP/cover.png"

test ! -s "$REQUEST_LOG"

node -e 'require("node:fs").writeFileSync(process.argv[1], Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=", "base64"))' "$TMP/valid-cover.png"

if WECHAT_APP_ID=example WECHAT_APP_SECRET=example WECHAT_API_BASE="$API_BASE" \
  node "$ROOT/skills/wechat-article-publisher/scripts/upload-draft.mjs" \
    --metadata "$TMP/valid.json" \
    --html "$TMP/article.html" \
    --cover "$TMP/valid-cover.png" >"$TMP/stdout" 2>"$TMP/stderr"; then
  echo "Expected mock draft rejection" >&2
  exit 1
fi

rg -q 'draft creation failed: 40007' "$TMP/stderr"
rg -q 'cover cleanup succeeded' "$TMP/stderr"

cat > "$TMP/expected-requests" <<'REQUESTS'
GET /cgi-bin/token
POST /cgi-bin/material/add_material
POST /cgi-bin/draft/add
POST /cgi-bin/material/del_material
REQUESTS
diff -u "$TMP/expected-requests" "$REQUEST_LOG"

stop_server
start_server draft-disconnect

if WECHAT_APP_ID=example WECHAT_APP_SECRET=example WECHAT_API_BASE="$API_BASE" \
  node "$ROOT/skills/wechat-article-publisher/scripts/upload-draft.mjs" \
    --metadata "$TMP/valid.json" \
    --html "$TMP/article.html" \
    --cover "$TMP/valid-cover.png" >"$TMP/stdout" 2>"$TMP/stderr"; then
  echo "Expected uncertain mock draft result" >&2
  exit 1
fi

rg -q 'draft result uncertain' "$TMP/stderr"
rg -q 'mock-cover-media-id' "$TMP/stderr"

cat > "$TMP/expected-uncertain-requests" <<'REQUESTS'
GET /cgi-bin/token
POST /cgi-bin/material/add_material
POST /cgi-bin/draft/add
REQUESTS
diff -u "$TMP/expected-uncertain-requests" "$REQUEST_LOG"

echo "upload validation tests passed"
