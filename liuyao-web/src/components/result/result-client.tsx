'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getMessages } from '@/lib/i18n';
import { getSession, getUser } from '@/lib/supabase/auth';
import { getDivinationResultFlow } from '@/services/divination-api';
import { getDivinationApi, saveDivinationApi, shareDivinationApi } from '@/lib/api/client';
import { AnnotatedText } from '@/components/ui/annotated-text';
import type { MockResult } from '@/lib/types';

const messages = getMessages();
const YAO_POS = ['初', '二', '三', '四', '五', '上'];

function YaoLine({ line }: { line: { position: number; spirit: string; relative: string; branch: string; branchElement: string; yinYang: string; moving: boolean; isShi: boolean; isYing: boolean; changedBranch?: string; changedRelative?: string } }) {
  const isYang = line.yinYang === '阳';
  const posName = `${YAO_POS[line.position - 1]}爻`;

  return (
    <div
      className={`animate-fade-in-up group grid grid-cols-[2.5rem_1fr_auto] items-center gap-4 rounded-2xl border px-5 py-4 transition-colors duration-200 ${
        line.moving
          ? 'border-[rgba(176,154,106,0.18)] bg-[rgba(176,154,106,0.04)] hover:border-[rgba(176,154,106,0.28)]'
          : 'border-[var(--border)] bg-[rgba(23,25,34,0.45)] hover:border-[var(--border-hover)]'
      }`}
      style={{ animationDelay: `${(6 - line.position) * 80}ms` }}
    >
      {/* Position & Spirit */}
      <div className="text-center">
        <div className="text-xs font-medium text-[var(--moon-silver)]">{posName}</div>
        <div className="mt-0.5 text-[10px] text-[var(--text-dim)]">{line.spirit}</div>
      </div>

      {/* Yao visual + info */}
      <div className="flex items-center gap-5">
        {/* Yao line visual */}
        <div className="w-20 shrink-0">
          {isYang ? (
            <div className="h-[5px] w-full rounded-full bg-gradient-to-r from-transparent via-[var(--moon-silver)] to-transparent" />
          ) : (
            <div className="flex gap-2.5">
              <div className="h-[5px] flex-1 rounded-full bg-gradient-to-r from-transparent via-[var(--jade-cyan-soft)] to-[var(--jade-cyan-soft)]" />
              <div className="h-[5px] flex-1 rounded-full bg-gradient-to-l from-transparent via-[var(--jade-cyan-soft)] to-[var(--jade-cyan-soft)]" />
            </div>
          )}
          {line.moving && (
            <div className="mt-1 text-center text-[10px] text-[var(--dark-gold)]">
              {isYang ? '○' : '×'}
            </div>
          )}
        </div>

        {/* Relative & Branch */}
        <div className="flex items-baseline gap-3">
          <span className="text-sm text-[var(--moon-silver)]">{line.relative}</span>
          <span className="text-xs text-[var(--text-muted)]">{line.branch}{line.branchElement}</span>
        </div>

        {/* Moving arrow */}
        {line.moving && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[var(--dark-gold-soft)]">→</span>
            <span className="text-[var(--jade-cyan-soft)]">{line.changedBranch} {line.changedRelative}</span>
          </div>
        )}
      </div>

      {/* Shi/Ying */}
      <div className="w-8 text-center">
        {line.isShi && <span className="text-xs text-[var(--dark-gold)]">世</span>}
        {line.isYing && <span className="text-xs text-[var(--jade-cyan)]">应</span>}
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
    <div className="glow-result mx-auto max-w-6xl space-y-10">
      {/* Header */}
      <div className="animate-fade-in-up space-y-3">
        <div className="text-xs tracking-[0.35em] text-[var(--jade-cyan-soft)] uppercase">Result #{id}</div>
        <h1 className="text-4xl font-light tracking-wide text-[var(--moon-silver)]">{messages.result.title}</h1>
      </div>

      {/* Main Grid: Chart + Summary */}
      <section className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        {/* Hexagram Chart */}
        <div className="card-glass animate-fade-in-up delay-100 rounded-[28px] p-7 lg:p-8">
          <div className="mb-6 text-xs tracking-[0.25em] text-[var(--jade-cyan-soft)] uppercase">{messages.result.chartTitle}</div>

          {/* Primary & Changed Hexagram Names */}
          <div className="mb-6 grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-deep)]/40 p-5">
              <div className="text-xs text-[var(--text-dim)]">本卦</div>
              <div className="mt-2 text-2xl font-light tracking-wide text-[var(--moon-silver)]">
                {result?.primaryHexagram ?? '待生成'}
              </div>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-deep)]/40 p-5">
              <div className="text-xs text-[var(--text-dim)]">变卦</div>
              <div className="mt-2 text-2xl font-light tracking-wide text-[var(--moon-silver)]">
                {result?.changedHexagram ?? '待生成'}
              </div>
            </div>
          </div>

          {/* Moving lines info */}
          <div className="mb-6 rounded-2xl border border-[var(--border)] bg-[var(--bg-deep)]/40 p-5 text-sm leading-7 text-[var(--moon-silver-soft)]">
            {result?.movingLines.length
              ? `动爻：第 ${result.movingLines.join('、')} 爻`
              : '静卦，无动爻'}
          </div>

          {/* Chart Details */}
          {result?.chart ? (
            <div className="space-y-4">
              {/* Meta Tags */}
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="rounded-lg border border-[var(--border)] bg-[var(--bg-deep)]/40 px-3 py-2 text-[var(--text-muted)]">
                  月建：{result.chart.monthBranch}
                </span>
                <span className="rounded-lg border border-[var(--border)] bg-[var(--bg-deep)]/40 px-3 py-2 text-[var(--text-muted)]">
                  日辰：{result.chart.dayStem}{result.chart.dayBranch}
                </span>
                <span className="rounded-lg border border-[var(--border)] bg-[var(--bg-deep)]/40 px-3 py-2 text-[var(--text-muted)]">
                  旬空：{result.chart.xunkong[0]}{result.chart.xunkong[1]}
                </span>
                <span className="rounded-lg border border-[var(--border)] bg-[var(--bg-deep)]/40 px-3 py-2 text-[var(--text-muted)]">
                  宫：{result.chart.primary.palace}宫（{result.chart.primary.palaceElement}）
                </span>
              </div>

              {/* Visual Yao Lines — top to bottom (上爻 → 初爻) */}
              <div className="flex flex-col gap-2">
                {[...result.chart.lines].reverse().map((line) => (
                  <YaoLine key={line.position} line={line} />
                ))}
              </div>
            </div>
          ) : null}
        </div>

        {/* Summary Card */}
        <div className="card-glass-jade animate-fade-in-up delay-300 rounded-[28px] p-7 lg:p-8">
          <div className="mb-6 text-xs tracking-[0.25em] text-[var(--jade-cyan)] uppercase">{messages.result.summaryTitle}</div>
          <div className="space-y-5">
            <div className="text-2xl leading-relaxed font-light text-[var(--moon-silver)]">
              {result?.summary ?? '正在等待分析结果。'}
            </div>
            <p className="text-sm leading-8 text-[var(--text-muted)]">{result?.question ?? ''}</p>
          </div>
        </div>
      </section>

      {/* Analysis Cards */}
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="card-glass animate-fade-in-up delay-400 rounded-[24px] p-7 lg:p-8">
          <div className="mb-5 text-xs tracking-[0.25em] text-[var(--jade-cyan-soft)] uppercase">{messages.result.plainTitle}</div>
          <p className="text-sm leading-9 text-[var(--moon-silver-soft)]">{result?.plainAnalysis ?? '解读生成中…'}</p>
        </div>
        <div className="card-glass animate-fade-in-up delay-500 rounded-[24px] p-7 lg:p-8">
          <div className="mb-5 text-xs tracking-[0.25em] text-[var(--jade-cyan-soft)] uppercase">{messages.result.professionalTitle}</div>
          {result?.professionalAnalysis ? (
            <AnnotatedText text={result.professionalAnalysis} className="text-sm leading-9 text-[var(--moon-silver-soft)]" />
          ) : (
            <p className="text-sm leading-9 text-[var(--moon-silver-soft)]">专业分析生成中…</p>
          )}
        </div>
      </section>

      {/* Status Messages & Actions */}
      <section className="animate-fade-in-up delay-600 space-y-4 pb-8">
        {!isAuthenticated ? (
          <div className="rounded-2xl border border-[rgba(176,154,106,0.15)] bg-[rgba(176,154,106,0.04)] p-5 text-sm leading-8 text-[var(--moon-silver-soft)]">
            这次结果已经可以继续阅读；如果你想下次回来接着看，先登录即可，系统会自动带你回到当前结果页。
          </div>
        ) : null}

        {saveState === 'error' ? (
          <div className="rounded-2xl border border-[rgba(139,74,74,0.20)] bg-[rgba(139,74,74,0.06)] p-4 text-sm text-[var(--error)]">
            保存失败，请稍后重试。
          </div>
        ) : null}

        {saveState === 'saved' ? (
          <div className="rounded-2xl border border-[rgba(122,173,160,0.18)] bg-[rgba(122,173,160,0.06)] p-4 text-sm text-[var(--jade-cyan)]">
            已保存到记录。
            <Link href="/history" className="ml-3 underline underline-offset-2 transition-colors duration-200 hover:text-[var(--foreground)]">
              查看历史记录
            </Link>
          </div>
        ) : null}

        {shareState === 'error' ? (
          <div className="rounded-2xl border border-[rgba(139,74,74,0.20)] bg-[rgba(139,74,74,0.06)] p-4 text-sm text-[var(--error)]">
            生成分享链接失败，请稍后重试。
          </div>
        ) : null}

        {shareUrl && shareState !== 'copied' ? (
          <div className="rounded-2xl border border-[var(--border)] bg-[rgba(200,205,216,0.03)] p-4 text-sm text-[var(--moon-silver-soft)]">
            分享链接：
            <a href={shareUrl} target="_blank" rel="noreferrer" className="ml-2 break-all text-[var(--jade-cyan)] underline underline-offset-2 transition-colors duration-200 hover:text-[var(--foreground)]">
              {shareUrl}
            </a>
          </div>
        ) : null}

        {shareState === 'copied' ? (
          <div className="rounded-2xl border border-[rgba(122,173,160,0.18)] bg-[rgba(122,173,160,0.06)] p-4 text-sm text-[var(--jade-cyan)]">
            分享链接已复制到剪贴板！
          </div>
        ) : null}

        <div className="flex flex-col gap-3 pt-2 sm:flex-row">
          {isAuthenticated ? (
            <button
              onClick={handleSave}
              disabled={saveState === 'saving' || saveState === 'saved'}
              className="btn-primary rounded-full px-8 py-3.5 text-sm tracking-wide disabled:opacity-40"
            >
              {saveState === 'saving' ? '保存中…' : saveState === 'saved' ? '已保存' : messages.result.save}
            </button>
          ) : (
            <Link
              href={loginHref}
              className="btn-primary rounded-full px-8 py-3.5 text-center text-sm tracking-wide"
            >
              登录后回到这条结果
            </Link>
          )}
          <button
            onClick={handleShare}
            disabled={shareState === 'sharing'}
            className="btn-secondary rounded-full px-8 py-3.5 text-sm tracking-wide disabled:opacity-40"
          >
            {shareState === 'sharing' ? '生成中…' : shareState === 'copied' ? '已复制' : messages.result.share}
          </button>
          <button
            className="btn-secondary rounded-full px-8 py-3.5 text-sm tracking-wide"
            onClick={() => router.push('/cast')}
          >
            {messages.result.restart}
          </button>
        </div>
      </section>
    </div>
  );
}
