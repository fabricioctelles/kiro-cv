'use client';

import { useCallback } from 'react';
import { filterCommands } from '@/lib/commands';

export function useAutoComplete() {
  const complete = useCallback((input: string): string | null => {
    if (!input.startsWith('/')) return null;
    const matches = filterCommands(input);
    if (matches.length === 1) return matches[0].name;
    // If exact prefix match, return the first
    if (matches.length > 0) return matches[0].name;
    return null;
  }, []);

  return { complete };
}
