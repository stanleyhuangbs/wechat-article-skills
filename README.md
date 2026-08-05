# WeChat Article Skills

把一个还没想清楚的中文选题，发展成经得起核验和反方追问的文章，再安全地准备成微信公众号草稿。

它不是一个“输入标题、自动生成爆款”的提示词包。它把真正困难的两件事拆开处理：先帮助作者形成可信观点，再根据内容类型选择有封面或无封面模式，排版后安全保存到公众号草稿箱。

```text
想法
  → 一次只问一个关键问题
  → 建立主张与证据台账
  → 反方检查与作者确认
  → 完成自然中文文章
  → 选择有图 / 无图模式
  → 排版与公众号草稿
```

## 为什么做成两个 Skill

| Skill | 帮你完成什么 | 核心边界 |
|---|---|---|
| `developing-credible-articles` | 从模糊想法中找到真正值得写的命题，补证据、查因果、找反例，形成可信文章 | 不编造事实、经历、引语或作者情绪；写稿前必须确认论证和证据处理 |
| `wechat-article-publisher` | 把确认后的 Markdown 文章转成微信友好的 HTML 和元数据，按内容类型决定是否生成封面，并保存到草稿箱 | 准备发布包、上传草稿和公开发布是三种不同动作；不会自动公开发布 |
| `handwrite-ppt-editor` | 把文档、文章或逻辑变成可编辑的手写 HTML，并从确认后的当前版本导出 PDF | 保留手绘 SVG、流程图和表格；先 HTML，后 PDF |

把它们分开，是为了让“写得可信”和“发布得安全”各自拥有清晰的权限边界。

## 它适合谁

- 经常写公众号长文，但不想再从空白文档硬憋结构的人
- 需要引用数据、研究、产品资料或真实案例的创作者
- 希望文章保留自己判断和声音，而不是套用统一 AI 文风的人
- 顾问、创业者、研究者、产品经理和管理者
- 想用 Codex 建立可重复内容工作流的个人或团队

## 它和普通写作提示词有什么不同

**先想清楚，再写。** 只有选题时，它不会立刻生成提纲，而是通过逐步问答确认读者、观察、观点、真实材料和反方解释。

**证据对应到具体主张。** 它区分事实、经历、推论、类比、观点和预测。来源无法支持原句时，会要求降级表述、继续核验或删除。

**反方可以推翻原结论。** 反方审查不是文章里的装饰段落。如果替代原因更强，命题必须缩小、增加条件，甚至放弃。

**不靠模仿某个作者制造“活人感”。** 自然语言来自真实经历、真实判断和作者自己的表达材料，不复制在世作者的身份、口癖或固定结尾。

**发布动作可追溯。** 文章准备、草稿上传和公开发布分别确认。没有单独授权时，流程最多停在草稿箱。

**封面模式跟着内容走。** Skill 分享默认有封面图；观点思考默认无封面图，直接靠正文第一句的主旨和张力吸引阅读；无法判断类型时才显示选择框。用户的明确选择始终优先。

**去 AI 味不是加口语词。** 成稿会检查空泛时代开场、对称排比、重复转折、过度总结、统一段落节奏和没有作者归属的判断，同时禁止靠编造经历或口癖假装“真人感”。

## 3 分钟安装

### 方法一：Skills CLI

```bash
npx skills add stanleyhuangbs/wechat-article-skills -g -y
```

安装后重启 Codex，让新的 Skill 被重新发现。

### 方法二：手动安装到 Codex

```bash
git clone https://github.com/stanleyhuangbs/wechat-article-skills.git
mkdir -p ~/.codex/skills
cp -R wechat-article-skills/skills/developing-credible-articles ~/.codex/skills/
cp -R wechat-article-skills/skills/wechat-article-publisher ~/.codex/skills/
```

只需要写作能力时，可以只复制 `developing-credible-articles`。

## 第一次使用

### 1. 从一个模糊想法开始

对 Codex 说：

```text
使用 $developing-credible-articles。
我想写一篇关于“AI 让管理者变轻松，还是让管理更复杂”的公众号文章。
先不要写稿，帮我把这个想法发展成一个可信命题。
```

Skill 会逐步帮助你确认：

- 文章真正写给谁
- 你观察到了什么，而不是“大家都知道什么”
- 哪些内容是事实，哪些只是推论
- 哪些数据和案例需要核验
- 最强的反方解释是什么
- 哪些内容可以写、必须归因、需要限定或应该删除

只有你确认论证图和证据处理后，它才进入正式写稿。

### 2. 把确认后的文章准备成公众号草稿

对 Codex 说：

```text
使用 $wechat-article-publisher。
把已经确认的 article.md 排版成公众号发布包。
标题是《AI 让管理更简单了吗？》
封面文案是“管理成本没有消失，只是换了位置”
封面底部显示“示例公众号”。
先生成本地预览，不要公开发布。
```

本地会生成：

```text
article.md       已确认的原文
article.html     微信排版预览与富文本复制
cover.svg        可检查的精确文字首图
cover.png        公众号首图
metadata.json    标题、作者、摘要和发布安全状态
```

## 直接运行排版脚本

当前发布器需要 macOS、Node.js 18+ 和 Xcode Command Line Tools。

```bash
node skills/wechat-article-publisher/scripts/prepare.mjs \
  --input article.md \
  --output output/my-article \
  --title "AI 让管理更简单了吗？" \
  --author "示例作者" \
  --summary "一篇讨论 AI 与管理成本的文章" \
  --cover-mode cover \
  --cover-copy "管理成本没有消失，只是换了位置" \
  --brand "示例公众号" \
  --account-type "service"
```

