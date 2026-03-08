import { zhCN } from '@/messages/zh-CN';

export const defaultLocale = 'zh-CN';

export function getMessages(locale: string = defaultLocale) {
  switch (locale) {
    case 'zh-CN':
    default:
      return zhCN;
  }
}
