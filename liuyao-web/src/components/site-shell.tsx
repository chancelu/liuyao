import { Suspense } from 'react';
import Link from 'next/link';
import { AuthNav } from '@/components/auth/auth-nav';
import { AutoCheckin } from '@/components/auto-checkin';
import { InkWashBackground } from '@/components/ui/ink-wash-background';

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-[var(--bg-deep)] text-[var(--text-secondary)]">
      {/* Full-screen animated ink wash background */}
      <InkWashBackground />

      {/* Noise texture overlay */}
      <div className="noise-overlay pointer-events-none fixed inset-0 z-[1]" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-4xl flex-col px-6 py-8 sm:px-10">

        {/* ── Header ── */}
        <header className="relative z-50 mb-16 flex items-center justify-between">
          <Link href="/" className="group flex items-center gap-3 transition-opacity duration-300 hover:opacity-80">
            {/* CSS hexagram lines logo */}
            <div className="flex flex-col items-center gap-[3px]">
              <div className="h-[2px] w-5 bg-[var(--gold)] opacity-70" />
              <div className="flex gap-[4px]">
                <div className="h-[2px] w-[8px] bg-[var(--gold)] opacity-70" />
                <div className="h-[2px] w-[8px] bg-[var(--gold)] opacity-70" />
              </div>
              <div className="h-[2px] w-5 bg-[var(--gold)] opacity-70" />
            </div>
            <span className="text-[12px] font-medium tracking-[0.35em] text-[var(--text-muted)] uppercase">Yarrow</span>
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
        <main className="relative flex-1">{children}</main>
        <AutoCheckin />

        {/* ── Footer ── */}
        <footer className="relative mt-32 pt-8 pb-6">
          <div className="divider-ornament mb-8">
            <i className="fa-solid fa-diamond text-[5px]"></i>
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="flex flex-col items-center gap-[2px] opacity-40">
                <div className="h-[1.5px] w-3.5 bg-[var(--gold)]" />
                <div className="flex gap-[3px]">
                  <div className="h-[1.5px] w-[6px] bg-[var(--gold)]" />
                  <div className="h-[1.5px] w-[6px] bg-[var(--gold)]" />
                </div>
                <div className="h-[1.5px] w-3.5 bg-[var(--gold)]" />
              </div>
              <span className="text-[10px] tracking-[0.3em] text-[var(--text-dim)] uppercase">Yarrow</span>
            </div>
            <span className="text-[9px] tracking-[0.15em] text-[var(--text-dim)]">
              六爻在线占卦
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
