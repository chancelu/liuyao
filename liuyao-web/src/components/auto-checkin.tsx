'use client';

import { useEffect, useRef, useState } from 'react';
import { getSession } from '@/lib/supabase/auth';

/**
 * 自动签到组件 — 放在 SiteShell 中，每天首次加载自动签到。
 * 使用 localStorage 防止同一天重复请求。
 * 签到成功后弹出 toast 提示。
 */
export function AutoCheckin() {
  const fired = useRef(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;

    const today = new Date().toISOString().slice(0, 10);
    const key = 'yaojing_last_checkin';

    if (typeof window === 'undefined') return;
    if (localStorage.getItem(key) === today) return;

    (async () => {
      try {
        const session = await getSession();
        if (!session) return;

        const resp = await fetch('/api/user/checkin', {
          method: 'POST',
          headers: { Authorization: `Bearer ${session.access_token}` },
        });

        if (resp.ok) {
          localStorage.setItem(key, today);
          const data = await resp.json().catch(() => null);
          // Show toast if points were actually granted (not already checked in)
          if (data && data.granted !== false) {
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
          }
        }
      } catch {
        // silently fail
      }
    })();
  }, []);

  if (!showToast) return null;

  return (
    <div className="fixed top-6 left-1/2 z-[9999] -translate-x-1/2 animate-fade-in">
      <div className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[var(--bg-card)] px-6 py-3.5 shadow-2xl">
        <div className="flex items-center gap-3 text-sm">
          <span className="text-[var(--gold)]">✦</span>
          <span className="text-white">每日签到</span>
          <span className="font-medium text-[var(--gold)]">积分 +100</span>
        </div>
      </div>
    </div>
  );
}
