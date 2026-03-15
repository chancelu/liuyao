/**
 * 混合分析器测试 — 引擎+模型协作 vs 纯引擎
 *
 * 用法:
 *   npx tsx scripts/test-hybrid.ts          # mock LLM (用答案做 oracle)
 *   npx tsx scripts/test-hybrid.ts --live   # 真实 LLM API 调用
 */

import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

import { analyze, getScoreBreakdown, type Strength, type AnalysisResult } from '@/lib/analysis/liuyao-engine';
import {
  analyzeHybrid,
  assessYongShenConfidence,
  assessStrengthConfidence,
  detectSpecialFactors,
  buildStrengthReviewPrompt,
  type LLMFunction,
} from '@/lib/analysis/hybrid-analyzer';
import type { ChartData, LineData, HexagramData } from '@/lib/liuyao/chart';
import {
  type EarthlyBranch, type HeavenlyStem, type Trigram, type WuXing, type SixRelative,
  EARTHLY_BRANCHES, HEAVENLY_STEMS,
  BRANCH_ELEMENT, NAJIA_TABLE, TRIGRAM_MAP,
  getSixRelative, getSixSpirits, getXunkong,
  HEXAGRAM_LIST, lookupHexagramByName,
  type HexagramInfo,
} from '@/lib/liuyao/constants';
import type { Category, Gender } from '@/lib/types';

