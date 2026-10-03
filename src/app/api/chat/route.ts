import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';
// System prompt: src/lib/system-prompt.ts
import { SYSTEM_PROMPT } from '@/lib/system-prompt';
import { getClientIp } from '@/lib/api-security';

export const runtime = 'nodejs';

// ═══════════════════════════════════════════════════════════════════════════
// LIMITS
// ═══════════════════════════════════════════════════════════════════════════

const RATE_LIMIT = {
  windowMs: 60 * 1000,        // 1 minute window
  maxRequests: 10,            // max requests per window per IP
  maxRequestsPerDay: 50,      // max requests per day per IP
  dayWindowMs: 24 * 60 * 60 * 1000,
};

const MAX_BODY_BYTES = 32 * 1024;    // reject oversized request bodies early
const MAX_MESSAGE_CHARS = 2000;      // per message
const MAX_TOTAL_CHARS = 8000;        // whole conversation
const MAX_MESSAGES = 30;

// Only these roles may ever reach the model. Without this, a caller could
// inject a `system`/`tool` message and override the portfolio persona.
const ALLOWED_ROLES = new Set(['user', 'assistant']);

// Store: IP -> { count, resetTime, dailyCount, dailyResetTime }
const rateLimitStore = new Map<string, {
  count: number;
  resetTime: number;
  dailyCount: number;
  dailyResetTime: number;
}>();

function getRateLimitInfo(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  let record = rateLimitStore.get(ip);

  if (!record) {
    record = {
      count: 0,
      resetTime: now + RATE_LIMIT.windowMs,
      dailyCount: 0,
      dailyResetTime: now + RATE_LIMIT.dayWindowMs,
    };
    rateLimitStore.set(ip, record);
  }

  // Reset minute window if expired
  if (now > record.resetTime) {
    record.count = 0;
    record.resetTime = now + RATE_LIMIT.windowMs;
  }

  // Reset daily window if expired
  if (now > record.dailyResetTime) {
    record.dailyCount = 0;
    record.dailyResetTime = now + RATE_LIMIT.dayWindowMs;
  }

  // Check daily limit first
  if (record.dailyCount >= RATE_LIMIT.maxRequestsPerDay) {
    const retryAfter = Math.ceil((record.dailyResetTime - now) / 1000);
    return { allowed: false, retryAfter };
  }

  // Check minute limit
  if (record.count >= RATE_LIMIT.maxRequests) {
    const retryAfter = Math.ceil((record.resetTime - now) / 1000);
    return { allowed: false, retryAfter };
  }

  // Increment counters
  record.count++;
  record.dailyCount++;

  return { allowed: true };
}

