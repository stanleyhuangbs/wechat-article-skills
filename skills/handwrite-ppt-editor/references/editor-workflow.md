# 编辑、保存与导出约定

## 两阶段交付

先生成可播放 HTML，不预先生成 PDF。用户在浏览器中修改并保存后，再从当前 HTML 打印为 PDF。

## 稳定标识

普通文本框使用 `data-edit-id`；流程图组件使用 `data-flow-id`。保存和重新打开时不能丢失这些标识。

## 普通文本

选中后提供：

- contenteditable 编辑
- 拖动位置
- 调整大小
- 字号增减
- 行距
- 颜色、对齐和粗体
- 不换行

不换行需要同时移除或替换显式 `<br>`，并设置 `white-space: nowrap`。

## SVG 文本与图形

不要依赖 `<text contenteditable>`。双击 SVG 文本标签时用 prompt 或自定义编辑框写回 `textContent`；移动时写回 `x` 和 `y`。

圆、椭圆和矩形可以更新 `cx/cy` 或 `x/y`。复杂曲线默认只保留视觉效果，不强行改写路径。

## 独立保存

```js
const clone = document.documentElement.cloneNode(true);
const body = clone.querySelector('body');
```

将当前 CSS 和脚本内联到克隆文档中，移除对原目录 assets 的依赖，再通过 Blob 下载。保存后的文件必须能继续播放、编辑、保存和导出。

## 打印

调用 `window.print()`。使用 `@media print` 隐藏工具栏，并让每个 slide 使用 `break-after: page`。打印按钮必须导出当前编辑状态，而不是链接旧 PDF。