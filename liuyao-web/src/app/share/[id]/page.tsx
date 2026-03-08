import Link from 'next/link';
import { SiteShell } from '@/components/site-shell';

export default async function SharePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <SiteShell>
      <div className="mx-auto max-w-4xl rounded-[32px] border border-white/10 bg-white/5 p-8 text-center backdrop-blur">
        <div className="space-y-4">
          <div className="text-xs tracking-[0.3em] text-stone-400 uppercase">Share #{id}</div>
          <h1 className="text-4xl text-stone-50">分享结果页骨架</h1>
          <p className="mx-auto max-w-2xl text-sm leading-7 text-stone-300/78">
            后续这里会读取公开分享数据，展示简化版问题、卦象与一段结论，并承接外部流量回流到主站。
          </p>
        </div>
        <div className="mt-10 rounded-[28px] border border-emerald-100/12 bg-emerald-100/6 p-8 text-left">
          <div className="text-xs tracking-[0.2em] text-stone-400 uppercase">Summary</div>
          <div className="mt-3 text-2xl text-stone-50">当前阻力较重，但后续仍有转机。</div>
          <p className="mt-4 text-sm leading-7 text-stone-200/85">本卦：雷山小过｜变卦：泽地萃</p>
        </div>
        <Link href="/cast" className="mt-8 inline-flex rounded-full border border-emerald-200/25 bg-emerald-100/10 px-6 py-3 text-sm text-white hover:bg-emerald-100/15">
          我也来起一卦
        </Link>
      </div>
    </SiteShell>
  );
}
