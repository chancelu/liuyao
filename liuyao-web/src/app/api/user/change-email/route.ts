/**
 * POST /api/user/change-email — 换绑邮箱
 * Body: { newEmail: string }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

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

  const body = await req.json();
  const { newEmail } = body as { newEmail?: string };

  if (!newEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
    return NextResponse.json({ error: '请输入有效的邮箱地址' }, { status: 400 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return NextResponse.json({ error: '服务不可用' }, { status: 500 });

  const service = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

  const { error } = await service.auth.admin.updateUserById(user.id, { email: newEmail });

  if (error) {
    if (/already registered/i.test(error.message)) {
      return NextResponse.json({ error: '该邮箱已被其他账号使用' }, { status: 400 });
    }
    return NextResponse.json({ error: `换绑失败：${error.message}` }, { status: 500 });
  }

  return NextResponse.json({ success: true, message: '邮箱已更新，请查收新邮箱的确认邮件。' });
}
