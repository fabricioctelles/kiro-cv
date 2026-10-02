import { colors } from '@/lib/colors';

// kiro-cli `qt`: a full-width row of `─` in the surface color. Drawn as a
// centered 1px rule on a text-row-tall box so it occupies one terminal row.
export function Divider() {
  return (
    <div aria-hidden="true" className="flex items-center h-[1.5em]">
      <div className="w-full h-px" style={{ backgroundColor: colors.surface }} />
    </div>
  );
}
