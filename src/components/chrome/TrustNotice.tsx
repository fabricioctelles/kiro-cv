import { colors } from '@/lib/colors';
import { Divider } from './Divider';

// Banner kiro-cli shows above the prompt when tool confirmations are off
export function TrustNotice() {
  return (
    <div className="text-xs sm:text-sm">
      <Divider />
      <div className="pl-[1ch]">
        <span style={{ color: colors.warning }}>Trust All Tools active, confirmations are off</span>
        <span style={{ color: colors.secondary }}> · /quit to exit</span>
      </div>
    </div>
  );
}
