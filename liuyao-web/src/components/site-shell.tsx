import { Suspense } from 'react';
import Link from 'next/link';
import { getMessages } from '@/lib/i18n';
import { AuthNav } from '@/components/auth/auth-nav';

const messages = getMessages();

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-atmosphere relative min-h-screen text-[var(--foreground)]">
      <div className="pointer-events-none absolute inset-0 opacity-100">
        <div className="absolute top-0 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(196,164,108,0.09),transparent_68%)] blur-3xl" />
        <div className="absolute top-[18%] left-[8%] h-24 w-24 rounded-full border border-[rgba(196,164,108,0.08)]" />
        <div className="absolute right-[10%] bottom-[18%] h-40 w-40 rounded-full border border-[rgba(196,164,108,0.06)]" />
      </div>
      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-10 sm:px-16">
        {/* Header — editorial luxury */}
        <header className="mb-20 flex items-center justify-between border-b border-[rgba(196,164,108,0.08)] pb-6">
          <Link href="/" className="group flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[rgba(196,164,108,0.22)] bg-[rgba(196,164,108,0.04)] text-sm text-[var(--gold)] shadow-[0_0_30px_rgba(196,164,108,0.05)] transition-transform duration-500 group-hover:scale-105">
              爻
            </div>
            <div>
              <div className="font-display text-base tracking-[0.42em] text-[var(--cream)] uppercase">{messages.brand.name}</div>
              <div className="text-[10px] tracking-[0.28em] text-[var(--stone)]">ORACLE / SIX LINES</div>
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
