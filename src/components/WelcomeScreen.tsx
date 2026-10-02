'use client';

import { colors } from '@/lib/colors';
import { KiroLogo } from '@/components/KiroLogo';

interface WelcomeScreenProps {
  currentModelIndex?: number;
  splashName?: string;
}

export function WelcomeScreen({ currentModelIndex = 0, splashName }: WelcomeScreenProps) {
  return (
    <div className="text-xs sm:text-sm select-none mb-6">
      {/* Logo */}
      <div className="mb-4 mt-4">
        <KiroLogo text={splashName} />
      </div>

      {/* Welcome message */}
      <div className="text-center mb-4">
        <span style={{ color: colors.text }}>Welcome to </span>
        <span style={{ color: colors.logo }}>Kiro CLI V3</span>
        <span style={{ color: colors.text }}>!</span>
      </div>

      {/* What's new section */}
      <div className="text-center mb-2">
        <span style={{ color: colors.text }} className="font-bold">What&apos;s new: </span>
        <span style={{ color: colors.subtle }}>
          Specs, expanded hooks, and an improved trust model.
        </span>
      </div>

      {/* Upgrade message */}
      <div className="text-center mb-1" style={{ color: colors.subtle }}>
        Upgrade your V2 agent configurations to V3 with{' '}
        <span style={{ color: colors.brand }}>/upgrade-agent</span>
      </div>

      {/* Documentation link */}
      <div className="text-center mb-4">
        <a
          href="https://kiro.dev/docs/cli/v3/"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: colors.permission }}
          className="hover:underline"
        >
          https://kiro.dev/docs/cli/v3/
        </a>
      </div>

      {/* Tip */}
      <div className="text-center mt-6">
        <span style={{ color: colors.text }} className="font-bold">Tip: </span>
        <span style={{ color: colors.subtle }}>Press </span>
        <span style={{ color: colors.brand }}>Ctrl+V</span>
        <span style={{ color: colors.subtle }}> or run </span>
        <span style={{ color: colors.brand }}>/paste</span>
        <span style={{ color: colors.subtle }}> to attach an image from your clipboard to the conversation.</span>
      </div>
    </div>
  );
}
