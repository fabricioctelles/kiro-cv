'use client';

import { resume } from '@/lib/resume-data';
import { colors } from '@/lib/colors';

function formatDate(dateStr?: string): string | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export function Publications() {
  const publications = resume.publications ?? [];

  if (publications.length === 0) {
    return (
      <div className="text-xs sm:text-sm py-1" style={{ color: colors.muted }}>
        No publications listed yet.
      </div>
    );
  }

  return (
    <div className="text-xs sm:text-sm py-1 space-y-3">
      {publications.map((pub, i) => {
        const date = formatDate(pub.releaseDate);

        return (
          <div key={i}>
            <div className="flex items-baseline gap-2 flex-wrap">
              <span>●</span>
              {pub.url ? (
                <a
                  href={pub.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: colors.text, textDecoration: 'none' }}
                  className="font-bold"
                >
                  {pub.name}
                </a>
              ) : (
                <span style={{ color: colors.text }} className="font-bold">{pub.name}</span>
              )}
            </div>

            <div className="pl-4" style={{ color: colors.secondary }}>
              <span style={{ color: colors.brand }}>{pub.publisher}</span>
              {date && <span> · {date}</span>}
            </div>

            {pub.summary && (
              <div className="pl-4 mt-1" style={{ color: colors.muted }}>{pub.summary}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
