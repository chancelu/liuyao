import Link from 'next/link';
import { SiteShell } from '@/components/site-shell';
import { HomeTracker } from '@/components/home-tracker';

export default function HomePage() {
  return (
    <SiteShell>
      <HomeTracker />

      {/* ═══ HERO — Minimal, let the background breathe ═══ */}
      <section className="relative flex min-h-[75vh] flex-col items-center justify-center text-center sm:min-h-[85vh]">

        {/* ── Oracle Ring — SVG animated circle ── */}
        <div className="animate-fade-in relative mb-8 sm:mb-10">
          <svg
            viewBox="0 0 200 200"
            className="h-[120px] w-[120px] sm:h-[160px] sm:w-[160px] lg:h-[200px] lg:w-[200px]"
          >
            {/* Outer ring — slow rotation */}
            <circle
              cx="100" cy="100" r="90"
              fill="none"
              stroke="rgba(196,149,107,0.12)"
              strokeWidth="0.5"
              style={{ animation: 'spin 120s linear infinite' }}
              transform-origin="100 100"
            />
            {/* Main ring — breathing glow */}
            <circle
              cx="100" cy="100" r="75"
              fill="none"
              stroke="rgba(196,149,107,0.25)"
              strokeWidth="0.8"
              style={{ animation: 'breathe 5s ease-in-out infinite' }}
            />
            {/* Inner ring */}
            <circle
              cx="100" cy="100" r="60"
              fill="none"
              stroke="rgba(196,149,107,0.08)"
              strokeWidth="0.3"
              style={{ animation: 'spin 90s linear infinite reverse' }}
              transform-origin="100 100"
            />
            {/* Center dot */}
            <circle
              cx="100" cy="100" r="2"
              fill="rgba(196,149,107,0.35)"
              style={{ animation: 'breathe 4s ease-in-out infinite' }}
            />
            {/* 4 cardinal marks on main ring */}
            <line x1="100" y1="20" x2="100" y2="30" stroke="rgba(196,149,107,0.15)" strokeWidth="0.5" />
            <line x1="100" y1="170" x2="100" y2="180" stroke="rgba(196,149,107,0.15)" strokeWidth="0.5" />
            <line x1="20" y1="100" x2="30" y2="100" stroke="rgba(196,149,107,0.15)" strokeWidth="0.5" />
            <line x1="170" y1="100" x2="180" y2="100" stroke="rgba(196,149,107,0.15)" strokeWidth="0.5" />
            {/* Trigram marks — 3 short lines at top */}
            <line x1="92" y1="55" x2="108" y2="55" stroke="rgba(196,149,107,0.20)" strokeWidth="0.8" />
            <line x1="92" y1="60" x2="99" y2="60" stroke="rgba(196,149,107,0.20)" strokeWidth="0.8" />
            <line x1="101" y1="60" x2="108" y2="60" stroke="rgba(196,149,107,0.20)" strokeWidth="0.8" />
            <line x1="92" y1="65" x2="108" y2="65" stroke="rgba(196,149,107,0.20)" strokeWidth="0.8" />
          </svg>
          {/* Glow behind ring */}
          <div
            className="pointer-events-none absolute inset-0 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(196,149,107,0.06) 0%, transparent 70%)',
              animation: 'breathe 5s ease-in-out infinite',
            }}
          />
        </div>

        {/* ── Brand ── */}
        <div className="animate-fade-in-up delay-200 mb-3">
          <h1
            className="text-[26px] font-light tracking-[0.45em] text-[var(--text-primary)] sm:text-[34px] sm:tracking-[0.5em] lg:text-[42px]"
            style={{ fontFamily: 'var(--font-cormorant), Georgia, serif' }}
          >
            YARROW
          </h1>
        </div>

        {/* ── Tagline ── */}
        <div className="animate-fade-in delay-300 mb-10 sm:mb-14">
          <span className="text-[11px] tracking-[0.25em] text-[var(--text-dim)]">
            六爻在线占卦
          </span>
        </div>

        {/* ── Decorative divider ── */}
        <div className="animate-fade-in delay-400 mb-10 flex items-center gap-4 sm:mb-14">
          <div className="h-px w-10 bg-gradient-to-r from-transparent to-[rgba(196,149,107,0.20)]" />
          <div className="h-[3px] w-[3px] rotate-45 bg-[rgba(196,149,107,0.30)]" />
          <div className="h-px w-10 bg-gradient-to-l from-transparent to-[rgba(196,149,107,0.20)]" />
        </div>

        {/* ── CTA ── */}
        <div className="animate-fade-in-up delay-500 mb-12 sm:mb-20">
          <Link
            href="/cast"
            className="btn-primary group relative inline-flex items-center gap-3 overflow-hidden px-10 py-4 text-[14px] sm:px-16 sm:py-5 sm:text-[15px]"
          >
            <i className="fa-solid fa-coins text-[12px] opacity-60 transition-all duration-300 group-hover:rotate-12 group-hover:opacity-100" />
            <span>问 卦</span>
          </Link>
        </div>

        {/* ── Subtitle ── */}
        <div className="animate-fade-in delay-1000">
          <span className="text-[10px] tracking-[0.15em] text-[var(--text-dim)]" style={{ fontStyle: 'italic', fontFamily: 'var(--font-cormorant), Georgia, serif' }}>
            Ancient wisdom, reimagined.
          </span>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2" style={{ animation: 'breathe 3s ease-in-out infinite' }}>
          <i className="fa-solid fa-chevron-down text-[10px] text-[rgba(196,149,107,0.20)]" />
        </div>
      </section>

      {/* ═══ INTRO ═══ */}
      <section className="glow-top relative mx-auto max-w-2xl py-16 text-center sm:py-32">
        <div className="relative z-10">
          <div className="animate-fade-in-up mb-8">
            <i className="fa-solid fa-yin-yang text-3xl text-[var(--gold)]" style={{ opacity: 0.5 }} />
          </div>
          <h2 className="animate-fade-in-up delay-100 mb-10 font-display text-xl font-extralight leading-relaxed tracking-[0.06em] text-[var(--text-primary)] sm:text-2xl lg:text-3xl">
            问一件事，起一卦，<br className="hidden sm:block" />见一条脉络。
          </h2>
          <div className="animate-fade-in delay-200 mx-auto mb-10 flex items-center justify-center gap-4">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-[rgba(196,149,107,0.20)]" />
            <i className="fa-solid fa-diamond text-[5px] text-[rgba(196,149,107,0.25)]" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-[rgba(196,149,107,0.20)]" />
          </div>
          <p className="animate-fade-in-up delay-300 mx-auto max-w-lg text-[13px] leading-[2.4] text-[var(--text-muted)] sm:text-[14px]">
            六爻占卦，源自三千年前的《周易》。三枚铜钱，六次投掷，天地人三才尽在其中。雅若将这一古老智慧带入数字时代，让每一次问卦都成为一次与自我的对话。
          </p>
        </div>
      </section>

      {/* ═══ THREE PILLARS ═══ */}
      <section className="mx-auto max-w-3xl pb-16 sm:pb-32">
        <div className="grid gap-4 sm:gap-5 md:grid-cols-3">
          {[
            { icon: 'fa-solid fa-feather-pointed', num: '壹', title: '起卦', desc: '静心片刻，写下你的问题。选择类别与时间，准备与天地对话。' },
            { icon: 'fa-solid fa-coins', num: '贰', title: '摇卦', desc: '三枚铜钱，六次投掷。每一爻的生成，都是随机中的必然。' },
            { icon: 'fa-solid fa-scroll', num: '叁', title: '解卦', desc: 'AI 结合传统卦理，为你呈现白话解读与专业分析。' },
          ].map((item, i) => (
            <div
              key={item.title}
              className="card-gold animate-fade-in-up group cursor-default p-5 text-center sm:p-8"
              style={{ animationDelay: `${400 + i * 150}ms` }}
            >
              <div className="mb-2 font-display text-[10px] tracking-[0.4em] text-[var(--gold)]" style={{ opacity: 0.4 }}>
                {item.num}
              </div>
              <div className="mb-5 transition-transform duration-500 group-hover:scale-110">
                <i className={`${item.icon} text-xl text-[var(--gold)]`} style={{ opacity: 0.65 }} />
              </div>
              <div className="mb-3 font-display text-lg font-light tracking-[0.1em] text-[var(--text-primary)]">
                {item.title}
              </div>
              <p className="text-[13px] leading-[2.2] text-[var(--text-muted)]">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ QUOTE ═══ */}
      <section className="relative mx-auto mb-16 max-w-2xl py-10 text-center sm:mb-32 sm:py-16">
        <div className="animate-fade-in flex flex-col items-center gap-6">
          <p className="font-display text-lg tracking-[0.25em] text-[var(--text-primary)] lg:text-2xl" style={{ opacity: 0.85, textShadow: '0 0 30px rgba(196,149,107,0.15)' }}>
            天行健，君子以自强不息
          </p>
          <div className="flex items-center gap-3">
            <div className="h-px w-6 bg-[rgba(196,149,107,0.20)]" />
            <span className="text-[9px] tracking-[0.3em] text-[var(--text-dim)]">《周易 · 乾卦》</span>
            <div className="h-px w-6 bg-[rgba(196,149,107,0.20)]" />
          </div>
        </div>
      </section>

      {/* Footer divider */}
      <div className="footer-decoration">
        <i className="fa-solid fa-diamond text-[5px]" />
      </div>
    </SiteShell>
  );
}
