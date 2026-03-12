'use client';

import { useEffect, useRef } from 'react';
import { getSession } from '@/lib/supabase/auth';

/**
 * 自动签到组件 — 放在 SiteShell 中，每天首次加载自动签到。
 * 使用 localStorage 防止同一天重复请求。
 */
export function AutoCheckin() {
  const fired = useRef(false);

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
        }
      } catch {
        // silently fail
      }
    })();
  }, []);

  return null;
}
