'use client';

import { useRef, useEffect } from 'react';
import { colors } from '@/lib/colors';

// kiro-cli default prompt placeholder (glyphs.enter = ↵)
const PLACEHOLDER = 'ask a question or describe a task ↵';

interface InputBoxProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  focused: boolean;
  onFocus: () => void;
  disabled?: boolean;
}

export function InputBox({
  value,
  onChange,
  onSubmit,
  onKeyDown,
  focused,
  onFocus,
  disabled,
}: InputBoxProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Capture all clicks and keypresses globally → focus input
  useEffect(() => {
    const focusInput = () => {
      if (inputRef.current && !disabled) {
        inputRef.current.focus();
      }
    };

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (document.activeElement === inputRef.current) return;
      if (inputRef.current && !disabled) {
        inputRef.current.focus();
      }
    };

    document.addEventListener('mousedown', focusInput);
    document.addEventListener('keydown', handleGlobalKeyDown);

    return () => {
      document.removeEventListener('mousedown', focusInput);
      document.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [disabled]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
      return;
    }
    onKeyDown(e);
  };

  const showPlaceholder = value === '';

  return (
    <div className="w-full" onClick={onFocus}>
      {/* Input row — kiro-cli draws no prompt glyph, just the cursor */}
      <div className="flex items-center min-h-[1.5em] text-xs sm:text-sm">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={onFocus}
            disabled={disabled}
            aria-label={PLACEHOLDER}
            className="absolute inset-0 w-full bg-transparent border-none outline-none text-text font-mono text-xs sm:text-sm caret-transparent"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
          />
          {/* Overlay with cursor */}
          <div className="pointer-events-none whitespace-pre flex items-center">
            <span className="text-text">{value}</span>
            {focused && (
              <span
                className="cursor-blink inline-block w-[0.6em] h-[1.1em] align-middle"
                style={{ backgroundColor: colors.text }}
              />
            )}
            {showPlaceholder && <span style={{ color: colors.muted }}>{PLACEHOLDER}</span>}
          </div>
        </div>
        {/* Mobile send button */}
        <button
          className="sm:hidden ml-1 px-2 py-0.5 rounded text-xs font-bold select-none"
          style={{
            backgroundColor: value.trim() ? colors.brand : colors.surface,
            color: value.trim() ? colors.surface : colors.secondary,
          }}
          onClick={(e) => {
            e.stopPropagation();
            onSubmit();
          }}
          disabled={!value.trim() || disabled}
        >
          Send
        </button>
      </div>
    </div>
  );
}
