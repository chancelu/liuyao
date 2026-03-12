/**
 * User profile & points service — browser-side helpers.
 */

import { getSupabaseBrowserClient } from '@/lib/supabase/client';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UserProfile {
  id: string;
  shortUid: string;
  avatarUrl: string | null;
  role: string;
  email: string | null;
  createdAt: string;
}

export interface PointsBalance {
  balance: number;
  updatedAt: string;
}

export interface PointsLogEntry {
  id: string;
  amount: number;
  type: string;
  description: string | null;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Profile
// ---------------------------------------------------------------------------

export async function getMyProfile(): Promise<UserProfile | null> {
  const client = getSupabaseBrowserClient();
  const { data: { user } } = await client.auth.getUser();
  if (!user) return null;

  const { data, error } = await client
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (error || !data) return null;

  const row = data as Record<string, unknown>;
  return {
    id: row.id as string,
    shortUid: row.short_uid as string,
    avatarUrl: (row.avatar_url as string) ?? null,
    role: row.role as string,
    email: user.email ?? null,
    createdAt: row.created_at as string,
  };
}

export async function updateAvatar(avatarUrl: string): Promise<boolean> {
  const client = getSupabaseBrowserClient();
  const { data: { user } } = await client.auth.getUser();
  if (!user) return false;

  const { error } = await client
    .from('user_profiles')
    .update({ avatar_url: avatarUrl, updated_at: new Date().toISOString() } as never)
    .eq('id', user.id);

  return !error;
}

// ---------------------------------------------------------------------------
// Points
// ---------------------------------------------------------------------------

export async function getMyPoints(): Promise<PointsBalance | null> {
  const client = getSupabaseBrowserClient();
  const { data: { user } } = await client.auth.getUser();
  if (!user) return null;

  const { data, error } = await client
    .from('user_points')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error || !data) return null;

  const row = data as Record<string, unknown>;
  return {
    balance: row.balance as number,
    updatedAt: row.updated_at as string,
  };
}

export async function getMyPointsLog(limit = 20): Promise<PointsLogEntry[]> {
  const client = getSupabaseBrowserClient();
  const { data: { user } } = await client.auth.getUser();
  if (!user) return [];

  const { data, error } = await client
    .from('points_log')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error || !data) return [];

  return data.map((row: Record<string, unknown>) => ({
    id: row.id as string,
    amount: row.amount as number,
    type: row.type as string,
    description: row.description as string | null,
    createdAt: row.created_at as string,
  }));
}
