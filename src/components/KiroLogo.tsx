'use client';

import { useEffect, useMemo, useState } from 'react';
import { colors } from '@/lib/colors';
import { KIRO_LOGO_REVEAL_MS } from '@/lib/kiro-logo';
import { layoutSplash, normalizeSplashText, splashLineWidth } from '@/lib/kiro-text';

// Braille glyphs are rendered as SVG dots instead of text: the JetBrains Mono
// build served by Google Fonts has no Braille coverage, and fallback fonts
// break the 1-column grid the art depends on.

// One terminal cell is 0.55em wide and 1.1em tall, split into 2×4 dots, so the
// dot pitch is square: 0.275em in both directions.
const DOT_EM = 0.275;
const DOT = 0.55;
// Blank space between wrapped lines: one terminal row
const LINE_GAP_DOTS = 4;
// Long names shrink so the splash never grows past this many lines' height
const MAX_LINES_AT_FULL_SIZE = 2;

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
  // Text to spell in the Kiro font; the original KIRO splash when empty
  text?: string | null;
  animate?: boolean;
}

export function KiroLogo({ text, animate = true }: KiroLogoProps) {
  const lines = useMemo(() => layoutSplash(text), [text]);
  const total = lines.reduce((sum, line) => sum + line.length, 0);
  const visible = useRevealCount(total, animate);
  const widest = Math.max(...lines.map(splashLineWidth));
  const heightScale = Math.min(1, MAX_LINES_AT_FULL_SIZE / lines.length);
  const label = (text && normalizeSplashText(text)) || 'KIRO';

  let index = 0;

  return (
    <div role="img" aria-label={label} style={{ containerType: 'inline-size' }}>
      {/* Scales with the viewport, and shrinks further so the widest line fits */}
      <div
        style={{
          fontSize: `min(calc(clamp(9px, 2.6vw, 14px) * ${heightScale}), calc(100cqw / ${widest * DOT_EM}))`,
        }}
      >
        {lines.map((line, row) => (
          <div
            key={row}
            className="flex flex-row justify-center"
            style={{
              height: `${line[0].dots.length * DOT_EM}em`,
              marginTop: row > 0 ? `${LINE_GAP_DOTS * DOT_EM}em` : undefined,
            }}
          >
            {line.map((letter, i) => {
              if (index++ >= visible) return null;
              const cols = letter.dots[0].length;
              const rows = letter.dots.length;
              return (
                <svg
                  key={i}
                  aria-hidden="true"
                  viewBox={`0 0 ${cols} ${rows}`}
                  width={`${cols * DOT_EM}em`}
                  height={`${rows * DOT_EM}em`}
                  style={{ marginRight: i < line.length - 1 ? `${letter.gapAfter * DOT_EM}em` : undefined }}
                  fill={colors.logo}
                >
                  {letter.dots.flatMap((dotRow, y) =>
                    dotRow.map((on, x) =>
                      on ? (
                        <rect
                          key={`${x}-${y}`}
                          x={x + (1 - DOT) / 2}
                          y={y + (1 - DOT) / 2}
                          width={DOT}
                          height={DOT}
                          rx={0.08}
                        />
                      ) : null,
                    ),
                  )}
                </svg>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
