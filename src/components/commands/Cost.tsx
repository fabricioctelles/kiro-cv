'use client';

import { colors } from '@/lib/colors';
import { personalConfig } from '@/config/personal';

export function Cost() {
  const yearsExp = new Date().getFullYear() - personalConfig.careerStartYear;
  const coffees = yearsExp * 365 * 2; // ~2 coffees per day

  return (
    <div className="text-xs sm:text-sm py-1">
      <div style={{ color: colors.brand }} className="font-bold mb-1">Cost Analysis Report</div>
      <div className="space-y-0.5 pl-2">
        <div>
          <span style={{ color: colors.subtle }}>  Coffees consumed:       </span>
          <span style={{ color: '#F5A623' }}>~{coffees.toLocaleString()}</span>
        </div>
        {personalConfig.costItems.map((item) => (
          <div key={item.label}>
            <span style={{ color: colors.subtle }}>  {item.label}:  </span>
            <span style={{ color: colors.error }}>{item.value}</span>
          </div>
        ))}
        <div className="mt-1">
          <span style={{ color: colors.subtle }}>  ROI:                    </span>
          <span style={{ color: colors.success }} className="font-bold">priceless</span>
        </div>
      </div>
    </div>
  );
}
