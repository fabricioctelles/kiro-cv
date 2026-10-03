import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';
// System prompt: src/lib/system-prompt.ts
import { SYSTEM_PROMPT } from '@/lib/system-prompt';

export const runtime = 'edge';

// ═══════════════════════════════════════════════════════════════════════════
// RATE LIMITING (in-memory, per-IP)
// ═══════════════════════════════════════════════════════════════════════════

const RATE_LIMIT = {
  windowMs: 60 * 1000,        // 1 minute window
  maxRequests: 10,            // max requests per window per IP
  maxRequestsPerDay: 50,      // max requests per day per IP
  dayWindowMs: 24 * 60 * 60 * 1000,
};

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
];

function containsAbusePattern(text: string): boolean {
  return ABUSE_PATTERNS.some(pattern => pattern.test(text));
}

function validateInput(messages: Array<{ role: string; content: string }>): { valid: boolean; reason?: string } {
  if (!Array.isArray(messages)) {
    return { valid: false, reason: 'Invalid messages format' };
  }

  if (messages.length === 0) {
    return { valid: false, reason: 'No messages provided' };
  }

  if (messages.length > 30) {
    return { valid: false, reason: 'Too many messages in conversation' };
  }

  for (const msg of messages) {
    if (!msg.role || !msg.content) {
      return { valid: false, reason: 'Invalid message structure' };
    }

    if (typeof msg.content !== 'string') {
      return { valid: false, reason: 'Message content must be string' };
    }

    // Max 2000 chars per message
    if (msg.content.length > 2000) {
      return { valid: false, reason: 'Message too long (max 2000 characters)' };
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

export async function POST(req: Request) {
  try {
    // Get client IP
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() 
      || req.headers.get('x-real-ip') 
      || 'unknown';

    // Rate limiting
    const rateLimit = getRateLimitInfo(ip);
    if (!rateLimit.allowed) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
        { 
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(rateLimit.retryAfter || 60),
          }
        }
      );
    }

    // Cleanup old rate limit entries occasionally
    if (Math.random() < 0.01) {
      cleanupRateLimitStore();
    }

    // Parse and validate input
    const body = await req.json();
    const { messages } = body;

    const validation = validateInput(messages);
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ error: validation.reason }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Call LLM
    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

    const result = await streamText({
      model: openai(model),
      system: SYSTEM_PROMPT,
      messages,
      maxTokens: 300,
    });

    return result.toDataStreamResponse();

  } catch (error: unknown) {
    if (error instanceof Error && 'status' in error && (error as { status: number }).status === 429) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded' }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
