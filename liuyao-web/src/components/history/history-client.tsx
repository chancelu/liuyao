'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getSession } from '@/lib/supabase/auth';
import { listDivinationsApi } from '@/lib/api/client';
import type { DivinationListItem } from '@/lib/api/types';
import { getMessages } from '@/lib/i18n';

const messages = getMessages();

const CATEGORY_LABELS: Record<string, string> = {
  relationship: '感情',
  career: '事业',
  wealth: '财运',
  health: '健康',
  study: '学业',
  lost: '失物',
  other: '其他',
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function HistoryClient() {
  const [items, setItems] = useState<DivinationListItem[] | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const session = await getSession();
      if (cancelled) return;

      if (!session) {
        setIsLoggedIn(false);
        return;
      }

      setIsLoggedIn(true);
      const res = await listDivinationsApi(session.access_token);
      if (!cancelled) {
        setItems(res.success ? res.data.items : []);
      }
    }

    void load();
    return () => { cancelled = true; };
  }, []);

  if (isLoggedIn === null) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-[var(--text-dim)]">
        加载中…
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="rounded-2xl border border-dashed border-[rgba(196,149,107,0.12)] bg-[var(--bg-card)] p-10 text-center">
        <p className="text-sm text-[var(--text-muted)]">登录后才能查看历史记录。</p>
        <Link
          href="/login?next=/history"
          className="btn-primary mt-5 inline-flex rounded-full px-6 py-3 text-sm"
        >
          去登录
        </Link>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[rgba(196,149,107,0.12)] bg-[var(--bg-card)] p-10 text-center">
        <p className="text-sm text-[var(--text-muted)]">{messages.history.empty}</p>
        <Link
          href="/cast"
          className="btn-primary mt-5 inline-flex rounded-full px-6 py-3 text-sm"
        >
          {messages.history.cta}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div
          key={item.id}
          className="card-solid rounded-2xl p-6 transition-all duration-300"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <span className="rounded-full border border-[rgba(196,149,107,0.15)] px-2.5 py-0.5 text-xs text-[var(--gold)]">
                  {CATEGORY_LABELS[item.category] ?? item.category}
                </span>
                <span className="text-xs text-[var(--text-dim)]">{formatDate(item.createdAt)}</span>
              </div>
              <p className="truncate text-base text-[var(--text-primary)]">{item.question}</p>
              {item.summary ? (
                <p className="text-sm leading-6 text-[var(--text-muted)]">{item.summary}</p>
              ) : null}
              {item.primaryHexagram ? (
                <p className="text-xs text-[var(--text-dim)]">
                  {item.primaryHexagram}
                  {item.changedHexagram ? ` → ${item.changedHexagram}` : ''}
                </p>
              ) : null}
            </div>
            <div className="flex shrink-0 flex-col gap-2 text-right">
              <Link
                href={`/result/${item.id}`}
                className="btn-secondary rounded-full px-4 py-2 text-xs"
              >
                查看详情
              </Link>
              <Link
                href="/cast"
                className="rounded-full border border-[rgba(196,149,107,0.08)] px-4 py-2 text-xs text-[var(--text-dim)] transition-colors duration-200 hover:border-[rgba(196,149,107,0.2)] hover:text-[var(--text-muted)]"
              >
                再次起卦
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
