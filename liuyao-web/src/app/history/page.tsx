import { SiteShell } from '@/components/site-shell';
import { HistoryClient } from '@/components/history/history-client';
import { getMessages } from '@/lib/i18n';

const messages = getMessages();

export default function HistoryPage() {
  return (
    <SiteShell>
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="space-y-3">
          <div className="text-xs tracking-[0.3em] text-stone-400 uppercase">History</div>
          <h1 className="text-4xl text-stone-50">{messages.history.title}</h1>
          <p className="text-sm leading-7 text-stone-300/78">登录后保存的卦例将在这里呈现，可随时回看。</p>
        </div>
        <HistoryClient />
      </div>
    </SiteShell>
  );
}
