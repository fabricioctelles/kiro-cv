'use client';

import { resume } from '@/lib/resume-data';
import { colors } from '@/lib/colors';

export function About() {
  const { basics, work } = resume;
  const currentRole = work[0];

  return (
    <div className="text-xs sm:text-sm py-1">
      <div className="mb-2">
        <span style={{ color: colors.brand }} className="font-bold">{basics.name}</span>
        <span style={{ color: colors.inactive }}> — </span>
        <span style={{ color: colors.subtle }}>{basics.label}</span>
      </div>

      {/* Summary box */}
      <div className="mb-2">
        <span className="flex-1 whitespace-pre-wrap" style={{ color: colors.text }}>
          {basics.summary}
        </span>
      </div>

      <div className="space-y-0.5">
        <div>
          <span style={{ color: colors.helpBlue }}>  Current Role  </span>
          <span style={{ color: colors.text }}>{currentRole.position} @ {currentRole.name}</span>
        </div>
        <div>
          <span style={{ color: colors.helpBlue }}>  Location      </span>
          <span style={{ color: colors.text }}>{basics.location.city}, {basics.location.region}</span>
        </div>
        <div>
          <span style={{ color: colors.helpBlue }}>  Website       </span>
          <a href={`https://${basics.url}`} target="_blank" rel="noopener noreferrer">{basics.url}</a>
        </div>
      </div>
    </div>
  );
}
