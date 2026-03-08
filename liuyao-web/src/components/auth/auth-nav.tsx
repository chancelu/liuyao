'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import { getUser, signOut } from '@/lib/supabase/auth';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

export function AuthNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | null | undefined>(undefined); // undefined = loading
  const [signingOut, setSigningOut] = useState(false);
  const loginHref = useMemo(() => {
    const query = searchParams.toString();
    const next = `${pathname}${query ? `?${query}` : ''}`;
    return `/login?next=${encodeURIComponent(next)}`;
  }, [pathname, searchParams]);

  useEffect(() => {
    let cancelled = false;

    getUser().then((u) => { if (!cancelled) setUser(u); }).catch(() => { if (!cancelled) setUser(null); });

    try {
      const client = getSupabaseBrowserClient();
      const {
        data: { subscription },
      } = client.auth.onAuthStateChange((_, session) => {
        if (!cancelled) setUser(session?.user ?? null);
      });

      return () => {
        cancelled = true;
        subscription.unsubscribe();
      };
    } catch {
      return () => { cancelled = true; };
    }
  }, []);

  async function handleSignOut() {
    setSigningOut(true);
    await signOut();
    setUser(null);
    setSigningOut(false);
  }

  // Still loading — render nothing to avoid layout shift
  if (user === undefined) return null;

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <span className="hidden max-w-[120px] truncate text-xs text-stone-400 sm:block">
          {user.email}
        </span>
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="rounded-full border border-white/10 px-4 py-2 text-sm text-stone-300 transition hover:border-red-400/30 hover:text-red-300 disabled:opacity-50"
        >
          {signingOut ? '登出中…' : '登出'}
        </button>
      </div>
    );
  }

  return (
    <Link
      href={loginHref}
      className="rounded-full border border-white/10 px-4 py-2 text-sm text-stone-300 transition hover:border-emerald-200/30 hover:text-white"
    >
      登录
    </Link>
  );
}
