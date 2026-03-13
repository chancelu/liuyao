import { Suspense } from 'react';

export const dynamic = 'force-dynamic';
import { SiteShell } from '@/components/site-shell';
import { getMessages } from '@/lib/i18n';
import { AskForm } from '@/components/cast/ask-form';

const messages = getMessages();

export default function CastAskPage() {
  return (
    <SiteShell>
      <div className="glow-top mx-auto max-w-4xl">
        <div className="relative rounded-2xl border border-[rgba(196,149,107,0.08)] bg-[var(--bg-card)] p-8 md:p-10">
          <div className="space-y-3">
            <div className="text-[10px] tracking-[0.4em] text-[var(--gold)] uppercase">起卦</div>
            <h1 className="font-display text-3xl font-extralight text-[var(--text-primary)]">{messages.ask.title}</h1>
            <div className="h-px w-10 bg-[var(--gold-dim)]" />
            <p className="text-sm leading-7 text-[var(--text-muted)]">{messages.ask.description}</p>
          </div>
          <Suspense fallback={<div className="mt-10 text-sm text-[var(--text-dim)]">正在载入起卦表单…</div>}>
            <AskForm />
          </Suspense>
        </div>
      </div>
    </SiteShell>
  );
}
