'use client';

import { useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MagicLinkForm } from '@/components/auth/magic-link-form';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

function describeNextPath(next: string | null) {
  if (!next || next === '/') return '首页';
  if (next.startsWith('/cast/ritual')) return '继续刚才的摇卦';
  if (next.startsWith('/cast/processing')) return '继续生成中的排盘';
  if (next.startsWith('/cast')) return '继续起卦';
  if (next.startsWith('/result/')) return '回到这次结果页';
  if (next.startsWith('/history')) return '查看历史记录';
  return '刚才离开的页面';
}

export function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorParam = searchParams.get('error') ?? undefined;
  const next = searchParams.get('next');
  const nextLabel = useMemo(() => describeNextPath(next), [next]);

  useEffect(() => {
    let cancelled = false;
    const destination = next || '/';

    try {
      const client = getSupabaseBrowserClient();

      client.auth.getSession().then(({ data }) => {
        if (!cancelled && data.session) {
          router.replace(destination);
          router.refresh();
        }
      });

      const {
        data: { subscription },
      } = client.auth.onAuthStateChange((event, session) => {
        if (!cancelled && session && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
          router.replace(destination);
          router.refresh();
        }
      });

      return () => {
        cancelled = true;
        subscription.unsubscribe();
      };
    } catch {
      return () => {
        cancelled = true;
      };
    }
  }, [next, router]);

  return <MagicLinkForm initialError={errorParam} initialNext={next ?? undefined} nextLabel={nextLabel} />;
}
