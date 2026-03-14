'use client';

import { useEffect, useState } from 'react';

const QUOTES = [
  { text: '天行健，君子以自强不息', source: '《周易 · 乾卦》' },
  { text: '地势坤，君子以厚德载物', source: '《周易 · 坤卦》' },
  { text: '云雷屯，君子以经纶', source: '《周易 · 屯卦》' },
  { text: '山下出泉，蒙；君子以果行育德', source: '《周易 · 蒙卦》' },
  { text: '云上于天，需；君子以饮食宴乐', source: '《周易 · 需卦》' },
  { text: '天与水违行，讼；君子以作事谋始', source: '《周易 · 讼卦》' },
  { text: '地中有水，师；君子以容民畜众', source: '《周易 · 师卦》' },
  { text: '地上有水，比；先王以建万国，亲诸侯', source: '《周易 · 比卦》' },
  { text: '风行天上，小畜；君子以懿文德', source: '《周易 · 小畜卦》' },
  { text: '上天下泽，履；君子以辨上下，定民志', source: '《周易 · 履卦》' },
  { text: '天地交，泰；后以财成天地之道', source: '《周易 · 泰卦》' },
  { text: '天地不交，否；君子以俭德辟难', source: '《周易 · 否卦》' },
  { text: '天与火，同人；君子以类族辨物', source: '《周易 · 同人卦》' },
  { text: '火在天上，大有；君子以遏恶扬善', source: '《周易 · 大有卦》' },
  { text: '地中有山，谦；君子以裒多益寡', source: '《周易 · 谦卦》' },
  { text: '雷出地奋，豫；先王以作乐崇德', source: '《周易 · 豫卦》' },
  { text: '泽中有雷，随；君子以向晦入宴息', source: '《周易 · 随卦》' },
  { text: '山下有风，蛊；君子以振民育德', source: '《周易 · 蛊卦》' },
  { text: '泽上有地，临；君子以教思无穷', source: '《周易 · 临卦》' },
  { text: '风行地上，观；先王以省方观民设教', source: '《周易 · 观卦》' },
  { text: '雷电噬嗑；先王以明罚敕法', source: '《周易 · 噬嗑卦》' },
  { text: '山下有火，贲；君子以明庶政', source: '《周易 · 贲卦》' },
  { text: '山附于地，剥；上以厚下安宅', source: '《周易 · 剥卦》' },
  { text: '雷在地中，复；先王以至日闭关', source: '《周易 · 复卦》' },
  { text: '天下雷行，物与无妄', source: '《周易 · 无妄卦》' },
  { text: '天在山中，大畜；君子以多识前言往行', source: '《周易 · 大畜卦》' },
  { text: '山下有雷，颐；君子以慎言语，节饮食', source: '《周易 · 颐卦》' },
  { text: '泽灭木，大过；君子以独立不惧', source: '《周易 · 大过卦》' },
  { text: '水洊至，习坎；君子以常德行，习教事', source: '《周易 · 坎卦》' },
  { text: '明两作，离；大人以继明照于四方', source: '《周易 · 离卦》' },
  { text: '山上有泽，咸；君子以虚受人', source: '《周易 · 咸卦》' },
  { text: '雷风恒；君子以立不易方', source: '《周易 · 恒卦》' },
  { text: '天下有山，遁；君子以远小人', source: '《周易 · 遁卦》' },
  { text: '雷在天上，大壮；君子以非礼弗履', source: '《周易 · 大壮卦》' },
  { text: '明出地上，晋；君子以自昭明德', source: '《周易 · 晋卦》' },
  { text: '明入地中，明夷；君子以莅众用晦而明', source: '《周易 · 明夷卦》' },
  { text: '风自火出，家人；君子以言有物而行有恒', source: '《周易 · 家人卦》' },
  { text: '上火下泽，睽；君子以同而异', source: '《周易 · 睽卦》' },
  { text: '山上有水，蹇；君子以反身修德', source: '《周易 · 蹇卦》' },
  { text: '雷雨作，解；君子以赦过宥罪', source: '《周易 · 解卦》' },
  { text: '山下有泽，损；君子以惩忿窒欲', source: '《周易 · 损卦》' },
  { text: '风雷益；君子以见善则迁，有过则改', source: '《周易 · 益卦》' },
  { text: '泽上于天，夬；君子以施禄及下', source: '《周易 · 夬卦》' },
  { text: '天下有风，姤；后以施命诰四方', source: '《周易 · 姤卦》' },
  { text: '泽上于地，萃；君子以除戎器，戒不虞', source: '《周易 · 萃卦》' },
  { text: '地中生木，升；君子以顺德，积小以高大', source: '《周易 · 升卦》' },
  { text: '泽无水，困；君子以致命遂志', source: '《周易 · 困卦》' },
  { text: '木上有水，井；君子以劳民劝相', source: '《周易 · 井卦》' },
  { text: '泽中有火，革；君子以治历明时', source: '《周易 · 革卦》' },
  { text: '木上有火，鼎；君子以正位凝命', source: '《周易 · 鼎卦》' },
  { text: '洊雷震；君子以恐惧修省', source: '《周易 · 震卦》' },
  { text: '兼山艮；君子以思不出其位', source: '《周易 · 艮卦》' },
  { text: '随风巽；君子以申命行事', source: '《周易 · 巽卦》' },
  { text: '丽泽兑；君子以朋友讲习', source: '《周易 · 兑卦》' },
  { text: '风行水上，涣；先王以享于帝立庙', source: '《周易 · 涣卦》' },
  { text: '泽上有水，节；君子以制数度，议德行', source: '《周易 · 节卦》' },
  { text: '泽上有风，中孚；君子以议狱缓死', source: '《周易 · 中孚卦》' },
  { text: '山上有雷，小过；君子以行过乎恭', source: '《周易 · 小过卦》' },
  { text: '水在火上，既济；君子以思患而预防之', source: '《周易 · 既济卦》' },
  { text: '火在水上，未济；君子以慎辨物居方', source: '《周易 · 未济卦》' },
];

export function RotatingQuote() {
  const [index, setIndex] = useState(() => Math.floor(Math.random() * QUOTES.length));
  const [fading, setFading] = useState(false);

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
        <span className="text-[9px] tracking-[0.3em] text-[var(--text-dim)]">{quote.source}</span>
        <div className="h-px w-6 bg-[rgba(196,149,107,0.20)]" />
      </div>
    </div>
  );
}
