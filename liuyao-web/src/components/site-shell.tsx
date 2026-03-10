import { Suspense } from 'react';
import Link from 'next/link';
import { getMessages } from '@/lib/i18n';
import { AuthNav } from '@/components/auth/auth-nav';

const messages = getMessages();

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-atmosphere relative min-h-screen text-[var(--foreground)]">
      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-8 sm:px-12">
        <header className="mb-14 flex items-center justify-between border-b border-[rgba(200,205,216,0.12)] pb-6">
          <Link href="/" className="group flex items-center gap-3">
            <div className="h-9 w-9 rounded-full border border-[rgba(122,173,160,0.20)] bg-[rgba(122,173,160,0.06)] transition-colors duration-200 group-hover:border-[rgba(122,173,160,0.35)]" />
            <div>
              <div className="text-sm tracking-[0.35em] text-[var(--moon-silver)] uppercase">{messages.brand.name}</div>
              <div className="text-xs text-[var(--text-dim)]">{messages.brand.tagline}</div>
            </div>
          </Link>
          <nav className="flex items-center gap-4 text-sm text-[var(--moon-silver-soft)]">
            <Link href="/cast" className="btn-secondary rounded-full px-4 py-2">
              {messages.home.primaryCta}
            </Link>
            <Link href="/history" className="transition-colors duration-200 hover:text-[var(--foreground)]">历史记录</Link>
            <Suspense fallback={<Link href="/login" className="btn-secondary rounded-full px-4 py-2 text-sm">登录</Link>}>
              <AuthNav />
            </Suspense>
          </nav>
        </header>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
