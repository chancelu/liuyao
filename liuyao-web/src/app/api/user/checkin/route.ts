/**
 * POST /api/user/checkin — 每日自动签到
 * 需要 Authorization: Bearer <access_token>
 * 返回 { success, alreadyCheckedIn, points }
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

  // Check if already checked in today
  const { data: existing } = await service
    .from('checkin_records')
    .select('id')
    .eq('user_id', userId)
    .eq('checkin_date', today)
    .maybeSingle();

  if (existing) {
    const { data: pts } = await service
      .from('user_points')
      .select('balance')
      .eq('user_id', userId)
      .maybeSingle();
    return NextResponse.json({ success: true, alreadyCheckedIn: true, points: pts?.balance ?? 0 });
  }

  // Insert checkin record
  const { error: checkinErr } = await service
    .from('checkin_records')
    .insert({ user_id: userId, checkin_date: today });

  if (checkinErr) {
    // Unique constraint violation = already checked in (race condition)
    if (checkinErr.code === '23505') {
      const { data: pts } = await service
        .from('user_points')
        .select('balance')
        .eq('user_id', userId)
        .maybeSingle();
      return NextResponse.json({ success: true, alreadyCheckedIn: true, points: pts?.balance ?? 0 });
    }
    return NextResponse.json({ error: '签到失败' }, { status: 500 });
  }

  // Add 100 points
  const CHECKIN_POINTS = 100;

  // Upsert points balance
  const { data: currentPts } = await service
    .from('user_points')
    .select('balance')
    .eq('user_id', userId)
    .maybeSingle();

  const newBalance = (currentPts?.balance ?? 0) + CHECKIN_POINTS;

  await service
    .from('user_points')
    .upsert({ user_id: userId, balance: newBalance, updated_at: new Date().toISOString() });

  // Log
  await service
    .from('points_log')
    .insert({
      user_id: userId,
      amount: CHECKIN_POINTS,
      type: 'checkin',
      description: `每日签到 ${today}`,
    });

  return NextResponse.json({ success: true, alreadyCheckedIn: false, points: newBalance });
}
