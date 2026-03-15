'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useI18n } from '@/lib/i18n';
import { getResultById, setResultById } from '@/lib/storage/draft-storage';
import { buildPromptFromResult } from '@/lib/analysis/build-prompt';
import { callLLMStream } from '@/lib/api/llm-stream';
import type { MockResult } from '@/lib/types';

const PROGRESS_STAGES = [
  { label: '正在排盘…', threshold: 0 },
  { label: '分析卦象结构…', threshold: 20 },
  { label: '解读动爻变化…', threshold: 40 },
  { label: '综合分析中…', threshold: 60 },
  { label: '生成解读报告…', threshold: 80 },
];

export function ProcessingClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const { messages } = useI18n();
  const [progress, setProgress] = useState(0);
  const [stageIndex, setStageIndex] = useState(0);
  const [error, setError] = useState('');
  const analysisStarted = useRef(false);
  const analysisComplete = useRef(false);
  const navigated = useRef(false);
  const progressRef = useRef(0);

  // Keep progressRef in sync
  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  // Smooth progress animation
  useEffect(() => {
    if (!id) {
      router.replace('/cast');
      return;
    }

    let animFrame: number;
    const startTime = Date.now();

    function tick() {
      if (navigated.current) return;

      const elapsed = Date.now() - startTime;
      const t = elapsed / 1000;

      let rawProgress: number;
      if (analysisComplete.current) {
        // Analysis done — animate quickly to 100%
        const completedAt = progressRef.current;
        rawProgress = completedAt + (100 - completedAt) * Math.min(1, (t - elapsed / 1000 + 0.5) / 0.5);
        // Simple: just jump toward 100
        rawProgress = Math.min(100, progressRef.current + 2);
      } else if (t < 3) {
        rawProgress = 40 * (1 - Math.pow(1 - t / 3, 3));
      } else {
        rawProgress = 40 + 52 * (1 - Math.exp(-(t - 3) / 20));
      }

      rawProgress = Math.min(100, rawProgress);
      setProgress(rawProgress);
      progressRef.current = rawProgress;

      // Update stage — sync with progress bar
      const newStage = rawProgress >= 80 ? 4 : rawProgress >= 60 ? 3 : rawProgress >= 40 ? 2 : rawProgress >= 20 ? 1 : 0;
      setStageIndex(newStage);

      // Navigate when we hit 100
      if (rawProgress >= 99.5 && analysisComplete.current && !navigated.current) {
        navigated.current = true;
        setTimeout(() => router.replace(`/result/${id}`), 300);
        return;
      }

      animFrame = requestAnimationFrame(tick);
    }

    animFrame = requestAnimationFrame(tick);
    return () => { if (animFrame) cancelAnimationFrame(animFrame); };
  }, [id, router]);

  // Call LLM via lightweight proxy, then save result
  useEffect(() => {
    if (!id || analysisStarted.current) return;
    analysisStarted.current = true;

    async function runAnalysis() {
      try {
        const result = getResultById(id!);
        if (!result || !result.chart) {
          console.warn('[processing] No result/chart in localStorage, falling back to server analysis');
          await fetch('/api/analysis', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ divinationId: id }),
          });
          analysisComplete.current = true;
          return;
        }

        const prompt = buildPromptFromResult(result as MockResult);
        if (!prompt) {
          console.warn('[processing] Could not build prompt');
          analysisComplete.current = true;
          return;
        }

        const llmData = await callLLMStream(prompt);

        if (llmData) {
          const updatedResult = {
            ...result,
            summary: llmData.summary,
            plainAnalysis: llmData.plainAnalysis,
            professionalAnalysis: llmData.professionalAnalysis,
            isAI: true,
          };
          setResultById(id!, updatedResult);

          fetch('/api/analysis', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ divinationId: id }),
          }).catch(() => {});
        } else {
          console.warn('[processing] LLM stream returned no data');
        }
      } catch (err) {
        console.warn('[processing] Analysis failed:', err);
      }

      analysisComplete.current = true;
    }

    void runAnalysis();
  }, [id]);

  // Safety timeout
  useEffect(() => {
    if (!id) return;
    const timer = setTimeout(() => {
      if (!analysisComplete.current) {
        console.warn('[processing] Safety timeout');
        analysisComplete.current = true;
      }
    }, 120000);
    return () => clearTimeout(timer);
  }, [id]);

  const currentStage = PROGRESS_STAGES[stageIndex];

  return (
    <div className="hexagram-bg mx-auto max-w-lg text-center py-20">
      <div className="relative z-10 space-y-4">
        <div className="text-[10px] tracking-[0.4em] text-[var(--text-dim)] uppercase">Processing</div>
        <h1 className="font-display text-3xl font-extralight text-white">{messages.processing.title}</h1>
        <div className="mx-auto h-px w-12 bg-[var(--gold-dim)]" />
      </div>

      {/* Progress bar */}
      <div className="relative z-10 mt-12 space-y-3">
        <div className="relative h-1 w-full overflow-hidden rounded-full bg-[rgba(255,255,255,0.06)]">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[var(--gold-dim)] to-[var(--gold)] transition-[width] duration-200"
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
