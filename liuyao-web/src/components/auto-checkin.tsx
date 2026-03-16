'use client';

import { useEffect, useRef, useState } from 'react';
import { getSession } from '@/lib/supabase/auth';
import { useI18n } from '@/lib/i18n';

/**
 * Auto check-in component — placed in SiteShell, auto check-in on first daily load.
 * Uses localStorage to prevent duplicate requests on the same day.
 */
export function AutoCheckin() {
  const fired = useRef(false);
  const [showToast, setShowToast] = useState(false);
  const { messages } = useI18n();

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
          <span className="text-white">{messages.common.checkinToast}</span>
          <span className="font-medium text-[var(--gold)]">{messages.common.checkinPoints}</span>
        </div>
      </div>
    </div>
  );
}
