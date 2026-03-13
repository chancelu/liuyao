import Link from 'next/link';
import { SiteShell } from '@/components/site-shell';
import { HomeTracker } from '@/components/home-tracker';
import { ParticleBackground } from '@/components/ui/particle-background';
import { getMessages } from '@/lib/i18n';

const messages = getMessages();

export default function HomePage() {
  return (
    <SiteShell>
      <HomeTracker />

      {/* ═══════════════════════════════════════════
          HERO — Eastern mysticism, massive whitespace
          ═══════════════════════════════════════════ */}
      <section className="hexagram-bg relative -mx-6 mb-48 flex min-h-[88vh] flex-col items-center justify-center px-6 text-center sm:-mx-12 sm:px-12 lg:-mx-16 lg:px-16">
        {/* Particle effect */}
        <ParticleBackground />

        {/* Ambient glow — warm gold ink wash layers */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {/* Central warm glow */}
          <div className="absolute left-1/2 top-1/3 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 animate-slow-drift rounded-full bg-[rgba(196,149,107,0.04)] blur-[120px]" />
          {/* Top-left gold accent */}
          <div className="absolute -left-20 -top-20 h-[400px] w-[400px] rounded-full bg-[rgba(196,149,107,0.03)] blur-[100px]" style={{ animation: 'slowDrift 12s ease-in-out infinite' }} />
          {/* Bottom-right subtle cinnabar */}
          <div className="absolute -bottom-10 -right-10 h-[300px] w-[300px] rounded-full bg-[rgba(139,58,58,0.02)] blur-[90px]" style={{ animation: 'slowDrift 15s ease-in-out infinite reverse' }} />
          {/* Center-bottom deep gold */}
          <div className="absolute bottom-[20%] left-[40%] h-[500px] w-[500px] rounded-full bg-[rgba(196,149,107,0.025)] blur-[140px]" style={{ animation: 'slowDrift 18s ease-in-out infinite 1s' }} />
        </div>

        {/* Vertical side ornament — 竖排点缀 */}
        <div className="pointer-events-none absolute left-6 top-1/4 hidden text-vertical text-[10px] tracking-[0.5em] text-[rgba(196,149,107,0.08)] lg:block">
          天地之道
        </div>
        <div className="pointer-events-none absolute right-6 bottom-1/4 hidden text-vertical text-[10px] tracking-[0.5em] text-[rgba(196,149,107,0.08)] lg:block">
          观象知变
        </div>

        {/* Label */}
        <div className="animate-fade-in-up relative z-10 mb-12">
          <span className="shimmer-gold text-[10px] tracking-[0.5em] uppercase">六爻在线占卦</span>
        </div>

        {/* Main title */}
        <h1 className="animate-fade-in-up delay-100 relative z-10 max-w-4xl font-display text-[3rem] leading-[1.12] font-extralight tracking-[0.04em] text-[var(--text-primary)] sm:text-[4rem] lg:text-[5.5rem] lg:leading-[1.08]">
          {messages.home.heroTitle}
        </h1>

        {/* Thin gold rule */}
        <div className="animate-fade-in-up delay-200 relative z-10 mt-12 h-px w-16 bg-[var(--gold-dim)]" />

        {/* Subtitle */}
        <p className="animate-fade-in-up delay-300 relative z-10 mx-auto mt-10 max-w-md text-[15px] leading-[2] text-[var(--text-muted)]">
          {messages.home.heroDescription}
        </p>

        {/* Single CTA */}
        <div className="animate-fade-in-up delay-400 relative z-10 mt-16">
          <Link href="/cast" className="btn-primary inline-block rounded-full px-14 py-4.5 text-sm">
            {messages.home.primaryCta}
          </Link>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          PREVIEW — Specimen card
          ═══════════════════════════════════════════ */}
      <section className="mx-auto mb-48 max-w-3xl">
        <div className="overflow-hidden rounded-2xl border border-[rgba(196,149,107,0.08)] bg-[var(--bg-card)] p-10">
          <div className="mb-8 flex items-center justify-between">
            <span className="text-[10px] tracking-[0.4em] text-[var(--gold)] uppercase">排盘预览</span>
          </div>
          <div className="space-y-5">
            <div className="rounded-xl bg-[var(--bg-elevated)] p-6">
              <div className="text-[10px] tracking-[0.25em] text-[var(--text-dim)] uppercase">所问</div>
              <div className="mt-3 font-display text-lg leading-8 text-[var(--text-primary)]">这段关系接下来还有机会吗？</div>
            </div>
            <div className="grid grid-cols-2 gap-5">
              <div className="rounded-xl bg-[var(--bg-elevated)] p-6 text-center">
                <div className="text-[10px] tracking-[0.25em] text-[var(--text-dim)] uppercase">本卦</div>
                <div className="mt-4 font-display text-2xl font-extralight text-[var(--text-primary)]">雷山小过</div>
                <div className="mt-2 text-xs text-[var(--text-dim)]">震宫 · 五行属木</div>
              </div>
              <div className="rounded-xl bg-[var(--bg-elevated)] p-6 text-center">
                <div className="text-[10px] tracking-[0.25em] text-[var(--text-dim)] uppercase">变卦</div>
                <div className="mt-4 font-display text-2xl font-extralight text-[var(--text-primary)]">泽地萃</div>
                <div className="mt-2 text-xs text-[var(--text-dim)]">兑宫 · 五行属金</div>
              </div>
            </div>
            <div className="rounded-xl border border-[rgba(196,149,107,0.10)] bg-[rgba(196,149,107,0.03)] p-6">
              <div className="mb-2 text-[10px] tracking-[0.25em] text-[var(--gold)] uppercase">初步结论</div>
              <p className="text-sm leading-8 text-[var(--text-muted)]">
                当前阻力较重，但后续仍有转机。世爻持世有力，应爻虽受克但未绝。先看排盘，再看白话解读与专业分析。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          HOW IT WORKS — Minimal 3-step
          ═══════════════════════════════════════════ */}
      <section id="how-it-works" className="mb-48">
        <div className="mb-20 text-center">
          <h2 className="font-display text-3xl font-extralight tracking-[0.04em] text-[var(--text-primary)] lg:text-4xl">{messages.home.stepsTitle}</h2>
          <div className="mx-auto mt-6 h-px w-12 bg-[var(--gold-dim)]" />
        </div>
        <div className="grid gap-px overflow-hidden rounded-2xl border border-[rgba(196,149,107,0.08)] md:grid-cols-3">
          {messages.home.steps.map((step, index) => (
            <div
              key={step.title}
              className="bg-[var(--bg-card)] p-10 transition-colors duration-300 hover:bg-[rgba(196,149,107,0.05)]"
            >
              <div className="mb-6 text-[11px] tracking-[0.4em] text-[var(--gold)] uppercase">0{index + 1}</div>
              <div className="mb-4 font-display text-lg font-light text-[var(--text-primary)]">{step.title}</div>
              <p className="text-sm leading-8 text-[var(--text-muted)]">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          FAQ — Two-column, clean
          ═══════════════════════════════════════════ */}
      <section className="pb-16">
        <div className="mb-20 text-center">
          <h2 className="font-display text-3xl font-extralight tracking-[0.04em] text-[var(--text-primary)] lg:text-4xl">常见问题</h2>
          <div className="mx-auto mt-6 h-px w-12 bg-[var(--gold-dim)]" />
        </div>
        <div className="mx-auto grid max-w-4xl gap-5 md:grid-cols-2">
          {messages.home.faq.map((item) => (
            <div
              key={item.q}
              className="rounded-2xl border border-[rgba(196,149,107,0.08)] bg-[var(--bg-card)] p-8 transition-all duration-300 hover:border-[rgba(196,149,107,0.15)] hover:shadow-[0_4px_24px_rgba(196,149,107,0.05)]"
            >
              <div className="mb-4 font-display text-sm text-[var(--text-primary)]">{item.q}</div>
              <p className="text-sm leading-8 text-[var(--text-muted)]">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Decorative footer */}
      <div className="footer-decoration">☰</div>
    </SiteShell>
  );
}
