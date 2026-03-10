'use client';

import { useState } from 'react';
import { sendOtpCode, verifyOtpCode } from '@/lib/supabase/auth';

interface Props {
  onSuccess?: () => void;
  initialError?: string;
  initialNext?: string;
  nextLabel?: string;
}

type Step = 'email' | 'code' | 'done';

export function MagicLinkForm({ onSuccess, initialError, initialNext, nextLabel }: Props) {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<Step>('email');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(initialError ?? null);

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setBusy(true);
    setError(null);

    const result = await sendOtpCode(email.trim());
    setBusy(false);

    if (result.success) {
      setStep('code');
    } else {
      setError(result.message);
    }
  }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim() || code.trim().length !== 6) return;
    setBusy(true);
    setError(null);

    const result = await verifyOtpCode(email.trim(), code.trim());
    setBusy(false);

    if (result.success) {
      setStep('done');
      onSuccess?.();
      // Redirect after short delay
      const next = initialNext ?? '/';
      setTimeout(() => {
        window.location.href = next;
      }, 800);
    } else {
      setError(result.message);
    }
  }

  if (step === 'done') {
    return (
      <div className="space-y-4 text-center">
        <div className="font-display text-2xl">✓</div>
        <p className="text-sm leading-7 text-[var(--text-muted)]">
          登录成功，正在跳转…
        </p>
      </div>
    );
  }

  if (step === 'code') {
    return (
      <form onSubmit={handleVerifyCode} className="space-y-5">
        <div className="space-y-3 text-center">
          <p className="text-sm leading-7 text-[var(--text-muted)]">
            验证码已发送至 <span className="text-white">{email}</span>
          </p>
          <p className="text-xs text-[var(--text-dim)]">
            请查收邮件，输入 6 位数验证码。若未收到请检查垃圾邮件。
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="otp-code" className="block text-[10px] tracking-[0.25em] text-[var(--text-dim)] uppercase">
            验证码
          </label>
          <input
            id="otp-code"
            type="text"
            inputMode="numeric"
            pattern="[0-9]{6}"
            maxLength={6}
            required
            autoFocus
            autoComplete="one-time-code"
            placeholder="000000"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            className="w-full rounded-lg border border-[rgba(255,255,255,0.06)] bg-[var(--bg-deep)] px-5 py-3.5 text-center font-mono text-2xl tracking-[0.5em] text-white placeholder-[var(--text-dim)] outline-none transition-colors focus:border-[rgba(255,255,255,0.15)]"
          />
        </div>

        {error && (
          <p className="rounded-lg bg-[var(--bg-elevated)] px-4 py-3 text-xs text-[var(--error)]">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy || code.trim().length !== 6}
          className="btn-primary w-full rounded-full px-6 py-3.5 text-sm disabled:cursor-not-allowed disabled:opacity-40"
        >
          {busy ? '验证中…' : '验证并登录'}
        </button>

        <div className="flex items-center justify-center gap-4 text-xs text-[var(--text-dim)]">
          <button
            type="button"
            onClick={() => { setStep('email'); setCode(''); setError(null); }}
            className="underline underline-offset-2 transition-colors hover:text-[var(--gold)]"
          >
            换个邮箱
          </button>
          <span>·</span>
          <button
            type="button"
            onClick={async () => {
              setBusy(true);
              setError(null);
              const result = await sendOtpCode(email.trim());
              setBusy(false);
              if (!result.success) setError(result.message);
            }}
            disabled={busy}
            className="underline underline-offset-2 transition-colors hover:text-[var(--gold)]"
          >
            重新发送
          </button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handleSendCode} className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="magic-email" className="block text-[10px] tracking-[0.25em] text-[var(--text-dim)] uppercase">
          邮箱地址
        </label>
        <input
          id="magic-email"
          type="email"
          required
          autoComplete="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-[rgba(255,255,255,0.06)] bg-[var(--bg-deep)] px-5 py-3.5 text-sm text-white placeholder-[var(--text-dim)] outline-none transition-colors focus:border-[rgba(255,255,255,0.15)]"
        />
      </div>

      {error && (
        <p className="rounded-lg bg-[var(--bg-elevated)] px-4 py-3 text-xs text-[var(--error)]">
          {error}
        </p>
      )}

      {initialNext ? (
        <div className="rounded-lg bg-[var(--bg-elevated)] px-4 py-3 text-xs leading-6 text-[var(--text-muted)]">
          登录后会自动返回：<span className="text-white">{nextLabel ?? initialNext}</span>
        </div>
      ) : null}

      <button
        type="submit"
        disabled={busy || !email.trim()}
        className="btn-primary w-full rounded-full px-6 py-3.5 text-sm disabled:cursor-not-allowed disabled:opacity-40"
      >
        {busy ? '发送中…' : '发送验证码'}
      </button>

      <p className="text-center text-xs text-[var(--text-dim)]">
        无需密码，输入邮箱验证码即可登录 / 注册。
      </p>
    </form>
  );
}
