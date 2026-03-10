import type { Metadata } from 'next';
import { Geist, Geist_Mono, Noto_Serif_SC } from 'next/font/google';
import './globals.css';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });
const notoSerifSC = Noto_Serif_SC({ variable: '--font-noto-serif-sc', weight: ['200', '300', '400', '600', '700'], subsets: ['latin'] });

export const metadata: Metadata = {
  title: '爻镜 · YaoJing',
  description: '六爻在线占卦。问一件事，起一卦，见一条脉络。',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body className={`${geistSans.variable} ${geistMono.variable} ${notoSerifSC.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
