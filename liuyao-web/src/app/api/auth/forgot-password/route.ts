/**
 * POST /api/auth/forgot-password — 发送密码重置邮件
 * Body: { email: string }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return NextResponse.json({ error: '服务不可用' }, { status: 500 });

  const body = await req.json();
  const { email } = body as { email?: string };

  if (!email) return NextResponse.json({ error: '请输入邮箱' }, { status: 400 });

  const client = createClient(url, key);

  const redirectTo = `${req.nextUrl.origin}/login?reset=true`;

  const { error } = await client.auth.resetPasswordForEmail(email, { redirectTo });

  if (error) {
    if (/rate limit/i.test(error.message)) {
      return NextResponse.json({ error: '操作过于频繁，请稍后再试' }, { status: 429 });
    }
    return NextResponse.json({ error: '发送失败，请检查邮箱是否正确' }, { status: 400 });
  }

  return NextResponse.json({ success: true, message: '密码重置邮件已发送，请查收。' });
}
