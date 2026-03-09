export type Category =
  | 'relationship'
  | 'career'
  | 'wealth'
  | 'health'
  | 'study'
  | 'lost'
  | 'other';

export type TimeScope = 'recent' | 'this_month' | 'this_year' | 'unspecified';

export type CastLine = 'old_yin' | 'young_yin' | 'young_yang' | 'old_yang';

export interface DivinationDraft {
  id: string;
  question: string;
  category: Category;
  timeScope: TimeScope;
  background: string;
  locale: string;
  createdAt: string;
}

export interface CastRecord {
  divinationId: string;
  lines: CastLine[];
  updatedAt: string;
}

export interface MockResult {
  id: string;
  question: string;
  category: Category;
  timeScope: TimeScope;
  background: string;
  primaryHexagram: string;
  changedHexagram: string;
  movingLines: number[];
  summary: string;
  plainAnalysis: string;
  professionalAnalysis: string;
  createdAt: string;
  /** 真实排盘数据（v1 引擎生成） */
  chart?: import('@/lib/liuyao/chart').ChartData;
}
