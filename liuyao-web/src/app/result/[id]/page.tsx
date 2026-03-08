import { SiteShell } from '@/components/site-shell';
import { getMessages } from '@/lib/i18n';

const messages = getMessages();

export default async function ResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <SiteShell>
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="space-y-3">
          <div className="text-xs tracking-[0.3em] text-stone-400 uppercase">Result #{id}</div>
          <h1 className="text-4xl text-stone-50">{messages.result.title}</h1>
          <p className="text-sm leading-7 text-stone-300/78">第一屏先给排盘，再给初步结论，后面再展开白话与专业分析。</p>
        </div>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[32px] border border-white/10 bg-white/5 p-8">
            <div className="mb-5 text-xs tracking-[0.2em] text-stone-400 uppercase">{messages.result.chartTitle}</div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[24px] border border-white/8 bg-black/15 p-5">
                <div className="text-xs text-stone-400">本卦</div>
                <div className="mt-2 text-2xl text-stone-100">雷山小过</div>
              </div>
              <div className="rounded-[24px] border border-white/8 bg-black/15 p-5">
                <div className="text-xs text-stone-400">变卦</div>
                <div className="mt-2 text-2xl text-stone-100">泽地萃</div>
              </div>
            </div>
            <div className="mt-6 rounded-[24px] border border-white/8 bg-black/15 p-5 text-sm leading-7 text-stone-300">
              动爻：二、四爻｜世应：待接入排盘引擎后自动生成｜月建/日辰/旬空：待接入
            </div>
          </div>
          <div className="rounded-[32px] border border-emerald-100/12 bg-emerald-100/6 p-8">
            <div className="mb-5 text-xs tracking-[0.2em] text-stone-400 uppercase">{messages.result.summaryTitle}</div>
            <div className="space-y-4">
              <div className="text-2xl leading-relaxed text-stone-50">当前阻力较重，但后续仍有转机。</div>
              <p className="text-sm leading-7 text-stone-200/85">
                这版先放示意内容。后续这里会接结构化 analysis 接口，把 headline、summary、timingHint 都真实填进来。
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-8">
            <div className="mb-4 text-xs tracking-[0.2em] text-stone-400 uppercase">{messages.result.plainTitle}</div>
            <p className="text-sm leading-8 text-stone-300">
              白话版会优先回答：这件事现在为什么这样、后面大概怎么走、你应该怎么理解当前的阻力或机会。
            </p>
          </div>
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-8">
            <div className="mb-4 text-xs tracking-[0.2em] text-stone-400 uppercase">{messages.result.professionalTitle}</div>
            <p className="text-sm leading-8 text-stone-300">
              专业版会展开：用神、旺衰、动变、世应、象法、应期，并支持 tooltip 解释术语。
            </p>
          </div>
        </section>

        <section className="flex flex-col gap-3 sm:flex-row">
          <button className="rounded-full border border-emerald-200/25 bg-emerald-100/10 px-6 py-3 text-sm text-white hover:bg-emerald-100/15">{messages.result.save}</button>
          <button className="rounded-full border border-white/10 px-6 py-3 text-sm text-stone-200 hover:border-white/20">{messages.result.share}</button>
          <button className="rounded-full border border-white/10 px-6 py-3 text-sm text-stone-200 hover:border-white/20">{messages.result.restart}</button>
        </section>
      </div>
    </SiteShell>
  );
}