`--brand` 可省略，默认显示“公众号文章”。运行完成后先检查 `article.html` 和 `cover.png`。
`--account-type` 支持 `personal`、`subscription`、`service` 和 `unknown`，省略时默认为 `unknown`。

观点思考文章可直接生成无封面发布包：

```bash
node skills/wechat-article-publisher/scripts/prepare.mjs \
  --input article.md \
  --output output/my-article \
  --title "真正拉开差距的不是 AI 熟练度" \
  --author "示例作者" \
  --summary "一篇关于 AI 与判断力的观点文章" \
  --cover-mode none \
  --account-type "personal"
```

无封面模式不会生成 `cover.svg` 或 `cover.png`。保存草稿时进入已登录的公众号后台“图文”编辑入口，直接粘贴排版正文，不上传图片，再保存草稿。当前官方草稿 API 流程仍要求封面，因此无封面模式不会伪装成 API 上传成功。

## 配置微信公众号草稿 API

只有需要自动上传草稿时才需要这一步。你的公众号必须拥有相应的草稿 API 权限。

还需要把运行上传脚本这台机器的**公网 IP**加入微信公众号后台的接口 IP 白名单。如果公网 IP 经常变化，上传可能间歇失败；微信返回 `40164` 时，优先检查当前出口 IP 是否仍在白名单中。

### 1. 创建本地配置

```bash
cd skills/wechat-article-publisher
cp config.example.json config.json
```

把 `config.json` 中的 `appId` 改为公众号 AppID。AppID 是公开标识，但本地配置仍默认被 Git 忽略。

### 2. 把 AppSecret 存入 macOS Keychain

不要把 AppSecret 写入配置文件、命令参数或 Git 仓库。

```bash
security add-generic-password \
  -a "YOUR_APP_ID" \
  -s "codex.wechat.appsecret" \
  -U \
  -w
```

把 `YOUR_APP_ID` 替换成真实 AppID。`-w` 放在最后会安全提示输入 AppSecret，避免秘密进入 shell 历史。

也可以为单次测试临时使用环境变量：

```text
WECHAT_APP_ID
WECHAT_APP_SECRET
```

环境变量只适合临时运行，不建议作为长期保存方式。

### 3. 上传到草稿箱

```bash
node skills/wechat-article-publisher/scripts/upload-draft.mjs \
  --metadata output/my-article/metadata.json \
  --html output/my-article/article.html \
  --cover output/my-article/cover.png
```

只有返回 `draft_created` 和草稿 media ID，才能视为上传成功。草稿创建成功不等于已经公开发布。

## 它不会做什么

- 不承诺文章成为爆款
- 不把搜索摘要或 AI 回答当作可靠来源
- 不编造个人经历、引语、数字或案例
- 不保证每条事实自动完成核验
- 不复制某位在世作者的个人文风和身份
- 不把 AppSecret、Token、Cookie 或浏览器资料写入项目
- 不在没有最终确认时公开发布文章

## 安全设计

- 文章事实必须能追溯到具体来源或明确归因
- 证据不足时显示为“待核验”，不会伪装成确定事实
- AppSecret 推荐保存在 macOS Keychain
- 仓库只提供 `config.example.json`，不会包含真实账号配置
- 有封面模式的上传脚本只创建公众号草稿，不调用公开发布接口
- 无封面模式使用已登录的公众号图文编辑器，不上传图片
- 正文图片默认关闭，避免不明版权和远程图片风险

更完整的边界见：

- [`developing-credible-articles/SKILL.md`](skills/developing-credible-articles/SKILL.md)
- [`wechat-article-publisher/SKILL.md`](skills/wechat-article-publisher/SKILL.md)
- [`publishing-policy.md`](skills/wechat-article-publisher/references/publishing-policy.md)

## 运行要求

| 能力 | 要求 |
|---|---|
| 文章共创 | 支持 Agent Skills 的 Codex 或兼容 Agent |
| 本地排版 | macOS、Node.js 18+、Xcode Command Line Tools |
| 草稿上传 | 微信公众号 AppID、AppSecret、草稿 API 权限 |
| 接口访问 | 当前调用机器的公网 IP 已加入公众号接口 IP 白名单 |
| 密钥持久保存 | macOS Keychain |

文章共创 Skill 本身不依赖微信公众号账号。

## 版本

当前版本：`1.1.0`

## 仓库结构

```text
skills/
├── developing-credible-articles/
│   ├── SKILL.md
│   ├── agents/openai.yaml
│   └── references/
└── wechat-article-publisher/
    ├── SKILL.md
    ├── agents/openai.yaml
    ├── config.example.json
    ├── references/
    └── scripts/
```

## 参与改进

欢迎提交 Issue 或 Pull Request，尤其是：

- 可复现的事实核验遗漏
- 微信排版兼容问题
- 不同公众号类型的 API 权限差异
- 能减少误发布风险的改进
- 不依赖个人模仿的中文写作方法

请不要在 Issue 中粘贴 AppID、AppSecret、Token、Cookie、未公开文章或包含个人信息的真实案例。

## 本地验证

提交 Pull Request 前运行：

```bash
sh tests/public-package-check.sh
sh tests/safety-scan-regression.sh
sh tests/skill-contract-check.sh
sh tests/prepare-smoke.sh
sh tests/upload-validation.sh
node --check skills/wechat-article-publisher/scripts/prepare.mjs
node --check skills/wechat-article-publisher/scripts/upload-draft.mjs
```

这些测试只使用本地文件和无效 API 地址，不会访问微信公众号线上接口。

## License

MIT

如果这个工作流帮你少写了一篇空洞文章，或者少发布了一条未经核验的结论，欢迎点一个 Star。它会帮助更多认真写作的人找到这个项目。
