/**
 * 六爻引擎测试脚本 — 卷五·六爻吉凶习题卷（100题）
 *
 * 用法: npx tsx scripts/test-engine.ts
 *
 * 功能:
 * 1. 从习题文本解析100道卷五习题
 * 2. 从答案文本解析100道标准答案
 * 3. 构建 ChartData，调用 analyze() 引擎
 * 4. 对比引擎输出与标准答案
 * 5. 输出准确率报告
 */

import * as fs from 'fs';
import * as path from 'path';
import { analyze, type Strength, type AnalysisResult } from '@/lib/analysis/liuyao-engine';
import type { ChartData, LineData, HexagramData } from '@/lib/liuyao/chart';
import {
  type EarthlyBranch, type HeavenlyStem, type Trigram, type WuXing, type SixRelative,
  type HexagramInfo,
  EARTHLY_BRANCHES, HEAVENLY_STEMS,
  BRANCH_ELEMENT, NAJIA_TABLE, TRIGRAM_MAP,
  getSixRelative, getSixSpirits, getXunkong,
  HEXAGRAM_LIST, lookupHexagramByName,
} from '@/lib/liuyao/constants';
import type { Category, Gender } from '@/lib/types';

// ============================================================
// 类型定义
// ============================================================

interface TestCase {
  id: number;
  section: string;
  monthBranch: EarthlyBranch;
  dayStem: HeavenlyStem;
  dayBranch: EarthlyBranch;
  xunkong: [EarthlyBranch, EarthlyBranch];
  primaryName: string;
  changedName: string | null;
  category: Category;
  gender?: Gender;
  rawQuestion: string;
}

interface Answer {
  id: number;
  rawStrength: string;
  expectedStrength: Strength;
  yongShenPosition: number | 'shi' | 'ying' | 'fu' | null;
  rawText: string;
}

interface TestResult {
  id: number;
  section: string;
  // 引擎输出
  engineYongShenType: string;
  engineYongShenPos: number | null;
  engineStrength: Strength;
  // 标准答案
  expectedStrength: Strength;
  answerYongShenPos: number | 'shi' | 'ying' | 'fu' | null;
  // 对比
  strengthMatch: boolean;
  strengthClose: boolean; // 差一级算接近
  isFuShen: boolean;
  rawScore: number; // 引擎内部分数（如果能拿到）
  note: string;
}

// ============================================================
// 构建 ChartData
// ============================================================

function getNajiaBranches(lower: Trigram, upper: Trigram): EarthlyBranch[] {
  return [...NAJIA_TABLE[lower].inner, ...NAJIA_TABLE[upper].outer];
}

