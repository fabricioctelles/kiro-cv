# AGENTS.md

Universal agent instructions for AI assistants working on this repository.

## Build & Dev Commands

```bash
pnpm install      # Install dependencies
pnpm dev          # Start dev server with Turbopack
pnpm build        # Production build (includes prebuild resume fetch)
pnpm start        # Start production server
pnpm lint         # Run ESLint
```

## Project Overview

**Kiro CV** — Interactive CLI-style portfolio that mimics the [Kiro CLI](https://kiro.dev/cli/) terminal. Visitors explore your resume using slash commands; plain text triggers AI chat that responds as you.

**Stack**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS 4, Vercel AI SDK (Edge runtime streaming).

## Architecture

```
src/
├── app/
│   ├── page.tsx              # Entry: reads resume.json, passes config to Terminal
│   ├── layout.tsx            # Root layout, metadata, fonts
│   └── api/chat/route.ts     # AI chat endpoint (OpenAI-compatible)
├── components/
│   ├── Terminal.tsx          # Central orchestrator — all state lives here
│   ├── InputBox.tsx          # Command input
│   ├── SlashMenu.tsx         # Autocomplete dropdown
│   ├── WelcomeScreen.tsx     # Splash screen with Kiro logo
│   ├── KiroLogo.tsx          # SVG dot-matrix logo renderer
│   ├── chrome/               # UI chrome (StatusLine, TrustNotice, Divider, etc.)
│   └── commands/             # Individual command output components
├── config/
│   ├── personal.ts           # Career models, fun content
│   └── site.ts               # Site metadata
├── lib/
│   ├── commands.ts           # Command definitions & matching
│   ├── colors.ts             # Kiro color palette
│   ├── resume-data.ts        # Resume JSON loader
│   ├── system-prompt.ts      # AI system prompt with guardrails
│   ├── kiro-logo.ts          # Braille font data
│   └── types.ts              # TypeScript interfaces
└── hooks/                    # useAutoComplete, useCommandHistory, useTerminalScroll
```

## Configuration

All customization via `resume.json` at project root:

```json
{
  "splash": "KIRO",                    // Logo text (max 32 chars)
  "welcome": "Welcome message",        // Below logo
  "whatsNew": "Feature announcement",  // What's new section
  "trustNotice": "Warning · hint",     // Status bar (split on · for colors)
  "model": "Senior Engineer 4.0",      // Default model in status line
  "folder": "~/path · (branch)",       // Path in status line
  
  "basics": { ... },                   // JSON Resume standard fields
  "work": [ ... ],
  "skills": [ ... ]
}
```

Environment variables (`.env.local`):

```bash
OPENAI_API_KEY=           # Required
OPENAI_BASE_URL=          # Optional (OpenRouter, Groq, etc.)
OPENAI_MODEL=             # Optional (default: gpt-4o-mini)
LLM_CHAT_LANGUAGE=        # Optional (default: en)
```

## Command System

Commands defined in `src/lib/commands.ts`:

```typescript
{ name: '/about', aliases: ['/summary'], description: 'About me', category: 'content' }
```

**To add a command:**
1. Add to `commands` array in `src/lib/commands.ts`
2. Create component in `src/components/commands/` (optional)
3. Add case to `renderCommandOutput()` in `Terminal.tsx`
4. Import component in `Terminal.tsx`

**Matching**: Exact match → alias match → fuzzy match (Levenshtein ≤ 2) for suggestions.

## AI Chat

- Plain text (non-`/`) triggers `handleAIChat()` → POST `/api/chat`
- System prompt in `src/lib/system-prompt.ts` includes resume data and strict guardrails
- Rate limiting: 10 req/min, 50 req/day per IP
- Abuse detection: blocks prompt injection patterns

**Guardrails** — AI only discusses:
- Professional background from resume
- Career-related questions
- This portfolio itself

Refuses: politics, medical/legal advice, code generation, off-topic requests.

## Key Files to Know

| File | Purpose |
|------|---------|
| `Terminal.tsx` | All state, command dispatch, AI chat handling |
| `commands.ts` | Command definitions (47+ commands) |
| `system-prompt.ts` | AI personality and guardrails |
| `colors.ts` | Kiro color palette |
| `resume.json` | All content and configuration |
| `api/chat/route.ts` | LLM endpoint with rate limiting |

## Conventions

- **Colors**: Use `colors.ts` constants, never raw hex in components
- **Font**: JetBrains Mono monospace throughout
- **Responsive**: Mobile breakpoint at `sm` (640px)
- **Path alias**: `@/*` → `./src/*`
- **No code blocks in AI responses**: Breaks terminal styling

## Testing Changes

After any modification:
```bash
pnpm build        # Verify no TypeScript/build errors
pnpm dev          # Test locally
```

## Do Not

- Invent resume data not in `resume.json`
- Add code blocks to AI system prompt responses
- Use colors outside `colors.ts` palette
- Modify `kiro-logo.ts` whitespace (verbatim from Kiro binary)
