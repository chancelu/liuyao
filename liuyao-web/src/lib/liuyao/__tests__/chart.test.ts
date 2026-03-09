/**
 * 六爻排盘引擎确定性测试
 *
 * 验证同一输入始终产出同一排盘结果。
 * 运行: npx tsx src/lib/liuyao/__tests__/chart.test.ts
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { buildChart } = require('../chart');

type CastLine = 'old_yin' | 'young_yin' | 'young_yang' | 'old_yang';

const FIXED_DATE = new Date('2026-03-09T10:00:00+08:00');

// 测试用例 1: 乾为天 → 全少阳，无动爻
const TEST1_LINES: CastLine[] = ['young_yang', 'young_yang', 'young_yang', 'young_yang', 'young_yang', 'young_yang'];

// 测试用例 2: 有动爻的情况
const TEST2_LINES: CastLine[] = ['old_yang', 'young_yin', 'young_yang', 'old_yin', 'young_yang', 'young_yin'];

function assertEqual(actual: unknown, expected: unknown, label: string) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) {
    console.error(`FAIL: ${label}`);
    console.error(`  expected: ${e}`);
    console.error(`  actual:   ${a}`);
    process.exit(1);
  }
  console.log(`PASS: ${label}`);
}

function testDeterminism() {
  console.log('\n=== Test: Determinism ===');
  const chart1 = buildChart(TEST1_LINES, FIXED_DATE);
  const chart2 = buildChart(TEST1_LINES, FIXED_DATE);

  // 移除 castTime 做比较（它应相同，因为我们传了固定 date）
  assertEqual(JSON.stringify(chart1), JSON.stringify(chart2), 'Same input → same output');
}

function testPureQian() {
  console.log('\n=== Test: 乾为天 (all young_yang) ===');
  const chart = buildChart(TEST1_LINES, FIXED_DATE);

  assertEqual(chart.primary.name, '乾为天', 'Primary hexagram name');
  assertEqual(chart.changed.name, '乾为天', 'Changed hexagram (no moving lines = same)');
  assertEqual(chart.primary.palace, '乾', 'Palace is 乾');
  assertEqual(chart.primary.palaceElement, '金', 'Palace element is 金');
  assertEqual(chart.movingLines.length, 0, 'No moving lines');
  assertEqual(chart.shiPosition, 6, 'Shi position = 6 (八纯卦)');
  assertEqual(chart.yingPosition, 3, 'Ying position = 3');

  // 纳支验证：乾内甲子寅辰，外壬午申戌
  const branches = chart.lines.map((l: { branch: string }) => l.branch);
  assertEqual(branches, ['子', '寅', '辰', '午', '申', '戌'], 'Najia branches for 乾');

  // 六亲验证：宫为金，子=水=子孙，寅=木=妻财，辰=土=父母，午=火=官鬼，申=金=兄弟，戌=土=父母
  const relatives = chart.lines.map((l: { relative: string }) => l.relative);
  assertEqual(relatives, ['子孙', '妻财', '父母', '官鬼', '兄弟', '父母'], 'Six relatives for 乾');
}

function testMovingLines() {
  console.log('\n=== Test: Moving lines ===');
  const chart = buildChart(TEST2_LINES, FIXED_DATE);

  // 初爻 old_yang(阳动), 四爻 old_yin(阴动)
  assertEqual(chart.movingLines, [1, 4], 'Moving lines at positions 1 and 4');

  // 本卦：初=阳, 二=阴, 三=阳, 四=阴, 五=阳, 上=阴
  // 下卦 bits: 1,0,1 → binary 101 = 离
  // 上卦 bits: 0,1,0 → binary 010 = 坎
  assertEqual(chart.primary.lower, '离', 'Lower trigram');
  assertEqual(chart.primary.upper, '坎', 'Upper trigram');
  // 坎/离 → 水火既济
  assertEqual(chart.primary.name, '水火既济', 'Primary hexagram');

  // 变卦：初=阴(变), 二=阴, 三=阳, 四=阳(变), 五=阳, 上=阴
  // 下卦 bits[0..2]: 0,0,1 → (1<<2)|(0<<1)|0 = 100 = 震
  // 上卦 bits[3..5]: 1,1,0 → (0<<2)|(1<<1)|1 = 011 = 巽
  assertEqual(chart.changed.lower, '震', 'Changed lower trigram');
  assertEqual(chart.changed.upper, '巽', 'Changed upper trigram');
  assertEqual(chart.changed.name, '风雷益', 'Changed hexagram');

  // 动爻标记
  assertEqual(chart.lines[0].moving, true, 'Line 1 is moving');
  assertEqual(chart.lines[1].moving, false, 'Line 2 is not moving');
  assertEqual(chart.lines[3].moving, true, 'Line 4 is moving');

  // 世应：水火既济在坎宫，index 3(三世卦), 世3应6
  assertEqual(chart.shiPosition, 3, 'Shi position for 水火既济');
  assertEqual(chart.yingPosition, 6, 'Ying position for 水火既济');
}

function testSixSpirits() {
  console.log('\n=== Test: Six spirits ===');
  const chart = buildChart(TEST1_LINES, FIXED_DATE);

  // 固定日期 2026-03-09 日干需要验证
  console.log(`  Day stem: ${chart.dayStem}, Day branch: ${chart.dayBranch}`);
  console.log(`  Spirits: ${chart.lines.map((l: { spirit: string }) => l.spirit).join(', ')}`);

  // 六神始终为 6 个
  assertEqual(chart.lines.length, 6, 'Always 6 lines');
  const spiritSet = new Set(chart.lines.map((l: { spirit: string }) => l.spirit));
  assertEqual(spiritSet.size, 6, 'All 6 spirits present');
}

function testXunkong() {
  console.log('\n=== Test: Xunkong ===');
  const chart = buildChart(TEST1_LINES, FIXED_DATE);
  console.log(`  Xunkong: ${chart.xunkong[0]}, ${chart.xunkong[1]}`);
  assertEqual(chart.xunkong.length, 2, 'Xunkong has 2 branches');
}

// Run all tests
console.log('六爻排盘引擎测试');
console.log('==================');

testDeterminism();
testPureQian();
testMovingLines();
testSixSpirits();
testXunkong();

console.log('\n==================');
console.log('All tests passed!');
