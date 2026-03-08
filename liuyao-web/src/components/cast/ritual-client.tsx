'use client';

import { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getMessages } from '@/lib/i18n';
import { getCurrentDraft, getOrCreateGuestSession } from '@/lib/storage/draft-storage';
import { submitCastFlow } from '@/services/divination-api';
import type { CastLine, DivinationDraft } from '@/lib/types';

const messages = getMessages();
const CAST_OPTIONS: CastLine[] = ['old_yin', 'young_yin', 'young_yang', 'old_yang'];
const CAST_LABELS: Record<CastLine, string> = {
  old_yin: '老阴',
  young_yin: '少阴',
  young_yang: '少阳',
  old_yang: '老阳',
};

export function RitualClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [lines, setLines] = useState<CastLine[]>([]);
  const [lastLabel, setLastLabel] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const draft: DivinationDraft | null = useMemo(() => {
    const parsed = getCurrentDraft();
    if (!parsed) return null;
    if (id && parsed.id === id) return parsed;
    return parsed;
  }, [id]);

  const nextLineNumber = lines.length + 1;
  const isComplete = lines.length === 6;
  const trialState = useMemo(() => getOrCreateGuestSession(), []);

  const handleCast = () => {
    if (!draft) {
      setError('没有找到当前问题，请先回到起卦页。');
      return;
    }

    if (isComplete) return;

    const next = CAST_OPTIONS[Math.floor(Math.random() * CAST_OPTIONS.length)];
    setLines((current) => [...current, next]);
    setLastLabel(CAST_LABELS[next]);
    setError('');
  };

  const handleReset = () => {
    setLines([]);
    setLastLabel('');
    setError('');
  };

  const handleContinue = async () => {
    if (!draft) {
      setError('没有找到当前问题，请先回到起卦页。');
      return;
    }

    if (!isComplete) {
      setError('还没有完成六次摇卦。');
      return;
    }

    setIsSubmitting(true);
    setError('');
    const response = await submitCastFlow(lines);
    setIsSubmitting(false);

    if (!response.ok) {
      setError(response.error);
      return;
    }

    router.push(`/cast/processing?id=${draft.id}`);
  };

  return (
    <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:items-center">
      <div className="space-y-4">
        <div className="text-xs tracking-[0.3em] text-stone-400 uppercase">Ritual</div>
        <h1 className="text-4xl leading-tight text-stone-50">{messages.cast.title}</h1>
        <p className="text-sm leading-7 text-stone-300/78">{draft?.question ?? messages.cast.subtitle}</p>
        <div className="text-xs text-stone-500">游客会话：{trialState.id}</div>
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 text-sm leading-7 text-stone-300">
          <div className="mb-3 text-xs tracking-[0.2em] text-stone-500 uppercase">Progress</div>
          {messages.cast.progress.replace('{current}', String(Math.min(nextLineNumber, 6)))}
          <div className="mt-4 flex flex-wrap gap-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className={`rounded-full px-3 py-1 text-xs ${index < lines.length ? 'bg-emerald-100/12 text-emerald-50' : 'bg-white/5 text-stone-500'}`}
              >
                第 {index + 1} 爻
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="rounded-[36px] border border-white/10 bg-white/5 p-8 backdrop-blur md:p-10">
        <div className="mx-auto flex max-w-xl flex-col items-center gap-8 text-center">
          <div className="grid grid-cols-3 gap-6">
            {[1, 2, 3].map((coin) => (
              <div key={coin} className="flex h-28 w-28 items-center justify-center rounded-full border border-emerald-100/20 bg-[radial-gradient(circle_at_top,_rgba(222,241,236,0.15),_rgba(255,255,255,0.02))] text-sm text-stone-300 shadow-lg shadow-black/20">
                铜钱 {coin}
              </div>
            ))}
          </div>
          <div className="space-y-3">
            <div className="text-sm text-stone-300">请专注你想问的事情，然后摇出这一爻。</div>
            <div className="text-xs tracking-[0.25em] text-stone-500 uppercase">{lastLabel || '少阳 / 少阴 / 老阳 / 老阴'}</div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              className="rounded-full border border-emerald-200/25 bg-emerald-100/10 px-6 py-3 text-sm text-white hover:bg-emerald-100/15 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={handleCast}
              disabled={isComplete || isSubmitting}
            >
              {isComplete ? messages.cast.completed : messages.cast.cta}
            </button>
            <button className="rounded-full border border-white/10 px-6 py-3 text-sm text-stone-200 hover:border-white/20" onClick={handleReset}>
              {messages.cast.reset}
            </button>
          </div>
          <button
            onClick={handleContinue}
            className="text-sm text-stone-400 underline-offset-4 hover:text-stone-200 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? '正在生成排盘…' : '生成排盘与结果'}
          </button>
          {error ? <div className="text-sm text-amber-200">{error}</div> : null}
        </div>
      </div>
    </div>
  );
}
