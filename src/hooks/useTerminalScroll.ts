'use client';

import { useRef, useCallback } from 'react';

export function useTerminalScroll() {
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      const el = containerRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    });
  }, []);

  return { containerRef, scrollToBottom };
}
