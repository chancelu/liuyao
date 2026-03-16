'use client';

import { Suspense } from 'react';
import { SiteShell } from '@/components/site-shell';
import { RitualClient } from '@/components/cast/ritual-client';
import { useI18n } from '@/lib/i18n';

export const dynamic = 'force-dynamic';

export default function RitualPage() {
  const { messages } = useI18n();
  return (
    <SiteShell>
      <Suspense fallback={<div className="text-sm text-[var(--text-dim)]">{messages.pages.ritual.loading}</div>}>
        <RitualClient />
      </Suspense>
    </SiteShell>
  );
}
