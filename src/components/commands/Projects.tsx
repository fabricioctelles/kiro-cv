'use client';

import { resume } from '@/lib/resume-data';
import { colors } from '@/lib/colors';

export function Projects() {
  const projects = resume.projects ?? [];

  if (projects.length === 0) {
    return (
      <div className="text-xs sm:text-sm py-1" style={{ color: colors.muted }}>
        No projects listed yet.
      </div>
    );
  }

  return (
    <div className="text-xs sm:text-sm py-1 space-y-3">
      {projects.map((project, i) => (
        <div key={i}>
          <div className="flex items-baseline gap-2 flex-wrap">
            <span>●</span>
            {project.url ? (
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: colors.brand, textDecoration: 'none' }}
                className="font-bold"
              >
                {project.name}
              </a>
            ) : (
              <span style={{ color: colors.brand }} className="font-bold">{project.name}</span>
            )}
            {project.type && (
              <span style={{ color: colors.secondary }}>[{project.type}]</span>
            )}
          </div>

          <div className="pl-4" style={{ color: colors.text }}>{project.description}</div>

          {project.highlights && project.highlights.length > 0 && (
            <div className="pl-4 mt-1 space-y-0.5">
              {project.highlights.map((h, j) => (
                <div key={j} className="flex gap-2">
                  <span style={{ color: colors.secondary }}>▸</span>
                  <span style={{ color: colors.muted }}>{h}</span>
                </div>
              ))}
            </div>
          )}

          {project.keywords && project.keywords.length > 0 && (
            <div className="pl-4 mt-1" style={{ color: colors.success }}>
              {project.keywords.join(' · ')}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
