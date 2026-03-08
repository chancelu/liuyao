'use client';

import { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getMessages } from '@/lib/i18n';
import { createDraft, getTrialState } from '@/services/divination-service';
import type { Category, TimeScope } from '@/lib/types';

const messages = getMessages();

const categories: Array<{ value: Category; label: string }> = [
  { value: 'relationship', label: '感情' },
  { value: 'career', label: '事业' },
  { value: 'wealth', label: '财运' },
  { value: 'health', label: '健康' },
  { value: 'study', label: '学业' },
  { value: 'lost', label: '失物' },
  { value: 'other', label: '其他' },
];

const timeScopes: Array<{ value: TimeScope; label: string }> = [
  { value: 'recent', label: '近期' },
  { value: 'this_month', label: '本月' },
  { value: 'this_year', label: '本年' },
  { value: 'unspecified', label: '未限定' },
];

export function AskForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefill = searchParams.get('prefill') ?? '';

  const [question, setQuestion] = useState(prefill);
  const [category, setCategory] = useState<Category>('relationship');
  const [timeScope, setTimeScope] = useState<TimeScope>('recent');
  const [background, setBackground] = useState('');
  const [error, setError] = useState('');
  const canSubmit = useMemo(() => question.trim().length >= 4, [question]);

  const fillExample = (example: string) => {
    setQuestion(example);
    setError('');
  };

  const onSubmit = () => {
    if (!canSubmit) {
      setError('先把问题写得更具体一点，再开始摇卦。');
      return;
    }

    const trial = getTrialState();
    if (trial.freeTrialUsed) {
      setError('游客当前只支持体验一次。下一步接入登录后，这里会引导注册继续使用。');
      return;
    }

    const draft = createDraft({
      id: typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `div-${Date.now()}`,
      question: question.trim(),
      category,
      timeScope,
      background: background.trim(),
      locale: 'zh-CN',
    });

    router.push(`/cast/ritual?id=${draft.id}`);
  };

  return (
    <div className="mt-10 space-y-8">
      <section className="space-y-3">
        <label className="text-sm text-stone-300">{messages.ask.questionLabel}</label>
        <textarea
          className="min-h-36 w-full rounded-[24px] border border-white/10 bg-black/20 px-5 py-4 text-base text-stone-100 outline-none placeholder:text-stone-500"
          placeholder={messages.ask.questionPlaceholder}
          value={question}
          onChange={(event) => {
            setQuestion(event.target.value);
            if (error) setError('');
          }}
        />
      </section>

      <section className="space-y-3">
        <div className="text-sm text-stone-300">{messages.ask.categoryLabel}</div>
        <div className="flex flex-wrap gap-3">
          {categories.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setCategory(item.value)}
              className={`rounded-full border px-4 py-2 text-sm transition ${category === item.value ? 'border-emerald-200/30 bg-emerald-100/10 text-white' : 'border-white/10 text-stone-300 hover:border-white/20'}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <div className="text-sm text-stone-300">{messages.ask.timeScopeLabel}</div>
        <div className="flex flex-wrap gap-3">
          {timeScopes.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setTimeScope(item.value)}
              className={`rounded-full border px-4 py-2 text-sm transition ${timeScope === item.value ? 'border-emerald-200/30 bg-emerald-100/10 text-white' : 'border-white/10 text-stone-300 hover:border-white/20'}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <label className="text-sm text-stone-300">{messages.ask.backgroundLabel}</label>
        <textarea
          className="min-h-28 w-full rounded-[24px] border border-white/10 bg-black/20 px-5 py-4 text-base text-stone-100 outline-none placeholder:text-stone-500"
          placeholder={messages.ask.backgroundPlaceholder}
          value={background}
          onChange={(event) => setBackground(event.target.value)}
        />
      </section>

      <section className="space-y-3">
        <div className="text-sm text-stone-300">示例问题</div>
        <div className="flex flex-wrap gap-3">
          {messages.home.examples.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => fillExample(example)}
              className="rounded-full border border-emerald-200/10 bg-emerald-100/6 px-4 py-2 text-left text-sm text-stone-200 transition hover:border-emerald-200/25 hover:bg-emerald-100/10"
            >
              {example}
            </button>
          ))}
        </div>
      </section>

      {error ? <div className="text-sm text-amber-200">{error}</div> : null}

      <div className="pt-2">
        <button
          type="button"
          onClick={onSubmit}
          className="inline-flex rounded-full border border-emerald-200/25 bg-emerald-100/10 px-6 py-3 text-sm text-white transition hover:bg-emerald-100/15 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!canSubmit}
        >
          {messages.ask.submit}
        </button>
      </div>
    </div>
  );
}
