'use client';

import { colors } from '@/lib/colors';
import { siteConfig } from '@/config/site';

export function Download() {
  const url = siteConfig.url;

  return (
    <div className="text-xs sm:text-sm py-1">
      <div style={{ color: colors.subtle }}>
        Want a more serious resume, even in PDF?{' '}
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: colors.helpBlue }}
        >
          {url.replace(/^https?:\/\//, '')}
        </a>
      </div>
    </div>
  );
}
