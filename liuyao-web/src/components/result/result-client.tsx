'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getMessages } from '@/lib/i18n';
import { getSession, getUser } from '@/lib/supabase/auth';
import { getDivinationResultFlow } from '@/services/divination-api';
import { getDivinationApi, saveDivinationApi, shareDivinationApi } from '@/lib/api/client';
import { AnnotatedText } from '@/components/ui/annotated-text';
import { ShareCard } from '@/components/result/share-card';
import { track } from '@/lib/analytics';
import type { MockResult } from '@/lib/types';

const messages = getMessages();
const YAO_POS = ['初', '二', '三', '四', '五', '上'];

function YaoLine({ line }: { line: { position: number; spirit: string; relative: string; branch: string; branchElement: string; yinYang: string; moving: boolean; isShi: boolean; isYing: boolean; changedBranch?: string; changedRelative?: string } }) {
  const isYang = line.yinYang === '阳';
  const posName = `${YAO_POS[line.position - 1]}爻`;

  return (
    <div
      className={`animate-fade-in-up grid grid-cols-[2.5rem_1fr_auto] items-center gap-4 rounded-xl px-5 py-4 transition-colors duration-200 ${
        line.moving
          ? 'border border-[rgba(184,160,112,0.15)] bg-[var(--bg-elevated)]'
          : 'bg-[var(--bg-elevated)]'
      }`}
      style={{ animationDelay: `${(6 - line.position) * 80}ms` }}
    >
      {/* Position & Spirit */}
      <div className="text-center">
        <div className="text-xs font-medium text-white">{posName}</div>
        <div className="mt-0.5 text-[10px] text-[var(--text-dim)]">{line.spirit}</div>
      </div>

      {/* Yao visual + info */}
      <div className="flex items-center gap-5">
        <div className="w-20 shrink-0">
          {isYang ? (
            <div className="h-[4px] w-full rounded-full bg-white" />
          ) : (
            <div className="flex gap-2.5">
              <div className="h-[4px] flex-1 rounded-full bg-[var(--text-muted)]" />
              <div className="h-[4px] flex-1 rounded-full bg-[var(--text-muted)]" />
            </div>
          )}
          {line.moving && (
            <div className="mt-1 text-center text-[10px] text-[var(--gold)]">
              {isYang ? '○' : '×'}
            </div>
          )}
        </div>

        <div className="flex items-baseline gap-3">
          <span className="text-sm text-white">{line.relative}</span>
          <span className="text-xs text-[var(--text-dim)]">{line.branch}{line.branchElement}</span>
        </div>

        {line.moving && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[var(--gold-dim)]">→</span>
            <span className="text-[var(--text-muted)]">{line.changedBranch} {line.changedRelative}</span>
          </div>
        )}
      </div>

      {/* Shi/Ying */}
      <div className="w-8 text-center">
        {line.isShi && <span className="text-xs text-[var(--gold)]">世</span>}
        {line.isYing && <span className="text-xs text-[var(--blue)]">应</span>}
      </div>
    </div>
  );
}

