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
    <div className="glow-center mx-auto max-w-2xl text-center">
      <div className="space-y-4">
        <div className="text-[10px] tracking-[0.5em] text-[var(--dark-gold-dim)] uppercase">Processing</div>
        <h1 className="font-display text-3xl font-extralight tracking-wide text-white">{messages.processing.title}</h1>
        <div className="gold-divider mx-auto w-12" />
        <p className="text-sm text-[var(--stone)]">
          正在为你排盘并分析卦象，请稍候…
        </p>
      </div>
      <div className="mt-12 grid gap-3 text-left">
        {messages.processing.steps.map((step, index) => (
          <div
            key={step}
            className={`rounded-xl border px-6 py-4 transition-all duration-500 ${
              index <= activeStep
                ? 'border-[rgba(196,168,108,0.15)] bg-[rgba(196,168,108,0.04)] text-[var(--cream)]'
                : 'border-[var(--border)] bg-[var(--bg-card)] text-[var(--stone-dim)]'
            }`}
          >
            <div className="text-[10px] tracking-[0.2em] text-[var(--dark-gold-dim)] uppercase">Step 0{index + 1}</div>
            <div className="font-display mt-1 text-sm">{step}</div>
          </div>
        ))}
      </div>
      {error && (
        <div className="mt-6 rounded-xl border border-[rgba(158,107,107,0.20)] bg-[rgba(158,107,107,0.06)] px-5 py-3 text-sm text-[var(--error)]">
          {error}
        </div>
      )}
    </div>
  );
}
