/**
 * POST /api/user/share-reward — 每日分享奖励（链接或图片，每天只算一次）
 * 需要 Authorization: Bearer <access_token>
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

async function getUserIdFromToken(token: string): Promise<string | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  const client = createClient(url, key);
  const { data } = await client.auth.getUser(token);
  return data.user?.id ?? null;
}

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!auth) return NextResponse.json({ error: '未登录' }, { status: 401 });

  const userId = await getUserIdFromToken(auth);
  if (!userId) return NextResponse.json({ error: '无效的登录状态' }, { status: 401 });

  const service = getServiceClient();
  if (!service) return NextResponse.json({ error: '服务不可用' }, { status: 500 });

  const today = new Date().toISOString().slice(0, 10);
  const SHARE_POINTS = 100;

  // Check if already got share reward today
  const { data: existing } = await service
    .from('points_log')
    .select('id')
    .eq('user_id', userId)
    .eq('type', 'share')
    .gte('created_at', `${today}T00:00:00Z`)
    .lte('created_at', `${today}T23:59:59Z`)
    .limit(1)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ success: true, alreadyRewarded: true });
  }

  // Add points
  const { data: currentPts } = await service
    .from('user_points')
    .select('balance')
    .eq('user_id', userId)
    .maybeSingle();

  const newBalance = (currentPts?.balance ?? 0) + SHARE_POINTS;

  await service
    .from('user_points')
    .upsert({ user_id: userId, balance: newBalance, updated_at: new Date().toISOString() });

  await service
    .from('points_log')
    .insert({
      user_id: userId,
      amount: SHARE_POINTS,
      type: 'share',
      description: `每日分享奖励 ${today}`,
    });

  return NextResponse.json({ success: true, alreadyRewarded: false, points: newBalance });
}
