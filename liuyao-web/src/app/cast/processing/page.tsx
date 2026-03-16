'use client';

import { Suspense } from 'react';
import { SiteShell } from '@/components/site-shell';
import { ProcessingClient } from '@/components/cast/processing-client';
import { useI18n } from '@/lib/i18n';

export const dynamic = 'force-dynamic';

export default function ProcessingPage() {
  const { messages } = useI18n();
  return (
    <SiteShell>
      <Suspense fallback={<div className="text-sm text-stone-400">{messages.pages.processing.loading}</div>}>
        <ProcessingClient />
      </Suspense>
    </SiteShell>
  );
}
