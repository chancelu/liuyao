'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getMessages } from '@/lib/i18n';
import { getSession, getUser } from '@/lib/supabase/auth';
import { getDivinationResultFlow } from '@/services/divination-api';
import { getDivinationApi, saveDivinationApi, shareDivinationApi } from '@/lib/api/client';
import { setResultById } from '@/lib/storage/draft-storage';
import { buildPromptFromResult } from '@/lib/analysis/build-prompt';
import { callLLMStream } from '@/lib/api/llm-stream';
import { AnnotatedText } from '@/components/ui/annotated-text';
import { StructuredText, SummaryPoints } from '@/components/ui/structured-text';
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
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [showPlainAnalysis, setShowPlainAnalysis] = useState(true);
  const [showProAnalysis, setShowProAnalysis] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiFailed, setAiFailed] = useState(false);
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

  // If result is loaded but not AI-generated, call LLM to get real analysis
  useEffect(() => {
    if (!result || result.isAI || aiLoading || !result.chart) return;
    setAiLoading(true);

    async function fetchAIAnalysis() {
      try {
        const prompt = buildPromptFromResult(result!);
        if (!prompt) { setAiLoading(false); return; }

        const data = await callLLMStream(prompt);

        if (data) {
          const updated: MockResult = {
            ...result!,
            summary: data.summary,
            plainAnalysis: data.plainAnalysis,
            professionalAnalysis: data.professionalAnalysis,
            isAI: true,
          };
          setResultById(id, updated);
          setResult(updated);
        } else {
          setAiFailed(true);
        }
      } catch (err) {
        console.warn('[result] AI analysis fallback failed:', err);
        setAiFailed(true);
      } finally {
        setAiLoading(false);
      }
    }

    void fetchAIAnalysis();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result?.id, result?.isAI]);

  async function handleSave() {
    if (!accessToken) return;
    setSaveState('saving');
    try {
      const res = await saveDivinationApi(id, accessToken);
      if (res.success) {
        setSaveState('saved');
      } else {
        console.warn('[result] Save failed:', res.error);
        setSaveState('error');
        setTimeout(() => setSaveState('idle'), 3000);
      }
    } catch (err) {
      console.warn('[result] Save error:', err);
      setSaveState('error');
      setTimeout(() => setSaveState('idle'), 3000);
    }
  }

  async function handleShare() {
    setShareState('sharing');
    track('click_share');

    try {
      if (accessToken && saveState === 'idle') {
        await saveDivinationApi(id, accessToken).catch(() => {});
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
        // Trigger share reward
        if (accessToken) {
          fetch('/api/user/share-reward', {
            method: 'POST',
            headers: { Authorization: `Bearer ${accessToken}` },
          }).catch(() => {});
        }
      } else {
        console.warn('[result] Share failed:', res.error);
        setShareState('error');
        setTimeout(() => setShareState('idle'), 3000);
      }
    } catch (err) {
      console.warn('[result] Share error:', err);
      setShareState('error');
      setTimeout(() => setShareState('idle'), 3000);
    }
  }

  function handleCopyUrl() {
    const url = shareUrl || `${window.location.origin}/share/${id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    }).catch(() => {});
  }

  return (
    <div className="glow-top mx-auto max-w-6xl space-y-8 sm:space-y-12">
      {/* Page header */}
      <div className="animate-fade-in-up">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <div className="text-[10px] tracking-[0.4em] text-[var(--text-dim)] uppercase">Result #{id}</div>
            <h1 className="font-display text-2xl font-extralight tracking-[0.02em] text-white sm:text-4xl">{messages.result.title}</h1>
            <p className="max-w-2xl text-sm leading-8 text-[var(--text-muted)]">先看卦象结构，再看基础结论，最后展开卦象解读与断卦释义。</p>
          </div>
        </div>
        <div className="mt-8 h-px w-full bg-[rgba(255,255,255,0.06)]" />
      </div>

      {/* Main Grid: Chart + Summary */}
      <section className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        {/* Hexagram Chart */}
        <div className="card-solid animate-fade-in-up delay-100 rounded-2xl p-5 sm:p-7 lg:p-8">
          <div className="mb-6 text-[10px] tracking-[0.25em] text-[var(--gold)] uppercase">{messages.result.chartTitle}</div>

          {/* Primary & Changed Hexagram Names */}
          <div className="mb-6 grid grid-cols-2 gap-2 sm:gap-4">
            <div className="rounded-xl bg-[var(--bg-elevated)] p-3 sm:p-5">
              <div className="text-[10px] text-[var(--text-dim)]">本卦</div>
              <div className="mt-1 font-display text-lg font-light text-white sm:mt-2 sm:text-2xl">
                {result?.primaryHexagram ?? '待生成'}
              </div>
            </div>
            <div className="rounded-xl bg-[var(--bg-elevated)] p-3 sm:p-5">
              <div className="text-[10px] text-[var(--text-dim)]">变卦</div>
              <div className="mt-1 font-display text-lg font-light text-white sm:mt-2 sm:text-2xl">
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

              {/* Visual Yao Lines — Primary & Changed side by side */}
              <div className="grid grid-cols-2 gap-2 sm:gap-6">
                {/* Primary Hexagram */}
                <div>
                  <div className="mb-3 text-[10px] tracking-[0.2em] text-[var(--text-dim)] uppercase">本卦 · {result.chart.primary.name}</div>
                  <div className="flex flex-col gap-1.5">
                    {[...result.chart.lines].reverse().map((line) => (
                      <div
                        key={line.position}
                        className={`flex h-10 items-center gap-1.5 rounded-lg px-2 sm:h-14 sm:gap-3 sm:px-3 ${
                          line.moving ? 'animate-pulse-glow border border-[rgba(184,160,112,0.15)] bg-[var(--bg-elevated)]' : 'bg-[var(--bg-elevated)]'
                        }`}
                      >
                        <span className="shrink-0 text-center text-[10px] text-white sm:w-8 sm:text-[11px]">{YAO_POS[line.position - 1]}</span>
                        <div className="w-8 shrink-0 sm:w-14">
                          {line.yinYang === '阳' ? (
                            <div className="h-[3px] w-full rounded-full bg-white" />
                          ) : (
                            <div className="flex gap-1 sm:gap-2">
                              <div className="h-[3px] flex-1 rounded-full bg-[var(--text-muted)]" />
                              <div className="h-[3px] flex-1 rounded-full bg-[var(--text-muted)]" />
                            </div>
                          )}
                          {line.moving && <div className="mt-0.5 text-center text-[8px] text-[var(--gold)] sm:text-[9px]">{line.yinYang === '阳' ? '○' : '×'}</div>}
                        </div>
                        <span className="hidden text-xs text-white sm:inline">{line.relative}</span>
                        <span className="text-[9px] text-[var(--text-dim)] sm:text-[10px]">{line.branch}</span>
                        {line.isShi && <span className="ml-auto text-[9px] text-[var(--gold)] sm:text-[10px]">世</span>}
                        {line.isYing && <span className="ml-auto text-[9px] text-[var(--blue)] sm:text-[10px]">应</span>}
                      </div>
                    ))}
                  </div>
                </div>
                {/* Changed Hexagram */}
                <div>
                  <div className="mb-3 text-[10px] tracking-[0.2em] text-[var(--text-dim)] uppercase">变卦 · {result.chart.changed.name}</div>
                  <div className="flex flex-col gap-1.5">
                    {[...result.chart.lines].reverse().map((line) => {
                      const isChanged = line.moving;
                      const changedYinYang = isChanged ? (line.yinYang === '阳' ? '阴' : '阳') : line.yinYang;
                      return (
                        <div
                          key={line.position}
                          className={`flex h-10 items-center gap-1.5 rounded-lg px-2 sm:h-14 sm:gap-3 sm:px-3 ${
                            isChanged ? 'animate-pulse-glow border border-[rgba(184,160,112,0.15)] bg-[var(--bg-elevated)]' : 'bg-[var(--bg-elevated)]'
                          }`}
                        >
                          <span className="shrink-0 text-center text-[10px] text-white sm:w-8 sm:text-[11px]">{YAO_POS[line.position - 1]}</span>
                          <div className="w-8 shrink-0 sm:w-14">
                            {changedYinYang === '阳' ? (
                              <div className="h-[3px] w-full rounded-full bg-white" />
                            ) : (
                              <div className="flex gap-1 sm:gap-2">
                                <div className="h-[3px] flex-1 rounded-full bg-[var(--text-muted)]" />
                                <div className="h-[3px] flex-1 rounded-full bg-[var(--text-muted)]" />
                              </div>
                            )}
                          </div>
                          <span className="hidden text-xs text-[var(--text-muted)] sm:inline">
                            {isChanged ? (line.changedRelative ?? line.relative) : line.relative}
                          </span>
                          <span className="text-[9px] text-[var(--text-dim)] sm:text-[10px]">
                            {isChanged ? (line.changedBranch ?? line.branch) : line.branch}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Summary Card */}
        <div className="card-gold animate-fade-in-up delay-300 flex flex-col rounded-2xl p-5 sm:p-7 lg:p-8">
          <div className="mb-6 text-[10px] tracking-[0.25em] text-[var(--gold)] uppercase">{messages.result.summaryTitle}</div>
          <div className="flex flex-1 flex-col justify-center space-y-5">
            <div className="border-l-2 border-[var(--gold-dim)] pl-5">
              {result && !result.isAI && result.chart && !aiFailed
                ? <span className="animate-pulse font-display text-xl font-light text-[var(--text-dim)]">AI 正在分析卦象…</span>
                : aiFailed && !result?.isAI
                  ? <span className="font-display text-xl font-light text-[var(--text-dim)]">AI 分析暂时不可用，请稍后刷新重试。</span>
                  : result?.summary
                    ? <SummaryPoints text={String(result.summary)} />
                    : <span className="font-display text-xl font-light text-white">正在等待分析结果。</span>}
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
        <div className="card-solid animate-fade-in-up delay-400 rounded-2xl p-5 sm:p-7 lg:p-8">
          <button
            onClick={() => setShowPlainAnalysis((v) => !v)}
            className="mb-5 flex w-full items-center justify-between"
          >
            <span className="text-[10px] tracking-[0.25em] text-[var(--gold)] uppercase">{messages.result.plainTitle}</span>
            <span className="text-xs text-[var(--text-dim)] transition-transform duration-200" style={{ transform: showPlainAnalysis ? 'rotate(0)' : 'rotate(-90deg)' }}>▼</span>
          </button>
          {showPlainAnalysis && (
            result && !result.isAI && result.chart && !aiFailed
              ? <p className="animate-pulse text-sm leading-9 text-[var(--text-dim)]">AI 正在生成卦象解读，请稍候…</p>
              : aiFailed && !result?.isAI
                ? <p className="text-sm leading-9 text-[var(--text-dim)]">AI 分析暂时不可用，请稍后刷新重试。</p>
                : result?.plainAnalysis
                  ? <StructuredText text={String(result.plainAnalysis)} className="animate-fade-in" />
                  : <p className="animate-fade-in text-sm leading-9 text-[var(--text-muted)]">解读生成中…</p>
          )}
        </div>
        <div className="card-solid animate-fade-in-up delay-500 rounded-2xl p-5 sm:p-7 lg:p-8">
          <button
            onClick={() => setShowProAnalysis((v) => !v)}
            className="mb-5 flex w-full items-center justify-between"
          >
            <span className="text-[10px] tracking-[0.25em] text-[var(--gold)] uppercase">{messages.result.professionalTitle}</span>
            <span className="text-xs text-[var(--text-dim)] transition-transform duration-200" style={{ transform: showProAnalysis ? 'rotate(0)' : 'rotate(-90deg)' }}>▼</span>
          </button>
          {showProAnalysis && (
            result && !result.isAI && result.chart && !aiFailed
              ? <p className="animate-pulse text-sm leading-9 text-[var(--text-dim)]">AI 正在生成断卦释义，请稍候…</p>
              : aiFailed && !result?.isAI
                ? <p className="text-sm leading-9 text-[var(--text-dim)]">AI 分析暂时不可用，请稍后刷新重试。</p>
                : result?.professionalAnalysis
                  ? <StructuredText text={String(result.professionalAnalysis)} className="animate-fade-in" />
                  : <p className="animate-fade-in text-sm leading-9 text-[var(--text-muted)]">断卦释义生成中…</p>
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

        <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:flex-wrap sm:gap-3">
          {isAuthenticated ? (
            <button
              onClick={handleSave}
              disabled={saveState === 'saving' || saveState === 'saved'}
              className="btn-primary rounded-full px-6 py-3 text-xs disabled:opacity-40 sm:px-8 sm:py-3.5 sm:text-sm"
            >
              {saveState === 'saving' ? '保存中…' : saveState === 'saved' ? '已保存' : messages.result.save}
            </button>
          ) : (
            <Link
              href={loginHref}
              onClick={() => track('click_register')}
              className="btn-primary rounded-full px-6 py-3 text-center text-xs sm:px-8 sm:py-3.5 sm:text-sm"
            >
              登录后回到这条结果
            </Link>
          )}
          <button
            onClick={handleShare}
            disabled={shareState === 'sharing'}
            className="btn-secondary rounded-full px-6 py-3 text-xs disabled:opacity-40 sm:px-8 sm:py-3.5 sm:text-sm"
          >
            {shareState === 'sharing' ? '生成中…' : shareState === 'copied' ? '已复制' : messages.result.share}
          </button>
          <button
            className="btn-secondary rounded-full px-6 py-3 text-xs sm:px-8 sm:py-3.5 sm:text-sm"
            onClick={() => router.push('/cast')}
          >
            {messages.result.restart}
          </button>
          {result && (
            <button
              className="btn-secondary rounded-full px-6 py-3 text-xs sm:px-8 sm:py-3.5 sm:text-sm"
              onClick={() => { setShowShareCard(true); track('click_share_image'); }}
            >
              生成分享图
            </button>
          )}
          {result && (
            <button
              className="btn-secondary rounded-full px-6 py-3 text-xs sm:px-8 sm:py-3.5 sm:text-sm"
              onClick={handleCopyUrl}
            >
              {copiedUrl ? '已复制链接' : '复制分享链接'}
            </button>
          )}
        </div>
      </section>

      {showShareCard && result && (
        <ShareCard result={result} onClose={() => setShowShareCard(false)} accessToken={accessToken} />
      )}

      {/* Decorative footer */}
      <div className="footer-decoration">☰</div>
    </div>
  );
}
