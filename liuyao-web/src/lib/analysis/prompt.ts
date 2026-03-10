/**
 * 六爻 AI 分析 — System Prompt 与 User Prompt 构建
 */

import type { ChartData } from '@/lib/liuyao/chart';
import type { AnalysisInput } from './types';

const CATEGORY_LABELS: Record<string, string> = {
  relationship: '感情',
  career: '事业',
  wealth: '财运',
  health: '健康',
  study: '学业',
  lost: '失物',
  other: '其他',
};

const TIME_SCOPE_LABELS: Record<string, string> = {
  recent: '近期（一两周内）',
  this_month: '本月',
  this_year: '本年',
  unspecified: '未限定',
};

// ---------------------------------------------------------------------------
// System Prompt
// ---------------------------------------------------------------------------

export const SYSTEM_PROMPT = `你是一位精通京房纳甲六爻体系的资深命理分析师。你的任务是基于用户提供的排盘数据，给出结构化的六爻分析结果。

## 分析原则
1. **排盘数据为准**：不要自行重新排盘，直接使用提供的 ChartData JSON。
2. **双层输出**：同时面向完全不懂六爻的小白用户（白话）和略懂六爻的爱好者（专业）。
3. **克制不夸张**：不要给出绝对化的断语（"必定""肯定"），用"倾向""可能""目前看"等措辞。
4. **实用导向**：分析要落到用户能做的事上，给出可操作的建议。
5. **不编造细节**：如果卦象信息不足以给出某方面判断，如实说明，不要胡编。

## 分析框架（专业部分参考）
- 用神：根据问题类别确定用神（感情看世应/妻财，事业看官鬼/父母，财运看妻财，健康看子孙等）
- 旺衰：用神在月建/日辰的状态（旺/相/休/囚/死），得月令否，得日辰否
- 动变：动爻对用神的影响（生扶/克制），变爻的趋势含义
- 世应：世爻代表问卦人，应爻代表对方/事态，两者关系
- 六亲六神：各爻六亲角色和六神象法参考
- 旬空：是否有关键爻落入旬空，影响程度
- 应期推断：谨慎给出可能的时间节点参考

## 输出格式
你必须严格按以下 JSON 格式输出，不要输出任何其他内容：

\`\`\`json
{
  "summary": "一句话结论，不超过 50 字",
  "plainAnalysis": "白话分析，面向小白用户，300-600 字，用日常语言解释卦象含义和建议",
  "professionalAnalysis": "专业分析，面向爱好者，200-500 字，包含用神旺衰、动变影响、世应关系、应期等专业内容"
}
\`\`\``;

// ---------------------------------------------------------------------------
// Chart → 文本描述（给 LLM 的上下文）
// ---------------------------------------------------------------------------

function formatChart(chart: ChartData): string {
  const lines = chart.lines
    .map((l) => {
      let desc = `第${l.position}爻：${l.yinYang}（${l.branch}${l.branchElement}）六亲=${l.relative} 六神=${l.spirit}`;
      if (l.isShi) desc += ' [世]';
      if (l.isYing) desc += ' [应]';
      if (l.moving) {
        desc += ` 【动】→ ${l.changedBranch ?? '?'} ${l.changedRelative ?? '?'}`;
      }
      return desc;
    })
    .join('\n');

  return `## 排盘数据
本卦：${chart.primary.name}（${chart.primary.palace}宫，${chart.primary.palaceElement}）
变卦：${chart.changed.name}（${chart.changed.palace}宫，${chart.changed.palaceElement}）
动爻：${chart.movingLines.length > 0 ? `第 ${chart.movingLines.join('、')} 爻` : '无（静卦）'}
世爻：第${chart.shiPosition}爻   应爻：第${chart.yingPosition}爻
月建：${chart.monthBranch}   日辰：${chart.dayStem}${chart.dayBranch}
旬空：${chart.xunkong[0]}${chart.xunkong[1]}
排盘时间：${chart.castTime}

## 六爻详情
${lines}`;
}

// ---------------------------------------------------------------------------
// User Prompt
// ---------------------------------------------------------------------------

export function buildUserPrompt(input: AnalysisInput): string {
  const categoryLabel = CATEGORY_LABELS[input.category] ?? input.category;
  const timeScopeLabel = TIME_SCOPE_LABELS[input.timeScope] ?? input.timeScope;

  return `## 用户问题
问题：${input.question}
分类：${categoryLabel}
时间范围：${timeScopeLabel}
${input.background ? `背景补充：${input.background}` : ''}

${formatChart(input.chart)}

请根据以上排盘数据和用户问题，给出结构化分析结果。严格按 JSON 格式输出。`;
}
