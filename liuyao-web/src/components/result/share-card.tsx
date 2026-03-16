'use client';

import { useCallback, useRef, useState } from 'react';
import { useI18n } from '@/lib/i18n';
import type { MockResult } from '@/lib/types';

const SITE_URL = 'liuyao-web-sandy.vercel.app';

function YaoRowInline({ yinYang, moving }: { yinYang: string; moving?: boolean }) {
  const isYang = yinYang === '阳';
  const color = isYang ? '#E5E5E5' : '#888';
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 48, flexShrink: 0 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
        {isYang ? (
          <div style={{ width: 40, height: 3, borderRadius: 2, background: color }} />
        ) : (
          <div style={{ display: 'flex', gap: 6 }}>
            <div style={{ width: 16, height: 3, borderRadius: 2, background: color }} />
            <div style={{ width: 16, height: 3, borderRadius: 2, background: color }} />
          </div>
        )}
        {moving && (
          <div style={{ fontSize: 8, color: '#B8A070', marginTop: 2 }}>
            {isYang ? '○' : '×'}
          </div>
        )}
      </div>
    </div>
  );
}

export function ShareCard({ result, onClose, accessToken }: { result: MockResult; onClose: () => void; accessToken?: string | null }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [generating, setGenerating] = useState(false);
  const { messages, locale } = useI18n();
  const m = messages.shareCard;
  const yaoPos = messages.result.chart.yaoPos;

  const handleDownload = useCallback(async () => {
    if (!cardRef.current) return;
    setGenerating(true);
    try {
      const { default: html2canvas } = await import('html2canvas-pro');
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#0B0B0F',
        scale: 2,
        useCORS: true,
      });
      const link = document.createElement('a');
      link.download = `${m.filenamePrefix}-${result.primaryHexagram}-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      if (accessToken) {
        fetch('/api/user/share-reward', {
          method: 'POST',
          headers: { Authorization: `Bearer ${accessToken}` },
        }).catch(() => {});
      }
    } catch {
      // silently fail
    } finally {
      setGenerating(false);
    }
  }, [result.primaryHexagram, accessToken, m.filenamePrefix]);

  const dateStr = new Date(result.createdAt).toLocaleDateString(locale === 'en' ? 'en-US' : 'zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const movingText = result.movingLines.length
    ? m.movingText.replace('{lines}', result.movingLines.join('、'))
    : m.staticText;

  const chart = result.chart;
  const lines = chart ? [...chart.lines].reverse() : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div className="flex max-h-[90vh] flex-col items-center gap-5 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* The card to be captured */}
        <div
          ref={cardRef}
          style={{
            width: 420,
            padding: 0,
            background: '#0B0B0F',
            borderRadius: 20,
            overflow: 'hidden',
            fontFamily: '"Noto Serif SC", "Georgia", serif',
          }}
        >
          {/* Top gold accent bar */}
          <div style={{ height: 3, background: 'linear-gradient(90deg, transparent, rgba(184,160,112,0.6), transparent)' }} />

          <div style={{ padding: '28px 28px 24px' }}>
            {/* Brand header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                  <div style={{ width: 20, height: 2, background: '#B8A070', opacity: 0.7, borderRadius: 1 }} />
                  <div style={{ display: 'flex', gap: 4 }}>
                    <div style={{ width: 8, height: 2, background: '#B8A070', opacity: 0.7, borderRadius: 1 }} />
                    <div style={{ width: 8, height: 2, background: '#B8A070', opacity: 0.7, borderRadius: 1 }} />
                  </div>
                  <div style={{ width: 20, height: 2, background: '#B8A070', opacity: 0.7, borderRadius: 1 }} />
                </div>
                <span style={{ fontSize: 12, color: '#999', letterSpacing: 5, fontWeight: 500, textTransform: 'uppercase' as const }}>Yarrow</span>
              </div>
              <span style={{ fontSize: 10, color: '#666', letterSpacing: 2 }}>{dateStr}</span>
            </div>

            {/* Question */}
            <div style={{
              padding: '14px 18px', borderRadius: 12,
              background: 'rgba(21,21,32,0.8)', border: '1px solid rgba(255,255,255,0.05)',
              marginBottom: 18,
            }}>
              <div style={{ fontSize: 10, color: '#666', letterSpacing: 3, marginBottom: 6 }}>{m.question}</div>
              <div style={{ fontSize: 14, color: '#E5E5E5', lineHeight: 1.8 }}>{result.question}</div>
            </div>

            {/* Hexagram names side by side */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
              <div style={{
                flex: 1, padding: '14px 14px', borderRadius: 12,
                background: 'rgba(21,21,32,0.8)', border: '1px solid rgba(255,255,255,0.05)',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: 10, color: '#666', letterSpacing: 2, marginBottom: 8 }}>{m.primaryHex}</div>
                <div style={{ fontSize: 20, color: '#fff', fontWeight: 200, letterSpacing: 2 }}>{result.primaryHexagram}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', color: 'rgba(184,160,112,0.4)', fontSize: 16 }}>→</div>
              <div style={{
                flex: 1, padding: '14px 14px', borderRadius: 12,
                background: 'rgba(21,21,32,0.8)', border: '1px solid rgba(255,255,255,0.05)',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: 10, color: '#666', letterSpacing: 2, marginBottom: 8 }}>{m.changedHex}</div>
                <div style={{ fontSize: 20, color: '#fff', fontWeight: 200, letterSpacing: 2 }}>{result.changedHexagram}</div>
              </div>
            </div>

            {/* Meta: month, day, void, palace */}
            {chart && (
              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                {[
                  { label: m.monthBranch, value: chart.monthBranch },
                  { label: m.dayStemBranch, value: `${chart.dayStem}${chart.dayBranch}` },
                  { label: m.xunkong, value: `${chart.xunkong[0]}${chart.xunkong[1]}` },
                  { label: m.palace, value: `${chart.primary.palace}(${chart.primary.palaceElement})` },
                ].map((item) => (
                  <div key={item.label} style={{
                    flex: 1, padding: '8px 6px', borderRadius: 8,
                    background: 'rgba(21,21,32,0.8)', textAlign: 'center',
                  }}>
                    <div style={{ fontSize: 9, color: '#555', letterSpacing: 1, marginBottom: 4 }}>{item.label}</div>
                    <div style={{ fontSize: 11, color: '#ccc' }}>{item.value}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Chart: primary + changed side by side */}
            {chart && (
              <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
                {/* Primary */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 9, color: '#666', letterSpacing: 2, marginBottom: 8, textAlign: 'center' }}>
                    {m.primaryHex} · {chart.primary.name}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {lines.map((line) => (
                      <div key={line.position} style={{
                        display: 'flex', alignItems: 'center', gap: 3,
                        padding: '5px 6px', borderRadius: 6,
                        background: line.moving ? 'rgba(184,160,112,0.06)' : 'rgba(21,21,32,0.6)',
                        border: line.moving ? '1px solid rgba(184,160,112,0.12)' : '1px solid transparent',
                      }}>
                        <span style={{ fontSize: 8, color: '#555', width: 10, flexShrink: 0 }}>{line.spirit.slice(0, 1)}</span>
                        <span style={{ fontSize: 9, color: '#ccc', width: 12, flexShrink: 0, textAlign: 'center' }}>{yaoPos[line.position - 1]}</span>
                        <YaoRowInline yinYang={line.yinYang} moving={line.moving} />
                        <span style={{ fontSize: 9, color: '#ddd', width: 18, flexShrink: 0 }}>{line.relative}</span>
                        <span style={{ fontSize: 8, color: '#777' }}>{line.branch}</span>
                        {line.isShi && <span style={{ fontSize: 8, color: '#B8A070', marginLeft: 'auto' }}>{messages.result.chart.shi}</span>}
                        {line.isYing && <span style={{ fontSize: 8, color: '#6B8FBF', marginLeft: 'auto' }}>{messages.result.chart.ying}</span>}
                      </div>
                    ))}
                  </div>
                </div>
                {/* Changed */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 9, color: '#666', letterSpacing: 2, marginBottom: 8, textAlign: 'center' }}>
                    {m.changedHex} · {chart.changed.name}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {lines.map((line) => {
                      const isChanged = line.moving;
                      const changedYinYang = isChanged ? (line.yinYang === '阳' ? '阴' : '阳') : line.yinYang;
                      return (
                        <div key={line.position} style={{
                          display: 'flex', alignItems: 'center', gap: 3,
                          padding: '5px 6px', borderRadius: 6,
                          background: isChanged ? 'rgba(184,160,112,0.06)' : 'rgba(21,21,32,0.6)',
                          border: isChanged ? '1px solid rgba(184,160,112,0.12)' : '1px solid transparent',
                        }}>
                          <span style={{ fontSize: 9, color: '#ccc', width: 12, flexShrink: 0, textAlign: 'center' }}>{yaoPos[line.position - 1]}</span>
                          <YaoRowInline yinYang={changedYinYang} />
                          <span style={{ fontSize: 9, color: '#aaa', width: 18, flexShrink: 0 }}>{line.changedRelative ?? line.relative}</span>
                          <span style={{ fontSize: 8, color: '#777' }}>{line.changedBranch ?? line.branch}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Moving lines */}
            <div style={{ textAlign: 'center', fontSize: 11, color: '#B8A070', letterSpacing: 2, marginBottom: 18, opacity: 0.7 }}>
              {movingText}
            </div>

            {/* Summary */}
            {result.summary && (
              <div style={{
                padding: '16px 18px', borderRadius: 12,
                border: '1px solid rgba(184,160,112,0.12)', background: 'rgba(184,160,112,0.03)',
                marginBottom: 20,
              }}>
                <div style={{ fontSize: 10, color: '#B8A070', letterSpacing: 3, marginBottom: 8 }}>{m.summary}</div>
                <div style={{ fontSize: 13, color: '#999', lineHeight: 2 }}>{result.summary}</div>
              </div>
            )}

            {/* Plain analysis */}
            {result.isAI && result.plainAnalysis && (
              <div style={{
                padding: '16px 18px', borderRadius: 12,
                background: 'rgba(21,21,32,0.8)', border: '1px solid rgba(255,255,255,0.05)',
                marginBottom: 20,
              }}>
                <div style={{ fontSize: 10, color: '#B8A070', letterSpacing: 3, marginBottom: 8 }}>{m.plain}</div>
                <div style={{ fontSize: 12, color: '#999', lineHeight: 2.2 }}>{result.plainAnalysis}</div>
              </div>
            )}

            {/* Professional analysis */}
            {result.isAI && result.professionalAnalysis && (
              <div style={{
                padding: '16px 18px', borderRadius: 12,
                background: 'rgba(21,21,32,0.8)', border: '1px solid rgba(255,255,255,0.05)',
                marginBottom: 20,
              }}>
                <div style={{ fontSize: 10, color: '#B8A070', letterSpacing: 3, marginBottom: 8 }}>{m.professional}</div>
                <div style={{ fontSize: 12, color: '#999', lineHeight: 2.2 }}>{result.professionalAnalysis}</div>
              </div>
            )}

            {/* Divider */}
            <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(184,160,112,0.15), transparent)', marginBottom: 18 }} />

            {/* Footer with URL */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, opacity: 0.4 }}>
                  <div style={{ width: 14, height: 1.5, background: '#B8A070', borderRadius: 1 }} />
                  <div style={{ display: 'flex', gap: 3 }}>
                    <div style={{ width: 6, height: 1.5, background: '#B8A070', borderRadius: 1 }} />
                    <div style={{ width: 6, height: 1.5, background: '#B8A070', borderRadius: 1 }} />
                  </div>
                  <div style={{ width: 14, height: 1.5, background: '#B8A070', borderRadius: 1 }} />
                </div>
                <span style={{ fontSize: 10, color: '#444', letterSpacing: 2 }}>{m.footerTagline}</span>
              </div>
              <span style={{ fontSize: 10, color: '#B8A070', letterSpacing: 1 }}>{SITE_URL}</span>
            </div>
          </div>

          {/* Bottom gold accent bar */}
          <div style={{ height: 2, background: 'linear-gradient(90deg, transparent, rgba(184,160,112,0.4), transparent)' }} />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleDownload}
            disabled={generating}
            className="btn-primary rounded-full px-8 py-3 text-sm tracking-wide disabled:opacity-40"
          >
            {generating ? m.generating : m.download}
          </button>
          <button onClick={onClose} className="btn-secondary rounded-full px-8 py-3 text-sm tracking-wide">
            {m.close}
          </button>
        </div>
      </div>
    </div>
  );
}
