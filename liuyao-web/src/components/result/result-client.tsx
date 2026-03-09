'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getMessages } from '@/lib/i18n';
import { getSession, getUser } from '@/lib/supabase/auth';
import { getDivinationResultFlow } from '@/services/divination-api';
import { getDivinationApi, saveDivinationApi, shareDivinationApi } from '@/lib/api/client';
import type { MockResult } from '@/lib/types';

const messages = getMessages();

export function ResultClient({ id }: { id: string }) {
  const router = useRouter();
  const [result, setResult] = useState<MockResult | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [shareState, setShareState] = useState<'idle' | 'sharing' | 'copied' | 'error'>('idle');
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const loginHref = useMemo(() => `/login?next=${encodeURIComponent(`/result/${id}`)}`, [id]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const [next, user, session] = await Promise.all([
        getDivinationResultFlow(id),
        getUser(),
        getSession(),
      ]);
      if (cancelled) return;

      setResult(next);
      const authed = Boolean(user);
      setIsAuthenticated(authed);
      setAccessToken(session?.access_token ?? null);

      // Check if already saved/shared
      const meta = await getDivinationApi(id);
      if (!cancelled && meta.success) {
        if (meta.data.isSaved) {
          setSaveState('saved');
        }
        if (meta.data.isPublic) {
          setShareUrl(`${window.location.origin}/share/${id}`);
        }
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

  async function handleShare() {
    setShareState('sharing');

    // If authenticated and not yet saved, save first so history stays consistent
    if (accessToken && saveState === 'idle') {
      await saveDivinationApi(id, accessToken);
      setSaveState('saved');
    }

    const res = await shareDivinationApi(id, accessToken ?? undefined);
    if (res.success) {
      const url = res.data.shareUrl || `${window.location.origin}/share/${id}`;
      setShareUrl(url);
      try {
        await navigator.clipboard.writeText(url);
        setShareState('copied');
        setTimeout(() => setShareState('idle'), 3000);
      } catch {
        setShareState('idle');
      }
    } else {
      setShareState('error');
      setTimeout(() => setShareState('idle'), 3000);
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="space-y-3">
        <div className="text-xs tracking-[0.3em] text-stone-400 uppercase">Result #{id}</div>
        <h1 className="text-4xl text-stone-50">{messages.result.title}</h1>
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
            {result?.movingLines.length
              ? `动爻：第 ${result.movingLines.join('、')} 爻`
              : '静卦，无动爻'}
          </div>

          {result?.chart ? (
            <div className="mt-4 space-y-3">
              <div className="flex flex-wrap gap-2 text-xs text-stone-400">
                <span className="rounded-lg border border-white/8 bg-black/15 px-3 py-1.5">
                  月建：{result.chart.monthBranch}
                </span>
                <span className="rounded-lg border border-white/8 bg-black/15 px-3 py-1.5">
                  日辰：{result.chart.dayStem}{result.chart.dayBranch}
                </span>
                <span className="rounded-lg border border-white/8 bg-black/15 px-3 py-1.5">
                  旬空：{result.chart.xunkong[0]}{result.chart.xunkong[1]}
                </span>
                <span className="rounded-lg border border-white/8 bg-black/15 px-3 py-1.5">
                  宫：{result.chart.primary.palace}宫（{result.chart.primary.palaceElement}）
                </span>
              </div>

              <div className="overflow-x-auto rounded-[16px] border border-white/8 bg-black/15">
                <table className="w-full text-xs text-stone-300">
                  <thead>
                    <tr className="border-b border-white/8 text-stone-400">
                      <th className="px-3 py-2 text-left font-normal">爻位</th>
                      <th className="px-3 py-2 text-left font-normal">六神</th>
                      <th className="px-3 py-2 text-left font-normal">六亲</th>
                      <th className="px-3 py-2 text-left font-normal">纳支</th>
                      <th className="px-3 py-2 text-left font-normal">阴阳</th>
                      <th className="px-3 py-2 text-left font-normal">世应</th>
                      <th className="px-3 py-2 text-left font-normal">变</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...result.chart.lines].reverse().map((line) => (
                      <tr key={line.position} className="border-b border-white/5 last:border-0">
                        <td className="px-3 py-2">{['初', '二', '三', '四', '五', '上'][line.position - 1]}爻</td>
                        <td className="px-3 py-2">{line.spirit}</td>
                        <td className="px-3 py-2">{line.relative}</td>
                        <td className="px-3 py-2">{line.branch}{line.branchElement}</td>
                        <td className="px-3 py-2">
                          {line.yinYang === '阳' ? '▬▬▬' : '▬ ▬'}
                          {line.moving ? (line.yinYang === '阳' ? ' ○' : ' ×') : ''}
                        </td>
                        <td className="px-3 py-2 text-amber-300/80">
                          {line.isShi ? '世' : line.isYing ? '应' : ''}
                        </td>
                        <td className="px-3 py-2 text-stone-500">
                          {line.moving ? `→${line.changedBranch} ${line.changedRelative}` : ''}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </div>
        <div className="rounded-[32px] border border-emerald-100/12 bg-emerald-100/6 p-8">
          <div className="mb-5 text-xs tracking-[0.2em] text-stone-400 uppercase">{messages.result.summaryTitle}</div>
          <div className="space-y-4">
            <div className="text-2xl leading-relaxed text-stone-50">{result?.summary ?? '正在等待分析结果。'}</div>
            <p className="text-sm leading-7 text-stone-200/85">{result?.question ?? ''}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-8">
          <div className="mb-4 text-xs tracking-[0.2em] text-stone-400 uppercase">{messages.result.plainTitle}</div>
          <p className="text-sm leading-8 text-stone-300">{result?.plainAnalysis ?? '解读生成中…'}</p>
        </div>
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-8">
          <div className="mb-4 text-xs tracking-[0.2em] text-stone-400 uppercase">{messages.result.professionalTitle}</div>
          <p className="text-sm leading-8 text-stone-300">{result?.professionalAnalysis ?? '专业分析生成中…'}</p>
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

        {saveState === 'saved' ? (
          <div className="rounded-[24px] border border-emerald-300/15 bg-emerald-100/5 p-4 text-sm text-emerald-300">
            已保存到记录。
            <Link href="/history" className="ml-3 underline underline-offset-2 hover:text-emerald-200">
              查看历史记录
            </Link>
          </div>
        ) : null}

        {shareState === 'error' ? (
          <div className="rounded-[24px] border border-red-300/15 bg-red-100/5 p-4 text-sm text-red-300">
            生成分享链接失败，请稍后重试。
          </div>
        ) : null}

        {shareUrl && shareState !== 'copied' ? (
          <div className="rounded-[24px] border border-stone-200/10 bg-white/4 p-4 text-sm text-stone-300">
            分享链接：
            <a href={shareUrl} target="_blank" rel="noreferrer" className="ml-2 break-all text-emerald-300 underline underline-offset-2 hover:text-emerald-200">
              {shareUrl}
            </a>
          </div>
        ) : null}

        {shareState === 'copied' ? (
          <div className="rounded-[24px] border border-emerald-300/15 bg-emerald-100/5 p-4 text-sm text-emerald-300">
            分享链接已复制到剪贴板！
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
          <button
            onClick={handleShare}
            disabled={shareState === 'sharing'}
            className="rounded-full border border-white/10 px-6 py-3 text-sm text-stone-200 transition hover:border-white/20 disabled:opacity-60"
          >
            {shareState === 'sharing' ? '生成中…' : shareState === 'copied' ? '已复制 ✓' : messages.result.share}
          </button>
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
