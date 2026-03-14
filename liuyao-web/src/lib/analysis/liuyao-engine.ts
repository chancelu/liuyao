/**
 * 六爻确定性分析引擎
 *
 * 规则来源：云笈书院六爻卷（卷一至卷四）+ 增删卜易
 * 职责：ChartData + 问题元数据 → 结构化分析数据（AnalysisResult）
 * LLM 仅负责将 AnalysisResult 转化为自然语言
 */

import type { ChartData, LineData } from '@/lib/liuyao/chart';
import type { Category, Gender } from '@/lib/types';
import {
  type EarthlyBranch,
  type WuXing,
  type SixRelative,
  EARTHLY_BRANCHES,
  BRANCH_ELEMENT,
  NAJIA_TABLE,
  TRIGRAM_MAP,
  getSixRelative,
} from '@/lib/liuyao/constants';

// ============================================================
// 导出类型
// ============================================================

export type FiveRelation = '生' | '克' | '同' | '泄' | '耗';
export type Strength = '旺' | '偏旺' | '平' | '偏弱' | '弱';
export type TwelveStage =
  | '长生' | '沐浴' | '冠带' | '临官' | '帝旺'
  | '衰' | '病' | '死' | '墓' | '绝' | '胎' | '养';

export interface YaoStatus {
  position: number;
  branch: EarthlyBranch;
  element: WuXing;
  relative: SixRelative;
  isShi: boolean;
  isYing: boolean;
  isMoving: boolean;
  monthEffect: FiveRelation;
  dayEffect: FiveRelation;
  strength: Strength;
  monthStage: TwelveStage;
  dayStage: TwelveStage;
  isInXunkong: boolean;
  isEffectivelyEmpty: boolean;
  isMonthBroken: boolean;
  isDayBroken: boolean;
  isAnDong: boolean;
  // 动爻专属
  changedBranch?: EarthlyBranch;
  changedElement?: WuXing;
  changedRelative?: SixRelative;
  jinTui?: '进神' | '退神' | null;
  // 墓库
  muKu?: '入墓' | '入库' | null;
}

export interface FuShenInfo {
  position: number;
  branch: EarthlyBranch;
  element: WuXing;
  relative: SixRelative;
  flyBranch: EarthlyBranch;
  flyElement: WuXing;
  flyRelative: SixRelative;
  flyToFu: FiveRelation;
  isUseful: boolean;
  reason: string;
}

export interface YongShenInfo {
  type: SixRelative | '世爻' | '应爻';
  allPositions: number[];
  selectedPosition: number | null;
  reason: string;
  fuShen?: FuShenInfo;
}

export interface AnalysisResult {
  yongShen: YongShenInfo;
  yuanShen: { relative: SixRelative; positions: number[] };
  jiShen: { relative: SixRelative; positions: number[] };
  chouShen: { relative: SixRelative; positions: number[] };
  yaoStatuses: YaoStatus[];
  features: string[];
  yongShenSummary: string;
}

// ============================================================
// 五行关系工具
// ============================================================

const SHENG: Record<WuXing, WuXing> = { 木: '火', 火: '土', 土: '金', 金: '水', 水: '木' };
const KE: Record<WuXing, WuXing> = { 木: '土', 土: '水', 水: '火', 火: '金', 金: '木' };

/** actor 五行对 target 五行的作用（从 target 视角） */
export function getEffect(actor: WuXing, target: WuXing): FiveRelation {
  if (actor === target) return '同';
  if (SHENG[actor] === target) return '生';   // actor生target → target得生
  if (KE[actor] === target) return '克';      // actor克target → target受克
  if (SHENG[target] === actor) return '泄';   // target生actor → target泄气
  return '耗';                                 // target克actor → target耗力
}

// ============================================================
// 十二长生
// ============================================================

const TWELVE_STAGES: TwelveStage[] = [
  '长生', '沐浴', '冠带', '临官', '帝旺', '衰',
  '病', '死', '墓', '绝', '胎', '养',
];

