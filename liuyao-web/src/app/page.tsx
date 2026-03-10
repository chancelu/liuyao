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
          HERO — Dramatic visual anchor + mystical atmosphere
          ═══════════════════════════════════════════ */}
      <section className="glow-hero relative -mx-6 mb-40 min-h-[92vh] overflow-hidden px-6 sm:-mx-16 sm:px-16">
        {/* Decorative layer — all elements clearly visible */}
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          {/* Central luminous orb — the visual anchor */}
          <div className="absolute top-[42%] left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div
              className="h-[420px] w-[420px] rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(122,212,191,0.22) 0%, rgba(122,212,191,0.10) 30%, rgba(100,120,200,0.06) 50%, transparent 68%)',
                animation: 'orbPulse 8s ease-in-out infinite',
              }}
            />
          </div>
          {/* Secondary warm glow behind orb */}
          <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div
              className="h-[300px] w-[500px] rounded-full opacity-60"
              style={{
                background: 'radial-gradient(ellipse, rgba(196,168,108,0.10) 0%, transparent 65%)',
              }}
            />
          </div>

          {/* Concentric rings — mystical circles */}
          <div
            className="absolute top-[42%] left-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[rgba(122,212,191,0.14)]"
            style={{ animation: 'breathe 12s ease-in-out infinite' }}
          />
          <div
            className="absolute top-[42%] left-1/2 h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[rgba(122,212,191,0.20)]"
            style={{ animation: 'breathe 12s ease-in-out infinite 4s' }}
          />
          <div
            className="absolute top-[42%] left-1/2 h-[200px] w-[200px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[rgba(196,168,108,0.18)]"
            style={{ animation: 'slowSpin 90s linear infinite' }}
          />

          {/* Floating trigram symbols — decorative, clearly visible */}
          <div className="absolute top-[10%] left-[7%] font-display text-[110px] leading-none text-[rgba(122,212,191,0.12)] animate-slow-float select-none">☰</div>
          <div className="absolute top-[16%] right-[6%] font-display text-[85px] leading-none text-[rgba(122,212,191,0.10)] animate-slow-float select-none" style={{ animationDelay: '2s' }}>☵</div>
          <div className="absolute bottom-[24%] left-[11%] font-display text-[72px] leading-none text-[rgba(196,168,108,0.10)] animate-slow-float select-none" style={{ animationDelay: '4s' }}>☲</div>
          <div className="absolute bottom-[14%] right-[9%] font-display text-[95px] leading-none text-[rgba(122,212,191,0.11)] animate-slow-float select-none" style={{ animationDelay: '1.5s' }}>☷</div>

          {/* Corner accent lines — subtle framing */}
          <div className="absolute top-14 left-8 h-24 w-px bg-gradient-to-b from-[rgba(122,212,191,0.30)] to-transparent" />
          <div className="absolute top-14 left-8 h-px w-24 bg-gradient-to-r from-[rgba(122,212,191,0.30)] to-transparent" />
          <div className="absolute top-14 right-8 h-24 w-px bg-gradient-to-b from-[rgba(196,168,108,0.22)] to-transparent" />
          <div className="absolute top-14 right-8 h-px w-24 bg-gradient-to-l from-[rgba(196,168,108,0.22)] to-transparent" />
          <div className="absolute bottom-14 left-8 h-24 w-px bg-gradient-to-t from-[rgba(122,212,191,0.22)] to-transparent" />
          <div className="absolute bottom-14 left-8 h-px w-24 bg-gradient-to-r from-[rgba(122,212,191,0.22)] to-transparent" />
          <div className="absolute bottom-14 right-8 h-24 w-px bg-gradient-to-t from-[rgba(196,168,108,0.18)] to-transparent" />
          <div className="absolute bottom-14 right-8 h-px w-24 bg-gradient-to-l from-[rgba(196,168,108,0.18)] to-transparent" />
        </div>

        {/* Hero content */}
        <div className="relative z-10 flex min-h-[92vh] flex-col items-center justify-center text-center">
          {/* Badge */}
          <div className="animate-fade-in-up mb-10 inline-flex items-center gap-3 rounded-full border border-[rgba(122,212,191,0.25)] bg-[rgba(122,212,191,0.08)] px-6 py-2.5 shadow-[0_0_24px_rgba(122,212,191,0.06)]">
            <span className="h-2 w-2 rounded-full bg-[var(--jade-cyan)] animate-gentle-pulse shadow-[0_0_8px_rgba(122,212,191,0.5)]" />
            <span className="text-[10px] tracking-[0.45em] text-[var(--jade-cyan)] uppercase">六爻在线占卦</span>
          </div>

          {/* Main title */}
          <h1 className="animate-fade-in-up delay-100 max-w-4xl font-display text-[2.8rem] leading-[1.15] font-extralight tracking-[0.04em] text-white sm:text-[3.8rem] lg:text-[5rem] lg:leading-[1.1]">
            {messages.home.heroTitle}
          </h1>

          {/* Decorative divider */}
          <div className="animate-fade-in-up delay-200 mt-10 flex items-center gap-5">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-[rgba(196,168,108,0.50)]" />
            <span className="text-sm text-[var(--dark-gold)]">✦</span>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-[rgba(196,168,108,0.50)]" />
          </div>

          {/* Subtitle */}
          <p className="animate-fade-in-up delay-300 mx-auto mt-8 max-w-lg text-[15px] leading-[2] text-[var(--cream-soft)]">
            {messages.home.heroDescription}
          </p>

          {/* CTA buttons */}
          <div className="animate-fade-in-up delay-400 mt-14 flex flex-col gap-4 sm:flex-row">
            <Link href="/cast" className="btn-primary rounded-full px-12 py-4.5 text-sm shadow-[0_0_32px_rgba(122,212,191,0.10)]">
              {messages.home.primaryCta}
            </Link>
            <a href="#how-it-works" className="btn-secondary rounded-full px-12 py-4.5 text-sm">
              {messages.home.secondaryCta}
            </a>
          </div>

          {/* Scroll hint */}
          <div className="animate-fade-in delay-600 absolute bottom-12 flex flex-col items-center gap-2">
            <span className="text-[9px] tracking-[0.35em] text-[var(--stone-dim)] uppercase">Scroll</span>
            <div className="h-10 w-px bg-gradient-to-b from-[var(--jade-cyan)] to-transparent opacity-45" />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          PREVIEW CARD — The specimen
          ═══════════════════════════════════════════ */}
      <section className="mx-auto mb-40 max-w-3xl">
        <div className="animate-fade-in-up relative overflow-hidden rounded-[28px] border border-[rgba(122,212,191,0.12)] bg-[linear-gradient(165deg,var(--bg-card),var(--bg-deep))] p-10 shadow-[0_8px_60px_rgba(0,0,0,0.5),0_0_80px_rgba(122,212,191,0.03)]">
          {/* Top accent line */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(122,212,191,0.35)] to-transparent" />
          <div className="mb-8 flex items-center justify-between">
            <span className="text-[10px] tracking-[0.35em] text-[var(--jade-cyan)] uppercase">排盘预览 · Specimen</span>
            <div className="flex gap-2">
              {['☰', '☱', '☲', '☳'].map((t, i) => (
                <span key={i} className="text-base text-[rgba(122,212,191,0.22)]">{t}</span>
              ))}
            </div>
          </div>
          <div className="space-y-5">
            <div className="rounded-2xl border border-[rgba(122,212,191,0.10)] bg-[rgba(122,212,191,0.04)] p-6">
              <div className="text-[10px] tracking-[0.25em] text-[var(--stone)] uppercase">所问</div>
              <div className="mt-3 font-display text-lg leading-8 text-white">这段关系接下来还有机会吗？</div>
            </div>
            <div className="grid grid-cols-2 gap-5">
              <div className="relative overflow-hidden rounded-2xl border border-[rgba(122,212,191,0.12)] bg-[rgba(122,212,191,0.05)] p-6 text-center">
                <div className="absolute -right-3 -top-3 font-display text-[70px] leading-none text-[rgba(122,212,191,0.06)] select-none">☳</div>
                <div className="relative">
                  <div className="text-[10px] tracking-[0.25em] text-[var(--stone)] uppercase">本卦</div>
                  <div className="mt-4 font-display text-3xl font-extralight text-[var(--jade-cyan)]">雷山小过</div>
                  <div className="mt-2 text-xs text-[var(--stone)]">震宫 · 五行属木</div>
                </div>
              </div>
              <div className="relative overflow-hidden rounded-2xl border border-[rgba(122,212,191,0.12)] bg-[rgba(122,212,191,0.05)] p-6 text-center">
                <div className="absolute -right-3 -top-3 font-display text-[70px] leading-none text-[rgba(122,212,191,0.06)] select-none">☱</div>
                <div className="relative">
                  <div className="text-[10px] tracking-[0.25em] text-[var(--stone)] uppercase">变卦</div>
                  <div className="mt-4 font-display text-3xl font-extralight text-[var(--jade-cyan)]">泽地萃</div>
                  <div className="mt-2 text-xs text-[var(--stone)]">兑宫 · 五行属金</div>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-[rgba(196,168,108,0.18)] bg-[rgba(196,168,108,0.05)] p-6">
              <div className="mb-2 text-[10px] tracking-[0.2em] text-[var(--dark-gold)] uppercase">初步结论</div>
              <p className="text-sm leading-8 text-[var(--cream-soft)]">
                当前阻力较重，但后续仍有转机。世爻持世有力，应爻虽受克但未绝。先看排盘，再看白话解读与专业分析。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          HOW IT WORKS — 3-step process
          ═══════════════════════════════════════════ */}
      <section id="how-it-works" className="mb-40">
        <div className="mb-16 text-center">
          <div className="flex items-center justify-center gap-5 mb-6">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-[rgba(196,168,108,0.40)]" />
            <span className="text-sm text-[var(--dark-gold)]">◆</span>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-[rgba(196,168,108,0.40)]" />
          </div>
          <h2 className="font-display text-3xl font-extralight tracking-[0.05em] text-white">{messages.home.stepsTitle}</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {messages.home.steps.map((step, index) => (
            <div
              key={step.title}
              className="animate-fade-in-up group relative rounded-[24px] border border-[rgba(122,212,191,0.08)] bg-[var(--bg-card)] p-8 transition-all duration-500 hover:border-[rgba(122,212,191,0.22)] hover:shadow-[0_4px_40px_rgba(122,212,191,0.06)]"
              style={{ animationDelay: `${(index + 1) * 150}ms` }}
            >
              <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(122,212,191,0.16)] to-transparent" />
              <div className="absolute -top-5 left-8 flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(196,168,108,0.25)] bg-[var(--bg-deep)] font-display text-lg font-extralight text-[var(--dark-gold)] shadow-[0_0_16px_rgba(196,168,108,0.06)]">
                {index + 1}
              </div>
              <div className="mt-4 font-display text-lg font-light tracking-wide text-white">{step.title}</div>
              <div className="jade-divider mt-4 w-12" />
              <p className="mt-5 text-sm leading-8 text-[var(--stone)]">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          EXAMPLES — Inspiration, not FAQ
          ═══════════════════════════════════════════ */}
      <section className="mb-40">
        <div className="mb-16 text-center">
          <div className="flex items-center justify-center gap-5 mb-6">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-[rgba(196,168,108,0.40)]" />
            <span className="text-sm text-[var(--dark-gold)]">◆</span>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-[rgba(196,168,108,0.40)]" />
          </div>
          <h2 className="font-display text-3xl font-extralight tracking-[0.05em] text-white">{messages.home.examplesTitle}</h2>
          <p className="mx-auto mt-5 max-w-md text-sm leading-7 text-[var(--stone)]">
            不用先懂术语，也可以先从一个具体的问题开始。
          </p>
        </div>
        <div className="mx-auto grid max-w-4xl gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {messages.home.categorizedExamples.map((group) => (
            <div key={group.category} className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[var(--dark-gold)] shadow-[0_0_8px_rgba(196,168,108,0.35)]" />
                <span className="text-[11px] tracking-[0.3em] text-[var(--dark-gold)] uppercase">{group.category}</span>
              </div>
              <div className="flex flex-col gap-2">
                {group.items.map((example) => (
                  <Link
                    key={example}
                    href={`/cast?prefill=${encodeURIComponent(example)}`}
                    className="rounded-xl border border-[rgba(122,212,191,0.08)] bg-[rgba(122,212,191,0.03)] px-5 py-3.5 text-sm leading-7 text-[var(--cream-soft)] transition-all duration-300 hover:border-[rgba(122,212,191,0.24)] hover:bg-[rgba(122,212,191,0.06)] hover:text-[var(--jade-cyan)] hover:shadow-[0_0_20px_rgba(122,212,191,0.05)]"
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
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-[rgba(196,168,108,0.40)]" />
            <span className="text-sm text-[var(--dark-gold)]">◆</span>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-[rgba(196,168,108,0.40)]" />
          </div>
          <h2 className="font-display text-3xl font-extralight tracking-[0.05em] text-white">常见问题</h2>
        </div>
        <div className="mx-auto grid max-w-4xl gap-5 md:grid-cols-2">
          {messages.home.faq.map((item) => (
            <div
              key={item.q}
              className="rounded-[20px] border border-[rgba(122,212,191,0.08)] bg-[var(--bg-card)] p-7 transition-all duration-300 hover:border-[rgba(122,212,191,0.20)] hover:shadow-[0_2px_24px_rgba(122,212,191,0.04)]"
            >
              <div className="mb-4 font-display text-sm tracking-wide text-white">{item.q}</div>
              <p className="text-sm leading-8 text-[var(--stone)]">{item.a}</p>
            </div>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
