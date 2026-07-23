#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { userInfo } from "node:os";
import { basename, extname, resolve } from "node:path";

const KEYCHAIN_SERVICE = "codex.wechat.appsecret";

function loadConfig() {
  try {
    return JSON.parse(readFileSync(new URL("../config.json", import.meta.url), "utf8"));
  } catch {
    return {};
  }
}

function parseArgs(argv) {
  const values = {};
  for (let index = 0; index < argv.length; index += 2) {
    const key = argv[index];
    const value = argv[index + 1];
    if (!key?.startsWith("--") || value === undefined) {
      throw new Error(`Invalid argument near ${key ?? "end of command"}`);
    }
    values[key.slice(2)] = value;
  }
  for (const required of ["metadata", "html", "cover"]) {
    if (!values[required]) throw new Error(`Missing --${required}`);
  }
  return values;
}

function getSecret(appId, keychainService) {
  if (process.env.WECHAT_APP_SECRET) return process.env.WECHAT_APP_SECRET;
  if (process.platform !== "darwin") throw new Error("Set WECHAT_APP_SECRET for this run");
  try {
    return execFileSync(
      "/usr/bin/security",
      ["find-generic-password", "-a", appId, "-s", keychainService, "-w"],
      {
        encoding: "utf8",
        env: { ...process.env, HOME: userInfo().homedir },
        stdio: ["ignore", "pipe", "ignore"],
      },
    ).trim();
  } catch {
    throw new Error(`No AppSecret found in macOS Keychain service ${keychainService}`);
  }
}

function extractArticleContent(html) {
  const match = html.match(/<article\s+id="wechat-content"[^>]*>([\s\S]*?)<\/article>/i);
  if (!match) throw new Error("Could not find #wechat-content in HTML");
  return match[1].trim();
}

async function readJson(response, operation) {
  const payload = await response.json();
  if (!response.ok || payload.errcode) {
    throw new WeChatAPIError(
      operation,
      payload.errcode ?? response.status,
      payload.errmsg ?? response.statusText,
    );
  }
  return payload;
}

class WeChatAPIError extends Error {
  constructor(operation, code, detail) {
    super(`${operation} failed: ${code} ${detail}`);
    this.name = "WeChatAPIError";
    this.operation = operation;
    this.code = code;
  }
}

function characterCount(value) {
  return Array.from(value).length;
}

function validateTextField(value, name, maximum, required = false) {
  if (typeof value !== "string") throw new Error(`${name} must be a string`);
  const normalized = value.trim();
  if (required && !normalized) throw new Error(`${name} is required`);
  if (characterCount(normalized) > maximum) {
    throw new Error(`${name} exceeds ${maximum} characters`);
  }
  return normalized;
}

function validateDraftInputs(metadata, content, coverPath) {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    throw new Error("metadata must be a JSON object");
  }
  const title = validateTextField(metadata.title, "title", 32, true);
  const author = validateTextField(metadata.author || "", "author", 16);
  const summary = validateTextField(metadata.summary || "", "summary", 120);
  if (!content.trim()) throw new Error("article content is empty");
  if (extname(coverPath).toLowerCase() !== ".png") {
    throw new Error("cover must be a PNG file");
  }
  const coverData = readFileSync(coverPath);
  validatePng(coverData, coverPath);

  const contentSourceUrl = metadata.contentSourceUrl || "";
  if (typeof contentSourceUrl !== "string") {
    throw new Error("contentSourceUrl must be a string");
  }
  const normalizedSourceUrl = contentSourceUrl.trim();
  if (normalizedSourceUrl) {
    let parsed;
    try {
      parsed = new URL(normalizedSourceUrl);
    } catch {
      throw new Error("contentSourceUrl must be an HTTP or HTTPS URL");
    }
    if (!["http:", "https:"].includes(parsed.protocol)) {
      throw new Error("contentSourceUrl must be an HTTP or HTTPS URL");
    }
  }

  return {
    title,
    author,
    summary,
    content: content.trim(),
    contentSourceUrl: normalizedSourceUrl,
    coverData,
  };
}

