import { Suspense } from 'react';

export const dynamic = 'force-dynamic';
import { SiteShell } from '@/components/site-shell';
import { LoginContent } from './login-content';

export default function LoginPage() {
  return (
    <SiteShell>
      <div className="mx-auto max-w-md space-y-8 py-20">
        <div className="space-y-4 text-center">
          <div className="text-[10px] tracking-[0.5em] text-[var(--dark-gold-dim)] uppercase">Account</div>
          <h1 className="font-display text-2xl font-extralight tracking-wide text-[var(--cream)]">登录 / 注册</h1>
          <div className="gold-divider mx-auto w-10" />
          <p className="text-sm leading-7 text-[var(--stone)]">
            输入邮箱，我们将发送一封免密登录链接。
          </p>
        </div>
        <div className="card-glass rounded-xl p-8">
          <Suspense fallback={<div className="text-sm text-[var(--stone-dim)]">载入中…</div>}>
            <LoginContent />
          </Suspense>
        </div>
      </div>
    </SiteShell>
  );
}