/** 各五行长生起始地支（六爻专用，阴阳同论，土寄水宫） */
const CHANGSHENG_START: Record<WuXing, EarthlyBranch> = {
  木: '亥', 火: '寅', 金: '巳', 水: '申', 土: '申',
};

export function getTwelveStage(element: WuXing, branch: EarthlyBranch): TwelveStage {
  const startIdx = EARTHLY_BRANCHES.indexOf(CHANGSHENG_START[element]);
  const branchIdx = EARTHLY_BRANCHES.indexOf(branch);
  return TWELVE_STAGES[((branchIdx - startIdx) % 12 + 12) % 12];
}

// ============================================================
// 地支关系
// ============================================================

const SIX_CLASH: Record<EarthlyBranch, EarthlyBranch> = {
  子: '午', 午: '子', 丑: '未', 未: '丑', 寅: '申', 申: '寅',
  卯: '酉', 酉: '卯', 辰: '戌', 戌: '辰', 巳: '亥', 亥: '巳',
};

const SIX_HARMONY: Record<EarthlyBranch, EarthlyBranch> = {
  子: '丑', 丑: '子', 寅: '亥', 亥: '寅', 卯: '戌', 戌: '卯',
  辰: '酉', 酉: '辰', 巳: '申', 申: '巳', 午: '未', 未: '午',
};

export function isClash(a: EarthlyBranch, b: EarthlyBranch): boolean {
  return SIX_CLASH[a] === b;
}

export function isHarmony(a: EarthlyBranch, b: EarthlyBranch): boolean {
  return SIX_HARMONY[a] === b;
}

/** 墓库：五行 → 墓库地支 */
const MU_KU_MAP: Record<WuXing, EarthlyBranch> = {
  水: '辰', 土: '辰', 火: '戌', 金: '丑', 木: '未',
};

// ============================================================
// 进神退神
// ============================================================

const JIN_SHEN: Record<string, boolean> = {
  '寅卯': true, '巳午': true, '申酉': true, '亥子': true,
  '丑辰': true, '辰未': true, '未戌': true, '戌丑': true,
};

const TUI_SHEN: Record<string, boolean> = {
  '卯寅': true, '午巳': true, '酉申': true, '子亥': true,
  '辰丑': true, '丑戌': true, '戌未': true, '未辰': true,
};

function getJinTui(from: EarthlyBranch, to: EarthlyBranch): '进神' | '退神' | null {
  const key = `${from}${to}`;
  if (JIN_SHEN[key]) return '进神';
  if (TUI_SHEN[key]) return '退神';
  return null;
}

// ============================================================
// 旺衰判断
// ============================================================

function assessStrength(
  element: WuXing,
  monthBranch: EarthlyBranch,
  dayBranch: EarthlyBranch,
): { monthEffect: FiveRelation; dayEffect: FiveRelation; strength: Strength } {
  const me = getEffect(BRANCH_ELEMENT[monthBranch], element);
  const de = getEffect(BRANCH_ELEMENT[dayBranch], element);
  const mp = me === '生' || me === '同';
  const dp = de === '生' || de === '同';
  const mn = me === '克';
  const dn = de === '克';
  let s: Strength;
  if (mp && dp) s = '旺';
  else if (mp || dp) s = '偏旺';
  else if (mn && dn) s = '弱';
  else if (mn || dn) s = '偏弱';
  else s = '平';
  return { monthEffect: me, dayEffect: de, strength: s };
}

// ============================================================
// 旬空 / 月破 / 日破 / 暗动
// ============================================================

function isInXunkong(branch: EarthlyBranch, xunkong: [EarthlyBranch, EarthlyBranch]): boolean {
  return branch === xunkong[0] || branch === xunkong[1];
}