// Cleanup old entries periodically (prevent memory leak)
function cleanupRateLimitStore() {
  const now = Date.now();
  for (const [ip, record] of rateLimitStore.entries()) {
    if (now > record.dailyResetTime) {
      rateLimitStore.delete(ip);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// INPUT VALIDATION & ABUSE PREVENTION
// ═══════════════════════════════════════════════════════════════════════════

const ABUSE_PATTERNS = [
  /ignore.*(?:previous|above|system)/i,
  /forget.*(?:instructions|rules)/i,
  /you are now/i,
  /pretend.*(?:you're|you are|to be)/i,
  /act as/i,
  /jailbreak/i,
  /bypass/i,
  /override/i,
  /new persona/i,
  /sudo/i,
  /admin mode/i,
  /developer mode/i,
  /dan mode/i,
  /ignore.*guardrails/i,
  /disregard/i,
  /system prompt/i,
  /reveal.*(?:instructions|prompt|secret|env)/i,
];

// Collapse unicode look-alikes and zero-width characters so the blocklist
// cannot be trivially evaded with invisible/confusable characters.
function normalizeForFilter(text: string): string {
  return text
    .normalize('NFKC')
    // zero-width space/joiner/non-joiner, BOM, word-joiner, soft hyphen
    .replace(/[\u200B-\u200D\uFEFF\u2060\u00AD]/g, '')
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

function containsAbusePattern(text: string): boolean {
  const normalized = normalizeForFilter(text);
  return ABUSE_PATTERNS.some((pattern) => pattern.test(text) || pattern.test(normalized));
}

function validateInput(messages: Array<{ role: string; content: string }>): { valid: boolean; reason?: string } {
  if (!Array.isArray(messages)) {
    return { valid: false, reason: 'Invalid messages format' };
  }

  if (messages.length === 0) {
    return { valid: false, reason: 'No messages provided' };
  }

  if (messages.length > MAX_MESSAGES) {
    return { valid: false, reason: 'Too many messages in conversation' };
  }

  let totalChars = 0;

  for (const msg of messages) {
    if (!msg || typeof msg.role !== 'string' || typeof msg.content !== 'string') {
      return { valid: false, reason: 'Invalid message structure' };
    }

    // Role allowlist — blocks prompt injection via system/developer messages.
    if (!ALLOWED_ROLES.has(msg.role)) {
      return { valid: false, reason: 'Invalid message role' };
    }

    if (msg.content.length > MAX_MESSAGE_CHARS) {
      return { valid: false, reason: 'Message too long (max 2000 characters)' };
    }

    totalChars += msg.content.length;
    if (totalChars > MAX_TOTAL_CHARS) {
      return { valid: false, reason: 'Conversation too large' };
    }

    // Check for prompt injection attempts
    if (containsAbusePattern(msg.content)) {
      return { valid: false, reason: 'Invalid input detected' };
    }
  }

  return { valid: true };
}

// ═══════════════════════════════════════════════════════════════════════════
// API ROUTE
// ═══════════════════════════════════════════════════════════════════════════

const openai = createOpenAI({
  baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
  apiKey: process.env.OPENAI_API_KEY,
});

function jsonResponse(body: unknown, status: number, extraHeaders?: Record<string, string>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...extraHeaders },
  });
}

export async function POST(req: Request) {
  try {
    // Get client IP (proxy/CDN aware; never trusts the leftmost XFF hop)
    const ip = getClientIp(req);

    // Rate limiting
    const rateLimit = getRateLimitInfo(ip);
    if (!rateLimit.allowed) {
      return jsonResponse(
        { error: 'Rate limit exceeded. Please try again later.' },
        429,
        { 'Retry-After': String(rateLimit.retryAfter || 60) },
      );
    }

    // Cleanup old rate limit entries occasionally
    if (Math.random() < 0.01) {
      cleanupRateLimitStore();
    }

    // Reject oversized bodies before parsing
    const declaredLength = Number(req.headers.get('content-length') || 0);
    if (declaredLength > MAX_BODY_BYTES) {
      return jsonResponse({ error: 'Request too large' }, 413);
    }

    // Parse and validate input
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return jsonResponse({ error: 'Invalid JSON body' }, 400);
    }

    const { messages } = (body ?? {}) as { messages?: Array<{ role: string; content: string }> };

    if (typeof messages !== 'undefined') {
      // Cheap guard: even without Content-Length, cap serialized size.
      if (JSON.stringify(messages).length > MAX_BODY_BYTES) {
        return jsonResponse({ error: 'Request too large' }, 413);
      }
    }

    const validation = validateInput(messages as Array<{ role: string; content: string }>);
    if (!validation.valid) {
      return jsonResponse({ error: validation.reason }, 400);
    }

    // Call LLM
    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

    const result = await streamText({
      model: openai(model),
      system: SYSTEM_PROMPT,
      messages: messages as { role: 'user' | 'assistant'; content: string }[],
      maxTokens: 300,
    });

    return result.toDataStreamResponse();

  } catch (error: unknown) {
    if (error instanceof Error && 'status' in error && (error as { status: number }).status === 429) {
      return jsonResponse({ error: 'Rate limit exceeded' }, 429);
    }
    console.error('Chat API error:', error);
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
}
