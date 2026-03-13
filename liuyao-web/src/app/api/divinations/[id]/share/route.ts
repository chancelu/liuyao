import { NextRequest, NextResponse } from 'next/server';
import { getRepository } from '@/lib/repository';
import { getSupabaseAnonServerClient } from '@/lib/supabase/server';
import type { ApiResponse, ShareDivinationResponse } from '@/lib/api/types';

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  // Authenticate via Bearer token
  const authHeader = request.headers.get('authorization');
  const accessToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  const supabase = getSupabaseAnonServerClient();

  // If Supabase is configured, require auth. If not (local dev / mock mode), allow without auth.
  if (supabase) {
    if (!accessToken) {
      return NextResponse.json<ApiResponse<ShareDivinationResponse>>(
        { success: false, data: null, error: '请先登录后再分享。' },
        { status: 401 },
      );
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(accessToken);
    if (userError || !user) {
      return NextResponse.json<ApiResponse<ShareDivinationResponse>>(
        { success: false, data: null, error: '登录已过期，请重新登录。' },
        { status: 401 },
      );
    }
  }

  const repo = await getRepository();
  const record = await repo.getById(id);

  if (!record) {
    return NextResponse.json<ApiResponse<ShareDivinationResponse>>(
      { success: false, data: null, error: '未找到该卦例。' },
      { status: 404 },
    );
  }

  if (!record.result) {
    return NextResponse.json<ApiResponse<ShareDivinationResponse>>(
      { success: false, data: null, error: '卦例尚未完成，无法分享。' },
      { status: 422 },
    );
  }

  await repo.markPublic(id).catch((err: Error) => {
    console.error('[api/share] markPublic failed:', err.message);
  });

  const origin = request.headers.get('origin') ?? '';
  const shareUrl = `${origin}/share/${id}`;

  return NextResponse.json<ApiResponse<ShareDivinationResponse>>({
    success: true,
    data: { shareUrl },
    error: null,
  });
}
