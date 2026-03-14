/**
 * 习题卷测试脚本 — 用分析引擎跑卷五吉凶习题
 *
 * 从卦名+变卦名反推摇卦结果，然后跑 buildChart + analyze
 *
 * Usage: npx tsx src/lib/analysis/test-exercises.ts
 */

import { buildChart } from '@/lib/liuyao/chart';
import type { CastLine, Category, Gender } from '@/lib/types';
import {
  TRIGRAM_MAP,
  BINARY_TO_TRIGRAM,
  lookupHexagram,
  type Trigram,
  type HeavenlyStem,
  type EarthlyBranch,
  HEAVENLY_STEMS,
  EARTHLY_BRANCHES,
} from '@/lib/liuyao/constants';
import { analyze } from './liuyao-engine';

// ============================================================
// 从卦名反推上下卦
// ============================================================

/** 所有64卦名 → upper/lower trigram */
const HEX_NAME_MAP: Record<string, { upper: Trigram; lower: Trigram }> = {};

// Build from all combinations
const TRIGRAM_NAMES: Record<Trigram, string> = {
  乾: '天', 坤: '地', 震: '雷', 巽: '风', 坎: '水', 离: '火', 艮: '山', 兑: '泽',
};

// We need a reverse lookup from hexagram name to upper/lower.
// The naming convention: 八纯卦 = "X为Y", 其他 = "上Y下Y卦名"
// Easier: build from the 64 hexagram list in constants.
// But constants doesn't export the list directly. Let me build it here.

const ALL_HEXAGRAMS: { name: string; upper: Trigram; lower: Trigram }[] = [
  // 乾宫
  { name: '乾为天', upper: '乾', lower: '乾' },
  { name: '天风姤', upper: '乾', lower: '巽' },
  { name: '天山遁', upper: '乾', lower: '艮' },
  { name: '天地否', upper: '乾', lower: '坤' },
  { name: '风地观', upper: '巽', lower: '坤' },
  { name: '山地剥', upper: '艮', lower: '坤' },
  { name: '火地晋', upper: '离', lower: '坤' },
  { name: '火天大有', upper: '离', lower: '乾' },
  // 兑宫
  { name: '兑为泽', upper: '兑', lower: '兑' },
  { name: '泽水困', upper: '兑', lower: '坎' },
  { name: '泽地萃', upper: '兑', lower: '坤' },
  { name: '泽山咸', upper: '兑', lower: '艮' },
  { name: '水山蹇', upper: '坎', lower: '艮' },
  { name: '地山谦', upper: '坤', lower: '艮' },
  { name: '雷山小过', upper: '震', lower: '艮' },
  { name: '雷泽归妹', upper: '震', lower: '兑' },
  // 离宫
  { name: '离为火', upper: '离', lower: '离' },
  { name: '火山旅', upper: '离', lower: '艮' },
  { name: '火风鼎', upper: '离', lower: '巽' },
  { name: '火水未济', upper: '离', lower: '坎' },
  { name: '山水蒙', upper: '艮', lower: '坎' },
  { name: '风水涣', upper: '巽', lower: '坎' },
  { name: '天水讼', upper: '乾', lower: '坎' },
  { name: '天火同人', upper: '乾', lower: '离' },
  // 震宫
  { name: '震为雷', upper: '震', lower: '震' },
  { name: '雷地豫', upper: '震', lower: '坤' },
  { name: '雷水解', upper: '震', lower: '坎' },
  { name: '雷风恒', upper: '震', lower: '巽' },
  { name: '地风升', upper: '坤', lower: '巽' },
  { name: '水风井', upper: '坎', lower: '巽' },
  { name: '泽风大过', upper: '兑', lower: '巽' },
  { name: '泽雷随', upper: '兑', lower: '震' },
  // 巽宫
  { name: '巽为风', upper: '巽', lower: '巽' },
  { name: '风天小畜', upper: '巽', lower: '乾' },
  { name: '风火家人', upper: '巽', lower: '离' },
  { name: '风雷益', upper: '巽', lower: '震' },
  { name: '天雷无妄', upper: '乾', lower: '震' },
  { name: '火雷噬嗑', upper: '离', lower: '震' },
  { name: '山雷颐', upper: '艮', lower: '震' },
  { name: '山风蛊', upper: '艮', lower: '巽' },
  // 坎宫
  { name: '坎为水', upper: '坎', lower: '坎' },
  { name: '水泽节', upper: '坎', lower: '兑' },
  { name: '水雷屯', upper: '坎', lower: '震' },
  { name: '水火既济', upper: '坎', lower: '离' },
  { name: '泽火革', upper: '兑', lower: '离' },
  { name: '雷火丰', upper: '震', lower: '离' },
  { name: '地火明夷', upper: '坤', lower: '离' },
  { name: '地水师', upper: '坤', lower: '坎' },
  // 艮宫
  { name: '艮为山', upper: '艮', lower: '艮' },
  { name: '山火贲', upper: '艮', lower: '离' },
  { name: '山天大畜', upper: '艮', lower: '乾' },
  { name: '山泽损', upper: '艮', lower: '兑' },
  { name: '火泽睽', upper: '离', lower: '兑' },
  { name: '天泽履', upper: '乾', lower: '兑' },
  { name: '风泽中孚', upper: '巽', lower: '兑' },
  { name: '风山渐', upper: '巽', lower: '艮' },
  // 坤宫
  { name: '坤为地', upper: '坤', lower: '坤' },
  { name: '地雷复', upper: '坤', lower: '震' },
  { name: '地泽临', upper: '坤', lower: '兑' },
  { name: '地天泰', upper: '坤', lower: '乾' },
  { name: '雷天大壮', upper: '震', lower: '乾' },
  { name: '泽天夬', upper: '兑', lower: '乾' },
  { name: '水天需', upper: '坎', lower: '乾' },
  { name: '水地比', upper: '坎', lower: '坤' },
];

