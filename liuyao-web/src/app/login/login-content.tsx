'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useI18n } from '@/lib/i18n';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import {
  sendOtpCode,
  verifyOtpCode,
  signUpWithEmail,
} from '@/lib/supabase/auth';

type View = 'login' | 'register';
type OtpStep = 'email' | 'code' | 'done';

export function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorParam = searchParams.get('error') ?? undefined;
  const next = searchParams.get('next');
  const { messages } = useI18n();

  const nextLabel = useMemo(() => {
    const d = messages.login.nextDescriptions;
    if (!next || next === '/') return d.home;
    if (next.startsWith('/cast/ritual')) return d.ritual;
    if (next.startsWith('/cast/processing')) return d.processing;
    if (next.startsWith('/cast')) return d.cast;
    if (next.startsWith('/result/')) return d.result;
    if (next.startsWith('/history')) return d.history;
    if (next.startsWith('/profile')) return d.profile;
    return d.default;
  }, [next, messages]);

  const [view, setView] = useState<View>('login');

  // OTP state
  const [otpEmail, setOtpEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpStep, setOtpStep] = useState<OtpStep>('email');

  // Register state
  const [regEmail, setRegEmail] = useState('');

  // Shared
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(errorParam ?? null);
  const [success, setSuccess] = useState<string | null>(null);

  const destination = next || '/';

  useEffect(() => {
    let cancelled = false;
    try {
      const client = getSupabaseBrowserClient();
      client.auth.getSession().then(({ data }) => {
        if (!cancelled && data.session) {
          router.replace(destination);
          router.refresh();
        }
      });
      const { data: { subscription } } = client.auth.onAuthStateChange((event, session) => {
        if (!cancelled && session && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
          router.replace(destination);
          router.refresh();
        }
      });
      return () => { cancelled = true; subscription.unsubscribe(); };
    } catch {
      return () => { cancelled = true; };
    }
  }, [destination, router]);

  function switchView(v: View) {
    setView(v);
    setError(null);
    setSuccess(null);
  }

  // ── OTP handlers ──
  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!otpEmail.trim()) return;
    setBusy(true); setError(null);
    const res = await sendOtpCode(otpEmail.trim());
    setBusy(false);
    if (res.success) setOtpStep('code');
    else setError(res.message);
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    if (otpCode.trim().length < 6) return;
    setBusy(true); setError(null);
    const res = await verifyOtpCode(otpEmail.trim(), otpCode.trim());
    setBusy(false);
    if (res.success) {
      setOtpStep('done');
      setTimeout(() => { window.location.href = destination; }, 600);
    } else setError(res.message);
  }

  // ── Register ──
  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!regEmail.trim()) return;
    setBusy(true); setError(null);
    const res = await signUpWithEmail(regEmail.trim());
    setBusy(false);
    if (res.success) {
      setSuccess(res.message);
    } else setError(res.message);
  }

  const inputClass = 'w-full rounded-xl border border-[rgba(196,149,107,0.10)] bg-[var(--bg-elevated)] px-5 py-3.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-dim)] outline-none transition-colors duration-300 focus:border-[rgba(196,149,107,0.30)]';
  const labelClass = 'block text-[10px] tracking-[0.25em] text-[var(--text-dim)] uppercase';

  // ── Done state ──
  if (otpStep === 'done' && view === 'login') {
    return (
      <div className="space-y-4 text-center">
        <div className="font-display text-2xl text-[var(--gold)]">✓</div>
        <p className="text-sm leading-7 text-[var(--text-muted)]">{messages.login.success}</p>
      </div>
    );
  }

  // ═══════════════════════════════════════════
  // Register view
  // ═══════════════════════════════════════════
  if (view === 'register') {
    return (
      <div className="space-y-6">
        {error && (
          <p className="rounded-xl bg-[var(--bg-elevated)] px-4 py-3 text-xs text-[var(--error)]">{error}</p>
        )}
        {success && (
          <p className="rounded-xl bg-[var(--bg-elevated)] px-4 py-3 text-xs text-[var(--success)]">{success}</p>
        )}
        <form onSubmit={handleRegister} className="space-y-5">
          <div className="space-y-3 text-center">
            <p className="text-sm leading-7 text-[var(--text-muted)]">{messages.login.register.description}</p>
          </div>
          <div className="space-y-2">
            <label htmlFor="reg-email" className={labelClass}>{messages.login.emailLabel}</label>
            <input id="reg-email" type="email" required autoComplete="email" placeholder={messages.login.emailPlaceholder}
              value={regEmail} onChange={(e) => setRegEmail(e.target.value)} className={inputClass} />
          </div>
          <button type="submit" disabled={busy || !regEmail.trim()}
            className="btn-primary w-full rounded-full px-6 py-3.5 text-sm disabled:cursor-not-allowed disabled:opacity-40">
            {busy ? messages.login.register.submitting : messages.login.register.submit}
          </button>
          <p className="text-center text-xs text-[var(--text-dim)]">{messages.login.register.emailHint}</p>
        </form>
        <div className="text-center">
          <button type="button" onClick={() => switchView('login')}
            className="text-xs text-[var(--text-dim)] underline underline-offset-2 transition-colors hover:text-[var(--gold)]">
            {messages.login.register.backToLogin}
          </button>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════
  // Login view (OTP only)
  // ═══════════════════════════════════════════
  return (
    <div className="space-y-6">
      {/* Next hint */}
      {next && (
        <div className="rounded-xl bg-[var(--bg-elevated)] px-4 py-3 text-xs leading-6 text-[var(--text-muted)]">
          {messages.login.nextHint}<span className="text-[var(--text-primary)]">{nextLabel}</span>
        </div>
      )}

      {/* Error / Success */}
      {error && (
        <p className="rounded-xl bg-[var(--bg-elevated)] px-4 py-3 text-xs text-[var(--error)]">{error}</p>
      )}
      {success && (
        <p className="rounded-xl bg-[var(--bg-elevated)] px-4 py-3 text-xs text-[var(--success)]">{success}</p>
      )}

      {/* ═══ OTP Email Step ═══ */}
      {otpStep === 'email' && (
        <form onSubmit={handleSendOtp} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="otp-email" className={labelClass}>{messages.login.emailLabel}</label>
            <input id="otp-email" type="email" required autoComplete="email" placeholder={messages.login.emailPlaceholder}
              value={otpEmail} onChange={(e) => setOtpEmail(e.target.value)} className={inputClass} />
          </div>
          <button type="submit" disabled={busy || !otpEmail.trim()}
            className="btn-primary w-full rounded-full px-6 py-3.5 text-sm disabled:cursor-not-allowed disabled:opacity-40">
            {busy ? messages.login.sending : messages.login.sendOtp}
          </button>
          <p className="text-center text-xs text-[var(--text-dim)]">{messages.login.otpHint}</p>
        </form>
      )}

      {/* ═══ OTP Code Step ═══ */}
      {otpStep === 'code' && (
        <form onSubmit={handleVerifyOtp} className="space-y-5">
          <div className="space-y-3 text-center">
            <p className="text-sm leading-7 text-[var(--text-muted)]">
              {messages.login.otpSentTo} <span className="text-[var(--text-primary)]">{otpEmail}</span>
            </p>
          </div>
          <div className="space-y-2">
            <label htmlFor="otp-code" className={labelClass}>{messages.login.codeLabel}</label>
            <input id="otp-code" type="text" inputMode="numeric" pattern="[0-9]{6,8}" maxLength={8}
              required autoFocus autoComplete="one-time-code" placeholder="000000"
              value={otpCode} onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 8))}
              className={`${inputClass} text-center font-mono text-2xl tracking-[0.3em]`} />
          </div>
          <button type="submit" disabled={busy || otpCode.trim().length < 6}
            className="btn-primary w-full rounded-full px-6 py-3.5 text-sm disabled:cursor-not-allowed disabled:opacity-40">
            {busy ? messages.login.verifying : messages.login.verifyAndLogin}
          </button>
          <div className="flex items-center justify-center gap-4 text-xs text-[var(--text-dim)]">
            <button type="button" onClick={() => { setOtpStep('email'); setOtpCode(''); setError(null); }}
              className="underline underline-offset-2 transition-colors hover:text-[var(--gold)]">{messages.login.changeEmail}</button>
            <span>·</span>
            <button type="button" disabled={busy}
              onClick={async () => { setBusy(true); setError(null); const r = await sendOtpCode(otpEmail.trim()); setBusy(false); if (!r.success) setError(r.message); }}
              className="underline underline-offset-2 transition-colors hover:text-[var(--gold)]">{messages.login.resend}</button>
          </div>
        </form>
      )}

      {/* Bottom: register link */}
      <div className="flex justify-end">
        <button type="button" onClick={() => switchView('register')}
          className="text-xs text-[var(--text-dim)] transition-colors hover:text-[var(--gold)]">
          {messages.login.registerLink}
        </button>
      </div>
    </div>
  );
}
