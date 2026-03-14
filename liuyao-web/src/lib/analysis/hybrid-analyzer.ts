/**
 * 混合分析器：引擎优先 + 模型兜底
 *
 * 架构：每个决策点先跑确定性引擎，引擎输出结果+置信度。
 * 低置信度的决策交给 LLM，LLM 在引擎给的约束范围内做判断。
 *
 * 决策点：
 * 1. 用神选择 — 引擎按类别硬映射，模型理解问题语义做修正
 * 2. 旺衰微调 — 引擎线性评分，模型考虑三刑/六害/连续相生等边界因素
 */

import type { ChartData } from '@/lib/liuyao/chart';
import type { Category, Gender } from '@/lib/types';
import {
  type EarthlyBranch, type WuXing, type SixRelative,
  BRANCH_ELEMENT,
} from '@/lib/liuyao/constants';
import {
  analyze,
  getScoreBreakdown,
  isClash, isHarmony,
  type AnalysisResult,
  type Strength,
  type YaoStatus,
  type ScoreBreakdown,
  type FiveRelation,
} from './liuyao-engine';

// ============================================================
// 类型
// ============================================================

export type Confidence = 'high' | 'medium' | 'low';

export interface AnalysisDecision {
  step: string;
  engineResult: string;
  confidence: Confidence;
  llmOverride?: string;
  reason: string;
}

export interface HybridAnalysisResult extends AnalysisResult {
  decisions: AnalysisDecision[];
  /** 如果模型修正了用神，这里是修正后的用神位置 */
  correctedYongShenPos?: number | null;
  /** 如果模型修正了旺衰，这里是修正后的旺衰 */
  correctedStrength?: Strength;
}

/** LLM 调用函数签名 */
export type LLMFunction = (prompt: string) => Promise<string>;

// ============================================================
// 置信度评估
// ============================================================

/** 用神选择置信度 */
export function assessYongShenConfidence(
  category: Category,
  questionText: string,
  result: AnalysisResult,
): Confidence {
  // 明确映射的类别 → 高置信度
  if (['wealth', 'study', 'lost'].includes(category)) return 'high';

  // 情感类：有性别就高，没性别就中
  if (category === 'relationship') return 'medium';

  // 事业类：可能是官鬼也可能是父母（文书/合同）
  if (category === 'career') return 'medium';

  // 健康类：通常是官鬼，但有时问康复取子孙
  if (category === 'health') return 'medium';

  // other 类（官非/比赛/出行/六亲）→ 低置信度，需要模型
  return 'low';
}

/** 旺衰置信度 */
export function assessStrengthConfidence(
  pos: number,
  yaoStatuses: YaoStatus[],
  chart: ChartData,
): Confidence {
  const s = yaoStatuses[pos - 1];
  const score = s.comprehensiveScore ?? 0;

  // 阈值边界检测（距离任一阈值 < 0.6 则不确定）
  const thresholds = [3.2, 1.0, -1.0, -2.8];
  const nearThreshold = thresholds.some(t => Math.abs(score - t) < 0.6);

  // 特殊因素检测
  const specialFactors = detectSpecialFactors(pos, yaoStatuses, chart);

  if (!nearThreshold && specialFactors.length === 0) return 'high';
  if (nearThreshold && specialFactors.length > 0) return 'low';
  return 'medium';
}

// ============================================================
// 特殊因素检测（引擎未建模的因素）
// ============================================================

/** 三刑关系 */
const SAN_XING: [EarthlyBranch, EarthlyBranch][] = [
  ['丑', '戌'], ['戌', '未'], ['未', '丑'], // 丑未戌三刑
  ['寅', '巳'], ['巳', '申'], ['申', '寅'], // 寅巳申三刑
  ['子', '卯'], ['卯', '子'],               // 子卯刑
  ['辰', '辰'], ['午', '午'], ['酉', '酉'], ['亥', '亥'], // 自刑
];

function isSanXing(a: EarthlyBranch, b: EarthlyBranch): boolean {
  return SAN_XING.some(([x, y]) => x === a && y === b);
}

/** 六害关系 */
const LIU_HAI: [EarthlyBranch, EarthlyBranch][] = [
  ['子', '未'], ['未', '子'],
  ['丑', '午'], ['午', '丑'],
  ['寅', '巳'], ['巳', '寅'],
  ['卯', '辰'], ['辰', '卯'],
  ['申', '亥'], ['亥', '申'],
  ['酉', '戌'], ['戌', '酉'],
];

function isLiuHai(a: EarthlyBranch, b: EarthlyBranch): boolean {
  return LIU_HAI.some(([x, y]) => x === a && y === b);
}

export interface SpecialFactor {
  type: string;
  description: string;
  impact: 'positive' | 'negative';
}

