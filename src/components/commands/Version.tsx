'use client';

import { siteConfig } from '@/config/site';
import { colors } from '@/lib/colors';

export function Version() {
  return (
    <div className="text-xs sm:text-sm py-1">
      <div>
        <span style={{ color: colors.brand }}>{siteConfig.name}</span>
        <span style={{ color: colors.text }}> v{siteConfig.version}</span>
      </div>
      <div style={{ color: colors.subtle }}>
        Built with Next.js, TypeScript, and Kiro CLI
      </div>
    </div>
  );
}
