'use client';

import Link from 'next/link';
import { useI18n } from '@/lib/i18n';

interface ShareClientProps {
  isPublic: boolean;
  result: {
    summary: string;
    primaryHexagram: string;
    changedHexagram?: string;
    plainAnalysis: string;
  } | null;
  draft: {
    question: string;
    category: string;
  } | null;
}

export function ShareClient({ isPublic, result, draft }: ShareClientProps) {
  const { messages } = useI18n();

  if (!isPublic || !result || !draft) {
    return (
      <div className="mx-auto max-w-4xl rounded-[32px] border border-white/10 bg-white/5 p-8 text-center backdrop-blur">
        <div className="space-y-4">
          <div className="text-xs tracking-[0.3em] text-stone-400 uppercase">Share</div>
          <h1 className="text-3xl text-stone-50">{messages.share.notPublic}</h1>
          <p className="mx-auto max-w-2xl text-sm leading-7 text-stone-300/78">
            {messages.share.notPublicDesc}
          </p>
        </div>
        <Link href="/cast" className="mt-8 inline-flex rounded-full border border-emerald-200/25 bg-emerald-100/10 px-6 py-3 text-sm text-white hover:bg-emerald-100/15">
          {messages.share.tryCast}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="rounded-[32px] border border-white/10 bg-white/5 p-8 backdrop-blur">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-white/10 px-2.5 py-0.5 text-xs text-stone-400">
              {messages.ask.categories[draft.category as keyof typeof messages.ask.categories] ?? draft.category}
            </span>
            <span className="text-xs tracking-[0.2em] text-stone-500 uppercase">{messages.share.liuyaoShare}</span>
          </div>
          <p className="text-lg text-stone-100">{draft.question}</p>
        </div>
      </div>

      <div className="rounded-[32px] border border-emerald-100/12 bg-emerald-100/6 p-8 backdrop-blur">
        <div className="mb-3 text-xs tracking-[0.2em] text-stone-400 uppercase">{messages.share.summary}</div>
        <div className="text-2xl leading-relaxed text-stone-50">{result.summary}</div>
        <div className="mt-4 text-sm text-stone-400">
          {result.primaryHexagram}
          {result.changedHexagram ? ` → ${result.changedHexagram}` : ''}
        </div>
      </div>

      <div className="rounded-[28px] border border-white/10 bg-white/5 p-8 backdrop-blur">
        <div className="mb-4 text-xs tracking-[0.2em] text-stone-400 uppercase">{messages.share.plainAnalysis}</div>
        <p className="text-sm leading-8 text-stone-300">{result.plainAnalysis}</p>
      </div>

      <div className="text-center">
        <Link
          href="/cast"
          className="inline-flex rounded-full border border-emerald-200/25 bg-emerald-100/10 px-8 py-3 text-sm text-white hover:bg-emerald-100/15"
        >
          {messages.share.tryCast}
        </Link>
      </div>
    </div>
  );
}
