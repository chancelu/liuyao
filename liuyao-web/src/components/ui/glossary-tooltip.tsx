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
          className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-max max-w-[240px] -translate-x-1/2 rounded-xl border border-[rgba(122,173,160,0.22)] bg-[var(--panel-2)] px-4 py-3 text-xs leading-relaxed text-[var(--moon-silver)] shadow-lg backdrop-blur-md animate-fade-in"
        >
          {content}
          {/* Arrow */}
          <span className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-[var(--panel-2)]" />
        </span>
      )}
    </span>
  );
}
