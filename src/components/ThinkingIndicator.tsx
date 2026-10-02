'use client';

import { useEffect, useState } from 'react';
import { colors } from '@/lib/colors';
import { pickTip } from '@/lib/tips';
import { MessageBar } from './chrome/MessageBar';

// kiro-cli `brailleFill` spinner, advanced every 100ms
const FRAMES = ['⠀', '⠁', '⠉', '⠙', '⠹', '⢹', '⣹', '⣽', '⣿'];
const FRAME_MS = 100;
// kiro-cli shows a tip under the indicator once a turn runs this long
const TIP_DELAY_MS = 2000;

// Same escalation as kiro-cli's thinking label
function thinkingLabel(elapsedMs: number) {
  if (elapsedMs >= 180_000) return 'Still thinking, complex requests can take me longer. Show thinking in settings to see progress.';
  if (elapsedMs >= 120_000) return 'Still thinking, this is a tricky one...';
  if (elapsedMs >= 60_000) return 'Still thinking...';
  return 'Thinking...';
}

interface ThinkingIndicatorProps {
  showTip?: boolean;
}

export function ThinkingIndicator({ showTip = false }: ThinkingIndicatorProps) {
  const [frame, setFrame] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [tip, setTip] = useState<string | null>(null);

  useEffect(() => {
    const start = Date.now();
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // Reduced motion: hold the last (full) frame, as kiro-cli does
    if (reduced) setFrame(FRAMES.length - 1);
    const spin = reduced ? undefined : setInterval(() => setFrame((f) => (f + 1) % FRAMES.length), FRAME_MS);
    const clock = setInterval(() => setElapsed(Date.now() - start), 1000);
    const tipTimer = showTip ? setTimeout(() => setTip(pickTip().text), TIP_DELAY_MS) : undefined;
    return () => {
      clearInterval(spin);
      clearInterval(clock);
      clearTimeout(tipTimer);
    };
  }, [showTip]);

  return (
    <MessageBar marker={FRAMES[frame]}>
      <div role="status">
        <span style={{ color: colors.brand }}>{thinkingLabel(elapsed)}</span>
        <span style={{ color: colors.muted }}> (esc to cancel)</span>
      </div>
      {tip && <div style={{ color: colors.muted }}>╰ Tip: {tip}</div>}
    </MessageBar>
  );
}
