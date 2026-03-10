'use client';

import { useState } from 'react';
import { sendMagicLink } from '@/lib/supabase/auth';

interface Props {
  onSuccess?: () => void;
  initialError?: string;
  initialNext?: string;
  nextLabel?: string;
}

type Step = 'input' | 'sent';

export function MagicLinkForm({ onSuccess, initialError, initialNext, nextLabel }: Props) {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<Step>('input');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(initialError ?? null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setBusy(true);
    setError(null);

    const result = await sendMagicLink(email.trim(), initialNext);
    setBusy(false);

    if (result.success) {
      setStep('sent');
      onSuccess?.();
    } else {
      setError(result.message);
    }
  }

  if (step === 'sent') {
    return (
      <div className="space-y-4 text-center">
        <div className="font-display text-2xl">📬</div>
        <p className="text-sm leading-7 text-[var(--text-muted)]">
          验证邮件已发送至 <span className="text-[var(--gold)]">{email}</span>
        </p>
        <p className="text-xs text-[var(--text-muted)]">
          请查收邮件并点击登录链接。链接 10 分钟内有效，若未收到请检查垃圾邮件文件夹。
        </p>
        {initialNext ? (
          <div className="rounded-lg bg-[var(--bg-elevated)] px-4 py-3 text-left text-xs leading-6 text-[var(--text-muted)]">
            登录完成后会自动返回：<span className="text-white">{nextLabel ?? initialNext}</span>
          </div>
        ) : null}
        <button
          type="button"
          onClick={() => { setStep('input'); setError(null); }}
          className="mt-2 text-xs text-[var(--text-muted)] underline underline-offset-2 transition-colors hover:text-[var(--gold)]"
        >
          重新输入邮箱
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
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
        {busy ? '发送中…' : '发送登录链接'}
      </button>

      <p className="text-center text-xs text-[var(--text-dim)]">
        无需密码，点击邮件链接即可登录 / 注册。
      </p>
    </form>
  );
}
