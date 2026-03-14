import { buildChart } from '@/lib/liuyao';
import type { CastLine, Category, Gender, MockResult, TimeScope } from '@/lib/types';

function getMovingLines(lines: CastLine[]) {
  return lines
    .map((line, index) => ({ line, index: index + 1 }))
    .filter((item) => item.line === 'old_yin' || item.line === 'old_yang')
    .map((item) => item.index);
}

function getSummary(category: Category, movingCount: number) {
  const map: Record<Category, string> = {
    relationship: movingCount >= 2 ? '眼下阻力较重，但关系并未彻底走死。' : '关系仍有牵连，短期更像观望而不是定局。',
    career: movingCount >= 2 ? '事情有变化空间，但不适合急推。' : '当前更像在等时机，不宜只看眼下。',
    wealth: movingCount >= 2 ? '财上有波动，先守后取更稳。' : '不是没有机会，但进展不会特别快。',
    health: movingCount >= 2 ? '先看缓和与转机，短期仍需耐心。' : '眼下偏保守，恢复节奏比结果本身更重要。',
    study: movingCount >= 2 ? '成绩与状态都在变动，关键是后续能否稳住。' : '更像基础未稳，需要一点时间累积。',
    lost: movingCount >= 2 ? '当前不算顺手，但后面仍有转回来的机会。' : '先别急着下死结论，线索还没有完全断。',
    other: movingCount >= 2 ? '这件事并非静止，后面还有变化。' : '当下信号偏保守，需要继续观察。',
  };

  return map[category];
}

function getPlain(question: string, category: Category, timeScope: TimeScope, movingLines: number[]) {
  return `你问的是「${question}」。从当前这版骨架结果来看，这件事的重点不在一瞬间的好坏，而在于它还处在变化中。分类是「${category}」，时间范围是「${timeScope}」，当前动爻有 ${movingLines.length} 处，所以更适合先看趋势，再看结论。`;
}

function getProfessional(movingLines: number[]) {
  if (movingLines.length === 0) {
    return '本次示意结果为静卦倾向，后续会接入真实排盘、用神、旺衰、动变与应期分析。';
  }

  return `本次示意结果检测到动爻位于第 ${movingLines.join('、')} 爻。后续接入真实排盘引擎后，这里会展开：用神、世应、六亲六神、旺衰、象法与应期。`;
}

export function buildMockResult(params: {
  id: string;
  question: string;
  category: Category;
  timeScope: TimeScope;
  gender?: Gender;
  background: string;
  lines: CastLine[];
}): MockResult {
  // 使用真实排盘引擎计算 chart
  const chart = buildChart(params.lines);
  const movingLines = getMovingLines(params.lines);

  return {
    id: params.id,
    question: params.question,
    category: params.category,
    timeScope: params.timeScope,
    gender: params.gender,
    background: params.background,
    primaryHexagram: chart.primary.name,
    changedHexagram: chart.changed.name,
    movingLines,
    summary: getSummary(params.category, movingLines.length),
    plainAnalysis: getPlain(params.question, params.category, params.timeScope, movingLines),
    professionalAnalysis: getProfessional(movingLines),
    createdAt: new Date().toISOString(),
    chart,
    isAI: false,
  };
}
