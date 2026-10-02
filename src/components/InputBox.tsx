'use client';

import { useRef, useEffect } from 'react';
import { colors } from '@/lib/colors';

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

  return (
    <div className="w-full" onClick={onFocus}>
      {/* Top separator */}
      <div
        className="w-full h-px"
        style={{ backgroundColor: colors.promptBorder }}
      />

      {/* Input row */}
      <div className="flex items-center min-h-[2em] text-xs sm:text-sm py-1">
        <span style={{ color: colors.text }} className="mr-1 font-bold select-none">❯</span>
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={onFocus}
            disabled={disabled}
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
                className="cursor-blink inline-block w-[0.6em] h-[1.1em] align-middle ml-px"
                style={{ backgroundColor: colors.text }}
              />
            )}
          </div>
        </div>
        {/* Mobile send button */}
        <button
          className="sm:hidden ml-1 px-2 py-0.5 rounded text-xs font-bold select-none"
          style={{
            backgroundColor: value.trim() ? colors.brand : colors.inactive,
            color: '#fff',
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

      {/* Bottom separator */}
      <div
        className="w-full h-px"
        style={{ backgroundColor: colors.promptBorder }}
      />
    </div>
  );
}
