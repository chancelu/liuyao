'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getMessages } from '@/lib/i18n';

const messages = getMessages();

const PROGRESS_STAGES = [
  { label: '正在排盘…', duration: 2000 },
  { label: '分析卦象结构…', duration: 3000 },
  { label: '解读动爻变化…', duration: 5000 },
  { label: '综合分析中…', duration: 10000 },
  { label: '生成解读报告…', duration: 15000 },
];

export function ProcessingClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [progress, setProgress] = useState(0);
  const [stageIndex, setStageIndex] = useState(0);
  const [error, setError] = useState('');
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const analysisStarted = useRef(false);

  // Smooth progress animation
  useEffect(() => {
    if (!id) {
      router.replace('/cast');
      return;
    }

    let animFrame: number;
    const startTime = Date.now();
    // Total fake progress time: 90 seconds max, but we slow down near the end
    const maxFakeTime = 90000;

    function tick() {
      const elapsed = Date.now() - startTime;
      // Progress goes from 0 to 95 over maxFakeTime, slowing down as it approaches 95
      const rawProgress = Math.min(95, (elapsed / maxFakeTime) * 100);
      // Ease out: fast at start, slow near end
      const easedProgress = 95 * (1 - Math.pow(1 - rawProgress / 95, 2.5));
      setProgress(Math.min(95, easedProgress));

      // Update stage label
      let accumulated = 0;
      for (let i = 0; i < PROGRESS_STAGES.length; i++) {
        accumulated += PROGRESS_STAGES[i].duration;
        if (elapsed < accumulated) {
          setStageIndex(i);
          break;
        }
        if (i === PROGRESS_STAGES.length - 1) {
          setStageIndex(i);
        }
      }

      if (!analysisComplete && elapsed < maxFakeTime) {
        animFrame = requestAnimationFrame(tick);
      }
    }

    animFrame = requestAnimationFrame(tick);

    return () => {
      if (animFrame) cancelAnimationFrame(animFrame);
    };
  }, [id, router, analysisComplete]);

  // When analysis completes, animate to 100% and navigate
  useEffect(() => {
    if (!analysisComplete || !id) return;

    // Animate progress to 100%
    setProgress(100);
    const timer = setTimeout(() => {
      router.replace(`/result/${id}`);
    }, 600);

    return () => clearTimeout(timer);
  }, [analysisComplete, id, router]);

  // Call analysis API
  useEffect(() => {
    if (!id || analysisStarted.current) return;
    analysisStarted.current = true;

    async function runAnalysis() {
      try {
        const response = await fetch('/api/analysis', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ divinationId: id }),
        });

        if (!response.ok) {
          const data = await response.json().catch(() => null);
          console.warn('[processing] Analysis API error:', data);
          // Still mark complete — result page will show whatever data is available
        }
      } catch (err) {
        console.warn('[processing] Analysis fetch failed:', err);
      }

      setAnalysisComplete(true);
    }

    void runAnalysis();
  }, [id]);

  // Safety timeout: if analysis takes more than 120 seconds, go to result anyway
  useEffect(() => {
    if (!id) return;
    const timer = setTimeout(() => {
      if (!analysisComplete) {
        console.warn('[processing] Safety timeout reached, navigating to result');
        setAnalysisComplete(true);
      }
    }, 120000);
    return () => clearTimeout(timer);
  }, [id, analysisComplete]);

  const currentStage = PROGRESS_STAGES[stageIndex];

  return (
    <div className="mx-auto max-w-lg text-center py-20">
      <div className="space-y-4">
        <div className="text-[10px] tracking-[0.4em] text-[var(--text-dim)] uppercase">Processing</div>
        <h1 className="font-display text-3xl font-extralight text-white">{messages.processing.title}</h1>
        <div className="mx-auto h-px w-12 bg-[var(--gold-dim)]" />
      </div>

      {/* Progress bar */}
      <div className="mt-16 space-y-4">
        <div className="relative h-1 w-full overflow-hidden rounded-full bg-[rgba(255,255,255,0.06)]">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[var(--gold-dim)] to-[var(--gold)] transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-[var(--text-muted)] transition-all duration-300">
            {currentStage.label}
          </span>
          <span className="font-mono text-[var(--gold-dim)]">
            {Math.round(progress)}%
          </span>
        </div>
      </div>

      {/* Stage indicators */}
      <div className="mt-12 grid gap-2 text-left">
        {PROGRESS_STAGES.map((stage, index) => (
          <div
            key={stage.label}
            className={`flex items-center gap-3 rounded-lg px-4 py-2.5 transition-all duration-300 ${
              index < stageIndex
                ? 'text-[var(--text-muted)]'
                : index === stageIndex
                  ? 'bg-[var(--bg-card)] text-white'
                  : 'text-[var(--text-dim)]'
            }`}
          >
            <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${
              index < stageIndex
                ? 'bg-[rgba(255,255,255,0.06)] text-[var(--gold)]'
                : index === stageIndex
                  ? 'bg-[var(--gold-dim)] text-white'
                  : 'bg-[rgba(255,255,255,0.03)] text-[var(--text-dim)]'
            }`}>
              {index < stageIndex ? '✓' : index + 1}
            </span>
            <span className="text-sm">{stage.label}</span>
          </div>
        ))}
      </div>

      <p className="mt-10 text-xs text-[var(--text-dim)]">
        AI 正在深度分析你的卦象，通常需要 15-30 秒，请耐心等待…
      </p>

      {error && (
        <div className="mt-6 rounded-xl bg-[var(--bg-card)] px-5 py-3 text-sm text-[var(--error)]">
          {error}
        </div>
      )}
    </div>
  );
}