for (const h of ALL_HEXAGRAMS) {
  HEX_NAME_MAP[h.name] = { upper: h.upper, lower: h.lower };
  // Also handle alternate names
  const alt = h.name.replace('畜', '蓄');
  if (alt !== h.name) HEX_NAME_MAP[alt] = { upper: h.upper, lower: h.lower };
}
// Extra aliases
HEX_NAME_MAP['风天小蓄'] = HEX_NAME_MAP['风天小畜'];
HEX_NAME_MAP['山天大蓄'] = HEX_NAME_MAP['山天大畜'];
HEX_NAME_MAP['风天小畜'] = { upper: '巽', lower: '乾' };

function lookupHexByName(name: string): { upper: Trigram; lower: Trigram } {
  // Try exact match
  let result = HEX_NAME_MAP[name];
  if (result) return result;
  // Try removing '卦' suffix
  result = HEX_NAME_MAP[name.replace(/卦$/, '')];
  if (result) return result;
  throw new Error(`Unknown hexagram name: ${name}`);
}

// ============================================================
// 从本卦+变卦反推 CastLine[]
// ============================================================

function trigramToBits(t: Trigram): [number, number, number] {
  const b = TRIGRAM_MAP[t].binary;
  // binary: bit2=下爻, bit1=中爻, bit0=上爻
  return [(b >> 2) & 1, (b >> 1) & 1, b & 1];
}

function reverseCastLines(
  primaryName: string,
  changedName: string | null,
): CastLine[] {
  const primary = lookupHexByName(primaryName);
  const pLowerBits = trigramToBits(primary.lower);
  const pUpperBits = trigramToBits(primary.upper);
  const primaryBits = [...pLowerBits, ...pUpperBits]; // [初,二,三,四,五,上]

  if (!changedName) {
    // 静卦 — all young
    return primaryBits.map(b => b === 1 ? 'young_yang' as CastLine : 'young_yin' as CastLine);
  }

  const changed = lookupHexByName(changedName);
  const cLowerBits = trigramToBits(changed.lower);
  const cUpperBits = trigramToBits(changed.upper);
  const changedBits = [...cLowerBits, ...cUpperBits];

  return primaryBits.map((pb, i) => {
    const cb = changedBits[i];
    if (pb !== cb) {
      // 动爻：阳变阴=old_yang, 阴变阳=old_yin
      return pb === 1 ? 'old_yang' : 'old_yin';
    }
    // 静爻
    return pb === 1 ? 'young_yang' : 'young_yin';
  }) as CastLine[];
}

// ============================================================
// 解析干支
// ============================================================

