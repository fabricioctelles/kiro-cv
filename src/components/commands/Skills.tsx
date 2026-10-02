'use client';

import { colors } from '@/lib/colors';
import { resume } from '@/lib/resume-data';
import { personalConfig } from '@/config/personal';

export function Skills() {
  // Get all skill names from resume.json
  const resumeSkillNames = new Set(resume.skills.map((s) => s.name));

  // Build categories from config, filtering to only skills present in resume
  const categories = personalConfig.skillCategories
    .map((cat) => ({
      ...cat,
      skills: cat.skills.filter((s) => resumeSkillNames.has(s)),
    }))
    .filter((cat) => cat.skills.length > 0);

  // Collect categorized skill names
  const categorized = new Set<string>(categories.flatMap((cat) => cat.skills));

  // Any resume skills not in a category go into "Other"
  const uncategorized = resume.skills
    .map((s) => s.name)
    .filter((name) => !categorized.has(name));

  return (
    <div className="text-xs sm:text-sm py-1 space-y-2">
      {categories.map((cat) => (
        <div key={cat.name}>
          <span style={{ color: cat.color }} className="font-bold">{cat.name}</span>
          <div className="pl-2 flex flex-wrap gap-x-3 gap-y-0.5">
            {cat.skills.map((skill) => (
              <span key={skill} style={{ color: colors.text }}>
                <span style={{ color: colors.inactive }}>▪ </span>
                {skill}
              </span>
            ))}
          </div>
        </div>
      ))}
      {uncategorized.length > 0 && (
        <div>
          <span style={{ color: colors.subtle }} className="font-bold">Other</span>
          <div className="pl-2 flex flex-wrap gap-x-3 gap-y-0.5">
            {uncategorized.map((skill) => (
              <span key={skill} style={{ color: colors.text }}>
                <span style={{ color: colors.inactive }}>▪ </span>
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
