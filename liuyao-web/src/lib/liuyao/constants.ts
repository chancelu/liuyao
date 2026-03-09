/**
 * 六爻排盘常量表 — 京房纳甲体系
 *
 * 规则来源：京房八宫世应、纳甲配支、六亲五行生克、六神日干起法。
 * 所有规则数据化为常量对象/数组，避免 if/else 硬编码。
 */

// ---------------------------------------------------------------------------
// 基础枚举
// ---------------------------------------------------------------------------

/** 五行 */
export type WuXing = '金' | '木' | '水' | '火' | '土';

/** 八卦 */
export type Trigram = '乾' | '坤' | '震' | '巽' | '坎' | '离' | '艮' | '兑';

/** 地支 */
export const EARTHLY_BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const;
export type EarthlyBranch = (typeof EARTHLY_BRANCHES)[number];

/** 天干 */
export const HEAVENLY_STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const;
export type HeavenlyStem = (typeof HEAVENLY_STEMS)[number];

/** 六亲 */
export type SixRelative = '父母' | '兄弟' | '子孙' | '妻财' | '官鬼';

/** 六神 */
export type SixSpirit = '青龙' | '朱雀' | '勾陈' | '螣蛇' | '白虎' | '玄武';

// ---------------------------------------------------------------------------
// 八卦属性
// ---------------------------------------------------------------------------

export interface TrigramInfo {
  name: Trigram;
  element: WuXing;
  /** 二进制表示，从下到上：0=阴 1=阳，3位 */
  binary: number;
}

export const TRIGRAM_MAP: Record<Trigram, TrigramInfo> = {
  乾: { name: '乾', element: '金', binary: 0b111 },
  兑: { name: '兑', element: '金', binary: 0b110 },
  离: { name: '离', element: '火', binary: 0b101 },
  震: { name: '震', element: '木', binary: 0b100 },
  巽: { name: '巽', element: '木', binary: 0b011 },
  坎: { name: '坎', element: '水', binary: 0b010 },
  艮: { name: '艮', element: '土', binary: 0b001 },
  坤: { name: '坤', element: '土', binary: 0b000 },
};

/** 通过 3-bit binary 查找三爻卦 */
export const BINARY_TO_TRIGRAM: Record<number, Trigram> = {
  0b111: '乾',
  0b110: '兑',
  0b101: '离',
  0b100: '震',
  0b011: '巽',
  0b010: '坎',
  0b001: '艮',
  0b000: '坤',
};

// ---------------------------------------------------------------------------
// 地支五行
// ---------------------------------------------------------------------------

export const BRANCH_ELEMENT: Record<EarthlyBranch, WuXing> = {
  子: '水', 丑: '土', 寅: '木', 卯: '木',
  辰: '土', 巳: '火', 午: '火', 未: '土',
  申: '金', 酉: '金', 戌: '土', 亥: '水',
};

// ---------------------------------------------------------------------------
// 纳甲配支表
// 京房纳甲：阳卦（乾坎艮震）取阳支顺排，阴卦（坤兑离巽）取阴支逆排
// 内卦（初-三爻）和外卦（四-上爻）分别对应下卦和上卦的纳支
// ---------------------------------------------------------------------------

/**
 * 每个三爻卦的纳支：[初爻, 二爻, 三爻] 内卦位 / [四爻, 五爻, 上爻] 外卦位
 *
 * 乾：内甲子寅辰 / 外壬午申戌
 * 坎：内戊寅辰午 / 外戊申戌子
 * 艮：内丙辰午申 / 外丙戌子寅
 * 震：内庚子寅辰 / 外庚午申戌
 * 坤：内乙未巳卯 / 外癸丑亥酉
 * 兑：内丁巳卯丑 / 外丁亥酉未
 * 离：内己卯丑亥 / 外己酉未巳
 * 巽：内辛丑亥酉 / 外辛未巳卯
 */
