import { NextResponse } from 'next/server';
import { getRepository } from '@/lib/repository';
import type { ApiResponse, GetDivinationResponse } from '@/lib/api/types';

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const repo = await getRepository();
  const record = await repo.getById(id);

  if (!record) {
    return NextResponse.json<ApiResponse<GetDivinationResponse>>(
      { success: false, data: null, error: '未找到该卦例。' },
      { status: 404 },
    );
  }

  return NextResponse.json<ApiResponse<GetDivinationResponse>>({
    success: true,
    data: {
      draft: record.draft,
      cast: record.cast,
      result: record.result,
    },
    error: null,
  });
}
