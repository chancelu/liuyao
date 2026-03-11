'use client';

/**
 * Renders structured analysis text:
 * - Strips markdown artifacts (**, ##, -, etc.)
 * - Parses 【section】 headers into styled blocks
 * - Parses numbered points (1. 2. 3.) into a list
 */
export function StructuredText({ text, className }: { text: string; className?: string }) {
  // Strip markdown artifacts
  let clean = text
    .replace(/\*\*/g, '')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^[-*]\s+/gm, '')
    .replace(/`/g, '');

  // Split by 【】 sections
  const sectionRegex = /【([^】]+)】/g;
  const parts: Array<{ title?: string; content: string }> = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = sectionRegex.exec(clean)) !== null) {
    // Content before this section header
    if (match.index > lastIndex) {
      const before = clean.slice(lastIndex, match.index).trim();
      if (before) parts.push({ content: before });
    }
    // Find content until next section or end
    const contentStart = match.index + match[0].length;
    const nextMatch = sectionRegex.exec(clean);
    const contentEnd = nextMatch ? nextMatch.index : clean.length;
    // Reset regex position for next iteration
    if (nextMatch) sectionRegex.lastIndex = nextMatch.index;

    const sectionContent = clean.slice(contentStart, contentEnd).trim();
    parts.push({ title: match[1], content: sectionContent });
    lastIndex = contentEnd;
  }

  // If no sections found, treat as plain text
  if (parts.length === 0) {
    parts.push({ content: clean });
  }

  return (
    <div className={className}>
      {parts.map((part, i) => (
        <div key={i} className={i > 0 ? 'mt-5' : ''}>
          {part.title && (
            <div className="mb-2 text-xs font-medium text-[var(--gold)]">
              {part.title}
            </div>
          )}
          <ContentBlock text={part.content} />
        </div>
      ))}
    </div>
  );
}

/** Renders content, detecting numbered lists */
function ContentBlock({ text }: { text: string }) {
  // Check if content has numbered points (1. xxx 2. xxx or 1、xxx)
  const numberedRegex = /(?:^|\n)\s*(\d+)[.、．]\s*/;
  if (numberedRegex.test(text)) {
    // Split into numbered items
    const items = text.split(/(?:^|\n)\s*\d+[.、．]\s*/).filter(Boolean);
    if (items.length > 1) {
      return (
        <ol className="list-none space-y-2">
          {items.map((item, i) => (
            <li key={i} className="flex gap-2 text-sm leading-8 text-[var(--text-muted)]">
              <span className="shrink-0 text-[var(--gold-dim)]">{i + 1}.</span>
              <span>{item.trim()}</span>
            </li>
          ))}
        </ol>
      );
    }
  }

  return <p className="text-sm leading-8 text-[var(--text-muted)]">{text}</p>;
}

/** Renders summary as numbered points */
export function SummaryPoints({ text, className }: { text: string; className?: string }) {
  // Strip markdown
  const clean = text.replace(/\*\*/g, '').replace(/`/g, '');

  // Try to split by numbered pattern
  const items = clean.split(/\s*\d+[.、．]\s*/).filter(Boolean);

  if (items.length > 1) {
    return (
      <ol className={`list-none space-y-3 ${className ?? ''}`}>
        {items.map((item, i) => (
          <li key={i} className="flex gap-3">
            <span className="shrink-0 font-display text-lg text-[var(--gold)]">{i + 1}</span>
            <span className="text-base leading-8 text-white">{item.trim().replace(/[；;]$/, '')}</span>
          </li>
        ))}
      </ol>
    );
  }

  // Fallback: just show as text
  return <p className={`text-base leading-8 text-white ${className ?? ''}`}>{clean}</p>;
}
