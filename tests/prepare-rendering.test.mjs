import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { after, test } from "node:test";

const root = fileURLToPath(new URL("../", import.meta.url));
const script = join(root, "skills/wechat-article-publisher/scripts/prepare.mjs");
const outputRoot = mkdtempSync(join(tmpdir(), "wechat-rendering-"));
let sequence = 0;
after(() => rmSync(outputRoot, { recursive: true, force: true }));

function render(markdown, style) {
  const input = join(outputRoot, `input-${sequence}.md`);
  const output = join(outputRoot, `output-${sequence++}`);
  writeFileSync(input, markdown);
  const args = [script, "--input", input, "--output", output, "--title", "测试", "--cover-mode", "none"];
  if (style !== undefined) args.push("--style", style);
  execFileSync(process.execPath, args, { stdio: "pipe" });
  const html = readFileSync(join(output, "article.html"), "utf8");
  const body = html.match(/<article id="wechat-content"[^>]*>\n([\s\S]*?)\n    <\/article>/)?.[1];
  assert.ok(body !== undefined, "article body exists");
  return { body, metadata: JSON.parse(readFileSync(join(output, "metadata.json"), "utf8")) };
}

function codeBlocks(body) {
  return [...body.matchAll(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/g)].map((match) => match[1]);
}

test("default and explicit minimal preserve the pre-PR ordinary article body", () => {
  const input = readFileSync(join(root, "tests/fixtures/minimal-regression.md"), "utf8");
  const expected = readFileSync(join(root, "tests/fixtures/minimal-regression.html"), "utf8").trimEnd();
  for (const style of [undefined, "minimal"]) {
    const result = render(input, style);
    assert.equal(result.body, expected);
    assert.equal(result.metadata.style, "minimal");
  }
});

for (const style of ["minimal", "orange-tech"]) {
  test(`${style}: language, whitespace and literal code survive HTML escaping`, () => {
    const { body } = render("```js\n  const x = '<x>&';\n\n**literal** [link](https://example.com)\n```", style);
    assert.match(body, /data-language="js"/);
    assert.deepEqual(codeBlocks(body), ["  const x = &#39;&lt;x&gt;&amp;&#39;;\n\n**literal** [link](https://example.com)"]);
    assert.doesNotMatch(body, /<strong|<a /);
  });

  test(`${style}: an unclosed fence preserves all remaining content at EOF`, () => {
    const { body } = render("前文\n\n```js\nx\n\n后文  ", style);
    assert.deepEqual(codeBlocks(body), ["x\n\n后文  "]);
    assert.match(body, /前文/);
  });

  test(`${style}: adjacent blocks and subsequent prose stay separate`, () => {
    const { body } = render("```js\na\n```\n```sh\nb\n```\n后文", style);
    assert.deepEqual(codeBlocks(body), ["a", "b"]);
    assert.match(body, /data-language="js"/);
    assert.match(body, /data-language="sh"/);
    assert.match(body, /<p[^>]*>后文<\/p>/);
  });

  test(`${style}: empty and empty unclosed fences do not swallow following blocks`, () => {
    assert.deepEqual(codeBlocks(render("```\n```\n后文", style).body), [""]);
    assert.deepEqual(codeBlocks(render("```", style).body), [""]);
    assert.match(render("```\n```\n后文", style).body, /后文/);
  });

  test(`${style}: a longer outer fence preserves inner Markdown fences`, () => {
    const { body } = render("````markdown\n```js\nx\n```\n````", style);
    assert.deepEqual(codeBlocks(body), ["```js\nx\n```"]);
  });

  test(`${style}: only matching bare fences close a code block`, () => {
    const { body } = render("````js\na\n```\n~~~\n````sh\nb\n`````  \n后文", style);
    assert.deepEqual(codeBlocks(body), ["a\n```\n~~~\n````sh\nb"]);
    assert.match(body, /<p[^>]*>后文<\/p>/);
  });

  test(`${style}: tilde fences, CRLF and opening indentation are supported`, () => {
    const { body } = render("  ~~~sh\r\n    echo hi\r\n\r\n  ~~~\r\n后文", style);
    assert.deepEqual(codeBlocks(body), ["  echo hi\n"]);
    assert.match(body, /data-language="sh"/);
    assert.match(body, /后文/);
  });

  test(`${style}: language metadata cannot inject an HTML attribute`, () => {
    const { body } = render('```"><img/src=x>\nx\n```', style);
    assert.match(body, /data-language="&quot;&gt;&lt;img\/src=x&gt;"/);
    assert.doesNotMatch(body, /<img/);
  });

  test(`${style}: backticks in an info string do not open a code block`, () => {
    assert.deepEqual(codeBlocks(render("```bad`info\n正文", style).body), []);
  });
}

test("orange-tech supplies styled headings, quotes and wrapping pre/code blocks", () => {
  const { body, metadata } = render("# 标题\n\n> 引用\n\n```sh\nx\n```", "orange-tech");
  assert.match(body, /<h2[^>]*background:#ff6a00/);
  assert.match(body, /<blockquote[^>]*background:#fff8f0/);
  assert.match(body, /<pre[^>]*background:#1e1e1e;color:#d4d4d4/);
  assert.match(body, /white-space:pre-wrap;word-break:break-all/);
  assert.equal(metadata.style, "orange-tech");
});

test("unknown styles are rejected", () => {
  assert.throws(() => render("正文", "unknown"));
});
