'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSession } from '@/lib/supabase/auth';

export default function AdminPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState('');

  // Grant points form
  const [uid, setUid] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  useEffect(() => {
    (async () => {
      const session = await getSession();
      if (!session) { router.replace('/login?next=/admin'); return; }
      setToken(session.access_token);

      const resp = await fetch('/api/user/profile', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (resp.ok) {
        const data = await resp.json();
        if (data.role === 'admin') {
          setAuthorized(true);
        } else {
          router.replace('/');
        }
      } else {
        router.replace('/login?next=/admin');
      }
      setLoading(false);
    })();
  }, [router]);

  async function handleGrant(e: React.FormEvent) {
    e.preventDefault();
    if (!uid.trim() || !amount) return;
    const num = parseInt(amount, 10);
    if (isNaN(num) || num <= 0) { setResult({ type: 'err', text: '积分必须为正整数' }); return; }

    setBusy(true); setResult(null);
    try {
      const resp = await fetch('/api/admin/grant-points', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ shortUid: uid.trim(), amount: num, description: description.trim() || undefined }),
      });
      const data = await resp.json();
      setBusy(false);
      if (data.success) {
        setResult({ type: 'ok', text: `已向 UID ${data.targetUid} 发放 ${data.amount} 积分，当前余额 ${data.newBalance}` });
        setUid(''); setAmount(''); setDescription('');
      } else {
        setResult({ type: 'err', text: data.error });
      }
    } catch {
      setBusy(false);
      setResult({ type: 'err', text: '网络错误' });
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="animate-breathe text-sm text-[var(--text-dim)]">验证权限…</div>
      </div>
    );
  }

  if (!authorized) return null;

  const inputClass = 'w-full rounded-lg border border-[rgba(255,255,255,0.06)] bg-[var(--bg-deep)] px-4 py-3 text-sm text-white placeholder-[var(--text-dim)] outline-none focus:border-[rgba(255,255,255,0.15)]';

  return (
    <div className="glow-top mx-auto max-w-xl space-y-8">
      <div className="animate-fade-in-up">
        <div className="text-[10px] tracking-[0.4em] text-[var(--text-dim)] uppercase">管理后台</div>
        <h1 className="mt-2 font-display text-2xl font-extralight tracking-[0.02em] text-white">积分管理</h1>
        <div className="mt-6 h-px w-full bg-[rgba(255,255,255,0.06)]" />
      </div>

      <div className="animate-fade-in-up delay-100 card-solid rounded-2xl p-6 sm:p-8">
        <div className="mb-6 text-[10px] tracking-[0.25em] text-[var(--gold)] uppercase">发放积分</div>

        <form onSubmit={handleGrant} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-[10px] tracking-[0.25em] text-[var(--text-dim)] uppercase">用户 UID（8位数字）</label>
            <input type="text" required maxLength={8} pattern="[0-9]{8}" placeholder="00000000"
              value={uid} onChange={(e) => setUid(e.target.value.replace(/\D/g, '').slice(0, 8))}
              className={`${inputClass} font-mono tracking-widest`} />
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] tracking-[0.25em] text-[var(--text-dim)] uppercase">积分数量</label>
            <input type="number" required min={1} placeholder="100"
              value={amount} onChange={(e) => setAmount(e.target.value)}
              className={inputClass} />
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] tracking-[0.25em] text-[var(--text-dim)] uppercase">备注（可选）</label>
            <input type="text" placeholder="发放原因"
              value={description} onChange={(e) => setDescription(e.target.value)}
              className={inputClass} />
          </div>

          <button type="submit" disabled={busy || !uid.trim() || !amount}
            className="btn-primary w-full rounded-full px-6 py-3.5 text-sm disabled:cursor-not-allowed disabled:opacity-40">
            {busy ? '发放中…' : '确认发放'}
          </button>
        </form>

        {result && (
          <p className={`mt-4 rounded-lg bg-[var(--bg-elevated)] px-4 py-3 text-xs ${result.type === 'ok' ? 'text-[var(--success)]' : 'text-[var(--error)]'}`}>
            {result.text}
          </p>
        )}
      </div>

      <div className="text-center">
        <a href="/profile" className="text-xs text-[var(--text-dim)] underline underline-offset-2 transition-colors hover:text-[var(--gold)]">
          返回个人中心
        </a>
      </div>
    </div>
  );
}
