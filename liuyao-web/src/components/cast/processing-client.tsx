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

    // Step animation
    const timers = messages.processing.steps.map((_, index) =>
      window.setTimeout(() => setActiveStep(index), 700 * (index + 1)),
    );

    // Mark animation as done after all steps shown + small buffer
    const animTimer = window.setTimeout(() => {
      animationDone.current = true;
      // If analysis is already done, redirect immediately
      if (analysisDone.current) {
        router.replace(`/result/${id}`);
      }
    }, 700 * messages.processing.steps.length + 800);

    // Safety: redirect after 30s no matter what (prevent infinite hang)
    const safetyTimer = window.setTimeout(() => {
      router.replace(`/result/${id}`);
    }, 30000);

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      window.clearTimeout(animTimer);
      window.clearTimeout(safetyTimer);
    };
  }, [id, router]);

  // Trigger AI analysis
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
          // Non-fatal: fallback mock result already exists from cast route
        }
      } catch (err) {
        console.warn('[processing] Analysis fetch failed:', err);
        // Non-fatal: fallback mock result already exists
      }

      analysisDone.current = true;

      // If animation is already done, redirect now
      if (animationDone.current) {
        router.replace(`/result/${id}`);
      }
    }

    void runAnalysis();
  }, [id, router]);

  return (
    <div className="mx-auto max-w-4xl rounded-[36px] border border-white/10 bg-white/5 p-10 text-center backdrop-blur">
      <div className="space-y-4">
        <div className="text-xs tracking-[0.3em] text-stone-400 uppercase">Processing</div>
        <h1 className="text-4xl text-stone-50">{messages.processing.title}</h1>
        <p className="mx-auto max-w-2xl text-sm leading-7 text-stone-300/78">
          正在为你排盘并分析卦象，请稍候…
        </p>
      </div>
      <div className="mt-10 grid gap-4 text-left">
        {messages.processing.steps.map((step, index) => (
          <div
            key={step}
            className={`rounded-[22px] border px-5 py-4 transition ${index <= activeStep ? 'border-emerald-200/20 bg-emerald-100/8 text-stone-50' : 'border-white/8 bg-black/15 text-stone-300'}`}
          >
            <div className="text-xs tracking-[0.2em] text-stone-500 uppercase">Step 0{index + 1}</div>
            <div className="mt-1">{step}</div>
          </div>
        ))}
      </div>
      {error && (
        <div className="mt-6 rounded-xl border border-[rgba(139,74,74,0.20)] bg-[rgba(139,74,74,0.08)] px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}
    </div>
  );
}
