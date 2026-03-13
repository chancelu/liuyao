import { Suspense } from 'react';
import Link from 'next/link';
import { AuthNav } from '@/components/auth/auth-nav';
import { AutoCheckin } from '@/components/auto-checkin';

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="noise-overlay relative min-h-screen bg-[var(--bg-deep)] text-[var(--text-secondary)]">
      <div className="relative mx-auto flex min-h-screen max-w-4xl flex-col px-6 py-8 sm:px-10">

        {/* ── Header ── */}
        <header className="relative z-50 mb-16 flex items-center justify-between">
          <Link href="/" className="group flex items-center gap-3 transition-opacity duration-300 hover:opacity-80">
            <img src="/images/logo-yao.png" alt="Yarrow" className="h-8 w-8" style={{ filter: 'drop-shadow(0 0 6px rgba(196,149,107,0.25))' }} />
            <div className="flex flex-col">
              <span className="text-[11px] tracking-[0.3em] text-[var(--text-muted)] uppercase">Yarrow</span>
              <span className="text-[8px] tracking-[0.15em] text-[var(--text-dim)]">雅若</span>
            </div>
          </Link>
          <nav className="flex items-center gap-6 text-xs tracking-[0.1em] text-[var(--text-muted)]">
            <Link href="/cast" className="group flex items-center gap-2 transition-colors duration-300 hover:text-[var(--gold)]">
              <i className="fa-solid fa-coins text-[10px] opacity-50 transition-opacity group-hover:opacity-100"></i>
              <span>问卦</span>
            </Link>
            <Suspense fallback={
              <Link href="/login" className="flex items-center gap-2 text-[var(--text-dim)] transition-colors duration-300 hover:text-[var(--gold)]">
                <i className="fa-regular fa-user text-[10px]"></i>
                <span>入</span>
              </Link>
            }>
              <AuthNav />
            </Suspense>
          </nav>
        </header>

        {/* ── Main ── */}
        <main className="relative z-10 flex-1">{children}</main>
        <AutoCheckin />

        {/* ── Footer ── */}
        <footer className="relative z-10 mt-32 pt-8 pb-6">
          <div className="divider-ornament mb-8">
            <i className="fa-solid fa-diamond text-[5px]"></i>
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="font-display text-sm text-[var(--gold)] opacity-50">爻</span>
              <span className="text-[10px] tracking-[0.3em] text-[var(--text-dim)] uppercase">Yarrow</span>
            </div>
            <span className="text-[9px] tracking-[0.15em] text-[var(--text-dim)]">
              雅若 · 六爻在线占卦
            </span>
            <div className="mt-2 flex items-center gap-4 text-[var(--text-dim)]">
              <a href="#" className="transition-colors duration-300 hover:text-[var(--gold)]">
                <i className="fa-brands fa-github text-[12px]"></i>
              </a>
              <a href="#" className="transition-colors duration-300 hover:text-[var(--gold)]">
                <i className="fa-brands fa-twitter text-[12px]"></i>
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
