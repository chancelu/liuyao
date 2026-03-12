/**
 * GET /api/user/points-log — 获取当前用户积分流水
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

async function getUserIdFromToken(token: string): Promise<string | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  const client = createClient(url, key);
  const { data } = await client.auth.getUser(token);
  return data.user?.id ?? null;
}

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!auth) return NextResponse.json({ error: '未登录' }, { status: 401 });

  const userId = await getUserIdFromToken(auth);
  if (!userId) return NextResponse.json({ error: '无效的登录状态' }, { status: 401 });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return NextResponse.json({ error: '服务不可用' }, { status: 500 });

  const service = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

  const { data, error } = await service
    .from('points_log')
    .select('id, amount, type, description, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) return NextResponse.json({ error: '查询失败' }, { status: 500 });

  return NextResponse.json(
    (data || []).map((r: Record<string, unknown>) => ({
      id: r.id,
      amount: r.amount,
      type: r.type,
      description: r.description,
      createdAt: r.created_at,
    }))
  );
}
