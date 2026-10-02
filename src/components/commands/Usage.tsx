'use client';

import { colors } from '@/lib/colors';
import { personalConfig } from '@/config/personal';

interface UsageStatWithColor {
  label: string;
  percent: number;
  status: string;
  color: string;
}

const statColors: Record<number, string> = {
  0: colors.error,
  1: colors.brand,
  2: '#FFA500',
  3: colors.success,
  4: colors.permission,
  5: colors.success,
};

const stats: UsageStatWithColor[] = personalConfig.usageStats.map((s, i) => ({
  ...s,
  color: statColors[i] ?? colors.text,
}));

function ProgressBar({ stat }: { stat: UsageStatWithColor }) {
  const totalBlocks = 20;
  const filledBlocks = Math.round((stat.percent / 100) * totalBlocks);
  const emptyBlocks = totalBlocks - filledBlocks;
  const bar = '\u2588'.repeat(filledBlocks) + ' '.repeat(emptyBlocks);

  return (
    <div className="flex items-baseline gap-3 text-xs sm:text-sm">
      <span style={{ color: colors.subtle, minWidth: '180px', display: 'inline-block' }}>
        {stat.label}
      </span>
      <span style={{ color: stat.color }} className="font-mono">
        {bar}
      </span>
      <span style={{ color: colors.inactive }}>
        {stat.percent}% {stat.status}
      </span>
    </div>
  );
}

export function Usage() {
  return (
    <div className="py-2 space-y-2">
      <div className="text-xs sm:text-sm mb-3">
        <div style={{ color: colors.text }} className="font-bold mb-1">
          Current session
        </div>
        {stats.slice(0, 3).map((stat) => (
          <ProgressBar key={stat.label} stat={stat} />
        ))}
      </div>

      <div className="text-xs sm:text-sm">
        <div style={{ color: colors.text }} className="font-bold mb-1">
          Lifetime stats
        </div>
        {stats.slice(3).map((stat) => (
          <ProgressBar key={stat.label} stat={stat} />
        ))}
      </div>

      <div className="text-xs pt-1" style={{ color: colors.inactive }}>
        Resets never ({personalConfig.timezone})
      </div>
    </div>
  );
}
