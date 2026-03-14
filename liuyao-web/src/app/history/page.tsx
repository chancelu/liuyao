import { Suspense } from 'react';
import { SiteShell } from '@/components/site-shell';
import { HistoryClient } from '@/components/history/history-client';

export default function HistoryPage() {
  return (
    <SiteShell>
      <div className="glow-top mx-auto max-w-2xl">
        <div className="mb-8 text-center sm:mb-16">
          <div className="mb-4 text-[10px] tracking-[0.5em] text-[var(--gold)] uppercase">往卦</div>
          <h1 className="font-display text-3xl font-extralight tracking-[0.08em] text-[var(--text-primary)]">
            历史记录
          </h1>
          <div className="mx-auto mt-6 h-px w-8 bg-[rgba(196,149,107,0.15)]" />
        </div>
        <Suspense fallback={<div className="text-center text-sm text-[var(--text-dim)]">…</div>}>
          <HistoryClient />
        </Suspense>
      </div>
    </SiteShell>
  );
}
