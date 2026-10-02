'use client';

import { colors } from '@/lib/colors';
import { personalConfig } from '@/config/personal';

export const careerModels = personalConfig.careerModels;

interface ModelsProps {
  selectedIndex: number;
  currentIndex: number;
  onConfirm: (index: number) => void;
  onCancel: () => void;
}

export function Models({
  selectedIndex,
  currentIndex,
  onConfirm,
  onCancel,
}: ModelsProps) {
  return (
    <div className="text-xs sm:text-sm py-2">
      {/* Separator */}
      <div
        className="w-full h-px mb-3"
        style={{ backgroundColor: colors.promptBorder }}
      />

      <div className="pl-1 mb-1">
        <span style={{ color: colors.text }} className="font-bold">
          Select model
        </span>
      </div>
      <div className="pl-1 mb-3" style={{ color: colors.subtle }}>
        ↑↓ Navigate · Enter to confirm · Esc to exit
      </div>

      <div className="space-y-0.5 pl-1">
        {careerModels.map((model, i) => {
          const isSelected = i === selectedIndex;
          const isCurrent = i === currentIndex;

          return (
            <div
              key={model.name}
              className="flex items-center gap-2 py-0.5 cursor-pointer"
              style={{
                color: isSelected ? colors.text : colors.subtle,
                backgroundColor: isSelected ? 'rgba(87, 105, 247, 0.08)' : 'transparent',
              }}
              onClick={() => onConfirm(i)}
            >
              <span style={{ color: isSelected ? colors.brand : 'transparent' }}>
                ❯
              </span>
              <span style={{ color: colors.inactive }}>{i + 1}.</span>
              <span
                className={isSelected ? 'font-bold' : ''}
                style={{ color: isSelected ? colors.text : colors.subtle }}
              >
                {model.name}
              </span>
              {isCurrent && (
                <span style={{ color: colors.success }}>✔</span>
              )}
              <span style={{ color: colors.inactive }}>
                {model.subtitle} · {model.description}
              </span>
            </div>
          );
        })}
      </div>

      {/* Effort indicator */}
      <div className="pl-1 mt-3 flex items-center gap-2">
        <span style={{ color: colors.brand }}>▌▌▌</span>
        <span style={{ color: colors.subtle }}>High effort (default)</span>
      </div>

      {/* Footer */}
      <div className="pl-1 mt-2" style={{ color: colors.inactive }}>
        Enter to confirm · Esc to exit
      </div>
    </div>
  );
}
