'use client';

import Link from 'next/link';
import { useI18n } from '@/lib/i18n';

export function ShellNav() {
  const { messages } = useI18n();
  return (
    <Link href="/cast" className="group flex items-center gap-2 transition-colors duration-300 hover:text-[var(--gold)]">
      <i className="fa-solid fa-coins text-[10px] opacity-50 transition-opacity group-hover:opacity-100"></i>
      <span>{messages.nav.cast}</span>
    </Link>
  );
}

export function ShellFooterTagline() {
  const { messages } = useI18n();
  return (
    <span className="text-[9px] tracking-[0.15em] text-[var(--text-dim)]">
      {messages.home.subtitle}
    </span>
  );
}
