'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { zhCN, type Messages } from '@/messages/zh-CN';
import { en } from '@/messages/en';

export type Locale = 'zh-CN' | 'en';

const STORAGE_KEY = 'yarrow-locale';

const messagesMap: Record<Locale, Messages> = {
  'zh-CN': zhCN,
  'en': en,
};

interface I18nContextValue {
  locale: Locale;
  messages: Messages;
  setLocale: (locale: Locale) => void;
}

const I18nContext = createContext<I18nContextValue>({
  locale: 'zh-CN',
  messages: zhCN,
  setLocale: () => {},
});

function getInitialLocale(): Locale {
  if (typeof window === 'undefined') return 'zh-CN';
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'en' || stored === 'zh-CN') return stored;
  // Auto-detect from browser
  const lang = navigator.language;
  if (lang.startsWith('zh')) return 'zh-CN';
  return 'en';
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('zh-CN');
  const [messages, setMessages] = useState<Messages>(zhCN);

  useEffect(() => {
    const initial = getInitialLocale();
    setLocaleState(initial);
    setMessages(messagesMap[initial]);
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    setMessages(messagesMap[next]);
    localStorage.setItem(STORAGE_KEY, next);
    document.documentElement.lang = next === 'zh-CN' ? 'zh' : 'en';
  }, []);

  return (
    <I18nContext.Provider value={{ locale, messages, setLocale }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}

/** Non-hook version for server components or static init — always returns default locale */
export function getMessages(locale: Locale = 'zh-CN'): Messages {
  return messagesMap[locale] ?? zhCN;
}
