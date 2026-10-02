'use client';

import { resume } from '@/lib/resume-data';
import { colors } from '@/lib/colors';
import { personalConfig } from '@/config/personal';

export function Status() {
  const yearsExp = new Date().getFullYear() - personalConfig.careerStartYear;
  const totalCerts = resume.certificates.length;
  const companies = new Set(resume.work.map((w) => w.name)).size;

  // Group certs by issuer dynamically
  const certsByIssuer = resume.certificates.reduce<Record<string, number>>((acc, c) => {
    acc[c.issuer] = (acc[c.issuer] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="text-xs sm:text-sm py-1">
      <div style={{ color: colors.brand }} className="font-bold mb-1">Portfolio Status</div>
      <div className="space-y-0.5 pl-2">
        <div>
          <span style={{ color: colors.success }}>✓</span>
          <span style={{ color: colors.subtle }}> Experience:  </span>
          <span style={{ color: colors.text }}>{yearsExp}+ years in data engineering</span>
        </div>
        <div>
          <span style={{ color: colors.success }}>✓</span>
          <span style={{ color: colors.subtle }}> Certs:       </span>
          <span style={{ color: colors.text }}>{totalCerts} professional certifications</span>
        </div>
        {Object.entries(certsByIssuer).map(([issuer, count]) => (
          <div key={issuer}>
            <span style={{ color: colors.success }}>✓</span>
            <span style={{ color: colors.subtle }}> {issuer} Certs:  </span>
            <span style={{ color: colors.text }}>{count} {issuer} certifications</span>
          </div>
        ))}
        <div>
          <span style={{ color: colors.success }}>✓</span>
          <span style={{ color: colors.subtle }}> Companies:   </span>
          <span style={{ color: colors.text }}>{companies} companies</span>
        </div>
        <div>
          <span style={{ color: colors.success }}>✓</span>
          <span style={{ color: colors.subtle }}> Status:      </span>
          <span style={{ color: '#4FC3F7' }}>{personalConfig.status}</span>
        </div>
      </div>
    </div>
  );
}
