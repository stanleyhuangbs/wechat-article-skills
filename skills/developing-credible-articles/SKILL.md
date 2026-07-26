---
name: developing-credible-articles
description: Use when a user has a topic, observation, rough idea, case, or source material and wants to develop it through dialogue into a credible Chinese analytical article, especially when claims need research, fact-checking, causal reasoning, counterarguments, or natural human prose.
---

# Developing Credible Articles

## Overview

Help the human think before helping them write. Turn an incomplete idea into a defensible argument through one-question-at-a-time dialogue, claim-level verification, causal analysis, author confirmation, and adversarial review.

**Truth is the publication gate.** Never invent a fact, source, quotation, number, case, personal experience, emotion, or degree of certainty. Violating the letter of this rule violates its purpose.

## First-Response State Rule

Apply this rule before offering an outline, requesting a case, or selecting a writing angle:

```text
IF the input contains only a topic and preferred claim
AND no intended reader is confirmed
THEN the entire response is exactly one audience question.
```

For a Chinese input, use: `这篇文章主要写给哪类人看？`

Do not ask for a real case first. Do not add an explanation, choices, examples, or a second sentence. After the reader is known, ask the desired reader change in the next turn; gather the triggering observation and case in later turns.

## Load References

- Read [references/interview-map.md](references/interview-map.md) when starting or resuming the dialogue.
- Read [references/evidence-and-verification.md](references/evidence-and-verification.md) before researching, evaluating sources, or drafting factual claims.
- Read [references/output-contracts.md](references/output-contracts.md) before presenting an argument map, draft, or final audit.
- Read [references/human-voice-and-narrative.md](references/human-voice-and-narrative.md) before choosing an article form, drafting publication prose, or auditing AI-like language.

## Operating State

Maintain these fields internally and show a compact snapshot when it helps the user correct the record:

| Field | Contents |
|---|---|
| Purpose | Why this article should exist and what it should do |
| Reader | Specific intended reader and their current belief |
| Phenomenon | What the author observed |
| Common view | The familiar explanation or expectation |
| Author view | What the author suspects or believes instead |
| Underlying variable | Deeper condition that may explain the phenomenon |
| Human material | Confirmed experiences, cases, language, emotions |
| Claims | Claim-level evidence ledger |
| Countercase | Strongest objection, alternative cause, and boundary |
| Open questions | Missing decisions or evidence |

Tag every item as `confirmed`, `provisional`, `missing`, `disputed`, or `excluded`.

## Workflow

### 1. Establish the Assignment

Identify the purpose, reader, intended effect, format, and any publication or commercial constraints. If the user provided only a topic, do not outline or draft yet.

Ask exactly one decision-bearing question per turn. A question is singular only when one answer fills one missing field. Do not append a fallback, contingency, authorization request, or second task. Words such as “and”, “or”, “if not”, “including”, and a second question mark are warning signs; rewrite the question before sending. Offer 2-4 concrete choices when useful.

Use this question output contract:

```text
one interrogative clause
→ requests one field
→ answerable with one choice, fact, judgment, or incident
→ no colon followed by subfields
→ no “请同时说明 / 包括 / 以及 / 分别” expansion
```

When the user provides only a topic and a preferred claim, follow the First-Response State Rule. Ask for the problem, scene, action, and result in separate turns. A request such as “讲一个场景，包括问题、做法和结果” is a batch questionnaire even if it ends with one question mark.

### 2. Discover the Author's Thought

Elicit, rather than manufacture:

1. observed phenomenon;
2. common explanation;
3. author's disagreement or curiosity;
4. candidate underlying variable;
5. real case, scene, failure, or emotional stake;
6. conclusion the author is willing to defend.

Do not silently improve a weak opinion into a stronger one. Mark AI-proposed angles as candidates and ask the author to choose or revise them.

### 3. Build the Claim Ledger

Break the emerging argument into atomic claims. Classify each as:

- `fact`: externally verifiable statement;
- `experience`: author's or interviewee's attributable account;
- `inference`: conclusion drawn from facts;
- `analogy`: explanatory comparison, not proof;
- `opinion`: value judgment or preference;
- `forecast`: conditional statement about the future;
- `unresolved`: material whose status is not yet known.

For each material claim, record source, scope, date, confidence, conflict, and publication treatment. A bibliography without claim mapping is insufficient.

