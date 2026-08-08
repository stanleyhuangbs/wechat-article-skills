#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { copyFileSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

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
  for (const required of ["input", "output", "title"]) {
    if (!values[required]) throw new Error(`Missing --${required}`);
  }
  return values;
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderInline(value) {
  let rendered = escapeHtml(value);
  rendered = rendered.replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, (_match, label, url) =>
    `<a href="${url}" style="color:#8a2d26;text-decoration:underline;text-underline-offset:3px;">${label}</a>`,
  );
  rendered = rendered.replace(/\*\*([^*]+)\*\*/g, "<strong style=\"font-weight:650;color:#171717;\">$1</strong>");
  return rendered;
}

function renderMarkdown(markdown, style = "minimal") {
  const orange = style === "orange-tech";
  const blocks = [];
  const lines = markdown.replaceAll("\r\n", "\n").split("\n");
  let paragraph = [];
  let code = null;

  const flush = () => {
    if (!paragraph.length) return;
    blocks.push(`<p style="margin:0 0 1.35em;font-size:16px;line-height:1.9;color:#2a2a2a;text-align:justify;">${renderInline(paragraph.join(" "))}</p>`);
    paragraph = [];
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (line.startsWith("```")) {
      if (code) {
        blocks.push(orange
          ? `<section style="margin:20px 0;padding:16px 20px;background:#1e1e1e;border-radius:8px;overflow:auto;color:#d4d4d4;font:13px/1.7 SFMono-Regular,Consolas,monospace;white-space:pre;">${escapeHtml(code.join("\n"))}</section>`
          : `<pre style="margin:1.8em 0;padding:15px 18px;background:#f7f6f4;border-radius:4px;overflow:auto;font:13px/1.7 SFMono-Regular,Consolas,monospace;">${escapeHtml(code.join("\n"))}</pre>`);
        code = null;
      } else { flush(); code = []; }
      continue;
    }
    if (code) { code.push(rawLine); continue; }
    if (!line) {
      flush();
      continue;
    }
    if (/^---+$/.test(line)) {
      flush();
      blocks.push('<section style="margin:2.2em auto;width:42px;border-top:1px solid #b9b3ad;"></section>');
      continue;
    }
    if (/^#{1,3}\s+/.test(line)) {
      flush();
      blocks.push(orange
        ? `<h2 style="margin:28px auto 16px;padding:8px 20px;display:table;font-size:17px;font-weight:600;line-height:1.6;text-align:center;color:#fff;background:#ff6a00;border-radius:30px;letter-spacing:.02em;">${renderInline(line.replace(/^#{1,3}\s+/, ""))}</h2>`
        : `<p style="margin:2.2em 0 1em;font-size:19px;line-height:1.6;font-weight:650;color:#171717;">${renderInline(line.replace(/^#{1,3}\s+/, ""))}</p>`);
      continue;
    }
    if (/^\d+、/.test(line)) {
      flush();
      blocks.push(`<p style="margin:2.2em 0 1em;font-size:18px;line-height:1.65;font-weight:650;color:#171717;">${renderInline(line)}</p>`);
      continue;
    }
    if (line.startsWith("> ")) {
      flush();
      blocks.push(orange
        ? `<blockquote style="margin:20px 0;padding:16px 20px;background:#fff8f0;border-left:3px solid #ff6a00;border-radius:0 8px 8px 0;color:#8b4000;font-style:italic;font-size:15px;line-height:1.8;">${renderInline(line.slice(2))}</blockquote>`
        : `<section style="margin:1.8em 0;padding:15px 18px;border-left:3px solid #9d332c;background:#f7f6f4;color:#3f3f3f;font-size:16px;line-height:1.85;">${renderInline(line.slice(2))}</section>`);
      continue;
    }
    paragraph.push(line);
  }
  flush();
  return blocks.join("\n");
}

