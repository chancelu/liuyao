import Link from 'next/link';
import { SiteShell } from '@/components/site-shell';
import { getMessages } from '@/lib/i18n';

const messages = getMessages();

export default function HistoryPage() {
  return (
    <SiteShell>
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="space-y-3">
          <div className="text-xs tracking-[0.3em] text-stone-400 uppercase">History</div>
          <h1 className="text-4xl text-stone-50">{messages.history.title}</h1>
          <p className="text-sm leading-7 text-stone-300/78">这里会在注册后保存你的卦例、结论摘要与回看入口。</p>
        </div>
        <div className="rounded-[32px] border border-dashed border-white/10 bg-white/4 p-10 text-center">
          <p className="text-sm text-stone-300">{messages.history.empty}</p>
          <Link href="/cast" className="mt-5 inline-flex rounded-full border border-emerald-200/25 bg-emerald-100/10 px-6 py-3 text-sm text-white hover:bg-emerald-100/15">
            {messages.history.cta}
          </Link>
        </div>
      </div>
    </SiteShell>
  );
}
