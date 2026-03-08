'use client';

import { useState } from 'react';
import { sendMagicLink } from '@/lib/supabase/auth';

interface Props {
  /** 登录成功后的回调（可选，默认刷新页面） */
  onSuccess?: () => void;
  /** 预设错误信息（如来自 URL query） */
  initialError?: string;
}

type Step = 'input' | 'sent';

export function MagicLinkForm({ onSuccess, initialError }: Props) {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<Step>('input');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(initialError ?? null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setBusy(true);
    setError(null);

    const result = await sendMagicLink(email.trim());
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
      <div className="space-y-4 rounded-2xl border border-emerald-100/15 bg-emerald-100/5 p-6 text-center">
        <div className="text-2xl">📬</div>
        <p className="text-sm leading-7 text-stone-200">
          验证邮件已发送至 <span className="text-emerald-300">{email}</span>
        </p>
        <p className="text-xs text-stone-400">
          请查收邮件并点击登录链接。链接 10 分钟内有效，若未收到请检查垃圾邮件文件夹。
        </p>
        <button
          type="button"
          onClick={() => { setStep('input'); setError(null); }}
          className="mt-2 text-xs text-stone-400 underline underline-offset-2 hover:text-stone-200"
        >
          重新输入邮箱
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="magic-email" className="block text-sm text-stone-300">
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
          className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-stone-100 placeholder-stone-500 outline-none transition focus:border-emerald-200/40 focus:ring-1 focus:ring-emerald-200/20"
        />
      </div>

      {error && (
        <p className="rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-xs text-red-300">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={busy || !email.trim()}
        className="w-full rounded-full border border-emerald-100/25 bg-emerald-100/10 px-6 py-3 text-sm text-stone-50 transition hover:border-emerald-100/40 hover:bg-emerald-100/15 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {busy ? '发送中…' : '发送登录链接'}
      </button>

      <p className="text-center text-xs text-stone-500">
        无需密码，点击邮件链接即可登录 / 注册。
      </p>
    </form>
  );
}
