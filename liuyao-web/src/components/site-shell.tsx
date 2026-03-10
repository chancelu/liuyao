import { Suspense } from 'react';
import Link from 'next/link';
import { getMessages } from '@/lib/i18n';
import { AuthNav } from '@/components/auth/auth-nav';

const messages = getMessages();

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-atmosphere relative min-h-screen text-[var(--foreground)]">
      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-8 sm:px-16">
        {/* Header */}
        <header className="mb-16 flex items-center justify-between border-b border-[rgba(109,212,192,0.08)] pb-6">
          <Link href="/" className="group flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[rgba(109,212,192,0.28)] bg-[rgba(109,212,192,0.06)] text-sm text-[var(--jade)] shadow-[0_0_20px_rgba(109,212,192,0.08)] transition-all duration-500 group-hover:border-[rgba(109,212,192,0.45)] group-hover:shadow-[0_0_28px_rgba(109,212,192,0.12)]">
              爻
            </div>
            <div>
              <div className="font-display text-base tracking-[0.35em] text-white uppercase">{messages.brand.name}</div>
              <div className="text-[9px] tracking-[0.25em] text-[var(--silver-dim)]">{messages.brand.tagline}</div>
            </div>
          </Link>
          <nav className="flex items-center gap-6 text-xs tracking-[0.15em] text-[var(--silver-dim)]">
            <Link href="/cast" className="transition-colors duration-300 hover:text-[var(--jade)]">
              {messages.home.primaryCta}
            </Link>
            <Link href="/history" className="transition-colors duration-300 hover:text-[var(--jade)]">
              历史记录
            </Link>
            <Suspense fallback={<Link href="/login" className="text-[var(--jade-dim)] transition-colors duration-300 hover:text-[var(--jade)]">登录</Link>}>
              <AuthNav />
            </Suspense>
          </nav>
        </header>
        <main className="flex-1">{children}</main>
        {/* Footer */}
        <footer className="mt-24 border-t border-[rgba(109,212,192,0.08)] pt-8 pb-4">
          <div className="flex items-center justify-between text-[10px] tracking-[0.15em] text-[var(--silver-dim)]">
            <span>© 2025 爻镜 YAOJING</span>
            <span className="flex items-center gap-3">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--jade)] shadow-[0_0_6px_rgba(109,212,192,0.4)]" />
              六爻在线占卦
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
