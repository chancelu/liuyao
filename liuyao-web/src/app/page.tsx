import Link from 'next/link';
import { SiteShell } from '@/components/site-shell';
import { getMessages } from '@/lib/i18n';

const messages = getMessages();

export default function HomePage() {
  return (
    <SiteShell>
      {/* Hero */}
      <section className="animate-fade-in-up grid gap-16 pb-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
        <div className="space-y-10">
          <div className="inline-flex rounded-full border border-[rgba(200,205,216,0.10)] bg-[rgba(200,205,216,0.03)] px-5 py-2.5 text-xs tracking-[0.35em] text-[var(--moon-silver-soft)] uppercase">
            六爻在线占卦体验
          </div>
          <div className="space-y-6">
            <h1 className="max-w-4xl text-5xl leading-[1.08] font-light tracking-wide text-[var(--moon-silver)] sm:text-6xl lg:text-7xl">
              {messages.home.heroTitle}
            </h1>
            <p className="max-w-2xl text-lg leading-9 text-[var(--text-muted)]">
              {messages.home.heroDescription}
            </p>
          </div>
          <div className="flex flex-col gap-4 pt-2 sm:flex-row">
            <Link
              href="/cast"
              className="btn-primary rounded-full px-8 py-3.5 text-center text-sm tracking-wide"
            >
              {messages.home.primaryCta}
            </Link>
            <a
              href="#how-it-works"
              className="btn-secondary rounded-full px-8 py-3.5 text-center text-sm tracking-wide"
            >
              {messages.home.secondaryCta}
            </a>
          </div>
        </div>

        {/* Preview Card */}
        <div className="card-glass animate-fade-in-up delay-200 rounded-[28px] p-7 shadow-2xl">
          <div className="mb-7 flex items-center justify-between text-xs tracking-[0.25em] text-[var(--text-dim)] uppercase">
            <span>排盘预览</span>
            <span>Preview</span>
          </div>
          <div className="space-y-4">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-deep)]/40 p-5">
              <div className="text-xs text-[var(--text-dim)]">问题</div>
              <div className="mt-2 text-base text-[var(--moon-silver)]">这段关系接下来还有机会吗？</div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-deep)]/40 p-5">
                <div className="text-xs text-[var(--text-dim)]">本卦</div>
                <div className="mt-2 text-xl text-[var(--moon-silver)]">雷山小过</div>
              </div>
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-deep)]/40 p-5">
                <div className="text-xs text-[var(--text-dim)]">变卦</div>
                <div className="mt-2 text-xl text-[var(--moon-silver)]">泽地萃</div>
              </div>
            </div>
            <div className="rounded-2xl border border-[rgba(122,173,160,0.12)] bg-[rgba(122,173,160,0.05)] p-5 text-sm leading-7 text-[var(--moon-silver-soft)]">
              当前阻力较重，但后续仍有转机。先看排盘，再看白话解读与专业分析。
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="mt-28 space-y-10">
        <div className="space-y-4">
          <div className="text-xs tracking-[0.35em] text-[var(--text-dim)] uppercase">How it works</div>
          <h2 className="text-3xl font-light tracking-wide text-[var(--moon-silver)]">{messages.home.stepsTitle}</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {messages.home.steps.map((step, index) => (
            <div
              key={step.title}
              className="card-glass animate-fade-in-up rounded-[24px] p-7"
              style={{ animationDelay: `${(index + 1) * 120}ms` }}
            >
              <div className="mb-5 text-sm tracking-[0.3em] text-[var(--dark-gold-soft)] uppercase">0{index + 1}</div>
              <div className="text-xl font-light tracking-wide text-[var(--moon-silver)]">{step.title}</div>
              <p className="mt-4 text-sm leading-8 text-[var(--text-muted)]">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Examples */}
      <section className="mt-28 grid gap-12 pb-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-4">
          <div className="text-xs tracking-[0.35em] text-[var(--text-dim)] uppercase">Examples</div>
          <h2 className="text-3xl font-light tracking-wide text-[var(--moon-silver)]">{messages.home.examplesTitle}</h2>
          <p className="max-w-md text-sm leading-8 text-[var(--text-muted)]">
            不用先懂术语，也可以先从一个具体的问题开始。
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {messages.home.examples.map((example) => (
            <Link
              key={example}
              href={`/cast?prefill=${encodeURIComponent(example)}`}
              className="rounded-full border border-[var(--border)] bg-[rgba(200,205,216,0.03)] px-6 py-3.5 text-sm text-[var(--moon-silver-soft)] transition-all duration-200 hover:border-[rgba(122,173,160,0.25)] hover:bg-[rgba(122,173,160,0.06)] hover:text-[var(--foreground)]"
            >
              {example}
            </Link>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