/** 真空：春土、夏金、秋木、冬火 */
function isTrueEmpty(element: WuXing, monthBranch: EarthlyBranch): boolean {
  const mi = EARTHLY_BRANCHES.indexOf(monthBranch);
  if (mi >= 2 && mi <= 4) return element === '土';   // 春：寅卯辰
  if (mi >= 5 && mi <= 7) return element === '金';   // 夏：巳午未
  if (mi >= 8 && mi <= 10) return element === '木';  // 秋：申酉戌
  return element === '火';                             // 冬：亥子丑
}

function checkEffectivelyEmpty(
  branch: EarthlyBranch,
  element: WuXing,
  xunkong: [EarthlyBranch, EarthlyBranch],
  monthBranch: EarthlyBranch,
  dayBranch: EarthlyBranch,
  isMoving: boolean,
): boolean {
  if (!isInXunkong(branch, xunkong)) return false;
  if (isMoving) return false;                          // 动不为空
  const { strength } = assessStrength(element, monthBranch, dayBranch);
  if (strength === '旺' || strength === '偏旺') return false; // 旺不为空
  return true; // 有气不动为空 / 真空 / 月破为空 均算空
}

function checkMonthBroken(branch: EarthlyBranch, monthBranch: EarthlyBranch): boolean {
  return isClash(branch, monthBranch);
}

/** 日破：休囚 + 不动 + 与日辰冲 */
function checkDayBroken(
  branch: EarthlyBranch,
  dayBranch: EarthlyBranch,
  strength: Strength,
  isMoving: boolean,
  isEmpty: boolean,
): boolean {
  if (!isClash(branch, dayBranch)) return false;
  if (isMoving) return false;
  return strength === '偏弱' || strength === '弱' || strength === '平' || isEmpty;
}

/** 暗动：旺相 + 静爻 + 与日辰冲 */
function checkAnDong(
  branch: EarthlyBranch,
  dayBranch: EarthlyBranch,
  strength: Strength,
  isMoving: boolean,
): boolean {
  if (isMoving) return false;
  if (!isClash(branch, dayBranch)) return false;
  return strength === '旺' || strength === '偏旺';
}

/** 墓库判断 */
function checkMuKu(
  element: WuXing,
  dayBranch: EarthlyBranch,
  strength: Strength,
): '入墓' | '入库' | null {
  if (MU_KU_MAP[element] !== dayBranch) return null;
  return (strength === '旺' || strength === '偏旺') ? '入库' : '入墓';
}

// ============================================================
// 取用神
// ============================================================

/** 问题类别 → 主用神六亲 */
function getYongShenRelative(category: Category, gender?: Gender): SixRelative | '世爻' | '应爻' {
  switch (category) {
    case 'relationship':
      return gender === 'female' ? '官鬼' : '妻财';
    case 'career':
      return '官鬼';
    case 'wealth':
      return '妻财';
    case 'health':
      return '官鬼';
    case 'study':
      return '父母';
    case 'lost':
      return '妻财';
    case 'other':
    default:
      return '世爻';
  }
}

/** 用神双现取用优先级：动爻 > 世爻 > 应爻 > 离世爻近 */
function selectBestYao(
  positions: number[],
  lines: LineData[],
  shiPos: number,
  yingPos: number,
  yaoStatuses: YaoStatus[],
): { position: number; reason: string } {
  if (positions.length === 1) {
    return { position: positions[0], reason: '卦中仅一爻' };
  }

  // 先过滤掉旬空且真空的
  const valid = positions.filter(p => {
    const s = yaoStatuses[p - 1];
    return !s.isEffectivelyEmpty || !isTrueEmpty(s.element, yaoStatuses[0].branch /* placeholder */);
  });
  const pool = valid.length > 0 ? valid : positions;

  // 1. 动爻优先
  const moving = pool.filter(p => lines[p - 1].moving);
  if (moving.length === 1) return { position: moving[0], reason: '动爻优先' };
  if (moving.length > 1) {
    // 两爻均动，旺相优先
    const sorted = moving.sort((a, b) => {
      const sa = strengthRank(yaoStatuses[a - 1].strength);
      const sb = strengthRank(yaoStatuses[b - 1].strength);
      return sb - sa;
    });
    return { position: sorted[0], reason: '双动爻取旺相者' };
  }

  // 2. 持世优先
  if (pool.includes(shiPos)) return { position: shiPos, reason: '持世优先' };

  // 3. 持应优先
  if (pool.includes(yingPos)) return { position: yingPos, reason: '持应优先' };

  // 4. 离世爻近
  const sorted = [...pool].sort((a, b) => {
    const da = Math.abs(a - shiPos);
    const db = Math.abs(b - shiPos);
    if (da !== db) return da - db;
    return strengthRank(yaoStatuses[b - 1].strength) - strengthRank(yaoStatuses[a - 1].strength);
  });
  return { position: sorted[0], reason: '离世爻近' };
}