function plainText(markdown) {
  return markdown
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^#{1,3}\s+/gm, "")
    .replace(/^>\s+/gm, "")
    .replace(/^---+$/gm, "")
    .replace(/\*\*/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function jsonForInlineScript(value) {
  return JSON.stringify(value)
    .replaceAll("&", "\\u0026")
    .replaceAll("<", "\\u003c")
    .replaceAll(">", "\\u003e")
    .replaceAll("\u2028", "\\u2028")
    .replaceAll("\u2029", "\\u2029");
}

function normalizeAccountType(value) {
  const accountType = (value || "unknown").trim().toLowerCase();
  const allowed = new Set(["unknown", "personal", "subscription", "service"]);
  if (!allowed.has(accountType)) {
    throw new Error("--account-type must be unknown, personal, subscription, or service");
  }
  return accountType;
}

function normalizeCoverMode(value) {
  const coverMode = (value || "cover").trim().toLowerCase();
  if (!new Set(["cover", "none"]).has(coverMode)) {
    throw new Error("--cover-mode must be cover or none");
  }
  return coverMode;
}

function weightedLength(char) {
  return /[\x00-\xff]/.test(char) ? 0.58 : 1;
}

function wrapCoverText(text, maxWeight = 17) {
  const lines = [];
  let current = "";
  let weight = 0;
  for (const char of text) {
    const nextWeight = weightedLength(char);
    if (current && weight + nextWeight > maxWeight) {
      lines.push(current.trim());
      current = "";
      weight = 0;
    }
    current += char;
    weight += nextWeight;
    if (/[，。！？]/.test(char) && weight >= maxWeight * 0.68) {
      lines.push(current.trim());
      current = "";
      weight = 0;
    }
  }
  if (current.trim()) lines.push(current.trim());
  return lines.slice(0, 4);
}

function renderCoverSvg(copy, brand) {
  const lines = wrapCoverText(copy);
  const lineHeight = 64;
  const startY = 100 - Math.max(0, lines.length - 3) * 18;
  const tspans = lines
    .map((line, index) => `<tspan x="72" y="${startY + index * lineHeight}">${escapeHtml(line)}</tspan>`)
    .join("\n      ");
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="900" height="383" viewBox="0 0 900 383">
  <rect width="900" height="383" fill="#f7f6f2"/>
  <rect x="42" y="48" width="6" height="287" rx="3" fill="#9d332c"/>
  <text font-family="STHeiti, PingFang SC, Heiti SC, sans-serif" font-size="38" font-weight="600" fill="#171717" letter-spacing="0">
      ${tspans}
  </text>
  <text x="72" y="330" font-family="STHeiti, PingFang SC, Heiti SC, sans-serif" font-size="15" fill="#77716b" letter-spacing="2">${escapeHtml(brand)}</text>
</svg>`;
}

function renderHtml({ title, author, summary, bodyHtml, bodyText }) {
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)} - 微信排版预览</title>
  <style>
    body { margin: 0; background: #eceae6; color: #222; font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif; }
    .toolbar { position: sticky; top: 0; z-index: 2; display: flex; gap: 12px; align-items: center; padding: 12px 18px; background: #171717; color: #fff; }
    .toolbar button { border: 0; border-radius: 4px; padding: 9px 15px; background: #fff; color: #171717; font-weight: 600; cursor: pointer; }
    .toolbar span { font-size: 13px; opacity: .75; }
    .phone { width: min(100% - 28px, 680px); margin: 22px auto 60px; background: #fff; box-shadow: 0 8px 28px rgba(0,0,0,.08); }
    .meta { padding: 34px 28px 4px; }
    .meta h1 { margin: 0 0 12px; font-size: 26px; line-height: 1.35; letter-spacing: 0; }
    .meta p { margin: 4px 0; color: #8a8580; font-size: 14px; }
    #wechat-content { padding: 24px 28px 44px; }
    @media (max-width: 560px) { .phone { width: 100%; margin: 0; box-shadow: none; } .meta, #wechat-content { padding-left: 20px; padding-right: 20px; } }
  </style>
</head>
<body>
  <div class="toolbar">
    <button id="copy-rich">复制排版正文</button>
    <span id="copy-status">复制后粘贴到微信公众号编辑器</span>
  </div>
  <main class="phone">
    <header class="meta">
      <h1>${escapeHtml(title)}</h1>
      <p>${escapeHtml(author || "")}</p>
      <p>${escapeHtml(summary || "")}</p>
    </header>
    <article id="wechat-content" style="max-width:100%;box-sizing:border-box;font-family:-apple-system,BlinkMacSystemFont,'PingFang SC','Microsoft YaHei',sans-serif;letter-spacing:0;">
${bodyHtml}
    </article>
  </main>
  <script>
    const body = document.getElementById('wechat-content');
    const status = document.getElementById('copy-status');
    document.getElementById('copy-rich').addEventListener('click', async () => {
      try {
        const html = body.innerHTML;
        const text = ${jsonForInlineScript(bodyText)};
        if (window.ClipboardItem && navigator.clipboard?.write) {
          await navigator.clipboard.write([new ClipboardItem({
            'text/html': new Blob([html], { type: 'text/html' }),
            'text/plain': new Blob([text], { type: 'text/plain' })
          })]);
        } else {
          const range = document.createRange();
          range.selectNodeContents(body);
          const selection = window.getSelection();
          selection.removeAllRanges();
          selection.addRange(range);
          document.execCommand('copy');
          selection.removeAllRanges();
        }
        status.textContent = '已复制，可以粘贴到公众号编辑器';
      } catch (error) {
        status.textContent = '自动复制失败，请选中正文后手动复制';
      }
    });
  </script>
</body>
</html>`;
}

function renderCoverPng(copy, brand, outputDir) {
  const swiftRenderer = new URL("./render-svg.swift", import.meta.url).pathname;
  execFileSync(
    "/usr/bin/swift",
    [swiftRenderer, join(outputDir, "cover.png"), brand, ...wrapCoverText(copy)],
    { stdio: "ignore" },
  );
}

const args = parseArgs(process.argv.slice(2));
const inputPath = resolve(args.input);
const outputDir = resolve(args.output);
mkdirSync(outputDir, { recursive: true });

const markdown = readFileSync(inputPath, "utf8").trim();
const title = args.title.trim();
const author = (args.author || "").trim();
const summary = (args.summary || "").trim();
const coverMode = normalizeCoverMode(args["cover-mode"]);
const coverCopy = (args["cover-copy"] || "").trim();
if (coverMode === "cover" && !coverCopy) {
  throw new Error("Missing --cover-copy for cover mode");
}
const brand = (args.brand || "公众号文章").trim();
const style = (args.style || "minimal").trim().toLowerCase();
if (!["minimal", "orange-tech"].includes(style)) throw new Error("--style must be minimal or orange-tech");
const accountType = normalizeAccountType(args["account-type"]);

copyFileSync(inputPath, join(outputDir, "article.md"));
writeFileSync(join(outputDir, "article.html"), renderHtml({
  title,
  author,
  summary,
  bodyHtml: renderMarkdown(markdown, style),
  bodyText: plainText(markdown),
}));
writeFileSync(join(outputDir, "metadata.json"), `${JSON.stringify({
  title,
  author,
  summary,
  coverCopy,
  coverMode,
  style,
  accountType,
  publishMode: "api-draft-or-manual-handoff",
  draftTransport: coverMode === "cover" ? "api-draft-or-browser-editor" : "browser-editor",
  publicPublishConfirmed: false,
}, null, 2)}\n`);

rmSync(join(outputDir, "cover.svg"), { force: true });
rmSync(join(outputDir, "cover.png"), { force: true });
if (coverMode === "cover") {
  writeFileSync(join(outputDir, "cover.svg"), renderCoverSvg(coverCopy, brand));
  renderCoverPng(coverCopy, brand, outputDir);
}

process.stdout.write(`${outputDir}\n`);
