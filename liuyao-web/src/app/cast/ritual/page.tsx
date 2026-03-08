import { Suspense } from 'react';
import { SiteShell } from '@/components/site-shell';
import { RitualClient } from '@/components/cast/ritual-client';

export default function RitualPage() {
  return (
    <SiteShell>
      <Suspense fallback={<div className="text-sm text-stone-400">正在载入摇卦页…</div>}>
        <RitualClient />
      </Suspense>
    </SiteShell>
  );
}
