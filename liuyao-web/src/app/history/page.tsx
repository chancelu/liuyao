import { SiteShell } from '@/components/site-shell';
import { HistoryClient } from '@/components/history/history-client';
import { getMessages } from '@/lib/i18n';

const messages = getMessages();

export default function HistoryPage() {
  return (
    <SiteShell>
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="space-y-4">
          <div className="text-[10px] tracking-[0.5em] text-[var(--gold-dim)] uppercase">History</div>
          <h1 className="font-display text-3xl font-extralight tracking-wide text-[var(--cream)]">{messages.history.title}</h1>
          <div className="gold-divider w-10" />
          <p className="text-sm text-[var(--stone)]">登录后保存的卦例将在这里呈现，可随时回看。</p>
        </div>
        <HistoryClient />
      </div>
    </SiteShell>
  );
}
