'use client';

import { useCallback, useRef, useState } from 'react';
import type { MockResult } from '@/lib/types';

export function ShareCard({ result, onClose, accessToken }: { result: MockResult; onClose: () => void; accessToken?: string | null }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [generating, setGenerating] = useState(false);

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
      link.download = `雅若-${result.primaryHexagram}-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      // Trigger share reward
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
  }, [result.primaryHexagram]);

  const dateStr = new Date(result.createdAt).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const movingText = result.movingLines.length
    ? `动爻：第 ${result.movingLines.join('、')} 爻`
    : '静卦';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div className="flex max-h-[90vh] flex-col items-center gap-5 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* The card to be captured */}
        <div
          ref={cardRef}
          style={{
            width: 400,
            padding: '0',
            background: '#0B0B0F',
            borderRadius: 20,
            overflow: 'hidden',
            fontFamily: '"Noto Serif SC", "Georgia", serif',
          }}
        >
          {/* Top gold accent bar */}
          <div style={{
            height: 3,
            background: 'linear-gradient(90deg, transparent, rgba(184,160,112,0.6), transparent)',
          }} />

          <div style={{ padding: '32px 32px 28px' }}>
            {/* Brand header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 28,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, rgba(184,160,112,0.35), rgba(184,160,112,0.1))',
                  border: '1px solid rgba(184,160,112,0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 14,
                  color: 'rgba(184,160,112,0.8)',
                }}>
                  爻
                </div>
                <span style={{ fontSize: 15, color: '#B8A070', letterSpacing: 4, fontWeight: 300 }}>雅若</span>
              </div>
              <span style={{ fontSize: 10, color: '#666', letterSpacing: 2 }}>{dateStr}</span>
            </div>

            {/* Question */}
            <div style={{
              padding: '16px 20px',
              borderRadius: 14,
              background: 'rgba(21,21,32,0.8)',
              border: '1px solid rgba(255,255,255,0.05)',
              marginBottom: 20,
            }}>
              <div style={{ fontSize: 10, color: '#666', letterSpacing: 3, marginBottom: 8, textTransform: 'uppercase' as const }}>
                所问
              </div>
              <div style={{ fontSize: 15, color: '#E5E5E5', lineHeight: 1.8 }}>
                {result.question}
              </div>
            </div>

            {/* Hexagrams — side by side */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
              {/* Primary */}
              <div style={{
                flex: 1,
                padding: '18px 16px',
                borderRadius: 14,
                background: 'rgba(21,21,32,0.8)',
                border: '1px solid rgba(255,255,255,0.05)',
                textAlign: 'center' as const,
              }}>
                <div style={{ fontSize: 10, color: '#666', letterSpacing: 2, marginBottom: 10 }}>本卦</div>
                <div style={{ fontSize: 24, color: '#fff', fontWeight: 200, letterSpacing: 2 }}>
                  {result.primaryHexagram}
                </div>
              </div>

              {/* Arrow */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                color: 'rgba(184,160,112,0.4)',
                fontSize: 16,
              }}>
                →
              </div>

              {/* Changed */}
              <div style={{
                flex: 1,
                padding: '18px 16px',
                borderRadius: 14,
                background: 'rgba(21,21,32,0.8)',
                border: '1px solid rgba(255,255,255,0.05)',
                textAlign: 'center' as const,
              }}>
                <div style={{ fontSize: 10, color: '#666', letterSpacing: 2, marginBottom: 10 }}>变卦</div>
                <div style={{ fontSize: 24, color: '#fff', fontWeight: 200, letterSpacing: 2 }}>
                  {result.changedHexagram}
                </div>
              </div>
            </div>

            {/* Moving lines */}
            <div style={{
              textAlign: 'center' as const,
              fontSize: 11,
              color: '#B8A070',
              letterSpacing: 2,
              marginBottom: 20,
              opacity: 0.7,
            }}>
              {movingText}
            </div>

            {/* Summary */}
            <div style={{
              padding: '18px 20px',
              borderRadius: 14,
              border: '1px solid rgba(184,160,112,0.12)',
              background: 'rgba(184,160,112,0.03)',
              marginBottom: 24,
            }}>
              <div style={{ fontSize: 10, color: '#B8A070', letterSpacing: 3, marginBottom: 10, textTransform: 'uppercase' as const }}>
                卦象提要
              </div>
              <div style={{
                fontSize: 13,
                color: '#999',
                lineHeight: 2,
                display: '-webkit-box',
                WebkitLineClamp: 4,
                WebkitBoxOrient: 'vertical' as const,
                overflow: 'hidden',
              }}>
                {result.summary}
              </div>
            </div>

            {/* Divider */}
            <div style={{
              height: 1,
              background: 'linear-gradient(90deg, transparent, rgba(184,160,112,0.15), transparent)',
              marginBottom: 20,
            }} />

            {/* Footer */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <span style={{ fontSize: 10, color: '#444', letterSpacing: 2 }}>
                雅若 Yarrow · 六爻在线占卦
              </span>
              <span style={{ fontSize: 10, color: '#444', letterSpacing: 1 }}>
                yarrow.app
              </span>
            </div>
          </div>

          {/* Bottom gold accent bar */}
          <div style={{
            height: 2,
            background: 'linear-gradient(90deg, transparent, rgba(184,160,112,0.4), transparent)',
          }} />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleDownload}
            disabled={generating}
            className="btn-primary rounded-full px-8 py-3 text-sm tracking-wide disabled:opacity-40"
          >
            {generating ? '生成中…' : '下载图片'}
          </button>
          <button onClick={onClose} className="btn-secondary rounded-full px-8 py-3 text-sm tracking-wide">
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}
