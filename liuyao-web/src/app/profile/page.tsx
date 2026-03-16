'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/lib/i18n';
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

export default function ProfilePage() {
  const router = useRouter();
  const { messages, locale } = useI18n();
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
    if (!session) { setEmailMsg({ type: 'err', text: messages.profile.email.relogin }); setEmailBusy(false); return; }

    try {
      const resp = await fetch('/api/user/change-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ newEmail: newEmail.trim() }),
      });
      const data = await resp.json();
      setEmailBusy(false);
      if (data.success) {
        setEmailMsg({ type: 'ok', text: data.message || messages.profile.email.updated });
        setChangingEmail(false);
        setNewEmail('');
        const p = await fetchProfile(session.access_token);
        if (p) setProfile(p);
      } else {
        setEmailMsg({ type: 'err', text: data.error });
      }
    } catch {
      setEmailBusy(false);
      setEmailMsg({ type: 'err', text: messages.profile.email.networkError });
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
        <div className="animate-breathe text-sm text-[var(--text-dim)]">{messages.common.loading}</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-[var(--text-dim)]">{messages.profile.loadFailed}</p>
      </div>
    );
  }

  const avatarSrc = profile.avatarUrl || generateAvatarSvg(profile.email || profile.shortUid);
  const typeLabels = messages.profile.pointsLog.types;

  return (
    <div className="glow-top mx-auto max-w-2xl space-y-8">
      {/* Header */}
      <div className="animate-fade-in-up">
        <div className="text-[10px] tracking-[0.4em] text-[var(--text-dim)] uppercase">{messages.profile.title}</div>
        <h1 className="mt-2 font-display text-2xl font-extralight tracking-[0.02em] text-white sm:text-3xl">{messages.profile.subtitle}</h1>
        <div className="mt-6 h-px w-full bg-[rgba(255,255,255,0.06)]" />
      </div>

      {/* Profile card */}
      <div className="animate-fade-in-up delay-100 card-solid rounded-2xl p-5 sm:p-8">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-6">
          <div className="relative shrink-0">
            <img
              src={avatarSrc}
              alt={messages.profile.avatarAlt}
              className="h-16 w-16 rounded-full border border-[rgba(255,255,255,0.1)] object-cover sm:h-20 sm:w-20"
            />
          </div>
          <div className="min-w-0 flex-1 space-y-2 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start sm:gap-3">
              <span className="truncate font-display text-base text-white sm:text-lg">{profile.email}</span>
              {profile.role === 'admin' && (
                <span className="rounded-full bg-[rgba(184,160,112,0.15)] px-2.5 py-0.5 text-[10px] text-[var(--gold)]">{messages.profile.admin}</span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-[var(--text-dim)]">
              <span>{messages.profile.uid}: {profile.shortUid}</span>
              <button onClick={copyUid} className="text-[var(--text-muted)] transition-colors hover:text-[var(--gold)]">
                {copied ? messages.profile.copied : messages.profile.copy}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Points card */}
      <div className="animate-fade-in-up delay-200 card-gold rounded-2xl p-6 sm:p-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] tracking-[0.25em] text-[var(--gold)] uppercase">{messages.profile.points.title}</div>
            <div className="mt-2 font-display text-4xl font-extralight text-white">{profile.points}</div>
          </div>
          <div className="text-right text-xs text-[var(--text-dim)]">
            <div>{messages.profile.points.checkinDaily}</div>
            <div>{messages.profile.points.shareDaily}</div>
          </div>
        </div>
      </div>

      {/* Email management */}
      <div className="animate-fade-in-up delay-300 card-solid rounded-2xl p-6 sm:p-8">
        <div className="mb-4 text-[10px] tracking-[0.25em] text-[var(--text-dim)] uppercase">{messages.profile.email.title}</div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-white">{profile.email}</span>
          {!changingEmail && (
            <button onClick={() => setChangingEmail(true)}
              className="text-xs text-[var(--text-muted)] underline underline-offset-2 transition-colors hover:text-[var(--gold)]">
              {messages.profile.email.change}
            </button>
          )}
        </div>

        {changingEmail && (
          <form onSubmit={handleChangeEmail} className="mt-4 space-y-3">
            <input type="email" required placeholder={messages.profile.email.newPlaceholder} value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="w-full rounded-lg border border-[rgba(255,255,255,0.06)] bg-[var(--bg-deep)] px-4 py-3 text-sm text-white placeholder-[var(--text-dim)] outline-none focus:border-[rgba(255,255,255,0.15)]" />
            <div className="flex gap-2">
              <button type="submit" disabled={emailBusy}
                className="btn-primary rounded-full px-6 py-2.5 text-xs disabled:opacity-40">
                {emailBusy ? messages.profile.email.confirming : messages.profile.email.confirm}
              </button>
              <button type="button" onClick={() => { setChangingEmail(false); setNewEmail(''); setEmailMsg(null); }}
                className="btn-secondary rounded-full px-6 py-2.5 text-xs">{messages.profile.email.cancel}</button>
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
          <div className="mb-4 text-[10px] tracking-[0.25em] text-[var(--text-dim)] uppercase">{messages.profile.pointsLog.title}</div>
          <div className="space-y-3">
            {pointsLog.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between rounded-lg bg-[var(--bg-elevated)] px-4 py-3">
                <div>
                  <div className="text-sm text-white">{typeLabels[entry.type as keyof typeof typeLabels] || entry.type}</div>
                  <div className="text-[10px] text-[var(--text-dim)]">
                    {new Date(entry.createdAt).toLocaleString(locale === 'en' ? 'en-US' : 'zh-CN')}
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
            {messages.profile.adminLink}
          </a>
        </div>
      )}
    </div>
  );
}
