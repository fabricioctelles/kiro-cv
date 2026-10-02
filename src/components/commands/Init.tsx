'use client';

import { useState, useEffect } from 'react';
import { Spinner } from '../Spinner';
import { colors } from '@/lib/colors';
import { personalConfig } from '@/config/personal';

const kiroMd = personalConfig.initContent;

function getLineColor(line: string): string {
  if (line.startsWith('# ')) return colors.brand;
  if (line.startsWith('## ')) return colors.brand;
  if (line.startsWith('- ')) return colors.text;
  if (line.startsWith('> ')) return colors.subtle;
  if (line.startsWith('```')) return colors.inactive;
  if (line.startsWith('pnpm ')) return colors.success;
  return colors.text;
}

export function Init() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    // Phase 0: Spinner (thinking) — 2.5s
    const t1 = setTimeout(() => setPhase(1), 2500);
    // Phase 1: Read(resume.json) — appears, then 1s pause
    const t2 = setTimeout(() => setPhase(2), 3500);
    // Phase 2: Write(KIRO.md) header — 0.8s pause
    const t3 = setTimeout(() => setPhase(3), 4300);
    // Phase 3: Show diff view

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  return (
    <div className="text-xs sm:text-sm py-1 space-y-2">
      {/* Phase 0: Spinner */}
      {phase === 0 && <Spinner />}

      {/* Phase 1+: Read step */}
      {phase >= 1 && (
        <div>
          <div className="flex items-center gap-1.5">
            <span style={{ color: colors.brand }}>⏺</span>
            <span style={{ color: colors.text }}>Read(</span>
            <span style={{ color: colors.permission }}>resume.json</span>
            <span style={{ color: colors.text }}>)</span>
          </div>
          <div className="pl-5" style={{ color: colors.subtle }}>
            ⎿  Read 30 lines
          </div>
        </div>
      )}

      {/* Phase 1 spinner between steps */}
      {phase === 1 && <Spinner />}

      {/* Phase 2+: Write step */}
      {phase >= 2 && (
        <div className="flex items-center gap-1.5">
          <span style={{ color: colors.brand }}>⏺</span>
          <span style={{ color: colors.text }}>Write(</span>
          <span style={{ color: colors.permission }}>KIRO.md</span>
          <span style={{ color: colors.text }}>)</span>
        </div>
      )}

      {/* Phase 2 spinner before diff */}
      {phase === 2 && <Spinner />}

      {/* Phase 3: Diff view */}
      {phase >= 3 && (
        <div className="mt-2">
          {/* Top separator */}
          <div className="overflow-hidden" style={{ color: colors.inactive }}>
            {'─'.repeat(200)}
          </div>

          {/* File header */}
          <div className="py-1 px-2">
            <div style={{ color: colors.subtle }}>Create file</div>
            <div style={{ color: colors.text }} className="font-bold">
              KIRO.md
            </div>
          </div>

          {/* Dashed separator */}
          <div className="overflow-hidden" style={{ color: colors.inactive }}>
            {'╌'.repeat(200)}
          </div>

          {/* File content */}
          <div className="py-2 font-mono">
            {kiroMd.map((line, i) => {
              const color = getLineColor(line);
              return (
                <div key={i} className="flex px-1">
                  {/* Line number */}
                  <span
                    className="w-8 sm:w-10 shrink-0 text-right pr-2 sm:pr-3 select-none"
                    style={{ color: colors.inactive }}
                  >
                    {i + 1}
                  </span>
                  {/* Content */}
                  <span
                    className="flex-1 whitespace-pre-wrap break-all"
                    style={{ color, fontWeight: line.startsWith('#') ? 'bold' : undefined }}
                  >
                    {line || '\u00A0'}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Bottom separator */}
          <div className="overflow-hidden" style={{ color: colors.inactive }}>
            {'─'.repeat(200)}
          </div>
        </div>
      )}
    </div>
  );
}
