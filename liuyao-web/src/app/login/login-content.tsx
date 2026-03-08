'use client';

import { useSearchParams } from 'next/navigation';
import { MagicLinkForm } from '@/components/auth/magic-link-form';

export function LoginContent() {
  const searchParams = useSearchParams();
  const errorParam = searchParams.get('error') ?? undefined;

  return <MagicLinkForm initialError={errorParam} />;
}
