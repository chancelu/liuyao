'use client';

import { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getMessages } from '@/lib/i18n';
import { buildCreateDivinationPayload, createDivinationFlow } from '@/services/divination-api';
import { track } from '@/lib/analytics';
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const canSubmit = useMemo(() => question.trim().length >= 4, [question]);

  const fillExample = (example: string) => {
    setQuestion(example);
    setError('');
  };

  const onSubmit = async () => {
    if (!canSubmit) {
      setError('先把问题写得更具体一点，再开始摇卦。');
      return;
    }

    setIsSubmitting(true);
    setError('');

    const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `div-${Date.now()}`;
    const response = await createDivinationFlow(
      buildCreateDivinationPayload({
        id,
        question: question.trim(),
        category,
        timeScope,
        background: background.trim(),
        locale: 'zh-CN',
      }),
    );

    setIsSubmitting(false);

    if (!response.ok) {
      setError(response.error);
      return;
    }

    router.push(`/cast/ritual?id=${response.draft.id}`);
    track('click_start_cast', { category });
  };

  return (
    <div className="mt-12 space-y-10">
      {/* Question */}
      <section className="space-y-3">
        <label className="text-[10px] tracking-[0.2em] text-[var(--gold-dim)] uppercase">{messages.ask.questionLabel}</label>
        <textarea
          className="font-display min-h-36 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-6 py-5 text-base leading-8 text-[var(--cream)] outline-none placeholder:text-[var(--stone-dim)] transition-colors focus:border-[var(--border-hover)]"
          placeholder={messages.ask.questionPlaceholder}
          value={question}
          onChange={(event) => {
            setQuestion(event.target.value);
            if (error) setError('');
          }}
        />
      </section>

      {/* Category */}
      <section className="space-y-3">
        <div className="text-[10px] tracking-[0.2em] text-[var(--gold-dim)] uppercase">{messages.ask.categoryLabel}</div>
        <div className="flex flex-wrap gap-3">
          {categories.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setCategory(item.value)}
              className={`rounded-full border px-5 py-2.5 text-sm transition-all duration-300 ${
                category === item.value
                  ? 'border-[rgba(196,164,108,0.30)] bg-[rgba(196,164,108,0.08)] text-[var(--gold-light)]'
                  : 'border-[var(--border)] text-[var(--stone)] hover:border-[var(--border-hover)] hover:text-[var(--cream-soft)]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>

      {/* Time Scope */}
      <section className="space-y-3">
        <div className="text-[10px] tracking-[0.2em] text-[var(--gold-dim)] uppercase">{messages.ask.timeScopeLabel}</div>
        <div className="flex flex-wrap gap-3">
          {timeScopes.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setTimeScope(item.value)}
              className={`rounded-full border px-5 py-2.5 text-sm transition-all duration-300 ${
                timeScope === item.value
                  ? 'border-[rgba(196,164,108,0.30)] bg-[rgba(196,164,108,0.08)] text-[var(--gold-light)]'
                  : 'border-[var(--border)] text-[var(--stone)] hover:border-[var(--border-hover)] hover:text-[var(--cream-soft)]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>

      {/* Background */}
      <section className="space-y-3">
        <label className="text-[10px] tracking-[0.2em] text-[var(--gold-dim)] uppercase">{messages.ask.backgroundLabel}</label>
        <textarea
          className="min-h-28 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-6 py-5 text-base leading-8 text-[var(--cream)] outline-none placeholder:text-[var(--stone-dim)] transition-colors focus:border-[var(--border-hover)]"
          placeholder={messages.ask.backgroundPlaceholder}
          value={background}
          onChange={(event) => setBackground(event.target.value)}
        />
      </section>

      {/* Example Questions */}
      <section className="space-y-4">
        <div className="text-[10px] tracking-[0.2em] text-[var(--gold-dim)] uppercase">示例问题</div>
        <div className="space-y-5">
          {messages.home.categorizedExamples.map((group) => (
            <div key={group.category}>
              <div className="mb-2 text-xs text-[var(--stone-dim)]">{group.category}</div>
              <div className="flex flex-wrap gap-2">
                {group.items.map((example) => (
                  <button
                    key={example}
                    type="button"
                    onClick={() => fillExample(example)}
                    className="rounded-full border border-[var(--border)] px-4 py-2 text-left text-sm text-[var(--cream-soft)] transition-all duration-300 hover:border-[var(--border-hover)] hover:text-[var(--gold-light)]"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {error ? (
        <div className="rounded-xl border border-[rgba(158,107,107,0.20)] bg-[rgba(158,107,107,0.06)] px-5 py-3 text-sm text-[var(--error)]">
          {error}
        </div>
      ) : null}

      <div className="pt-4">
        <button
          type="button"
          onClick={onSubmit}
          className="btn-primary rounded-full px-10 py-4 text-sm disabled:cursor-not-allowed disabled:opacity-40"
          disabled={!canSubmit || isSubmitting}
        >
          {isSubmitting ? '正在进入摇卦…' : messages.ask.submit}
        </button>
      </div>
    </div>
  );
}