function validatePng(data, filePath) {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const hasSignature = data.length >= 33 && data.subarray(0, 8).equals(signature);
  const hasIHDR = hasSignature
    && data.readUInt32BE(8) === 13
    && data.subarray(12, 16).toString("ascii") === "IHDR"
    && data.readUInt32BE(16) > 0
    && data.readUInt32BE(20) > 0;
  if (!hasIHDR) throw new Error("cover is not a valid PNG");

  if (process.platform === "darwin") {
    try {
      execFileSync(
        "/usr/bin/sips",
        ["-g", "pixelWidth", "-g", "pixelHeight", filePath],
        { stdio: "ignore" },
      );
    } catch {
      throw new Error("cover is not a decodable PNG");
    }
  }
}

async function deleteMaterial(apiBase, accessToken, mediaId) {
  try {
    const deleteUrl = new URL(`${apiBase}/cgi-bin/material/del_material`);
    deleteUrl.searchParams.set("access_token", accessToken);
    const response = await fetch(deleteUrl, {
      method: "POST",
      headers: { "content-type": "application/json; charset=utf-8" },
      body: JSON.stringify({ media_id: mediaId }),
    });
    await readJson(response, "cover cleanup");
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const config = loadConfig();
  const appId = process.env.WECHAT_APP_ID || config.appId;
  if (!appId) throw new Error("Set WECHAT_APP_ID");

  const metadata = JSON.parse(readFileSync(resolve(args.metadata), "utf8"));
  const html = readFileSync(resolve(args.html), "utf8");
  const content = extractArticleContent(html);
  const coverPath = resolve(args.cover);
  const validated = validateDraftInputs(metadata, content, coverPath);

  const keychainService = config.keychainService || KEYCHAIN_SERVICE;
  const appSecret = getSecret(appId, keychainService);
  const apiBase = (process.env.WECHAT_API_BASE || "https://api.weixin.qq.com").replace(/\/$/, "");

  const tokenUrl = new URL(`${apiBase}/cgi-bin/token`);
  tokenUrl.searchParams.set("grant_type", "client_credential");
  tokenUrl.searchParams.set("appid", appId);
  tokenUrl.searchParams.set("secret", appSecret);
  const tokenPayload = await readJson(await fetch(tokenUrl), "access token");

  const coverUrl = new URL(`${apiBase}/cgi-bin/material/add_material`);
  coverUrl.searchParams.set("access_token", tokenPayload.access_token);
  coverUrl.searchParams.set("type", "image");
  const form = new FormData();
  form.append("media", new Blob([validated.coverData], { type: "image/png" }), basename(coverPath));
  const coverPayload = await readJson(await fetch(coverUrl, { method: "POST", body: form }), "cover upload");

  const draftUrl = new URL(`${apiBase}/cgi-bin/draft/add`);
  draftUrl.searchParams.set("access_token", tokenPayload.access_token);
  let draftPayload;
  try {
    draftPayload = await readJson(await fetch(draftUrl, {
      method: "POST",
      headers: { "content-type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        articles: [{
          title: validated.title,
          author: validated.author,
          digest: validated.summary,
          content: validated.content,
          content_source_url: validated.contentSourceUrl,
          thumb_media_id: coverPayload.media_id,
          need_open_comment: 0,
          only_fans_can_comment: 0,
        }],
      }),
    }), "draft creation");
  } catch (error) {
    if (error instanceof WeChatAPIError) {
      const cleaned = await deleteMaterial(apiBase, tokenPayload.access_token, coverPayload.media_id);
      const cleanupStatus = cleaned
        ? "cover cleanup succeeded"
        : `cover cleanup failed; delete media ${coverPayload.media_id} manually`;
      throw new Error(`${error.message}; ${cleanupStatus}`);
    }
    throw new Error(
      `${error.message}; draft result uncertain; cover media ${coverPayload.media_id} was not deleted`,
    );
  }

  process.stdout.write(`${JSON.stringify({
    status: "draft_created",
    draftMediaId: draftPayload.media_id,
    title: metadata.title,
  }, null, 2)}\n`);
}

main().catch((error) => {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
});
