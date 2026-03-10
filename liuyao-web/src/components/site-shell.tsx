import { Suspense } from 'react';
import Link from 'next/link';
import { getMessages } from '@/lib/i18n';
import { AuthNav } from '@/components/auth/auth-nav';

const messages = getMessages();

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-atmosphere relative min-h-screen text-[var(--foreground)]">
      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-10 sm:px-16">
        {/* Header — Cartier-style minimal */}
        <header className="mb-20 flex items-center justify-between">
          <Link href="/" className="group flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--gold-dim)]/30 text-sm text-[var(--gold)]">
              爻
            </div>
            <div>
              <div className="font-display text-base tracking-[0.4em] text-[var(--cream)] uppercase">{messages.brand.name}</div>
              <div className="text-[10px] tracking-[0.2em] text-[var(--stone)]">YAOJING</div>
            </div>
          </Link>
          <nav className="flex items-center gap-6 text-xs tracking-[0.15em] text-[var(--stone)]">
            <Link href="/cast" className="transition-colors duration-300 hover:text-[var(--gold)]">
              {messages.home.primaryCta}
            </Link>
            <Link href="/history" className="transition-colors duration-300 hover:text-[var(--gold)]">
              历史
            </Link>
            <Suspense fallback={<Link href="/login" className="text-[var(--gold-dim)] transition-colors duration-300 hover:text-[var(--gold)]">登录</Link>}>
              <AuthNav />
            </Suspense>
          </nav>
        </header>
        <main className="flex-1">{children}</main>
        {/* Footer */}
        <footer className="mt-24 border-t border-[var(--border)] pt-8 pb-4">
          <div className="flex items-center justify-between text-[10px] tracking-[0.15em] text-[var(--stone-dim)]">
            <span>© 2025 爻镜 YAOJING</span>
            <span>六爻在线占卦</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
