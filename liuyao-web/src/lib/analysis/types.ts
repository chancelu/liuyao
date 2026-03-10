/**
 * AI 分析链路 — Input / Output Schema
 *
 * Input:  ChartData + 用户问题上下文
 * Output: 结构化分析结果（结论 / 白话 / 专业）
 */

import type { ChartData } from '@/lib/liuyao/chart';
import type { Category, TimeScope } from '@/lib/types';

// ---------------------------------------------------------------------------
// Input
// ---------------------------------------------------------------------------

export interface AnalysisInput {
  /** 排盘数据（确定性引擎生成） */
  chart: ChartData;
  /** 用户提问 */
  question: string;
  /** 问题分类 */
  category: Category;
  /** 时间范围 */
  timeScope: TimeScope;
  /** 背景补充（可选） */
  background: string;
}

// ---------------------------------------------------------------------------
// Output
// ---------------------------------------------------------------------------

export interface AnalysisOutput {
  /** 一句话结论（≤ 50 字） */
  summary: string;
  /** 白话分析（面向小白用户，300-600 字） */
  plainAnalysis: string;
  /** 专业分析（面向爱好者，含用神、旺衰、动变、世应等，200-500 字） */
  professionalAnalysis: string;
}

// ---------------------------------------------------------------------------
// API
// ---------------------------------------------------------------------------

export interface AnalysisRequest {
  /** divination ID */
  divinationId: string;
}

export interface AnalysisResponse {
  analysis: AnalysisOutput;
  /** 是否为 AI 真实分析（false = fallback mock） */
  isAI: boolean;
}
