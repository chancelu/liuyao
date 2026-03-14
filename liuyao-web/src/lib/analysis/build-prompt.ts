import type { MockResult } from '@/lib/types';
import { analyze, type AnalysisResult, type YaoStatus } from './liuyao-engine';

/**
 * Build a prompt string from a MockResult for the LLM proxy.
 *
 * v2: 使用确定性分析引擎预计算所有数据，LLM 仅负责文字表达。
 */
export function buildPromptFromResult(result: MockResult): string {
  const chart = result.chart;
  if (!chart) return '';

  // ---- 运行确定性分析引擎 ----
  const analysis = analyze(chart, result.category, result.gender);

  let prompt = '';

  // ---- 用户问题 ----
  prompt += `## 用户问题\n`;
  prompt += `问题：${result.question ?? ''}\n`;
  prompt += `分类：${result.category ?? ''}\n`;
  prompt += `时间范围：${result.timeScope ?? ''}\n`;
  prompt += `性别：${result.gender === 'female' ? '女' : '男'}\n`;
  if (result.background) prompt += `背景：${result.background}\n`;

  // ---- 排盘概要 ----
  prompt += `\n## 排盘数据\n`;
  prompt += `本卦：${chart.primary.name}（${chart.primary.palace}宫，${chart.primary.palaceElement}）\n`;
  prompt += `变卦：${chart.changed.name}（${chart.changed.palace}宫，${chart.changed.palaceElement}）\n`;
  prompt += `动爻：${chart.movingLines.length > 0 ? `第 ${chart.movingLines.join('、')} 爻` : '无（静卦）'}\n`;
  prompt += `世爻：第${chart.shiPosition}爻   应爻：第${chart.yingPosition}爻\n`;
  prompt += `月建：${chart.monthBranch}   日辰：${chart.dayStem}${chart.dayBranch}\n`;
  if (chart.xunkong) prompt += `旬空：${chart.xunkong[0]}${chart.xunkong[1]}\n`;

  // ---- 卦象特征 ----
  if (analysis.features.length > 0) {
    prompt += `卦象特征：${analysis.features.join('、')}\n`;
  }

  // ---- 六爻详情（含引擎计算结果） ----
  prompt += `\n## 六爻详情（已由引擎计算）\n`;
  for (const s of analysis.yaoStatuses) {
    const line = chart.lines[s.position - 1];
    let desc = `第${s.position}爻：${line.yinYang}（${s.branch}${s.element}）`;
    desc += ` 六亲=${s.relative} 六神=${line.spirit}`;
    if (s.isShi) desc += ' [世]';
    if (s.isYing) desc += ' [应]';
    desc += ` | 旺衰=${s.strength}（月${s.monthEffect}，日${s.dayEffect}）`;
    desc += ` 月令=${s.monthStage} 日令=${s.dayStage}`;
    if (s.isInXunkong) desc += s.isEffectivelyEmpty ? ' 【旬空·实空】' : ' 【旬空·假空】';
    if (s.isMonthBroken) desc += ' 【月破】';
    if (s.isDayBroken) desc += ' 【日破】';
    if (s.isAnDong) desc += ' 【暗动】';
    if (s.muKu) desc += ` 【${s.muKu}】`;
    if (s.isMoving) {
      desc += ` → 动化${s.changedBranch ?? '?'}${s.changedElement ?? ''}（${s.changedRelative ?? '?'}）`;
      if (s.jinTui) desc += `【${s.jinTui}】`;
    }
    prompt += desc + '\n';
  }

  // ---- 用神分析（引擎计算） ----
  prompt += `\n## 用神分析（引擎已计算，请直接引用）\n`;
  prompt += `用神类型：${analysis.yongShen.type}\n`;
  prompt += `${analysis.yongShenSummary}\n`;
  if (analysis.yongShen.allPositions.length > 1) {
    prompt += `用神双现于第 ${analysis.yongShen.allPositions.join('、')} 爻，取用原因：${analysis.yongShen.reason}\n`;
  }
  if (analysis.yongShen.fuShen) {
    const f = analysis.yongShen.fuShen;
    prompt += `伏神：${f.branch}${f.element}（${f.relative}）伏于第${f.position}爻飞神${f.flyBranch}${f.flyElement}之下\n`;
    prompt += `飞伏关系：飞神${f.flyToFu}伏神，${f.isUseful ? '伏神有用' : '伏神无用'}（${f.reason}）\n`;
  }

  // ---- 原忌仇 ----
  prompt += `\n原神：${analysis.yuanShen.relative}（${fmtPositions(analysis.yuanShen.positions)}）\n`;
  prompt += `忌神：${analysis.jiShen.relative}（${fmtPositions(analysis.jiShen.positions)}）\n`;
  prompt += `仇神：${analysis.chouShen.relative}（${fmtPositions(analysis.chouShen.positions)}）\n`;

  // ---- 原忌仇各爻状态 ----
  for (const group of [
    { label: '原神', ...analysis.yuanShen },
    { label: '忌神', ...analysis.jiShen },
    { label: '仇神', ...analysis.chouShen },
  ]) {
    for (const pos of group.positions) {
      const s = analysis.yaoStatuses[pos - 1];
      prompt += `  ${group.label}第${pos}爻（${s.branch}${s.element}）：旺衰=${s.strength}`;
      if (s.isMoving) prompt += ' 动';
      if (s.isEffectivelyEmpty) prompt += ' 空';
      if (s.isMonthBroken) prompt += ' 月破';
      prompt += '\n';
    }
  }

  // ---- 指令 ----
  prompt += `\n## 输出要求\n`;
  prompt += `你是一位资深六爻师，请根据以上【引擎已计算的分析数据】撰写解读。\n`;
  prompt += `重要：所有旺衰、空破、原忌仇、进退神等判断已由引擎完成，你不需要重新计算，直接引用即可。\n`;
  prompt += `你的职责是：\n`;
  prompt += `1. 用自然语言解释引擎计算结果的含义\n`;
  prompt += `2. 结合用户问题给出具体建议\n`;
  prompt += `3. 推导应期（基于用神状态、空破、墓库等）\n`;
  prompt += `4. 语气沉稳专业，如资深易师面对面解卦\n\n`;
  prompt += `严格按以下 JSON 格式输出：\n`;
  prompt += `{"summary":"一句话总结","plainAnalysis":"白话解读（200-400字）","professionalAnalysis":"专业分析（含推导过程，400-800字）"}\n`;

  return prompt;
}

function fmtPositions(positions: number[]): string {
  return positions.length > 0 ? `第${positions.join('、')}爻` : '不上卦';
}
