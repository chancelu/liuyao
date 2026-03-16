'use client';

import { useEffect, useRef, useState } from 'react';
import { useI18n, type Locale } from '@/lib/i18n';

const OPTIONS: { value: Locale; label: string }[] = [
  { value: 'zh-CN', label: '中文' },
  { value: 'en', label: 'English' },
];

export function LocaleSwitcher() {
  const { locale, setLocale } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const current = OPTIONS.find((o) => o.value === locale)!;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-xs tracking-[0.1em] text-[var(--text-muted)] transition-colors duration-300 hover:text-[var(--gold)]"
      >
        <i className="fa-solid fa-globe text-[10px] opacity-50" />
        <span>{locale === 'zh-CN' ? '语言' : 'Language'}</span>
        <i className={`fa-solid fa-chevron-down text-[8px] opacity-40 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 min-w-[120px] overflow-hidden rounded-xl border border-[rgba(255,255,255,0.08)] bg-[var(--bg-card)] shadow-xl backdrop-blur">
          {OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { setLocale(opt.value); setOpen(false); }}
              className={`flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-xs transition-colors duration-200 ${
                opt.value === locale
                  ? 'bg-[rgba(196,149,107,0.08)] text-[var(--gold)]'
                  : 'text-[var(--text-muted)] hover:bg-[rgba(255,255,255,0.04)] hover:text-white'
              }`}
            >
              {opt.value === locale && <i className="fa-solid fa-check text-[8px]" />}
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
