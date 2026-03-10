'use client';

import { useCallback, useRef, useState } from 'react';
import type { MockResult } from '@/lib/types';

export function ShareCard({ result, onClose }: { result: MockResult; onClose: () => void }) {
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
      link.download = `爻镜-${result.primaryHexagram}-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div className="flex max-h-[90vh] flex-col items-center gap-5" onClick={(e) => e.stopPropagation()}>
        {/* The card to be captured */}
        <div
          ref={cardRef}
          style={{
            width: 420,
            padding: 40,
            background: 'linear-gradient(175deg, #11121B 0%, #0B0B0F 35%, #0D0D14 65%, #12131C 100%)',
            borderRadius: 24,
            border: '1px solid rgba(122, 173, 160, 0.18)',
            fontFamily: '"Noto Sans SC", sans-serif',
          }}
        >
          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(122,173,160,0.4), rgba(122,173,160,0.15))',
                border: '1px solid rgba(122,173,160,0.3)',
              }}
            />
            <span style={{ fontSize: 18, color: '#7AADA0', letterSpacing: 4, fontWeight: 300 }}>爻镜</span>
          </div>

          {/* Question */}
          <div
            style={{
              fontSize: 13,
              color: '#5C5965',
              marginBottom: 8,
              letterSpacing: 1,
            }}
          >
            所问
          </div>
          <div
            style={{
              fontSize: 16,
              color: '#C8CDD8',
              lineHeight: 1.7,
              marginBottom: 28,
            }}
          >
            {result.question}
          </div>

          {/* Hexagrams */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 28 }}>
            <div
              style={{
                flex: 1,
                padding: '16px 20px',
                borderRadius: 16,
                border: '1px solid rgba(200,205,216,0.10)',
                background: 'rgba(23,25,34,0.55)',
              }}
            >
              <div style={{ fontSize: 11, color: '#5C5965', marginBottom: 8 }}>本卦</div>
              <div style={{ fontSize: 22, color: '#C8CDD8', fontWeight: 300 }}>{result.primaryHexagram}</div>
            </div>
            <div
              style={{
                flex: 1,
                padding: '16px 20px',
                borderRadius: 16,
                border: '1px solid rgba(200,205,216,0.10)',
                background: 'rgba(23,25,34,0.55)',
              }}
            >
              <div style={{ fontSize: 11, color: '#5C5965', marginBottom: 8 }}>变卦</div>
              <div style={{ fontSize: 22, color: '#C8CDD8', fontWeight: 300 }}>{result.changedHexagram}</div>
            </div>
          </div>

          {/* Summary conclusion */}
          <div
            style={{
              padding: '16px 20px',
              borderRadius: 16,
              border: '1px solid rgba(122,173,160,0.15)',
              background: 'rgba(122,173,160,0.05)',
              fontSize: 14,
              color: '#9BA1B0',
              lineHeight: 1.8,
              marginBottom: 32,
            }}
          >
            {result.summary}
          </div>

          {/* Footer */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: 11,
              color: '#5C5965',
            }}
          >
            <span>{dateStr}</span>
            <span style={{ letterSpacing: 2 }}>爻镜 · 六爻在线占卦</span>
          </div>
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
