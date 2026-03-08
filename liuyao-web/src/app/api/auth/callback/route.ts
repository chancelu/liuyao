import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAnonServerClient } from '@/lib/supabase/server';

/**
 * Magic Link 回调处理。
 *
 * Supabase 将用户点击邮件链接后重定向到此端点，
 * 附带 code（PKCE）或 token_hash + type（OTP）查询参数。
 * 服务端完成 code exchange 后，将用户重定向到首页（或原始页面）。
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type') as 'magiclink' | 'recovery' | null;
  const next = searchParams.get('next') ?? '/';

  const supabase = getSupabaseAnonServerClient();

  if (!supabase) {
    // Supabase 未配置：直接跳回首页，不崩溃
    return NextResponse.redirect(`${origin}${next}`);
  }

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error('[auth/callback] exchangeCodeForSession error:', error.message);
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent('链接已失效，请重新登录。')}`);
    }
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    if (error) {
      console.error('[auth/callback] verifyOtp error:', error.message);
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent('链接已失效，请重新登录。')}`);
    }
  }

  return NextResponse.redirect(`${origin}${next}`);
}
