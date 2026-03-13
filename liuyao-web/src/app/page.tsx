import Link from 'next/link';
import { SiteShell } from '@/components/site-shell';
import { HomeTracker } from '@/components/home-tracker';

export default function HomePage() {
  return (
    <SiteShell>
      <HomeTracker />

      {/* ═══ HERO — Immersive dark room with golden light ═══ */}
      <section className="relative -mx-6 flex min-h-[94vh] flex-col items-center justify-center overflow-hidden px-6 text-center sm:-mx-10 sm:px-10">

        {/* Layer 1: Ink wash background texture */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/bg-inkwash.png"
            alt=""
            className="h-full w-full object-cover opacity-[0.35]"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0D0B08] via-[rgba(13,11,8,0.4)] to-[#0D0B08]" />
        </div>

        {/* Layer 2: Multiple warm radial glows */}
        <div className="pointer-events-none absolute inset-0 z-[1]">
          {/* Primary center glow — large, warm */}
          <div
            className="absolute left-1/2 top-[40%] h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(196,149,107,0.14) 0%, rgba(196,149,107,0.04) 40%, transparent 70%)',
              animation: 'breathe 5s ease-in-out infinite',
            }}
          />
          {/* Secondary top-left glow */}
          <div
            className="absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(196,149,107,0.07) 0%, transparent 60%)',
              animation: 'floatSlow 14s ease-in-out infinite',
            }}
          />
          {/* Cinnabar accent bottom-right */}
          <div
            className="absolute -bottom-32 -right-32 h-[500px] w-[500px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(139,58,58,0.06) 0%, transparent 55%)',
              animation: 'floatSlow 18s ease-in-out infinite reverse',
            }}
          />
          {/* Small focused glow behind the character */}
          <div
            className="absolute left-1/2 top-[38%] h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(196,149,107,0.18) 0%, transparent 60%)',
              animation: 'breathe 4s ease-in-out infinite 1s',
            }}
          />
        </div>

        {/* Layer 3: Decorative corner elements */}
        <div className="pointer-events-none absolute left-6 top-6 z-[2] hidden lg:block">
          <div className="flex flex-col gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-[rgba(196,149,107,0.25)]" />
            <div className="h-1.5 w-1.5 rounded-full bg-[rgba(196,149,107,0.15)]" />
          </div>
        </div>
        <div className="pointer-events-none absolute right-6 top-6 z-[2] hidden lg:block">
          <div className="flex flex-col gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-[rgba(196,149,107,0.15)]" />
            <div className="h-1.5 w-1.5 rounded-full bg-[rgba(196,149,107,0.25)]" />
          </div>
        </div>

        {/* Layer 4: Vertical text ornaments */}
        <div className="pointer-events-none absolute left-4 top-[28%] z-[2] hidden text-vertical lg:block">
          <span className="text-[10px] tracking-[0.7em] text-[rgba(196,149,107,0.10)]" style={{ fontFamily: 'var(--font-noto-serif-sc), Georgia, serif' }}>
            天地之道
          </span>
        </div>
        <div className="pointer-events-none absolute bottom-[28%] right-4 z-[2] hidden text-vertical lg:block">
          <span className="text-[10px] tracking-[0.7em] text-[rgba(196,149,107,0.10)]" style={{ fontFamily: 'var(--font-noto-serif-sc), Georgia, serif' }}>
            观象知变
          </span>
        </div>

        {/* ── Main Content ── */}
        <div className="relative z-10 flex flex-col items-center">

          {/* The character — artistic generated image with glow */}
          <div className="animate-fade-in mb-4">
            <img
              src="/images/hero-yao.png"
              alt="爻"
              className="mx-auto h-[140px] w-[140px] sm:h-[200px] sm:w-[200px] lg:h-[280px] lg:w-[280px]"
              style={{
                filter: 'drop-shadow(0 0 40px rgba(196,149,107,0.30)) drop-shadow(0 0 80px rgba(196,149,107,0.15))',
                animation: 'breathe 5s ease-in-out infinite',
              }}
            />
          </div>

          {/* Decorative line under character */}
          <div className="animate-fade-in delay-100 mb-6 flex items-center gap-3">
            <div className="h-px w-8 bg-gradient-to-r from-transparent to-[rgba(196,149,107,0.30)]" />
            <div className="h-1 w-1 rounded-full bg-[rgba(196,149,107,0.40)]" />
            <div className="h-px w-8 bg-gradient-to-l from-transparent to-[rgba(196,149,107,0.30)]" />
          </div>

          {/* Brand name — shimmer gold */}
          <div className="animate-fade-in-up delay-200 mb-2">
            <span className="shimmer-gold text-[12px] tracking-[0.5em] uppercase">
              雅若 Yarrow
            </span>
          </div>

          {/* Tagline */}
          <div className="animate-fade-in-up delay-300 mb-14">
            <span className="text-[13px] tracking-[0.2em] text-[var(--text-muted)]">
              六爻在线占卦
            </span>
          </div>

          {/* CTA Button — gold gradient with glow */}
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
        <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2" style={{ animation: 'breathe 3s ease-in-out infinite' }}>
          <i className="fa-solid fa-chevron-down text-[10px] text-[rgba(196,149,107,0.20)]" />
        </div>
      </section>

      {/* ═══ INTRO SECTION ═══ */}
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
            {
              icon: 'fa-solid fa-feather-pointed',
              num: '壹',
              title: '起卦',
              desc: '静心片刻，写下你的问题。选择类别与时间，准备与天地对话。',
            },
            {
              icon: 'fa-solid fa-coins',
              num: '贰',
              title: '摇卦',
              desc: '三枚铜钱，六次投掷。每一爻的生成，都是随机中的必然。',
            },
            {
              icon: 'fa-solid fa-scroll',
              num: '叁',
              title: '解卦',
              desc: 'AI 结合传统卦理，为你呈现白话解读与专业分析。',
            },
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

      {/* ═══ ATMOSPHERE QUOTE ═══ */}
      <section className="relative -mx-6 mb-32 overflow-hidden sm:-mx-10" style={{ height: '320px' }}>
        <img
          src="/images/bg-inkwash.png"
          alt=""
          className="h-full w-full object-cover opacity-50"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg-deep)] via-transparent to-[var(--bg-deep)]" />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
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
