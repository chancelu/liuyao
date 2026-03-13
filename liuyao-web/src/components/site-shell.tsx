import { Suspense } from 'react';
import Link from 'next/link';
import { AuthNav } from '@/components/auth/auth-nav';
import { AutoCheckin } from '@/components/auto-checkin';

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-[var(--bg-deep)] text-[var(--text-secondary)]">
      <div className="relative mx-auto flex min-h-screen max-w-3xl flex-col px-6 py-8 sm:px-10">
        {/* Header — minimal */}
        <header className="mb-20 flex items-center justify-between">
          <Link href="/" className="group flex items-center gap-3">
            <span className="font-display text-2xl text-[var(--gold)]">爻</span>
            <span className="text-[10px] tracking-[0.35em] text-[var(--text-dim)] uppercase">Yarrow</span>
          </Link>
          <nav className="flex items-center gap-5 text-xs tracking-[0.12em] text-[var(--text-muted)]">
            <Link href="/cast" className="transition-colors duration-400 hover:text-[var(--text-primary)]">
              问卦
            </Link>
            <Suspense fallback={<Link href="/login" className="text-[var(--text-dim)] transition-colors duration-400 hover:text-[var(--text-primary)]">入</Link>}>
              <AuthNav />
            </Suspense>
          </nav>
        </header>

        {/* Main */}
        <main className="flex-1">{children}</main>
        <AutoCheckin />

        {/* Footer — whisper */}
        <footer className="mt-32 pt-8 pb-6">
          <div className="divider-ornament mb-8">◇</div>
          <div className="text-center text-[10px] tracking-[0.2em] text-[var(--text-dim)]">
            雅若 Yarrow · 六爻在线占卦
          </div>
        </footer>
      </div>
    </div>
  );
}
