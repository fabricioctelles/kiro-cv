import { colors } from '@/lib/colors';
import { Divider } from './Divider';

interface TrustNoticeProps {
  message?: string;
}

// Banner kiro-cli shows above the prompt when tool confirmations are off
export function TrustNotice({ message }: TrustNoticeProps) {
  if (!message) return null;
  
  // Split on · to separate warning part from secondary part
  const parts = message.split('·').map(p => p.trim());
  const warning = parts[0];
  const secondary = parts[1];

  return (
    <div className="text-xs sm:text-sm">
      <Divider />
      <div className="pl-[1ch]">
        <span style={{ color: colors.warning }}>{warning}</span>
        {secondary && <span style={{ color: colors.secondary }}> · {secondary}</span>}
      </div>
    </div>
  );
}
