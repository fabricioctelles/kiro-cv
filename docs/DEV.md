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

---

## Architecture Overview

```
src/
├── app/
│   ├── page.tsx          # Entry point - reads resume.json, passes config to Terminal
│   ├── layout.tsx        # Root layout with metadata
│   └── api/chat/route.ts # AI chat API endpoint
├── components/
│   ├── Terminal.tsx      # Main terminal component - handles all state & commands
│   ├── InputBox.tsx      # Command input field
│   ├── SlashMenu.tsx     # Autocomplete dropdown for /commands
│   ├── WelcomeScreen.tsx # Initial splash screen with logo
│   ├── KiroLogo.tsx      # SVG dot-matrix logo renderer
│   ├── chrome/           # Kiro CLI UI chrome components
│   │   ├── StatusLine.tsx
│   │   ├── TrustNotice.tsx
│   │   ├── Divider.tsx
│   │   └── ...
│   └── commands/         # Individual command output components
│       ├── About.tsx
│       ├── Experience.tsx
│       ├── Skills.tsx
│       └── ...
├── config/
│   ├── personal.ts       # Career models, doctor checks, usage stats
│   └── site.ts           # Site metadata (legacy, being replaced by resume.json)
├── lib/
│   ├── commands.ts       # Command definitions & matching
│   ├── colors.ts         # Kiro color palette
│   ├── resume-data.ts    # Resume JSON loader
│   ├── kiro-logo.ts      # Braille font data for logo
│   └── types.ts          # TypeScript interfaces
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
  "welcome": "Welcome to Kiro CLI V3!",
  "whatsNew": "Specs, expanded hooks, and an improved trust model.",
  "trustNotice": "Trust All Tools active, confirmations are off · /quit to exit",
  "model": "Senior Engineer 4.0",
  "folder": "~/workspace/projects/my-project · (main)",
  
  "basics": { ... },
  "work": [ ... ],
  "education": [ ... ],
  "certificates": [ ... ],
  "skills": [ ... ],
  "languages": [ ... ]
}
```

| Field | Description | Used By |
|-------|-------------|---------|
| `splash` | Text displayed in the Kiro dot-matrix logo | `KiroLogo.tsx` |
| `welcome` | Welcome message below the logo | `WelcomeScreen.tsx` |
| `whatsNew` | "What's new" announcement text | `WelcomeScreen.tsx` |
| `trustNotice` | Trust banner text (split on `·` for colors) | `TrustNotice.tsx` |
| `model` | Default career model name | `Terminal.tsx` state |
| `folder` | Path shown in status line (format: `path · (branch)`) | `StatusLine.tsx` |

### URL Parameter Override

The `splash` field can be overridden via URL:

```
https://yoursite.com/?splash_name=Your%20Name
```

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
| `content` | Portfolio/CV commands (`/about`, `/experience`, `/skills`) |
| `system` | Kiro CLI simulated commands (`/clear`, `/model`, `/config`) |
| `fun` | Easter eggs (`/doctor`, `/cost`, `/init`) |

### Command Matching

