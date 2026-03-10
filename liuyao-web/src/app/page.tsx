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
          HERO — Dramatic with visible orb & lines
          ═══════════════════════════════════════════ */}
      <section className="glow-hero relative -mx-6 mb-36 min-h-[90vh] overflow-hidden px-6 sm:-mx-16 sm:px-16">
        {/* Visible decorative elements */}
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          {/* Large glowing orb — the visual anchor */}
          <div className="absolute top-[42%] left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(122,173,160,0.18)_0%,rgba(122,173,160,0.08)_35%,rgba(176,154,106,0.04)_60%,transparent_75%)]" />
          </div>
          {/* Concentric rings — visible */}
          <div className="absolute top-[42%] left-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[rgba(122,173,160,0.12)]" style={{ animation: 'breathe 10s ease-in-out infinite' }} />
          <div className="absolute top-[42%] left-1/2 h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[rgba(122,173,160,0.18)]" style={{ animation: 'breathe 10s ease-in-out infinite 3s' }} />
          <div className="absolute top-[42%] left-1/2 h-[200px] w-[200px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[rgba(176,154,106,0.15)]" style={{ animation: 'slowSpin 120s linear infinite' }} />

          {/* Trigram symbols — actually visible */}
          <div className="absolute top-[10%] left-[8%] font-display text-[120px] leading-none text-[rgba(122,173,160,0.08)] animate-slow-float">☰</div>
          <div className="absolute top-[15%] right-[7%] font-display text-[90px] leading-none text-[rgba(122,173,160,0.07)] animate-slow-float" style={{ animationDelay: '2s' }}>☵</div>
          <div className="absolute bottom-[20%] left-[12%] font-display text-[75px] leading-none text-[rgba(176,154,106,0.07)] animate-slow-float" style={{ animationDelay: '4s' }}>☲</div>
          <div className="absolute bottom-[14%] right-[10%] font-display text-[100px] leading-none text-[rgba(122,173,160,0.08)] animate-slow-float" style={{ animationDelay: '1.5s' }}>☷</div>

          {/* Decorative corner lines */}
          <div className="absolute top-16 left-8 h-24 w-px bg-gradient-to-b from-[rgba(122,173,160,0.25)] to-transparent" />
          <div className="absolute top-16 left-8 h-px w-24 bg-gradient-to-r from-[rgba(122,173,160,0.25)] to-transparent" />
          <div className="absolute top-16 right-8 h-24 w-px bg-gradient-to-b from-[rgba(176,154,106,0.20)] to-transparent" />
          <div className="absolute top-16 right-8 h-px w-24 bg-gradient-to-l from-[rgba(176,154,106,0.20)] to-transparent" />
          <div className="absolute bottom-16 left-8 h-24 w-px bg-gradient-to-t from-[rgba(122,173,160,0.20)] to-transparent" />
          <div className="absolute bottom-16 left-8 h-px w-24 bg-gradient-to-r from-[rgba(122,173,160,0.20)] to-transparent" />
          <div className="absolute bottom-16 right-8 h-24 w-px bg-gradient-to-t from-[rgba(176,154,106,0.15)] to-transparent" />
          <div className="absolute bottom-16 right-8 h-px w-24 bg-gradient-to-l from-[rgba(176,154,106,0.15)] to-transparent" />

          {/* Horizontal accent lines */}
          <div className="absolute top-[30%] left-0 h-px w-full bg-gradient-to-r from-transparent via-[rgba(122,173,160,0.06)] to-transparent" />
          <div className="absolute top-[60%] left-0 h-px w-full bg-gradient-to-r from-transparent via-[rgba(176,154,106,0.05)] to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex min-h-[90vh] flex-col items-center justify-center text-center">
          <div className="animate-fade-in-up mb-8 inline-flex items-center gap-3 rounded-full border border-[rgba(122,173,160,0.25)] bg-[rgba(122,173,160,0.08)] px-6 py-2.5 shadow-[0_0_20px_rgba(122,173,160,0.06)]">
            <span className="h-2 w-2 rounded-full bg-[var(--jade)] animate-gentle-pulse shadow-[0_0_8px_rgba(122,173,160,0.4)]" />
            <span className="text-[11px] tracking-[0.4em] text-[var(--jade)] uppercase">六爻在线占卦</span>
          </div>

          <h1 className="animate-fade-in-up delay-100 max-w-5xl font-display text-[3.2rem] leading-[1.12] font-extralight tracking-[0.03em] text-[var(--silver)] sm:text-[4rem] lg:text-[5.5rem] lg:leading-[1.08]">
            {messages.home.heroTitle}
          </h1>

          <div className="animate-fade-in-up delay-200 mt-10 flex items-center gap-5">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-[rgba(122,173,160,0.4)]" />
            <span className="text-sm text-[var(--jade)]">✦</span>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-[rgba(122,173,160,0.4)]" />
          </div>

          <p className="animate-fade-in-up delay-300 mx-auto mt-8 max-w-xl text-[15px] leading-9 text-[var(--silver-soft)]">
            {messages.home.heroDescription}
          </p>

          <div className="animate-fade-in-up delay-400 mt-14 flex flex-col gap-4 sm:flex-row">
            <Link href="/cast" className="btn-primary rounded-full px-12 py-4.5 text-sm shadow-[0_0_24px_rgba(122,173,160,0.08)]">
              {messages.home.primaryCta}
            </Link>
            <a href="#how-it-works" className="btn-secondary rounded-full px-12 py-4.5 text-sm">
              {messages.home.secondaryCta}
            </a>
          </div>

          {/* Scroll hint */}
          <div className="animate-fade-in delay-600 absolute bottom-10 flex flex-col items-center gap-2">
            <span className="text-[9px] tracking-[0.35em] text-[var(--silver-dim)] uppercase">Scroll</span>
            <div className="h-10 w-px bg-gradient-to-b from-[var(--jade)] to-transparent opacity-40" />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          PREVIEW CARD
          ═══════════════════════════════════════════ */}
      <section className="mx-auto mb-36 max-w-3xl">
        <div className="animate-fade-in-up relative rounded-[28px] border border-[rgba(122,173,160,0.12)] bg-[linear-gradient(165deg,rgba(20,21,32,0.95),rgba(11,11,18,0.98))] p-10 shadow-[0_8px_60px_rgba(0,0,0,0.5),0_0_80px_rgba(122,173,160,0.03)]">
          {/* Top accent line */}
          <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(122,173,160,0.30)] to-transparent" />
          <div className="mb-8 flex items-center justify-between">
            <span className="text-[10px] tracking-[0.35em] text-[var(--jade-dim)] uppercase">排盘预览 · Specimen</span>
            <div className="flex gap-2">
              {['☰', '☱', '☲', '☳'].map((t, i) => (
                <span key={i} className="text-sm text-[rgba(122,173,160,0.20)]">{t}</span>
              ))}
            </div>
          </div>
          <div className="space-y-5">
            <div className="rounded-2xl border border-[rgba(122,173,160,0.10)] bg-[rgba(122,173,160,0.03)] p-6">
              <div className="text-[10px] tracking-[0.25em] text-[var(--silver-dim)] uppercase">所问</div>
              <div className="mt-3 font-display text-lg leading-8 text-[var(--silver)]">这段关系接下来还有机会吗？</div>
            </div>
            <div className="grid grid-cols-2 gap-5">
              <div className="relative overflow-hidden rounded-2xl border border-[rgba(122,173,160,0.12)] bg-[rgba(122,173,160,0.04)] p-6 text-center">
                <div className="absolute -right-4 -top-4 font-display text-[80px] leading-none text-[rgba(122,173,160,0.05)]">☳</div>
                <div className="relative">
                  <div className="text-[10px] tracking-[0.25em] text-[var(--silver-dim)] uppercase">本卦</div>
                  <div className="mt-4 font-display text-3xl font-extralight text-[var(--jade)]">雷山小过</div>
                  <div className="mt-2 text-xs text-[var(--silver-dim)]">震宫 · 五行属木</div>
                </div>
              </div>
              <div className="relative overflow-hidden rounded-2xl border border-[rgba(122,173,160,0.12)] bg-[rgba(122,173,160,0.04)] p-6 text-center">
                <div className="absolute -right-4 -top-4 font-display text-[80px] leading-none text-[rgba(122,173,160,0.05)]">☱</div>
                <div className="relative">
                  <div className="text-[10px] tracking-[0.25em] text-[var(--silver-dim)] uppercase">变卦</div>
                  <div className="mt-4 font-display text-3xl font-extralight text-[var(--jade)]">泽地萃</div>
                  <div className="mt-2 text-xs text-[var(--silver-dim)]">兑宫 · 五行属金</div>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-[rgba(176,154,106,0.15)] bg-[rgba(176,154,106,0.05)] p-6">
              <div className="mb-2 text-[10px] tracking-[0.2em] text-[var(--gold)] uppercase">初步结论</div>
              <p className="text-sm leading-8 text-[var(--silver-soft)]">
                当前阻力较重，但后续仍有转机。世爻持世有力，应爻虽受克但未绝。先看排盘，再看白话解读与专业分析。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          HOW IT WORKS
          ═══════════════════════════════════════════ */}
      <section id="how-it-works" className="mb-36">
        <div className="mb-16 text-center">
          <div className="flex items-center justify-center gap-5 mb-6">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-[rgba(122,173,160,0.3)]" />
            <span className="text-xs text-[var(--jade)]">◆</span>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-[rgba(122,173,160,0.3)]" />
          </div>
          <h2 className="font-display text-3xl font-extralight tracking-[0.04em] text-[var(--silver)]">{messages.home.stepsTitle}</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {messages.home.steps.map((step, index) => (
            <div
              key={step.title}
              className="animate-fade-in-up group relative rounded-[24px] border border-[rgba(122,173,160,0.08)] bg-[var(--bg-card)] p-8 transition-all duration-500 hover:border-[rgba(122,173,160,0.22)] hover:shadow-[0_4px_40px_rgba(122,173,160,0.06)]"
              style={{ animationDelay: `${(index + 1) * 150}ms` }}
            >
              <div className="absolute -top-5 left-8 flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(122,173,160,0.25)] bg-[var(--bg-deep)] font-display text-lg font-extralight text-[var(--jade)] shadow-[0_0_16px_rgba(122,173,160,0.06)]">
                {index + 1}
              </div>
              <div className="mt-4 font-display text-lg font-light tracking-wide text-[var(--silver)]">{step.title}</div>
              <div className="jade-divider mt-4 w-12" />
              <p className="mt-5 text-sm leading-8 text-[var(--silver-dim)]">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          EXAMPLES
          ═══════════════════════════════════════════ */}
      <section className="mb-36">
        <div className="mb-16 text-center">
          <div className="flex items-center justify-center gap-5 mb-6">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-[rgba(122,173,160,0.3)]" />
            <span className="text-xs text-[var(--jade)]">◆</span>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-[rgba(122,173,160,0.3)]" />
          </div>
          <h2 className="font-display text-3xl font-extralight tracking-[0.04em] text-[var(--silver)]">{messages.home.examplesTitle}</h2>
          <p className="mx-auto mt-5 max-w-md text-sm leading-7 text-[var(--silver-dim)]">
            不用先懂术语，也可以先从一个具体的问题开始。
          </p>
        </div>
        <div className="mx-auto grid max-w-4xl gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {messages.home.categorizedExamples.map((group) => (
            <div key={group.category} className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--jade)] shadow-[0_0_6px_rgba(122,173,160,0.4)]" />
                <span className="text-[10px] tracking-[0.3em] text-[var(--jade)] uppercase">{group.category}</span>
              </div>
              <div className="flex flex-col gap-2">
                {group.items.map((example) => (
                  <Link
                    key={example}
                    href={`/cast?prefill=${encodeURIComponent(example)}`}
                    className="rounded-xl border border-[rgba(122,173,160,0.08)] bg-[rgba(122,173,160,0.02)] px-5 py-3.5 text-sm leading-7 text-[var(--silver-soft)] transition-all duration-300 hover:border-[rgba(122,173,160,0.25)] hover:bg-[rgba(122,173,160,0.06)] hover:text-[var(--jade)] hover:shadow-[0_0_20px_rgba(122,173,160,0.04)]"
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
          <div className="flex items-center justify-center gap-5 mb-6">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-[rgba(122,173,160,0.3)]" />
            <span className="text-xs text-[var(--jade)]">◆</span>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-[rgba(122,173,160,0.3)]" />
          </div>
          <h2 className="font-display text-3xl font-extralight tracking-[0.04em] text-[var(--silver)]">常见问题</h2>
        </div>
        <div className="mx-auto grid max-w-4xl gap-5 md:grid-cols-2">
          {messages.home.faq.map((item) => (
            <div
              key={item.q}
              className="rounded-[20px] border border-[rgba(122,173,160,0.08)] bg-[var(--bg-card)] p-7 transition-all duration-300 hover:border-[rgba(122,173,160,0.18)] hover:shadow-[0_2px_24px_rgba(122,173,160,0.04)]"
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