export const NAJIA_TABLE: Record<Trigram, { inner: [EarthlyBranch, EarthlyBranch, EarthlyBranch]; outer: [EarthlyBranch, EarthlyBranch, EarthlyBranch] }> = {
  乾: { inner: ['子', '寅', '辰'], outer: ['午', '申', '戌'] },
  坎: { inner: ['寅', '辰', '午'], outer: ['申', '戌', '子'] },
  艮: { inner: ['辰', '午', '申'], outer: ['戌', '子', '寅'] },
  震: { inner: ['子', '寅', '辰'], outer: ['午', '申', '戌'] },
  坤: { inner: ['未', '巳', '卯'], outer: ['丑', '亥', '酉'] },
  兑: { inner: ['巳', '卯', '丑'], outer: ['亥', '酉', '未'] },
  离: { inner: ['卯', '丑', '亥'], outer: ['酉', '未', '巳'] },
  巽: { inner: ['丑', '亥', '酉'], outer: ['未', '巳', '卯'] },
};

// ---------------------------------------------------------------------------
// 八宫六十四卦 — 完整映射表
// 每宫 8 卦，按序：八纯、一世、二世、三世、四世、五世、游魂、归魂
// ---------------------------------------------------------------------------

export interface HexagramInfo {
  name: string;
  upper: Trigram;
  lower: Trigram;
  palace: Trigram;
  /** 世爻位置 1-6 */
  shi: number;
  /** 应爻位置 1-6 */
  ying: number;
}

/**
 * 世应规则（按宫内序号）：
 * 1=八纯: 世6应3 | 2=一世: 世1应4 | 3=二世: 世2应5
 * 4=三世: 世3应6 | 5=四世: 世4应1 | 6=五世: 世5应2
 * 7=游魂: 世4应1 | 8=归魂: 世3应6
 */
const SHI_YING: [number, number][] = [
  [6, 3], // 八纯卦
  [1, 4], // 一世卦
  [2, 5], // 二世卦
  [3, 6], // 三世卦
  [4, 1], // 四世卦
  [5, 2], // 五世卦
  [4, 1], // 游魂卦
  [3, 6], // 归魂卦
];

function h(name: string, upper: Trigram, lower: Trigram, palace: Trigram, palaceIdx: number): HexagramInfo {
  const [shi, ying] = SHI_YING[palaceIdx];
  return { name, upper, lower, palace, shi, ying };
}

/**
 * 六十四卦完整表 — 京房八宫排列
 * key = `${upper三位binary}${lower三位binary}` 的十进制值
 */