The system supports:
- **Exact match**: `/help`
- **Alias match**: `/h` → `/help`
- **Fuzzy match**: `/hepl` → "Did you mean /help?"

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
    <div className="text-xs sm:text-sm py-2">
      <div style={{ color: colors.brand }}>My Custom Output</div>
      <div style={{ color: colors.muted }}>{resume.basics.name}</div>
    </div>
  );
}
```

### Step 3: Register in Terminal.tsx

In `src/components/Terminal.tsx`, find `renderCommandOutput` and add your case:

```typescript
const renderCommandOutput = useCallback((commandName: string): ReactNode | null => {
  switch (commandName) {
    // ... existing cases ...
    
    case '/mycommand':
      return <MyCommand />;
    
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
}, []);
```

### Step 4: Import Component

At the top of `Terminal.tsx`:

```typescript
import { MyCommand } from './commands/MyCommand';
```

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
resume.skills.find(s => s.name === 'Languages')?.keywords
```

### Using Personal Config

For non-resume data (career models, fun content):

```typescript
import { personalConfig } from '@/config/personal';

personalConfig.careerModels
personalConfig.doctorChecks
personalConfig.usageStats
```

### Styling with Kiro Colors

```typescript
import { colors } from '@/lib/colors';

// Available colors:
colors.brand      // #C19AFF - Purple brand color
colors.text       // #e4e4e7 - Primary text
colors.muted      // #71717a - Muted text
colors.secondary  // #a1a1aa - Secondary text
colors.success    // #22c55e - Green
colors.warning    // #eab308 - Yellow
colors.error      // #ef4444 - Red
colors.surface    // #27272a - Surface/border
colors.background // #19161d - Background
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

### ConnectingLine

```tsx
<ConnectingLine />  // Vertical connecting line for grouped content
```

---

## AI Chat Integration

The AI chat uses the Vercel AI SDK with streaming.

### API Route (`src/app/api/chat/route.ts`)

```typescript
// Uses GOOGLE_GENERATIVE_AI_API_KEY from .env
// Model: gemini-2.5-flash-lite
// System prompt includes resume data for context
```

### Customizing AI Behavior

Edit `src/lib/system-prompt.ts` to change the AI's personality and knowledge.

### Environment Variables

```bash
# .env.local
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key
```

---

## Theming & Colors

### Color Palette

Defined in `src/lib/colors.ts`:

```typescript
export const colors = {
  brand: '#C19AFF',      // Kiro purple
  text: '#e4e4e7',
  muted: '#71717a',
  secondary: '#a1a1aa',
  success: '#22c55e',
  warning: '#eab308',
  error: '#ef4444',
  surface: '#27272a',
  background: '#19161d',
};
```

### Global Styles

Background and base styles in `src/app/globals.css`:

```css
:root {
  --background: #19161d;
  --foreground: #e4e4e7;
}
```

---

## Command Reference

### Portfolio Commands

| Command | Aliases | Description |
|---------|---------|-------------|
| `/help` | `/h`, `/?` | List all commands (opens selector) |
| `/about` | `/summary`, `/whoami` | About me summary |
| `/experience` | `/work`, `/exp` | Work history timeline |
| `/skills` | `/tech`, `/stack` | Technical skills |
| `/education` | `/edu` | Education background |
| `/certs` | `/certifications` | Certifications |
| `/contact` | `/links`, `/socials` | Contact info |
| `/languages` | `/lang` | Languages spoken |
| `/resume` | `/pdf`, `/download` | Download resume |

### System Commands

| Command | Description |
|---------|-------------|
| `/clear` | Clear terminal |
| `/quit` | Exit message |
| `/model` | Switch career model |
| `/compact` | Compact context |
| `/rewind` | Rewind to checkpoint |
| `/checkpoint` | Create checkpoint |
| `/context` | Show context |
| `/tools` | List tools |
| `/config` | Show config |
| `/version` | Version info |
| `/status` | Session status |

### Fun Commands

| Command | Description |
|---------|-------------|
| `/doctor` | Skill diagnostics |
| `/cost` | Humorous cost analysis |
| `/usage` | Usage stats |
| `/init` | Generate KIRO.md |
| `/todos` | Task list |

---

## File Structure for New Features

When adding a new feature:

1. **Data source**: Add to `resume.json` or `src/config/personal.ts`
2. **Command definition**: Add to `src/lib/commands.ts`
3. **UI component**: Create in `src/components/commands/`
4. **Wire up**: Register in `Terminal.tsx` → `renderCommandOutput`
5. **Types**: Add interfaces to `src/lib/types.ts` if needed

---

## Development Commands

```bash
pnpm dev          # Start dev server
pnpm build        # Production build
pnpm lint         # Run ESLint
pnpm type-check   # TypeScript check
```

---

## Future: JSON-Driven Commands

Currently commands are hardcoded. A future enhancement could move command definitions to `resume.json`:

```json
{
  "commands": {
    "/projects": {
      "aliases": ["/proj"],
      "description": "Show projects",
      "output": "component",  // or "inline"
      "component": "Projects"
    }
  }
}
```

This would allow full customization without code changes.
