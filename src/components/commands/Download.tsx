'use client';

import { colors } from '@/lib/colors';
import { resume } from '@/lib/resume-data';

export function Download() {
  const message = resume.resume?.message ?? 'Want a more serious resume, even in PDF?';
  const url = resume.resume?.url ?? resume.basics.url;

  return (
    <div className="text-xs sm:text-sm py-1">
      <div style={{ color: colors.muted }}>
        {message}{' '}
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: colors.brand }}
        >
          {url.replace(/^https?:\/\//, '')}
        </a>
      </div>
    </div>
  );
}
