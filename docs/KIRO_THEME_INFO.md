# Kiro CLI Theme Information

Extracted from `~/.local/share/kiro-cli/tui.js` and `/home/fabricio/.local/bin/kiro-cli` binary.

## Official Colors

- **Logo SVG Fill**: `#7B5CFA` (purple, from binary SVG paths)
- **Brand Accent**: `#b080ff` (lighter purple for UI)

## Symbols & Icons

```typescript
// From tui.js
const symbols = {
  checkmark: '\u2713',  // ✓
  cross: '\u2717',       // ✗
  arrow: '\u2192',       // →
  sparkle: '\u2728',     // ✨
  ellipsis: '...',
  brailleRotate: [
    '\u280B', '\u2819', '\u2839', '\u2838',
    '\u283C', '\u2834', '\u2826', '\u2827',
    '\u2807', '\u280F'
  ],
  // Loading spinners
  quarterSpinner: ['-', '\\', '|', '/'],
  brailleFill: ['.', '.', ':', ':', '|', '|', '#', '#', '#'],
};
```

## Slash Commands (from tui.js)

### Navigation & Session
- `/help` - Show help
- `/quit`, `/exit` - Exit CLI
- `/clear` - Clear screen
- `/compact` - Compact context
- `/context` - Show context
- `/rewind` - Rewind conversation
- `/sessions` - List sessions
- `/session-id` - Show session ID

### Configuration
- `/config` - Configuration
- `/settings` - Settings
- `/theme` - Theme settings
- `/model` - Model selection
- `/verbosity` - Set verbosity

### Features
- `/paste` - Paste image from clipboard
- `/copy` - Copy to clipboard
- `/save`, `/load` - Save/load
- `/knowledge` - Knowledge base
- `/memories` - Memories
- `/tools` - Available tools
- `/mcp` - MCP servers

### Agents & Workflows
- `/agent` - Agent settings
- `/spawn` - Spawn agent
- `/plan` - Planning mode
- `/autonomous` - Autonomous mode
- `/spec` - Spec mode
- `/workflow`, `/workflows` - Workflows
- `/workflow-run`, `/workflow-resume`, `/workflow-cancel`, `/workflow-status`

### Development
- `/code` - Code mode
- `/hooks` - Hooks
- `/steering` - Steering
- `/skill` - Skills
- `/repo` - Repository
- `/issue` - Create issue
- `/feedback` - Send feedback

### Other
- `/guide` - Ask questions about commands, tools, settings, and features
- `/stats` - Statistics
- `/usage` - Usage info
- `/changelog` - Changelog
- `/upgrade-agent` - Upgrade V2 agent to V3
- `/todos` - Todo list
- `/transcript` - Session transcript
- `/logdump` - Log dump

## Welcome Screen Text

```
Welcome to Kiro CLI V3!

What's new: Specs, expanded hooks, and an improved trust model.

Upgrade your V2 agent configurations to V3 with /upgrade-agent

https://kiro.dev/docs/cli/v3/

Tip: Type /guide to ask questions about commands, tools, settings, and features
```

Alternative tip:
```
Tip: Press Ctrl+V or run /paste to attach an image from your clipboard to the conversation.
```

## Documentation URLs

- `https://kiro.dev/docs/cli/v3/`
- `https://kiro.dev/docs/cli/code-intelligence/`
- `https://kiro.dev/settings/source-providers`

## Component Color Scheme (from tui.js getColor calls)

- `getColor("brand")` - Brand purple
- `getColor("primary")` - Primary text
- `getColor("secondary")` - Secondary text
- `getColor("muted")` - Muted text
- `getColor("error")` - Error red
- `getColor("warning")` - Warning yellow/orange
- `getColor("success")` - Success green
- `getColor("info")` - Info blue

## Status Bar Messages

- `Connecting to kiro.dev...` (with brailleRotate spinner)
- `✗ Couldn't connect to kiro.dev` (error state)

## Trust Mode Warning

```
Warning: Kiro is running in trust all tools mode

In this mode, Kiro will execute all tool calls — including shell commands,
file operations, and MCP tools — without asking for your approval.

This mode is intended for sandboxed or disposable environments only.
Do not use it on a machine with access to sensitive data or production systems.

By proceeding, you confirm that you understand the risks and accept
responsibility for all actions taken during this session.
```
