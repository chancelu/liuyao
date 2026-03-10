import Link from 'next/link';
import { SiteShell } from '@/components/site-shell';
import { HomeTracker } from '@/components/home-tracker';
import { getMessages } from '@/lib/i18n';

const messages = getMessages();

export default function HomePage() {
  return (
    <SiteShell>
      <HomeTracker />

      {/* ═══════════════════════════════════════════
          HERO — Full-viewport mystical entrance
          ═══════════════════════════════════════════ */}
      <section className="glow-hero relative -mx-6 mb-36 min-h-[88vh] overflow-hidden px-6 sm:-mx-16 sm:px-16">
        {/* Decorative rings & trigrams */}
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="hero-ring hero-ring-1" />
          <div className="hero-ring hero-ring-2" />
          <div className="hero-ring hero-ring-3" />
          {/* Floating trigram symbols */}
          <div className="hero-trigram animate-slow-float" style={{ top: '8%', left: '6%', fontSize: 140, animationDelay: '0s' }}>☰</div>
          <div className="hero-trigram animate-slow-float" style={{ top: '14%', right: '5%', fontSize: 100, animationDelay: '2.5s' }}>☵</div>
          <div className="hero-trigram animate-slow-float" style={{ bottom: '22%', left: '10%', fontSize: 80, animationDelay: '4s' }}>☲</div>
          <div className="hero-trigram animate-slow-float" style={{ bottom: '12%', right: '12%', fontSize: 120, animationDelay: '1.5s' }}>☷</div>
          <div className="hero-trigram animate-slow-float" style={{ top: '45%', left: '3%', fontSize: 60, animationDelay: '3s' }}>☳</div>
          <div className="hero-trigram animate-slow-float" style={{ top: '38%', right: '3%', fontSize: 70, animationDelay: '5s' }}>☴</div>
          {/* Central glow */}
          <div className="absolute top-[45%] left-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(122,173,160,0.09),rgba(176,154,106,0.03)_40%,transparent_65%)] blur-3xl" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex min-h-[88vh] flex-col items-center justify-center text-center">
          <div className="animate-fade-in-up mb-8 inline-flex items-center gap-3 rounded-full border border-[rgba(122,173,160,0.16)] bg-[rgba(122,173,160,0.05)] px-6 py-2.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--jade)] animate-gentle-pulse" />
            <span className="text-[10px] tracking-[0.45em] text-[var(--jade)] uppercase">六爻在线占卦</span>
          </div>

          <h1 className="animate-fade-in-up delay-100 max-w-5xl font-display text-[3.2rem] leading-[1.12] font-extralight tracking-[0.03em] text-[var(--silver)] sm:text-[4rem] lg:text-[5.5rem] lg:leading-[1.08]">
            {messages.home.heroTitle}
          </h1>

          <div className="animate-fade-in-up delay-200 divider-ornament mt-10 text-sm text-[var(--jade)]">✦</div>

          <p className="animate-fade-in-up delay-300 mx-auto mt-8 max-w-xl text-[15px] leading-9 text-[var(--silver-soft)]">
            {messages.home.heroDescription}
          </p>

          <div className="animate-fade-in-up delay-400 mt-14 flex flex-col gap-4 sm:flex-row">
            <Link href="/cast" className="btn-primary rounded-full px-12 py-4.5 text-sm">
              {messages.home.primaryCta}
            </Link>
            <a href="#how-it-works" className="btn-secondary rounded-full px-12 py-4.5 text-sm">
              {messages.home.secondaryCta}
            </a>
          </div>

          {/* Scroll hint */}
          <div className="animate-fade-in delay-600 absolute bottom-10 flex flex-col items-center gap-2">
            <span className="text-[9px] tracking-[0.35em] text-[var(--silver-dim)] uppercase">Scroll</span>
            <div className="h-10 w-px bg-gradient-to-b from-[var(--jade-dim)] to-transparent" />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          PREVIEW CARD — Specimen showcase
          ═══════════════════════════════════════════ */}
      <section className="mx-auto mb-36 max-w-3xl">
        <div className="animate-fade-in-up card-glass rounded-[28px] p-10">
          <div className="mb-8 flex items-center justify-between">
            <span className="text-[10px] tracking-[0.35em] text-[var(--jade-dim)] uppercase">排盘预览 · Specimen</span>
            <div className="flex gap-2">
              {['☰', '☱', '☲', '☳'].map((t, i) => (
                <span key={i} className="text-xs text-[rgba(122,173,160,0.12)]">{t}</span>
              ))}
            </div>
          </div>
          <div className="space-y-5">
            <div className="rounded-2xl border border-[rgba(122,173,160,0.08)] bg-[rgba(255,255,255,0.015)] p-6">
              <div className="text-[10px] tracking-[0.25em] text-[var(--silver-dim)] uppercase">所问</div>
              <div className="mt-3 font-display text-lg leading-8 text-[var(--silver)]">这段关系接下来还有机会吗？</div>
            </div>
            <div className="grid grid-cols-2 gap-5">
              <div className="rounded-2xl border border-[rgba(122,173,160,0.10)] bg-[rgba(122,173,160,0.03)] p-6 text-center">
                <div className="text-[10px] tracking-[0.25em] text-[var(--silver-dim)] uppercase">本卦</div>
                <div className="mt-4 font-display text-3xl font-extralight text-[var(--jade)]">雷山小过</div>
                <div className="mt-2 text-xs text-[var(--silver-dim)]">震宫 · 五行属木</div>
              </div>
              <div className="rounded-2xl border border-[rgba(122,173,160,0.10)] bg-[rgba(122,173,160,0.03)] p-6 text-center">
                <div className="text-[10px] tracking-[0.25em] text-[var(--silver-dim)] uppercase">变卦</div>
                <div className="mt-4 font-display text-3xl font-extralight text-[var(--jade)]">泽地萃</div>
                <div className="mt-2 text-xs text-[var(--silver-dim)]">兑宫 · 五行属金</div>
              </div>
            </div>
            <div className="rounded-2xl border border-[rgba(176,154,106,0.12)] bg-[rgba(176,154,106,0.04)] p-6">
              <div className="mb-2 text-[10px] tracking-[0.2em] text-[var(--gold-dim)] uppercase">初步结论</div>
              <p className="text-sm leading-8 text-[var(--silver-soft)]">
                当前阻力较重，但后续仍有转机。世爻持世有力，应爻虽受克但未绝。先看排盘，再看白话解读与专业分析。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          HOW IT WORKS — Three pillars
          ═══════════════════════════════════════════ */}
      <section id="how-it-works" className="mb-36">
        <div className="mb-16 text-center">
          <div className="divider-ornament mb-6 text-xs text-[var(--jade-dim)]">◆</div>
          <h2 className="font-display text-3xl font-extralight tracking-[0.04em] text-[var(--silver)]">{messages.home.stepsTitle}</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {messages.home.steps.map((step, index) => (
            <div
              key={step.title}
              className="animate-fade-in-up group relative rounded-[24px] border border-[rgba(122,173,160,0.06)] bg-[var(--bg-card)] p-8 transition-all duration-500 hover:border-[rgba(122,173,160,0.18)] hover:shadow-[0_4px_40px_rgba(122,173,160,0.05)]"
              style={{ animationDelay: `${(index + 1) * 150}ms` }}
            >
              <div className="absolute -top-5 left-8 flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(122,173,160,0.18)] bg-[var(--bg-deep)] font-display text-lg font-extralight text-[var(--jade)]">
                {index + 1}
              </div>
              <div className="mt-4 font-display text-lg font-light tracking-wide text-[var(--silver)]">{step.title}</div>
              <div className="jade-divider mt-4 w-10" />
              <p className="mt-5 text-sm leading-8 text-[var(--silver-dim)]">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          EXAMPLES — Categorized grid
          ═══════════════════════════════════════════ */}
      <section className="mb-36">
        <div className="mb-16 text-center">
          <div className="divider-ornament mb-6 text-xs text-[var(--jade-dim)]">◆</div>
          <h2 className="font-display text-3xl font-extralight tracking-[0.04em] text-[var(--silver)]">{messages.home.examplesTitle}</h2>
          <p className="mx-auto mt-5 max-w-md text-sm leading-7 text-[var(--silver-dim)]">
            不用先懂术语，也可以先从一个具体的问题开始。
          </p>
        </div>
        <div className="mx-auto grid max-w-4xl gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {messages.home.categorizedExamples.map((group) => (
            <div key={group.category} className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-[var(--jade-dim)]" />
                <span className="text-[10px] tracking-[0.3em] text-[var(--jade-dim)] uppercase">{group.category}</span>
              </div>
              <div className="flex flex-col gap-2">
                {group.items.map((example) => (
                  <Link
                    key={example}
                    href={`/cast?prefill=${encodeURIComponent(example)}`}
                    className="rounded-xl border border-[rgba(122,173,160,0.06)] bg-[rgba(255,255,255,0.012)] px-5 py-3.5 text-sm leading-7 text-[var(--silver-soft)] transition-all duration-300 hover:border-[rgba(122,173,160,0.20)] hover:bg-[rgba(122,173,160,0.04)] hover:text-[var(--jade)]"
                  >
                    {example}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          FAQ
          ═══════════════════════════════════════════ */}
      <section className="pb-16">
        <div className="mb-16 text-center">
          <div className="divider-ornament mb-6 text-xs text-[var(--jade-dim)]">◆</div>
          <h2 className="font-display text-3xl font-extralight tracking-[0.04em] text-[var(--silver)]">常见问题</h2>
        </div>
        <div className="mx-auto grid max-w-4xl gap-5 md:grid-cols-2">
          {messages.home.faq.map((item) => (
            <div
              key={item.q}
              className="rounded-[20px] border border-[rgba(122,173,160,0.06)] bg-[var(--bg-card)] p-7 transition-all duration-300 hover:border-[rgba(122,173,160,0.14)]"
            >
              <div className="mb-4 font-display text-sm tracking-wide text-[var(--silver)]">{item.q}</div>
              <p className="text-sm leading-8 text-[var(--silver-dim)]">{item.a}</p>
            </div>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
