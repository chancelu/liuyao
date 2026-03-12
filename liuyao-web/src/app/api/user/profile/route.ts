/**
 * GET /api/user/profile — 获取当前用户档案 + 积分
 * PUT /api/user/profile — 更新头像
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

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!auth) return NextResponse.json({ error: '未登录' }, { status: 401 });

  const user = await getUserFromToken(auth);
  if (!user) return NextResponse.json({ error: '无效的登录状态' }, { status: 401 });

  const service = getServiceClient();
  if (!service) return NextResponse.json({ error: '服务不可用' }, { status: 500 });

  // Ensure profile exists (for users created before migration)
  const { data: profile } = await service
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  let profileData = profile;
  if (!profileData) {
    // Auto-create profile
    const shortUid = String(Math.floor(Math.random() * 100000000)).padStart(8, '0');
    const { data: newProfile } = await service
      .from('user_profiles')
      .insert({ id: user.id, short_uid: shortUid, role: 'user' })
      .select()
      .single();
    profileData = newProfile;

    // Also ensure points row
    await service
      .from('user_points')
      .upsert({ user_id: user.id, balance: 0, updated_at: new Date().toISOString() });
  }

  const { data: points } = await service
    .from('user_points')
    .select('balance, updated_at')
    .eq('user_id', user.id)
    .maybeSingle();

  return NextResponse.json({
    id: user.id,
    email: user.email,
    shortUid: profileData?.short_uid,
    avatarUrl: profileData?.avatar_url,
    role: profileData?.role ?? 'user',
    points: points?.balance ?? 0,
    createdAt: profileData?.created_at,
  });
}

export async function PUT(req: NextRequest) {
  const auth = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!auth) return NextResponse.json({ error: '未登录' }, { status: 401 });

  const user = await getUserFromToken(auth);
  if (!user) return NextResponse.json({ error: '无效的登录状态' }, { status: 401 });

  const service = getServiceClient();
  if (!service) return NextResponse.json({ error: '服务不可用' }, { status: 500 });

  const body = await req.json();

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (typeof body.avatarUrl === 'string') updates.avatar_url = body.avatarUrl;

  const { error } = await service
    .from('user_profiles')
    .update(updates)
    .eq('id', user.id);

  if (error) return NextResponse.json({ error: '更新失败' }, { status: 500 });

  return NextResponse.json({ success: true });
}