function strengthRank(s: Strength): number {
  switch (s) {
    case '旺': return 5;
    case '偏旺': return 4;
    case '平': return 3;
    case '偏弱': return 2;
    case '弱': return 1;
  }
}

// ============================================================
// 原神 / 忌神 / 仇神（固定六亲对应表）
// ============================================================

const YUAN_JI_CHOU: Record<SixRelative, { yuan: SixRelative; ji: SixRelative; chou: SixRelative }> = {
  父母: { yuan: '官鬼', ji: '妻财', chou: '子孙' },
  官鬼: { yuan: '妻财', ji: '子孙', chou: '兄弟' },
  妻财: { yuan: '子孙', ji: '兄弟', chou: '父母' },
  子孙: { yuan: '兄弟', ji: '父母', chou: '官鬼' },
  兄弟: { yuan: '父母', ji: '官鬼', chou: '妻财' },
};

// ============================================================
// 伏神
// ============================================================

function findFuShen(
  chart: ChartData,
  targetRelative: SixRelative,
  yaoStatuses: YaoStatus[],
): FuShenInfo | undefined {
  // 从本宫首卦（八纯卦）借用
  const palace = chart.primary.palace;
  const palaceElement = TRIGRAM_MAP[palace].element;
  const najia = NAJIA_TABLE[palace];
  // 首宫卦六爻纳支：内卦 + 外卦（八纯卦上下卦相同）
  const pureBranches: EarthlyBranch[] = [...najia.inner, ...najia.outer];

  for (let i = 0; i < 6; i++) {
    const branch = pureBranches[i];
    const element = BRANCH_ELEMENT[branch];
    const relative = getSixRelative(palaceElement, element);
    if (relative !== targetRelative) continue;

    const pos = i + 1;
    const flyLine = chart.lines[i];
    const flyBranch = flyLine.branch;
    const flyElement = BRANCH_ELEMENT[flyBranch];
    const flyRelative = flyLine.relative;
    const flyToFu = getEffect(flyElement, element);

    // 判断伏神有用/无用
    const fuStrength = assessStrength(element, chart.monthBranch, chart.dayBranch).strength;
    const fuIsWang = fuStrength === '旺' || fuStrength === '偏旺';
    const flyStrength = assessStrength(flyElement, chart.monthBranch, chart.dayBranch).strength;
    const flyIsWeak = flyStrength === '弱' || flyStrength === '偏弱';

    let isUseful = false;
    let reason = '';

    if (fuIsWang) {
      isUseful = true;
      reason = '伏神旺相';
    } else if (flyToFu === '生') {
      isUseful = true;
      reason = '飞神生伏神';
    } else if (flyIsWeak || isInXunkong(flyBranch, chart.xunkong)) {
      isUseful = true;
      reason = '飞神衰弱/旬空，伏神可出';
    } else if (flyToFu === '克') {
      isUseful = false;
      reason = '飞神克伏神';
    } else {
      isUseful = fuIsWang;
      reason = fuIsWang ? '伏神有气' : '伏神休囚无气';
    }

    return {
      position: pos,
      branch, element, relative,
      flyBranch, flyElement, flyRelative,
      flyToFu, isUseful, reason,
    };
  }
  return undefined;
}

