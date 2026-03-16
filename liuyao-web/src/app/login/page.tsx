'use client';

import { Suspense } from 'react';
import { SiteShell } from '@/components/site-shell';
import { LoginContent } from './login-content';
import { useI18n } from '@/lib/i18n';

export default function LoginPage() {
  const { messages } = useI18n();
  return (
    <SiteShell>
      <div className="mx-auto max-w-md py-8 sm:py-16">
        <div className="mb-8 text-center sm:mb-12">
          <div className="mb-6 font-display text-4xl text-[var(--gold)]">{messages.pages.login.symbol}</div>
          <h1 className="font-display text-xl font-extralight tracking-[0.1em] text-[var(--text-primary)]">{messages.pages.login.title}</h1>
          <div className="mx-auto mt-4 h-px w-8 bg-[rgba(196,149,107,0.15)]" />
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5 sm:p-8">
          <Suspense fallback={<div className="text-center text-sm text-[var(--text-dim)]">{messages.pages.login.loading}</div>}>
            <LoginContent />
          </Suspense>
        </div>
      </div>
    </SiteShell>
  );
}
