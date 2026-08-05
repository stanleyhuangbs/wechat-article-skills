---
name: handwrite-ppt-editor
description: Use whenever the user wants to turn a document, article, outline, structure, logic, lecture, or technical topic into an editable 16:9 handwritten HTML presentation. Trigger for Chinese academic handwritten decks, Notability-style slides, editable flowcharts, tables, diagrams, or requests to save HTML and export the edited version to PDF.
---

# Handwrite PPT Editor

把文档、文章、讲稿、提纲、结构或逻辑，制作成 16:9 的 Notability 学术手写风 HTML 幻灯片。默认采用两阶段交付：

1. 先沟通页数、故事线和重点，只生成可播放、可编辑的 HTML。
2. 用户在 HTML 中修改并确认后，再从当前 HTML 导出 PDF。

## 开始前先沟通

生成前先确认：

- 输入材料属于文章、讲稿、提纲、结构还是逻辑草案；
- 目标页数或页数范围；
- 观众必须记住的 3—6 个核心判断；
- 是否需要表格、流程图、坐标图、示意图和讲稿备注。

若用户没有给出页数，先提出建议页数和页面分配，得到确认后再生成。

## 内容与页面

不要把原文段落直接塞进页面。先提取总问题、背景、核心判断、证据、例子和结论，再拆成 12—24 页。推荐顺序：

封面 → 变化或问题 → 为什么重要 → 证据与推导 → 方法/流程 → 陷阱或边界 → 结论。

每页只回答一个问题，正文保留 3—6 行关键文字。复杂信息优先转成图、表、坐标轴、流程或公式。

默认风格：

- 淡暖白背景，深蓝黑文字；
- 蓝色表现主线，玫红表现结论或警告，绿色表现成立条件，黄色只强调关键词；
- 优先使用 HanziPen SC、Hannotate SC、LXGW WenKai、Kaiti SC 或楷体；
- 保留略微不齐的基线和手绘线条；
- 避免商业模板式卡片、渐变、阴影、照片背景和装饰图标。

## 图形保留边界

原有手写 SVG、底图、线条、曲线和复杂路径优先原样保留。不要把它们截图化，也不要用 PPT 转换流程反向重绘，避免丢失手写流程图。

允许编辑的对象：

- 普通 HTML 文本框：文字、位置、大小、字号、行距、颜色、对齐、粗体和不换行；
- SVG 文字标签：双击编辑文字，移动模式下拖动位置；
- 圆点、椭圆、矩形等简单 SVG 图形：在图形编辑模式下拖动；
- 流程图节点和表格单元格：使用原生 HTML/SVG 元素，不烘焙成图片。

默认不强行编辑复杂曲线的走向；如果实现稳定，可提供端点拖动、拉长、缩短或改变指向。

流程图应包含稳定的 `data-flow-id`，节点文字放在 `<text>` 或可编辑 HTML 元素中，箭头使用 SVG marker。至少支持开始/结束、普通步骤、判断分支和回流箭头四种语义。

## HTML 编辑器要求

每份 HTML 应包含：

- 固定 16:9 页面容器，无滚动条和溢出；
- 左右键、空格和页面按钮翻页；
- 进入编辑；
- 选择并移动普通文本框；
- 调整文本框大小；
- 字号增减；
- 行距调整；
- 颜色和对齐；
- 粗体；
- 不换行，同时处理 CSS `white-space` 和显式 `<br>`；
- 编辑 SVG 图形与文字；
- 保存当前 HTML；
- 从当前 HTML 导出 PDF/打印；
- 重置位置。

普通文本框使用稳定的 `data-edit-id`。进入编辑后支持 `contenteditable`、拖动和调整大小。SVG 的 `<text contenteditable>` 在浏览器中不稳定，因此双击 SVG 文本时使用明确的编辑入口并更新 `textContent`，移动时更新 `x/y`。

## 保存与导出

“保存当前 HTML”必须下载一个独立 HTML：

- 内联所需 CSS；
- 保留 HTML、SVG、翻页脚本和打印脚本；
- 不依赖原目录的 assets；
- 重新打开后仍能翻页、编辑、保存和导出；
- 显示实际下载文件名和保存状态。

克隆文档时使用：

```js
const clone = document.documentElement.cloneNode(true);
const body = clone.querySelector('body');
```

不要使用 `clone.body`，因为 `cloneNode(true)` 得到的是 `html` 元素。

导出 PDF 使用当前 HTML 的 `window.print()`。打印样式必须隐藏工具栏，让每个 `.slide` 独占一页：

```css
@media print {
  .toolbar, .notes { display: none !important; }
  .slide {
    display: block !important;
    position: relative !important;
    break-after: page;
    page-break-after: always;
  }
}
```

不要放置“打开生成前 PDF”的按钮；用户要的是编辑确认后的当前版本。

## 验证清单

交付前实际打开 HTML 并验证：

1. 左右键和空格能逐页播放；
2. 普通文字能编辑、移动、调整大小；
3. 字号、行距、不换行按钮确实作用于选中对象；
4. SVG 文字标签可编辑、可移动；
5. 简单图形仍可拖动；
6. 保存后的 HTML 能独立打开并保留全部能力；
7. 导出 PDF 的页数与当前幻灯片页数一致；
8. 逐页或总览检查中文、表格、流程图、标注和边界。

首次交付以 HTML 为主。PNG 总览只用于内部视觉检查，不替代可播放 HTML。