import { colors } from '@/lib/colors';

interface StatusLineProps {
  agent: string;
  model: string;
  location: string;
  branch?: string;
}

const Separator = () => <span style={{ color: colors.secondary }}> · </span>;

// kiro-cli status line, default TUI segments: agent · model on the left,
// location · (branch) on the right. Colors follow each segment's definition.
export function StatusLine({ agent, model, location, branch }: StatusLineProps) {
  return (
    <div className="flex justify-between gap-[2ch] text-xs sm:text-sm leading-[1.5em] whitespace-nowrap">
      <div className="min-w-0 truncate">
        <span style={{ color: colors.brand }}>{agent}</span>
        <Separator />
        <span style={{ color: colors.text }}>{model}</span>
      </div>
      <div className="min-w-0 truncate">
        <span style={{ color: colors.brand }}>{location}</span>
        {branch && (
          <>
            <Separator />
            <span style={{ color: colors.secondary }}>(</span>
            <span style={{ color: colors.text }}>{branch}</span>
            <span style={{ color: colors.secondary }}>)</span>
          </>
        )}
      </div>
    </div>
  );
}
