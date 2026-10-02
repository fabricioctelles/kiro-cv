# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Dev Commands

```bash
pnpm dev          # Start dev server with Turbopack
pnpm build        # Production build
pnpm start        # Start production server
pnpm lint         # Run ESLint
```

## Project Overview

Interactive CLI-style portfolio website that mimics a real Claude Code terminal. Built with Next.js 15 (App Router), React 19, TypeScript, and Tailwind CSS 4. AI chat powered by Google Gemini 2.5 Flash Lite via Vercel AI SDK streaming on Edge runtime.

## Architecture

**Terminal.tsx** is the central orchestrator — it owns all state (input, history, theme, model selector, AI loading) and dispatches commands. Everything flows through it.

### Command System

Commands are registered in `src/lib/commands.ts` as a `CommandDefinition[]` with name, aliases, description, and category. To add a new command:

1. Add entry to the `commands` array in `src/lib/commands.ts`
2. Create output component in `src/components/commands/`
3. Add case to `renderCommandOutput()` switch in `Terminal.tsx`
4. Import the component in `Terminal.tsx`

Commands starting with `/` are matched via `findCommand()` (exact + alias match). Unrecognized commands trigger `fuzzyMatch()` (Levenshtein distance ≤ 2) for suggestions.

### AI Chat Flow

Plain text (non-`/`) input triggers `handleAIChat()` → POST to `/api/chat/route.ts` (Edge runtime) → Gemini streaming → parsed client-side from Vercel AI SDK format (`0:"{json}"` lines) → accumulated into history entry in real-time.

The system prompt in `src/lib/system-prompt.ts` injects the full resume data and personality constraints (max 4 sentences, CLI humor, language-aware).

### Input & Menu Behavior

- InputBox renders between two `─` separator lines with a `❯` prompt (white, bold)
- SlashMenu appears **below** the input showing max 5 matches, no scrollbar
- InputBox auto-focuses on every render — never requires click to refocus
- Enter in slash menu executes the command directly (not just fills input)
- `/model` opens an interactive selector with arrow key navigation (state in Terminal)

### Data Source

All resume data lives in `src/data/resume.json` (JSON Resume format), wrapped by `src/lib/resume-data.ts`. Command components read from this.

## Key Conventions

- **Colors**: All color values defined in `src/lib/colors.ts` as a const object. CSS variables mirror them in `globals.css` `@theme` block. Pure black background (`#000000`).
- **Welcome box**: Uses text chars (`╭╮╰╯─`) for top/bottom borders and CSS `border-left`/`border-right` for sides. Never use Unicode box-drawing corners for CSS-rendered borders — they render poorly with JetBrains Mono in browsers.
- **Prompt char**: Always `❯` (not `>`), always `colors.text` (white), bold.
- **Font**: JetBrains Mono monospace throughout.
- **Responsive**: Mobile breakpoint at `sm` (640px). Welcome screen stacks panels on mobile.
- **Path alias**: `@/*` maps to `./src/*`.
- **Site config**: Version, name, path, email in `src/config/site.ts`.
