import { Suspense } from 'react';
import Link from 'next/link';
import { getMessages } from '@/lib/i18n';
import { AuthNav } from '@/components/auth/auth-nav';
import { AutoCheckin } from '@/components/auto-checkin';

const messages = getMessages();

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-[var(--bg-deep)] text-[var(--text-secondary)]">
      {/* Ink wash atmosphere — top */}
      <div className="pointer-events-none fixed inset-x-0 top-0 h-[500px] z-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgba(196,149,107,0.04) 0%, transparent 60%)',
        }}
      />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-8 sm:px-12 lg:px-16">
        {/* Header */}
        <header className="mb-16 flex items-center justify-between border-b border-[rgba(196,149,107,0.08)] pb-6">
          <Link href="/" className="group flex items-center gap-4">
            {/* Logo mark — cinnabar seal stamp feel */}
            <span className="font-display text-xl text-[var(--gold)]" style={{ textShadow: '0 0 20px rgba(196,149,107,0.2)' }}>爻</span>
            <div>
              <div className="font-display text-sm tracking-[0.35em] text-[var(--text-primary)] uppercase">{messages.brand.name}</div>
              <div className="text-[9px] tracking-[0.2em] text-[var(--text-dim)]">{messages.brand.tagline}</div>
            </div>
          </Link>
          <nav className="flex items-center gap-6 text-xs tracking-[0.12em] text-[var(--text-muted)]">
            <Link href="/cast" className="transition-colors duration-300 hover:text-[var(--gold)]">
              {messages.home.primaryCta}
            </Link>
            <Suspense fallback={<Link href="/login" className="text-[var(--text-dim)] transition-colors duration-300 hover:text-[var(--gold)]">登录</Link>}>
              <AuthNav />
            </Suspense>
          </nav>
        </header>
        <main className="flex-1">{children}</main>
        <AutoCheckin />
        {/* Footer */}
        <footer className="mt-32 border-t border-[rgba(196,149,107,0.08)] pt-8 pb-4">
          <div className="flex items-center justify-between text-[10px] tracking-[0.12em] text-[var(--text-dim)]">
            <span>© 2025 爻镜 YAOJING</span>
            <span className="text-vertical text-[8px] tracking-[0.4em] text-[rgba(196,149,107,0.15)] sm:hidden">六爻</span>
            <span className="hidden sm:inline">六爻在线占卦</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
