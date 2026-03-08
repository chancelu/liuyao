import { NextResponse } from 'next/server';
import { getRepository } from '@/lib/repository';
import type { ApiResponse, CreateDivinationRequest, CreateDivinationResponse } from '@/lib/api/types';
import type { DivinationDraft } from '@/lib/types';

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<CreateDivinationRequest>;

  if (!body.id || !body.question || !body.category || !body.timeScope || !body.locale) {
    return NextResponse.json<ApiResponse<CreateDivinationResponse>>(
      { success: false, data: null, error: '请求参数不完整。' },
      { status: 400 },
    );
  }

  const draft: DivinationDraft = {
    id: body.id,
    question: body.question.trim(),
    category: body.category,
    timeScope: body.timeScope,
    background: body.background?.trim() ?? '',
    locale: body.locale,
    createdAt: new Date().toISOString(),
  };

  const repo = await getRepository();
  await repo.saveDraft(draft);

  return NextResponse.json<ApiResponse<CreateDivinationResponse>>({
    success: true,
    data: {
      draft,
      guestSessionId: 'guest-api',
      freeTrialUsed: false,
    },
    error: null,
  });
}
