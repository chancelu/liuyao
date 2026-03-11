import type { MockResult } from '@/lib/types';

/**
 * Build a prompt string from a MockResult for the LLM proxy.
 * Shared between processing-client and result-client.
 */
export function buildPromptFromResult(result: MockResult): string {
  const chart = result.chart;
  if (!chart) return '';

  let prompt = `## 用户问题\n问题：${result.question ?? ''}\n分类：${result.category ?? ''}\n时间范围：${result.timeScope ?? ''}\n`;
  if (result.background) prompt += `背景：${result.background}\n`;

  prompt += `\n## 排盘数据\n`;
  prompt += `本卦：${chart.primary.name}（${chart.primary.palace}宫，${chart.primary.palaceElement}）\n`;
  prompt += `变卦：${chart.changed.name}（${chart.changed.palace}宫，${chart.changed.palaceElement}）\n`;
  prompt += `动爻：${chart.movingLines.length > 0 ? `第 ${chart.movingLines.join('、')} 爻` : '无（静卦）'}\n`;
  prompt += `世爻：第${chart.shiPosition}爻   应爻：第${chart.yingPosition}爻\n`;
  prompt += `月建：${chart.monthBranch}   日辰：${chart.dayStem}${chart.dayBranch}\n`;
  if (chart.xunkong) prompt += `旬空：${chart.xunkong[0]}${chart.xunkong[1]}\n`;
  if (chart.castTime) prompt += `排盘时间：${chart.castTime}\n`;

  if (chart.lines && chart.lines.length > 0) {
    prompt += `\n## 六爻详情\n`;
    for (const l of chart.lines) {
      let desc = `第${l.position}爻：${l.yinYang}（${l.branch}${l.branchElement}）六亲=${l.relative} 六神=${l.spirit}`;
      if (l.isShi) desc += ' [世]';
      if (l.isYing) desc += ' [应]';
      if (l.moving) desc += ` 【动】→ ${l.changedBranch ?? '?'} ${l.changedRelative ?? '?'}`;
      prompt += desc + '\n';
    }
  }

  prompt += `\n请根据以上排盘数据和用户问题，给出结构化分析结果。严格按 JSON 格式输出。`;
  return prompt;
}
