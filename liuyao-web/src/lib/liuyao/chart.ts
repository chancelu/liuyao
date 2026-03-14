/**
 * 六爻确定性排盘引擎 v1
 *
 * 采用京房纳甲体系：
 * - 纳甲配支按八卦阴阳分内外
 * - 世应按京房八宫规则
 * - 六亲按五行生克
 * - 六神按日干起青龙
 *
 * 输入：6 次摇卦结果 CastLine[]（初爻到上爻）
 * 输出：确定性、可序列化的 ChartData
 */

import type { CastLine } from '@/lib/types';
import {
  type EarthlyBranch,
  type HeavenlyStem,
  type HexagramInfo,
  type SixRelative,
  type SixSpirit,
  type Trigram,
  type WuXing,
  BINARY_TO_TRIGRAM,
  BRANCH_ELEMENT,
  NAJIA_TABLE,
  TRIGRAM_MAP,
  getSixRelative,
  getSixSpirits,
  getXunkong,
  lookupHexagramByBinary,
} from './constants';

// ---------------------------------------------------------------------------
// 输出类型
// ---------------------------------------------------------------------------

export interface LineData {
  /** 爻位 1-6 */
  position: number;
  /** 阴/阳 */
  yinYang: '阳' | '阴';
  /** 是否动爻 */
  moving: boolean;
  /** 纳支（地支） */
  branch: EarthlyBranch;
  /** 纳支五行 */
  branchElement: WuXing;
  /** 六亲 */
  relative: SixRelative;
  /** 六神 */
  spirit: SixSpirit;
  /** 是否世爻 */
  isShi: boolean;
  /** 是否应爻 */
  isYing: boolean;
  /** 变爻纳支（仅动爻有） */
  changedBranch?: EarthlyBranch;
  /** 变爻六亲（仅动爻有，仍用本宫五行算） */
  changedRelative?: SixRelative;
}

export interface HexagramData {
  name: string;
  palace: Trigram;
  palaceElement: WuXing;
  upper: Trigram;
  lower: Trigram;
}

export interface ChartData {
  /** 本卦 */
  primary: HexagramData;
  /** 变卦 */
  changed: HexagramData;
  /** 动爻位置列表 (1-6) */
  movingLines: number[];
  /** 世爻位置 (1-6) */
  shiPosition: number;
  /** 应爻位置 (1-6) */
  yingPosition: number;
  /** 六爻详情，index 0=初爻 ... index 5=上爻 */
  lines: LineData[];
  /** 月建（地支） */
  monthBranch: EarthlyBranch;
  /** 日辰（地支） */
  dayBranch: EarthlyBranch;
  /** 日干 */
  dayStem: HeavenlyStem;
  /** 旬空二支 */
  xunkong: [EarthlyBranch, EarthlyBranch];
  /** 排盘时间 ISO */
  castTime: string;
}

// ---------------------------------------------------------------------------
// 核心计算
// ---------------------------------------------------------------------------

/** CastLine → 阴阳（本卦取值） */
function lineToYinYang(line: CastLine): 0 | 1 {
  // old_yang(老阳)=阳, young_yang(少阳)=阳 → 1
  // old_yin(老阴)=阴, young_yin(少阴)=阴 → 0
  return line === 'old_yang' || line === 'young_yang' ? 1 : 0;
}

/** 动爻变化后的阴阳 */
function lineToChangedYinYang(line: CastLine): 0 | 1 {
  if (line === 'old_yang') return 0; // 阳变阴
  if (line === 'old_yin') return 1;  // 阴变阳
  // 静爻不变
  return lineToYinYang(line);
}

/** 是否动爻 */
function isMoving(line: CastLine): boolean {
  return line === 'old_yang' || line === 'old_yin';
}

/** 从 6 个阴阳值拆出上下卦的 3-bit binary */
function splitTrigrams(bits: (0 | 1)[]): { upperBin: number; lowerBin: number; upper: Trigram; lower: Trigram } {
  // bits[0]=初爻(最下) ... bits[5]=上爻(最上)
  // 下卦=初二三, 上卦=四五上
  // TRIGRAM_MAP binary: bit2=下爻, bit1=中爻, bit0=上爻
  const lowerBin = (bits[0] << 2) | (bits[1] << 1) | bits[2];
  const upperBin = (bits[3] << 2) | (bits[4] << 1) | bits[5];
  return {
    upperBin,
    lowerBin,
    upper: BINARY_TO_TRIGRAM[upperBin],
    lower: BINARY_TO_TRIGRAM[lowerBin],
  };
}

