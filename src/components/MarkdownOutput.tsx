'use client';

import Markdown from 'react-markdown';
import { colors } from '@/lib/colors';

interface MarkdownOutputProps {
  content: string;
}

export function MarkdownOutput({ content }: MarkdownOutputProps) {
  return (
    <div className="text-xs sm:text-sm py-1">
      {/* Left border line */}
      <div className="flex">
        <div
          className="w-0.5 mr-3 shrink-0 self-stretch rounded"
          style={{ backgroundColor: colors.brand }}
        />
        <div className="flex-1 min-w-0 prose-terminal">
          <Markdown
            components={{
              p: ({ children }) => (
                <p className="mb-2 last:mb-0 whitespace-pre-wrap wrap-break-word" style={{ color: colors.text }}>
                  {children}
                </p>
              ),
              strong: ({ children }) => (
                <strong className="font-bold" style={{ color: colors.text }}>
                  {children}
                </strong>
              ),
              em: ({ children }) => (
                <em style={{ color: colors.subtle }}>{children}</em>
              ),
              code: ({ children, className }) => {
                const isBlock = className?.includes('language-');
                if (isBlock) {
                  return (
                    <code
                      className="block my-2 p-2 rounded text-xs overflow-x-auto"
                      style={{ backgroundColor: colors.surface, color: colors.success }}
                    >
                      {children}
                    </code>
                  );
                }
                return (
                  <code
                    className="px-1 py-0.5 rounded text-xs"
                    style={{ backgroundColor: colors.surface, color: colors.success }}
                  >
                    {children}
                  </code>
                );
              },
              pre: ({ children }) => (
                <pre className="my-2 p-2 rounded text-xs overflow-x-auto" style={{ backgroundColor: colors.surface }}>
                  {children}
                </pre>
              ),
              ul: ({ children }) => (
                <ul className="list-disc pl-4 mb-2 space-y-0.5" style={{ color: colors.text }}>
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal pl-4 mb-2 space-y-0.5" style={{ color: colors.text }}>
                  {children}
                </ol>
              ),
              li: ({ children }) => (
                <li className="wrap-break-word" style={{ color: colors.text }}>
                  {children}
                </li>
              ),
              h1: ({ children }) => (
                <h1 className="text-sm sm:text-base font-bold mb-1" style={{ color: colors.brand }}>
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-xs sm:text-sm font-bold mb-1" style={{ color: colors.brand }}>
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-xs sm:text-sm font-bold mb-1" style={{ color: colors.subtle }}>
                  {children}
                </h3>
              ),
              a: ({ href, children }) => (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                  style={{ color: colors.permission }}
                >
                  {children}
                </a>
              ),
              blockquote: ({ children }) => (
                <blockquote
                  className="pl-3 my-2"
                  style={{ borderLeft: `2px solid ${colors.inactive}`, color: colors.subtle }}
                >
                  {children}
                </blockquote>
              ),
              hr: () => (
                <hr className="my-2" style={{ borderColor: colors.inactive }} />
              ),
            }}
          >
            {content}
          </Markdown>
        </div>
      </div>
    </div>
  );
}
