'use client';

import { useState, useRef, useEffect } from 'react';
import { colors } from '@/lib/colors';

interface LoginScreenProps {
  hostname: string;
  expectedUser: string;
  expectedPassword: string;
  onLoginSuccess: () => void;
}

type LoginState = 'user' | 'password' | 'checking' | 'failed' | 'success';

export function LoginScreen({ 
  hostname, 
  expectedUser, 
  expectedPassword, 
  onLoginSuccess 
}: LoginScreenProps) {
  const [state, setState] = useState<LoginState>('user');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [history, setHistory] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [state]);

  const addLine = (line: string) => {
    setHistory(h => [...h, line]);
  };

  const handleSubmit = () => {
    if (state === 'user') {
      addLine(`${hostname} login: ${username}`);
      setState('password');
    } else if (state === 'password') {
      addLine(`Password: ${'•'.repeat(password.length)}`);
      setState('checking');
      
      // Simulate login check
      setTimeout(() => {
        if (username === expectedUser && password === expectedPassword) {
          addLine('');
          addLine(`Last login: ${new Date().toLocaleString()}`);
          addLine('');
          setState('success');
          setTimeout(onLoginSuccess, 800);
        } else {
          addLine('');
          addLine('Login incorrect');
          addLine('');
          setAttempts(a => a + 1);
          setUsername('');
          setPassword('');
          setState('failed');
          setTimeout(() => setState('user'), 100);
        }
      }, 500);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  const currentPrompt = state === 'user' 
    ? `${hostname} login: ` 
    : state === 'password' 
    ? 'Password: ' 
    : '';

  const currentValue = state === 'user' ? username : password;
  const isPasswordField = state === 'password';

  return (
    <div 
      className="h-screen flex flex-col p-4 sm:p-8 font-mono text-xs sm:text-sm fixed inset-0 z-50"
      style={{ backgroundColor: '#000000', color: colors.text }}
      onClick={() => inputRef.current?.focus()}
    >
      {/* Boot-like header */}
      <div className="mb-4" style={{ color: colors.muted }}>
        <div>Kiro CV Terminal v1.0.0</div>
        <div>Copyright (c) {new Date().getFullYear()}</div>
        <div className="mt-2">Type credentials to access the system.</div>
        {attempts > 0 && (
          <div className="mt-1" style={{ color: colors.warning }}>
            Hint: check resume.json for credentials 😉
          </div>
        )}
      </div>

      {/* History */}
      <div className="flex-1">
        {history.map((line, i) => (
          <div key={i} className="leading-relaxed">
            {line || '\u00A0'}
          </div>
        ))}

        {/* Current input line */}
        {(state === 'user' || state === 'password') && (
          <div className="flex items-center">
            <span style={{ color: colors.secondary }}>{currentPrompt}</span>
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type={isPasswordField ? 'password' : 'text'}
                value={currentValue}
                onChange={(e) => {
                  if (state === 'user') setUsername(e.target.value);
                  else setPassword(e.target.value);
                }}
                onKeyDown={handleKeyDown}
                className="no-focus-outline absolute inset-0 w-full bg-transparent border-none outline-none font-mono text-xs sm:text-sm focus:outline-none focus:ring-0"
                style={{ 
                  color: colors.text,
                  caretColor: colors.text,
                  boxShadow: 'none',
                }}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
              />
              {/* Visible text with cursor */}
              <div className="pointer-events-none whitespace-pre flex items-center">
                <span>{isPasswordField ? '•'.repeat(currentValue.length) : currentValue}</span>
                <span
                  className="cursor-blink inline-block w-[0.6em] h-[1.1em] align-middle"
                  style={{ backgroundColor: colors.text }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Checking state */}
        {state === 'checking' && (
          <div className="flex items-center gap-2" style={{ color: colors.muted }}>
            <span className="animate-pulse">Authenticating...</span>
          </div>
        )}

        {/* Success state */}
        {state === 'success' && (
          <div style={{ color: colors.success }}>
            Welcome back, {username}!
          </div>
        )}
      </div>

      {/* Footer hint */}
      <div className="mt-4 pt-2 border-t" style={{ borderColor: '#333333', color: colors.muted }}>
        Press Enter to submit · Credentials in resume.json
      </div>
    </div>
  );
}
