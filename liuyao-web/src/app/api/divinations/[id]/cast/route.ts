import { NextResponse } from 'next/server';
import { buildMockResult } from '@/lib/mock-divination';
import { getRepository } from '@/lib/repository';
import type { ApiResponse, SubmitCastRequest, SubmitCastResponse } from '@/lib/api/types';
import type { CastRecord, DivinationDraft } from '@/lib/types';

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  const body = (await request.json()) as Partial<SubmitCastRequest & { draft?: DivinationDraft }>;
  if (!body.lines || body.lines.length !== 6) {
    return NextResponse.json<ApiResponse<SubmitCastResponse>>(
      { success: false, data: null, error: '请先完成六次摇卦。' },
      { status: 400 },
    );
  }

  let repo;
  try {
    repo = await getRepository();
  } catch (err) {
    console.error('[api/cast] getRepository failed:', err);
  }

  let draft: DivinationDraft | null = null;

  // Try to get draft from database
  if (repo) {
    try {
      const record = await repo.getById(id);
      if (record) {
        draft = record.draft;
      }
    } catch (err) {
      console.error('[api/cast] getById failed:', err);
    }
  }

  // Fallback: use draft from request body (client sends it from localStorage)
  if (!draft && body.draft) {
    draft = body.draft;
  }

  if (!draft) {
    return NextResponse.json<ApiResponse<SubmitCastResponse>>(
      { success: false, data: null, error: '当前问题不存在，请重新起卦。' },
      { status: 404 },
    );
  }

  const cast: CastRecord = {
    divinationId: id,
    lines: body.lines,
    updatedAt: new Date().toISOString(),
  };

  const result = buildMockResult({
    id,
    question: draft.question,
    category: draft.category,
    timeScope: draft.timeScope,
    background: draft.background,
    lines: body.lines,
  });

  // Try to persist to DB (best effort)
  if (repo) {
    try {
      await repo.saveCast(id, cast, result);
    } catch (err) {
      console.error('[api/cast] saveCast failed:', err);
    }
  }

  return NextResponse.json<ApiResponse<SubmitCastResponse>>({
    success: true,
    data: {
      draft,
      cast,
      result,
    },
    error: null,
  });
}
