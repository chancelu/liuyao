import { Suspense } from 'react';

export const dynamic = 'force-dynamic';
import { SiteShell } from '@/components/site-shell';
import { LoginContent } from './login-content';

export default function LoginPage() {
  return (
    <SiteShell>
      <div className="mx-auto max-w-md space-y-8 py-20">
        <div className="space-y-4 text-center">
          <div className="text-[10px] tracking-[0.4em] text-[var(--text-dim)] uppercase">Account</div>
          <h1 className="font-display text-2xl font-extralight text-white">登录 / 注册</h1>
          <div className="mx-auto h-px w-10 bg-[var(--gold-dim)]" />
          <p className="text-sm leading-7 text-[var(--text-muted)]">
            输入邮箱，我们将发送 6 位数验证码到你的邮箱。
          </p>
        </div>
        <div className="card-solid rounded-xl p-8">
          <Suspense fallback={<div className="text-sm text-[var(--text-dim)]">载入中…</div>}>
            <LoginContent />
          </Suspense>
        </div>
      </div>
    </SiteShell>
  );
}
