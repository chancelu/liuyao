'use client';

import { useI18n, type Locale } from '@/lib/i18n';

export function LocaleSwitcher() {
  const { locale, setLocale } = useI18n();

  const toggle = () => {
    const next: Locale = locale === 'zh-CN' ? 'en' : 'zh-CN';
    setLocale(next);
  };

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-1.5 text-xs tracking-[0.1em] text-[var(--text-muted)] transition-colors duration-300 hover:text-[var(--gold)]"
      title={locale === 'zh-CN' ? 'Switch to English' : '切换到中文'}
    >
      <i className="fa-solid fa-globe text-[10px] opacity-50" />
      <span>{locale === 'zh-CN' ? 'EN' : '中文'}</span>
    </button>
  );
}
