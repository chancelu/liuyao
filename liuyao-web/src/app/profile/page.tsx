'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getSession } from '@/lib/supabase/auth';

interface Profile {
  id: string;
  email: string;
  shortUid: string;
  avatarUrl: string | null;
  role: string;
  points: number;
  createdAt: string;
}

interface PointsLogEntry {
  id: string;
  amount: number;
  type: string;
  description: string | null;
  createdAt: string;
}

function generateAvatarSvg(seed: string): string {
  // Simple deterministic color from seed
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  const bg = `hsl(${h}, 45%, 25%)`;
  const fg = `hsl(${h}, 45%, 75%)`;
  const letter = (seed[0] || '?').toUpperCase();
  return `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="80" height="80" fill="${bg}" rx="40"/><text x="40" y="40" dy=".35em" text-anchor="middle" fill="${fg}" font-size="32" font-family="sans-serif">${letter}</text></svg>`
  )}`;
}

const TYPE_LABELS: Record<string, string> = {
  checkin: '每日签到',
  share: '分享奖励',
  admin_grant: '管理员发放',
};

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [pointsLog, setPointsLog] = useState<PointsLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [changingEmail, setChangingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [emailBusy, setEmailBusy] = useState(false);
  const [emailMsg, setEmailMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchProfile = useCallback(async (token: string) => {
    const resp = await fetch('/api/user/profile', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (resp.ok) return (await resp.json()) as Profile;
    return null;
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const session = await getSession();
      if (!session) { router.replace('/login?next=/profile'); return; }
      const token = session.access_token;

      const [p, logResp] = await Promise.all([
        fetchProfile(token),
        fetch('/api/user/points-log', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.ok ? r.json() : []).catch(() => []),
      ]);

      if (cancelled) return;
      if (p) setProfile(p);
      if (Array.isArray(logResp)) setPointsLog(logResp);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [router, fetchProfile]);

  async function handleChangeEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!newEmail.trim()) return;
    setEmailBusy(true); setEmailMsg(null);
    const session = await getSession();
    if (!session) { setEmailMsg({ type: 'err', text: '请重新登录' }); setEmailBusy(false); return; }

    try {
      const resp = await fetch('/api/user/change-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ newEmail: newEmail.trim() }),
      });
      const data = await resp.json();
      setEmailBusy(false);
      if (data.success) {
        setEmailMsg({ type: 'ok', text: data.message || '邮箱已更新' });
        setChangingEmail(false);
        setNewEmail('');
        // Refresh profile
        const p = await fetchProfile(session.access_token);
        if (p) setProfile(p);
      } else {
        setEmailMsg({ type: 'err', text: data.error });
      }
    } catch {
      setEmailBusy(false);
      setEmailMsg({ type: 'err', text: '网络错误' });
    }
  }

  function copyUid() {
    if (!profile) return;
    navigator.clipboard.writeText(profile.shortUid);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="animate-breathe text-sm text-[var(--text-dim)]">加载中…</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-[var(--text-dim)]">无法加载用户信息</p>
      </div>
    );
  }

  const avatarSrc = profile.avatarUrl || generateAvatarSvg(profile.email || profile.shortUid);

  return (
    <div className="glow-top mx-auto max-w-2xl space-y-8">
      {/* Header */}
      <div className="animate-fade-in-up">
        <div className="text-[10px] tracking-[0.4em] text-[var(--text-dim)] uppercase">个人中心</div>
        <h1 className="mt-2 font-display text-2xl font-extralight tracking-[0.02em] text-white sm:text-3xl">我的账户</h1>
        <div className="mt-6 h-px w-full bg-[rgba(255,255,255,0.06)]" />
      </div>

      {/* Profile card */}
      <div className="animate-fade-in-up delay-100 card-solid rounded-2xl p-6 sm:p-8">
        <div className="flex items-center gap-6">
          {/* Avatar */}
          <div className="relative shrink-0">
            <img
              src={avatarSrc}
              alt="头像"
              className="h-20 w-20 rounded-full border border-[rgba(255,255,255,0.1)] object-cover"
            />
          </div>

          {/* Info */}
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex items-center gap-3">
              <span className="font-display text-lg text-white">{profile.email}</span>
              {profile.role === 'admin' && (
                <span className="rounded-full bg-[rgba(184,160,112,0.15)] px-2.5 py-0.5 text-[10px] text-[var(--gold)]">管理员</span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-[var(--text-dim)]">
              <span>UID: {profile.shortUid}</span>
              <button onClick={copyUid} className="text-[var(--text-muted)] transition-colors hover:text-[var(--gold)]">
                {copied ? '已复制' : '复制'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Points card */}
      <div className="animate-fade-in-up delay-200 card-gold rounded-2xl p-6 sm:p-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] tracking-[0.25em] text-[var(--gold)] uppercase">我的积分</div>
            <div className="mt-2 font-display text-4xl font-extralight text-white">{profile.points}</div>
          </div>
          <div className="text-right text-xs text-[var(--text-dim)]">
            <div>每日签到 +100</div>
            <div>每日分享 +100</div>
          </div>
        </div>
      </div>

      {/* Email management */}
      <div className="animate-fade-in-up delay-300 card-solid rounded-2xl p-6 sm:p-8">
        <div className="mb-4 text-[10px] tracking-[0.25em] text-[var(--text-dim)] uppercase">邮箱管理</div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-white">{profile.email}</span>
          {!changingEmail && (
            <button onClick={() => setChangingEmail(true)}
              className="text-xs text-[var(--text-muted)] underline underline-offset-2 transition-colors hover:text-[var(--gold)]">
              换绑邮箱
            </button>
          )}
        </div>

        {changingEmail && (
          <form onSubmit={handleChangeEmail} className="mt-4 space-y-3">
            <input type="email" required placeholder="新邮箱地址" value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="w-full rounded-lg border border-[rgba(255,255,255,0.06)] bg-[var(--bg-deep)] px-4 py-3 text-sm text-white placeholder-[var(--text-dim)] outline-none focus:border-[rgba(255,255,255,0.15)]" />
            <div className="flex gap-2">
              <button type="submit" disabled={emailBusy}
                className="btn-primary rounded-full px-6 py-2.5 text-xs disabled:opacity-40">
                {emailBusy ? '提交中…' : '确认换绑'}
              </button>
              <button type="button" onClick={() => { setChangingEmail(false); setNewEmail(''); setEmailMsg(null); }}
                className="btn-secondary rounded-full px-6 py-2.5 text-xs">取消</button>
            </div>
          </form>
        )}

        {emailMsg && (
          <p className={`mt-3 text-xs ${emailMsg.type === 'ok' ? 'text-[var(--success)]' : 'text-[var(--error)]'}`}>
            {emailMsg.text}
          </p>
        )}
      </div>

      {/* Points log */}
      {pointsLog.length > 0 && (
        <div className="animate-fade-in-up delay-400 card-solid rounded-2xl p-6 sm:p-8">
          <div className="mb-4 text-[10px] tracking-[0.25em] text-[var(--text-dim)] uppercase">积分记录</div>
          <div className="space-y-3">
            {pointsLog.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between rounded-lg bg-[var(--bg-elevated)] px-4 py-3">
                <div>
                  <div className="text-sm text-white">{TYPE_LABELS[entry.type] || entry.type}</div>
                  <div className="text-[10px] text-[var(--text-dim)]">
                    {new Date(entry.createdAt).toLocaleString('zh-CN')}
                  </div>
                </div>
                <div className={`font-mono text-sm ${entry.amount > 0 ? 'text-[var(--success)]' : 'text-[var(--error)]'}`}>
                  {entry.amount > 0 ? '+' : ''}{entry.amount}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Admin link */}
      {profile.role === 'admin' && (
        <div className="animate-fade-in-up delay-500 text-center">
          <a href="/admin" className="text-xs text-[var(--text-dim)] underline underline-offset-2 transition-colors hover:text-[var(--gold)]">
            进入管理后台
          </a>
        </div>
      )}
    </div>
  );
}
