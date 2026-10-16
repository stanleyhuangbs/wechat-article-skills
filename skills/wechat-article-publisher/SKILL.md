---
name: wechat-article-publisher
description: Use when a user wants to write, format, upload, save, or publish a Chinese WeChat Official Account article, including 微信公众号排版、橙色科技教程风、代码块、卡片标题、首图、草稿箱、发布包或一句话发布.
---

# WeChat Article Publisher

## Overview

Prepare a restrained, traceable WeChat publication package. Never confuse package preparation, draft upload, and public publication.

## Load Reference

Read [references/publishing-policy.md](references/publishing-policy.md) before any upload or publication action.

## Workflow

1. Confirm the article is approved and evidence treatment is complete.
2. Confirm account type and whether official draft API permission is available.
3. Resolve the cover mode before preparing files:
   - `Skill 分享` defaults to **有封面图**.
   - `观点思考` defaults to **无封面图**.
   - When the content type is ambiguous, show a compact **选择框** with exactly `有封面图` and `无封面图`.
   - Respect an explicit user choice over these defaults.
4. Collect one title, optional author, and summary. Collect an exact cover sentence only for 有封面图 mode.
5. Keep body imagery off unless explicitly requested. Use short paragraphs, numbered transitions, dividers, and sparse pull quotes.
6. Prepare the selected mode.

有封面图:

```bash
node skills/wechat-article-publisher/scripts/prepare.mjs \
  --input <article.md> \
  --output <output-directory> \
  --title <title> \
  --author <author> \
  --summary <summary> \
  --cover-mode cover \
  --cover-copy <exact-cover-sentence> \
  --brand "示例公众号" \
  --account-type "service"
```

无封面图:

```bash
node skills/wechat-article-publisher/scripts/prepare.mjs \
  --input <article.md> \
  --output <output-directory> \
  --title <title> \
  --author <author> \
  --summary <summary> \
  --cover-mode none \
  --account-type "personal"
```

`--brand` controls the small footer on the cover and defaults to `公众号文章`.
`--account-type` accepts `personal`, `subscription`, `service`, or `unknown`; it defaults to `unknown`.
`--style` accepts `minimal` or `orange-tech`; it defaults to `minimal`. Use `orange-tech` for Skill、工具、教程和操作指南文章，生成橙色胶囊标题、暖色引用卡和深色终端代码块。

7. Inspect `article.html` and `metadata.json`; inspect `cover.png` only in 有封面图 mode.
8. For **无封面图**, use the signed-in公众号后台 **图文** entry (the tab the user may refer to as “贴图”). Paste the formatted body directly, do not upload or select any image, and save it to the draft box. Prefer this browser-editor route on the user's personal computer for 观点思考 articles.
9. For **有封面图**, prefer the official draft API when available. Read the public AppID from `config.json` and store AppSecret in macOS Keychain service `codex.wechat.appsecret`. Environment variables may override the AppID or supply AppSecret for a one-off test only.
10. Upload the prepared package:

```bash
node skills/wechat-article-publisher/scripts/upload-draft.mjs \
  --metadata <output-directory>/metadata.json \
  --html <output-directory>/article.html \
  --cover <output-directory>/cover.png
```

11. If draft API permission is unavailable, use the signed-in editor only through a supported browser surface; otherwise return the local handoff.
12. Public publication requires an explicit action-time confirmation. Preparing or saving a draft is not permission to publish. Personal accounts may not have official API publication permission even when draft creation works.

## Output Contract

- `article.md`: approved source.
- `article.html`: local mobile preview and rich-copy helper.
- `cover.svg` and `cover.png`: deterministic exact-text cover, present only in 有封面图 mode.
- `metadata.json`: publishing fields and safety state.
- `sources.md`: evidence notes when supplied by the article workflow.

## Style invocation

In a writing request, say “用橙色科技教程风排版”。 For the prepared package command, append `--style orange-tech`; omit it to keep the existing minimal style for ordinary prose.

Both styles support backtick and tilde code fences (at least three matching characters). A closing fence must use the same character, be at least as long as the opening fence, and contain only trailing spaces or tabs. An unclosed fence renders through the end of the article; it never discards the remaining content. The first info-string word is retained as escaped `data-language` metadata on `code`; syntax highlighting is not provided. Fenced code support also applies to `minimal`.

Code uses inline-styled `pre/code` with preserved whitespace and wrapping long lines. Before merging a style change, use [the editor fixture](../../tests/fixtures/orange-tech-editor.md) to verify copy → paste → save draft → reopen → mobile preview in the real WeChat editor. Check code whitespace and long lines, dark background and text contrast, pill headings, and quote cards. Local HTML preview and automated tests do not establish editor compatibility.

## Hard Stops

- Do not store passwords, cookies, AppSecret, access tokens, or browser profile data in the Skill, workspace, logs, or shell history. Use macOS Keychain for persistent AppSecret storage.
- Do not claim an upload succeeded without an observable draft confirmation.
- Do not bypass browser security restrictions with another automation surface.
- Do not download arbitrary web images. Use author-owned material or a verified licence and record provenance.
- Do not generate body illustrations unless the user explicitly requests them.
- Do not send 无封面图 packages through the current draft API path; it requires a cover. Use the signed-in 图文 editor and do not pretend an API upload occurred.
- Do not click public publish from a prior general instruction; confirm at action time.

## One-Sentence Invocation

When the user says `把这篇文章准备成公众号草稿`, infer the saved style, prepare the package, and use the official draft API when configured. Otherwise return the local handoff without overstating completion.
