import { google } from '@ai-sdk/google';
import { streamText } from 'ai';
import { SYSTEM_PROMPT } from '@/lib/system-prompt';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const result = await streamText({
      model: google('gemini-2.5-flash-lite'),
      system: SYSTEM_PROMPT,
      messages,
      maxTokens: 300,
    });

    return result.toDataStreamResponse();
  } catch (error: unknown) {
    if (error instanceof Error && 'status' in error && (error as { status: number }).status === 429) {
      return new Response('Rate limit exceeded', { status: 429 });
    }
    console.error('Chat API error:', error);
    return new Response('Internal server error', { status: 500 });
  }
}
