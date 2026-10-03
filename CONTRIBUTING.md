# Contributing to Kiro CV

Thank you for your interest in contributing! This guide will help you get started.

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8+

### Setup

```bash
# Clone the repository
git clone https://github.com/fabricioctelles/kiro-cv.git
cd kiro-cv

# Install dependencies
pnpm install

# Copy environment file
cp .env.example .env.local
# Edit .env.local with your API keys

# Start development server
pnpm dev
```

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in [Issues](https://github.com/fabricioctelles/kiro-cv/issues)
2. If not, create a new issue using the **Bug Report** template
3. Include steps to reproduce, expected behavior, and screenshots if applicable

### Suggesting Features

1. Check existing [Issues](https://github.com/fabricioctelles/kiro-cv/issues) for similar suggestions
2. Create a new issue using the **Feature Request** template
3. Describe the problem and your proposed solution

### Submitting Code

1. **Fork** the repository
2. **Create a branch** for your feature: `git checkout -b feature/my-feature`
3. **Make your changes** following the code style guidelines below
4. **Test your changes**: `pnpm build && pnpm lint`
5. **Commit** with a descriptive message (see commit conventions)
6. **Push** to your fork: `git push origin feature/my-feature`
7. **Open a Pull Request** using the PR template

## Code Style Guidelines

### General

- Use TypeScript for all new code
- Follow existing patterns in the codebase
- Use `colors.ts` constants for colors (never raw hex values)
- Mobile-first responsive design (`sm:` breakpoint at 640px)

### File Organization

```
src/
├── components/
│   ├── commands/     # Command output components
│   └── chrome/       # UI chrome components
├── lib/              # Utilities, types, data
├── hooks/            # React hooks
└── config/           # Configuration files
```

### Adding a New Command

1. Add definition to `src/lib/commands.ts`:
   ```typescript
   { name: '/mycommand', aliases: ['/mc'], description: 'Description', category: 'content' }
   ```

2. Create component in `src/components/commands/MyCommand.tsx` (optional)

3. Add case to `renderCommandOutput()` in `Terminal.tsx`

4. Import component in `Terminal.tsx`

### Commit Conventions

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new /projects command
fix: resolve slash menu Enter key behavior
docs: update README with new features
chore: update dependencies
refactor: simplify command matching logic
style: format code with prettier
test: add tests for login screen
```

## Testing

Before submitting a PR:

```bash
# Build check (TypeScript + Next.js)
pnpm build

# Lint check
pnpm lint

# Manual testing
pnpm dev
# Test your changes in browser
# Test on mobile viewport (Chrome DevTools)
```

## Configuration Files

### resume.json

All content comes from `resume.json`. See `docs/DEV.md` for the full schema.

### Environment Variables

```bash
OPENAI_API_KEY=           # Required for AI chat
OPENAI_BASE_URL=          # Optional (OpenRouter, Groq, etc.)
OPENAI_MODEL=             # Optional (default: gpt-4o-mini)
LLM_CHAT_LANGUAGE=        # Optional (default: en)
```

## Documentation

- `README.md` - Project overview and quick start
- `docs/DEV.md` - Developer manual with architecture details
- `AGENTS.md` - AI agent instructions

Please update documentation when adding features.

## Getting Help

- Open an issue for bugs or feature requests
- Check `docs/DEV.md` for technical documentation
- Review existing code for patterns and examples

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing! 🎉
