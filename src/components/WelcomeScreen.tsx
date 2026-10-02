'use client';

import { colors } from '@/lib/colors';
import { kiroLogoLines } from '@/lib/kiro-logo';

interface WelcomeScreenProps {
  currentModelIndex?: number;
}

// Gradient colors for the logo (from lighter purple to darker)
const logoGradientColors = [
  '#e2d3fe', // lightest
  '#d4c0fc',
  '#c6adfa',
  '#b89af8',
  '#aa87f6',
  '#9c74f4', // darkest visible
];

function KiroLogo() {
  return (
    <pre className="text-sm sm:text-base md:text-lg leading-tight font-mono text-center">
      {kiroLogoLines.map((line, index) => {
        // Create gradient effect from top (lighter) to bottom (darker)
        const colorIndex = Math.min(index, logoGradientColors.length - 1);
        return (
          <div key={index} style={{ color: logoGradientColors[colorIndex] }}>
            {line}
          </div>
        );
      })}
    </pre>
  );
}

export function WelcomeScreen({ currentModelIndex = 0 }: WelcomeScreenProps) {
  return (
    <div className="text-xs sm:text-sm select-none mb-6">
      {/* Logo */}
      <div className="flex justify-center mb-6 mt-4">
        <KiroLogo />
      </div>

      {/* Welcome message */}
      <div className="text-center mb-4">
        <span style={{ color: colors.text }}>Welcome to </span>
        <span style={{ color: colors.brand }}>Kiro CLI V3</span>
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
