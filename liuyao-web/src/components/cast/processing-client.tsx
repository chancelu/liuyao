'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getMessages } from '@/lib/i18n';
import { getResultById, setResultById } from '@/lib/storage/draft-storage';
import { buildPromptFromResult } from '@/lib/analysis/build-prompt';
import type { MockResult } from '@/lib/types';

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

  // Smooth progress animation — slow easing that never stalls visually
  useEffect(() => {
    if (!id) {
      router.replace('/cast');
      return;
    }

    let animFrame: number;
    const startTime = Date.now();

    function tick() {
      const elapsed = Date.now() - startTime;
      // Logarithmic curve: fast at start, slows down, caps at 92%
      // Reaches ~50% at 8s, ~75% at 20s, ~88% at 45s, ~92% at 90s
      const t = elapsed / 1000;
      const rawProgress = Math.min(92, 30 * Math.log(1 + t / 3));
      setProgress(rawProgress);

      // Update stage based on progress thresholds
      if (rawProgress < 10) setStageIndex(0);
      else if (rawProgress < 30) setStageIndex(1);
      else if (rawProgress < 55) setStageIndex(2);
      else if (rawProgress < 80) setStageIndex(3);
      else setStageIndex(4);

      if (!analysisComplete) {
        animFrame = requestAnimationFrame(tick);
      }
    }

    animFrame = requestAnimationFrame(tick);
    return () => { if (animFrame) cancelAnimationFrame(animFrame); };
  }, [id, router, analysisComplete]);

  // When analysis completes, animate to 100% and navigate
  useEffect(() => {
    if (!analysisComplete || !id) return;

    // Animate from current progress to 100%
    let animFrame: number;
    const startVal = progress;
    const startTime = Date.now();
    const duration = 500;

    function animate() {
      const elapsed = Date.now() - startTime;
      const t = Math.min(1, elapsed / duration);
      setProgress(startVal + (100 - startVal) * t);
      if (t < 1) {
        animFrame = requestAnimationFrame(animate);
      } else {
        setTimeout(() => router.replace(`/result/${id}`), 300);
      }
    }

    animFrame = requestAnimationFrame(animate);
    return () => { if (animFrame) cancelAnimationFrame(animFrame); };
  }, [analysisComplete, id, router]);

  // Call LLM via lightweight proxy, then save result
  useEffect(() => {
    if (!id || analysisStarted.current) return;
    analysisStarted.current = true;

    async function runAnalysis() {
      try {
        // Get the result from localStorage (saved by submitCastFlow)
        const result = getResultById(id!);
        if (!result || !result.chart) {
          console.warn('[processing] No result/chart in localStorage, falling back to server analysis');
          // Fallback: call the old analysis API
          await fetch('/api/analysis', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ divinationId: id }),
          });
          setAnalysisComplete(true);
          return;
        }

        // Build prompt from local data
        const prompt = buildPromptFromResult(result as MockResult);
        if (!prompt) {
          console.warn('[processing] Could not build prompt');
          setAnalysisComplete(true);
          return;
        }

        // Call lightweight LLM proxy (edge runtime, no DB)
        const llmRes = await fetch('/api/llm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt }),
        });

        if (llmRes.ok) {
          const llmData = await llmRes.json() as {
            success: boolean;
            data?: { summary: string; plainAnalysis: string; professionalAnalysis: string };
          };

          if (llmData.success && llmData.data) {
            // Update local result with AI analysis
            const updatedResult = {
              ...result,
              summary: llmData.data.summary,
              plainAnalysis: llmData.data.plainAnalysis,
              professionalAnalysis: llmData.data.professionalAnalysis,
              isAI: true,
            };
            setResultById(id!, updatedResult);

            // Also persist to server (fire and forget)
            fetch('/api/analysis', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ divinationId: id }),
            }).catch(() => {});
          }
        } else {
          console.warn('[processing] LLM proxy failed, trying server analysis');
          await fetch('/api/analysis', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ divinationId: id }),
          }).catch(() => {});
        }
      } catch (err) {
        console.warn('[processing] Analysis failed:', err);
      }

      setAnalysisComplete(true);
    }

    void runAnalysis();
  }, [id]);

  // Safety timeout
  useEffect(() => {
    if (!id) return;
    const timer = setTimeout(() => {
      if (!analysisComplete) {
        console.warn('[processing] Safety timeout');
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
