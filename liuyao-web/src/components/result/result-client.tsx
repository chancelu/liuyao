'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getMessages } from '@/lib/i18n';
import { getSession, getUser } from '@/lib/supabase/auth';
import { getDivinationResultFlow } from '@/services/divination-api';
import { saveDivinationApi } from '@/lib/api/client';
import type { MockResult } from '@/lib/types';

const messages = getMessages();

export function ResultClient({ id }: { id: string }) {
  const router = useRouter();
  const [result, setResult] = useState<MockResult | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const loginHref = useMemo(() => `/login?next=${encodeURIComponent(`/result/${id}`)}`, [id]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const [next, user, session] = await Promise.all([
        getDivinationResultFlow(id),
        getUser(),
        getSession(),
      ]);
      if (!cancelled) {
        setResult(next);
        setIsAuthenticated(Boolean(user));
        setAccessToken(session?.access_token ?? null);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [id]);

  async function handleSave() {
    if (!accessToken) return;
    setSaveState('saving');
    const res = await saveDivinationApi(id, accessToken);
    setSaveState(res.success ? 'saved' : 'error');
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="space-y-3">
        <div className="text-xs tracking-[0.3em] text-stone-400 uppercase">Result #{id}</div>
        <h1 className="text-4xl text-stone-50">{messages.result.title}</h1>
        <p className="text-sm leading-7 text-stone-300/78">第一屏先给排盘，再给初步结论，后面再展开白话与专业分析。</p>
      </div>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[32px] border border-white/10 bg-white/5 p-8">
          <div className="mb-5 text-xs tracking-[0.2em] text-stone-400 uppercase">{messages.result.chartTitle}</div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[24px] border border-white/8 bg-black/15 p-5">
              <div className="text-xs text-stone-400">本卦</div>
              <div className="mt-2 text-2xl text-stone-100">{result?.primaryHexagram ?? '待生成'}</div>
            </div>
            <div className="rounded-[24px] border border-white/8 bg-black/15 p-5">
              <div className="text-xs text-stone-400">变卦</div>
              <div className="mt-2 text-2xl text-stone-100">{result?.changedHexagram ?? '待生成'}</div>
            </div>
          </div>
          <div className="mt-6 rounded-[24px] border border-white/8 bg-black/15 p-5 text-sm leading-7 text-stone-300">
            动爻：{result?.movingLines.length ? `第 ${result.movingLines.join('、')} 爻` : '当前示意为静卦'} ｜ 世应 / 月建 / 日辰 / 旬空：下一步接入真实排盘引擎
          </div>
        </div>
        <div className="rounded-[32px] border border-emerald-100/12 bg-emerald-100/6 p-8">
          <div className="mb-5 text-xs tracking-[0.2em] text-stone-400 uppercase">{messages.result.summaryTitle}</div>
          <div className="space-y-4">
            <div className="text-2xl leading-relaxed text-stone-50">{result?.summary ?? '正在等待真实结果。'}</div>
            <p className="text-sm leading-7 text-stone-200/85">{result?.question ?? '这里会展示当前这次问题。'}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-8">
          <div className="mb-4 text-xs tracking-[0.2em] text-stone-400 uppercase">{messages.result.plainTitle}</div>
          <p className="text-sm leading-8 text-stone-300">{result?.plainAnalysis ?? '白话分析会在接入真实 analysis service 后替换。'}</p>
        </div>
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-8">
          <div className="mb-4 text-xs tracking-[0.2em] text-stone-400 uppercase">{messages.result.professionalTitle}</div>
          <p className="text-sm leading-8 text-stone-300">{result?.professionalAnalysis ?? '专业版会展开用神、旺衰、动变、世应、象法与应期。'}</p>
        </div>
      </section>

      <section className="space-y-4">
        {!isAuthenticated ? (
          <div className="rounded-[24px] border border-amber-200/15 bg-amber-100/5 p-5 text-sm leading-7 text-stone-300">
            这次结果已经可以继续阅读；如果你想下次回来接着看，先登录即可，系统会自动带你回到当前结果页。
          </div>
        ) : null}

        {saveState === 'error' ? (
          <div className="rounded-[24px] border border-red-300/15 bg-red-100/5 p-4 text-sm text-red-300">
            保存失败，请稍后重试。
          </div>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row">
          {isAuthenticated ? (
            <button
              onClick={handleSave}
              disabled={saveState === 'saving' || saveState === 'saved'}
              className="rounded-full border border-emerald-200/25 bg-emerald-100/10 px-6 py-3 text-sm text-white transition hover:bg-emerald-100/15 disabled:opacity-60"
            >
              {saveState === 'saving' ? '保存中…' : saveState === 'saved' ? '已保存 ✓' : messages.result.save}
            </button>
          ) : (
            <Link
              href={loginHref}
              className="rounded-full border border-emerald-200/25 bg-emerald-100/10 px-6 py-3 text-center text-sm text-white transition hover:bg-emerald-100/15"
            >
              登录后回到这条结果
            </Link>
          )}
          <button className="rounded-full border border-white/10 px-6 py-3 text-sm text-stone-200 hover:border-white/20">{messages.result.share}</button>
          <button
            className="rounded-full border border-white/10 px-6 py-3 text-sm text-stone-200 hover:border-white/20"
            onClick={() => router.push('/cast')}
          >
            {messages.result.restart}
          </button>
        </div>
      </section>
    </div>
  );
}

