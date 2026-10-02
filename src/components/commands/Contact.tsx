'use client';

import { resume } from '@/lib/resume-data';
import { colors } from '@/lib/colors';

export function Contact() {
  const { basics } = resume;

  return (
    <div className="text-xs sm:text-sm py-1">
      <div className="space-y-0.5 pl-2">
        <div>
          <span style={{ color: colors.helpBlue }}>  Email     </span>
          <a href={`mailto:${basics.email}`} style={{ color: colors.text }}>{basics.email}</a>
        </div>
        {basics.profiles.map((profile) => (
          <div key={profile.network}>
            <span style={{ color: colors.helpBlue }}>  {profile.network.padEnd(9)} </span>
            <a href={profile.url} target="_blank" rel="noopener noreferrer" style={{ color: colors.text }}>
              {profile.url}
            </a>
          </div>
        ))}
        <div>
          <span style={{ color: colors.helpBlue }}>  Web       </span>
          <a href={`https://${basics.url}`} target="_blank" rel="noopener noreferrer" style={{ color: colors.text }}>
            {basics.url}
          </a>
        </div>
      </div>
    </div>
  );
}
