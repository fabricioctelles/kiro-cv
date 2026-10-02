'use client';

import { useState, useEffect } from 'react';
import { colors } from '@/lib/colors';

const spinChars = ['·', '✢', '✳', '✶', '✻', '✽'];
const verbs = [
  'Querying',
  'Pipelining',
  'Transforming',
  'Orchestrating',
  'Architecting',
  'Debugging',
  'Optimizing',
  'Aggregating',
  'Indexing',
  'Partitioning',
];

export function Spinner() {
  const [charIndex, setCharIndex] = useState(0);
  const [verbIndex, setVerbIndex] = useState(0);

  useEffect(() => {
    const charInterval = setInterval(() => {
      setCharIndex((i) => (i + 1) % spinChars.length);
    }, 150);

    const verbInterval = setInterval(() => {
      setVerbIndex((i) => (i + 1) % verbs.length);
    }, 2000);

    return () => {
      clearInterval(charInterval);
      clearInterval(verbInterval);
    };
  }, []);

  return (
    <div className="flex items-center gap-2 text-xs sm:text-sm py-1">
      <span style={{ color: colors.brand }}>{spinChars[charIndex]}</span>
      <span style={{ color: colors.subtle }}>{verbs[verbIndex]}...</span>
    </div>
  );
}
