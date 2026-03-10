import { NextResponse } from 'next/server';
import { analyzeChart } from '@/lib/analysis';
import type { AnalysisInput, AnalysisResponse } from '@/lib/analysis';
import { getRepository } from '@/lib/repository';
import type { ApiResponse } from '@/lib/api/types';

export async function POST(request: Request) {
  let body: { divinationId?: string };
  try {
    body = (await request.json()) as { divinationId?: string };
  } catch {
    return NextResponse.json<ApiResponse<AnalysisResponse>>(
      { success: false, data: null, error: '请求格式错误。' },
      { status: 400 },
    );
  }

  const { divinationId } = body;
  if (!divinationId) {
    return NextResponse.json<ApiResponse<AnalysisResponse>>(
      { success: false, data: null, error: '缺少 divinationId。' },
      { status: 400 },
    );
  }

  const repo = await getRepository();
  const record = await repo.getById(divinationId);

  if (!record) {
    return NextResponse.json<ApiResponse<AnalysisResponse>>(
      { success: false, data: null, error: '卦例不存在。' },
      { status: 404 },
    );
  }

  if (!record.cast) {
    return NextResponse.json<ApiResponse<AnalysisResponse>>(
      { success: false, data: null, error: '尚未完成摇卦。' },
      { status: 400 },
    );
  }

  if (!record.result?.chart) {
    return NextResponse.json<ApiResponse<AnalysisResponse>>(
      { success: false, data: null, error: '排盘数据不存在。' },
      { status: 400 },
    );
  }

  const input: AnalysisInput = {
    chart: record.result.chart,
    question: record.draft.question,
    category: record.draft.category,
    timeScope: record.draft.timeScope,
    background: record.draft.background,
  };

  try {
    const { analysis, isAI } = await analyzeChart(input);

    // Persist analysis back to the result
    const updatedResult = {
      ...record.result,
      summary: analysis.summary,
      plainAnalysis: analysis.plainAnalysis,
      professionalAnalysis: analysis.professionalAnalysis,
    };

    await repo.saveCast(divinationId, record.cast, updatedResult);

    return NextResponse.json<ApiResponse<AnalysisResponse>>({
      success: true,
      data: { analysis, isAI },
      error: null,
    });
  } catch (err) {
    console.error('[api/analysis] Unexpected error:', err);
    return NextResponse.json<ApiResponse<AnalysisResponse>>(
      { success: false, data: null, error: '分析服务暂时不可用，请稍后重试。' },
      { status: 500 },
    );
  }
}
