import { NextRequest, NextResponse } from 'next/server';
import { getRepository } from '@/lib/repository';
import { getSupabaseAnonServerClient } from '@/lib/supabase/server';
import type { ApiResponse, SaveDivinationResponse } from '@/lib/api/types';

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  // Authenticate via Bearer token
  const authHeader = request.headers.get('authorization');
  const accessToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!accessToken) {
    return NextResponse.json<ApiResponse<SaveDivinationResponse>>(
      { success: false, data: null, error: '请先登录后再保存。' },
      { status: 401 },
    );
  }

  const supabase = getSupabaseAnonServerClient();
  if (!supabase) {
    return NextResponse.json<ApiResponse<SaveDivinationResponse>>(
      { success: false, data: null, error: '账号系统暂未开放。' },
      { status: 503 },
    );
  }

  const { data: { user }, error: userError } = await supabase.auth.getUser(accessToken);
  if (userError || !user) {
    return NextResponse.json<ApiResponse<SaveDivinationResponse>>(
      { success: false, data: null, error: '登录已过期，请重新登录。' },
      { status: 401 },
    );
  }

  const repo = await getRepository();
  const record = await repo.getById(id);

  if (!record) {
    return NextResponse.json<ApiResponse<SaveDivinationResponse>>(
      { success: false, data: null, error: '未找到该卦例。' },
      { status: 404 },
    );
  }

  if (!record.result) {
    return NextResponse.json<ApiResponse<SaveDivinationResponse>>(
      { success: false, data: null, error: '卦例尚未完成，无法保存。' },
      { status: 422 },
    );
  }

  await repo.saveForUser(id, user.id).catch((err: Error) => {
    console.error('[api/save] saveForUser failed:', err.message);
  });

  return NextResponse.json<ApiResponse<SaveDivinationResponse>>({
    success: true,
    data: { saved: true },
    error: null,
  });
}
