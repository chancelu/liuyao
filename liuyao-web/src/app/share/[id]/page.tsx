import Link from 'next/link';
import { SiteShell } from '@/components/site-shell';
import { getRepository } from '@/lib/repository';

const CATEGORY_LABELS: Record<string, string> = {
  relationship: '感情',
  career: '事业',
  wealth: '财运',
  health: '健康',
  study: '学业',
  lost: '失物',
  other: '其他',
};

export default async function SharePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const repo = await getRepository();
  const record = await repo.getById(id).catch(() => null);

  // Only show public records
  const isPublic = record?.isPublic ?? false;
  const result = isPublic ? record?.result ?? null : null;
  const draft = isPublic ? record?.draft ?? null : null;

  if (!isPublic || !result || !draft) {
    return (
      <SiteShell>
        <div className="mx-auto max-w-4xl rounded-[32px] border border-white/10 bg-white/5 p-8 text-center backdrop-blur">
          <div className="space-y-4">
            <div className="text-xs tracking-[0.3em] text-stone-400 uppercase">Share</div>
            <h1 className="text-3xl text-stone-50">该结果尚未公开分享</h1>
            <p className="mx-auto max-w-2xl text-sm leading-7 text-stone-300/78">
              链接已失效，或该卦例尚未开启分享。
            </p>
          </div>
          <Link href="/cast" className="mt-8 inline-flex rounded-full border border-emerald-200/25 bg-emerald-100/10 px-6 py-3 text-sm text-white hover:bg-emerald-100/15">
            我也来起一卦
          </Link>
        </div>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="rounded-[32px] border border-white/10 bg-white/5 p-8 backdrop-blur">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-white/10 px-2.5 py-0.5 text-xs text-stone-400">
                {CATEGORY_LABELS[draft.category] ?? draft.category}
              </span>
              <span className="text-xs tracking-[0.2em] text-stone-500 uppercase">六爻分享</span>
            </div>
            <p className="text-lg text-stone-100">{draft.question}</p>
          </div>
        </div>

        <div className="rounded-[32px] border border-emerald-100/12 bg-emerald-100/6 p-8 backdrop-blur">
          <div className="mb-3 text-xs tracking-[0.2em] text-stone-400 uppercase">初步结论</div>
          <div className="text-2xl leading-relaxed text-stone-50">{result.summary}</div>
          <div className="mt-4 text-sm text-stone-400">
            {result.primaryHexagram}
            {result.changedHexagram ? ` → ${result.changedHexagram}` : ''}
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/5 p-8 backdrop-blur">
          <div className="mb-4 text-xs tracking-[0.2em] text-stone-400 uppercase">白话解读</div>
          <p className="text-sm leading-8 text-stone-300">{result.plainAnalysis}</p>
        </div>

        <div className="text-center">
          <Link
            href="/cast"
            className="inline-flex rounded-full border border-emerald-200/25 bg-emerald-100/10 px-8 py-3 text-sm text-white hover:bg-emerald-100/15"
          >
            我也来起一卦
          </Link>
        </div>
      </div>
    </SiteShell>
  );
}
