'use client';

/**
 * Renders structured analysis text:
 * - Strips markdown artifacts (**, ##, -, etc.)
 * - Parses 【section】 headers into styled blocks
 * - Parses numbered points (1. 2. 3.) into a list
 */
export function StructuredText({ text, className }: { text: string; className?: string }) {
  // Strip markdown artifacts
  const clean = text
    .replace(/\*\*/g, '')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^[-*]\s+/gm, '')
    .replace(/`/g, '');

  // Split by 【】 sections
  const segments = clean.split(/【([^】]+)】/);
  // segments: [before, title1, content1, title2, content2, ...]
  const parts: Array<{ title?: string; content: string }> = [];

  if (segments[0]?.trim()) {
    parts.push({ content: segments[0].trim() });
  }

  for (let i = 1; i < segments.length; i += 2) {
    const title = segments[i];
    const content = (segments[i + 1] || '').trim();
    if (title && content) {
      parts.push({ title, content });
    }
  }

  // If no sections found, treat as plain text
  if (parts.length === 0) {
    parts.push({ content: clean });
  }

  return (
    <div className={className}>
      {parts.map((part, i) => (
        <div key={i} className={i > 0 ? 'mt-6' : ''}>
          {part.title && (
            <div className="mb-3 flex items-center gap-2 border-l-2 border-[var(--gold)] pl-3 text-xs font-medium text-[var(--gold)]">
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
  const items = text.split(/(?:^|\n)\s*\d+[.、．]\s*/).filter(Boolean);
  if (items.length > 1) {
    return (
      <ol className="list-none space-y-2.5">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2 text-sm leading-[2.2] text-[var(--text-muted)]">
            <span className="shrink-0 text-[var(--gold-dim)]">{i + 1}.</span>
            <span>{item.trim()}</span>
          </li>
        ))}
      </ol>
    );
  }

  return <p className="text-sm leading-[2.2] text-[var(--text-muted)]">{text}</p>;
}

/** Renders summary as numbered points */
export function SummaryPoints({ text, className }: { text: string; className?: string }) {
  const clean = text.replace(/\*\*/g, '').replace(/`/g, '');
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

  return <p className={`text-base leading-8 text-white ${className ?? ''}`}>{clean}</p>;
}