export function ResultClient({ id }: { id: string }) {
  const router = useRouter();
  const [result, setResult] = useState<MockResult | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [shareState, setShareState] = useState<'idle' | 'sharing' | 'copied' | 'error'>('idle');
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [showShareCard, setShowShareCard] = useState(false);
  const [showPlainAnalysis, setShowPlainAnalysis] = useState(true);
  const [showProAnalysis, setShowProAnalysis] = useState(true);
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
      track('page_view_result', { id });
      const authed = Boolean(user);
      setIsAuthenticated(authed);
      setAccessToken(session?.access_token ?? null);

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
    track('click_share');

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
    <div className="mx-auto max-w-6xl space-y-10">
      {/* Page header */}
      <div className="animate-fade-in-up">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <div className="text-[10px] tracking-[0.4em] text-[var(--text-dim)] uppercase">Result #{id}</div>
            <h1 className="font-display text-4xl font-extralight tracking-[0.02em] text-white">{messages.result.title}</h1>
            <p className="max-w-2xl text-sm leading-8 text-[var(--text-muted)]">先看卦象结构，再看一句话结论，最后展开白话与专业分析。</p>
          </div>
        </div>
        <div className="mt-8 h-px w-full bg-[rgba(255,255,255,0.06)]" />
      </div>

      {/* Main Grid: Chart + Summary */}
      <section className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        {/* Hexagram Chart */}
        <div className="card-solid animate-fade-in-up delay-100 rounded-2xl p-7 lg:p-8">
          <div className="mb-6 text-[10px] tracking-[0.25em] text-[var(--gold)] uppercase">{messages.result.chartTitle}</div>

          {/* Primary & Changed Hexagram Names */}
          <div className="mb-6 grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-[var(--bg-elevated)] p-5">
              <div className="text-[10px] text-[var(--text-dim)]">本卦</div>
              <div className="mt-2 font-display text-2xl font-light text-white">
                {result?.primaryHexagram ?? '待生成'}
              </div>
            </div>
            <div className="rounded-xl bg-[var(--bg-elevated)] p-5">
              <div className="text-[10px] text-[var(--text-dim)]">变卦</div>
              <div className="mt-2 font-display text-2xl font-light text-white">
                {result?.changedHexagram ?? '待生成'}
              </div>
            </div>
          </div>

          {/* Moving lines info */}
          <div className="mb-6 rounded-xl bg-[var(--bg-elevated)] p-5 text-sm leading-7 text-[var(--text-muted)]">
            {result?.movingLines.length
              ? `动爻：第 ${result.movingLines.join('、')} 爻`
              : '静卦，无动爻'}
          </div>

          {/* Chart Details */}
          {result?.chart ? (
            <div className="space-y-4">
              {/* Meta Tags */}
              <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                <div className="rounded-lg bg-[var(--bg-elevated)] px-3 py-2.5">
                  <div className="text-[10px] text-[var(--text-dim)]">月建</div>
                  <div className="mt-1 text-white">{result.chart.monthBranch}</div>
                </div>
                <div className="rounded-lg bg-[var(--bg-elevated)] px-3 py-2.5">
                  <div className="text-[10px] text-[var(--text-dim)]">日辰</div>
                  <div className="mt-1 text-white">{result.chart.dayStem}{result.chart.dayBranch}</div>
                </div>
                <div className="rounded-lg bg-[var(--bg-elevated)] px-3 py-2.5">
                  <div className="text-[10px] text-[var(--text-dim)]">旬空</div>
                  <div className="mt-1 text-white">{result.chart.xunkong[0]}{result.chart.xunkong[1]}</div>
                </div>
                <div className="rounded-lg bg-[var(--bg-elevated)] px-3 py-2.5">
                  <div className="text-[10px] text-[var(--text-dim)]">宫</div>
                  <div className="mt-1 text-white">{result.chart.primary.palace}宫（{result.chart.primary.palaceElement}）</div>
                </div>
              </div>

              {/* Visual Yao Lines */}
              <div className="flex flex-col gap-2">
                {[...result.chart.lines].reverse().map((line) => (
                  <YaoLine key={line.position} line={line} />
                ))}
              </div>
            </div>
          ) : null}
        </div>

        {/* Summary Card */}
        <div className="card-gold animate-fade-in-up delay-300 flex flex-col rounded-2xl p-7 lg:p-8">
          <div className="mb-6 text-[10px] tracking-[0.25em] text-[var(--gold)] uppercase">{messages.result.summaryTitle}</div>
          <div className="flex flex-1 flex-col justify-center space-y-5">
            <div className="border-l-2 border-[var(--gold-dim)] pl-5 font-display text-xl leading-relaxed font-light text-white">
              {result?.summary ?? '正在等待分析结果。'}
            </div>
            <div className="rounded-xl bg-[var(--bg-elevated)] px-4 py-3">
              <div className="mb-1 text-[10px] tracking-widest text-[var(--text-dim)] uppercase">所问</div>
              <p className="text-sm leading-8 text-[var(--text-muted)]">{result?.question ?? ''}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Analysis Cards */}
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="card-solid animate-fade-in-up delay-400 rounded-2xl p-7 lg:p-8">
          <button
            onClick={() => setShowPlainAnalysis((v) => !v)}
            className="mb-5 flex w-full items-center justify-between"
          >
            <span className="text-[10px] tracking-[0.25em] text-[var(--gold)] uppercase">{messages.result.plainTitle}</span>
            <span className="text-xs text-[var(--text-dim)] transition-transform duration-200" style={{ transform: showPlainAnalysis ? 'rotate(0)' : 'rotate(-90deg)' }}>▼</span>
          </button>
          {showPlainAnalysis && (
            <p className="animate-fade-in text-sm leading-9 text-[var(--text-muted)]">{result?.plainAnalysis ?? '解读生成中…'}</p>
          )}
        </div>
        <div className="card-solid animate-fade-in-up delay-500 rounded-2xl p-7 lg:p-8">
          <button
            onClick={() => setShowProAnalysis((v) => !v)}
            className="mb-5 flex w-full items-center justify-between"
          >
            <span className="text-[10px] tracking-[0.25em] text-[var(--gold)] uppercase">{messages.result.professionalTitle}</span>
            <span className="text-xs text-[var(--text-dim)] transition-transform duration-200" style={{ transform: showProAnalysis ? 'rotate(0)' : 'rotate(-90deg)' }}>▼</span>
          </button>
          {showProAnalysis && (
            result?.professionalAnalysis ? (
              <AnnotatedText text={result.professionalAnalysis} className="animate-fade-in text-sm leading-9 text-[var(--text-muted)]" />
            ) : (
              <p className="animate-fade-in text-sm leading-9 text-[var(--text-muted)]">专业分析生成中…</p>
            )
          )}
        </div>
      </section>

      {/* Status Messages & Actions */}
      <section className="animate-fade-in-up delay-600 space-y-4 pb-8">
        {!isAuthenticated ? (
          <div className="rounded-xl border border-[rgba(184,160,112,0.12)] bg-[var(--bg-card)] p-5 text-sm leading-8 text-[var(--text-muted)]">
            这次结果已经可以继续阅读；如果你想下次回来接着看，先登录即可，系统会自动带你回到当前结果页。
          </div>
        ) : null}

        {saveState === 'error' ? (
          <div className="rounded-xl bg-[var(--bg-card)] p-4 text-sm text-[var(--error)]">
            保存失败，请稍后重试。
          </div>
        ) : null}

        {saveState === 'saved' ? (
          <div className="rounded-xl bg-[var(--bg-card)] p-4 text-sm text-[var(--success)]">
            已保存到记录。
            <Link href="/history" className="ml-3 underline underline-offset-2 transition-colors duration-200 hover:text-white">
              查看历史记录
            </Link>
          </div>
        ) : null}

        {shareState === 'error' ? (
          <div className="rounded-xl bg-[var(--bg-card)] p-4 text-sm text-[var(--error)]">
            生成分享链接失败，请稍后重试。
          </div>
        ) : null}

        {shareUrl && shareState !== 'copied' ? (
          <div className="rounded-xl bg-[var(--bg-card)] p-4 text-sm text-[var(--text-muted)]">
            分享链接：
            <a href={shareUrl} target="_blank" rel="noreferrer" className="ml-2 break-all text-[var(--gold)] underline underline-offset-2 transition-colors duration-200 hover:text-white">
              {shareUrl}
            </a>
          </div>
        ) : null}

        {shareState === 'copied' ? (
          <div className="rounded-xl bg-[var(--bg-card)] p-4 text-sm text-[var(--success)]">
            分享链接已复制到剪贴板！
          </div>
        ) : null}

        <div className="flex flex-col gap-3 pt-2 sm:flex-row">
          {isAuthenticated ? (
            <button
              onClick={handleSave}
              disabled={saveState === 'saving' || saveState === 'saved'}
              className="btn-primary rounded-full px-8 py-3.5 text-sm disabled:opacity-40"
            >
              {saveState === 'saving' ? '保存中…' : saveState === 'saved' ? '已保存' : messages.result.save}
            </button>
          ) : (
            <Link
              href={loginHref}
              onClick={() => track('click_register')}
              className="btn-primary rounded-full px-8 py-3.5 text-center text-sm"
            >
              登录后回到这条结果
            </Link>
          )}
          <button
            onClick={handleShare}
            disabled={shareState === 'sharing'}
            className="btn-secondary rounded-full px-8 py-3.5 text-sm disabled:opacity-40"
          >
            {shareState === 'sharing' ? '生成中…' : shareState === 'copied' ? '已复制' : messages.result.share}
          </button>
          <button
            className="btn-secondary rounded-full px-8 py-3.5 text-sm"
            onClick={() => router.push('/cast')}
          >
            {messages.result.restart}
          </button>
          {result && (
            <button
              className="btn-secondary rounded-full px-8 py-3.5 text-sm"
              onClick={() => { setShowShareCard(true); track('click_share_image'); }}
            >
              生成分享图
            </button>
          )}
        </div>
      </section>

      {showShareCard && result && (
        <ShareCard result={result} onClose={() => setShowShareCard(false)} />
      )}
    </div>
  );
}
