import Link from 'next/link';
import { SiteShell } from '@/components/site-shell';
import { HomeTracker } from '@/components/home-tracker';
import { getMessages } from '@/lib/i18n';

const messages = getMessages();

export default function HomePage() {
  return (
    <SiteShell>
      <HomeTracker />

      <section className="glow-hero animate-fade-in-up relative overflow-hidden rounded-[36px] border border-[rgba(196,164,108,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.00))] px-6 py-16 sm:px-10 lg:px-14 lg:py-20">
        <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(196,164,108,0.45),transparent)]" />
        <div className="grid items-end gap-12 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <div className="mb-6 inline-flex rounded-full border border-[rgba(196,164,108,0.16)] bg-[rgba(196,164,108,0.05)] px-4 py-2 text-[10px] tracking-[0.38em] text-[var(--gold-light)] uppercase">
              Ritual-led divination experience
            </div>
            <h1 className="max-w-4xl font-display text-5xl leading-[1.08] font-extralight tracking-[0.04em] text-[var(--cream)] sm:text-6xl lg:text-7xl">
              {messages.home.heroTitle}
            </h1>
            <p className="mt-8 max-w-2xl text-[15px] leading-9 text-[var(--cream-soft)]">
              {messages.home.heroDescription}
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link href="/cast" className="btn-primary rounded-full px-10 py-4 text-center text-sm">
                {messages.home.primaryCta}
              </Link>
              <a href="#how-it-works" className="btn-secondary rounded-full px-10 py-4 text-center text-sm">
                {messages.home.secondaryCta}
              </a>
            </div>
          </div>
          <div className="card-glass relative rounded-[28px] p-8">
            <div className="mb-6 flex items-center justify-between text-[10px] tracking-[0.32em] text-[var(--gold-dim)] uppercase">
              <span>Oracle preview</span>
              <span>Specimen No. 01</span>
            </div>
            <div className="space-y-5">
              <div className="rounded-2xl border border-[rgba(196,164,108,0.10)] bg-[rgba(255,255,255,0.02)] p-5">
                <div className="text-[10px] tracking-[0.25em] text-[var(--stone-dim)] uppercase">Question</div>
                <div className="mt-3 font-display text-lg leading-8 text-[var(--cream)]">这段关系接下来还有机会吗？</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-deep)]/60 p-5">
                  <div className="text-[10px] tracking-[0.25em] text-[var(--stone-dim)] uppercase">本卦</div>
                  <div className="mt-3 font-display text-2xl text-[var(--gold-light)]">雷山小过</div>
                </div>
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-deep)]/60 p-5">
                  <div className="text-[10px] tracking-[0.25em] text-[var(--stone-dim)] uppercase">变卦</div>
                  <div className="mt-3 font-display text-2xl text-[var(--gold-light)]">泽地萃</div>
                </div>
              </div>
              <div className="rounded-2xl border border-[rgba(196,164,108,0.14)] bg-[rgba(196,164,108,0.05)] p-5 text-sm leading-8 text-[var(--cream-soft)]">
                当前阻力较重，但后续仍有转机。先看排盘，再看白话解读与专业分析。
              </div>
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
