import Link from 'next/link';
import { SiteShell } from '@/components/site-shell';
import { HomeTracker } from '@/components/home-tracker';

export default function HomePage() {
  return (
    <SiteShell>
      <HomeTracker />

      {/* ═══ The Dark Room, One Lamp ═══ */}
      <section className="ink-wash-bg relative flex min-h-[85vh] flex-col items-center justify-center text-center">

        {/* Vertical ornaments — desktop only */}
        <div className="pointer-events-none absolute left-0 top-1/4 hidden text-vertical text-[10px] tracking-[0.6em] text-[rgba(196,149,107,0.06)] lg:block">
          天地之道
        </div>
        <div className="pointer-events-none absolute right-0 bottom-1/4 hidden text-vertical text-[10px] tracking-[0.6em] text-[rgba(196,149,107,0.06)] lg:block">
          观象知变
        </div>

        {/* The character — visual anchor */}
        <div className="animate-fade-in relative z-10 mb-8">
          <span className="font-display text-[120px] leading-none font-extralight text-[var(--text-primary)] sm:text-[160px]" style={{ opacity: 0.9 }}>
            爻
          </span>
        </div>

        {/* Brand */}
        <div className="animate-fade-in delay-300 relative z-10 mb-4">
          <span className="text-[10px] tracking-[0.5em] text-[var(--text-dim)] uppercase">
            雅若 Yarrow
          </span>
        </div>

        {/* Tagline */}
        <div className="animate-fade-in delay-400 relative z-10 mb-16">
          <span className="text-[11px] tracking-[0.2em] text-[var(--text-dim)]">
            六爻在线占卦
          </span>
        </div>

        {/* Thin gold rule */}
        <div className="animate-fade-in delay-500 relative z-10 mb-16 h-px w-10 bg-[rgba(196,149,107,0.20)]" />

        {/* Single CTA */}
        <div className="animate-fade-in delay-600 relative z-10">
          <Link
            href="/cast"
            className="btn-primary inline-block px-14 py-4 text-sm"
          >
            问 卦
          </Link>
        </div>

        {/* English subtitle for international users */}
        <div className="animate-fade-in delay-1000 relative z-10 mt-20">
          <span className="text-[9px] tracking-[0.15em] text-[var(--text-dim)] italic" style={{ opacity: 0.5 }}>
            Ancient Chinese divination, reimagined.
          </span>
        </div>
      </section>
    </SiteShell>
  );
}
