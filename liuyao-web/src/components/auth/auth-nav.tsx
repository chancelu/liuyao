'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import { getUser, signOut } from '@/lib/supabase/auth';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { useI18n } from '@/lib/i18n';

export function AuthNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { locale } = useI18n();
  const isEn = locale === 'en';
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [points, setPoints] = useState<number | null>(null);
  const [signingOut, setSigningOut] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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

  // Fetch points when user is available
  useEffect(() => {
    if (!user) { setPoints(null); return; }
    let cancelled = false;
    (async () => {
      try {
        const client = getSupabaseBrowserClient();
        const { data } = await client
          .from('user_points')
          .select('balance')
          .eq('user_id', user.id)
          .maybeSingle();
        if (!cancelled && data) {
          setPoints((data as Record<string, unknown>).balance as number);
        }
      } catch { /* ignore */ }
    })();
    return () => { cancelled = true; };
  }, [user]);

  // Close menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  async function handleSignOut() {
    setSigningOut(true);
    await signOut();
    setUser(null);
    setSigningOut(false);
    setMenuOpen(false);
  }

  if (user === undefined) return null;

  if (user) {
    return (
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex items-center gap-2 text-xs text-[var(--text-muted)] transition-colors duration-200 hover:text-white"
        >
          <span className="text-[var(--gold)]">✦</span>
          <span>{points !== null ? `${points} ${isEn ? 'pts' : '积分'}` : (isEn ? 'Me' : '我的')}</span>
          <svg className={`h-3 w-3 transition-transform ${menuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-full z-50 mt-2 w-44 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[var(--bg-card)] py-1.5 shadow-xl">
            <div className="border-b border-[rgba(255,255,255,0.06)] px-4 py-2.5">
              <div className="truncate text-[10px] text-[var(--text-dim)]">{user.email}</div>
              {points !== null && (
                <div className="mt-1 text-xs text-[var(--gold)]">✦ {points} {isEn ? 'pts' : '积分'}</div>
              )}
            </div>
            <Link href="/profile" onClick={() => setMenuOpen(false)}
              className="block px-4 py-2.5 text-xs text-[var(--text-muted)] transition-colors hover:bg-[rgba(255,255,255,0.04)] hover:text-white">
              {isEn ? 'Profile' : '个人中心'}
            </Link>
            <Link href="/history" onClick={() => setMenuOpen(false)}
              className="block px-4 py-2.5 text-xs text-[var(--text-muted)] transition-colors hover:bg-[rgba(255,255,255,0.04)] hover:text-white">
              {isEn ? 'History' : '历史记录'}
            </Link>
            <div className="border-t border-[rgba(255,255,255,0.06)]">
              <button
                onClick={handleSignOut}
                disabled={signingOut}
                className="w-full px-4 py-2.5 text-left text-xs text-[var(--text-muted)] transition-colors hover:bg-[rgba(255,255,255,0.04)] hover:text-[var(--error)] disabled:opacity-50"
              >
                {signingOut ? (isEn ? 'Signing out…' : '登出中…') : (isEn ? 'Sign out' : '登出')}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={loginHref}
      className="text-[var(--text-dim)] transition-colors duration-200 hover:text-[var(--gold)]"
    >
      {isEn ? 'Log in' : '登录'}
    </Link>
  );
}
