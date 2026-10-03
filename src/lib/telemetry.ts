/**
 * Chat Telemetry - Local file logging for AI chat interactions
 * 
 * Logs prompts, responses, and metadata to a JSONL file (one JSON per line).
 * Designed to be portable across different hosting environments.
 * 
 * Enable with: TELEMETRY_ENABLED=true
 * Custom path:  TELEMETRY_FILE=logs/chat.jsonl (default: logs/chat-telemetry.jsonl)
 * 
 * Note: This only works on environments with persistent filesystem (Coolify, VPS, Docker).
 * On Vercel/serverless, the file will be lost between invocations.
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface ChatTelemetryEntry {
  /** ISO timestamp */
  ts: string;
  /** Unique request identifier */
  callId: string;
  /** Model used (e.g., gpt-4o-mini) */
  model: string;
  /** Client IP (may be anonymized) */
  ip: string;
  /** User's prompt (last user message) */
  prompt: string;
  /** AI response text */
  response: string;
  /** Input tokens */
  tokensIn: number | null;
  /** Output tokens */
  tokensOut: number | null;
  /** Why the model stopped (stop, length, etc.) */
  finishReason: string | null;
  /** Request duration in milliseconds */
  durationMs: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════════════════════════════════════

const TELEMETRY_ENABLED = process.env.TELEMETRY_ENABLED === 'true';
const TELEMETRY_FILE = process.env.TELEMETRY_FILE || 'logs/chat-telemetry.jsonl';

// Resolve path relative to project root
const getLogFilePath = () => {
  // In Next.js, process.cwd() is the project root
  // turbopackIgnore prevents tracing the whole project
  return path.resolve(/* turbopackIgnore: true */ process.cwd(), 'logs', path.basename(TELEMETRY_FILE));
};

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════

/** Generate a short unique ID for each request */
export function generateCallId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${random}`;
}

/** Ensure the logs directory exists */
async function ensureLogDir(): Promise<void> {
  const logPath = getLogFilePath();
  const logDir = path.dirname(logPath);
  
  try {
    await fs.mkdir(logDir, { recursive: true });
  } catch (error) {
    // Directory might already exist, that's fine
    if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
      throw error;
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// PUBLIC API
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Check if telemetry is enabled
 */
export function isTelemetryEnabled(): boolean {
  return TELEMETRY_ENABLED;
}

/**
 * Log a chat interaction to the telemetry file
 * 
 * @param entry - The telemetry data to log
 * @returns Promise that resolves when the log is written
 * 
 * Fails silently to avoid breaking the chat API if logging fails.
 */
export async function logChatTelemetry(entry: ChatTelemetryEntry): Promise<void> {
  if (!TELEMETRY_ENABLED) {
    return;
  }

  try {
    await ensureLogDir();
    
    const logPath = getLogFilePath();
    const line = JSON.stringify(entry) + '\n';
    
    await fs.appendFile(logPath, line, 'utf-8');
  } catch (error) {
    // Log to console but don't throw - telemetry should never break the main flow
    console.error('[telemetry] Failed to write log:', error instanceof Error ? error.message : error);
  }
}

/**
 * Create a telemetry collector that accumulates data during a request
 * and writes it at the end.
 */
export function createTelemetryCollector(initialData: {
  callId: string;
  model: string;
  ip: string;
  prompt: string;
}) {
  const startTime = Date.now();
  let response = '';
  let tokensIn: number | null = null;
  let tokensOut: number | null = null;
  let finishReason: string | null = null;

  return {
    /** Append text to the response (call during streaming) */
    appendResponse(text: string) {
      response += text;
    },

    /** Set the complete response (call after streaming completes) */
    setResponse(text: string) {
      response = text;
    },

    /** Set token usage from the model response */
    setUsage(usage: { inputTokens?: number; outputTokens?: number } | undefined) {
      if (usage) {
        tokensIn = usage.inputTokens ?? null;
        tokensOut = usage.outputTokens ?? null;
      }
    },

    /** Set the finish reason */
    setFinishReason(reason: string | undefined) {
      finishReason = reason ?? null;
    },

    /** Write the collected telemetry to file */
    async flush(): Promise<void> {
      const entry: ChatTelemetryEntry = {
        ts: new Date().toISOString(),
        callId: initialData.callId,
        model: initialData.model,
        ip: initialData.ip,
        prompt: initialData.prompt,
        response,
        tokensIn,
        tokensOut,
        finishReason,
        durationMs: Date.now() - startTime,
      };

      await logChatTelemetry(entry);
    },
  };
}
