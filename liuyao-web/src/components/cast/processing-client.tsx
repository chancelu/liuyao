'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getMessages } from '@/lib/i18n';

const messages = getMessages();

export function ProcessingClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [activeStep, setActiveStep] = useState(0);
  const [error] = useState('');
  const analysisStarted = useRef(false);
  const analysisDone = useRef(false);
  const animationDone = useRef(false);

  useEffect(() => {
    if (!id) {
      router.replace('/cast');
      return;
    }

    const timers = messages.processing.steps.map((_, index) =>
      window.setTimeout(() => setActiveStep(index), 700 * (index + 1)),
    );

    const animTimer = window.setTimeout(() => {
      animationDone.current = true;
      if (analysisDone.current) {
        router.replace(`/result/${id}`);
      }
    }, 700 * messages.processing.steps.length + 800);

    const safetyTimer = window.setTimeout(() => {
      router.replace(`/result/${id}`);
    }, 30000);

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      window.clearTimeout(animTimer);
      window.clearTimeout(safetyTimer);
    };
  }, [id, router]);

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
        }
      } catch (err) {
        console.warn('[processing] Analysis fetch failed:', err);
      }

      analysisDone.current = true;
      if (animationDone.current) {
        router.replace(`/result/${id}`);
      }
    }

    void runAnalysis();
  }, [id, router]);

  return (
    <div className="mx-auto max-w-2xl text-center">
      <div className="space-y-4">
        <div className="text-[10px] tracking-[0.4em] text-[var(--text-dim)] uppercase">Processing</div>
        <h1 className="font-display text-3xl font-extralight text-white">{messages.processing.title}</h1>
        <div className="mx-auto h-px w-12 bg-[var(--gold-dim)]" />
        <p className="text-sm text-[var(--text-muted)]">
          正在为你排盘并分析卦象，请稍候…
        </p>
      </div>
      <div className="mt-12 grid gap-3 text-left">
        {messages.processing.steps.map((step, index) => (
          <div
            key={step}
            className={`rounded-xl px-6 py-4 transition-all duration-300 ${
              index <= activeStep
                ? 'bg-[var(--bg-card)] text-white'
                : 'bg-[var(--bg-mid)] text-[var(--text-dim)]'
            }`}
          >
            <div className={`text-[10px] tracking-[0.25em] uppercase ${index <= activeStep ? 'text-[var(--gold)]' : 'text-[var(--text-dim)]'}`}>Step 0{index + 1}</div>
            <div className="font-display mt-1 text-sm">{step}</div>
          </div>
        ))}
      </div>
      {error && (
        <div className="mt-6 rounded-xl bg-[var(--bg-card)] px-5 py-3 text-sm text-[var(--error)]">
          {error}
        </div>
      )}
    </div>
  );
}
