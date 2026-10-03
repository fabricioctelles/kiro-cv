import { createOpenAI } from '@ai-sdk/openai';
import { streamText, toTextStream, createTextStreamResponse } from 'ai';
// System prompt: src/lib/system-prompt.ts
import { SYSTEM_PROMPT } from '@/lib/system-prompt';
import { anonymizeIp, getClientIp, isCrossSiteRequest, readJsonWithLimit } from '@/lib/api-security';
import { createTelemetryCollector, generateCallId, isTelemetryEnabled } from '@/lib/telemetry';

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
const MAX_RATE_LIMIT_ENTRIES = 10_000; // bound memory under IP churn

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

  // The model must always be answering a visitor, not continuing a forged
  // assistant turn.
  if (messages[messages.length - 1].role !== 'user') {
    return { valid: false, reason: 'Last message must be from the user' };
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

// AI SDK 7: Reasoning control - provider-agnostic thinking/reasoning phase
// Values: 'none' | 'minimal' | 'low' | 'medium' | 'high' | 'xhigh' | 'provider-default'
// Only works with models that support reasoning (Claude, Gemini, GPT-6, DeepSeek, etc.)
type ReasoningLevel = 'none' | 'minimal' | 'low' | 'medium' | 'high' | 'xhigh' | 'provider-default';
const VALID_REASONING_LEVELS = new Set<ReasoningLevel>(['none', 'minimal', 'low', 'medium', 'high', 'xhigh', 'provider-default']);

function getReasoningLevel(): ReasoningLevel | undefined {
  const envValue = process.env.LLM_REASONING;
  if (!envValue) return undefined; // Don't set reasoning if not configured
  
  const level = envValue.toLowerCase() as ReasoningLevel;
  if (VALID_REASONING_LEVELS.has(level)) {
    return level;
  }
  
  console.warn(`[chat] Invalid LLM_REASONING value: "${envValue}". Valid values: ${[...VALID_REASONING_LEVELS].join(', ')}`);
  return undefined;
}

// ═══════════════════════════════════════════════════════════════════════════
// RESPONSE FILTERING
// ═══════════════════════════════════════════════════════════════════════════

// OpenRouter's free router sometimes routes to content safety models (LlamaGuard, Nemotron)
// that return classification outputs instead of conversational responses.
// These patterns detect such responses so we can handle them gracefully.
const SAFETY_MODEL_PATTERNS = [
  /^(User|Response)\s*Safety\s*:\s*(safe|unsafe)/im,
  /^safe$/im,
  /^unsafe\s*\n?S\d+/im,  // LlamaGuard format: "unsafe\nS1" or "unsafe\nS1,S2"
  /^\s*{\s*"?safe"?\s*:\s*(true|false)/i,  // JSON format: {"safe": true}
];

const FALLBACK_MESSAGE = "I apologize, but I'm having trouble responding right now. Please try again, or use one of the slash commands like /about, /skills, or /experience to learn more about me.";

/**
 * Check if the response looks like a content safety classification
 * instead of a real conversational response.
 */
function isSafetyModelResponse(text: string): boolean {
  const trimmed = text.trim();
  
  // Very short responses that match safety patterns
  if (trimmed.length < 100) {
    return SAFETY_MODEL_PATTERNS.some(pattern => pattern.test(trimmed));
  }
  
  // Check if the response starts with safety classification
  const firstLine = trimmed.split('\n')[0];
  return SAFETY_MODEL_PATTERNS.some(pattern => pattern.test(firstLine));
}

function jsonResponse(body: unknown, status: number, extraHeaders?: Record<string, string>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...extraHeaders },
  });
}

