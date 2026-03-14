import { NextRequest, NextResponse } from 'next/server';
import { getRepository } from '@/lib/repository';
import { getSupabaseAnonServerClient } from '@/lib/supabase/server';
import type {
  ApiResponse,
  CreateDivinationRequest,
  CreateDivinationResponse,
  DivinationListItem,
  ListDivinationsResponse,
} from '@/lib/api/types';
import type { DivinationDraft } from '@/lib/types';

export async function GET(request: NextRequest) {
  // Authenticate via Bearer token (Supabase access token) sent by client
  const authHeader = request.headers.get('authorization');
  const accessToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!accessToken) {
    return NextResponse.json<ApiResponse<ListDivinationsResponse>>(
      { success: false, data: null, error: '请先登录后查看历史记录。' },
      { status: 401 },
    );
  }

  // Verify token and get user
  const supabase = getSupabaseAnonServerClient();
  if (!supabase) {
    return NextResponse.json<ApiResponse<ListDivinationsResponse>>(
      { success: false, data: null, error: '账号系统暂未开放。' },
      { status: 503 },
    );
  }

  const { data: { user }, error: userError } = await supabase.auth.getUser(accessToken);
  if (userError || !user) {
    return NextResponse.json<ApiResponse<ListDivinationsResponse>>(
      { success: false, data: null, error: '登录已过期，请重新登录。' },
      { status: 401 },
    );
  }

  const repo = await getRepository();
  const records = await repo.listByUser(user.id);

  const items: DivinationListItem[] = records.map((r) => ({
    id: r.draft.id,
    question: r.draft.question,
    category: r.draft.category,
    createdAt: r.draft.createdAt,
    summary: r.result?.summary ?? null,
    primaryHexagram: r.result?.primaryHexagram ?? null,
    changedHexagram: r.result?.changedHexagram ?? null,
  }));

  return NextResponse.json<ApiResponse<ListDivinationsResponse>>({
    success: true,
    data: { items },
    error: null,
  });
}

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
    gender: body.gender,
    background: body.background?.trim() ?? '',
    locale: body.locale,
    createdAt: new Date().toISOString(),
  };

  let repo;
  try {
    repo = await getRepository();
  } catch (err) {
    console.error('[api/divinations] getRepository failed:', err);
    return NextResponse.json<ApiResponse<CreateDivinationResponse>>(
      { success: false, data: null, error: '数据库连接失败，请稍后重试。' },
      { status: 500 },
    );
  }

  try {
    await repo.saveDraft(draft);
  } catch (err) {
    console.error('[api/divinations] saveDraft failed:', err);
    return NextResponse.json<ApiResponse<CreateDivinationResponse>>(
      { success: false, data: null, error: '保存失败，请稍后重试。' },
      { status: 500 },
    );
  }

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
