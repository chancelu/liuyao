'use client';

import { useState, useRef, useCallback, type ReactNode } from 'react';

/* ------------------------------------------------------------------ */
/*  Generic Tooltip                                                    */
/* ------------------------------------------------------------------ */

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
}

export function Tooltip({ content, children }: TooltipProps) {
  const [open, setOpen] = useState(false);
  const timeout = useRef<ReturnType<typeof setTimeout>>(null);

  const show = useCallback(() => {
    if (timeout.current) clearTimeout(timeout.current);
    setOpen(true);
  }, []);

  const hide = useCallback(() => {
    timeout.current = setTimeout(() => setOpen(false), 120);
  }, []);

  return (
    <span className="relative inline" onMouseEnter={show} onMouseLeave={hide}>
      {children}
      {open && (
        <span
          role="tooltip"
          className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-max max-w-[240px] -translate-x-1/2 rounded-xl bg-[var(--bg-card)] px-4 py-3 text-xs leading-relaxed text-white shadow-lg animate-fade-in"
        >
          {content}
          <span className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-[var(--bg-card)]" />
        </span>
      )}
    </span>
  );
}