export function detectSpecialFactors(
  targetPos: number,
  yaoStatuses: YaoStatus[],
  chart: ChartData,
): SpecialFactor[] {
  const target = yaoStatuses[targetPos - 1];
  const factors: SpecialFactor[] = [];

  // 月日合
  if (isHarmony(target.branch, chart.monthBranch)) {
    factors.push({ type: '月合', description: `${target.branch}与月建${chart.monthBranch}六合`, impact: 'positive' });
  }
  if (isHarmony(target.branch, chart.dayBranch)) {
    factors.push({ type: '日合', description: `${target.branch}与日辰${chart.dayBranch}六合`, impact: 'positive' });
  }

  // 月日三刑
  if (isSanXing(chart.monthBranch, target.branch)) {
    factors.push({ type: '月刑', description: `月建${chart.monthBranch}刑${target.branch}`, impact: 'negative' });
  }
  if (isSanXing(chart.dayBranch, target.branch)) {
    factors.push({ type: '日刑', description: `日辰${chart.dayBranch}刑${target.branch}`, impact: 'negative' });
  }

  // 月日六害
  if (isLiuHai(chart.monthBranch, target.branch)) {
    factors.push({ type: '月害', description: `月建${chart.monthBranch}害${target.branch}`, impact: 'negative' });
  }
  if (isLiuHai(chart.dayBranch, target.branch)) {
    factors.push({ type: '日害', description: `日辰${chart.dayBranch}害${target.branch}`, impact: 'negative' });
  }

  // 动爻间连续相生链
  const movingYao = yaoStatuses.filter(s => s.position !== targetPos && (s.isMoving || s.isAnDong));
  for (let i = 0; i < movingYao.length; i++) {
    for (let j = i + 1; j < movingYao.length; j++) {
      const a = movingYao[i], b = movingYao[j];
      const aToB = BRANCH_ELEMENT[a.branch] === target.element ? null :
        (BRANCH_ELEMENT[a.branch] !== BRANCH_ELEMENT[b.branch] ? null : null);
      // 简化：检测 A生B生用神 的链
      const aEl = BRANCH_ELEMENT[a.branch], bEl = BRANCH_ELEMENT[b.branch];
      const SHENG: Record<WuXing, WuXing> = { 木: '火', 火: '土', 土: '金', 金: '水', 水: '木' };
      if (SHENG[aEl] === bEl && SHENG[bEl] === target.element) {
        factors.push({
          type: '连续相生',
          description: `${a.branch}(${aEl})生${b.branch}(${bEl})生用神(${target.element})`,
          impact: 'positive',
        });
      }
    }
  }

  // 多个动爻同方向泄耗
  const negDong = movingYao.filter(s => {
    const eff = getEffectSimple(BRANCH_ELEMENT[s.branch], target.element);
    return eff === '克' || eff === '泄' || eff === '耗';
  });
  if (negDong.length >= 2) {
    factors.push({
      type: '多爻泄耗',
      description: `${negDong.length}个动爻同时泄耗用神`,
      impact: 'negative',
    });
  }

  return factors;
}

/** 简化版五行关系（不依赖引擎内部函数） */
function getEffectSimple(actor: WuXing, target: WuXing): FiveRelation {
  if (actor === target) return '同';
  const SHENG: Record<WuXing, WuXing> = { 木: '火', 火: '土', 土: '金', 金: '水', 水: '木' };
  const KE: Record<WuXing, WuXing> = { 木: '土', 土: '水', 水: '火', 火: '金', 金: '木' };
  if (SHENG[actor] === target) return '生';
  if (KE[actor] === target) return '克';
  if (SHENG[target] === actor) return '泄';
  return '耗';
}

// ============================================================
// LLM Prompt 构建
// ============================================================

