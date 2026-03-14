'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getMessages } from '@/lib/i18n';
import { getCurrentDraft, getOrCreateGuestSession } from '@/lib/storage/draft-storage';
import { submitCastFlow } from '@/services/divination-api';
import { track } from '@/lib/analytics';
import { playCoinSound } from '@/lib/audio/coin-sound';
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
  const [coinFaces, setCoinFaces] = useState<boolean[]>([false, false, false]); // true = back (面), false = front (字)

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
    playCoinSound();

    setTimeout(() => {
      const next = CAST_OPTIONS[Math.floor(Math.random() * CAST_OPTIONS.length)];
      // Generate coin faces matching the result
      // 字(front/false)=3, 面(back/true)=2
      // old_yang(9)=字字字, old_yin(6)=面面面, young_yang(7)=2字1面, young_yin(8)=1字2面
      let faces: boolean[];
      if (next === 'old_yang') {
        faces = [false, false, false];
      } else if (next === 'old_yin') {
        faces = [true, true, true];
      } else if (next === 'young_yang') {
        faces = [false, false, true];
        // shuffle
        faces.sort(() => Math.random() - 0.5);
      } else {
        faces = [true, true, false];
        faces.sort(() => Math.random() - 0.5);
      }
      setCoinFaces(faces);
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
    track('cast_complete');
  };

  return (
    <div className="mx-auto grid max-w-5xl gap-8 sm:gap-16 lg:grid-cols-[0.6fr_1.4fr] lg:items-start">
      {/* Left — Info & Progress */}
      <div className="animate-fade-in-up space-y-8">
        <div>
          <div className="text-[10px] tracking-[0.4em] text-[var(--text-dim)] uppercase">Ritual</div>
          <h1 className="font-display mt-3 text-3xl font-extralight text-white">
            {messages.cast.title}
          </h1>
          <p className="mt-4 text-sm leading-8 text-[var(--text-muted)]">
            {draft?.question ?? messages.cast.subtitle}
          </p>
        </div>

        {/* Progress */}
        <div className="card-solid rounded-xl p-6">
          <div className="mb-4 text-[10px] tracking-[0.3em] text-[var(--text-dim)] uppercase">Progress</div>
          <div className="mb-5 text-sm text-[var(--text-muted)]">
            {messages.cast.progress.replace('{current}', String(Math.min(nextLineNumber, 6)))}
          </div>
          <div className="flex flex-col gap-2">
            {Array.from({ length: 6 }).map((_, index) => {
              const isDone = index < lines.length;
              const isCurrent = index === lines.length;
              return (
                <div
                  key={index}
                  className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-xs transition-all duration-200 ${
                    isDone
                      ? 'bg-[var(--bg-elevated)] text-[var(--gold)]'
                      : isCurrent
                        ? 'bg-[var(--bg-elevated)] text-white'
                        : 'text-[var(--text-dim)]'
                  }`}
                >
                  <div
                    className={`h-1.5 w-1.5 rounded-full ${
                      isDone
                        ? 'bg-[var(--gold)]'
                        : isCurrent
                          ? 'bg-white'
                          : 'bg-[var(--text-dim)]'
                    }`}
                  />
                  <span>{YAO_NAMES[index]}</span>
                  {isDone && <span className="ml-auto text-[var(--text-dim)]">{CAST_LABELS[lines[index]]}</span>}
                </div>
              );
            })}
          </div>
        </div>

        <div className="text-[10px] text-[var(--text-dim)]">会话：{trialState.id}</div>
      </div>

      {/* Right — Ritual Stage */}
      <div className="card-solid animate-fade-in-up delay-200 rounded-2xl p-5 sm:p-8 md:p-12">
        <div className="mx-auto flex max-w-md flex-col items-center gap-8 text-center sm:gap-12">
          {/* Copper Coins — front (字/开元通宝) vs back (面/blank with lines) */}
          <div className="grid grid-cols-3 gap-5 sm:gap-10">
            {[1, 2, 3].map((coin) => {
              // After shaking, show random face per coin based on last cast result
              const showBack = !isShaking && lines.length > 0 && coinFaces[coin - 1];
              return (
                <div
                  key={`${coin}-${shakeKey}`}
                  className={`relative flex h-18 w-18 items-center justify-center rounded-full sm:h-24 sm:w-24 ${
                    isShaking ? 'animate-coin-shake' : ''
                  }`}
                  style={{
                    background: showBack
                      ? 'linear-gradient(145deg, #b8943e, #8a6828)'
                      : 'linear-gradient(145deg, #c9a84c, #a07830)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.4), inset 0 1px 2px rgba(255,220,130,0.3)',
                    animationDelay: isShaking ? `${coin * 60}ms` : undefined,
                  }}
                >
                  {/* Square hole in center */}
                  <div
                    className="flex h-7 w-7 items-center justify-center rounded-sm"
                    style={{
                      background: 'var(--bg-card)',
                      boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.5)',
                    }}
                  />
                  {/* Front face: 开元通宝 text */}
                  {!isShaking && !showBack && (
                    <>
                      <span className="absolute top-2 text-[11px] font-bold text-[#2a1f0e]">开</span>
                      <span className="absolute bottom-2 text-[11px] font-bold text-[#2a1f0e]">元</span>
                      <span className="absolute left-2.5 text-[11px] font-bold text-[#2a1f0e]">通</span>
                      <span className="absolute right-2.5 text-[11px] font-bold text-[#2a1f0e]">宝</span>
                    </>
                  )}
                  {/* Back face: decorative lines (no text) */}
                  {!isShaking && showBack && (
                    <>
                      <div className="absolute top-3.5 h-px w-8 bg-[rgba(42,31,14,0.4)]" />
                      <div className="absolute bottom-3.5 h-px w-8 bg-[rgba(42,31,14,0.4)]" />
                      <div className="absolute left-3.5 h-8 w-px bg-[rgba(42,31,14,0.4)]" />
                      <div className="absolute right-3.5 h-8 w-px bg-[rgba(42,31,14,0.4)]" />
                    </>
                  )}
                  {/* Rim */}
                  <div className="pointer-events-none absolute inset-0 rounded-full border-2 border-[rgba(255,220,130,0.25)]" />
                  {/* Face label */}
                  {!isShaking && lines.length > 0 && (
                    <span className="absolute -bottom-6 text-[10px] text-[var(--text-dim)]">
                      {showBack ? '面' : '字'}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Status */}
          <div className="space-y-3">
            <div className="text-sm text-[var(--text-muted)]">
              {isShaking ? '正在摇卦…' : isComplete ? '六次摇卦完成，可以生成排盘了。' : '请专注你想问的事情，然后摇出这一爻。'}
            </div>
            <div className={`font-display text-xs tracking-[0.3em] uppercase transition-all duration-200 ${lastLabel && !isShaking ? 'text-[var(--gold)]' : 'text-[var(--text-dim)]'}`}>
              {isShaking ? '…' : lastLabel || '少阳 / 少阴 / 老阳 / 老阴'}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 sm:flex-row">
            {isComplete ? (
              <button
                className="btn-primary rounded-full px-10 py-4 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                onClick={handleContinue}
                disabled={isSubmitting}
              >
                {isSubmitting ? '正在生成排盘…' : '六次已完成，生成排盘与结果'}
              </button>
            ) : (
              <button
                className="btn-primary rounded-full px-10 py-4 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                onClick={handleCast}
                disabled={isSubmitting || isShaking}
              >
                {isShaking ? '摇卦中…' : messages.cast.cta}
              </button>
            )}
            <button
              className="btn-secondary rounded-full px-8 py-4 text-sm"
              onClick={handleReset}
            >
              {messages.cast.reset}
            </button>
          </div>

          {error ? (
            <div className="rounded-xl bg-[var(--bg-elevated)] px-5 py-3 text-sm text-[var(--error)]">
              {error}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
