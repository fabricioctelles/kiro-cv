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
        const isSelected = globalIndex === selectedIndex;
        return (
          <div
            key={cmd.name}
            className="py-0.5 cursor-pointer flex gap-2 pl-2"
            onClick={() => onSelect(cmd.name)}
          >
            {/* kiro-cli textStyles: label = primary, selectedLabel = accent + bold */}
            <span
              className={isSelected ? 'font-bold' : undefined}
              style={{ color: isSelected ? colors.accent : colors.text, minWidth: '120px', display: 'inline-block' }}
            >
              {cmd.name}
            </span>
            <span style={{ color: colors.secondary }}>{cmd.description}</span>
          </div>
        );
      })}
    </div>
  );
}