const HEXAGRAM_LIST: HexagramInfo[] = [
  // 乾宫（金）
  h('乾为天',   '乾', '乾', '乾', 0),
  h('天风姤',   '乾', '巽', '乾', 1),
  h('天山遁',   '乾', '艮', '乾', 2),
  h('天地否',   '乾', '坤', '乾', 3),
  h('风地观',   '巽', '坤', '乾', 4),
  h('山地剥',   '艮', '坤', '乾', 5),
  h('火地晋',   '离', '坤', '乾', 6),
  h('火天大有', '离', '乾', '乾', 7),

  // 兑宫（金）
  h('兑为泽',   '兑', '兑', '兑', 0),
  h('泽水困',   '兑', '坎', '兑', 1),
  h('泽地萃',   '兑', '坤', '兑', 2),
  h('泽山咸',   '兑', '艮', '兑', 3),
  h('水山蹇',   '坎', '艮', '兑', 4),
  h('地山谦',   '坤', '艮', '兑', 5),
  h('雷山小过', '震', '艮', '兑', 6),
  h('雷泽归妹', '震', '兑', '兑', 7),

  // 离宫（火）
  h('离为火',   '离', '离', '离', 0),
  h('火山旅',   '离', '艮', '离', 1),
  h('火风鼎',   '离', '巽', '离', 2),
  h('火水未济', '离', '坎', '离', 3),
  h('山水蒙',   '艮', '坎', '离', 4),
  h('风水涣',   '巽', '坎', '离', 5),
  h('天水讼',   '乾', '坎', '离', 6),
  h('天火同人', '乾', '离', '离', 7),

  // 震宫（木）
  h('震为雷',   '震', '震', '震', 0),
  h('雷地豫',   '震', '坤', '震', 1),
  h('雷水解',   '震', '坎', '震', 2),
  h('雷风恒',   '震', '巽', '震', 3),
  h('地风升',   '坤', '巽', '震', 4),
  h('水风井',   '坎', '巽', '震', 5),
  h('泽风大过', '兑', '巽', '震', 6),
  h('泽雷随',   '兑', '震', '震', 7),

  // 巽宫（木）
  h('巽为风',   '巽', '巽', '巽', 0),
  h('风天小畜', '巽', '乾', '巽', 1),
  h('风火家人', '巽', '离', '巽', 2),
  h('风雷益',   '巽', '震', '巽', 3),
  h('天雷无妄', '乾', '震', '巽', 4),
  h('火雷噬嗑', '离', '震', '巽', 5),
  h('山雷颐',   '艮', '震', '巽', 6),
  h('山风蛊',   '艮', '巽', '巽', 7),

  // 坎宫（水）
  h('坎为水',   '坎', '坎', '坎', 0),
  h('水泽节',   '坎', '兑', '坎', 1),
  h('水雷屯',   '坎', '震', '坎', 2),
  h('水火既济', '坎', '离', '坎', 3),
  h('泽火革',   '兑', '离', '坎', 4),
  h('雷火丰',   '震', '离', '坎', 5),
  h('地火明夷', '坤', '离', '坎', 6),
  h('地水师',   '坤', '坎', '坎', 7),

  // 艮宫（土）
  h('艮为山',   '艮', '艮', '艮', 0),
  h('山火贲',   '艮', '离', '艮', 1),
  h('山天大畜', '艮', '乾', '艮', 2),
  h('山泽损',   '艮', '兑', '艮', 3),
  h('火泽睽',   '离', '兑', '艮', 4),
  h('天泽履',   '乾', '兑', '艮', 5),
  h('风泽中孚', '巽', '兑', '艮', 6),
  h('风山渐',   '巽', '艮', '艮', 7),

  // 坤宫（土）
  h('坤为地',   '坤', '坤', '坤', 0),
  h('地雷复',   '坤', '震', '坤', 1),
  h('地泽临',   '坤', '兑', '坤', 2),
  h('地天泰',   '坤', '乾', '坤', 3),
  h('雷天大壮', '震', '乾', '坤', 4),
  h('泽天夬',   '兑', '乾', '坤', 5),
  h('水天需',   '坎', '乾', '坤', 6),
  h('水地比',   '坎', '坤', '坤', 7),
];

/** 通过 upper+lower trigram 查找卦 — 用 6-bit key: upper(3bit) << 3 | lower(3bit) */
function buildHexagramLookup(): Map<number, HexagramInfo> {
  const map = new Map<number, HexagramInfo>();
  for (const hex of HEXAGRAM_LIST) {
    const key = (TRIGRAM_MAP[hex.upper].binary << 3) | TRIGRAM_MAP[hex.lower].binary;
    map.set(key, hex);
  }
  return map;
}

const HEXAGRAM_LOOKUP = buildHexagramLookup();

export function lookupHexagram(upper: Trigram, lower: Trigram): HexagramInfo {
  const key = (TRIGRAM_MAP[upper].binary << 3) | TRIGRAM_MAP[lower].binary;
  const info = HEXAGRAM_LOOKUP.get(key);
  if (!info) throw new Error(`Unknown hexagram: ${upper}/${lower}`);
  return info;
}

