#!/usr/bin/env node

import { appendFileSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";

const [portFile, requestLog, mode = "draft-reject"] = process.argv.slice(2);
if (!portFile || !requestLog || !["draft-reject", "draft-disconnect"].includes(mode)) {
  throw new Error(
    "usage: mock-wechat-server.mjs port-file request-log [draft-reject|draft-disconnect]",
  );
}

const server = createServer(async (request, response) => {
  for await (const _chunk of request) {
    // Consume the request body before responding.
  }

  const url = new URL(request.url, "http://127.0.0.1");
  appendFileSync(requestLog, `${request.method} ${url.pathname}\n`);
  response.setHeader("content-type", "application/json");

  switch (url.pathname) {
  case "/cgi-bin/token":
    response.end(JSON.stringify({ access_token: "mock-access-token", expires_in: 7200 }));
    break;
  case "/cgi-bin/material/add_material":
    response.end(JSON.stringify({ media_id: "mock-cover-media-id" }));
    break;
  case "/cgi-bin/draft/add":
    if (mode === "draft-disconnect") {
      request.socket.destroy();
    } else {
      response.end(JSON.stringify({ errcode: 40007, errmsg: "invalid media_id" }));
    }
    break;
  case "/cgi-bin/material/del_material":
    response.end(JSON.stringify({ errcode: 0, errmsg: "ok" }));
    break;
  default:
    response.statusCode = 404;
    response.end(JSON.stringify({ errcode: 404, errmsg: "not found" }));
  }
});

server.listen(0, "127.0.0.1", () => {
  const address = server.address();
  writeFileSync(portFile, `${address.port}\n`);
});

process.on("SIGTERM", () => server.close());
