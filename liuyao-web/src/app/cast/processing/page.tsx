import Link from 'next/link';
import { SiteShell } from '@/components/site-shell';
import { getMessages } from '@/lib/i18n';

const messages = getMessages();

export default function ProcessingPage() {
  return (
    <SiteShell>
      <div className="mx-auto max-w-4xl rounded-[36px] border border-white/10 bg-white/5 p-10 text-center backdrop-blur">
        <div className="space-y-4">
          <div className="text-xs tracking-[0.3em] text-stone-400 uppercase">Processing</div>
          <h1 className="text-4xl text-stone-50">{messages.processing.title}</h1>
          <p className="mx-auto max-w-2xl text-sm leading-7 text-stone-300/78">
            页面骨架阶段先展示推演状态。后续这里会真实串联排盘引擎与 AI 分析服务。
          </p>
        </div>
        <div className="mt-10 grid gap-4 text-left">
          {messages.processing.steps.map((step, index) => (
            <div key={step} className={`rounded-[22px] border px-5 py-4 ${index === 0 ? 'border-emerald-200/20 bg-emerald-100/8 text-stone-50' : 'border-white/8 bg-black/15 text-stone-300'}`}>
              <div className="text-xs tracking-[0.2em] text-stone-500 uppercase">Step 0{index + 1}</div>
              <div className="mt-1">{step}</div>
            </div>
          ))}
        </div>
        <div className="mt-10">
          <Link href="/result/demo" className="rounded-full border border-white/10 px-6 py-3 text-sm text-stone-200 hover:border-white/20">
            查看结果页骨架
          </Link>
        </div>
      </div>
    </SiteShell>
  );
}