// ============================================================
// 卦象特征检测
// ============================================================

function detectFeatures(chart: ChartData): string[] {
  const features: string[] = [];
  const upper = chart.primary.upper;
  const lower = chart.primary.lower;

  // 六冲卦：上下卦地支全冲
  const upperBranches = NAJIA_TABLE[upper].outer;
  const lowerBranches = NAJIA_TABLE[lower].inner;
  if (upperBranches.every((b, i) => isClash(b, lowerBranches[i]))) {
    features.push('六冲卦');
  }

  // 六合卦：上下卦地支全合
  if (upperBranches.every((b, i) => isHarmony(b, lowerBranches[i]))) {
    features.push('六合卦');
  }

  // 游魂 / 归魂
  const hexList = ['八纯', '一世', '二世', '三世', '四世', '五世', '游魂', '归魂'];
  // 通过世爻位置推断
  if (chart.shiPosition === 4 && chart.yingPosition === 1) {
    // 可能是四世或游魂，检查上下卦
    if (upper !== chart.primary.palace && lower !== chart.primary.palace) {
      features.push('游魂卦');
    }
  }
  if (chart.shiPosition === 3 && chart.yingPosition === 6) {
    if (lower === chart.primary.palace) {
      features.push('归魂卦');
    }
  }

  // 反吟：动爻变爻地支相冲
  const hasYaoFanyin = chart.lines.some(
    l => l.moving && l.changedBranch && isClash(l.branch, l.changedBranch),
  );
  if (hasYaoFanyin) features.push('爻反吟');

  // 伏吟：动爻变爻地支相同
  const hasYaoFuyin = chart.lines.some(
    l => l.moving && l.changedBranch === l.branch,
  );
  if (hasYaoFuyin) features.push('爻伏吟');

  // 静卦
  if (chart.movingLines.length === 0) features.push('静卦');

  // 六爻乱动
  if (chart.movingLines.length === 6) features.push('六爻乱动');

  return features;
}

// ============================================================
// 用神综合状态描述
// ============================================================

function summarizeYongShen(
  ys: YongShenInfo,
  statuses: YaoStatus[],
  features: string[],
): string {
  if (ys.selectedPosition == null && ys.fuShen) {
    const f = ys.fuShen;
    return `用神${f.relative}（${f.branch}${f.element}）伏藏于第${f.position}爻飞神${f.flyBranch}${f.flyElement}之下，${f.reason}`;
  }
  if (ys.selectedPosition == null) return '用神不上卦且无伏神可借';

  const s = statuses[ys.selectedPosition - 1];
  const parts: string[] = [];
  parts.push(`用神${s.relative}在第${s.position}爻（${s.branch}${s.element}）`);
  parts.push(`旺衰=${s.strength}`);
  if (s.isMoving) {
    parts.push('动爻');
    if (s.jinTui) parts.push(s.jinTui);
    if (s.changedBranch) parts.push(`化${s.changedBranch}${s.changedElement ?? ''}`);
  }
  if (s.isShi) parts.push('持世');
  if (s.isEffectivelyEmpty) parts.push('旬空');
  if (s.isMonthBroken) parts.push('月破');
  if (s.isDayBroken) parts.push('日破');
  if (s.isAnDong) parts.push('暗动');
  if (s.muKu) parts.push(s.muKu);
  return parts.join('，');
}

// ============================================================
// 主入口
// ============================================================

