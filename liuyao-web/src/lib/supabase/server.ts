import { createClient } from '@supabase/supabase-js';

/**
 * 服务端 Supabase 客户端（使用 service role key，仅在服务端使用）。
 * 若环境变量未配置则返回 null，调用方需自行处理。
 */
export function getSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) return null;

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
