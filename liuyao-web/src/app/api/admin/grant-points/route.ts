/**
 * POST /api/admin/grant-points — 管理员通过 UID 给用户发放积分
 * Body: { shortUid: string, amount: number, description?: string }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

async function getUserFromToken(token: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  const client = createClient(url, key);
  const { data } = await client.auth.getUser(token);
  return data.user ?? null;
}

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!auth) return NextResponse.json({ error: '未登录' }, { status: 401 });

  const user = await getUserFromToken(auth);
  if (!user) return NextResponse.json({ error: '无效的登录状态' }, { status: 401 });

  const service = getServiceClient();
  if (!service) return NextResponse.json({ error: '服务不可用' }, { status: 500 });

  // Check admin role
  const { data: profile } = await service
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: '无权限' }, { status: 403 });
  }

  const body = await req.json();
  const { shortUid, amount, description } = body as {
    shortUid?: string;
    amount?: number;
    description?: string;
  };

  if (!shortUid || typeof amount !== 'number' || amount <= 0) {
    return NextResponse.json({ error: '参数错误：需要 shortUid 和正整数 amount' }, { status: 400 });
  }

  // Find target user by short_uid
  const { data: targetProfile } = await service
    .from('user_profiles')
    .select('id, short_uid')
    .eq('short_uid', shortUid)
    .maybeSingle();

  if (!targetProfile) {
    return NextResponse.json({ error: `未找到 UID 为 ${shortUid} 的用户` }, { status: 404 });
  }

  const targetUserId = targetProfile.id;

  // Update balance
  const { data: currentPts } = await service
    .from('user_points')
    .select('balance')
    .eq('user_id', targetUserId)
    .maybeSingle();

  const newBalance = (currentPts?.balance ?? 0) + amount;

  await service
    .from('user_points')
    .upsert({ user_id: targetUserId, balance: newBalance, updated_at: new Date().toISOString() });

  // Log
  await service
    .from('points_log')
    .insert({
      user_id: targetUserId,
      amount,
      type: 'admin_grant',
      description: description || `管理员发放 ${amount} 积分`,
    });

  return NextResponse.json({
    success: true,
    targetUid: shortUid,
    amount,
    newBalance,
  });
}
