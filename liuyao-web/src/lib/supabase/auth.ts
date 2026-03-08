/**
 * 邮箱认证脚手架
 *
 * 提供封装好的邮箱注册 / 登录 / 登出辅助函数。
 * 所有函数均在客户端（浏览器）中调用。
 *
 * 若 Supabase 未配置，函数将抛出带有中文提示的错误，
 * 以便 UI 层可以友好显示"暂未开放注册"等提示。
 */

import { getSupabaseBrowserClient } from './client';

export interface AuthResult {
  success: boolean;
  /** 中文错误信息（失败时有值） */
  error: string | null;
}

/**
 * 邮箱注册
 */
export async function signUpWithEmail(email: string, password: string): Promise<AuthResult> {
  let client;
  try {
    client = getSupabaseBrowserClient();
  } catch {
    return { success: false, error: '账号系统暂未开放，请稍后再试。' };
  }

  const { error } = await client.auth.signUp({ email, password });
  if (error) {
    return { success: false, error: translateAuthError(error.message) };
  }
  return { success: true, error: null };
}

/**
 * 邮箱登录
 */
export async function signInWithEmail(email: string, password: string): Promise<AuthResult> {
  let client;
  try {
    client = getSupabaseBrowserClient();
  } catch {
    return { success: false, error: '账号系统暂未开放，请稍后再试。' };
  }

  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) {
    return { success: false, error: translateAuthError(error.message) };
  }
  return { success: true, error: null };
}

/**
 * 登出
 */
export async function signOut(): Promise<AuthResult> {
  let client;
  try {
    client = getSupabaseBrowserClient();
  } catch {
    return { success: false, error: '未登录。' };
  }

  const { error } = await client.auth.signOut();
  if (error) {
    return { success: false, error: translateAuthError(error.message) };
  }
  return { success: true, error: null };
}

/**
 * 将常见 Supabase Auth 错误翻译为中文提示
 */
function translateAuthError(message: string): string {
  if (/invalid login credentials/i.test(message)) return '邮箱或密码错误，请重试。';
  if (/email not confirmed/i.test(message)) return '请先前往邮箱完成验证后再登录。';
  if (/user already registered/i.test(message)) return '该邮箱已注册，请直接登录。';
  if (/password.*characters/i.test(message)) return '密码至少需要 6 个字符。';
  if (/rate limit/i.test(message)) return '操作过于频繁，请稍后再试。';
  return `认证失败：${message}`;
}
