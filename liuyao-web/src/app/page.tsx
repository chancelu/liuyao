import Link from 'next/link';
import { SiteShell } from '@/components/site-shell';
import { HomeTracker } from '@/components/home-tracker';

export default function HomePage() {
  return (
    <SiteShell>
      <HomeTracker />

      {/* ═══ HERO — Full screen, canvas bg handles atmosphere ═══ */}
      <section className="relative flex min-h-[85vh] flex-col items-center justify-center text-center">

        {/* Vertical ornaments — desktop */}
        <div className="pointer-events-none absolute left-0 top-[28%] hidden text-vertical lg:block">
          <span className="text-[10px] tracking-[0.7em] text-[rgba(196,149,107,0.10)]">
            天地之道
          </span>
        </div>
        <div className="pointer-events-none absolute bottom-[28%] right-0 hidden text-vertical lg:block">
          <span className="text-[10px] tracking-[0.7em] text-[rgba(196,149,107,0.10)]">
            观象知变
          </span>
        </div>

        {/* ── Content ── */}
        <div className="relative z-10 flex flex-col items-center">

          {/* Brand — YARROW with metallic shimmer + decorative strokes */}
          <div className="animate-fade-in mb-4">
            <div className="relative flex flex-col items-center">
              {/* Decorative brush stroke above */}
              <div className="mb-5 flex items-center gap-2">
                <div className="h-px w-10 bg-gradient-to-r from-transparent via-[var(--gold)] to-transparent opacity-40" />
                <div className="h-[3px] w-[3px] rotate-45 bg-[var(--gold)] opacity-50" />
                <div className="h-px w-10 bg-gradient-to-r from-transparent via-[var(--gold)] to-transparent opacity-40" />
              </div>

              {/* Glow layer */}
              <span
                className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[28px] font-extralight tracking-[0.5em] uppercase sm:text-[36px] lg:text-[48px]"
                style={{
                  color: 'rgba(196,149,107,0.15)',
                  filter: 'blur(20px)',
                }}
                aria-hidden="true"
              >
                YARROW
              </span>

              {/* Main text — strong metallic gradient */}
              <h1
                className="shimmer-gold-strong relative text-[28px] font-extralight tracking-[0.5em] uppercase sm:text-[36px] lg:text-[48px]"
              >
                YARROW
              </h1>

              {/* Decorative brush stroke below */}
              <div className="mt-5 flex items-center gap-2">
                <div className="h-px w-16 bg-gradient-to-r from-transparent to-[var(--gold)] opacity-30" />
                <div className="h-[3px] w-[3px] rotate-45 bg-[var(--gold)] opacity-50" />
                <div className="h-px w-16 bg-gradient-to-l from-transparent to-[var(--gold)] opacity-30" />
              </div>
            </div>
          </div>

          {/* Tagline */}
          <div className="animate-fade-in delay-200 mb-14">
            <span className="text-[12px] tracking-[0.2em] text-[var(--text-muted)]">
              六爻在线占卦
            </span>
          </div>

          {/* Decorative line */}
          <div className="animate-fade-in delay-300 mb-14 flex items-center gap-4">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-[rgba(196,149,107,0.25)]" />
            <i className="fa-solid fa-diamond text-[5px] text-[rgba(196,149,107,0.30)]"></i>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-[rgba(196,149,107,0.25)]" />
          </div>

          {/* CTA Button */}
          <div className="animate-fade-in-up delay-500 mb-20">
            <Link
              href="/cast"
              className="btn-primary group relative inline-flex items-center gap-3 overflow-hidden px-16 py-5 text-[15px]"
            >
              <i className="fa-solid fa-coins text-[12px] opacity-60 transition-all duration-300 group-hover:rotate-12 group-hover:opacity-100" />
              <span>问 卦</span>
            </Link>
          </div>

          {/* English subtitle */}
          <div className="animate-fade-in delay-1000">
            <span className="text-[10px] tracking-[0.15em] text-[var(--text-dim)]" style={{ fontStyle: 'italic' }}>
              Ancient Chinese divination, reimagined.
            </span>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2" style={{ animation: 'breathe 3s ease-in-out infinite' }}>
          <i className="fa-solid fa-chevron-down text-[10px] text-[rgba(196,149,107,0.20)]" />
        </div>
      </section>

      {/* ═══ INTRO ═══ */}
      <section className="glow-top relative mx-auto max-w-2xl py-32 text-center">
        <div className="relative z-10">
          <div className="animate-fade-in-up mb-8">
            <i className="fa-solid fa-yin-yang text-3xl text-[var(--gold)]" style={{ opacity: 0.5 }} />
          </div>
          <h2 className="animate-fade-in-up delay-100 mb-10 font-display text-2xl font-extralight leading-relaxed tracking-[0.06em] text-[var(--text-primary)] lg:text-3xl">
            问一件事，起一卦，<br className="hidden sm:block" />见一条脉络。
          </h2>
          <div className="animate-fade-in delay-200 mx-auto mb-10 flex items-center justify-center gap-4">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-[rgba(196,149,107,0.20)]" />
            <i className="fa-solid fa-diamond text-[5px] text-[rgba(196,149,107,0.25)]" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-[rgba(196,149,107,0.20)]" />
          </div>
          <p className="animate-fade-in-up delay-300 mx-auto max-w-lg text-[14px] leading-[2.4] text-[var(--text-muted)]">
            六爻占卦，源自三千年前的《周易》。三枚铜钱，六次投掷，天地人三才尽在其中。雅若将这一古老智慧带入数字时代，让每一次问卦都成为一次与自我的对话。
          </p>
        </div>
      </section>

      {/* ═══ THREE PILLARS ═══ */}
      <section className="mx-auto max-w-3xl pb-32">
        <div className="grid gap-5 md:grid-cols-3">
          {[
            { icon: 'fa-solid fa-feather-pointed', num: '壹', title: '起卦', desc: '静心片刻，写下你的问题。选择类别与时间，准备与天地对话。' },
            { icon: 'fa-solid fa-coins', num: '贰', title: '摇卦', desc: '三枚铜钱，六次投掷。每一爻的生成，都是随机中的必然。' },
            { icon: 'fa-solid fa-scroll', num: '叁', title: '解卦', desc: 'AI 结合传统卦理，为你呈现白话解读与专业分析。' },
          ].map((item, i) => (
            <div
              key={item.title}
              className="card-gold animate-fade-in-up group cursor-default p-8 text-center"
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
      <section className="relative mx-auto mb-32 max-w-2xl py-16 text-center">
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
