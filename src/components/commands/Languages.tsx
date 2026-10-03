'use client';

import { resume } from '@/lib/resume-data';
import { colors } from '@/lib/colors';

const fluencyMap: Record<string, number> = {
  // English
  'Native speaker': 12,
  'Native': 12,
  'Fluent': 10,
  'Advanced': 8,
  'Professional': 7,
  'Intermediate': 6,
  'Conversational': 5,
  'Beginner': 3,
  // Portuguese
  'Nativo': 12,
  'Fluente': 10,
  'Fluente (Full Professional)': 10,
  'Avançado': 8,
  'Profissional': 7,
  'Intermediário': 6,
  'Conversacional': 5,
  'Básico': 3,
};

const fluencyLabel: Record<string, string> = {
  'Advanced': 'Little rusty',
  'Fluente (Full Professional)': 'Fluente',
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
            <span style={{ color: colors.secondary }}>{'░'.repeat(empty)}</span>
            <span style={{ color: colors.muted, marginLeft: '0.5em' }}>{fluencyLabel[lang.fluency] ?? lang.fluency}</span>
          </div>
        );
      })}
    </div>
  );
}
