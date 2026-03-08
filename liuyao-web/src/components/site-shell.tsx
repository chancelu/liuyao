import Link from 'next/link';
import { getMessages } from '@/lib/i18n';
import { AuthNav } from '@/components/auth/auth-nav';

const messages = getMessages();

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(93,150,138,0.16),_transparent_28%),linear-gradient(180deg,#0b0d11_0%,#10131a_45%,#0b0d11_100%)] text-stone-100">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-6 sm:px-10">
        <header className="mb-10 flex items-center justify-between border-b border-white/10 pb-5">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full border border-emerald-200/25 bg-white/5" />
            <div>
              <div className="text-sm tracking-[0.35em] text-stone-300/70 uppercase">{messages.brand.name}</div>
              <div className="text-xs text-stone-400">{messages.brand.tagline}</div>
            </div>
          </Link>
          <nav className="flex items-center gap-4 text-sm text-stone-300">
            <Link href="/cast" className="rounded-full border border-white/10 px-4 py-2 hover:border-emerald-200/30 hover:text-white">
              {messages.home.primaryCta}
            </Link>
            <Link href="/history" className="hover:text-white">历史记录</Link>
            <AuthNav />
          </nav>
        </header>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
