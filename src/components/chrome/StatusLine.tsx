import { colors } from '@/lib/colors';

interface StatusLineProps {
  agent: string;
  model: string;
  folder?: string;  // Full folder string like "~/workspace/projects/my-project · (main)"
}

const Separator = () => <span style={{ color: colors.secondary }}> · </span>;

// kiro-cli status line, default TUI segments: agent · model on the left,
// folder on the right. Colors follow each segment's definition.
export function StatusLine({ agent, model, folder }: StatusLineProps) {
  // Parse folder to extract path and branch if format is "path · (branch)"
  let location = '';
  let branch = '';
  
  if (folder) {
    const match = folder.match(/^(.+?)\s*·\s*\((.+)\)$/);
    if (match) {
      location = match[1].trim();
      branch = match[2].trim();
    } else {
      location = folder;
    }
  }

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
