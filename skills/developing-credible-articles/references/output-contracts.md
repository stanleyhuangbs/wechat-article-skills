# Output Contracts

## Working Snapshot

```markdown
当前判断：...
已确认：...
仍是假设：...
最大证据缺口：...
最强反方解释：...
下一步：...
```

Keep it under six lines unless the user requests detail.

## Claim Ledger View

```markdown
| 主张 | 类型 | 状态 | 证据 | 风险 | 处理 |
|---|---|---|---|---|---|
| ... | 事实/推论/... | 已确认/待证/... | ... | ... | 写入/限定/删除 |
```

## Argument Map

```markdown
一句话命题：...

1. 具体入口：...
2. 常见解释：...
3. 尚未解释的矛盾：...
4. 候选底层变量：...
5. 负向循环：A → B → C → A
6. 转折信号：...
7. 正向循环：A → B → C → A
8. 最强反方解释：...
9. 边界条件：只有在...时成立
10. 条件性结论：...

待作者确认：命题、因果链、反方处理、未核实材料处理。
```

An argument map is planning language, not publication prose. Do not add a working title, polished lead, sample paragraph, or quotable conclusion here. Mark every agent-proposed proposition as `候选` until the author confirms it.

## Pre-Draft Gate

Before drafting, output exactly these decisions:

```markdown
可以写入：...
只能作为推论：...
必须明确归因：...
需要继续核验：...
确定删除：...
```

Then ask one question: whether the author approves this treatment and argument map. Do not combine this with another decision.

Valid confirmation question:

> 你是否确认按这份论证图和证据处理进入写稿？

Invalid confirmation question:

> 你是否确认；如果不确认，要不要我换一个角度？

## Final Delivery

Return in this order:

1. article title options when requested;
2. publication draft;
3. evidence status: verified, attributed, qualified, unresolved;
4. concise counter-analysis;
5. remaining publication risks.

Do not append internal chain-of-thought. Explain decisions through claims, evidence, assumptions, and alternatives.

## Language Audit

Flag and rewrite:

- generic era openings;
- “首先、其次、最后” used as automatic scaffolding;
- “值得注意的是、不难发现、综上所述”;
- repeated “这意味着、本质上、换句话说”;
- abstract claims without an actor or observable action;
- identical paragraph rhythm;
- fake quotes, fake dialogue, and unearned emotional language;
- excessive headings, bullets, tables, and bold emphasis in the article body;
- language copied from the reference author's recognizable verbal signature.

Do not ban ordinary words mechanically. The test is whether the paragraph sounds like a person making a specific judgment from real material.
