import { NextResponse } from 'next/server';
import { buildMockResult } from '@/lib/mock-divination';
import { getRepository } from '@/lib/repository';
import type { ApiResponse, SubmitCastRequest, SubmitCastResponse } from '@/lib/api/types';
import type { CastRecord } from '@/lib/types';

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const repo = await getRepository();
  const record = await repo.getById(id);

  if (!record) {
    return NextResponse.json<ApiResponse<SubmitCastResponse>>(
      { success: false, data: null, error: '当前问题不存在，请重新起卦。' },
      { status: 404 },
    );
  }

  const body = (await request.json()) as Partial<SubmitCastRequest>;
  if (!body.lines || body.lines.length !== 6) {
    return NextResponse.json<ApiResponse<SubmitCastResponse>>(
      { success: false, data: null, error: '请先完成六次摇卦。' },
      { status: 400 },
    );
  }

  const cast: CastRecord = {
    divinationId: id,
    lines: body.lines,
    updatedAt: new Date().toISOString(),
  };

  const result = buildMockResult({
    id,
    question: record.draft.question,
    category: record.draft.category,
    timeScope: record.draft.timeScope,
    background: record.draft.background,
    lines: body.lines,
  });

  await repo.saveCast(id, cast, result);

  return NextResponse.json<ApiResponse<SubmitCastResponse>>({
    success: true,
    data: {
      draft: record.draft,
      cast,
      result,
    },
    error: null,
  });
}
