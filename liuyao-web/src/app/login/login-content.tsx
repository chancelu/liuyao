'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import {
  sendOtpCode,
  verifyOtpCode,
  signInWithEmail,
  signUpWithEmail,
} from '@/lib/supabase/auth';

type Tab = 'otp' | 'password';
type View = 'login' | 'register' | 'forgot';
type OtpStep = 'email' | 'code' | 'done';

function describeNextPath(next: string | null) {
  if (!next || next === '/') return '首页';
  if (next.startsWith('/cast/ritual')) return '继续刚才的摇卦';
  if (next.startsWith('/cast/processing')) return '继续生成中的排盘';
  if (next.startsWith('/cast')) return '继续起卦';
  if (next.startsWith('/result/')) return '回到这次结果页';
  if (next.startsWith('/history')) return '查看历史记录';
  if (next.startsWith('/profile')) return '个人中心';
  return '刚才离开的页面';
}

export function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorParam = searchParams.get('error') ?? undefined;
  const next = searchParams.get('next');
  const nextLabel = useMemo(() => describeNextPath(next), [next]);

  const [tab, setTab] = useState<Tab>('otp');
  const [view, setView] = useState<View>('login');

  // OTP state
  const [otpEmail, setOtpEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpStep, setOtpStep] = useState<OtpStep>('email');

  // Password login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register state
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

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

  function switchTab(t: Tab) {
    setTab(t);
    setError(null);
    setSuccess(null);
  }

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

  // ── Password login ──
  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword) return;
    setBusy(true); setError(null);
    const res = await signInWithEmail(loginEmail.trim(), loginPassword);
    setBusy(false);
    if (res.success) {
      setTimeout(() => { window.location.href = destination; }, 600);
    } else setError(res.message);
  }

  // ── Register ──
  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!regEmail.trim() || !regPassword) return;
    if (regPassword !== regConfirm) { setError('两次密码不一致'); return; }
    if (regPassword.length < 6) { setError('密码至少 6 个字符'); return; }
    setBusy(true); setError(null);
    const res = await signUpWithEmail(regEmail.trim(), regPassword);
    setBusy(false);
    if (res.success) {
      setSuccess(res.message);
    } else setError(res.message);
  }

  // ── Forgot password ──
  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    setBusy(true); setError(null);
    try {
      const resp = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail.trim() }),
      });
      const data = await resp.json();
      setBusy(false);
      if (data.success) { setForgotSent(true); setSuccess(data.message); }
      else setError(data.error);
    } catch {
      setBusy(false);
      setError('网络错误，请重试');
    }
  }

  const inputClass = 'w-full rounded-xl border border-[rgba(196,149,107,0.10)] bg-[var(--bg-elevated)] px-5 py-3.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-dim)] outline-none transition-colors duration-300 focus:border-[rgba(196,149,107,0.30)]';
  const labelClass = 'block text-[10px] tracking-[0.25em] text-[var(--text-dim)] uppercase';

  // ── Done state ──
  if (otpStep === 'done' && tab === 'otp' && view === 'login') {
    return (
      <div className="space-y-4 text-center">
        <div className="font-display text-2xl text-[var(--gold)]">✓</div>
        <p className="text-sm leading-7 text-[var(--text-muted)]">登录成功，正在跳转…</p>
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
          <div className="space-y-2">
            <label htmlFor="reg-email" className={labelClass}>邮箱地址</label>
            <input id="reg-email" type="email" required autoComplete="email" placeholder="your@email.com"
              value={regEmail} onChange={(e) => setRegEmail(e.target.value)} className={inputClass} />
          </div>
          <div className="space-y-2">
            <label htmlFor="reg-pass" className={labelClass}>密码</label>
            <input id="reg-pass" type="password" required autoComplete="new-password" placeholder="至少 6 个字符"
              value={regPassword} onChange={(e) => setRegPassword(e.target.value)} className={inputClass} />
          </div>
          <div className="space-y-2">
            <label htmlFor="reg-confirm" className={labelClass}>确认密码</label>
            <input id="reg-confirm" type="password" required autoComplete="new-password" placeholder="再输入一次"
              value={regConfirm} onChange={(e) => setRegConfirm(e.target.value)} className={inputClass} />
          </div>
          <button type="submit" disabled={busy || !regEmail.trim() || !regPassword || !regConfirm}
            className="btn-primary w-full rounded-full px-6 py-3.5 text-sm disabled:cursor-not-allowed disabled:opacity-40">
            {busy ? '注册中…' : '注册'}
          </button>
          <p className="text-center text-xs text-[var(--text-dim)]">注册后请查收验证邮件完成激活。</p>
        </form>
        <div className="text-center">
          <button type="button" onClick={() => switchView('login')}
            className="text-xs text-[var(--text-dim)] underline underline-offset-2 transition-colors hover:text-[var(--gold)]">
            已有账号？返回登录
          </button>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════
  // Forgot password view
  // ═══════════════════════════════════════════
  if (view === 'forgot') {
    return (
      <div className="space-y-6">
        {error && (
          <p className="rounded-xl bg-[var(--bg-elevated)] px-4 py-3 text-xs text-[var(--error)]">{error}</p>
        )}
        {success && (
          <p className="rounded-xl bg-[var(--bg-elevated)] px-4 py-3 text-xs text-[var(--success)]">{success}</p>
        )}
        <form onSubmit={handleForgotPassword} className="space-y-5">
          <div className="space-y-3 text-center">
            <p className="text-sm leading-7 text-[var(--text-muted)]">输入注册邮箱，我们将发送密码重置链接。</p>
          </div>
          <div className="space-y-2">
            <label htmlFor="forgot-email" className={labelClass}>邮箱地址</label>
            <input id="forgot-email" type="email" required autoComplete="email" placeholder="your@email.com"
              value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} className={inputClass} />
          </div>
          <button type="submit" disabled={busy || !forgotEmail.trim() || forgotSent}
            className="btn-primary w-full rounded-full px-6 py-3.5 text-sm disabled:cursor-not-allowed disabled:opacity-40">
            {busy ? '发送中…' : forgotSent ? '已发送' : '发送重置邮件'}
          </button>
        </form>
        <div className="text-center">
          <button type="button" onClick={() => switchView('login')}
            className="text-xs text-[var(--text-dim)] underline underline-offset-2 transition-colors hover:text-[var(--gold)]">
            返回登录
          </button>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════
  // Login view (default)
  // ═══════════════════════════════════════════
  return (
    <div className="space-y-6">
      {/* Tab bar */}
      <div className="flex gap-1 rounded-xl bg-[var(--bg-elevated)] p-1">
        {([
          ['otp', '验证码登录'],
          ['password', '密码登录'],
        ] as [Tab, string][]).map(([key, label]) => (
          <button
            key={key}
            onClick={() => switchTab(key)}
            className={`flex-1 rounded-lg py-2.5 text-xs tracking-wider transition-all duration-300 ${
              tab === key
                ? 'bg-[rgba(196,149,107,0.08)] text-[var(--gold)]'
                : 'text-[var(--text-dim)] hover:text-[var(--text-muted)]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Next hint */}
      {next && (
        <div className="rounded-xl bg-[var(--bg-elevated)] px-4 py-3 text-xs leading-6 text-[var(--text-muted)]">
          登录后会自动返回：<span className="text-[var(--text-primary)]">{nextLabel}</span>
        </div>
      )}

      {/* Error / Success */}
      {error && (
        <p className="rounded-xl bg-[var(--bg-elevated)] px-4 py-3 text-xs text-[var(--error)]">{error}</p>
      )}
      {success && (
        <p className="rounded-xl bg-[var(--bg-elevated)] px-4 py-3 text-xs text-[var(--success)]">{success}</p>
      )}

      {/* ═══ OTP Tab ═══ */}
      {tab === 'otp' && otpStep === 'email' && (
        <form onSubmit={handleSendOtp} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="otp-email" className={labelClass}>邮箱地址</label>
            <input id="otp-email" type="email" required autoComplete="email" placeholder="your@email.com"
              value={otpEmail} onChange={(e) => setOtpEmail(e.target.value)} className={inputClass} />
          </div>
          <button type="submit" disabled={busy || !otpEmail.trim()}
            className="btn-primary w-full rounded-full px-6 py-3.5 text-sm disabled:cursor-not-allowed disabled:opacity-40">
            {busy ? '发送中…' : '发送验证码'}
          </button>
          <p className="text-center text-xs text-[var(--text-dim)]">无需密码，输入邮箱验证码即可登录。</p>
        </form>
      )}

      {tab === 'otp' && otpStep === 'code' && (
        <form onSubmit={handleVerifyOtp} className="space-y-5">
          <div className="space-y-3 text-center">
            <p className="text-sm leading-7 text-[var(--text-muted)]">
              验证码已发送至 <span className="text-[var(--text-primary)]">{otpEmail}</span>
            </p>
          </div>
          <div className="space-y-2">
            <label htmlFor="otp-code" className={labelClass}>验证码</label>
            <input id="otp-code" type="text" inputMode="numeric" pattern="[0-9]{6,8}" maxLength={8}
              required autoFocus autoComplete="one-time-code" placeholder="000000"
              value={otpCode} onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 8))}
              className={`${inputClass} text-center font-mono text-2xl tracking-[0.3em]`} />
          </div>
          <button type="submit" disabled={busy || otpCode.trim().length < 6}
            className="btn-primary w-full rounded-full px-6 py-3.5 text-sm disabled:cursor-not-allowed disabled:opacity-40">
            {busy ? '验证中…' : '验证并登录'}
          </button>
          <div className="flex items-center justify-center gap-4 text-xs text-[var(--text-dim)]">
            <button type="button" onClick={() => { setOtpStep('email'); setOtpCode(''); setError(null); }}
              className="underline underline-offset-2 transition-colors hover:text-[var(--gold)]">换个邮箱</button>
            <span>·</span>
            <button type="button" disabled={busy}
              onClick={async () => { setBusy(true); setError(null); const r = await sendOtpCode(otpEmail.trim()); setBusy(false); if (!r.success) setError(r.message); }}
              className="underline underline-offset-2 transition-colors hover:text-[var(--gold)]">重新发送</button>
          </div>
        </form>
      )}

      {/* ═══ Password Tab ═══ */}
      {tab === 'password' && (
        <form onSubmit={handlePasswordLogin} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="pw-email" className={labelClass}>邮箱地址</label>
            <input id="pw-email" type="email" required autoComplete="email" placeholder="your@email.com"
              value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} className={inputClass} />
          </div>
          <div className="space-y-2">
            <label htmlFor="pw-pass" className={labelClass}>密码</label>
            <input id="pw-pass" type="password" required autoComplete="current-password" placeholder="••••••"
              value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className={inputClass} />
          </div>
          <button type="submit" disabled={busy || !loginEmail.trim() || !loginPassword}
            className="btn-primary w-full rounded-full px-6 py-3.5 text-sm disabled:cursor-not-allowed disabled:opacity-40">
            {busy ? '登录中…' : '登录'}
          </button>
          <div className="text-center">
            <button type="button" onClick={() => switchView('forgot')}
              className="text-xs text-[var(--text-dim)] underline underline-offset-2 transition-colors hover:text-[var(--gold)]">
              忘记密码？
            </button>
          </div>
        </form>
      )}

      {/* Bottom: register link */}
      <div className="flex justify-end">
        <button type="button" onClick={() => switchView('register')}
          className="text-xs text-[var(--text-dim)] transition-colors hover:text-[var(--gold)]">
          新用户注册 →
        </button>
      </div>
    </div>
  );
}
