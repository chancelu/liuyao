import { Suspense } from 'react';

export const dynamic = 'force-dynamic';
import { SiteShell } from '@/components/site-shell';
import { LoginContent } from './login-content';

export default function LoginPage() {
  return (
    <SiteShell>
      <div className="mx-auto max-w-md py-16">
        <div className="mb-12 text-center">
          <div className="mb-6 font-display text-4xl text-[var(--gold)]">爻</div>
          <h1 className="font-display text-xl font-extralight tracking-[0.1em] text-[var(--text-primary)]">入</h1>
          <div className="mx-auto mt-4 h-px w-8 bg-[rgba(196,149,107,0.15)]" />
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-8">
          <Suspense fallback={<div className="text-center text-sm text-[var(--text-dim)]">…</div>}>
            <LoginContent />
          </Suspense>
        </div>
      </div>
    </SiteShell>
  );
}
