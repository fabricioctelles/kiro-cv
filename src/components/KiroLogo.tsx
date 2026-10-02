'use client';

import { useEffect, useState } from 'react';
import { colors } from '@/lib/colors';
import { KIRO_LOGO_REVEAL_MS, kiroLogoLetterGaps, kiroLogoLetters } from '@/lib/kiro-logo';

// Braille glyphs are rendered as SVG dots instead of text: the JetBrains Mono
// build served by Google Fonts has no Braille coverage, and fallback fonts
// break the 1-column grid the art depends on.

// One terminal cell = 2×4 dot grid. Cell height = 2× width keeps the dot pitch
// square, matching how the terminal renders it.
const CELL_W = 2;
const CELL_H = 4;
const DOT = 0.55;

// Braille bit → (column, row) inside the cell, per the Unicode dot numbering
const BRAILLE_DOTS: readonly [number, number][] = [
  [0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2], [0, 3], [1, 3],
];

interface LetterGlyph {
  cols: number;
  rows: number;
  dots: [number, number][];
}

function toGlyph(lines: readonly string[]): LetterGlyph {
  const dots: [number, number][] = [];
  let cols = 0;
  lines.forEach((line, row) => {
    const chars = Array.from(line);
    cols = Math.max(cols, chars.length);
    chars.forEach((char, col) => {
      const bits = char.codePointAt(0)! - 0x2800;
      if (bits <= 0 || bits > 0xff) return;
      BRAILLE_DOTS.forEach(([dx, dy], bit) => {
        if (bits & (1 << bit)) dots.push([col * CELL_W + dx, row * CELL_H + dy]);
      });
    });
  });
  return { cols, rows: lines.length, dots };
}

const glyphs = kiroLogoLetters.map(toGlyph);

// Matches the reveal in kiro-cli: start empty, add one letter per tick.
// Skipped entirely when the user prefers reduced motion.
function useRevealCount(total: number, animate: boolean) {
  const [count, setCount] = useState(animate ? 0 : total);

  useEffect(() => {
    if (!animate) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setCount(total);
      return;
    }
    const id = setInterval(() => {
      setCount((c) => {
        if (c + 1 >= total) clearInterval(id);
        return Math.min(c + 1, total);
      });
    }, KIRO_LOGO_REVEAL_MS);
    return () => clearInterval(id);
  }, [animate, total]);

  return count;
}

interface KiroLogoProps {
  animate?: boolean;
}

export function KiroLogo({ animate = true }: KiroLogoProps) {
  const visible = useRevealCount(glyphs.length, animate);

  return (
    <div
      role="img"
      aria-label="KIRO"
      className="flex flex-row justify-center"
      // 1 terminal column = 0.55em; scales the whole logo with the viewport
      style={{ fontSize: 'clamp(9px, 2.6vw, 14px)', height: `${glyphs[0].rows * 1.1}em` }}
    >
      {glyphs.slice(0, visible).map((glyph, i) => (
        <svg
          key={i}
          aria-hidden="true"
          viewBox={`0 0 ${glyph.cols * CELL_W} ${glyph.rows * CELL_H}`}
          width={`${glyph.cols * 0.55}em`}
          height={`${glyph.rows * 1.1}em`}
          style={{ marginRight: `${kiroLogoLetterGaps[i] * 0.55}em` }}
          fill={colors.logo}
        >
          {glyph.dots.map(([x, y]) => (
            <rect
              key={`${x}-${y}`}
              x={x + (1 - DOT) / 2}
              y={y + (1 - DOT) / 2}
              width={DOT}
              height={DOT}
              rx={0.08}
            />
          ))}
        </svg>
      ))}
    </div>
  );
}
