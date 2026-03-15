import { Suspense } from 'react';
import Link from 'next/link';
import { AuthNav } from '@/components/auth/auth-nav';
import { AutoCheckin } from '@/components/auto-checkin';
import { InkWashBackground } from '@/components/ui/ink-wash-background';
import { LocaleSwitcher } from '@/components/ui/locale-switcher';
import { ShellNav, ShellFooterTagline } from '@/components/ui/shell-nav';

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[var(--bg-deep)] text-[var(--text-secondary)]">
      {/* Full-screen animated ink wash background */}
      <InkWashBackground />

      {/* Noise texture overlay */}
      <div className="noise-overlay pointer-events-none fixed inset-0 z-[1]" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-4xl flex-col px-4 py-6 sm:px-6 sm:py-8 md:px-10">

        {/* ── Header ── */}
        <header className="relative z-50 mb-8 flex items-center justify-between sm:mb-16">
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
          <nav className="flex items-center gap-3 text-xs tracking-[0.1em] text-[var(--text-muted)] sm:gap-6">
            <ShellNav />
            <LocaleSwitcher />
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
        <footer className="relative mt-16 pt-8 pb-6 sm:mt-32">
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
            <ShellFooterTagline />
          </div>
        </footer>
      </div>
    </div>
  );
}