export function analyze(
  chart: ChartData,
  category: Category,
  gender?: Gender,
): AnalysisResult {
  const { monthBranch, dayBranch, xunkong, lines, shiPosition, yingPosition } = chart;

  // ---- 1. 逐爻计算状态 ----
  const yaoStatuses: YaoStatus[] = lines.map((l) => {
    const element = BRANCH_ELEMENT[l.branch];
    const { monthEffect, dayEffect, strength } = assessStrength(element, monthBranch, dayBranch);
    const inXunkong = isInXunkong(l.branch, xunkong);
    const effectivelyEmpty = checkEffectivelyEmpty(l.branch, element, xunkong, monthBranch, dayBranch, l.moving);
    const monthBroken = checkMonthBroken(l.branch, monthBranch);
    const dayBroken = checkDayBroken(l.branch, dayBranch, strength, l.moving, effectivelyEmpty);
    const anDong = checkAnDong(l.branch, dayBranch, strength, l.moving);
    const monthStage = getTwelveStage(element, monthBranch);
    const dayStage = getTwelveStage(element, dayBranch);
    const muKu = checkMuKu(element, dayBranch, strength);

    const status: YaoStatus = {
      position: l.position,
      branch: l.branch,
      element,
      relative: l.relative,
      isShi: l.isShi,
      isYing: l.isYing,
      isMoving: l.moving,
      monthEffect, dayEffect, strength,
      monthStage, dayStage,
      isInXunkong: inXunkong,
      isEffectivelyEmpty: effectivelyEmpty,
      isMonthBroken: monthBroken,
      isDayBroken: dayBroken,
      isAnDong: anDong,
      muKu,
    };

    if (l.moving && l.changedBranch) {
      status.changedBranch = l.changedBranch;
      status.changedElement = BRANCH_ELEMENT[l.changedBranch];
      status.changedRelative = l.changedRelative;
      status.jinTui = getJinTui(l.branch, l.changedBranch);
    }

    return status;
  });

  // ---- 2. 取用神 ----
  const ysType = getYongShenRelative(category, gender);
  let yongShen: YongShenInfo;

  if (ysType === '世爻') {
    yongShen = {
      type: '世爻',
      allPositions: [shiPosition],
      selectedPosition: shiPosition,
      reason: '自占取世爻',
    };
  } else if (ysType === '应爻') {
    yongShen = {
      type: '应爻',
      allPositions: [yingPosition],
      selectedPosition: yingPosition,
      reason: '取应爻为用',
    };
  } else {
    // 六亲取用
    const positions = lines
      .map((l, i) => l.relative === ysType ? i + 1 : -1)
      .filter(v => v > 0);

    if (positions.length > 0) {
      const best = selectBestYao(positions, lines, shiPosition, yingPosition, yaoStatuses);
      yongShen = {
        type: ysType,
        allPositions: positions,
        selectedPosition: best.position,
        reason: positions.length > 1 ? `用神双现，${best.reason}` : best.reason,
      };
    } else {
      // 用神不上卦 → 找伏神
      const fuShen = findFuShen(chart, ysType, yaoStatuses);
      yongShen = {
        type: ysType,
        allPositions: [],
        selectedPosition: null,
        reason: '用神不上卦，取伏神',
        fuShen,
      };
    }
  }

  // ---- 3. 原忌仇 ----
  const ysRelative = typeof ysType === 'string' && ysType !== '世爻' && ysType !== '应爻'
    ? ysType as SixRelative
    : lines[shiPosition - 1].relative; // 世爻/应爻时用世爻六亲

  const { yuan, ji, chou } = YUAN_JI_CHOU[ysRelative];
  const findPositions = (rel: SixRelative) =>
    lines.map((l, i) => l.relative === rel ? i + 1 : -1).filter(v => v > 0);

  const yuanShen = { relative: yuan, positions: findPositions(yuan) };
  const jiShen = { relative: ji, positions: findPositions(ji) };
  const chouShen = { relative: chou, positions: findPositions(chou) };

  // ---- 4. 卦象特征 ----
  const features = detectFeatures(chart);

  // ---- 5. 用神综合描述 ----
  const yongShenSummary = summarizeYongShen(yongShen, yaoStatuses, features);

  return {
    yongShen,
    yuanShen,
    jiShen,
    chouShen,
    yaoStatuses,
    features,
    yongShenSummary,
  };
}
