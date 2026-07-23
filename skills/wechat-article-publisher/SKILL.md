---
name: wechat-article-publisher
description: Use when a user wants to prepare, format, upload, save, or publish a Chinese article to a WeChat Official Account, including 微信公众号排版、首图、草稿箱、发布包、一句话发布.
---

# WeChat Article Publisher

## Overview

Prepare a restrained, traceable WeChat publication package. Never confuse package preparation, draft upload, and public publication.

## Load Reference

Read [references/publishing-policy.md](references/publishing-policy.md) before any upload or publication action.

## Workflow

1. Confirm the article is approved and evidence treatment is complete.
2. Confirm account type and whether official draft API permission is available.
3. Collect one title, optional author, summary, and exact cover sentence.
4. Keep body imagery off by default. Use short paragraphs, numbered transitions, dividers, and sparse pull quotes.
5. Run:

```bash
node skills/wechat-article-publisher/scripts/prepare.mjs \
  --input <article.md> \
  --output <output-directory> \
  --title <title> \
  --author <author> \
  --summary <summary> \
  --cover-copy <exact-cover-sentence> \
  --brand "示例公众号" \
  --account-type "service"
```

`--brand` controls the small footer on the cover and defaults to `公众号文章`.
`--account-type` accepts `personal`, `subscription`, `service`, or `unknown`; it defaults to `unknown`.

6. Inspect `cover.png`, `article.html`, and `metadata.json` before handoff.
7. Prefer the official draft API when available. Read the public AppID from `config.json` and store AppSecret in macOS Keychain service `codex.wechat.appsecret`. Environment variables may override the AppID or supply AppSecret for a one-off test only.
8. Upload the prepared package:

```bash
node skills/wechat-article-publisher/scripts/upload-draft.mjs \
  --metadata <output-directory>/metadata.json \
  --html <output-directory>/article.html \
  --cover <output-directory>/cover.png
```

9. If draft API permission is unavailable, use the signed-in editor only through a supported browser surface; otherwise return the local handoff.
10. Public publication requires an explicit action-time confirmation. Preparing or saving a draft is not permission to publish. Personal accounts may not have official API publication permission even when draft creation works.

## Output Contract

- `article.md`: approved source.
- `article.html`: local mobile preview and rich-copy helper.
- `cover.svg` and `cover.png`: deterministic exact-text cover.
- `metadata.json`: publishing fields and safety state.
- `sources.md`: evidence notes when supplied by the article workflow.

## Hard Stops

- Do not store passwords, cookies, AppSecret, access tokens, or browser profile data in the Skill, workspace, logs, or shell history. Use macOS Keychain for persistent AppSecret storage.
- Do not claim an upload succeeded without an observable draft confirmation.
- Do not bypass browser security restrictions with another automation surface.
- Do not download arbitrary web images. Use author-owned material or a verified licence and record provenance.
- Do not generate body illustrations unless the user explicitly requests them.
- Do not click public publish from a prior general instruction; confirm at action time.

## One-Sentence Invocation

When the user says `把这篇文章准备成公众号草稿`, infer the saved style, prepare the package, and use the official draft API when configured. Otherwise return the local handoff without overstating completion.