/** 获取 6 爻纳支：下卦用 inner，上卦用 outer */
function getNajiaBranches(lower: Trigram, upper: Trigram): EarthlyBranch[] {
  const lowerNajia = NAJIA_TABLE[lower];
  const upperNajia = NAJIA_TABLE[upper];
  return [...lowerNajia.inner, ...upperNajia.outer];
}

/** 通过 lunar-javascript 获取当前日期的干支信息 */
function getCalendarInfo(date: Date): { dayStem: HeavenlyStem; dayBranch: EarthlyBranch; monthBranch: EarthlyBranch } {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Solar } = require('lunar-javascript');
  const solar = Solar.fromDate(date);
  const lunar = solar.getLunar();

  const dayStem = lunar.getDayGan() as HeavenlyStem;
  const dayBranch = lunar.getDayZhi() as EarthlyBranch;
  // 月建取节气月支（干支历的月支）
  const monthBranch = lunar.getMonthZhi() as EarthlyBranch;

  return { dayStem, dayBranch, monthBranch };
}

// ---------------------------------------------------------------------------
// 主入口
// ---------------------------------------------------------------------------

/**
 * 生成确定性排盘结果
 *
 * @param lines - 6 次摇卦结果，[初爻, 二爻, 三爻, 四爻, 五爻, 上爻]
 * @param date  - 排盘时间，默认当前时间
 */
export function buildChart(lines: CastLine[], date?: Date): ChartData {
  if (lines.length !== 6) {
    throw new Error(`Expected 6 lines, got ${lines.length}`);
  }

  const castDate = date ?? new Date();

  // 1. 计算本卦各爻阴阳
  const primaryBits = lines.map(lineToYinYang);
  const changedBits = lines.map(lineToChangedYinYang);

  // 2. 拆上下卦，查卦名
  const primaryTrigrams = splitTrigrams(primaryBits);
  const changedTrigrams = splitTrigrams(changedBits);

  const primaryHex = lookupHexagramByBinary(primaryTrigrams.upperBin, primaryTrigrams.lowerBin);
  const changedHex = lookupHexagramByBinary(changedTrigrams.upperBin, changedTrigrams.lowerBin);

  // 3. 获取日历信息
  const { dayStem, dayBranch, monthBranch } = getCalendarInfo(castDate);

  // 4. 旬空
  const xunkong = getXunkong(dayStem, dayBranch);

  // 5. 六神
  const spirits = getSixSpirits(dayStem);

  // 6. 纳支
  const primaryBranches = getNajiaBranches(primaryTrigrams.lower, primaryTrigrams.upper);
  const changedBranches = getNajiaBranches(changedTrigrams.lower, changedTrigrams.upper);

  // 7. 宫五行（六亲用本卦宫的五行）
  const palaceElement = TRIGRAM_MAP[primaryHex.palace].element;

  // 8. 动爻列表
  const movingLines = lines
    .map((line, i) => isMoving(line) ? i + 1 : -1)
    .filter((v) => v > 0);

  // 9. 组装每爻数据
  const lineData: LineData[] = lines.map((line, i) => {
    const position = i + 1;
    const branch = primaryBranches[i];
    const branchElement = BRANCH_ELEMENT[branch];
    const relative = getSixRelative(palaceElement, branchElement);
    const moving = isMoving(line);

    const result: LineData = {
      position,
      yinYang: primaryBits[i] === 1 ? '阳' : '阴',
      moving,
      branch,
      branchElement,
      relative,
      spirit: spirits[i],
      isShi: position === primaryHex.shi,
      isYing: position === primaryHex.ying,
    };

    if (moving) {
      const cb = changedBranches[i];
      result.changedBranch = cb;
      result.changedRelative = getSixRelative(palaceElement, BRANCH_ELEMENT[cb]);
    }

    return result;
  });

  // 10. 组装卦数据
  const toHexData = (hex: HexagramInfo): HexagramData => ({
    name: hex.name,
    palace: hex.palace,
    palaceElement: TRIGRAM_MAP[hex.palace].element,
    upper: hex.upper,
    lower: hex.lower,
  });

  return {
    primary: toHexData(primaryHex),
    changed: toHexData(changedHex),
    movingLines,
    shiPosition: primaryHex.shi,
    yingPosition: primaryHex.ying,
    lines: lineData,
    monthBranch,
    dayBranch,
    dayStem,
    xunkong,
    castTime: castDate.toISOString(),
  };
}