function parseStemBranch(s: string): { stem: HeavenlyStem; branch: EarthlyBranch } {
  const stem = s[0] as HeavenlyStem;
  const branch = s[1] as EarthlyBranch;
  if (!HEAVENLY_STEMS.includes(stem)) throw new Error(`Invalid stem: ${stem} in ${s}`);
  if (!EARTHLY_BRANCHES.includes(branch)) throw new Error(`Invalid branch: ${branch} in ${s}`);
  return { stem, branch };
}

// ============================================================
// 测试用例
// ============================================================

interface TestCase {
  id: number;
  monthStemBranch: string; // e.g. '辛巳'
  dayStemBranch: string;   // e.g. '丙戌'
  xunkongHint: string;     // e.g. '午未'
  primaryHex: string;
  changedHex: string | null;
  question: string;
  category: Category;
  gender?: Gender;
  expectedStrength: string; // e.g. '旺相', '休囚', '偏旺', '偏衰', '极弱'
}

const TESTS: TestCase[] = [
  // 情感
  { id: 1, monthStemBranch: '辛巳', dayStemBranch: '丙戌', xunkongHint: '午未', primaryHex: '雷风恒', changedHex: '巽为风', question: '男问女感情能否复合', category: 'relationship', gender: 'male', expectedStrength: '旺相' },
  { id: 2, monthStemBranch: '甲申', dayStemBranch: '辛酉', xunkongHint: '子丑', primaryHex: '山泽损', changedHex: '地泽临', question: '男问女表白能否成功', category: 'relationship', gender: 'male', expectedStrength: '旺相' },
  { id: 3, monthStemBranch: '壬午', dayStemBranch: '丁未', xunkongHint: '寅卯', primaryHex: '地水师', changedHex: '地天泰', question: '男问与女方最终能否结婚', category: 'relationship', gender: 'male', expectedStrength: '偏衰' },
  { id: 4, monthStemBranch: '丁丑', dayStemBranch: '丙子', xunkongHint: '申酉', primaryHex: '雷泽归妹', changedHex: '雷天大壮', question: '女问男能否复合', category: 'relationship', gender: 'female', expectedStrength: '休囚至极' },
  { id: 5, monthStemBranch: '辛巳', dayStemBranch: '乙巳', xunkongHint: '寅卯', primaryHex: '水泽节', changedHex: '巽为风', question: '男问女是否能复婚', category: 'relationship', gender: 'male', expectedStrength: '偏旺' },
  { id: 6, monthStemBranch: '乙酉', dayStemBranch: '己卯', xunkongHint: '申酉', primaryHex: '地雷复', changedHex: '坤为地', question: '女问男是否可以回心转意', category: 'relationship', gender: 'female', expectedStrength: '偏旺' },
  // 事业
  { id: 16, monthStemBranch: '庚辰', dayStemBranch: '壬申', xunkongHint: '戌亥', primaryHex: '泽天夬', changedHex: '雷天大壮', question: '问面试能否成功', category: 'career', expectedStrength: '休囚' },
  { id: 17, monthStemBranch: '丙子', dayStemBranch: '庚午', xunkongHint: '戌亥', primaryHex: '风地观', changedHex: '震为雷', question: '问本月是否会被调离其他岗位', category: 'career', expectedStrength: '偏旺' },
  // 财运
  { id: 31, monthStemBranch: '丁丑', dayStemBranch: '乙亥', xunkongHint: '申酉', primaryHex: '山天大畜', changedHex: '乾为天', question: '问本月公司是否会盈利', category: 'wealth', expectedStrength: '偏弱' },
  { id: 32, monthStemBranch: '丁未', dayStemBranch: '丁亥', xunkongHint: '午未', primaryHex: '火雷噬嗑', changedHex: null, question: '问朋友借卦主的钱本月能否还', category: 'wealth', expectedStrength: '偏弱' },
  // 学业
  { id: 86, monthStemBranch: '癸未', dayStemBranch: '丙午', xunkongHint: '寅卯', primaryHex: '乾为天', changedHex: '泽天夬', question: '问本次考学能否被录取', category: 'study', expectedStrength: '偏旺' },
];

// ============================================================
// 运行测试
// ============================================================

function buildDateFromStemBranch(
  monthSB: string,
  daySB: string,
): { dayStem: HeavenlyStem; dayBranch: EarthlyBranch; monthBranch: EarthlyBranch } {
  const month = parseStemBranch(monthSB);
  const day = parseStemBranch(daySB);
  return { dayStem: day.stem, dayBranch: day.branch, monthBranch: month.branch };
}

