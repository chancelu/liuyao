import Link from 'next/link';
import { SiteShell } from '@/components/site-shell';
import { getMessages } from '@/lib/i18n';

const messages = getMessages();

export default function HomePage() {
  return (
    <SiteShell>
      <section className="grid gap-14 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
        <div className="space-y-8">
          <div className="inline-flex rounded-full border border-emerald-200/15 bg-white/5 px-4 py-2 text-xs tracking-[0.3em] text-stone-300/70 uppercase">
            六爻在线占卦体验
          </div>
          <div className="space-y-5">
            <h1 className="max-w-4xl text-5xl leading-[1.1] font-medium tracking-tight text-stone-50 sm:text-6xl">
              {messages.home.heroTitle}
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-stone-300/78">{messages.home.heroDescription}</p>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Link href="/cast" className="rounded-full border border-emerald-100/25 bg-emerald-100/10 px-6 py-3 text-center text-sm text-stone-50 transition hover:border-emerald-100/40 hover:bg-emerald-100/15">
              {messages.home.primaryCta}
            </Link>
            <a href="#how-it-works" className="rounded-full border border-white/12 px-6 py-3 text-center text-sm text-stone-200 transition hover:border-white/25 hover:text-white">
              {messages.home.secondaryCta}
            </a>
          </div>
        </div>
        <div className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-6 shadow-2xl shadow-black/30 backdrop-blur">
          <div className="mb-6 flex items-center justify-between text-xs tracking-[0.2em] text-stone-400 uppercase">
            <span>排盘预览</span>
            <span>Preview</span>
          </div>
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
              <div className="text-sm text-stone-400">问题</div>
              <div className="mt-2 text-base text-stone-100">这段关系接下来还有机会吗？</div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                <div className="text-xs text-stone-400">本卦</div>
                <div className="mt-2 text-xl text-stone-100">雷山小过</div>
              </div>
              <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                <div className="text-xs text-stone-400">变卦</div>
                <div className="mt-2 text-xl text-stone-100">泽地萃</div>
              </div>
            </div>
            <div className="rounded-2xl border border-emerald-100/10 bg-emerald-100/6 p-4 text-sm leading-7 text-stone-200">
              当前阻力较重，但后续仍有转机。先看排盘，再看白话解读与专业分析。
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="mt-20 space-y-8">
        <div className="space-y-3">
          <div className="text-xs tracking-[0.3em] text-stone-400 uppercase">How it works</div>
          <h2 className="text-3xl text-stone-50">{messages.home.stepsTitle}</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {messages.home.steps.map((step, index) => (
            <div key={step.title} className="rounded-[28px] border border-white/10 bg-white/5 p-6">
              <div className="mb-4 text-sm tracking-[0.25em] text-stone-500 uppercase">0{index + 1}</div>
              <div className="text-xl text-stone-100">{step.title}</div>
              <p className="mt-3 text-sm leading-7 text-stone-300/80">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-20 grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-3">
          <div className="text-xs tracking-[0.3em] text-stone-400 uppercase">Examples</div>
          <h2 className="text-3xl text-stone-50">{messages.home.examplesTitle}</h2>
          <p className="max-w-md text-sm leading-7 text-stone-300/78">不用先懂术语，也可以先从一个具体的问题开始。</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {messages.home.examples.map((example) => (
            <Link
              key={example}
              href={`/cast?prefill=${encodeURIComponent(example)}`}
              className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-stone-200 transition hover:border-emerald-200/25 hover:bg-emerald-100/8 hover:text-white"
            >
              {example}
            </Link>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
