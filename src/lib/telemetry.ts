/**
 * Chat Telemetry - Local file logging for AI chat interactions
 * 
 * Logs prompts, responses, and metadata to a JSONL file (one JSON per line).
 * Designed to be portable across different hosting environments.
 * 
 * Enable with: TELEMETRY_ENABLED=true
 * Custom path:  TELEMETRY_FILE=logs/chat.jsonl (default: logs/chat-telemetry.jsonl)
 * Max size:     TELEMETRY_MAX_SIZE_MB=10 (default: 10MB, rotates when exceeded)
 * Max files:    TELEMETRY_MAX_FILES=5 (default: 5, keeps N most recent)
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
const TELEMETRY_MAX_SIZE_MB = parseInt(process.env.TELEMETRY_MAX_SIZE_MB || '10', 10);
const TELEMETRY_MAX_FILES = parseInt(process.env.TELEMETRY_MAX_FILES || '5', 10);

// Convert MB to bytes
const MAX_FILE_SIZE_BYTES = TELEMETRY_MAX_SIZE_MB * 1024 * 1024;

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
    await fs.mkdir(logDir, { recursive: true, mode: 0o700 });
  } catch (error) {
    // Directory might already exist, that's fine
    if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
      throw error;
    }
  }
}

/** Get file size in bytes, returns 0 if file doesn't exist */
async function getFileSize(filePath: string): Promise<number> {
  try {
    const stats = await fs.stat(filePath);
    return stats.size;
  } catch {
    return 0;
  }
}

/**
 * Rotate log files when current file exceeds max size.
 * 
 * Naming scheme:
 *   chat-telemetry.jsonl       <- current (active)
 *   chat-telemetry.1.jsonl     <- previous
 *   chat-telemetry.2.jsonl     <- older
 *   ...
 *   chat-telemetry.N.jsonl     <- oldest (deleted when N > maxFiles)
 */
async function rotateLogFiles(): Promise<void> {
  const logPath = getLogFilePath();
  const logDir = path.dirname(logPath);
  const baseName = path.basename(logPath, '.jsonl');
  
  // Delete oldest file if it exists (N = maxFiles)
  const oldestFile = path.join(logDir, `${baseName}.${TELEMETRY_MAX_FILES}.jsonl`);
  try {
    await fs.unlink(oldestFile);
  } catch {
    // File doesn't exist, that's fine
  }
  
  // Shift existing rotated files: N-1 -> N, N-2 -> N-1, ..., 1 -> 2
  for (let i = TELEMETRY_MAX_FILES - 1; i >= 1; i--) {
    const oldFile = path.join(logDir, `${baseName}.${i}.jsonl`);
    const newFile = path.join(logDir, `${baseName}.${i + 1}.jsonl`);
    try {
      await fs.rename(oldFile, newFile);
    } catch {
      // File doesn't exist, skip
    }
  }
  
  // Rename current file to .1.jsonl
  const rotatedFile = path.join(logDir, `${baseName}.1.jsonl`);
  try {
    await fs.rename(logPath, rotatedFile);
  } catch {
    // Current file doesn't exist, that's fine
  }
}

/** Check if rotation is needed and perform it */
async function rotateIfNeeded(): Promise<void> {
  const logPath = getLogFilePath();
  const currentSize = await getFileSize(logPath);
  
  if (currentSize >= MAX_FILE_SIZE_BYTES) {
    await rotateLogFiles();
    console.log(`[telemetry] Rotated log file (was ${(currentSize / 1024 / 1024).toFixed(2)}MB)`);
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
    
    // Check if rotation is needed before writing
    await rotateIfNeeded();
    
    const logPath = getLogFilePath();
    const line = JSON.stringify(entry) + '\n';
    
    // Owner-only: the log holds visitor prompts
    await fs.appendFile(logPath, line, { encoding: 'utf-8', mode: 0o600 });
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
