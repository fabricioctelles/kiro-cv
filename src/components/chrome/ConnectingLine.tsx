'use client';

import { useEffect, useState } from 'react';

// kiro-cli `brailleRotate` spinner
const FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
const FRAME_MS = 80;

// Shown in place of the welcome banner while kiro-cli connects (all dim)
export function ConnectingLine() {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = setInterval(() => setFrame((f) => (f + 1) % FRAMES.length), FRAME_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <div role="status" className="text-xs sm:text-sm leading-[1.5em] mt-4 mb-[1.5em] opacity-50 whitespace-pre">
      {`  ${FRAMES[frame]} Connecting to kiro.dev…`}
    </div>
  );
}
