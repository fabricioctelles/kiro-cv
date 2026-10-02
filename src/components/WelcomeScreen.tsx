'use client';

import { colors } from '@/lib/colors';
import { KiroLogo } from '@/components/KiroLogo';
import { isTipHighlight } from '@/lib/tips';

interface WelcomeScreenProps {
  splashName?: string;
  tip?: string;
}

const Blank = () => <div aria-hidden="true">&nbsp;</div>;

// Mirrors kiro-cli's welcome banner (`xm`): logo, then a centered column
// with one block per line. Blocks shrink to their text, so a line that wraps
// stays left-aligned inside its centered block, as Ink renders it.
export function WelcomeScreen({ splashName, tip }: WelcomeScreenProps) {
  return (
    <div className="text-xs sm:text-sm leading-[1.5em] select-none mb-[1.5em]">
      <div className="mt-4">
        <KiroLogo text={splashName} />
      </div>

      <div className="flex flex-col items-center mt-[1.5em] px-[2ch]" style={{ color: colors.text }}>
        <div>
          Welcome to <span style={{ color: colors.brand }}>Kiro CLI V3</span>!
        </div>
        <Blank />
        <div>
          <span className="font-bold">What&apos;s new:</span> Specs, expanded hooks, and an improved trust model.
        </div>
        <div>
          Upgrade your V2 agent configurations to V3 with <span className="font-bold">/upgrade-agent</span>
        </div>
        <a
          href="https://kiro.dev/docs/cli/v3/"
          target="_blank"
          rel="noopener noreferrer"
          // kiro-cli prints the URL as plain brand-colored text
          style={{ color: colors.brand, textDecoration: 'none' }}
        >
          https://kiro.dev/docs/cli/v3/
        </a>
        {tip && (
          <>
            <Blank />
            <div>
              <span className="font-bold">Tip: </span>
              {tip.split(' ').map((word, i) => (
                <span key={i} style={isTipHighlight(word) ? { color: colors.brand } : undefined}>
                  {i > 0 && ' '}
                  {word}
                </span>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
