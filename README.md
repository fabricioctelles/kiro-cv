<p align="center">
  <img src="public/favicon.png" alt="Claude Resume" width="80" />
</p>

<h1 align="center">Claude Resume</h1>

<p align="center">
  Your portfolio, disguised as a <a href="https://claude.ai/code">Claude Code</a> terminal.<br/>
  Fork it. Make it yours. Land the job.
</p>

<p align="center">
  <a href="https://claude.alfonsobaena.dev">Live Demo</a>
</p>

<p align="center">
  <img src="public/demo.gif" alt="Claude Resume demo" width="700" />
</p>

---

## What is this?

A developer portfolio that looks and feels like a real terminal. Visitors explore your experience, skills, and certifications using slash commands — just like Claude Code. Plain text input triggers an AI chat (Google Gemini) that responds in character as you. It's weird, it's fun, and recruiters actually love it.

```
❯ /about          → Summary & current role
❯ /experience     → Work history timeline
❯ /skills         → Technical skills grouped by category
❯ /certs          → Professional certifications
❯ /contact        → Links, socials & email
❯ /download       → Download PDF resume
❯ /model          → Switch between career "models"
❯ /doctor         → Run diagnostics (humorous)
❯ /cost           → Cost analysis report
❯ /usage          → Session usage stats
❯ /init           → Generate a fake CLAUDE.md
❯ Just type...    → Chat with the AI clone
```

## Fork & Make It Yours

This project is designed to be forked. Swap out a few files and you have your own CLI portfolio:

| File | What to change |
|------|---------------|
| `src/config/site.ts` | Name, email, URL, model name |
| `src/config/personal.ts` | Career models, fun content, skills |
| `resume.json` | Your resume data ([JSON Resume](https://jsonresume.org/) format, gitignored) |
| `public/favicon.png` | Your profile picture |

### Required fields in `resume.json`

Your `resume.json` must include at least these sections for the app to work without errors:

| Section | Required fields | Used by |
|---------|----------------|---------|
| `basics` | `name`, `label`, `email`, `summary`, `url`, `location` (`city`, `region`), `profiles[]` | `/about`, `/contact`, AI chat |
| `work[]` | At least one entry with `name`, `position`, `startDate`, `endDate`, `highlights[]` | `/about`, `/experience`, AI chat |
| `certificates[]` | `name`, `issuer`, `url` | `/certs`, `/status` |
| `skills[]` | `name`, `keywords[]` | `/skills`, AI chat |
| `education[]` | `institution`, `area` | `/education` |
| `languages[]` | `language`, `fluency` | `/languages` |

> **Important**: `work` must have at least one entry — the first item is used as your current role in `/about` and in the AI system prompt. Each work entry must include a `highlights` array (can be empty: `[]`).

You'll also need a `.env.local` file:

```env
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key
```

> **Note**: You can set `RESUME_URL` in your environment to fetch `resume.json` from a URL at build time (useful for CI/CD). If not set, it falls back to the local file.

## Getting Started

```bash
git clone https://github.com/ambaena/claude-resume.git
cd claude-resume
pnpm install
```

Create your `.env.local` (see `.env.example`), drop in your `resume.json`, then:

```bash
pnpm dev     # Start dev server with Turbopack
pnpm build   # Production build
pnpm start   # Start production server
```

## Tech Stack

- **Framework**: Next.js 15 (App Router, Turbopack)
- **UI**: React 19, Tailwind CSS 4
- **Language**: TypeScript
- **AI**: Google Gemini 2.5 Flash Lite via Vercel AI SDK (Edge runtime, streaming)
- **Font**: JetBrains Mono
- **Data**: JSON Resume format

---

<p align="center">
  Built (mostly) with <a href="https://claude.ai/code">Claude Code</a> · MIT License
</p>
<p align="center">
  <sub>Not affiliated with Anthropic. Just a fan who took the cosplay too far.</sub>
</p>