export function lookupHexagramByBinary(upperBin: number, lowerBin: number): HexagramInfo {
  const key = (upperBin << 3) | lowerBin;
  const info = HEXAGRAM_LOOKUP.get(key);
  if (!info) throw new Error(`Unknown hexagram binary: ${upperBin}/${lowerBin}`);
  return info;
}

// ---------------------------------------------------------------------------
// 六亲配置
// 生我父母、同我兄弟、我生子孙、我克妻财、克我官鬼
// ---------------------------------------------------------------------------

/** 五行相生：key 生 value */
const SHENG: Record<WuXing, WuXing> = { 木: '火', 火: '土', 土: '金', 金: '水', 水: '木' };
/** 五行相克：key 克 value */
const KE: Record<WuXing, WuXing> = { 木: '土', 土: '水', 水: '火', 火: '金', 金: '木' };

/** 根据宫五行和爻地支五行，计算六亲 */
export function getSixRelative(palaceElement: WuXing, branchElement: WuXing): SixRelative {
  if (branchElement === palaceElement) return '兄弟';
  if (SHENG[branchElement] === palaceElement) return '父母'; // 生我者
  if (SHENG[palaceElement] === branchElement) return '子孙'; // 我生者
  if (KE[palaceElement] === branchElement) return '妻财'; // 我克者
  return '官鬼'; // 克我者
}

// ---------------------------------------------------------------------------
// 六神
// 甲乙起青龙、丙丁起朱雀、戊起勾陈、己起螣蛇、庚辛起白虎、壬癸起玄武
// ---------------------------------------------------------------------------

export const SIX_SPIRITS: SixSpirit[] = ['青龙', '朱雀', '勾陈', '螣蛇', '白虎', '玄武'];

/** 日干对应初爻六神起始 index */
const SPIRIT_START: Record<HeavenlyStem, number> = {
  甲: 0, 乙: 0, // 青龙
  丙: 1, 丁: 1, // 朱雀
  戊: 2,         // 勾陈
  己: 3,         // 螣蛇
  庚: 4, 辛: 4, // 白虎
  壬: 5, 癸: 5, // 玄武
};

/** 获取六爻六神分配，返回 [初爻, 二爻, ..., 上爻] */
export function getSixSpirits(dayStem: HeavenlyStem): SixSpirit[] {
  const start = SPIRIT_START[dayStem];
  return Array.from({ length: 6 }, (_, i) => SIX_SPIRITS[(start + i) % 6]);
}

// ---------------------------------------------------------------------------
// 旬空
// ---------------------------------------------------------------------------

/**
 * 六十甲子旬空表
 * 天干索引 + 地支索引 确定甲子序数，除以 10 得旬，查表得空亡二支
 */
const XUNKONG_TABLE: [EarthlyBranch, EarthlyBranch][] = [
  ['戌', '亥'], // 甲子旬
  ['申', '酉'], // 甲戌旬
  ['午', '未'], // 甲申旬
  ['辰', '巳'], // 甲午旬
  ['寅', '卯'], // 甲辰旬
  ['子', '丑'], // 甲寅旬
];

export function getXunkong(dayStem: HeavenlyStem, dayBranch: EarthlyBranch): [EarthlyBranch, EarthlyBranch] {
  const stemIdx = HEAVENLY_STEMS.indexOf(dayStem);
  const branchIdx = EARTHLY_BRANCHES.indexOf(dayBranch);
  // 回推到本旬甲日对应的地支索引：branchIdx - stemIdx（mod 12）
  const jiaBranchIdx = ((branchIdx - stemIdx) % 12 + 12) % 12;
  // 甲子=0, 甲戌=1, 甲申=2, 甲午=3, 甲辰=4, 甲寅=5
  // 甲子对应branchIdx=0, 甲戌=10, 甲申=8, 甲午=6, 甲辰=4, 甲寅=2
  // 旬序 = jiaBranchIdx / 2
  const xunIdx = jiaBranchIdx / 2;
  return XUNKONG_TABLE[xunIdx];
}
