/**
 * 邮箱认证：支持 Magic Link 和密码登录。
 *
 * 所有函数在客户端（浏览器）调用。
 * 若 Supabase 未配置则返回友好中文错误，UI 层可直接展示。
 */

import { getSupabaseBrowserClient } from './client';

export interface AuthResult {
  success: boolean;
  /** 中文错误或提示信息 */
  message: string | null;
}

// ---------------------------------------------------------------------------
// Magic Link（推荐首选方式）
// ---------------------------------------------------------------------------

/**
 * 发送 Magic Link 到指定邮箱。
 * 用户点击邮件链接后由 /api/auth/callback 完成会话交换。
 */
export async function sendMagicLink(email: string): Promise<AuthResult> {
  let client;
  try {
    client = getSupabaseBrowserClient();
  } catch {
    return { success: false, message: '账号系统暂未开放，请稍后再试。' };
  }

  const redirectTo =
    typeof window !== 'undefined'
      ? `${window.location.origin}/api/auth/callback`
      : process.env.NEXT_PUBLIC_SITE_URL
        ? `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback`
        : undefined;

  const { error } = await client.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: redirectTo, shouldCreateUser: true },
  });

  if (error) return { success: false, message: translateAuthError(error.message) };
  return { success: true, message: '验证邮件已发送，请查收并点击链接登录。' };
}

// ---------------------------------------------------------------------------
// 密码注册 / 登录（备用）
// ---------------------------------------------------------------------------

export async function signUpWithEmail(email: string, password: string): Promise<AuthResult> {
  let client;
  try {
    client = getSupabaseBrowserClient();
  } catch {
    return { success: false, message: '账号系统暂未开放，请稍后再试。' };
  }

  const { error } = await client.auth.signUp({ email, password });
  if (error) return { success: false, message: translateAuthError(error.message) };
  return { success: true, message: '注册成功，请查收验证邮件。' };
}

export async function signInWithEmail(email: string, password: string): Promise<AuthResult> {
  let client;
  try {
    client = getSupabaseBrowserClient();
  } catch {
    return { success: false, message: '账号系统暂未开放，请稍后再试。' };
  }

  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) return { success: false, message: translateAuthError(error.message) };
  return { success: true, message: null };
}

// ---------------------------------------------------------------------------
// 当前会话
// ---------------------------------------------------------------------------

export async function getSession() {
  let client;
  try {
    client = getSupabaseBrowserClient();
  } catch {
    return null;
  }
  const { data } = await client.auth.getSession();
  return data.session;
}

export async function getUser() {
  let client;
  try {
    client = getSupabaseBrowserClient();
  } catch {
    return null;
  }
  const { data } = await client.auth.getUser();
  return data.user;
}

// ---------------------------------------------------------------------------
// 登出
// ---------------------------------------------------------------------------

export async function signOut(): Promise<AuthResult> {
  let client;
  try {
    client = getSupabaseBrowserClient();
  } catch {
    return { success: false, message: '未登录。' };
  }

  const { error } = await client.auth.signOut();
  if (error) return { success: false, message: translateAuthError(error.message) };
  return { success: true, message: null };
}

// ---------------------------------------------------------------------------
// 错误翻译
// ---------------------------------------------------------------------------

function translateAuthError(message: string): string {
  if (/invalid login credentials/i.test(message)) return '邮箱或密码错误，请重试。';
  if (/email not confirmed/i.test(message)) return '请先前往邮箱完成验证后再登录。';
  if (/user already registered/i.test(message)) return '该邮箱已注册，请直接登录。';
  if (/password.*characters/i.test(message)) return '密码至少需要 6 个字符。';
  if (/rate limit/i.test(message)) return '操作过于频繁，请稍后再试。';
  if (/over.*email.*limit/i.test(message)) return '今日邮件发送已达上限，请明天再试。';
  return `认证失败：${message}`;
}