/** 构建用神选择 prompt */
export function buildYongShenPrompt(
  chart: ChartData,
  result: AnalysisResult,
  category: Category,
  gender: Gender | undefined,
  questionText: string,
): string {
  // 卦中六亲分布
  const yaoTable = result.yaoStatuses.map(s => {
    const moving = s.isMoving ? '动' : (s.isAnDong ? '暗动' : '静');
    const changed = s.changedBranch ? `→${s.changedBranch}(${s.changedElement})` : '';
    return `  第${s.position}爻: ${s.branch}(${s.element}) ${s.relative} ${moving}${changed} [${s.isShi ? '世' : s.isYing ? '应' : ''}] 旺衰=${s.comprehensiveStrength ?? s.strength}`;
  }).join('\n');

  // 伏神信息
  const fuInfo = result.yongShen.fuShen
    ? `伏神: ${result.yongShen.fuShen.relative} ${result.yongShen.fuShen.branch}(${result.yongShen.fuShen.element}), 伏于第${result.yongShen.fuShen.position}爻下, 飞神${result.yongShen.fuShen.flyToFu}伏`
    : '无伏神';

  const categoryMap: Record<string, string> = {
    relationship: '情感', career: '事业', wealth: '财运',
    health: '健康', study: '学业', lost: '失物', other: '其他',
  };

  return `## 六爻用神选择

### 问题
"${questionText}"
类别: ${categoryMap[category] ?? category}${gender ? `, 性别: ${gender === 'male' ? '男' : '女'}` : ''}

### 卦中六爻
${yaoTable}

### ${fuInfo}

### 引擎默认
用神: ${result.yongShen.type}${result.yongShen.selectedPosition ? `@第${result.yongShen.selectedPosition}爻` : '(伏神)'}

### 用神选择规则
1. 情感: 男取妻财, 女取官鬼
2. 事业: 默认官鬼; 问文书/合同/证件/手续→父母
3. 财运: 妻财
4. 健康: 官鬼(代表病症)
5. 学业: 父母
6. 失物: 妻财
7. 官非/诉讼: 官鬼
8. 比赛/竞争: 世爻
9. 出行: 世爻
10. 六亲: 问父母→父母, 问兄弟姐妹→兄弟, 问子女→子孙, 问配偶→妻财(男)/官鬼(女)

### 请严格按 JSON 回答
{"type":"六亲名称或世爻","position":爻位数字或null,"reason":"一句话理由"}`;
}

/** 构建旺衰微调 prompt */
export function buildStrengthReviewPrompt(
  targetPos: number,
  yaoStatuses: YaoStatus[],
  chart: ChartData,
  breakdown: ScoreBreakdown,
  specialFactors: SpecialFactor[],
): string {
  const target = yaoStatuses[targetPos - 1];

  // 评分明细表
  let scoreTable = `  月建(${chart.monthBranch}): ${breakdown.monthEffect} → ${breakdown.monthScore > 0 ? '+' : ''}${breakdown.monthScore.toFixed(1)}\n`;
  scoreTable += `  日辰(${chart.dayBranch}): ${breakdown.dayEffect} → ${breakdown.dayScore > 0 ? '+' : ''}${breakdown.dayScore.toFixed(1)}\n`;

  for (const d of breakdown.dongYaoEffects) {
    scoreTable += `  第${d.position}爻${d.branch}(${d.element})[${d.dongStrength}]: ${d.effect} → ${d.score > 0 ? '+' : ''}${d.score.toFixed(2)}\n`;
  }

  if (breakdown.bianYaoEffect) {
    scoreTable += `  变爻${breakdown.bianYaoEffect.branch}(${breakdown.bianYaoEffect.element}): 回头${breakdown.bianYaoEffect.effect} → ${breakdown.bianYaoEffect.score > 0 ? '+' : ''}${breakdown.bianYaoEffect.score.toFixed(1)}\n`;
  }

  if (breakdown.xunkongPenalty) scoreTable += `  旬空: ${breakdown.xunkongPenalty}\n`;
  if (breakdown.monthBrokenPenalty) scoreTable += `  月破: ${breakdown.monthBrokenPenalty}\n`;
  if (breakdown.dayBrokenPenalty) scoreTable += `  日破: ${breakdown.dayBrokenPenalty}\n`;

  const factorsText = specialFactors.length > 0
    ? specialFactors.map(f => `- ${f.type}: ${f.description} (${f.impact === 'positive' ? '增强' : '减弱'})`).join('\n')
    : '无';

  return `## 六爻旺衰微调

### 用神
第${targetPos}爻 ${target.branch}(${target.element}) ${target.relative}

### 引擎评分
${scoreTable}  总分: ${breakdown.totalScore.toFixed(2)} → ${breakdown.strength}

### 引擎可能遗漏的因素
${factorsText}

### 规则
1. 旺衰: 旺 > 偏旺 > 平 > 偏弱 > 弱
2. 最多调整±1级
3. 月日最重要, 动爻次之
4. 弱的动爻生扶力减弱

### 请严格按 JSON 回答
{"adjust":true或false,"strength":"调整后旺衰","reason":"一句话理由"}`;
}

// ============================================================
// LLM 响应解析
// ============================================================

export interface YongShenLLMResponse {
  type: SixRelative | '世爻';
  position: number | null;
  reason: string;
}

export interface StrengthLLMResponse {
  adjust: boolean;
  strength: Strength;
  reason: string;
}

function extractJSON(text: string): string | null {
  const m = text.match(/\{[\s\S]*?\}/);
  return m ? m[0] : null;
}

