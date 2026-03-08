'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getMessages } from '@/lib/i18n';

const messages = getMessages();

export function ProcessingClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (!id) {
      router.replace('/cast');
      return;
    }

    const timers = messages.processing.steps.map((_, index) =>
      window.setTimeout(() => setActiveStep(index), 700 * (index + 1)),
    );

    const redirect = window.setTimeout(() => {
      router.replace(`/result/${id}`);
    }, 3500);

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      window.clearTimeout(redirect);
    };
  }, [id, router]);

  return (
    <div className="mx-auto max-w-4xl rounded-[36px] border border-white/10 bg-white/5 p-10 text-center backdrop-blur">
      <div className="space-y-4">
        <div className="text-xs tracking-[0.3em] text-stone-400 uppercase">Processing</div>
        <h1 className="text-4xl text-stone-50">{messages.processing.title}</h1>
        <p className="mx-auto max-w-2xl text-sm leading-7 text-stone-300/78">
          现在这版会用前端状态流模拟真实的排盘与分析过程。后续这里会替换成真正的 chart/analyze 接口。
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
    </div>
  );
}
