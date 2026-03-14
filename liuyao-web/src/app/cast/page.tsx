import { Suspense } from 'react';

export const dynamic = 'force-dynamic';
import { SiteShell } from '@/components/site-shell';
import { AskForm } from '@/components/cast/ask-form';

export default function CastAskPage() {
  return (
    <SiteShell>
      <div className="glow-top mx-auto max-w-2xl">
        <div className="relative py-4 sm:py-8">
          {/* Header */}
          <div className="mb-8 text-center sm:mb-16">
            <div className="mb-4 text-[10px] tracking-[0.5em] text-[var(--gold)] uppercase">起卦</div>
            <h1 className="font-display text-3xl font-extralight tracking-[0.08em] text-[var(--text-primary)]">
              心中所问
            </h1>
            <div className="mx-auto mt-6 h-px w-8 bg-[rgba(196,149,107,0.15)]" />
          </div>

          <Suspense fallback={<div className="text-center text-sm text-[var(--text-dim)]">…</div>}>
            <AskForm />
          </Suspense>
        </div>
      </div>
    </SiteShell>
  );
}
