'use client';

import { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useI18n } from '@/lib/i18n';
import { buildCreateDivinationPayload, createDivinationFlow } from '@/services/divination-api';
import { track } from '@/lib/analytics';
import type { Category, Gender, TimeScope } from '@/lib/types';

export function AskForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefill = searchParams.get('prefill') ?? '';
  const { messages } = useI18n();

  const categories: Array<{ value: Category; label: string }> = [
    { value: 'relationship', label: messages.ask.categories.relationship },
    { value: 'career', label: messages.ask.categories.career },
    { value: 'wealth', label: messages.ask.categories.wealth },
    { value: 'health', label: messages.ask.categories.health },
    { value: 'study', label: messages.ask.categories.study },
    { value: 'lost', label: messages.ask.categories.lost },
    { value: 'other', label: messages.ask.categories.other },
  ];

  const timeScopes: Array<{ value: TimeScope; label: string }> = [
    { value: 'recent', label: messages.ask.timeScopes.recent },
    { value: 'this_month', label: messages.ask.timeScopes.this_month },
    { value: 'this_year', label: messages.ask.timeScopes.this_year },
    { value: 'unspecified', label: messages.ask.timeScopes.unspecified },
  ];

  const [question, setQuestion] = useState(prefill);
  const [category, setCategory] = useState<Category>('relationship');
  const [timeScope, setTimeScope] = useState<TimeScope>('recent');
  const [gender, setGender] = useState<Gender>('male');
  const [background, setBackground] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const canSubmit = useMemo(() => question.trim().length >= 4, [question]);

  const onSubmit = async () => {
    if (!canSubmit) {
      setError(messages.ask.questionTooShort);
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
        gender,
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
    <div className="mt-6 space-y-6 sm:mt-12 sm:space-y-10">
      {/* Question */}
      <section className="space-y-3">
        <label className="text-[10px] tracking-[0.25em] text-[var(--text-dim)] uppercase">{messages.ask.questionLabel}</label>
        <textarea
          className="font-display min-h-28 w-full rounded-xl border border-[rgba(255,255,255,0.06)] bg-[var(--bg-card)] px-4 py-4 text-base leading-8 text-white outline-none placeholder:text-[var(--text-dim)] transition-colors focus:border-[rgba(255,255,255,0.15)] sm:min-h-36 sm:px-6 sm:py-5"
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
        <div className="text-[10px] tracking-[0.25em] text-[var(--text-dim)] uppercase">{messages.ask.categoryLabel}</div>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          {categories.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setCategory(item.value)}
              className={`rounded-full border px-4 py-2 text-xs transition-all duration-200 sm:px-5 sm:py-2.5 sm:text-sm ${
                category === item.value
                  ? 'border-[var(--gold)] bg-[rgba(184,160,112,0.10)] text-[var(--gold)]'
                  : 'border-[rgba(255,255,255,0.06)] text-[var(--text-muted)] hover:border-[rgba(255,255,255,0.15)] hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>

      {/* Time Scope */}
      <section className="space-y-3">
        <div className="text-[10px] tracking-[0.25em] text-[var(--text-dim)] uppercase">{messages.ask.timeScopeLabel}</div>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          {timeScopes.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setTimeScope(item.value)}
              className={`rounded-full border px-4 py-2 text-xs transition-all duration-200 sm:px-5 sm:py-2.5 sm:text-sm ${
                timeScope === item.value
                  ? 'border-[var(--gold)] bg-[rgba(184,160,112,0.10)] text-[var(--gold)]'
                  : 'border-[rgba(255,255,255,0.06)] text-[var(--text-muted)] hover:border-[rgba(255,255,255,0.15)] hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>

      {/* Gender */}
      <section className="space-y-3">
        <div className="text-[10px] tracking-[0.25em] text-[var(--text-dim)] uppercase">{messages.ask.genders.male === '男' ? '性别' : 'Gender'}</div>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          {([{ value: 'male' as Gender, label: messages.ask.genders.male }, { value: 'female' as Gender, label: messages.ask.genders.female }]).map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setGender(item.value)}
              className={`rounded-full border px-4 py-2 text-xs transition-all duration-200 sm:px-5 sm:py-2.5 sm:text-sm ${
                gender === item.value
                  ? 'border-[var(--gold)] bg-[rgba(184,160,112,0.10)] text-[var(--gold)]'
                  : 'border-[rgba(255,255,255,0.06)] text-[var(--text-muted)] hover:border-[rgba(255,255,255,0.15)] hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>

      {/* Background */}
      <section className="space-y-3">
        <label className="text-[10px] tracking-[0.25em] text-[var(--text-dim)] uppercase">{messages.ask.backgroundLabel}</label>
        <textarea
          className="min-h-20 w-full rounded-xl border border-[rgba(255,255,255,0.06)] bg-[var(--bg-card)] px-4 py-4 text-base leading-8 text-white outline-none placeholder:text-[var(--text-dim)] transition-colors focus:border-[rgba(255,255,255,0.15)] sm:min-h-28 sm:px-6 sm:py-5"
          placeholder={messages.ask.backgroundPlaceholder}
          value={background}
          onChange={(event) => setBackground(event.target.value)}
        />
      </section>

      {/* Submit Button — above examples */}
      <div className="flex justify-center pt-2 sm:pt-4">
        <button
          type="button"
          onClick={onSubmit}
          className="btn-primary w-full rounded-full px-10 py-4 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto sm:max-w-md sm:px-12 sm:py-5 sm:text-base"
          disabled={!canSubmit || isSubmitting}
        >
          {isSubmitting ? '正在进入摇卦…' : messages.ask.submit}
        </button>
      </div>

      {error ? (
        <div className="rounded-xl bg-[var(--bg-card)] px-5 py-3 text-sm text-[var(--error)]">
          {error}
        </div>
      ) : null}

    </div>
  );
}