export function parseYongShenResponse(text: string): YongShenLLMResponse | null {
  try {
    const json = extractJSON(text);
    if (!json) return null;
    const obj = JSON.parse(json);
    if (!obj.type) return null;
    return {
      type: obj.type,
      position: typeof obj.position === 'number' ? obj.position : null,
      reason: obj.reason ?? '',
    };
  } catch { return null; }
}

export function parseStrengthResponse(text: string): StrengthLLMResponse | null {
  try {
    const json = extractJSON(text);
    if (!json) return null;
    const obj = JSON.parse(json);
    const validStrengths: Strength[] = ['旺', '偏旺', '平', '偏弱', '弱'];
    if (!validStrengths.includes(obj.strength)) return null;
    return {
      adjust: !!obj.adjust,
      strength: obj.strength,
      reason: obj.reason ?? '',
    };
  } catch { return null; }
}

// ============================================================
// 混合分析主函数
// ============================================================

export async function analyzeHybrid(
  chart: ChartData,
  category: Category,
  gender: Gender | undefined,
  questionText: string,
  llm: LLMFunction,
): Promise<HybridAnalysisResult> {
  // Step 0: 引擎确定性分析
  const engineResult = analyze(chart, category, gender);
  const decisions: AnalysisDecision[] = [];
  let correctedYongShenPos: number | null | undefined;
  let correctedStrength: Strength | undefined;

  // Step 1: 用神选择
  const yongShenConf = assessYongShenConfidence(category, questionText, engineResult);
  decisions.push({
    step: '用神选择',
    engineResult: `${engineResult.yongShen.type}@${engineResult.yongShen.selectedPosition ?? '伏神'}`,
    confidence: yongShenConf,
    reason: engineResult.yongShen.reason,
  });

  if (yongShenConf !== 'high') {
    try {
      const prompt = buildYongShenPrompt(chart, engineResult, category, gender, questionText);
      const response = await llm(prompt);
      const parsed = parseYongShenResponse(response);

      if (parsed && parsed.type !== engineResult.yongShen.type) {
        decisions[0].llmOverride = `${parsed.type}@${parsed.position ?? '伏神'}: ${parsed.reason}`;

        // 找到模型选择的用神位置
        if (parsed.type === '世爻') {
          correctedYongShenPos = chart.shiPosition;
        } else if (parsed.position) {
          correctedYongShenPos = parsed.position;
        } else {
          // 模型指定了六亲但没指定位置，从卦中找
          const positions = engineResult.yaoStatuses
            .filter(s => s.relative === parsed.type)
            .map(s => s.position);
          correctedYongShenPos = positions.length > 0 ? positions[0] : null;
        }
      }
    } catch (e) {
      // LLM 调用失败，使用引擎结果
      decisions[0].reason += ' (LLM fallback failed)';
    }
  }

  // Step 2: 旺衰微调
  const effectivePos = correctedYongShenPos ?? engineResult.yongShen.selectedPosition;
  if (effectivePos != null) {
    const strengthConf = assessStrengthConfidence(effectivePos, engineResult.yaoStatuses, chart);
    const breakdown = getScoreBreakdown(effectivePos, engineResult.yaoStatuses, chart);
    const specialFactors = detectSpecialFactors(effectivePos, engineResult.yaoStatuses, chart);
    const currentStrength = engineResult.yaoStatuses[effectivePos - 1].comprehensiveStrength
      ?? engineResult.yaoStatuses[effectivePos - 1].strength;

    decisions.push({
      step: '旺衰评估',
      engineResult: `${currentStrength} (score=${breakdown.totalScore.toFixed(2)})`,
      confidence: strengthConf,
      reason: `特殊因素: ${specialFactors.map(f => f.type).join(', ') || '无'}`,
    });

    if (strengthConf !== 'high') {
      try {
        const prompt = buildStrengthReviewPrompt(
          effectivePos, engineResult.yaoStatuses, chart, breakdown, specialFactors,
        );
        const response = await llm(prompt);
        const parsed = parseStrengthResponse(response);

        if (parsed?.adjust && parsed.strength !== currentStrength) {
          // 验证：最多调整±1级
          const levels: Strength[] = ['弱', '偏弱', '平', '偏旺', '旺'];
          const curIdx = levels.indexOf(currentStrength);
          const newIdx = levels.indexOf(parsed.strength);
          if (Math.abs(curIdx - newIdx) <= 1) {
            correctedStrength = parsed.strength;
            decisions[1].llmOverride = `${parsed.strength}: ${parsed.reason}`;
          }
        }
      } catch (e) {
        decisions[1].reason += ' (LLM fallback failed)';
      }
    }
  }

  return {
    ...engineResult,
    decisions,
    correctedYongShenPos,
    correctedStrength,
  };
}
