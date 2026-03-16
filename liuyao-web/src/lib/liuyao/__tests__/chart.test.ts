/**
 * 六爻排盘引擎确定性测试
 *
 * 验证同一输入始终产出同一排盘结果。
 */
import { describe, it, expect } from 'vitest';
import { buildChart } from '../chart';

type CastLine = 'old_yin' | 'young_yin' | 'young_yang' | 'old_yang';

const FIXED_DATE = new Date('2026-03-09T10:00:00+08:00');

// 测试用例 1: 乾为天 → 全少阳，无动爻
const TEST1_LINES: CastLine[] = ['young_yang', 'young_yang', 'young_yang', 'young_yang', 'young_yang', 'young_yang'];

// 测试用例 2: 有动爻的情况
const TEST2_LINES: CastLine[] = ['old_yang', 'young_yin', 'young_yang', 'old_yin', 'young_yang', 'young_yin'];

describe('Determinism', () => {
  it('should produce identical results for the same input', () => {
    const chart1 = buildChart(TEST1_LINES, FIXED_DATE);
    const chart2 = buildChart(TEST1_LINES, FIXED_DATE);
    expect(JSON.stringify(chart1)).toBe(JSON.stringify(chart2));
  });
});

describe('Pure Qian (乾为天)', () => {
  const chart = buildChart(TEST1_LINES, FIXED_DATE);

  it('should have correct hexagram names', () => {
    expect(chart.primary.name).toBe('乾为天');
    expect(chart.changed.name).toBe('乾为天');
  });

  it('should have correct palace', () => {
    expect(chart.primary.palace).toBe('乾');
    expect(chart.primary.palaceElement).toBe('金');
  });

  it('should have no moving lines', () => {
    expect(chart.movingLines).toEqual([]);
  });

  it('should have shi=6 ying=3 (八纯卦)', () => {
    expect(chart.shiPosition).toBe(6);
    expect(chart.yingPosition).toBe(3);
  });

  it('should have correct najia branches', () => {
    const branches = chart.lines.map((l: { branch: string }) => l.branch);
    expect(branches).toEqual(['子', '寅', '辰', '午', '申', '戌']);
  });

  it('should have correct six relatives', () => {
    const relatives = chart.lines.map((l: { relative: string }) => l.relative);
    expect(relatives).toEqual(['子孙', '妻财', '父母', '官鬼', '兄弟', '父母']);
  });
});

describe('Moving lines (水火既济)', () => {
  const chart = buildChart(TEST2_LINES, FIXED_DATE);

  it('should detect moving lines at positions 1 and 4', () => {
    expect(chart.movingLines).toEqual([1, 4]);
  });

  it('should have correct primary trigrams', () => {
    expect(chart.primary.lower).toBe('离');
    expect(chart.primary.upper).toBe('坎');
    expect(chart.primary.name).toBe('水火既济');
  });

  it('should have correct changed hexagram', () => {
    // 初爻阳→阴, 四爻阴→阳
    // 实际引擎输出: 泽山咸 (下艮上兑)
    expect(chart.changed.lower).toBe('艮');
    expect(chart.changed.upper).toBe('兑');
    expect(chart.changed.name).toBe('泽山咸');
  });

  it('should mark moving lines correctly', () => {
    expect(chart.lines[0].moving).toBe(true);
    expect(chart.lines[1].moving).toBe(false);
    expect(chart.lines[3].moving).toBe(true);
  });

  it('should have correct shi/ying positions', () => {
    expect(chart.shiPosition).toBe(3);
    expect(chart.yingPosition).toBe(6);
  });
});

describe('Six spirits', () => {
  const chart = buildChart(TEST1_LINES, FIXED_DATE);

  it('should always have 6 lines', () => {
    expect(chart.lines.length).toBe(6);
  });

  it('should have all 6 unique spirits', () => {
    const spiritSet = new Set(chart.lines.map((l: { spirit: string }) => l.spirit));
    expect(spiritSet.size).toBe(6);
  });
});

describe('Xunkong', () => {
  const chart = buildChart(TEST1_LINES, FIXED_DATE);

  it('should have 2 xunkong branches', () => {
    expect(chart.xunkong.length).toBe(2);
  });
});
