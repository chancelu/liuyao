function getRequiredEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  getSupabaseUrl() {
    return getRequiredEnv('NEXT_PUBLIC_SUPABASE_URL');
  },
  getSupabaseAnonKey() {
    return getRequiredEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  },
};
