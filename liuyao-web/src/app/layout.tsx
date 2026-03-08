import type { Metadata } from 'next';
import { Geist, Geist_Mono, Noto_Sans_SC } from 'next/font/google';
import './globals.css';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });
const notoSansSC = Noto_Sans_SC({ variable: '--font-noto-sans-sc', subsets: ['latin'] });

export const metadata: Metadata = {
  title: '爻镜 · 六爻在线占卦',
  description: '现代、克制、带有东方感的在线六爻占卦体验。',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body className={`${geistSans.variable} ${geistMono.variable} ${notoSansSC.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
