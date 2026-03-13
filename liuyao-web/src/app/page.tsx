import Link from 'next/link';
import { SiteShell } from '@/components/site-shell';
import { HomeTracker } from '@/components/home-tracker';

export default function HomePage() {
  return (
    <SiteShell>
      <HomeTracker />

      {/* ═══════════════════════════════════════════
          HERO — Dark room, one lamp, rich atmosphere
          ═══════════════════════════════════════════ */}
      <section className="relative -mx-6 flex min-h-[92vh] flex-col items-center justify-center overflow-hidden px-6 text-center sm:-mx-10 sm:px-10">

        {/* Background image — Unsplash ink/smoke texture */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1518562180175-34a163b1a9a6?w=1920&q=80&auto=format&fit=crop"
            alt=""
            className="h-full w-full object-cover opacity-[0.07]"
            loading="eager"
          />
          {/* Dark overlay with warm gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-[rgba(13,11,8,0.85)] via-[rgba(13,11,8,0.6)] to-[rgba(13,11,8,0.95)]" />
        </div>

        {/* Ink wash ambient layers */}
        <div className="pointer-events-none absolute inset-0 z-[1]">
          {/* Central warm glow — visible */}
          <div className="absolute left-1/2 top-1/3 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(196,149,107,0.12)_0%,transparent_65%)] animate-breathe" />
          {/* Top accent */}
          <div className="absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle,rgba(196,149,107,0.06)_0%,transparent_60%)]" style={{ animation: 'floatSlow 12s ease-in-out infinite' }} />
          {/* Bottom cinnabar hint */}
          <div className="absolute -bottom-20 -right-20 h-[400px] w-[400px] rounded-full bg-[radial-gradient(circle,rgba(139,58,58,0.05)_0%,transparent_60%)]" style={{ animation: 'floatSlow 15s ease-in-out infinite reverse' }} />
        </div>

        {/* Vertical ornaments — desktop */}
        <div className="pointer-events-none absolute left-4 top-1/4 hidden text-vertical text-[10px] tracking-[0.6em] text-[rgba(196,149,107,0.12)] lg:block">
          天地之道
        </div>
        <div className="pointer-events-none absolute right-4 bottom-1/4 hidden text-vertical text-[10px] tracking-[0.6em] text-[rgba(196,149,107,0.12)] lg:block">
          观象知变
        </div>

        {/* ── Content ── */}
        <div className="relative z-10 flex flex-col items-center">

          {/* The character — visual anchor with glow */}
          <div className="animate-fade-in mb-6">
            <span className="char-glow font-display text-[100px] leading-none font-extralight text-[var(--text-primary)] sm:text-[140px] lg:text-[180px] animate-text-glow">
              爻
            </span>
          </div>

          {/* Brand name */}
          <div className="animate-fade-in-up delay-200 mb-3">
            <span className="shimmer-gold text-[11px] tracking-[0.6em] uppercase">
              雅若 Yarrow
            </span>
          </div>

          {/* Tagline */}
          <div className="animate-fade-in-up delay-300 mb-12">
            <span className="text-[13px] tracking-[0.15em] text-[var(--text-muted)]">
              六爻在线占卦
            </span>
          </div>

          {/* Decorative line */}
          <div className="animate-fade-in delay-400 mb-12 flex items-center gap-4">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-[rgba(196,149,107,0.25)]" />
            <i className="fa-solid fa-diamond text-[6px] text-[rgba(196,149,107,0.30)]"></i>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-[rgba(196,149,107,0.25)]" />
          </div>

          {/* CTA Button */}
          <div className="animate-fade-in-up delay-500 mb-16">
            <Link
              href="/cast"
              className="btn-primary group inline-flex items-center gap-3 px-14 py-4.5 text-[15px]"
            >
              <i className="fa-solid fa-coins text-[12px] opacity-70 transition-transform duration-300 group-hover:rotate-12"></i>
              <span>问 卦</span>
            </Link>
          </div>

          {/* English subtitle */}
          <div className="animate-fade-in-slow delay-1000">
            <span className="text-[10px] tracking-[0.12em] text-[var(--text-dim)] italic">
              Ancient Chinese divination, reimagined.
            </span>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 animate-breathe">
          <i className="fa-solid fa-chevron-down text-[10px] text-[rgba(196,149,107,0.25)]"></i>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          ABOUT — Brief introduction
          ═══════════════════════════════════════════ */}
      <section className="relative mx-auto max-w-2xl py-32 text-center">
        <div className="glow-top">
          <div className="relative z-10">
            <div className="animate-fade-in-up mb-6">
              <i className="fa-solid fa-yin-yang text-2xl text-[var(--gold)] opacity-60"></i>
            </div>
            <h2 className="animate-fade-in-up delay-100 mb-8 font-display text-2xl font-extralight tracking-[0.06em] text-[var(--text-primary)] lg:text-3xl">
              问一件事，起一卦，<br />见一条脉络。
            </h2>
            <p className="animate-fade-in-up delay-200 mx-auto max-w-lg text-[14px] leading-[2.2] text-[var(--text-muted)]">
              六爻占卦，源自三千年前的《周易》。三枚铜钱，六次投掷，天地人三才尽在其中。雅若将这一古老智慧带入数字时代，让每一次问卦都成为一次与自我的对话。
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          FEATURES — Three pillars
          ═══════════════════════════════════════════ */}
      <section className="mx-auto max-w-3xl pb-32">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { icon: 'fa-solid fa-hand-sparkles', title: '起卦', desc: '输入你的问题，选择类别，静心片刻，准备与天地对话。' },
            { icon: 'fa-solid fa-coins', title: '摇卦', desc: '三枚铜钱，六次投掷。每一爻的生成，都是一次随机中的必然。' },
            { icon: 'fa-solid fa-scroll', title: '解卦', desc: 'AI 结合传统卦理，为你呈现白话解读与专业分析。' },
          ].map((item, i) => (
            <div
              key={item.title}
              className={`card-gold animate-fade-in-up p-8 text-center`}
              style={{ animationDelay: `${300 + i * 150}ms` }}
            >
              <div className="mb-5">
                <i className={`${item.icon} text-xl text-[var(--gold)] opacity-70`}></i>
              </div>
              <div className="mb-3 font-display text-lg font-light tracking-[0.08em] text-[var(--text-primary)]">
                {item.title}
              </div>
              <p className="text-[13px] leading-[2] text-[var(--text-muted)]">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          ATMOSPHERE IMAGE — Unsplash
          ═══════════════════════════════════════════ */}
      <section className="relative -mx-6 mb-32 h-[300px] overflow-hidden sm:-mx-10 lg:h-[400px]">
        <img
          src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1920&q=80&auto=format&fit=crop"
          alt="Ancient wisdom"
          className="h-full w-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg-deep)] via-transparent to-[var(--bg-deep)]" />
        <div className="absolute inset-0 bg-[var(--bg-deep)] opacity-60" />
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="font-display text-lg tracking-[0.2em] text-[var(--text-primary)] opacity-80 lg:text-2xl">
            天行健，君子以自强不息
          </p>
        </div>
      </section>

      {/* Decorative footer divider */}
      <div className="footer-decoration">
        <i className="fa-solid fa-diamond text-[6px]"></i>
      </div>
    </SiteShell>
  );
}
