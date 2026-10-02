'use client';

import { resume } from '@/lib/resume-data';
import { colors } from '@/lib/colors';

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'Present';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export function Experience() {
  const { work } = resume;

  return (
    <div className="text-xs sm:text-sm py-1 space-y-3">
      {work.map((job, i) => (
        <div key={i}>
          {/* Git log style commit header */}
          <div className="flex items-baseline gap-2 flex-wrap">
            <span>●</span>
            <span style={{ color: colors.helpBlue }} className="font-bold">{job.name}</span>
            <span style={{ color: colors.inactive }}>—</span>
            <span style={{ color: colors.text }} className="font-bold">{job.position}</span>
          </div>

          <div className="pl-4" style={{ color: colors.inactive }}>
            {formatDate(job.startDate)} → {formatDate(job.endDate)}
            {!job.endDate && (
              <span style={{ color: colors.success }} className="ml-2 text-xs">● CURRENT</span>
            )}
          </div>

          {/* Highlights */}
          <div className="pl-4 mt-1 space-y-0.5">
            {job.highlights.map((h, j) => (
              <div key={j} className="flex gap-2">
                <span style={{ color: colors.inactive }}>▸</span>
                <span style={{ color: colors.subtle }}>{h}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