export async function POST(req: Request) {
  try {
    if (isCrossSiteRequest(req)) {
      return jsonResponse({ error: 'Forbidden' }, 403);
    }

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

    // Cleanup old rate limit entries occasionally (or when the map grows large)
    if (Math.random() < 0.01 || rateLimitStore.size > MAX_RATE_LIMIT_ENTRIES) {
      cleanupRateLimitStore();
    }

    // Reject oversized bodies before parsing
    const declaredLength = Number(req.headers.get('content-length') || 0);
    if (declaredLength > MAX_BODY_BYTES) {
      return jsonResponse({ error: 'Request too large' }, 413);
    }

    // Parse and validate input
    const parsed = await readJsonWithLimit(req, MAX_BODY_BYTES);
    if (!parsed.ok) {
      return parsed.status === 413
        ? jsonResponse({ error: 'Request too large' }, 413)
        : jsonResponse({ error: 'Invalid JSON body' }, 400);
    }
    const body = parsed.body;

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
    const callId = generateCallId();
    
    // Extract the last user message as the "prompt" for telemetry
    const typedMessages = messages as { role: 'user' | 'assistant'; content: string }[];
    const lastUserMessage = typedMessages.filter(m => m.role === 'user').pop();
    const prompt = lastUserMessage?.content || '';

    // Set up telemetry collector (only active if TELEMETRY_ENABLED=true)
    const telemetry = isTelemetryEnabled()
      ? createTelemetryCollector({ callId, model, ip: anonymizeIp(ip), prompt })
      : null;

    // AI SDK 7: Get reasoning level from env (if configured)
    const reasoning = getReasoningLevel();

    const result = streamText({
      model: openai(model),
      instructions: SYSTEM_PROMPT,
      messages: typedMessages,
      // 300 truncated mid-sentence in PT-BR (longer tokens); the prompt keeps
      // answers to 2-4 sentences, so this is a ceiling, not the typical size.
      maxOutputTokens: 500,
      
      // AI SDK 7: Provider-agnostic reasoning control
      // Only included if LLM_REASONING is set in env
      ...(reasoning && { reasoning }),
      
      // AI SDK 7: Timeout configuration to prevent hanging requests
      timeout: {
        totalMs: 30000,    // 30 seconds total
        chunkMs: 5000,     // abort if no chunk received for 5 seconds
      },
      
      // AI SDK 7: Lifecycle callbacks for observability
      onStart: ({ modelId }) => {
        console.log(`[chat] Request started | callId=${callId} | model=${modelId} | ip=${anonymizeIp(ip)}${reasoning ? ` | reasoning=${reasoning}` : ''}`);
      },
      onFinish: async ({ text, usage, finishReason }) => {
        // Check if this looks like a content safety model response
        const wasSafetyResponse = isSafetyModelResponse(text);
        
        if (wasSafetyResponse) {
          console.warn(`[chat] Safety model response detected | callId=${callId} | response="${text.substring(0, 50)}..."`);
        }
        
        console.log(`[chat] Request finished | callId=${callId} | reason=${finishReason} | tokens=${usage?.totalTokens || 'unknown'}${wasSafetyResponse ? ' | safety_model=true' : ''}`);
        
        // Log telemetry if enabled
        if (telemetry) {
          telemetry.setResponse(wasSafetyResponse ? `[SAFETY_MODEL] ${text}` : text);
          telemetry.setUsage(usage);
          telemetry.setFinishReason(wasSafetyResponse ? 'safety_model_filtered' : finishReason);
          await telemetry.flush();
        }
      },
    });

    // Transform the stream to filter out safety model responses
    const transformedStream = new TransformStream<string, string>({
      transform(chunk, controller) {
        controller.enqueue(chunk);
      },
    });

    // Collect the full response to check for safety model output
    let fullResponse = '';
    const originalStream = toTextStream({ stream: result.stream });
    const reader = originalStream.getReader();
    const writer = transformedStream.writable.getWriter();
    
    // Process the stream
    (async () => {
      // Buffer until we have enough text to classify, then flush the whole
      // buffer once and stream the rest. If the buffer looks like a safety
      // model output, keep draining (so onFinish/telemetry still run) but
      // send the fallback message instead.
      let flushed = false;
      let blocked = false;
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const text = typeof value === 'string' ? value : new TextDecoder().decode(value);
          fullResponse += text;
          
          if (blocked) continue;
          if (flushed) {
            await writer.write(text);
            continue;
          }
          
          // Buffer small responses to check the pattern
          if (fullResponse.length < 150) continue;
          
          if (isSafetyModelResponse(fullResponse)) {
            blocked = true;
            continue;
          }
          
          flushed = true;
          await writer.write(fullResponse);
        }
        
        if (blocked) {
          await writer.write(FALLBACK_MESSAGE);
        } else if (!flushed) {
          // Short response: never streamed yet, so classify it now
          await writer.write(isSafetyModelResponse(fullResponse) ? FALLBACK_MESSAGE : fullResponse);
        }
        
        await writer.close();
      } catch (error) {
        await writer.abort(error);
      }
    })();

    return createTextStreamResponse({ stream: transformedStream.readable });

  } catch (error: unknown) {
    // AI SDK 7: Handle timeout errors
    if (error instanceof Error && error.name === 'TimeoutError') {
      console.error('[chat] Request timed out:', error.message);
      return jsonResponse({ error: 'Request timed out. Please try again.' }, 504);
    }
    
    if (error instanceof Error && 'status' in error && (error as { status: number }).status === 429) {
      return jsonResponse({ error: 'Rate limit exceeded' }, 429);
    }
    console.error('Chat API error:', error);
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
}
