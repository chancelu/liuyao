/**
 * Email authentication: supports OTP and password login.
 *
 * All functions are called on the client (browser).
 * If Supabase is not configured, returns a friendly error message via i18n.
 */

import { getSupabaseBrowserClient } from './client';
import { getCurrentMessages } from '@/lib/i18n';

export interface AuthResult {
  success: boolean;
  message: string | null;
}

// ---------------------------------------------------------------------------
// OTP
// ---------------------------------------------------------------------------

export async function sendOtpCode(email: string): Promise<AuthResult> {
  const m = getCurrentMessages();
  let client;
  try {
    client = getSupabaseBrowserClient();
  } catch {
    return { success: false, message: m.auth.unavailable };
  }

  const { error } = await client.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: false },
  });

  if (error) return { success: false, message: translateAuthError(error.message) };
  return { success: true, message: m.auth.otpSent };
}

export async function verifyOtpCode(email: string, token: string): Promise<AuthResult> {
  const m = getCurrentMessages();
  let client;
  try {
    client = getSupabaseBrowserClient();
  } catch {
    return { success: false, message: m.auth.unavailable };
  }

  const { error } = await client.auth.verifyOtp({
    email,
    token,
    type: 'email',
  });

  if (error) return { success: false, message: translateAuthError(error.message) };
  return { success: true, message: null };
}

// ---------------------------------------------------------------------------
// Magic Link
// ---------------------------------------------------------------------------

export async function sendMagicLink(email: string, next?: string): Promise<AuthResult> {
  const m = getCurrentMessages();
  let client;
  try {
    client = getSupabaseBrowserClient();
  } catch {
    return { success: false, message: m.auth.unavailable };
  }

  const redirectBase =
    typeof window !== 'undefined'
      ? `${window.location.origin}/api/auth/callback`
      : process.env.NEXT_PUBLIC_SITE_URL
        ? `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback`
        : undefined;

  const redirectTo = redirectBase
    ? next
      ? `${redirectBase}?next=${encodeURIComponent(next)}`
      : redirectBase
    : undefined;

  const { error } = await client.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: redirectTo, shouldCreateUser: true },
  });

  if (error) return { success: false, message: translateAuthError(error.message) };
  return { success: true, message: m.auth.magicLinkSent };
}

// ---------------------------------------------------------------------------
// Password register / login
// ---------------------------------------------------------------------------

export async function signUpWithEmail(email: string): Promise<AuthResult> {
  const m = getCurrentMessages();
  let client;
  try {
    client = getSupabaseBrowserClient();
  } catch {
    return { success: false, message: m.auth.unavailable };
  }

  // Generate a random password the user never needs to know —
  // login is always via OTP, but Supabase signUp requires a password.
  const randomPassword = crypto.randomUUID() + crypto.randomUUID();

  const redirectBase =
    typeof window !== 'undefined'
      ? `${window.location.origin}/api/auth/callback`
      : process.env.NEXT_PUBLIC_SITE_URL
        ? `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback`
        : undefined;

  const { error } = await client.auth.signUp({
    email,
    password: randomPassword,
    options: {
      emailRedirectTo: redirectBase,
    },
  });
  if (error) return { success: false, message: translateAuthError(error.message) };
  return { success: true, message: m.auth.registerSuccess };
}

export async function signInWithEmail(email: string, password: string): Promise<AuthResult> {
  const m = getCurrentMessages();
  let client;
  try {
    client = getSupabaseBrowserClient();
  } catch {
    return { success: false, message: m.auth.unavailable };
  }

  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) return { success: false, message: translateAuthError(error.message) };
  return { success: true, message: null };
}

// ---------------------------------------------------------------------------
// Session
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
// Sign out
// ---------------------------------------------------------------------------

export async function signOut(): Promise<AuthResult> {
  const m = getCurrentMessages();
  let client;
  try {
    client = getSupabaseBrowserClient();
  } catch {
    return { success: false, message: m.auth.notLoggedIn };
  }

  const { error } = await client.auth.signOut();
  if (error) return { success: false, message: translateAuthError(error.message) };
  return { success: true, message: null };
}

// ---------------------------------------------------------------------------
// Error translation
// ---------------------------------------------------------------------------

function translateAuthError(message: string): string {
  const m = getCurrentMessages();
  if (/invalid login credentials/i.test(message)) return m.auth.invalidCredentials;
  if (/email not confirmed/i.test(message)) return m.auth.emailNotConfirmed;
  if (/user already registered/i.test(message)) return m.auth.alreadyRegistered;
  if (/password.*characters/i.test(message)) return m.auth.passwordTooShort;
  if (/rate limit/i.test(message)) return m.auth.rateLimit;
  if (/over.*email.*limit/i.test(message)) return m.auth.emailLimit;
  return `${m.auth.authFailed}${message}`;
}
