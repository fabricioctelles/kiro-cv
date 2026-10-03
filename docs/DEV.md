# Kiro CV - Developer Manual

This document explains the architecture and how to customize the Kiro CLI-style portfolio.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Configuration via resume.json](#configuration-via-resumejson)
3. [Commands System](#commands-system)
4. [Adding New Commands](#adding-new-commands)
5. [Customizing Command Output](#customizing-command-output)
6. [Chrome Components](#chrome-components)
7. [AI Chat Integration](#ai-chat-integration)
8. [Theming & Colors](#theming--colors)
9. [Command Reference](#command-reference)

---

## Architecture Overview

```
scripts/
└── fetch-resume.ts       # prebuild: downloads resume.json from RESUME_URL (if set)
src/
├── app/
│   ├── page.tsx          # Entry point - reads resume.json, passes config to Terminal
│   ├── layout.tsx        # Root layout, metadata (siteTitle/siteDescription), Google Analytics
│   └── api/chat/route.ts # AI chat API endpoint (OpenAI-compatible, Edge runtime)
├── components/
│   ├── Terminal.tsx      # Main terminal component - handles all state & commands
│   ├── InputBox.tsx      # Command input field
│   ├── SlashMenu.tsx     # Autocomplete dropdown for /commands
│   ├── WelcomeScreen.tsx # Initial splash screen with logo
│   ├── KiroLogo.tsx      # SVG dot-matrix logo renderer
│   ├── LoginScreen.tsx   # Retro login screen shown on /quit
│   ├── MarkdownOutput.tsx    # Renders AI responses
│   ├── ThinkingIndicator.tsx # Spinner + tips while the AI is responding
│   ├── GoogleAnalytics.tsx   # Loads GA when NEXT_PUBLIC_GA_ID is set
│   ├── chrome/           # Kiro CLI UI chrome components
│   │   ├── StatusLine.tsx
│   │   ├── TrustNotice.tsx
│   │   ├── Divider.tsx
│   │   ├── MessageBar.tsx
│   │   └── ConnectingLine.tsx
│   └── commands/         # Individual command output components
│       ├── About.tsx
│       ├── Experience.tsx
│       ├── Projects.tsx
│       ├── Publications.tsx
│       ├── Skills.tsx
│       └── ...
├── config/
│   ├── personal.ts       # Career models, doctor checks, usage stats (overridable via resume.json "personal")
│   └── site.ts           # CLI name, version (from resume.json meta.version), author/email (from basics)
├── lib/
│   ├── commands.ts       # Command definitions & matching
│   ├── colors.ts         # Kiro color palette
│   ├── resume-data.ts    # Resume JSON loader + resume types
│   ├── system-prompt.ts  # AI system prompt with guardrails
│   ├── tips.ts           # Tips shown while the AI is thinking
│   ├── kiro-logo.ts      # Braille font data for logo
│   ├── kiro-font.ts      # Glyph definitions for custom splash text
│   ├── kiro-text.ts      # Splash text layout & normalization
│   └── types.ts          # Shared TypeScript interfaces (CommandDefinition, ...)
└── hooks/
    ├── useAutoComplete.ts
    ├── useCommandHistory.ts
    └── useTerminalScroll.ts
```

---

## Configuration via resume.json

The `resume.json` file at the project root is the **primary configuration file**. It follows the [JSON Resume](https://jsonresume.org/schema/) standard with Kiro-specific extensions.

### Kiro-Specific Fields

```json
{
  "splash": "KIRO",
  "siteTitle": "Kiro CV",
  "siteDescription": "Interactive CLI-style portfolio powered by Kiro",
  "welcome": "Welcome to Kiro CV!",
  "whatsNew": "AI chat, 50+ commands, and full JSON configuration.",
  "trustNotice": "All tools trusted · /help for commands",
  "model": "Senior Engineer 4.0",
  "folder": "~/portfolio/kiro-cv · (main)",
  "resume": {
    "message": "Want a more serious resume, even in PDF?",
    "url": "https://example.com/resume.pdf"
  },
  "login": {
    "user": "guest",
    "password": "hire-me",
    "hostname": "kiro-cv",
    "hints": ["User starts with 'g'...", "Password: hire-me"]
  },
  "personal": {
    "status": "Open to interesting opportunities",
    "timezone": "America/Sao_Paulo",
    "careerModels": [ ... ],
    "skillCategories": [ ... ],
    "doctorChecks": [ ... ],
    "usageStats": [ ... ],
    "costItems": [ ... ],
    "initContent": [ ... ]
  },
  "meta": { "version": "v1.0.0" },

  "basics": { ... },
  "work": [ ... ],
  "education": [ ... ],
  "certificates": [ ... ],
  "skills": [ ... ],
  "languages": [ ... ],
  "projects": [ ... ],
  "publications": [ ... ]
}
```

| Field | Description | Used By |
|-------|-------------|---------|
| `splash` | Text displayed in the Kiro dot-matrix logo (max 32 chars) | `page.tsx` → `WelcomeScreen.tsx` → `KiroLogo.tsx` |
| `siteTitle` | Page title (`<siteTitle> - <basics.name>`) | `layout.tsx` |
| `siteDescription` | Meta / OpenGraph description | `layout.tsx`, `site.ts` |
| `welcome` | Welcome message below the logo | `WelcomeScreen.tsx` |
| `whatsNew` | "What's new" announcement text | `WelcomeScreen.tsx` |
| `trustNotice` | Trust banner text (split on `·` for colors) | `TrustNotice.tsx` |
| `model` | Default career model name | `Terminal.tsx` state → `StatusLine.tsx` |
| `folder` | Path shown in status line (format: `path · (branch)`) | `StatusLine.tsx` |
| `resume` | `message` and `url` for `/resume` (falls back to `basics.url`) | `Download.tsx` |
| `login` | Login screen config (`user`, `password`, `hostname`, `hints[]`) | `LoginScreen.tsx` |
| `personal` | Optional overrides for fun/personal content (see below) | `config/personal.ts` |
| `meta.version` | Version shown in `/help`, `/version`, `/changelog` (default `3.0.0`) | `config/site.ts` |

### `personal` section

Every field is optional; anything missing falls back to the defaults in `src/config/personal.ts`.

| Field | Used By |
|-------|---------|
| `status` | `/status` |
| `timezone` | `/usage` |
| `careerModels[]` (`name`, `subtitle`, `description`) | `/model` selector |
| `skillCategories[]` (`name`, `skills[]`, `color`) | `/skills` grouping (skills not listed go to "Other") |
| `doctorChecks[]` (`label`, `result`, `severity`: `success`/`warning`/`error`) | `/doctor` |
| `usageStats[]` (`label`, `percent`, `status`) | `/usage` |
| `costItems[]` (`label`, `value`) | `/cost` |
| `initContent[]` (one string per line) | `/init` |

### Resume data (JSON Resume)

| Section | Used By |
|---------|---------|
| `basics` | `/about`, `/contact`, `/resume` fallback, page metadata, AI chat, `sudo hire <first name>` |
| `work[]` | `/about`, `/experience`, `/status`, career start year (`/cost`, AI chat) |
| `education[]` | `/education` |
| `certificates[]` | `/certs`, `/status` |
| `skills[]` | `/skills` |
| `languages[]` | `/languages` |
| `projects[]` | `/projects` |
| `publications[]` | `/publications` |

`interests`, `references`, `basics.image` and `basics.phone` are accepted but not displayed.

### URL Parameter Override

The `splash` field can be overridden via URL:

```
https://yoursite.com/?splash_name=Your%20Name
```

### Remote resume.json

`pnpm build` runs `scripts/fetch-resume.ts` first. If `RESUME_URL` is set (env or `.env.local`), it downloads that file and **overwrites the local `resume.json`**; otherwise the local file is used.

---

## Commands System

Commands are defined in `src/lib/commands.ts`:

```typescript
export const commands: CommandDefinition[] = [
  {
    name: '/help',
    aliases: ['/h', '/?'],
    description: 'List all available commands',
    category: 'content'
  },
  // ...
];
```

### Command Categories

| Category | Purpose |
|----------|---------|
| `content` | Portfolio/CV commands (`/about`, `/experience`, `/projects`) |
| `system` | Kiro CLI simulated commands (`/clear`, `/model`, `/config`) |
| `fun` | Easter eggs (`/doctor`, `/cost`, `/game`) |

### Command Matching

The system supports:
- **Exact match**: `/help`
- **Alias match**: `/h` → `/help`
- **Fuzzy match**: `/hepl` → "Did you mean /help?"

`findCommand` always resolves aliases to the canonical `name`, so `renderCommandOutput` only needs a `case` for the canonical name.

---

## Adding New Commands

### Step 1: Define the Command

In `src/lib/commands.ts`, add to the `commands` array:

```typescript
{
  name: '/mycommand',
  aliases: ['/mc'],
  description: 'Description shown in /help',
  category: 'content'  // or 'system' or 'fun'
},
```

### Step 2: Create Output Component (Optional)

For complex output, create a component in `src/components/commands/`:

```typescript
// src/components/commands/MyCommand.tsx
'use client';

import { colors } from '@/lib/colors';
import { resume } from '@/lib/resume-data';

export function MyCommand() {
  return (
    <div className="text-xs sm:text-sm py-1">
      <div style={{ color: colors.brand }}>My Custom Output</div>
      <div style={{ color: colors.muted }}>{resume.basics.name}</div>
    </div>
  );
}
```

### Step 3: Register in Terminal.tsx

In `src/components/Terminal.tsx`, find `renderCommandOutput` and add a case for the canonical name:

```typescript
const renderCommandOutput = useCallback((commandName: string): ReactNode | null => {
  switch (commandName) {
    // ... existing cases ...

    case '/mycommand': return <MyCommand />;

    // For inline output (no component needed):
    case '/simple':
      return (
        <div className="text-xs sm:text-sm py-1" style={{ color: colors.success }}>
          Simple inline output!
        </div>
      );

    default:
      return null;
  }
}, [currentModel]);
```

Interactive commands (`/help`, `/model`, `/clear`, `/copy`, `/quit` with login) are handled earlier in `handleSubmit`.

### Step 4: Import Component

At the top of `Terminal.tsx`:

```typescript
import { MyCommand } from './commands/MyCommand';
```

### Step 5: Tell the AI

Add the command to the suggestion list in `src/lib/system-prompt.ts` so the AI chat can recommend it.

---

## Customizing Command Output

### Using Resume Data

All command components can access resume data:

```typescript
import { resume } from '@/lib/resume-data';

// Access fields
resume.basics.name
resume.basics.email
resume.work[0].position
resume.projects?.[0].name
```

### Using Personal Config

For non-resume data (career models, fun content). Values come from `resume.json` → `personal`, with defaults in `src/config/personal.ts`:

```typescript
import { personalConfig } from '@/config/personal';

personalConfig.careerStartYear   // computed from work[].startDate
personalConfig.careerModels
personalConfig.doctorChecks
personalConfig.usageStats
```

### Styling with Kiro Colors

```typescript
import { colors } from '@/lib/colors';

// Most used tokens:
colors.brand      // #C19AFF - Purple brand color
colors.text       // #ffffff - Primary text
colors.muted      // #9E9E9E - Body text that steps back
colors.secondary  // #808080 - Hints, separators
colors.success    // #00D787 - Green
colors.warning    // #C4A000 - Yellow
colors.error      // #CC0000 - Red
colors.info       // #06989A - Cyan
colors.surface    // #262626 - Dividers, user prompt background
colors.bg         // #19161d - Page background
```

---

## Chrome Components

Chrome components replicate Kiro CLI's UI:

### StatusLine

```tsx
<StatusLine
  agent="Default"           // Left side - agent name
  model={currentModel}      // Left side - model name
  folder={folder}           // Right side - "path · (branch)"
/>
```

### TrustNotice

```tsx
<TrustNotice message="Warning text · secondary text" />
// Text before · is yellow (warning), after is secondary color
```

### Divider

```tsx
<Divider />  // Horizontal line separator
```

### MessageBar / UserPrompt

Render the user's input line and message blocks in the history.

### ConnectingLine

```tsx
<ConnectingLine />  // "Connecting to kiro.dev..." line shown before the welcome screen
```

---

## AI Chat Integration

The AI chat uses the Vercel AI SDK (`@ai-sdk/openai`) with streaming on the Edge runtime. Any OpenAI-compatible provider works (OpenAI, OpenRouter, Groq, Together, local LLMs).

### API Route (`src/app/api/chat/route.ts`)

- Base URL: `OPENAI_BASE_URL` (default `https://api.openai.com/v1`)
- Model: `OPENAI_MODEL` (default `gpt-4o-mini`)
- System prompt built from resume data in `src/lib/system-prompt.ts`

### Customizing AI Behavior

Edit `src/lib/system-prompt.ts` to change the AI's personality, guardrails and command suggestions.

### Environment Variables

See `.env.example`:

```bash
# .env.local
OPENAI_API_KEY=          # Required
OPENAI_BASE_URL=         # Optional
OPENAI_MODEL=            # Optional (default: gpt-4o-mini)
LLM_CHAT_LANGUAGE=       # Optional (default: en)
RESUME_URL=              # Optional, fetched at build time
NEXT_PUBLIC_GA_ID=       # Optional, Google Analytics
```

Never commit `.env` / `.env.local`.

---

## Theming & Colors

### Color Palette

Defined in `src/lib/colors.ts` (mirrors the kiro-cli theme; named ANSI colors use the Tango palette). Main tokens:

```typescript
export const colors = {
  text:       '#ffffff',
  secondary:  '#808080',
  muted:      '#9E9E9E',
  surface:    '#262626',
  brand:      '#C19AFF',
  brandMuted: '#8700FF',
  accent:     '#ff00ff',
  highlight:  '#0087FF',
  link:       '#3465A4',
  info:       '#06989A',
  success:    '#00D787',
  warning:    '#C4A000',
  error:      '#CC0000',
  bg:         '#19161d',
  panel:      '#28242e',
  // + syntax highlighting tokens (keyword, string, comment, ...)
};
```

### Global Styles

`src/app/globals.css` exposes the same palette as CSS variables:

```css
:root {
  --color-text: #ffffff;
  --color-brand: #C19AFF;
  --color-bg: #19161d;
  /* ... */
}

body {
  background: var(--color-bg);
}
```

Keep `colors.ts` and `globals.css` in sync when changing the palette.

---

## Command Reference

52 commands in total (11 content, 36 system, 5 fun).

### Portfolio Commands

| Command | Aliases | Description | Data source |
|---------|---------|-------------|-------------|
| `/help` | `/h`, `/?` | List all commands (opens selector) | `commands.ts`, `site.ts` |
| `/about` | `/summary`, `/whoami` | About me summary | `basics`, `work` |
| `/experience` | `/work`, `/exp` | Work history timeline | `work` |
| `/skills` | `/tech`, `/stack` | Technical skills | `skills` + `personal.skillCategories` |
| `/education` | `/edu` | Education background | `education` |
| `/certs` | `/certifications` | Certifications | `certificates` |
| `/contact` | `/links`, `/socials` | Contact info | `basics` |
| `/projects` | `/proj` | Side projects & open source | `projects` |
| `/publications` | `/pubs`, `/articles` | Articles & publications | `publications` |
| `/languages` | `/lang` | Languages spoken | `languages` |
| `/resume` | `/pdf`, `/download` | Download resume | `resume` |

### System Commands

| Command | Aliases | Description | Data source |
|---------|---------|-------------|-------------|
| `/clear` | `/cls` | Clear terminal | — |
| `/quit` | `/exit`, `/q` | Login screen (or exit message if no `login`) | `login` |
| `/compact` | | Compact context | hardcoded |
| `/rewind` | | Rewind to checkpoint | hardcoded |
| `/checkpoint` | | Create checkpoint | hardcoded |
| `/model` | `/models` | Switch career model (selector) | `model`, `personal.careerModels` |
| `/agent` | | Agent configuration | hardcoded |
| `/effort` | | Effort level | hardcoded |
| `/context` | | Show context | hardcoded |
| `/knowledge` | `/kb` | Knowledge base | hardcoded |
| `/memories` | | Stored memories | hardcoded |
| `/tools` | | List tools | hardcoded |
| `/mcp` | | MCP server status | hardcoded |
| `/config` | `/settings` | Show config | current model |
| `/hooks` | | Active hooks | hardcoded |
| `/steering` | | Steering rules | hardcoded |
| `/sessions` | | Recent sessions | hardcoded |
| `/save` | | Save session | hardcoded |
| `/load` | | Load session | hardcoded |
| `/copy` | | Copy last AI response to clipboard | — |
| `/paste` | | Paste from clipboard | hardcoded |
| `/version` | `/v` | Version info | `site.ts` (`meta.version`) |
| `/status` | | Session status | `work`, `certificates`, `personal.status` |
| `/guide` | | Command guide | hardcoded |
| `/changelog` | | Recent changes | `site.ts` (`meta.version`) |
| `/feedback` | | Send feedback | hardcoded |
| `/autonomous` | `/auto` | Toggle autonomous mode | hardcoded |
| `/verbosity` | | Output verbosity | hardcoded |
| `/theme` | | Color theme | hardcoded |
| `/todos` | | Task list | hardcoded |
| `/transcript` | | Export transcript | hardcoded |
| `/workflow` | `/workflows` | List workflows | hardcoded |
| `/workflow-run` | | Run a workflow | hardcoded |
| `/workflow-status` | | Workflow status | hardcoded |
| `/spawn` | | Spawn a sub-agent | hardcoded |
| `/tangent` | | Tangent conversation | hardcoded |

### Fun Commands

| Command | Aliases | Description | Data source |
|---------|---------|-------------|-------------|
| `/doctor` | | Skill diagnostics | `personal.doctorChecks` |
| `/cost` | | Humorous cost analysis | `personal.costItems`, `work` |
| `/usage` | | Usage stats | `personal.usageStats`, `personal.timezone` |
| `/init` | | Generate KIRO.md | `personal.initContent` |
| `/game` | `/play`, `/kiro-runner` | Kiro Ghost runner game | hardcoded |

---

## Easter Eggs

### /game - Kiro Runner

An endless runner game featuring the Kiro Ghost mascot. The ghost must jump over developer-themed obstacles.

**Obstacles** (using real brand SVGs from theSVG):
- Docker ("works on my machine")
- Git merge conflicts
- npm audit vulnerabilities
- Slack @channel pings
- Jira P0 tickets
- Kubernetes CrashLoopBackOff
- Sentry 500 errors
- ESLint problems
- Webpack building forever
- Zoom "quick sync" meetings
- Calendar blocks
- null/undefined errors
- Legacy code (`// TODO: fix later`)
- Deadlines (`EOD TODAY!!!`)

**Controls:**
- `SPACE` or `↑` to jump
- Click also works
- High score saved in localStorage (`kiro-runner-high`)

### /quit - Login Screen

When `login.user` and `login.password` are configured in `resume.json`, `/quit` shows a retro terminal login screen instead of just a message.

```json
{
  "login": {
    "user": "guest",
    "password": "hire-me",
    "hostname": "kiro-cv",
    "hints": [
      "User starts with 'g'...",
      "Password: hire-me"
    ]
  }
}
```

- Black background (different from main terminal)
- Classic `hostname login:` / `Password:` prompts
- One more hint from `hints[]` is revealed after each failed attempt
- Successful login returns to the welcome screen

### sudo hire

Typing `sudo hire me` or `sudo hire <first name>` (first word of `basics.name`, lowercase) prints a special message instead of going to the AI.

---

## File Structure for New Features

When adding a new feature:

1. **Data source**: Add to `resume.json` (typed in `src/lib/resume-data.ts`), with defaults in `src/config/personal.ts` if optional
2. **Command definition**: Add to `src/lib/commands.ts`
3. **UI component**: Create in `src/components/commands/`
4. **Wire up**: Register in `Terminal.tsx` → `renderCommandOutput`
5. **AI**: Add to the command list in `src/lib/system-prompt.ts`
6. **Docs**: Update this file, `README.md` and `AGENTS.md`

---

## Development Commands

```bash
pnpm dev               # Start dev server (Turbopack)
pnpm build             # Production build (runs prebuild resume fetch first)
pnpm start             # Start production server
pnpm lint              # Run ESLint (requires an ESLint config)
pnpm exec tsc --noEmit # TypeScript check
```

---

## Future: JSON-Driven Commands

Currently commands are hardcoded. A future enhancement could move command definitions to `resume.json`:

```json
{
  "commands": {
    "/talks": {
      "aliases": ["/speaking"],
      "description": "Conference talks",
      "output": "component",  // or "inline"
      "component": "Talks"
    }
  }
}
```

This would allow full customization without code changes.
