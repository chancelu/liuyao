import Link from 'next/link';
import { SiteShell } from '@/components/site-shell';
import { HomeTracker } from '@/components/home-tracker';
import { getMessages } from '@/lib/i18n';

const messages = getMessages();

export default function HomePage() {
  return (
    <SiteShell>
      <HomeTracker />

      {/* Hero — Luxury editorial style */}
      <section className="glow-hero animate-fade-in-up pb-24">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-8 text-[10px] tracking-[0.5em] text-[var(--gold-dim)] uppercase">
            六爻在线占卦
          </div>
          <h1 className="font-display text-4xl leading-[1.3] font-extralight tracking-wide text-[var(--cream)] sm:text-5xl lg:text-6xl">
            {messages.home.heroTitle}
          </h1>
          <div className="gold-divider mx-auto mt-10 w-16" />
          <p className="mx-auto mt-8 max-w-lg text-sm leading-8 text-[var(--stone)]">
            {messages.home.heroDescription}
          </p>
          <div className="mt-12 flex justify-center gap-5">
            <Link
              href="/cast"
              className="btn-primary rounded-full px-10 py-4 text-sm"
            >
              {messages.home.primaryCta}
            </Link>
            <a
              href="#how-it-works"
              className="btn-secondary rounded-full px-10 py-4 text-sm"
            >
              {messages.home.secondaryCta}
            </a>
          </div>
        </div>
      </section>

      {/* Preview Card — Minimal showcase */}
      <section className="mx-auto max-w-2xl pb-28">
        <div className="card-glass animate-fade-in-up delay-200 rounded-2xl p-8">
          <div className="mb-6 flex items-center justify-between text-[10px] tracking-[0.3em] text-[var(--stone-dim)] uppercase">
            <span>排盘预览</span>
            <span>Preview</span>
          </div>
          <div className="space-y-4">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-deep)] p-5">
              <div className="text-[10px] tracking-wider text-[var(--stone-dim)] uppercase">问题</div>
              <div className="mt-2 font-display text-base text-[var(--cream)]">这段关系接下来还有机会吗？</div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-deep)] p-5">
                <div className="text-[10px] tracking-wider text-[var(--stone-dim)] uppercase">本卦</div>
                <div className="mt-2 font-display text-xl text-[var(--gold)]">雷山小过</div>
              </div>
              <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-deep)] p-5">
                <div className="text-[10px] tracking-wider text-[var(--stone-dim)] uppercase">变卦</div>
                <div className="mt-2 font-display text-xl text-[var(--gold)]">泽地萃</div>
              </div>
            </div>
            <div className="rounded-xl border border-[rgba(196,164,108,0.08)] bg-[rgba(196,164,108,0.03)] p-5 text-sm leading-7 text-[var(--cream-soft)]">
              当前阻力较重，但后续仍有转机。先看排盘，再看白话解读与专业分析。
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="pb-28">
        <div className="mb-12 text-center">
          <div className="text-[10px] tracking-[0.5em] text-[var(--gold-dim)] uppercase">How it works</div>
          <h2 className="font-display mt-4 text-2xl font-extralight tracking-wide text-[var(--cream)]">{messages.home.stepsTitle}</h2>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {messages.home.steps.map((step, index) => (
            <div
              key={step.title}
              className="animate-fade-in-up text-center"
              style={{ animationDelay: `${(index + 1) * 150}ms` }}
            >
              <div className="mb-4 font-display text-3xl font-extralight text-[var(--gold-dim)]">0{index + 1}</div>
              <div className="font-display text-lg font-light tracking-wide text-[var(--cream)]">{step.title}</div>
              <div className="gold-divider mx-auto mt-4 w-8" />
              <p className="mt-4 text-sm leading-8 text-[var(--stone)]">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Examples */}
      <section className="pb-28">
        <div className="mb-12 text-center">
          <div className="text-[10px] tracking-[0.5em] text-[var(--gold-dim)] uppercase">Examples</div>
          <h2 className="font-display mt-4 text-2xl font-extralight tracking-wide text-[var(--cream)]">{messages.home.examplesTitle}</h2>
          <p className="mx-auto mt-4 max-w-md text-sm text-[var(--stone)]">
            不用先懂术语，也可以先从一个具体的问题开始。
          </p>
        </div>
        <div className="mx-auto flex max-w-3xl flex-wrap justify-center gap-3">
          {messages.home.examples.map((example) => (
            <Link
              key={example}
              href={`/cast?prefill=${encodeURIComponent(example)}`}
              className="rounded-full border border-[rgba(196,164,108,0.10)] px-6 py-3 text-sm text-[var(--cream-soft)] transition-all duration-300 hover:border-[rgba(196,164,108,0.25)] hover:text-[var(--gold-light)]"
            >
              {example}
            </Link>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="pb-16">
        <div className="mb-12 text-center">
          <div className="text-[10px] tracking-[0.5em] text-[var(--gold-dim)] uppercase">FAQ</div>
          <h2 className="font-display mt-4 text-2xl font-extralight tracking-wide text-[var(--cream)]">常见问题</h2>
        </div>
        <div className="mx-auto grid max-w-4xl gap-4 md:grid-cols-2">
          {messages.home.faq.map((item) => (
            <div
              key={item.q}
              className="card-glass rounded-xl p-6"
            >
              <div className="mb-3 font-display text-sm text-[var(--cream)]">{item.q}</div>
              <p className="text-sm leading-7 text-[var(--stone)]">{item.a}</p>
            </div>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
