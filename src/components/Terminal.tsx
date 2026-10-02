'use client';

import { useState, useCallback, useEffect, useRef, ReactNode } from 'react';
import { WelcomeScreen } from './WelcomeScreen';
import { InputBox } from './InputBox';
import { SlashMenu } from './SlashMenu';
import { Spinner } from './Spinner';
import { MarkdownOutput } from './MarkdownOutput';
import { useCommandHistory } from '@/hooks/useCommandHistory';
import { useAutoComplete } from '@/hooks/useAutoComplete';
import { useTerminalScroll } from '@/hooks/useTerminalScroll';
import { findCommand, fuzzyMatch, filterCommands } from '@/lib/commands';
import { colors } from '@/lib/colors';

// Command outputs
import { Help, helpCommands } from './commands/Help';
import { About } from './commands/About';
import { Experience } from './commands/Experience';
import { Skills } from './commands/Skills';
import { Education } from './commands/Education';
import { Certs } from './commands/Certs';
import { Contact } from './commands/Contact';
import { Models, careerModels } from './commands/Models';
import { Languages } from './commands/Languages';
import { Status } from './commands/Status';
import { Cost } from './commands/Cost';
import { Doctor } from './commands/Doctor';
import { Download } from './commands/Download';
import { Usage } from './commands/Usage';
import { Init } from './commands/Init';
import { Version } from './commands/Version';

interface HistoryEntry {
  id: string;
  type: 'welcome' | 'command' | 'ai';
  input?: string;
  output?: ReactNode;
  aiContent?: string;
  isStreaming?: boolean;
}

interface TerminalProps {
  // ?splash_name= — spelled in the Kiro font on the welcome screen
  splashName?: string;
}

