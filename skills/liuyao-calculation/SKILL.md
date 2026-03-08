---
name: liuyao-calculation
description: Calculate, structure, and interpret Liuyao (六爻) divination using a reproducible workflow grounded in 易理、卦理、装卦、基础参数、取用神. Use when asked to 起卦、装卦、排六亲六神、定世应、纳甲、判旬空/月建/日辰、取用神、分析动爻变爻, or to turn Liuyao teaching material into step-by-step rules, indexes, glossaries, or study notes.
---

# Liuyao Calculation

## Overview

Use this skill to turn Liuyao questions into a consistent calculation pipeline instead of loose intuition. Prefer explicit structure: 先定问题 → 起卦/读卦 → 装卦 → 标参数 → 取用神 → 看动静旺衰 → 再下判断。

When working on 习题、答案卷、教学材料, first identify the task type: 取用神 / 旺衰 / 象法 / 应期. Do not answer a narrow题型 with an over-broad断法.

## Workflow

1. Clarify the question.
2. Determine whether the user already has a hexagram.
3. If no hexagram exists, choose a 起卦法 from `references/calculation-workflow.md`.
4. If a hexagram exists, complete 装卦 using `references/gua-setup.md`:
   - 定内外卦
   - 定世应
   - 纳地支
   - 定六亲
   - 定六神
5. Mark core parameters from `references/base-parameters.md`:
   - 月建
   - 日辰
   - 旬空
   - 日破 / 月破 / 暗动 / 反吟 / 伏吟 / 入墓（按任务需要）
6. Determine 用神 from `references/yongshen.md`.
7. Analyze force and direction:
   - 生克制化
   - 动爻 / 变爻
   - 进神 / 退神
   - 飞神 / 伏神
   - 用神双现 / 主辅用神
8. Produce a structured answer in this order:
   - 问题核心
   - 用神与辅助点
   - 卦面关键结构
   - 吉凶/成败/倾向
   - If possible: timing clues and uncertainty notes
9. If the user is giving a worksheet / answer sheet / study pack, read `references/answer-calibration.md` before answering.
10. If the task is mainly 象法, read `references/xiangfa-patterns.md`.
11. If the task is mainly 应期, read `references/timing-patterns.md` and `references/timing-priority-rules.md`, then explicitly state 病因 → 解法 → 时间点.

## Output rules

- Show the calculation path, not only the conclusion.
- Keep “经典象意” separate from “本次断点”.
- If a rule is uncertain or schools differ, say so explicitly.
- If diagrams are hard to read, reconstruct them as tables or ordered lists rather than skipping them.

## Which reference to read

- Start here: `references/index.md`
- Foundations and terminology: `references/foundations.md`
- Full calculation sequence: `references/calculation-workflow.md`
- 装卦 details: `references/gua-setup.md`
- 基础参数: `references/base-parameters.md`
- 取用神 and advanced 用神 cases: `references/yongshen.md`
- 题卷/答案卷校准: `references/answer-calibration.md`
- 象法补强: `references/xiangfa-patterns.md`
- 应期模板: `references/timing-patterns.md`
- 应期优先级: `references/timing-priority-rules.md`
- Hard-to-parse charts converted to text: `references/graphic-relations.md`
- Source map back to the four PDFs: `references/source-index.md`

## Guardrails

- Do not pretend certainty from one isolated sign.
- Do not skip setup details just because software usually fills them in.
- Do not collapse “取用神” and “断吉凶” into one step.
- When material is incomplete, state which layer is missing: 起卦 / 装卦 / 参数 / 用神 / 断法.
