import { Suspense } from 'react';
import Link from 'next/link';
import { getMessages } from '@/lib/i18n';
import { AuthNav } from '@/components/auth/auth-nav';
import { AutoCheckin } from '@/components/auto-checkin';

const messages = getMessages();

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-[var(--bg-deep)] text-[var(--text-secondary)]">
      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-8 sm:px-12 lg:px-16">
        {/* Header */}
        <header className="mb-16 flex items-center justify-between border-b border-[rgba(255,255,255,0.06)] pb-6">
          <Link href="/" className="group flex items-center gap-4">
            <span className="font-display text-lg text-[var(--gold)]">爻</span>
            <div>
              <div className="font-display text-sm tracking-[0.35em] text-white uppercase">{messages.brand.name}</div>
              <div className="text-[9px] tracking-[0.2em] text-[var(--text-dim)]">{messages.brand.tagline}</div>
            </div>
          </Link>
          <nav className="flex items-center gap-6 text-xs tracking-[0.12em] text-[var(--text-muted)]">
            <Link href="/cast" className="transition-colors duration-200 hover:text-white">
              {messages.home.primaryCta}
            </Link>
            <Link href="/history" className="transition-colors duration-200 hover:text-white">
              历史记录
            </Link>
            <Link href="/profile" className="transition-colors duration-200 hover:text-white">
              我的
            </Link>
            <Suspense fallback={<Link href="/login" className="text-[var(--text-dim)] transition-colors duration-200 hover:text-white">登录</Link>}>
              <AuthNav />
            </Suspense>
          </nav>
        </header>
        <main className="flex-1">{children}</main>
        <AutoCheckin />
        {/* Footer */}
        <footer className="mt-32 border-t border-[rgba(255,255,255,0.06)] pt-8 pb-4">
          <div className="flex items-center justify-between text-[10px] tracking-[0.12em] text-[var(--text-dim)]">
            <span>© 2025 爻镜 YAOJING</span>
            <span>六爻在线占卦</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
