<p align="center">
  <img src="public/favicon.ico" alt="Kiro CV" width="80" />
</p>

<h1 align="center">Kiro CV</h1>

<p align="center">
  Your portfolio, disguised as a <a href="https://kiro.dev/cli/">Kiro CLI</a> terminal.<br/>
  Fork it. Make it yours. Land the job.
</p>

<p align="center">
  <img src="public/demo.gif" alt="Kiro CV demo" width="700" />
</p>

---

## What is this?

A developer portfolio that looks and feels like the real [Kiro CLI](https://kiro.dev/cli/). Visitors explore your experience, skills, and certifications using slash commands — just like Kiro. Plain text input triggers an AI chat that responds in character as you. It's weird, it's fun, and recruiters actually love it.

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
❯ /tools          → List available tools
❯ /config         → Show configuration
❯ /init           → Generate a fake KIRO.md
❯ Just type...    → Chat with the AI clone
```

## Features

- 🎨 **Authentic Kiro CLI look** — Dot-matrix logo, status line, trust notice, colors
- 💬 **AI Chat** — Visitors can chat with an AI that knows your resume
- ⌨️ **47+ Commands** — Portfolio commands + simulated Kiro CLI commands
- 🎯 **Fully Configurable** — Customize everything via `resume.json`
- 📱 **Responsive** — Works on mobile and desktop
- ⚡ **Fast** — Edge runtime, streaming responses

## Fork & Make It Yours

This project is designed to be forked. Edit `resume.json` and you have your own CLI portfolio:

### Configuration via resume.json

```json
{
  "splash": "YOUR NAME",
  "welcome": "Welcome to my portfolio!",
  "whatsNew": "Now with AI chat support.",
  "trustNotice": "All tools trusted · /help for commands",
  "model": "Senior Engineer 4.0",
  "folder": "~/projects/my-portfolio · (main)",
  
  "basics": { ... },
  "work": [ ... ],
  "skills": [ ... ]
}
```

| Field | Description |
|-------|-------------|
| `splash` | Text displayed in the Kiro dot-matrix logo |
| `welcome` | Welcome message below the logo |
| `whatsNew` | "What's new" announcement |
| `trustNotice` | Trust banner (text before `·` is yellow, after is gray) |
| `model` | Default career model shown in status line |
| `folder` | Path shown in status line (format: `path · (branch)`) |

### Resume Data (JSON Resume format)

| Section | Required fields | Used by |
|---------|----------------|---------|
| `basics` | `name`, `label`, `email`, `summary`, `url`, `location`, `profiles[]` | `/about`, `/contact`, AI chat |
| `work[]` | `name`, `position`, `startDate`, `endDate`, `highlights[]` | `/about`, `/experience` |
| `certificates[]` | `name`, `issuer`, `url` | `/certs` |
| `skills[]` | `name`, `keywords[]` | `/skills` |
| `education[]` | `institution`, `area` | `/education` |
| `languages[]` | `language`, `fluency` | `/languages` |

### Environment Variables

```env
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key
```

> **Note**: You can set `RESUME_URL` in your environment to fetch `resume.json` from a URL at build time.

## Getting Started

```bash
git clone https://github.com/yourusername/kiro-cv.git
cd kiro-cv
pnpm install
```

Create your `.env.local` (see `.env.example`), edit `resume.json`, then:

```bash
pnpm dev     # Start dev server
pnpm build   # Production build
pnpm start   # Start production server
```

## Tech Stack

- **Framework**: Next.js 15 (App Router, Turbopack)
- **UI**: React 19, Tailwind CSS 4
- **Language**: TypeScript
- **AI**: Google Gemini 2.5 Flash Lite via Vercel AI SDK (Edge runtime, streaming)
- **Font**: JetBrains Mono
- **Data**: JSON Resume format + Kiro extensions

## Documentation

See [docs/DEV.md](docs/DEV.md) for the full developer manual:
- Architecture overview
- How to add new commands
- Customizing command output
- Chrome components reference
- Theming & colors

## Command Reference

### Portfolio Commands

| Command | Description |
|---------|-------------|
| `/help` | List all commands (interactive selector) |
| `/about` | About me summary |
| `/experience` | Work history timeline |
| `/skills` | Technical skills |
| `/education` | Education background |
| `/certs` | Certifications |
| `/contact` | Contact info & links |
| `/languages` | Languages spoken |
| `/resume` | Download resume |

### Kiro CLI Commands (Simulated)

| Command | Description |
|---------|-------------|
| `/model` | Switch career model |
| `/clear` | Clear terminal |
| `/compact` | Compact context |
| `/tools` | List tools |
| `/config` | Show configuration |
| `/status` | Session status |
| `/version` | Version info |
| `/todos` | Task list |

### Fun Commands

| Command | Description |
|---------|-------------|
| `/doctor` | Skill diagnostics |
| `/cost` | Humorous cost analysis |
| `/init` | Generate KIRO.md |

---

<p align="center">
  Originally created by <a href="https://github.com/ambaena">Alfonso Baena</a> · Kiro-styled by <a href="https://github.com/fabriciocunhatelles">Fabricio Telles</a>
</p>
<p align="center">
  Built with <a href="https://kiro.dev">Kiro</a> · MIT License
</p>
<p align="center">
  <sub>Not affiliated with Amazon/AWS. Just a fan of the CLI aesthetic.</sub>
</p>
