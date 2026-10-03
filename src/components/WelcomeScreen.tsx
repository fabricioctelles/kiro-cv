'use client';

import { colors } from '@/lib/colors';
import { KiroLogo } from '@/components/KiroLogo';

interface WelcomeScreenProps {
  splashName?: string;
  welcome?: string;
  whatsNew?: string;
}

const Blank = () => <div aria-hidden="true">&nbsp;</div>;

// Mirrors kiro-cli's welcome banner (`xm`): logo, then a centered column
// with one block per line. Blocks shrink to their text, so a line that wraps
// stays left-aligned inside its centered block, as Ink renders it.
export function WelcomeScreen({ splashName, welcome, whatsNew }: WelcomeScreenProps) {
  return (
    <div className="text-xs sm:text-sm leading-[1.5em] select-none mb-[1.5em]">
      <div className="mt-4">
        <KiroLogo text={splashName} />
      </div>

      <div className="flex flex-col items-center mt-[1.5em] px-[2ch]" style={{ color: colors.text }}>
        {welcome && <div>{welcome}</div>}
        {whatsNew && (
          <>
            <Blank />
            <div>
              <span className="font-bold">What&apos;s new:</span> {whatsNew}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