process.on('unhandledRejection', (reason) => {
  console.error('UNHANDLED REJECTION:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err.message, err.stack);
});

// ============================================================
// 共享工具（与 test-engine.ts 一致）
// ============================================================

const SECTION_RANGES: Array<{ start: number; end: number; name: string; category: Category }> = [
  { start: 1, end: 15, name: '情感', category: 'relationship' },
  { start: 16, end: 30, name: '事业', category: 'career' },
  { start: 31, end: 45, name: '财运', category: 'wealth' },
  { start: 46, end: 55, name: '健康', category: 'health' },
  { start: 56, end: 65, name: '失物', category: 'lost' },
  { start: 66, end: 75, name: '官非', category: 'other' },
  { start: 76, end: 80, name: '比赛', category: 'other' },
  { start: 81, end: 84, name: '出行', category: 'other' },
  { start: 85, end: 90, name: '学业', category: 'study' },
  { start: 91, end: 100, name: '六亲', category: 'other' },
];

const STRENGTH_ORDER: Strength[] = ['弱', '偏弱', '平', '偏旺', '旺'];
function strengthDistance(a: Strength, b: Strength): number {
  return Math.abs(STRENGTH_ORDER.indexOf(a) - STRENGTH_ORDER.indexOf(b));
}

interface TestCase {
  id: number; section: string;
  monthBranch: EarthlyBranch; dayStem: HeavenlyStem; dayBranch: EarthlyBranch;
  xunkong: [EarthlyBranch, EarthlyBranch];
  primaryName: string; changedName: string | null;
  category: Category; gender?: Gender; rawQuestion: string;
}

interface Answer {
  id: number; rawStrength: string; expectedStrength: Strength;
  yongShenPosition: number | 'shi' | 'ying' | 'fu' | null;
  rawText: string;
}

function cleanText(t: string) { return t.replace(/\r\n/g, '\n').replace(/--- PAGE \d+ ---/g, ''); }

function joinLines(lines: string[]): string[] {
  const r: string[] = [];
  for (const l of lines) {
    const t = l.trim();
    if (!t) continue;
    if (/^\d+[\.\uff0e]/.test(t)) r.push(t);
    else if (r.length > 0) r[r.length - 1] += t;
  }
  return r;
}

function parseExercises(text: string): TestCase[] {
  const cleaned = cleanText(text);
  const startIdx = cleaned.lastIndexOf('六爻吉凶习题卷');
  const endIdx = cleaned.indexOf('六爻象法习题卷', startIdx);
  const section = cleaned.substring(startIdx, endIdx === -1 ? undefined : endIdx);
  const joined = joinLines(section.split('\n'));
  const re = /^(\d+)[\.\uff0e]\s*([甲乙丙丁戊己庚辛壬癸])([子丑寅卯辰巳午未申酉戌亥])月([甲乙丙丁戊己庚辛壬癸])([子丑寅卯辰巳午未申酉戌亥])日[（(]([子丑寅卯辰巳午未申酉戌亥])([子丑寅卯辰巳午未申酉戌亥])空[）)][，,].*?摇得(.+?)(?:变(.+?))?卦[，,](.+)/;
  const exercises: TestCase[] = [];
  for (const line of joined) {
    const m = line.match(re);
    if (!m) continue;
    const id = parseInt(m[1]);
    const sec = SECTION_RANGES.find(s => id >= s.start && id <= s.end);
    if (!sec) continue;
    const gender = m[10]?.includes('女') ? 'female' as Gender :
      (m[10]?.includes('男') || sec.category === 'relationship') ? 'male' as Gender : undefined;
    exercises.push({
      id, section: sec.name,
      monthBranch: m[3] as EarthlyBranch, dayStem: m[4] as HeavenlyStem, dayBranch: m[5] as EarthlyBranch,
      xunkong: [m[6] as EarthlyBranch, m[7] as EarthlyBranch],
      primaryName: m[8].trim(), changedName: m[9]?.trim() || null,
      category: sec.category, gender, rawQuestion: m[10] || '',
    });
  }
  return exercises;
}

function mapStrength(raw: string): Strength {
  if (['旺相', '得旺'].includes(raw)) return '旺';
  if (['偏旺', '偏吉'].includes(raw)) return '偏旺';
  if (['偏衰', '偏弱'].includes(raw)) return '偏弱';
  if (['休囚', '休囚至极', '极弱', '极衰', '大凶'].includes(raw)) return '弱';
  return '平';
}

function parseYongShenPosition(text: string, chart?: ChartData): number | 'shi' | 'ying' | 'fu' | null {
  if (text.includes('伏神') || text.includes('不上卦') || text.includes('不卦')) return 'fu';
  if (text.includes('世爻') && (text.includes('为用') || text.includes('为己'))) return 'shi';
  if (text.includes('应爻') && text.includes('为用')) return 'ying';
  const posMap: [RegExp, number][] = [[/初爻/,1],[/二爻/,2],[/三爻/,3],[/四爻/,4],[/五爻/,5],[/上爻/,6]];
  for (const [re, pos] of posMap) { if (re.test(text)) return pos; }
  if (chart) {
    const relMap: [string, SixRelative][] = [['兄弟爻','兄弟'],['父母爻','父母'],['子孙爻','子孙'],['妻财爻','妻财'],['官鬼爻','官鬼']];
    for (const [kw, rel] of relMap) {
      if (text.includes(kw)) {
        const positions = chart.lines.filter(l => l.relative === rel).map(l => l.position);
        if (positions.length === 1) return positions[0];
        for (const pos of positions) { if (text.includes(chart.lines[pos-1].branch)) return pos; }
        if (positions.length > 0) return positions[0];
      }
    }
  }
  return null;
}

function parseAnswers(text: string, chartMap?: Map<number, ChartData>): Answer[] {
  const cleaned = cleanText(text);
  const startIdx = cleaned.lastIndexOf('六爻吉凶答案卷');
  const endIdx = cleaned.indexOf('六爻象法答案卷', startIdx);
  const section = cleaned.substring(startIdx, endIdx === -1 ? undefined : endIdx);
  const joined = joinLines(section.split('\n'));
  const re = /^(\d+)[\.\uff0e]\s*用神(休囚至极|极弱|极衰|旺相|得旺|偏旺|偏吉|偏衰|偏弱|休囚|大凶)/;
  const answers: Answer[] = [];
  for (const line of joined) {
    const m = line.match(re);
    if (!m) continue;
    const id = parseInt(m[1]);
    const bracketMatch = line.match(/[（(](.+?)[）)]/);
    const chart = chartMap?.get(id);
    const yongShenPosition = parseYongShenPosition(bracketMatch?.[1] ?? '', chart);
    answers.push({ id, rawStrength: m[2], expectedStrength: mapStrength(m[2]), yongShenPosition, rawText: line.substring(0,120) });
  }
  return answers;
}

// ============================================================
// ChartData 构建（与 test-engine.ts 一致）
// ============================================================

function getNajiaBranches(lower: Trigram, upper: Trigram): EarthlyBranch[] {
  return [...NAJIA_TABLE[lower].inner, ...NAJIA_TABLE[upper].outer];
}

function buildChartFromExercise(
  primaryName: string, changedName: string | null,
  monthBranch: EarthlyBranch, dayStem: HeavenlyStem, dayBranch: EarthlyBranch,
  xunkong: [EarthlyBranch, EarthlyBranch],
): ChartData {
  const primaryHex = lookupHexagramByName(primaryName);
  const pUpperBin = TRIGRAM_MAP[primaryHex.upper].binary;
  const pLowerBin = TRIGRAM_MAP[primaryHex.lower].binary;
  const primaryBits = [
    (pLowerBin >> 2) & 1, (pLowerBin >> 1) & 1, pLowerBin & 1,
    (pUpperBin >> 2) & 1, (pUpperBin >> 1) & 1, pUpperBin & 1,
  ];

  let changedHex: HexagramInfo;
  let changedBits: number[];
  let movingLines: number[] = [];

  if (changedName) {
    changedHex = lookupHexagramByName(changedName);
    const cUpperBin = TRIGRAM_MAP[changedHex.upper].binary;
    const cLowerBin = TRIGRAM_MAP[changedHex.lower].binary;
    changedBits = [(cLowerBin>>2)&1,(cLowerBin>>1)&1,cLowerBin&1,(cUpperBin>>2)&1,(cUpperBin>>1)&1,cUpperBin&1];
    movingLines = primaryBits.map((b,i) => b !== changedBits[i] ? i+1 : -1).filter(v => v > 0);
  } else {
    changedHex = primaryHex;
    changedBits = [...primaryBits];
  }

  const primaryBranches = getNajiaBranches(primaryHex.lower as Trigram, primaryHex.upper as Trigram);
  const changedBranches = getNajiaBranches(changedHex.lower as Trigram, changedHex.upper as Trigram);
  const palaceElement = TRIGRAM_MAP[primaryHex.palace as Trigram].element;
  const spirits = getSixSpirits(dayStem);

  const lines: LineData[] = primaryBits.map((bit, i) => {
    const position = i + 1;
    const branch = primaryBranches[i];
    const branchElement = BRANCH_ELEMENT[branch];
    const relative = getSixRelative(palaceElement, branchElement);
    const moving = movingLines.includes(position);
    const result: LineData = {
      position,
      yinYang: bit === 1 ? '阳' as any : '阴' as any,
      moving, branch, branchElement, relative,
      spirit: spirits[i],
      isShi: position === primaryHex.shi,
      isYing: position === primaryHex.ying,
    };
    if (moving) {
      result.changedBranch = changedBranches[i];
      result.changedRelative = getSixRelative(palaceElement, BRANCH_ELEMENT[changedBranches[i]]);
    }
    return result;
  });

  const toHexData = (hex: HexagramInfo): HexagramData => ({
    name: hex.name, palace: hex.palace as Trigram,
    palaceElement: TRIGRAM_MAP[hex.palace as Trigram].element,
    upper: hex.upper as Trigram, lower: hex.lower as Trigram,
  });

  return {
    primary: toHexData(primaryHex), changed: toHexData(changedHex),
    movingLines, shiPosition: primaryHex.shi, yingPosition: primaryHex.ying,
    lines, monthBranch, dayBranch, dayStem, xunkong,
    castTime: new Date().toISOString(),
  };
}

import { execSync } from 'child_process';

// ============================================================
// LLM — use curl to avoid Node.js fetch connection pool issues
// ============================================================

async function callRealLLM(prompt: string): Promise<string> {
  const apiKey = process.env.LLM_API_KEY;
  const baseUrl = (process.env.LLM_BASE_URL || 'https://api.openai.com').replace(/\/+$/, '');
  const model = process.env.LLM_MODEL || 'gpt-4o';
  if (!apiKey) throw new Error('LLM_API_KEY not set');

  const url = baseUrl.includes('/openai') ? `${baseUrl}/chat/completions` : `${baseUrl}/chat/completions`;
  const body = JSON.stringify({
    model,
    messages: [
      { role: 'system', content: '你是六爻分析专家。严格按要求的 JSON 格式回答，不要输出其他内容。' },
      { role: 'user', content: prompt },
    ],
    temperature: 0.1,
    max_tokens: 500,
  });

  // Write body to temp file to avoid shell escaping issues
  const tmpFile = path.resolve(__dirname, '../.tmp-llm-body.json');
  fs.writeFileSync(tmpFile, body);

  try {
    const result = execSync(
      `curl -s --max-time 30 -X POST "${url}" -H "Content-Type: application/json" -H "Authorization: Bearer ${apiKey}" -d @"${tmpFile.replace(/\\/g, '/')}"`,
      { encoding: 'utf-8', timeout: 35000 }
    );
    const data = JSON.parse(result);
    if (data.error) throw new Error(data.error.message || JSON.stringify(data.error));
    return data.choices?.[0]?.message?.content ?? '';
  } finally {
    try { fs.unlinkSync(tmpFile); } catch {}
  }
}

// ============================================================
// 主测试
// ============================================================

function getEngineStrength(result: AnalysisResult, answer: Answer, chart: ChartData): Strength {
  // 引擎选择的用神旺衰
  let s: Strength;
  if (result.yongShen.selectedPosition != null) {
    const pos = result.yongShen.selectedPosition;
    s = result.yaoStatuses[pos - 1].comprehensiveStrength ?? result.yaoStatuses[pos - 1].strength;
  } else if (result.yongShen.fuShen) {
    s = result.yongShen.fuShen.comprehensiveStrength;
  } else {
    s = '弱';
  }

  // 用答案位置修正（公平对比）
  if (answer.yongShenPosition && typeof answer.yongShenPosition === 'number') {
    s = result.yaoStatuses[answer.yongShenPosition - 1].comprehensiveStrength ?? result.yaoStatuses[answer.yongShenPosition - 1].strength;
  } else if (answer.yongShenPosition === 'shi') {
    s = result.yaoStatuses[chart.shiPosition - 1].comprehensiveStrength ?? result.yaoStatuses[chart.shiPosition - 1].strength;
  } else if (answer.yongShenPosition === 'ying') {
    s = result.yaoStatuses[chart.yingPosition - 1].comprehensiveStrength ?? result.yaoStatuses[chart.yingPosition - 1].strength;
  }
  return s;
}

async function main() {
  const isLive = process.argv.includes('--live');
  const isJson = process.argv.includes('--json');
  const batchArg = process.argv.find(a => a.startsWith('--batch='));
  let batchStart = 1, batchEnd = 100;
  if (batchArg) {
    const [s, e] = batchArg.replace('--batch=', '').split('-').map(Number);
    batchStart = s; batchEnd = e;
  }
  if (!isJson) console.log(`\n🔬 混合分析器测试 — ${isLive ? '真实 LLM' : 'Mock'} [#${batchStart}-${batchEnd}]\n`);

  const text = fs.readFileSync(path.resolve(__dirname, '../liuyaobook/text/六爻习题卷.txt'), 'utf-8');

  if (!isJson) console.log('📖 解析习题...');
  const exercises = parseExercises(text);
  if (!isJson) console.log(`   ${exercises.length} 道习题`);

  const chartMap = new Map<number, ChartData>();
  for (const ex of exercises) {
    try {
      chartMap.set(ex.id, buildChartFromExercise(ex.primaryName, ex.changedName, ex.monthBranch, ex.dayStem, ex.dayBranch, ex.xunkong));
    } catch (e) {
      if (!isJson) console.log(`   ⚠️ #${ex.id} chart build failed: ${(e as Error).message}`);
    }
  }
  if (!isJson) console.log(`   ${chartMap.size} 张卦图`);

  if (!isJson) console.log('📝 解析答案...');
  const answers = parseAnswers(text, chartMap);
  if (!isJson) console.log(`   ${answers.length} 道答案`);

  const answerMap = new Map(answers.map(a => [a.id, a]));

  let engineExact = 0, engineClose = 0;
  let hybridExact = 0, hybridClose = 0;
  let llmCalls = 0;
  let processed = 0;
  const improvements: string[] = [];
  const regressions: string[] = [];

  for (const ex of exercises) {
    if (ex.id < batchStart || ex.id > batchEnd) continue;
    const answer = answerMap.get(ex.id);
    const chart = chartMap.get(ex.id);
    if (!answer || !chart) continue;

    try {
    processed++;

    // --- 纯引擎 ---
    const engineResult = analyze(chart, ex.category, ex.gender);
    const engineCompare = getEngineStrength(engineResult, answer, chart);
    const engineMatch = engineCompare === answer.expectedStrength;
    const engineDist = strengthDistance(engineCompare, answer.expectedStrength);
    if (engineMatch) engineExact++;
    if (engineDist <= 1) engineClose++;

    // --- 混合分析 ---
    let hybridStrength: Strength;

    if (isLive) {
      try {
        // Rate limit: 1s delay between exercises
        if (processed > 1) await new Promise(r => setTimeout(r, 1500));
        console.log(`  #${ex.id} starting hybrid...`);
        // Per-exercise timeout: 60s
        const hybridPromise = analyzeHybrid(chart, ex.category, ex.gender, ex.rawQuestion, callRealLLM);
        const timeoutPromise = new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Exercise timeout (60s)')), 60000));
        const hybridResult = await Promise.race([hybridPromise, timeoutPromise]);
        llmCalls += hybridResult.decisions.filter(d => d.llmOverride).length;
        const hasYongShenOverride = !!hybridResult.decisions[0]?.llmOverride;

        if (hybridResult.correctedStrength) {
          // LLM 修正了旺衰
          hybridStrength = hybridResult.correctedStrength;
        } else if (hasYongShenOverride && hybridResult.correctedYongShenPos != null) {
          // LLM 修正了用神位置 → 用新位置的旺衰
          hybridStrength = hybridResult.yaoStatuses[hybridResult.correctedYongShenPos - 1].comprehensiveStrength
            ?? hybridResult.yaoStatuses[hybridResult.correctedYongShenPos - 1].strength;
        } else {
          // LLM 没有修正 → 用答案位置（与引擎对比一致）
          hybridStrength = engineCompare;
        }
        if (!isJson) console.log(`  #${ex.id} OK: hybrid=${hybridStrength} decisions=${hybridResult.decisions.length}`);
      } catch (e) {
        console.error(`  #${ex.id} ERROR: ${(e as Error).message}`);
        hybridStrength = engineCompare;
      }
    } else {
      // Mock: 模拟模型总是选对用神位置
      hybridStrength = engineCompare; // 默认同引擎

      if (answer.yongShenPosition === 'fu' && engineResult.yongShen.fuShen) {
        // 模型选择伏神
        hybridStrength = engineResult.yongShen.fuShen.comprehensiveStrength;
        llmCalls++;
      }
      // 对于非伏神情况，engineCompare 已经用了答案位置，所以 mock 和引擎一样
      // 真正的差异在 --live 模式下体现
    }

    const hybridMatch = hybridStrength === answer.expectedStrength;
    const hybridDist = strengthDistance(hybridStrength, answer.expectedStrength);
    if (hybridMatch) hybridExact++;
    if (hybridDist <= 1) hybridClose++;

    if (!engineMatch && hybridMatch) {
      improvements.push(`  ⬆️ #${String(ex.id).padStart(3)} [${ex.section}] ${engineCompare}→${hybridStrength} (答案=${answer.expectedStrength})`);
    } else if (engineMatch && !hybridMatch) {
      regressions.push(`  ⬇️ #${String(ex.id).padStart(3)} [${ex.section}] ${engineCompare}→${hybridStrength} (答案=${answer.expectedStrength})`);
    }
    } catch (loopErr) {
      console.error(`  #${ex.id} LOOP ERROR: ${(loopErr as Error).message}`);
    }
  }

  if (isJson) {
    // JSON output for batch runner
    const result = {
      range: `${batchStart}-${batchEnd}`,
      engineExact, engineClose, hybridExact, hybridClose,
      processed, llmCalls, improvements, regressions,
    };
    console.log('###JSON###' + JSON.stringify(result) + '###END###');
  } else {
    console.log(`\n${'='.repeat(72)}`);
    console.log('📊 对比报告');
    console.log('='.repeat(72));
    console.log(`\n  处理: ${processed}/${exercises.length}`);
    console.log(`                    纯引擎              混合分析器           提升`);
    console.log(`  精确匹配:     ${engineExact}/${processed} (${(engineExact/processed*100).toFixed(1)}%)       ${hybridExact}/${processed} (${(hybridExact/processed*100).toFixed(1)}%)       ${hybridExact-engineExact>0?'+':''}${hybridExact-engineExact}`);
    console.log(`  接近匹配:     ${engineClose}/${processed} (${(engineClose/processed*100).toFixed(1)}%)       ${hybridClose}/${processed} (${(hybridClose/processed*100).toFixed(1)}%)       ${hybridClose-engineClose>0?'+':''}${hybridClose-engineClose}`);
    console.log(`  LLM 调用:     —                   ${llmCalls}`);

    if (improvements.length > 0) {
      console.log(`\n✅ 改善 (${improvements.length}题):`);
      improvements.forEach(s => console.log(s));
    }
    if (regressions.length > 0) {
      console.log(`\n❌ 回退 (${regressions.length}题):`);
      regressions.forEach(s => console.log(s));
    }
    console.log();
  }
}

main().catch(console.error);
