'use client';

import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'claude-resume-history';
const MAX_HISTORY = 50;

export function useCommandHistory() {
  const [history, setHistory] = useState<string[]>([]);
  const [index, setIndex] = useState(-1);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setHistory(JSON.parse(stored));
    } catch {}
  }, []);

  const push = useCallback((cmd: string) => {
    if (!cmd.trim()) return;
    setHistory((prev) => {
      const next = [cmd, ...prev.filter((c) => c !== cmd)].slice(0, MAX_HISTORY);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
    setIndex(-1);
  }, []);

  const navigateUp = useCallback((currentInput: string): string | null => {
    const nextIndex = index + 1;
    if (nextIndex >= history.length) return null;
    setIndex(nextIndex);
    return history[nextIndex];
  }, [history, index]);

  const navigateDown = useCallback((): string | null => {
    if (index <= 0) {
      setIndex(-1);
      return '';
    }
    const nextIndex = index - 1;
    setIndex(nextIndex);
    return history[nextIndex];
  }, [history, index]);

  const reset = useCallback(() => setIndex(-1), []);

  return { history, push, navigateUp, navigateDown, reset };
}
