import type { ReactNode } from 'react';
import { colors } from '@/lib/colors';

interface MessageBarProps {
  // Current turn: the 1-column bar is filled with the bar color
  active?: boolean;
  // Glyph shown in the bar's first row instead of the fill (e.g. a spinner)
  marker?: ReactNode;
  color?: string;
  children: ReactNode;
}

// kiro-cli wraps every message in a row with a 1-column bar on the left and
// the content one column further in. The bar is only painted for the active
// turn; past turns keep the indent without it.
export function MessageBar({ active = false, marker, color = colors.brand, children }: MessageBarProps) {
  return (
    <div className="flex">
      <div
        aria-hidden="true"
        className="w-[1ch] shrink-0"
        style={{ backgroundColor: active && !marker ? color : undefined, color }}
      >
        {marker}
      </div>
      <div className="ml-[1ch] flex-1 min-w-0">{children}</div>
    </div>
  );
}

// kiro-cli renders the user's prompt on the surface color, followed by a blank row
export function UserPrompt({ text, active }: { text: string; active?: boolean }) {
  return (
    <MessageBar active={active}>
      <div>
        <span
          className="whitespace-pre-wrap wrap-break-word [box-decoration-break:clone]"
          style={{ backgroundColor: colors.surface, color: colors.text }}
        >
          {text}
        </span>
      </div>
      <div aria-hidden="true">&nbsp;</div>
    </MessageBar>
  );
}