function buildChartFromExercise(
  primaryName: string,
  changedName: string | null,
  monthBranch: EarthlyBranch,
  dayStem: HeavenlyStem,
  dayBranch: EarthlyBranch,
  xunkong: [EarthlyBranch, EarthlyBranch],
): ChartData {
  const primaryHex = lookupHexagramByName(primaryName);

  // 本卦二进制
  const pUpperBin = TRIGRAM_MAP[primaryHex.upper].binary;
  const pLowerBin = TRIGRAM_MAP[primaryHex.lower].binary;
  const primaryBits = [
    (pLowerBin >> 2) & 1,
    (pLowerBin >> 1) & 1,
    pLowerBin & 1,
    (pUpperBin >> 2) & 1,
    (pUpperBin >> 1) & 1,
    pUpperBin & 1,
  ];

  // 变卦
  let changedHex: HexagramInfo;
  let changedBits: number[];
  let movingLines: number[] = [];

  if (changedName) {
    changedHex = lookupHexagramByName(changedName);
    const cUpperBin = TRIGRAM_MAP[changedHex.upper].binary;
    const cLowerBin = TRIGRAM_MAP[changedHex.lower].binary;
    changedBits = [
      (cLowerBin >> 2) & 1,
      (cLowerBin >> 1) & 1,
      cLowerBin & 1,
      (cUpperBin >> 2) & 1,
      (cUpperBin >> 1) & 1,
      cUpperBin & 1,
    ];
    movingLines = primaryBits
      .map((b, i) => b !== changedBits[i] ? i + 1 : -1)
      .filter(v => v > 0);
  } else {
    changedHex = primaryHex;
    changedBits = [...primaryBits];
  }

  // 纳支
  const primaryBranches = getNajiaBranches(primaryHex.lower, primaryHex.upper);
  const changedBranches = getNajiaBranches(changedHex.lower, changedHex.upper);

  // 宫五行
  const palaceElement = TRIGRAM_MAP[primaryHex.palace].element;

  // 六神
  const spirits = getSixSpirits(dayStem);

  // 组装爻数据
  const lines: LineData[] = primaryBits.map((bit, i) => {
    const position = i + 1;
    const branch = primaryBranches[i];
    const branchElement = BRANCH_ELEMENT[branch];
    const relative = getSixRelative(palaceElement, branchElement);
    const moving = movingLines.includes(position);

    const result: LineData = {
      position,
      yinYang: bit === 1 ? '阳' as const : '阴' as const,
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
    lines,
    monthBranch,
    dayBranch,
    dayStem,
    xunkong,
    castTime: new Date().toISOString(),
  };
}

// ============================================================
// 文本解析
// ============================================================

const STEMS = '甲乙丙丁戊己庚辛壬癸';
const BRANCHES = '子丑寅卯辰巳午未申酉戌亥';

function cleanText(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/--- PAGE \d+ ---\n/g, '')
    .replace(/\n\d{1,3}\n/g, '\n'); // 去掉独立页码行
}

function joinLines(lines: string[]): string[] {
  const result: string[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (/^\d+\.\s/.test(trimmed)) {
      result.push(trimmed);
    } else if (result.length > 0) {
      result[result.length - 1] += trimmed;
    }
  }
  return result;
}

const SECTION_RANGES: { name: string; start: number; end: number; category: Category }[] = [
  { name: '情感', start: 1, end: 15, category: 'relationship' },
  { name: '事业', start: 16, end: 30, category: 'career' },
  { name: '财运', start: 31, end: 45, category: 'wealth' },
  { name: '健康', start: 46, end: 55, category: 'health' },
  { name: '失物', start: 56, end: 65, category: 'lost' },
  { name: '官非', start: 66, end: 75, category: 'other' },
  { name: '比赛', start: 76, end: 80, category: 'other' },
  { name: '出行', start: 81, end: 85, category: 'other' },
  { name: '学业', start: 86, end: 90, category: 'study' },
  { name: '六亲', start: 91, end: 100, category: 'other' },
];

function getSectionInfo(id: number): { name: string; category: Category } {
  for (const s of SECTION_RANGES) {
    if (id >= s.start && id <= s.end) return { name: s.name, category: s.category };
  }
  return { name: '未知', category: 'other' };
}

function parseExercises(text: string): TestCase[] {
  const cleaned = cleanText(text);

  // 用 lastIndexOf 跳过目录，找到实际内容
  const startIdx = cleaned.lastIndexOf('卷五·六爻吉凶习题卷');
  const endIdx = cleaned.indexOf('卷六·六爻象法习题卷', startIdx);
  if (startIdx === -1) throw new Error('找不到卷五');
  const section = cleaned.substring(startIdx, endIdx === -1 ? undefined : endIdx);

  const lines = section.split('\n');
  const joined = joinLines(lines);

  const exerciseRe = new RegExp(
    `^(\\d+)\\.\\s*` +
    `([${STEMS}])([${BRANCHES}])月` +
    `([${STEMS}])([${BRANCHES}])日` +
    `（([${BRANCHES}])([${BRANCHES}])空），` +
    `卦主本人摇得(.+?)(?:变(.+?))?卦，` +
    `(.+?)？`
  );

  const cases: TestCase[] = [];

  for (const line of joined) {
    const m = line.match(exerciseRe);
    if (!m) continue;

    const id = parseInt(m[1]);
    const monthBranch = m[3] as EarthlyBranch;
    const dayStem = m[4] as HeavenlyStem;
    const dayBranch = m[5] as EarthlyBranch;
    const xk1 = m[6] as EarthlyBranch;
    const xk2 = m[7] as EarthlyBranch;
    const primaryName = m[8];
    const changedName = m[9] || null;
    const context = m[10];

    const { name: sectionName, category } = getSectionInfo(id);

    // 检测性别
    let gender: Gender | undefined;
    if (context.includes('男问') || context.includes('男问')) gender = 'male';
    if (context.includes('女问')) gender = 'female';

    cases.push({
      id,
      section: sectionName,
      monthBranch,
      dayStem,
      dayBranch,
      xunkong: [xk1, xk2],
      primaryName,
      changedName,
      category,
      gender,
      rawQuestion: context,
    });
  }

  return cases;
}

function mapStrength(raw: string): Strength {
  switch (raw) {
    case '旺相': case '得旺': case '旺': return '旺';
    case '偏旺': case '偏吉': return '偏旺';
    case '偏衰': case '偏弱': return '偏弱';
    case '休囚': case '休囚至极': case '极弱': case '极衰': case '大凶': return '弱';
    default: return '平';
  }
}

function parseYongShenPosition(text: string, chart?: ChartData): number | 'shi' | 'ying' | 'fu' | null {
  if (text.includes('伏神') || text.includes('不上卦') || text.includes('不卦')) return 'fu';
  if (text.includes('世爻') && (text.includes('为用') || text.includes('为己'))) return 'shi';
  if (text.includes('应爻') && text.includes('为用')) return 'ying';

  const posMap: [RegExp, number][] = [
    [/初爻/, 1],
    [/二爻/, 2],
    [/三爻/, 3],
    [/四爻/, 4],
    [/五爻/, 5],
    [/上爻/, 6],
  ];
  for (const [re, pos] of posMap) {
    if (re.test(text)) return pos;
  }

  // 尝试从六亲+地支推断位置
  if (chart) {
    const relMap: [string, SixRelative][] = [
      ['兄弟爻', '兄弟'], ['父母爻', '父母'], ['子孙爻', '子孙'],
      ['妻财爻', '妻财'], ['官鬼爻', '官鬼'],
    ];
    for (const [keyword, rel] of relMap) {
      if (text.includes(keyword)) {
        // 找到该六亲的爻位
        const positions = chart.lines
          .filter(l => l.relative === rel)
          .map(l => l.position);
        if (positions.length === 1) return positions[0];
        // 多个时尝试匹配地支
        for (const pos of positions) {
          const branch = chart.lines[pos - 1].branch;
          if (text.includes(branch)) return pos;
        }
        if (positions.length > 0) return positions[0];
      }
    }
  }

  return null;
}

function parseAnswers(text: string, chartMap?: Map<number, ChartData>): Answer[] {
  const cleaned = cleanText(text);

  // 用 lastIndexOf 跳过目录
  const startIdx = cleaned.lastIndexOf('六爻吉凶答案卷');
  const endIdx = cleaned.indexOf('六爻象法答案卷', startIdx);
  if (startIdx === -1) throw new Error('找不到六爻吉凶答案卷');
  const section = cleaned.substring(startIdx, endIdx === -1 ? undefined : endIdx);

  const lines = section.split('\n');
  const joined = joinLines(lines);

  const strengthRe = /^(\d+)\.\s*用神(休囚至极|极弱|极衰|旺相|得旺|偏旺|偏吉|偏衰|偏弱|休囚|大凶)/;

  const answers: Answer[] = [];

  for (const line of joined) {
    const m = line.match(strengthRe);
    if (!m) continue;

    const id = parseInt(m[1]);
    const rawStrength = m[2];
    const expectedStrength = mapStrength(rawStrength);

    // 从括号内容解析用神位置
    const bracketMatch = line.match(/[（(](.+?)[）)]/);
    const bracketText = bracketMatch ? bracketMatch[1] : '';
    const chart = chartMap?.get(id);
    const yongShenPosition = parseYongShenPosition(bracketText, chart);

    answers.push({
      id,
      rawStrength,
      expectedStrength,
      yongShenPosition,
      rawText: line.substring(0, 120),
    });
  }

  return answers;
}

// ============================================================
// 旺衰等级距离
// ============================================================

const STRENGTH_ORDER: Strength[] = ['弱', '偏弱', '平', '偏旺', '旺'];

function strengthDistance(a: Strength, b: Strength): number {
  return Math.abs(STRENGTH_ORDER.indexOf(a) - STRENGTH_ORDER.indexOf(b));
}

// ============================================================
// 测试运行
// ============================================================

function runTests(): void {
  const textPath = path.resolve(__dirname, '../liuyaobook/text/六爻习题卷.txt');
  const text = fs.readFileSync(textPath, 'utf-8');

  console.log('📖 解析习题...');
  const exercises = parseExercises(text);
  console.log(`   解析到 ${exercises.length} 道习题`);

  // 先构建所有 ChartData，供答案解析用
  const chartMap = new Map<number, ChartData>();
  for (const ex of exercises) {
    try {
      const chart = buildChartFromExercise(
        ex.primaryName, ex.changedName,
        ex.monthBranch, ex.dayStem, ex.dayBranch, ex.xunkong,
      );
      chartMap.set(ex.id, chart);
    } catch {}
  }

  console.log('📝 解析答案...');
  const answers = parseAnswers(text, chartMap);
  console.log(`   解析到 ${answers.length} 道答案`);

  // 建立答案索引
  const answerMap = new Map<number, Answer>();
  for (const a of answers) answerMap.set(a.id, a);

  const results: TestResult[] = [];
  let parseErrors = 0;

  for (const ex of exercises) {
    const answer = answerMap.get(ex.id);
    if (!answer) {
      console.log(`   ⚠️ 题${ex.id} 无答案`);
      parseErrors++;
      continue;
    }

    try {
      // 复用预构建的 ChartData
      const chart = chartMap.get(ex.id);
      if (!chart) throw new Error('ChartData 构建失败');

      // 运行引擎
      const result = analyze(chart, ex.category, ex.gender);

      // 获取引擎的用神旺衰
      let engineStrength: Strength;
      const isFuShen = answer.yongShenPosition === 'fu';

      if (result.yongShen.selectedPosition != null) {
        const pos = result.yongShen.selectedPosition;
        engineStrength = result.yaoStatuses[pos - 1].comprehensiveStrength ?? result.yaoStatuses[pos - 1].strength;
      } else {
        // 伏神情况，引擎没有综合旺衰
        engineStrength = '弱'; // 默认弱
      }

      // 如果答案指定了具体位置，且与引擎选择不同，用答案位置的旺衰
      let answerPosStrength: Strength | null = null;
      if (answer.yongShenPosition && typeof answer.yongShenPosition === 'number') {
        const aPos = answer.yongShenPosition;
        answerPosStrength = result.yaoStatuses[aPos - 1].comprehensiveStrength ?? result.yaoStatuses[aPos - 1].strength;
      } else if (answer.yongShenPosition === 'shi') {
        const aPos = chart.shiPosition;
        answerPosStrength = result.yaoStatuses[aPos - 1].comprehensiveStrength ?? result.yaoStatuses[aPos - 1].strength;
      } else if (answer.yongShenPosition === 'ying') {
        const aPos = chart.yingPosition;
        answerPosStrength = result.yaoStatuses[aPos - 1].comprehensiveStrength ?? result.yaoStatuses[aPos - 1].strength;
      }

      // 用答案位置的旺衰来对比（更公平）
      const compareStrength = answerPosStrength ?? engineStrength;

      const strengthMatch = compareStrength === answer.expectedStrength;
      const dist = strengthDistance(compareStrength, answer.expectedStrength);

      results.push({
        id: ex.id,
        section: ex.section,
        engineYongShenType: result.yongShen.type,
        engineYongShenPos: result.yongShen.selectedPosition,
        engineStrength: compareStrength,
        expectedStrength: answer.expectedStrength,
        answerYongShenPos: answer.yongShenPosition,
        strengthMatch,
        strengthClose: dist <= 1,
        isFuShen,
        rawScore: 0,
        note: strengthMatch ? '✅' : `❌ 引擎=${compareStrength} 答案=${answer.expectedStrength}(${answer.rawStrength})`,
      });
    } catch (err: any) {
      console.log(`   ❌ 题${ex.id} 执行错误: ${err.message}`);
      parseErrors++;
    }
  }

  // ============================================================
  // 输出报告
  // ============================================================

  console.log('\n' + '='.repeat(80));
  console.log('📊 六爻引擎测试报告 — 卷五·六爻吉凶习题卷');
  console.log('='.repeat(80));

  const total = results.length;
  const exact = results.filter(r => r.strengthMatch).length;
  const close = results.filter(r => r.strengthClose).length;
  const fuCases = results.filter(r => r.isFuShen).length;
  const nonFu = results.filter(r => !r.isFuShen);
  const nonFuExact = nonFu.filter(r => r.strengthMatch).length;
  const nonFuClose = nonFu.filter(r => r.strengthClose).length;

  console.log(`\n总题数: ${total} | 解析错误: ${parseErrors}`);
  console.log(`精确匹配: ${exact}/${total} (${(exact/total*100).toFixed(1)}%)`);
  console.log(`接近匹配(±1级): ${close}/${total} (${(close/total*100).toFixed(1)}%)`);
  console.log(`伏神题数: ${fuCases}`);
  console.log(`非伏神精确: ${nonFuExact}/${nonFu.length} (${(nonFuExact/nonFu.length*100).toFixed(1)}%)`);
  console.log(`非伏神接近: ${nonFuClose}/${nonFu.length} (${(nonFuClose/nonFu.length*100).toFixed(1)}%)`);

  // 按分类统计
  console.log('\n📋 分类统计:');
  console.log('-'.repeat(60));
  console.log(`${'分类'.padEnd(8)} ${'总数'.padStart(4)} ${'精确'.padStart(4)} ${'接近'.padStart(4)} ${'精确率'.padStart(8)} ${'接近率'.padStart(8)}`);
  console.log('-'.repeat(60));

  for (const sec of SECTION_RANGES) {
    const secResults = results.filter(r => r.section === sec.name);
    if (secResults.length === 0) continue;
    const secExact = secResults.filter(r => r.strengthMatch).length;
    const secClose = secResults.filter(r => r.strengthClose).length;
    console.log(
      `${sec.name.padEnd(8)} ${String(secResults.length).padStart(4)} ${String(secExact).padStart(4)} ${String(secClose).padStart(4)} ` +
      `${(secExact/secResults.length*100).toFixed(1).padStart(7)}% ${(secClose/secResults.length*100).toFixed(1).padStart(7)}%`
    );
  }

  // 错误详情
  const errors = results.filter(r => !r.strengthMatch);
  console.log(`\n❌ 错误详情 (${errors.length}题):`);
  console.log('-'.repeat(80));

  for (const r of errors) {
    const dist = strengthDistance(r.engineStrength, r.expectedStrength);
    const arrow = dist > 0 ? (STRENGTH_ORDER.indexOf(r.engineStrength) > STRENGTH_ORDER.indexOf(r.expectedStrength) ? '↑偏高' : '↓偏低') : '';
    console.log(
      `  #${String(r.id).padStart(3)} [${r.section}] ` +
      `引擎=${r.engineStrength} 答案=${r.expectedStrength} ${arrow} ` +
      `(伏神=${r.isFuShen ? '是' : '否'}, 引擎用神=${r.engineYongShenType}@${r.engineYongShenPos ?? 'null'}, 答案位置=${r.answerYongShenPos ?? '?'})`
    );
  }

  // 偏差分布
  console.log('\n📈 偏差分布:');
  const distMap: Record<number, number> = {};
  for (const r of results) {
    const d = strengthDistance(r.engineStrength, r.expectedStrength);
    distMap[d] = (distMap[d] || 0) + 1;
  }
  for (const [d, count] of Object.entries(distMap).sort((a, b) => Number(a[0]) - Number(b[0]))) {
    const bar = '█'.repeat(count);
    console.log(`  差${d}级: ${String(count).padStart(3)} ${bar}`);
  }

  // 错误根因分析
  const fuErrors = errors.filter(r => r.isFuShen);
  const posErrors = errors.filter(r => !r.isFuShen && r.answerYongShenPos !== null &&
    r.answerYongShenPos !== 'fu' &&
    r.engineYongShenPos !== (r.answerYongShenPos === 'shi' ? 'shi' : r.answerYongShenPos === 'ying' ? 'ying' : r.answerYongShenPos));
  const pureStrengthErrors = errors.filter(r => !r.isFuShen && !posErrors.includes(r));

  console.log(`\n🔍 错误根因分析:`);
  console.log(`  伏神无法评估: ${fuErrors.length}题`);
  console.log(`  用神位置不匹配: ${posErrors.length}题`);
  console.log(`  纯旺衰计算偏差: ${pureStrengthErrors.length}题`);

  // 纯旺衰偏差详情
  if (pureStrengthErrors.length > 0) {
    const pureHigh = pureStrengthErrors.filter(r => STRENGTH_ORDER.indexOf(r.engineStrength) > STRENGTH_ORDER.indexOf(r.expectedStrength));
    const pureLow = pureStrengthErrors.filter(r => STRENGTH_ORDER.indexOf(r.engineStrength) < STRENGTH_ORDER.indexOf(r.expectedStrength));
    console.log(`    其中偏高: ${pureHigh.length}题, 偏低: ${pureLow.length}题`);
  }
}

// ============================================================
// 执行
// ============================================================

runTests();
