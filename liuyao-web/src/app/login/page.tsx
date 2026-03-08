import { Suspense } from 'react';
import { SiteShell } from '@/components/site-shell';
import { LoginContent } from './login-content';

export default function LoginPage() {
  return (
    <SiteShell>
      <div className="mx-auto max-w-md space-y-6 py-16">
        <div className="space-y-3 text-center">
          <div className="text-xs tracking-[0.3em] text-stone-400 uppercase">Account</div>
          <h1 className="text-3xl text-stone-50">登录 / 注册</h1>
          <p className="text-sm leading-7 text-stone-300/80">
            输入邮箱，我们将发送一封免密登录链接。
          </p>
        </div>
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-8 backdrop-blur">
          <Suspense fallback={<div className="text-sm text-stone-400">载入中…</div>}>
            <LoginContent />
          </Suspense>
        </div>
      </div>
    </SiteShell>
  );
}