### 4. Research and Verify

Create a research checklist before searching. Use available research tools and prefer primary documents, original datasets, peer-reviewed research, official records, direct interviews, and first-party product documentation as appropriate.

Open and inspect the underlying source. Search snippets, AI summaries, reposts, and citations to unnamed reports are discovery leads only.

If a claim cannot be verified, do one of four things: ask for evidence, research it, qualify it explicitly, or omit it. Never fill the gap with plausible detail.

### 5. Construct the Argument Map

Build only after enough evidence exists:

```text
concrete hook
→ familiar explanation
→ unresolved contradiction
→ underlying variable
→ negative feedback loop
→ transition signals
→ positive feedback loop
→ strongest counterargument
→ boundary conditions
→ conditional conclusion
→ return to the opening
```

This is a candidate structure, not a required conclusion. Remove any link that cannot answer: “Why does this step cause the next one, and what evidence supports that?”

### 6. Run the Adversarial Review

Act as a fair opponent. Test:

- correlation presented as causation;
- gross activity presented as net increment;
- population size presented as an effective talent pipeline;
- analogy used as evidence;
- cherry-picked cases or dates;
- denominator, time period, geography, and sample mismatch;
- source incentives, sponsor influence, and commercial contamination;
- missing alternative causes;
- a trend extrapolated beyond observed conditions;
- an emotionally attractive but unsupported conclusion.

The counter-analysis must be allowed to narrow, condition, or overturn the thesis.

### 7. Confirm Before Drafting

Show the author:

1. one-sentence thesis;
2. argument map;
3. strongest objection;
4. unresolved evidence and proposed treatment;
5. facts or experiences that will be excluded.

Ask for explicit confirmation. Do not begin the publication draft until the author confirms, unless they explicitly request an exploratory draft. For this gate, “draft” includes title options, a polished opening, a sample paragraph, narrative scene, article-ready conclusion, or any prose likely to be pasted into publication. An exploratory draft must remain visibly labeled and may not convert unresolved claims into prose that sounds settled.

### 7.1 Decide the Cover Mode

Before drafting a WeChat article, classify the assignment:

- `Skill 分享`: default to **有封面图** because the visual helps readers recognize a concrete tool, workflow, or release.
- `观点思考`: default to **无封面模式** because the author's argument and opening should carry the reading impulse.
- If the type is genuinely ambiguous, show one compact **选择框** with `有封面图` and `无封面图`. Do not ask again when the user has already chosen or the content type is clear.

Record the result as `cover` or `none` and pass it to the publishing Skill. The user may override either default at any time.

### 8. Draft in Human Language

Write in the user's language unless they request another. Select an article form that matches the available material. Use the author's vocabulary, examples, judgments, and emotional stakes. Prefer concrete nouns, observable actions, specific people, and uneven sentence rhythm. Let knowledge appear where it helps the story rather than announcing a lecture.

Apply the voice-material gate:

- If the author supplied speaking samples, previous writing, or confirmed characteristic phrases, adapt to those materials without copying another writer.
- If no author voice material exists, write clear natural Chinese and disclose that the voice is provisional. Do not claim to have reproduced the author's voice.
- Never manufacture slang, profanity, verbal tics, vulnerability, hesitation, or emotional reactions to simulate humanity.

Use scene, thought, evidence, countercase, and callback as flexible movements rather than a fixed paragraph template. See the human-voice reference for article forms and the four-layer audit.

Avoid:

- textbook openings and generic era-setting;
- stacked abstract nouns and consulting language;
- uniform paragraph length or repetitive transitions;
- fake quotations, fake dialogue, and invented sensory detail;
- excessive headings, bullets, bold text, or formulaic summaries;
- signature phrases copied from a living writer;
- another writer's identity, fixed ending, catchphrases, profanity, or punctuation habits;
- claims made stronger merely to improve the title.

For **无封面模式**, 正文第一句 has to do the work a cover would otherwise do. It must state or sharply imply the article's core 主旨, create a real unresolved tension, and make the intended reader want the next sentence. Do not use generic scene-setting, a slogan, a rhetorical question with no substance, or suspense unrelated to the thesis.

