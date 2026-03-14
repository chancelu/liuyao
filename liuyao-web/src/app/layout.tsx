import type { Metadata } from 'next';
import { Geist, Geist_Mono, Noto_Serif_SC, Cormorant_Garamond } from 'next/font/google';
import './globals.css';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });
const notoSerifSC = Noto_Serif_SC({ variable: '--font-noto-serif-sc', weight: ['200', '300', '400', '600', '700'], subsets: ['latin'], preload: false });
const cormorant = Cormorant_Garamond({ variable: '--font-cormorant', weight: ['300', '400', '500'], subsets: ['latin'] });

export const metadata: Metadata = {
  title: '雅若 Yarrow · 六爻在线占卦',
  description: '古老的东方智慧，重新想象。问一件事，起一卦，见一条脉络。',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <head>
        {/* Font Awesome Icons */}
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
        {/* Material Icons */}
        <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} ${notoSerifSC.variable} ${cormorant.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
