'use client';

import { resume } from '@/lib/resume-data';
import { colors } from '@/lib/colors';

const fluencyMap: Record<string, number> = {
  'Native speaker': 12,
  'Advanced': 8,
  'Intermediate': 6,
  'Beginner': 3,
};

const fluencyLabel: Record<string, string> = {
  'Advanced': 'Little rusty',
};

export function Languages() {
  const { languages } = resume;

  return (
    <div className="text-xs sm:text-sm py-1 space-y-1">
      {languages.map((lang) => {
        const filled = fluencyMap[lang.fluency] ?? 6;
        const empty = 12 - filled;
        return (
          <div key={lang.language} className="flex items-center">
            <span style={{ color: colors.text, minWidth: '80px' }} className="inline-block">
              {lang.language}
            </span>
            <span style={{ color: colors.success }}>{'█'.repeat(filled)}</span>
            <span style={{ color: colors.inactive }}>{'░'.repeat(empty)}</span>
            <span style={{ color: colors.subtle, marginLeft: '0.5em' }}>{fluencyLabel[lang.fluency] ?? lang.fluency}</span>
          </div>
        );
      })}
    </div>
  );
}
