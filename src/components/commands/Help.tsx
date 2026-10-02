'use client';

import { commands } from '@/lib/commands';
import { colors } from '@/lib/colors';
import { siteConfig } from '@/config/site';

// Exclude /help itself from the navigable list
export const helpCommands = commands.filter((cmd) => cmd.name !== '/help');

interface HelpProps {
  selectedIndex: number;
  onSelect: (command: string) => void;
  onCancel: () => void;
}

const MAX_VISIBLE = 6;

export function Help({ selectedIndex, onSelect, onCancel }: HelpProps) {
  // Calculate visible window that follows the selection
  let start = 0;
  if (selectedIndex >= MAX_VISIBLE) {
    start = selectedIndex - MAX_VISIBLE + 1;
  }
  if (start + MAX_VISIBLE > helpCommands.length) {
    start = Math.max(0, helpCommands.length - MAX_VISIBLE);
  }
  const visibleCommands = helpCommands.slice(start, start + MAX_VISIBLE);

  return (
    <div className="text-xs sm:text-sm">
      {/* Version header */}
      <div className="mb-3 ml-2">
        <span style={{ color: colors.helpBlue }} className="font-bold">
          Claude Code v{siteConfig.version}
        </span>
      </div>

      {/* Commands label */}
      <div className="pl-2 mb-2" style={{ color: colors.subtle }}>
        Browse default commands:
      </div>

      {/* Command list — sliding window of 6 */}
      <div className="space-y-0 pl-2">
        {visibleCommands.map((cmd, i) => {
          const globalIndex = start + i;
          const isSelected = globalIndex === selectedIndex;

          return (
            <div
              key={cmd.name}
              className="cursor-pointer py-px leading-tight"
              onClick={() => onSelect(cmd.name)}
            >
              <div className="flex items-center gap-1">
                <span style={{ color: isSelected ? colors.helpBlue : 'transparent' }}>
                  ❯
                </span>
                <span
                  className={isSelected ? 'font-bold' : ''}
                  style={{ color: isSelected ? colors.helpBlue : colors.subtle }}
                >
                  {cmd.name}
                </span>
              </div>
              <div className="pl-3 -mt-0.5" style={{ color: colors.inactive }}>
                {cmd.description}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer — always visible */}
      <div className="pl-2 mt-3" style={{ color: colors.subtle }}>
        For more help, visit and hire that guy:{' '}
        <a
          href={siteConfig.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: colors.helpBlue }}
          className="underline"
        >
          {siteConfig.url}
        </a>
      </div>
      <div className="pl-2" style={{ color: colors.inactive }}>
        <em>Esc</em> to cancel
      </div>
    </div>
  );
}
