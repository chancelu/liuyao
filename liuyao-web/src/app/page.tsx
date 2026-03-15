import Link from 'next/link';
import { SiteShell } from '@/components/site-shell';
import { HomeTracker } from '@/components/home-tracker';
import { RotatingQuote } from '@/components/ui/rotating-quote';

export default function HomePage() {
  return (
    <SiteShell>
      <HomeTracker />

      {/* ═══ HERO — Minimal, let the background breathe ═══ */}
      <section className="relative flex min-h-[75vh] flex-col items-center justify-center text-center sm:min-h-[85vh]">

        {/* ── Oracle Ring — 8 trigrams with breathing glow + floating particles ── */}
        <div className="animate-fade-in relative mb-8 sm:mb-10">
          {/* Floating golden particles — scattered, irregular drift */}
          <div className="pointer-events-none absolute inset-[-40px] sm:inset-[-60px]">
            {Array.from({ length: 18 }).map((_, i) => {
              const angle = (i * 137.5) % 360; // golden angle for natural scatter
              const dist = 40 + (i * 17) % 80; // varied distance from center
              const size = 1.2 + (i % 4) * 0.6;
              const dur = 8 + (i % 5) * 4; // 8-24s breathing cycle
              const delay = (i * 1.3) % 6;
              const driftX = ((i * 7) % 30) - 15;
              const driftY = ((i * 11) % 30) - 15;
              return (
                <div
                  key={i}
                  className="absolute rounded-full"
                  style={{
                    width: size,
                    height: size,
                    background: `rgba(196,149,107,${0.15 + (i % 3) * 0.15})`,
                    boxShadow: `0 0 ${size * 3}px rgba(196,149,107,${0.1 + (i % 3) * 0.1})`,
                    left: `calc(50% + ${Math.cos(angle * Math.PI / 180) * dist}px)`,
                    top: `calc(50% + ${Math.sin(angle * Math.PI / 180) * dist}px)`,
                    animation: `particle-drift-${i % 4} ${dur}s ease-in-out ${delay}s infinite`,
                  }}
                />
              );
            })}
          </div>
          <svg
            viewBox="0 0 200 200"
            className="relative h-[180px] w-[180px] sm:h-[240px] sm:w-[240px] lg:h-[300px] lg:w-[300px]"
          >
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="1.5" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
            {/* Outer ring — slow rotation */}
            <circle
              cx="100" cy="100" r="95"
              fill="none"
              stroke="rgba(196,149,107,0.20)"
              strokeWidth="0.5"
              style={{ animation: 'spin 120s linear infinite' }}
              transform-origin="100 100"
            />
            {/* Main ring — breathing glow */}
            <circle
              cx="100" cy="100" r="78"
              fill="none"
              stroke="rgba(196,149,107,0.45)"
              strokeWidth="0.8"
              style={{ animation: 'breathe 6s ease-in-out infinite' }}
            />
            {/* Inner ring */}
            <circle
              cx="100" cy="100" r="55"
              fill="none"
              stroke="rgba(196,149,107,0.15)"
              strokeWidth="0.5"
              style={{ animation: 'spin 90s linear infinite reverse' }}
              transform-origin="100 100"
            />
            {/* Center dot */}
            <circle
              cx="100" cy="100" r="2.5"
              fill="rgba(196,149,107,0.6)"
              style={{ animation: 'breathe 5s ease-in-out infinite' }}
            />
            {/* 8 Trigrams — 文王后天八卦 arrangement, each facing center */}
            <g style={{ animation: 'spin 180s linear infinite', transformOrigin: '100px 100px' }}>
              {[
                { name: '离', lines: [1,0,1], angle: 0 },     // 南(上)
                { name: '坤', lines: [0,0,0], angle: 45 },    // 西南
                { name: '兑', lines: [0,1,1], angle: 90 },    // 西(右)
                { name: '乾', lines: [1,1,1], angle: 135 },   // 西北
                { name: '坎', lines: [0,1,0], angle: 180 },   // 北(下)
                { name: '艮', lines: [1,0,0], angle: 225 },   // 东北
                { name: '震', lines: [0,0,1], angle: 270 },   // 东(左)
                { name: '巽', lines: [1,1,0], angle: 315 },   // 东南
              ].map((tri) => {
                const r = 78;
                const rad = (tri.angle - 90) * Math.PI / 180;
                const cx = 100 + r * Math.cos(rad);
                const cy = 100 + r * Math.sin(rad);
                const lineW = 8;
                const lineH = 1.2;
                const gap = 3.5;
                const breatheDelay = (tri.angle / 360) * 8;
                return (
                  <g
                    key={tri.name}
                    transform={`translate(${cx},${cy}) rotate(${tri.angle})`}
                    style={{ animation: `breathe 8s ease-in-out ${breatheDelay}s infinite` }}
                    filter="url(#glow)"
                  >
                    {tri.lines.map((solid, li) => {
                      const y = (li - 1) * gap;
                      if (solid) {
                        return <rect key={li} x={-lineW/2} y={y - lineH/2} width={lineW} height={lineH} rx={0.5} fill="rgba(196,149,107,0.55)" />;
                      }
                      return (
                        <g key={li}>
                          <rect x={-lineW/2} y={y - lineH/2} width={lineW * 0.38} height={lineH} rx={0.5} fill="rgba(196,149,107,0.55)" />
                          <rect x={lineW * 0.12} y={y - lineH/2} width={lineW * 0.38} height={lineH} rx={0.5} fill="rgba(196,149,107,0.55)" />
                        </g>
                      );
                    })}
                  </g>
                );
              })}
            </g>
          </svg>
          {/* Glow behind ring */}
          <div
            className="pointer-events-none absolute inset-0 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(196,149,107,0.10) 0%, rgba(196,149,107,0.03) 40%, transparent 70%)',
              animation: 'breathe 6s ease-in-out infinite',
            }}
          />
        </div>

        {/* ── Brand ── */}
        <div className="animate-fade-in-up delay-200 mb-3">
          <h1
            className="text-[24px] font-light tracking-[0.35em] text-[var(--text-primary)] sm:text-[34px] sm:tracking-[0.5em] lg:text-[42px]"
            style={{ fontFamily: 'var(--font-cormorant), Georgia, serif' }}
          >
            YARROW
          </h1>
        </div>

        {/* ── Tagline ── */}
        <div className="animate-fade-in delay-300 mb-10 sm:mb-14">
          <span className="text-[11px] tracking-[0.25em] text-[var(--text-dim)]">
            六爻在线占卦
          </span>
        </div>

        {/* ── Decorative divider ── */}
        <div className="animate-fade-in delay-400 mb-10 flex items-center gap-4 sm:mb-14">
          <div className="h-px w-10 bg-gradient-to-r from-transparent to-[rgba(196,149,107,0.20)]" />
          <div className="h-[3px] w-[3px] rotate-45 bg-[rgba(196,149,107,0.30)]" />
          <div className="h-px w-10 bg-gradient-to-l from-transparent to-[rgba(196,149,107,0.20)]" />
        </div>

        {/* ── CTA ── */}
        <div className="animate-fade-in-up delay-500 mb-12 sm:mb-20">
          <Link
            href="/cast"
            className="btn-primary group relative inline-flex items-center gap-3 overflow-hidden px-10 py-4 text-[14px] sm:px-16 sm:py-5 sm:text-[15px]"
          >
            <i className="fa-solid fa-coins text-[12px] opacity-60 transition-all duration-300 group-hover:rotate-12 group-hover:opacity-100" />
            <span>问 卦</span>
          </Link>
        </div>

        {/* ── Subtitle ── */}
        <div className="animate-fade-in delay-1000">
          <span className="text-[10px] tracking-[0.15em] text-[var(--text-dim)]" style={{ fontStyle: 'italic', fontFamily: 'var(--font-cormorant), Georgia, serif' }}>
            Ancient wisdom, reimagined.
          </span>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2" style={{ animation: 'breathe 3s ease-in-out infinite' }}>
          <i className="fa-solid fa-chevron-down text-[10px] text-[rgba(196,149,107,0.20)]" />
        </div>
      </section>

      {/* ═══ INTRO ═══ */}
      <section className="glow-top relative mx-auto max-w-2xl py-16 text-center sm:py-32">
        <div className="relative z-10">
          <div className="animate-fade-in-up mb-8">
            <i className="fa-solid fa-yin-yang text-3xl text-[var(--gold)]" style={{ opacity: 0.5 }} />
          </div>
          <h2 className="animate-fade-in-up delay-100 mb-10 font-display text-xl font-extralight leading-relaxed tracking-[0.06em] text-[var(--text-primary)] sm:text-2xl lg:text-3xl">
            问一件事，起一卦，<br className="hidden sm:block" />见一条脉络。
          </h2>
          <div className="animate-fade-in delay-200 mx-auto mb-10 flex items-center justify-center gap-4">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-[rgba(196,149,107,0.20)]" />
            <i className="fa-solid fa-diamond text-[5px] text-[rgba(196,149,107,0.25)]" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-[rgba(196,149,107,0.20)]" />
          </div>
          <p className="animate-fade-in-up delay-300 mx-auto max-w-lg text-[13px] leading-[2.4] text-[var(--text-muted)] sm:text-[14px]">
            六爻占卦，源自三千年前的《周易》。三枚铜钱，六次投掷，天地人三才尽在其中。雅若将这一古老智慧带入数字时代，让每一次问卦都成为一次与自我的对话。
          </p>
        </div>
      </section>

      {/* ═══ THREE PILLARS ═══ */}
      <section className="mx-auto max-w-3xl pb-16 sm:pb-32">
        <div className="grid gap-4 sm:gap-5 md:grid-cols-3">
          {[
            { icon: 'fa-solid fa-feather-pointed', num: '壹', title: '起卦', desc: '静心片刻，写下你的问题。选择类别与时间，准备与天地对话。' },
            { icon: 'fa-solid fa-coins', num: '贰', title: '摇卦', desc: '三枚铜钱，六次投掷。每一爻的生成，都是随机中的必然。' },
            { icon: 'fa-solid fa-scroll', num: '叁', title: '解卦', desc: 'AI 结合传统卦理，为你呈现白话解读与专业分析。' },
          ].map((item, i) => (
            <div
              key={item.title}
              className="card-gold animate-fade-in-up group cursor-default p-5 text-center sm:p-8"
              style={{ animationDelay: `${400 + i * 150}ms` }}
            >
              <div className="mb-2 font-display text-[10px] tracking-[0.4em] text-[var(--gold)]" style={{ opacity: 0.4 }}>
                {item.num}
              </div>
              <div className="mb-5 transition-transform duration-500 group-hover:scale-110">
                <i className={`${item.icon} text-xl text-[var(--gold)]`} style={{ opacity: 0.65 }} />
              </div>
              <div className="mb-3 font-display text-lg font-light tracking-[0.1em] text-[var(--text-primary)]">
                {item.title}
              </div>
              <p className="text-[13px] leading-[2.2] text-[var(--text-muted)]">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ QUOTE ═══ */}
      <section className="relative mx-auto mb-16 max-w-2xl py-10 text-center sm:mb-32 sm:py-16">
        <RotatingQuote />
      </section>

      {/* Footer divider */}
      <div className="footer-decoration">
        <i className="fa-solid fa-diamond text-[5px]" />
      </div>
    </SiteShell>
  );
}
