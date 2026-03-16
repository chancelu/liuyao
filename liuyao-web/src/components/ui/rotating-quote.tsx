'use client';

import { useEffect, useState } from 'react';
import { useI18n } from '@/lib/i18n';

const QUOTES = [
  { text: '天行健，君子以自强不息', zhSource: '《周易 · 乾卦》', enSource: 'I Ching · Qián' },
  { text: '地势坤，君子以厚德载物', zhSource: '《周易 · 坤卦》', enSource: 'I Ching · Kūn' },
  { text: '云雷屯，君子以经纶', zhSource: '《周易 · 屯卦》', enSource: 'I Ching · Zhūn' },
  { text: '山下出泉，蒙；君子以果行育德', zhSource: '《周易 · 蒙卦》', enSource: 'I Ching · Méng' },
  { text: '云上于天，需；君子以饮食宴乐', zhSource: '《周易 · 需卦》', enSource: 'I Ching · Xū' },
  { text: '天与水违行，讼；君子以作事谋始', zhSource: '《周易 · 讼卦》', enSource: 'I Ching · Sòng' },
  { text: '地中有水，师；君子以容民畜众', zhSource: '《周易 · 师卦》', enSource: 'I Ching · Shī' },
  { text: '地上有水，比；先王以建万国，亲诸侯', zhSource: '《周易 · 比卦》', enSource: 'I Ching · Bǐ' },
  { text: '风行天上，小畜；君子以懿文德', zhSource: '《周易 · 小畜卦》', enSource: 'I Ching · Xiǎo Xù' },
  { text: '上天下泽，履；君子以辨上下，定民志', zhSource: '《周易 · 履卦》', enSource: 'I Ching · Lǚ' },
  { text: '天地交，泰；后以财成天地之道', zhSource: '《周易 · 泰卦》', enSource: 'I Ching · Tài' },
  { text: '天地不交，否；君子以俭德辟难', zhSource: '《周易 · 否卦》', enSource: 'I Ching · Pǐ' },
  { text: '天与火，同人；君子以类族辨物', zhSource: '《周易 · 同人卦》', enSource: 'I Ching · Tóng Rén' },
  { text: '火在天上，大有；君子以遏恶扬善', zhSource: '《周易 · 大有卦》', enSource: 'I Ching · Dà Yǒu' },
  { text: '地中有山，谦；君子以裒多益寡', zhSource: '《周易 · 谦卦》', enSource: 'I Ching · Qiān' },
  { text: '雷出地奋，豫；先王以作乐崇德', zhSource: '《周易 · 豫卦》', enSource: 'I Ching · Yù' },
  { text: '泽中有雷，随；君子以向晦入宴息', zhSource: '《周易 · 随卦》', enSource: 'I Ching · Suí' },
  { text: '山下有风，蛊；君子以振民育德', zhSource: '《周易 · 蛊卦》', enSource: 'I Ching · Gǔ' },
  { text: '泽上有地，临；君子以教思无穷', zhSource: '《周易 · 临卦》', enSource: 'I Ching · Lín' },
  { text: '风行地上，观；先王以省方观民设教', zhSource: '《周易 · 观卦》', enSource: 'I Ching · Guān' },
  { text: '雷电噬嗑；先王以明罚敕法', zhSource: '《周易 · 噬嗑卦》', enSource: 'I Ching · Shì Kè' },
  { text: '山下有火，贲；君子以明庶政', zhSource: '《周易 · 贲卦》', enSource: 'I Ching · Bì' },
  { text: '山附于地，剥；上以厚下安宅', zhSource: '《周易 · 剥卦》', enSource: 'I Ching · Bō' },
  { text: '雷在地中，复；先王以至日闭关', zhSource: '《周易 · 复卦》', enSource: 'I Ching · Fù' },
  { text: '天下雷行，物与无妄', zhSource: '《周易 · 无妄卦》', enSource: 'I Ching · Wú Wàng' },
  { text: '天在山中，大畜；君子以多识前言往行', zhSource: '《周易 · 大畜卦》', enSource: 'I Ching · Dà Xù' },
  { text: '山下有雷，颐；君子以慎言语，节饮食', zhSource: '《周易 · 颐卦》', enSource: 'I Ching · Yí' },
  { text: '泽灭木，大过；君子以独立不惧', zhSource: '《周易 · 大过卦》', enSource: 'I Ching · Dà Guò' },
  { text: '水洊至，习坎；君子以常德行，习教事', zhSource: '《周易 · 坎卦》', enSource: 'I Ching · Kǎn' },
  { text: '明两作，离；大人以继明照于四方', zhSource: '《周易 · 离卦》', enSource: 'I Ching · Lí' },
  { text: '山上有泽，咸；君子以虚受人', zhSource: '《周易 · 咸卦》', enSource: 'I Ching · Xián' },
  { text: '雷风恒；君子以立不易方', zhSource: '《周易 · 恒卦》', enSource: 'I Ching · Héng' },
  { text: '天下有山，遁；君子以远小人', zhSource: '《周易 · 遁卦》', enSource: 'I Ching · Dùn' },
  { text: '雷在天上，大壮；君子以非礼弗履', zhSource: '《周易 · 大壮卦》', enSource: 'I Ching · Dà Zhuàng' },
  { text: '明出地上，晋；君子以自昭明德', zhSource: '《周易 · 晋卦》', enSource: 'I Ching · Jìn' },
  { text: '明入地中，明夷；君子以莅众用晦而明', zhSource: '《周易 · 明夷卦》', enSource: 'I Ching · Míng Yí' },
  { text: '风自火出，家人；君子以言有物而行有恒', zhSource: '《周易 · 家人卦》', enSource: 'I Ching · Jiā Rén' },
  { text: '上火下泽，睽；君子以同而异', zhSource: '《周易 · 睽卦》', enSource: 'I Ching · Kuí' },
  { text: '山上有水，蹇；君子以反身修德', zhSource: '《周易 · 蹇卦》', enSource: 'I Ching · Jiǎn' },
  { text: '雷雨作，解；君子以赦过宥罪', zhSource: '《周易 · 解卦》', enSource: 'I Ching · Xiè' },
  { text: '山下有泽，损；君子以惩忿窒欲', zhSource: '《周易 · 损卦》', enSource: 'I Ching · Sǔn' },
  { text: '风雷益；君子以见善则迁，有过则改', zhSource: '《周易 · 益卦》', enSource: 'I Ching · Yì' },
  { text: '泽上于天，夬；君子以施禄及下', zhSource: '《周易 · 夬卦》', enSource: 'I Ching · Guài' },
  { text: '天下有风，姤；后以施命诰四方', zhSource: '《周易 · 姤卦》', enSource: 'I Ching · Gòu' },
  { text: '泽上于地，萃；君子以除戎器，戒不虞', zhSource: '《周易 · 萃卦》', enSource: 'I Ching · Cuì' },
  { text: '地中生木，升；君子以顺德，积小以高大', zhSource: '《周易 · 升卦》', enSource: 'I Ching · Shēng' },
  { text: '泽无水，困；君子以致命遂志', zhSource: '《周易 · 困卦》', enSource: 'I Ching · Kùn' },
  { text: '木上有水，井；君子以劳民劝相', zhSource: '《周易 · 井卦》', enSource: 'I Ching · Jǐng' },
  { text: '泽中有火，革；君子以治历明时', zhSource: '《周易 · 革卦》', enSource: 'I Ching · Gé' },
  { text: '木上有火，鼎；君子以正位凝命', zhSource: '《周易 · 鼎卦》', enSource: 'I Ching · Dǐng' },
  { text: '洊雷震；君子以恐惧修省', zhSource: '《周易 · 震卦》', enSource: 'I Ching · Zhèn' },
  { text: '兼山艮；君子以思不出其位', zhSource: '《周易 · 艮卦》', enSource: 'I Ching · Gèn' },
  { text: '随风巽；君子以申命行事', zhSource: '《周易 · 巽卦》', enSource: 'I Ching · Xùn' },
  { text: '丽泽兑；君子以朋友讲习', zhSource: '《周易 · 兑卦》', enSource: 'I Ching · Duì' },
  { text: '风行水上，涣；先王以享于帝立庙', zhSource: '《周易 · 涣卦》', enSource: 'I Ching · Huàn' },
  { text: '泽上有水，节；君子以制数度，议德行', zhSource: '《周易 · 节卦》', enSource: 'I Ching · Jié' },
  { text: '泽上有风，中孚；君子以议狱缓死', zhSource: '《周易 · 中孚卦》', enSource: 'I Ching · Zhōng Fú' },
  { text: '山上有雷，小过；君子以行过乎恭', zhSource: '《周易 · 小过卦》', enSource: 'I Ching · Xiǎo Guò' },
  { text: '水在火上，既济；君子以思患而预防之', zhSource: '《周易 · 既济卦》', enSource: 'I Ching · Jì Jì' },
  { text: '火在水上，未济；君子以慎辨物居方', zhSource: '《周易 · 未济卦》', enSource: 'I Ching · Wèi Jì' },
];

export function RotatingQuote() {
  const [index, setIndex] = useState(() => Math.floor(Math.random() * QUOTES.length));
  const [fading, setFading] = useState(false);
  const { locale } = useI18n();

  useEffect(() => {
    const timer = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % QUOTES.length);
        setFading(false);
      }, 600);
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const quote = QUOTES[index];
  const source = locale === 'en' ? quote.enSource : quote.zhSource;

  return (
    <div className="flex flex-col items-center gap-6">
      <p
        className="font-display text-base tracking-[0.20em] text-[var(--text-primary)] transition-opacity duration-600 sm:text-lg lg:text-2xl"
        style={{
          opacity: fading ? 0 : 0.85,
          textShadow: '0 0 30px rgba(196,149,107,0.15)',
        }}
      >
        {quote.text}
      </p>
      <div
        className="flex items-center gap-3 transition-opacity duration-600"
        style={{ opacity: fading ? 0 : 1 }}
      >
        <div className="h-px w-6 bg-[rgba(196,149,107,0.20)]" />
        <span className="text-[9px] tracking-[0.3em] text-[var(--text-dim)]">{source}</span>
        <div className="h-px w-6 bg-[rgba(196,149,107,0.20)]" />
      </div>
    </div>
  );
}