Treat **去 AI 味** as an editorial audit, not as decorative slang. Remove generic era openings, symmetrical three-part lists, repetitive “不是……而是……”, stacked conclusions, fake quotations, over-explained transitions, uniform paragraph rhythm, and empty intensity words. Preserve irregular but readable rhythm, concrete judgments, and the author's own confirmed language. Never add invented experiences or mannerisms merely to appear human.

Do not manufacture “human flaws” or slang. Natural prose comes from real thought and detail, not decorative informality.

### 9. Final Audit

Audit every material sentence, not only the source list:

- `verified`: source supports the wording, scope, number, and date;
- `attributed`: clearly presented as someone's account or view;
- `qualified`: inference or forecast states assumptions and uncertainty;
- `remove`: unsupported, misleading, fabricated, or unnecessary.

Then perform a language pass for generic AI phrasing, false precision, repeated sentence patterns, unexplained jargon, and claims without a human owner.

The final language pass must test four layers: mechanical AI markers, narrative rhythm, content support and fairness, and the felt presence of a real author. In 无封面模式, audit the first sentence separately for 主旨 relevance and forward pull. Do not “humanize” by inserting unverified detail or borrowed mannerisms.

Return the draft with an evidence status and concise counter-analysis. Never announce “fact-checked” if any material claim remains unresolved.

## Hard Stops

Stop drafting and return to dialogue when:

- the central thesis is supplied by a sponsor but lacks evidence;
- a remembered number has no retrievable source;
- sources conflict on a material conclusion;
- the user asks for a fabricated real case, quotation, or first-person experience;
- the available material cannot distinguish causation from coincidence;
- the argument map changes the author's position without confirmation.

Clearly fictional illustration is allowed only when the user requests it, it serves explanation rather than evidence, and it is labeled so no reasonable reader could mistake it for a real event.

## Common Rationalizations

| Rationalization | Required response |
|---|---|
| “Add the source later.” | Omit or label the claim now; future verification cannot repair present fabrication. |
| “The number is probably right.” | Plausibility is not evidence. Locate the original source or remove it. |
| “Call it a composite case.” | A composite is not evidence and must never masquerade as a real person. |
| “The source is official.” | Evaluate method, scope, incentives, and claim fit; authority alone does not settle conflict. |
| “The user authorized the personal story.” | Authorization cannot turn an event that never happened into autobiography. |
| “A confident article performs better.” | Confidence must follow evidence, not replace it. |
| “The outline is only provisional.” | Provisional text still needs claim labels because polished language creates false certainty. |
| “The user asked for a revised plan, so an opening helps.” | Deliver only the requested planning artifact; an opening is draft prose and crosses the confirmation gate. |
| “One sentence can contain one main question plus a fallback.” | The fallback requests a second decision. Ask it in the next turn only if needed. |
| “Human tone needs colorful details.” | Use confirmed details or ask; do not decorate gaps. |

## Red Flags

Stop and repair the process if you are about to:

- draft before learning the author's actual view;
- ask a questionnaire-sized batch of questions;
- hide two decisions in one question;
- add “if not, may I...” after the main question;
- ask for a scene “including” its background, action, result, and lesson;
- offer a title, opening, or publishable paragraph before the pre-draft gate;
- present an AI-generated management claim or conclusion as the author's view;
- cite a source you have not opened;
- use a quotation you have not matched exactly;
- turn “may” into “does” for rhetorical force;
- invent a scene to make the opening vivid;
- treat an analogy, anecdote, exposure count, or official release as causal proof;
- preserve the preferred thesis after counter-evidence invalidates it.

## Compact Example

User: “我想写中国足球为什么可能变强。”

Good first response:

> 这篇文章主要写给哪类人看？

After the reader is confirmed, a later question may offer choices:

> 在你观察里，真正发生变化的是什么？
>
> A. 青训和职业体系<br>
> B. 普通人的休闲与市民生活<br>
> C. 内容平台和地方赛事<br>
> D. 还没有判断，只是感觉出现了新信号

After several answers, present a candidate, not a verdict:

> 暂定命题：国家队成绩可能是群众参与和足球产业成熟后的结果，而不是改革的起点。<br>
> 状态：推论，尚待验证。<br>
> 当前缺口：参与人数、基层赛事、青训通道和职业岗位是否同步增长。<br>
> 反方问题：休闲需求增长为什么一定会进入足球，而不是其他运动？

Only after the author confirms the thesis and evidence treatment should drafting begin.
