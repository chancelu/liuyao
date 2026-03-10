'use client';

import { useMemo } from 'react';
import { glossary, glossaryTerms } from '@/lib/liuyao/glossary';
import { Tooltip } from './glossary-tooltip';

/* ------------------------------------------------------------------ */
/*  AnnotatedText — auto-highlights glossary terms with tooltips       */
/* ------------------------------------------------------------------ */

interface AnnotatedTextProps {
  text: string;
  className?: string;
}

/**
 * Renders `text` with glossary terms wrapped in a Tooltip.
 * Each unique term is highlighted only on its first occurrence.
 */
export function AnnotatedText({ text, className }: AnnotatedTextProps) {
  const segments = useMemo(() => splitWithGlossary(text), [text]);

  return (
    <p className={className}>
      {segments.map((seg, i) =>
        seg.term ? (
          <Tooltip key={i} content={glossary[seg.term].definition}>
            <span className="cursor-help border-b border-dotted border-[var(--gold-dim)] text-[var(--gold)]">
              {seg.text}
            </span>
          </Tooltip>
        ) : (
          <span key={i}>{seg.text}</span>
        ),
      )}
    </p>
  );
}

/* ---------- helpers ---------- */

interface Segment {
  text: string;
  term?: string;
}

function splitWithGlossary(text: string): Segment[] {
  if (!text) return [{ text: '' }];

  // Build a regex that matches any glossary term (longest first via glossaryTerms order)
  const escaped = glossaryTerms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const pattern = new RegExp(`(${escaped.join('|')})`, 'g');

  const seen = new Set<string>();
  const result: Segment[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(pattern)) {
    const term = match[0];
    const idx = match.index!;

    // Only annotate first occurrence
    if (seen.has(term)) continue;
    seen.add(term);

    // Push preceding plain text
    if (idx > lastIndex) {
      result.push({ text: text.slice(lastIndex, idx) });
    }
    result.push({ text: term, term });
    lastIndex = idx + term.length;
  }

  // Remaining tail
  if (lastIndex < text.length) {
    result.push({ text: text.slice(lastIndex) });
  }

  return result.length ? result : [{ text }];
}