function runTest(tc: TestCase) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`题 ${tc.id}: ${tc.question}`);
  console.log(`${tc.monthStemBranch}月 ${tc.dayStemBranch}日（${tc.xunkongHint}空）`);
  console.log(`${tc.primaryHex}${tc.changedHex ? ` 变 ${tc.changedHex}` : '（静卦）'}`);

  try {
    // 1. 反推摇卦结果
    const castLines = reverseCastLines(tc.primaryHex, tc.changedHex);
    console.log(`摇卦: ${castLines.join(', ')}`);

    // 2. 构建排盘（用假日期，然后覆盖干支）
    const chart = buildChart(castLines);

    // 3. 覆盖月建/日辰/旬空（因为 buildChart 用的是当前日期）
    const { dayStem, dayBranch, monthBranch } = buildDateFromStemBranch(tc.monthStemBranch, tc.dayStemBranch);
    (chart as any).dayStem = dayStem;
    (chart as any).dayBranch = dayBranch;
    (chart as any).monthBranch = monthBranch;

    // Recalculate xunkong
    const { getXunkong } = require('@/lib/liuyao/constants');
    (chart as any).xunkong = getXunkong(dayStem, dayBranch);

    // 4. 运行分析引擎
    const result = analyze(chart, tc.category, tc.gender);

    // 5. 输出结果
    console.log(`\n本卦: ${chart.primary.name}（${chart.primary.palace}宫）`);
    console.log(`变卦: ${chart.changed.name}`);
    console.log(`世爻: 第${chart.shiPosition}爻  应爻: 第${chart.yingPosition}爻`);
    console.log(`动爻: ${chart.movingLines.length > 0 ? chart.movingLines.join(',') : '无'}`);
    console.log(`旬空: ${chart.xunkong.join('')}`);
    if (result.features.length > 0) console.log(`特征: ${result.features.join(', ')}`);

    console.log(`\n--- 六爻状态 ---`);
    for (const s of result.yaoStatuses) {
      let line = `${s.position}爻 ${s.branch}${s.element} ${s.relative}`;
      if (s.isShi) line += '[世]';
      if (s.isYing) line += '[应]';
      line += ` | ${s.strength}（月${s.monthEffect} 日${s.dayEffect}）`;
      if (s.isMoving) line += ` 动→${s.changedBranch}${s.changedElement}`;
      if (s.jinTui) line += `[${s.jinTui}]`;
      if (s.isEffectivelyEmpty) line += ' [空]';
      if (s.isMonthBroken) line += ' [月破]';
      if (s.isDayBroken) line += ' [日破]';
      if (s.isAnDong) line += ' [暗动]';
      if (s.muKu) line += ` [${s.muKu}]`;
      console.log(`  ${line}`);
    }

    console.log(`\n--- 用神分析 ---`);
    console.log(`用神: ${result.yongShen.type} → ${result.yongShen.reason}`);
    console.log(result.yongShenSummary);
    console.log(`原神: ${result.yuanShen.relative}（${result.yuanShen.positions.join(',') || '不上卦'}）`);
    console.log(`忌神: ${result.jiShen.relative}（${result.jiShen.positions.join(',') || '不上卦'}）`);
    console.log(`仇神: ${result.chouShen.relative}（${result.chouShen.positions.join(',') || '不上卦'}）`);

    // 6. 对比答案
    const ysPos = result.yongShen.selectedPosition;
    const ysStrength = ysPos ? (result.yaoStatuses[ysPos - 1].comprehensiveStrength ?? result.yaoStatuses[ysPos - 1].strength) : '不上卦';
    const ysBasic = ysPos ? result.yaoStatuses[ysPos - 1].strength : '不上卦';
    console.log(`\n引擎判断: 用神${ysStrength}（基础: ${ysBasic}）`);
    console.log(`标准答案: 用神${tc.expectedStrength}`);
    const match = tc.expectedStrength.includes(ysStrength) || ysStrength.includes(tc.expectedStrength);
    console.log(match ? '✅ 匹配' : '❌ 不匹配');

  } catch (e: any) {
    console.error(`❌ 错误: ${e.message}`);
  }
}

// Run all tests
console.log('六爻分析引擎 — 习题卷测试');
console.log(`共 ${TESTS.length} 题\n`);

for (const tc of TESTS) {
  runTest(tc);
}
