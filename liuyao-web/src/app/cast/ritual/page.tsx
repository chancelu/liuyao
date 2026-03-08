import Link from 'next/link';
import { SiteShell } from '@/components/site-shell';
import { getMessages } from '@/lib/i18n';

const messages = getMessages();

export default function RitualPage() {
  return (
    <SiteShell>
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:items-center">
        <div className="space-y-4">
          <div className="text-xs tracking-[0.3em] text-stone-400 uppercase">Ritual</div>
          <h1 className="text-4xl leading-tight text-stone-50">{messages.cast.title}</h1>
          <p className="text-sm leading-7 text-stone-300/78">{messages.cast.subtitle}</p>
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 text-sm leading-7 text-stone-300">
            <div className="mb-3 text-xs tracking-[0.2em] text-stone-500 uppercase">Progress</div>
            {messages.cast.progress.replace('{current}', '1')}
          </div>
        </div>
        <div className="rounded-[36px] border border-white/10 bg-white/5 p-8 backdrop-blur md:p-10">
          <div className="mx-auto flex max-w-xl flex-col items-center gap-8 text-center">
            <div className="grid grid-cols-3 gap-6">
              {[1, 2, 3].map((coin) => (
                <div key={coin} className="flex h-28 w-28 items-center justify-center rounded-full border border-emerald-100/20 bg-[radial-gradient(circle_at_top,_rgba(222,241,236,0.15),_rgba(255,255,255,0.02))] text-sm text-stone-300 shadow-lg shadow-black/20">
                  铜钱 {coin}
                </div>
              ))}
            </div>
            <div className="space-y-3">
              <div className="text-sm text-stone-300">请专注你想问的事情，然后摇出这一爻。</div>
              <div className="text-xs tracking-[0.25em] text-stone-500 uppercase">少阳 / 少阴 / 老阳 / 老阴</div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button className="rounded-full border border-emerald-200/25 bg-emerald-100/10 px-6 py-3 text-sm text-white hover:bg-emerald-100/15">
                {messages.cast.cta}
              </button>
              <button className="rounded-full border border-white/10 px-6 py-3 text-sm text-stone-200 hover:border-white/20">
                {messages.cast.reset}
              </button>
            </div>
            <Link href="/cast/processing" className="text-sm text-stone-400 underline-offset-4 hover:text-stone-200 hover:underline">
              进入排盘生成页预览
            </Link>
          </div>
        </div>
      </div>
    </SiteShell>
  );
}