export function Terminal({ splashName }: TerminalProps) {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<HistoryEntry[]>([
    { id: 'welcome', type: 'welcome' },
  ]);
  const [focused, setFocused] = useState(true);
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [menuIndex, setMenuIndex] = useState(0);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Model selector state
  const [modelSelectorOpen, setModelSelectorOpen] = useState(false);
  const [modelSelectorIndex, setModelSelectorIndex] = useState(0);
  const [currentModelIndex, setCurrentModelIndex] = useState(0);

  // Help selector state
  const [helpSelectorOpen, setHelpSelectorOpen] = useState(false);
  const [helpSelectorIndex, setHelpSelectorIndex] = useState(0);

  const cmdHistory = useCommandHistory();
  const { complete } = useAutoComplete();
  const { containerRef, scrollToBottom } = useTerminalScroll();
  const abortRef = useRef<AbortController | null>(null);
  const chatMessagesRef = useRef<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [pendingHelpCommand, setPendingHelpCommand] = useState<string | null>(null);

  // Auto-scroll on history changes
  useEffect(() => {
    scrollToBottom();
  }, [history, scrollToBottom]);

  // Auto-scroll when slash menu or help selector opens or selection changes
  useEffect(() => {
    if (showSlashMenu || helpSelectorOpen) {
      scrollToBottom();
    }
  }, [showSlashMenu, menuIndex, helpSelectorOpen, helpSelectorIndex, scrollToBottom]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Model selector keyboard handling
      if (modelSelectorOpen) {
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          setModelSelectorIndex((i) => Math.max(0, i - 1));
          return;
        }
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setModelSelectorIndex((i) => Math.min(careerModels.length - 1, i + 1));
          return;
        }
        if (e.key === 'Enter') {
          e.preventDefault();
          setCurrentModelIndex(modelSelectorIndex);
          setModelSelectorOpen(false);
          return;
        }
        if (e.key === 'Escape') {
          e.preventDefault();
          setModelSelectorOpen(false);
          return;
        }
        return;
      }

      // Help selector keyboard handling
      if (helpSelectorOpen) {
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          setHelpSelectorIndex((i) => Math.max(0, i - 1));
          return;
        }
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setHelpSelectorIndex((i) => Math.min(helpCommands.length - 1, i + 1));
          return;
        }
        if (e.key === 'Enter') {
          e.preventDefault();
          const cmd = helpCommands[helpSelectorIndex];
          setHelpSelectorOpen(false);
          if (cmd) setPendingHelpCommand(cmd.name);
          return;
        }
        if (e.key === 'Escape') {
          e.preventDefault();
          setHelpSelectorOpen(false);
          return;
        }
        return;
      }

      if (e.ctrlKey && e.key === 'l') {
        e.preventDefault();
        handleClear();
      }
      if (e.ctrlKey && e.key === 'c') {
        e.preventDefault();
        if (abortRef.current) {
          abortRef.current.abort();
          abortRef.current = null;
          setIsAiLoading(false);
        }
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [modelSelectorOpen, modelSelectorIndex, helpSelectorOpen, helpSelectorIndex]);

  const addEntry = useCallback((entry: Omit<HistoryEntry, 'id'>) => {
    setHistory((prev) => [...prev, { ...entry, id: crypto.randomUUID() }]);
  }, []);

  const handleClear = useCallback(() => {
    setHistory([{ id: 'welcome', type: 'welcome' }]);
    chatMessagesRef.current = [];
  }, []);

  const renderCommandOutput = useCallback((commandName: string): ReactNode | null => {
    switch (commandName) {
      case '/help': return null; // handled separately — opens interactive selector
      case '/about': return <About />;
      case '/experience': return <Experience />;
      case '/skills': return <Skills />;
      case '/education': return <Education />;
      case '/certs': return <Certs />;
      case '/contact': return <Contact />;
      case '/model':
      case '/models':
        return null; // handled separately — opens interactive selector
      case '/languages': return <Languages />;
      case '/status': return <Status />;
      case '/cost': return <Cost />;
      case '/doctor': return <Doctor />;
      case '/resume': return <Download />;
      case '/usage': return <Usage />;
      case '/version':
        return <Version />;
      case '/init':
        return <Init />;
      case '/clear':
      case '/cls':
        return null; // handled separately
      case '/compact':
        return (
          <div className="text-xs sm:text-sm py-1" style={{ color: colors.success }}>
            ✓ Context compacted. Conversation history preserved.
          </div>
        );
      case '/context':
        return (
          <div className="text-xs sm:text-sm py-1">
            <div style={{ color: colors.brand }}>Current Context:</div>
            <div style={{ color: colors.muted }}>• Resume data loaded</div>
            <div style={{ color: colors.muted }}>• AI chat enabled</div>
            <div style={{ color: colors.muted }}>• All commands available</div>
          </div>
        );
      default:
        return null;
    }
  }, []);

  const handleAIChat = useCallback(async (message: string) => {
    const entryId = crypto.randomUUID();
    setIsAiLoading(true);

    // Add user message to conversation history
    chatMessagesRef.current.push({ role: 'user', content: message });
    // Keep last 20 messages to limit token cost
    if (chatMessagesRef.current.length > 20) {
      chatMessagesRef.current = chatMessagesRef.current.slice(-20);
    }

    setHistory((prev) => [
      ...prev,
      { id: entryId, type: 'ai', input: message, aiContent: '', isStreaming: true },
    ]);

    try {
      const controller = new AbortController();
      abortRef.current = controller;

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...chatMessagesRef.current],
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        if (response.status === 429) {
          setHistory((prev) =>
            prev.map((e) =>
              e.id === entryId
                ? { ...e, aiContent: 'Whoa, slow down! I need a coffee break. Rate limit reached — try again in a minute.', isStreaming: false }
                : e,
            ),
          );
          setIsAiLoading(false);
          return;
        }
        throw new Error(`HTTP ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('0:')) {
              try {
                const text = JSON.parse(line.slice(2));
                accumulated += text;
              } catch {
                accumulated += line.slice(2);
              }
            }
          }

          setHistory((prev) =>
            prev.map((e) =>
              e.id === entryId ? { ...e, aiContent: accumulated } : e,
            ),
          );
        }
      }

      setHistory((prev) =>
        prev.map((e) =>
          e.id === entryId ? { ...e, isStreaming: false } : e,
        ),
      );

      // Add assistant response to conversation history
      chatMessagesRef.current.push({ role: 'assistant', content: accumulated });
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        setHistory((prev) =>
          prev.map((e) =>
            e.id === entryId ? { ...e, aiContent: (e.aiContent || '') + '\n[cancelled]', isStreaming: false } : e,
          ),
        );
      } else {
        setHistory((prev) =>
          prev.map((e) =>
            e.id === entryId
              ? { ...e, aiContent: 'Oops, something went wrong. My neural networks need a reboot. Try again!', isStreaming: false }
              : e,
          ),
        );
      }
    } finally {
      setIsAiLoading(false);
      abortRef.current = null;
    }
  }, []);

  const handleSubmit = useCallback((overrideInput?: string) => {
    const trimmed = (overrideInput ?? input).trim();
    if (!trimmed) return;

    setShowSlashMenu(false);
    setMenuIndex(0);
    cmdHistory.push(trimmed);

    if (trimmed.startsWith('/')) {
      const cmd = findCommand(trimmed);

      if (cmd) {
        // Special commands
        if (cmd.name === '/clear') {
          handleClear();
          setInput('');
          return;
        }

        if (cmd.name === '/help') {
          addEntry({
            type: 'command',
            input: trimmed,
          });
          setHelpSelectorIndex(0);
          setHelpSelectorOpen(true);
          setInput('');
          return;
        }
        if (cmd.name === '/model') {
          addEntry({
            type: 'command',
            input: trimmed,
          });
          setModelSelectorIndex(currentModelIndex);
          setModelSelectorOpen(true);
          setInput('');
          return;
        }

        const output = renderCommandOutput(cmd.name);
        addEntry({ type: 'command', input: trimmed, output });
      } else {
        // Unknown command — fuzzy match
        const suggestion = fuzzyMatch(trimmed);
        addEntry({
          type: 'command',
          input: trimmed,
          output: (
            <div className="text-xs sm:text-sm py-1">
              <span style={{ color: colors.error }}>
                command not found: {trimmed}
              </span>
              {suggestion && (
                <span style={{ color: colors.muted }}>
                  {' '}— Did you mean{' '}
                  <span style={{ color: colors.success }}>{suggestion}</span>?
                </span>
              )}
            </div>
          ),
        });
      }
    } else {
      // Easter eggs
      const lower = trimmed.toLowerCase();
      if (lower === 'sudo hire alfonso') {
        addEntry({
          type: 'command',
          input: trimmed,
          output: (
            <MarkdownOutput content="Permission granted. Sending offer letter... Just kidding, but seriously, check /contact!" />
          ),
        });
        setInput('');
        return;
      }

      // AI chat
      handleAIChat(trimmed);
    }

    setInput('');
  }, [input, cmdHistory, handleClear, addEntry, renderCommandOutput, handleAIChat, currentModelIndex]);

  // Process pending command from help selector
  useEffect(() => {
    if (pendingHelpCommand) {
      const cmd = pendingHelpCommand;
      setPendingHelpCommand(null);
      handleSubmit(cmd);
    }
  }, [pendingHelpCommand, handleSubmit]);

  const handleInputChange = useCallback((value: string) => {
    setInput(value);
    cmdHistory.reset();

    if (value.startsWith('/') && value.length > 1) {
      const matches = filterCommands(value);
      setShowSlashMenu(matches.length > 0);
      setMenuIndex(0);
    } else if (value === '/') {
      setShowSlashMenu(true);
      setMenuIndex(0);
    } else {
      setShowSlashMenu(false);
    }
  }, [cmdHistory]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // When model selector is open, ignore all input key handling
    // (arrows, Enter, Esc are handled by the global keydown listener)
    if (modelSelectorOpen || helpSelectorOpen) {
      e.preventDefault();
      return;
    }

    // ? shortcut to open help panel (only when input is empty)
    if (e.key === '?' && input === '') {
      e.preventDefault();
      addEntry({ type: 'command', input: '?' });
      setHelpSelectorIndex(0);
      setHelpSelectorOpen(true);
      return;
    }

    if (e.key === 'Tab') {
      e.preventDefault();
      const completed = complete(input);
      if (completed) {
        setInput(completed);
        setShowSlashMenu(false);
      }
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (showSlashMenu) {
        setMenuIndex((i) => Math.max(0, i - 1));
      } else {
        const prev = cmdHistory.navigateUp(input);
        if (prev !== null) setInput(prev);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (showSlashMenu) {
        const matches = filterCommands(input);
        setMenuIndex((i) => Math.min(matches.length - 1, i + 1));
      } else {
        const next = cmdHistory.navigateDown();
        if (next !== null) setInput(next);
      }
      return;
    }

    if (e.key === 'Enter' && showSlashMenu) {
      e.preventDefault();
      const matches = filterCommands(input);
      if (matches[menuIndex]) {
        setShowSlashMenu(false);
        setInput('');
        handleSubmit(matches[menuIndex].name);
      }
      return;
    }

    if (e.key === 'Escape') {
      setShowSlashMenu(false);
    }
  }, [input, showSlashMenu, menuIndex, cmdHistory, complete, handleSubmit, modelSelectorOpen, helpSelectorOpen, addEntry]);

  return (
    <div
      className="h-screen flex flex-col overflow-hidden"
      style={{ backgroundColor: colors.bg, color: colors.text }}
    >
      {/* Scrollable content — includes history AND input */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto px-2 sm:px-4 py-2 sm:py-4"
      >
        <div className="max-w-[1100px] mx-auto">
          {history.map((entry) => {
            if (entry.type === 'welcome') {
              return <WelcomeScreen key={entry.id} currentModelIndex={currentModelIndex} splashName={splashName} />;
            }

            if (entry.type === 'command') {
              return (
                <div key={entry.id} className="mb-2">
                  {/* Command echo */}
                  <div className="text-xs sm:text-sm">
                    <span style={{ color: colors.text }} className="font-bold">❯ </span>
                    <span style={{ color: colors.text }}>{entry.input}</span>
                  </div>
                  {/* Command output */}
                  {entry.output}
                </div>
              );
            }

            if (entry.type === 'ai') {
              return (
                <div key={entry.id} className="mb-2">
                  {/* User message echo */}
                  <div className="text-xs sm:text-sm">
                    <span style={{ color: colors.text }} className="font-bold">❯ </span>
                    <span style={{ color: colors.text }}>{entry.input}</span>
                  </div>
                  {/* AI response */}
                  {entry.isStreaming && !entry.aiContent ? (
                    <Spinner />
                  ) : (
                    <MarkdownOutput content={entry.aiContent || ''} />
                  )}
                  {entry.isStreaming && entry.aiContent && <Spinner />}
                </div>
              );
            }

            return null;
          })}

          {/* Help selector — rendered live */}
          {helpSelectorOpen && (
            <Help
              selectedIndex={helpSelectorIndex}
              onSelect={(command) => {
                setHelpSelectorOpen(false);
                handleSubmit(command);
              }}
              onCancel={() => setHelpSelectorOpen(false)}
            />
          )}

          {/* Model selector — rendered live */}
          {modelSelectorOpen && (
            <Models
              selectedIndex={modelSelectorIndex}
              currentIndex={currentModelIndex}
              onConfirm={(index) => {
                setCurrentModelIndex(index);
                setModelSelectorOpen(false);
              }}
              onCancel={() => setModelSelectorOpen(false)}
            />
          )}

          {/* Input then slash menu below — hidden when help selector is open */}
          {!helpSelectorOpen && (
            <>
              <InputBox
                value={input}
                onChange={handleInputChange}
                onSubmit={handleSubmit}
                onKeyDown={handleKeyDown}
                focused={focused}
                onFocus={() => setFocused(true)}
                disabled={isAiLoading}
              />
              {showSlashMenu && (
                <SlashMenu
                  input={input}
                  selectedIndex={menuIndex}
                  onSelect={(cmd) => {
                    setInput(cmd);
                    setShowSlashMenu(false);
                  }}
                />
              )}
              {/* Hint */}
              <div className="text-xs py-0.5 ml-2" style={{ color: colors.muted }}>
                ? for shortcuts
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
