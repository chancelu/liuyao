'use client';

import { useCallback, useMemo, useState } from 'react';
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

const YAO_NAMES = ['初爻', '二爻', '三爻', '四爻', '五爻', '上爻'];

export function RitualClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [lines, setLines] = useState<CastLine[]>([]);
  const [lastLabel, setLastLabel] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);

  const draft: DivinationDraft | null = useMemo(() => {
    const parsed = getCurrentDraft();
    if (!parsed) return null;
    if (id && parsed.id === id) return parsed;
    return parsed;
  }, [id]);

  const nextLineNumber = lines.length + 1;
  const isComplete = lines.length === 6;
  const trialState = useMemo(() => getOrCreateGuestSession(), []);

  const handleCast = useCallback(() => {
    if (!draft) {
      setError('没有找到当前问题，请先回到起卦页。');
      return;
    }

    if (isComplete || isShaking) return;

    setIsShaking(true);
    setShakeKey((k) => k + 1);
    setLastLabel('');

    setTimeout(() => {
      const next = CAST_OPTIONS[Math.floor(Math.random() * CAST_OPTIONS.length)];
      setLines((current) => [...current, next]);
      setLastLabel(CAST_LABELS[next]);
      setError('');
      setIsShaking(false);
    }, 900);
  }, [draft, isComplete, isShaking]);

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
    <div className="glow-ritual mx-auto grid max-w-6xl gap-12 rounded-[32px] lg:grid-cols-[0.65fr_1.35fr] lg:items-start">
      {/* Left — Info & Progress */}
      <div className="animate-fade-in-up space-y-6">
        <div className="text-xs tracking-[0.35em] text-[var(--jade-cyan-soft)] uppercase">Ritual</div>
        <h1 className="text-4xl leading-tight font-light tracking-wide text-[var(--moon-silver)]">
          {messages.cast.title}
        </h1>
        <p className="text-sm leading-8 text-[var(--text-muted)]">
          {draft?.question ?? messages.cast.subtitle}
        </p>
        <div className="text-xs text-[var(--text-dim)]">会话：{trialState.id}</div>

        {/* Progress Panel */}
        <div className="card-glass rounded-[22px] p-6">
          <div className="mb-4 text-xs tracking-[0.25em] text-[var(--jade-cyan-soft)] uppercase">Progress</div>
          <div className="mb-5 text-sm text-[var(--moon-silver-soft)]">
            {messages.cast.progress.replace('{current}', String(Math.min(nextLineNumber, 6)))}
          </div>
          <div className="flex flex-col gap-2">
            {Array.from({ length: 6 }).map((_, index) => {
              const isDone = index < lines.length;
              const isCurrent = index === lines.length;
              return (
                <div
                  key={index}
                  className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-xs transition-all duration-300 ${
                    isDone
                      ? 'border border-[rgba(122,173,160,0.15)] bg-[rgba(122,173,160,0.06)] text-[var(--jade-cyan)]'
                      : isCurrent
                        ? 'border border-[rgba(200,205,216,0.15)] bg-[rgba(200,205,216,0.04)] text-[var(--moon-silver)]'
                        : 'border border-transparent text-[var(--text-dim)]'
                  }`}
                >
                  <div
                    className={`h-1.5 w-1.5 rounded-full ${
                      isDone
                        ? 'bg-[var(--jade-cyan)]'
                        : isCurrent
                          ? 'animate-gentle-pulse bg-[var(--moon-silver)]'
                          : 'bg-[var(--text-dim)]'
                    }`}
                  />
                  <span>{YAO_NAMES[index]}</span>
                  {isDone && <span className="ml-auto text-[var(--jade-cyan-soft)]">{CAST_LABELS[lines[index]]}</span>}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right — Ritual Stage */}
      <div className="card-glass animate-fade-in-up delay-200 rounded-[32px] p-8 md:p-10">
        <div className="mx-auto flex max-w-xl flex-col items-center gap-10 text-center">
          {/* Copper Coins */}
          <div className="grid grid-cols-3 gap-8">
            {[1, 2, 3].map((coin) => (
              <div
                key={`${coin}-${shakeKey}`}
                className={`flex h-28 w-28 items-center justify-center rounded-full border border-[rgba(176,154,106,0.25)] bg-[radial-gradient(circle_at_30%_30%,rgba(176,154,106,0.15),rgba(200,205,216,0.04))] text-xs tracking-widest text-[var(--dark-gold)] shadow-[0_0_20px_rgba(176,154,106,0.08),0_4px_16px_rgba(0,0,0,0.20)] ${isShaking ? 'animate-coin-shake' : 'animate-slow-float'}`}
                style={{ animationDelay: isShaking ? `${(coin - 1) * 80}ms` : `${coin * 400}ms` }}
              >
                铜钱 {coin}
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div className="w-full max-w-xs">
            <div className="mb-2 flex justify-between text-xs text-[var(--text-dim)]">
              <span>进度</span>
              <span>{lines.length} / 6</span>
            </div>
            <div className="h-1 w-full overflow-hidden rounded-full bg-[rgba(200,205,216,0.08)]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[var(--jade-cyan-soft)] to-[var(--jade-cyan)] transition-all duration-500 ease-out"
                style={{ width: `${(lines.length / 6) * 100}%` }}
              />
            </div>
          </div>

          {/* Status */}
          <div className="space-y-3">
            <div className="text-sm text-[var(--moon-silver-soft)]">
              {isShaking ? '正在摇卦…' : isComplete ? '六次摇卦完成，可以生成排盘了。' : '请专注你想问的事情，然后摇出这一爻。'}
            </div>
            <div className={`text-xs tracking-[0.3em] uppercase transition-all duration-300 ${lastLabel && !isShaking ? 'text-[var(--jade-cyan)]' : 'text-[var(--text-dim)]'}`}>
              {isShaking ? '…' : lastLabel || '少阳 / 少阴 / 老阳 / 老阴'}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              className="btn-primary rounded-full px-8 py-3.5 text-sm tracking-wide disabled:cursor-not-allowed disabled:opacity-40"
              onClick={handleCast}
              disabled={isComplete || isSubmitting || isShaking}
            >
              {isShaking ? '摇卦中…' : isComplete ? messages.cast.completed : messages.cast.cta}
            </button>
            <button
              className="btn-secondary rounded-full px-8 py-3.5 text-sm tracking-wide"
              onClick={handleReset}
            >
              {messages.cast.reset}
            </button>
          </div>

          {/* Continue Link */}
          <button
            onClick={handleContinue}
            className="text-sm text-[var(--text-muted)] underline-offset-4 transition-colors duration-200 hover:text-[var(--foreground)] hover:underline disabled:cursor-not-allowed disabled:opacity-40"
            disabled={isSubmitting}
          >
            {isSubmitting ? '正在生成排盘…' : '生成排盘与结果'}
          </button>

          {error ? (
            <div className="rounded-xl border border-[rgba(139,74,74,0.20)] bg-[rgba(139,74,74,0.08)] px-4 py-3 text-sm text-[var(--error)]">
              {error}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
