import { SiteShell } from '@/components/site-shell';
import { HistoryClient } from '@/components/history/history-client';
import { getMessages } from '@/lib/i18n';

const messages = getMessages();

export default function HistoryPage() {
  return (
    <SiteShell>
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="space-y-4">
          <div className="text-[10px] tracking-[0.4em] text-[var(--text-dim)] uppercase">History</div>
          <h1 className="font-display text-3xl font-extralight text-white">{messages.history.title}</h1>
          <div className="h-px w-10 bg-[var(--gold-dim)]" />
          <p className="text-sm text-[var(--text-muted)]">登录后保存的卦例将在这里呈现，可随时回看。</p>
        </div>
        <HistoryClient />
      </div>
    </SiteShell>
  );
}
