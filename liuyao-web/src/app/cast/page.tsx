import { Suspense } from 'react';
import { SiteShell } from '@/components/site-shell';
import { getMessages } from '@/lib/i18n';
import { AskForm } from '@/components/cast/ask-form';

const messages = getMessages();

export default function CastAskPage() {
  return (
    <SiteShell>
      <div className="mx-auto max-w-4xl rounded-[32px] border border-white/10 bg-white/5 p-8 backdrop-blur md:p-10">
        <div className="space-y-3">
          <div className="text-xs tracking-[0.3em] text-stone-400 uppercase">Ask</div>
          <h1 className="text-4xl text-stone-50">{messages.ask.title}</h1>
          <p className="text-sm leading-7 text-stone-300/80">{messages.ask.description}</p>
        </div>
        <Suspense fallback={<div className="mt-10 text-sm text-stone-400">正在载入起卦表单…</div>}>
          <AskForm />
        </Suspense>
      </div>
    </SiteShell>
  );
}
