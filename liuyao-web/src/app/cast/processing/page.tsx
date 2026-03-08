import { Suspense } from 'react';
import { SiteShell } from '@/components/site-shell';
import { ProcessingClient } from '@/components/cast/processing-client';

export default function ProcessingPage() {
  return (
    <SiteShell>
      <Suspense fallback={<div className="text-sm text-stone-400">正在载入推演流程…</div>}>
        <ProcessingClient />
      </Suspense>
    </SiteShell>
  );
}
