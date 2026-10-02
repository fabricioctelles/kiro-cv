'use client';

import { useState, useEffect } from 'react';
import { colors } from '@/lib/colors';
import { personalConfig } from '@/config/personal';

const severityColors = {
  success: colors.success,
  warning: '#F5A623',
  error: colors.error,
} as const;

const checks = personalConfig.doctorChecks.map((c) => ({
  ...c,
  color: severityColors[c.severity],
}));

export function Doctor() {
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    if (visibleCount >= checks.length) return;
    const timer = setTimeout(() => {
      setVisibleCount((c) => c + 1);
    }, 400);
    return () => clearTimeout(timer);
  }, [visibleCount]);

  return (
    <div className="text-xs sm:text-sm py-1">
      <div style={{ color: colors.brand }} className="font-bold mb-1">Running diagnostics...</div>
      <div className="space-y-0.5 pl-2">
        {checks.slice(0, visibleCount).map((check, i) => (
          <div key={i}>
            <span style={{ color: colors.subtle }}>{check.label}... </span>
            <span style={{ color: check.color }} className="font-bold">{check.result}</span>
          </div>
        ))}
        {visibleCount < checks.length && (
          <div>
            <span style={{ color: colors.subtle }}>{checks[visibleCount].label}... </span>
            <span style={{ color: colors.brand }} className="cursor-blink">●</span>
          </div>
        )}
      </div>
      {visibleCount >= checks.length && (
        <div className="mt-1" style={{ color: colors.success }}>
          Diagnosis complete. All systems operational (except coffee).
        </div>
      )}
    </div>
  );
}
