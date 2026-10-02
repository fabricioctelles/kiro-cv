'use client';

import { filterCommands } from '@/lib/commands';
import { colors } from '@/lib/colors';
import { CommandDefinition } from '@/lib/types';

interface SlashMenuProps {
  input: string;
  selectedIndex: number;
  onSelect: (command: string) => void;
}

export function SlashMenu({ input, selectedIndex, onSelect }: SlashMenuProps) {
  const allMatches = filterCommands(input);
  const maxVisible = 5;

  if (allMatches.length === 0) return null;

  // Calculate visible window that follows the selection
  let start = 0;
  if (selectedIndex >= maxVisible) {
    start = selectedIndex - maxVisible + 1;
  }
  if (start + maxVisible > allMatches.length) {
    start = Math.max(0, allMatches.length - maxVisible);
  }
  const visibleMatches = allMatches.slice(start, start + maxVisible);

  return (
    <div className="text-xs sm:text-sm py-1">
      {visibleMatches.map((cmd: CommandDefinition, i: number) => {
        const globalIndex = start + i;
        return (
          <div
            key={cmd.name}
            className="py-0.5 cursor-pointer flex gap-2 pl-2"
            style={{
              color: globalIndex === selectedIndex ? colors.helpBlue : colors.subtle,
            }}
            onClick={() => onSelect(cmd.name)}
          >
            <span style={{ color: globalIndex === selectedIndex ? colors.helpBlue : colors.subtle, minWidth: '120px', display: 'inline-block' }}>
              {cmd.name}
            </span>
            <span style={{ color: colors.inactive }}>{cmd.description}</span>
          </div>
        );
      })}
    </div>
  );
}
