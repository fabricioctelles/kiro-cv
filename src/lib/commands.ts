import { CommandDefinition } from './types';

export const commands: CommandDefinition[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // PORTFOLIO COMMANDS (CV/Resume content)
  // ═══════════════════════════════════════════════════════════════════════════
  { name: '/help', aliases: ['/h', '/?'], description: 'List all available commands', category: 'content' },
  { name: '/about', aliases: ['/summary', '/whoami'], description: 'About me — summary & role', category: 'content' },
  { name: '/experience', aliases: ['/work', '/exp'], description: 'Work history timeline', category: 'content' },
  { name: '/skills', aliases: ['/tech', '/stack'], description: 'Technical skills & toolkit', category: 'content' },
  { name: '/education', aliases: ['/edu'], description: 'Education background', category: 'content' },
  { name: '/certs', aliases: ['/certifications'], description: 'Professional certifications', category: 'content' },
  { name: '/contact', aliases: ['/links', '/socials'], description: 'Contact info & social links', category: 'content' },
  { name: '/projects', aliases: ['/proj'], description: 'Side projects & open source', category: 'content' },
  { name: '/publications', aliases: ['/pubs', '/articles'], description: 'Articles & publications', category: 'content' },
  { name: '/languages', aliases: ['/lang'], description: 'Languages spoken', category: 'content' },
  { name: '/resume', aliases: ['/pdf', '/download'], description: 'Download resume as PDF', category: 'content' },

  // ═══════════════════════════════════════════════════════════════════════════
  // KIRO CLI CORE COMMANDS (replicated from real Kiro CLI)
  // ═══════════════════════════════════════════════════════════════════════════
  
  // Session & Navigation
  { name: '/clear', aliases: ['/cls'], description: 'Clear terminal output', category: 'system' },
  { name: '/quit', aliases: ['/exit', '/q'], description: 'Exit session', category: 'system' },
  { name: '/compact', aliases: [], description: 'Compact conversation context', category: 'system' },
  { name: '/rewind', aliases: [], description: 'Rewind to previous checkpoint', category: 'system' },
  { name: '/checkpoint', aliases: [], description: 'Create a conversation checkpoint', category: 'system' },
  
  // Model & Agent
  { name: '/model', aliases: ['/models'], description: 'Switch career model', category: 'system' },
  { name: '/agent', aliases: [], description: 'Show current agent configuration', category: 'system' },
  { name: '/effort', aliases: [], description: 'Set task effort level', category: 'system' },
  
  // Context & Memory
  { name: '/context', aliases: [], description: 'Show current context window', category: 'system' },
  { name: '/knowledge', aliases: ['/kb'], description: 'Query knowledge base', category: 'system' },
  { name: '/memories', aliases: [], description: 'View stored memories', category: 'system' },
  
  // Tools & Config
  { name: '/tools', aliases: [], description: 'List available tools', category: 'system' },
  { name: '/mcp', aliases: [], description: 'MCP server status', category: 'system' },
  { name: '/config', aliases: ['/settings'], description: 'View configuration', category: 'system' },
  { name: '/hooks', aliases: [], description: 'List active hooks', category: 'system' },
  { name: '/steering', aliases: [], description: 'Show steering rules', category: 'system' },
  
  // Session Management  
  { name: '/sessions', aliases: [], description: 'List recent sessions', category: 'system' },
  { name: '/save', aliases: [], description: 'Save current session', category: 'system' },
  { name: '/load', aliases: [], description: 'Load a saved session', category: 'system' },
  { name: '/copy', aliases: [], description: 'Copy last response to clipboard', category: 'system' },
  { name: '/paste', aliases: [], description: 'Paste from clipboard', category: 'system' },
  
  // Info & Help
  { name: '/version', aliases: ['/v'], description: 'Show version info', category: 'system' },
  { name: '/status', aliases: [], description: 'Show session status', category: 'system' },
  { name: '/guide', aliases: [], description: 'Interactive command guide', category: 'system' },
  { name: '/changelog', aliases: [], description: 'View recent changes', category: 'system' },
  { name: '/feedback', aliases: [], description: 'Send feedback', category: 'system' },
  
  // Advanced
  { name: '/autonomous', aliases: ['/auto'], description: 'Toggle autonomous mode', category: 'system' },
  { name: '/verbosity', aliases: [], description: 'Set output verbosity', category: 'system' },
  { name: '/theme', aliases: [], description: 'Switch color theme', category: 'system' },
  { name: '/todos', aliases: [], description: 'Show task list', category: 'system' },
  { name: '/transcript', aliases: [], description: 'Export conversation transcript', category: 'system' },
  
  // Workflow
  { name: '/workflow', aliases: ['/workflows'], description: 'List workflows', category: 'system' },
  { name: '/workflow-run', aliases: [], description: 'Run a workflow', category: 'system' },
  { name: '/workflow-status', aliases: [], description: 'Check workflow status', category: 'system' },
  
  // Spawn & Tangent
  { name: '/spawn', aliases: [], description: 'Spawn a sub-agent', category: 'system' },
  { name: '/tangent', aliases: [], description: 'Start a tangent conversation', category: 'system' },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // FUN / EASTER EGG COMMANDS
  // ═══════════════════════════════════════════════════════════════════════════
  { name: '/cost', aliases: [], description: 'Cost analysis (humorous)', category: 'fun' },
  { name: '/doctor', aliases: [], description: 'Run skill diagnostics', category: 'fun' },
  { name: '/usage', aliases: [], description: 'Session usage stats', category: 'fun' },
  { name: '/init', aliases: [], description: 'Generate KIRO.md', category: 'fun' },
  { name: '/game', aliases: ['/play', '/kiro-runner'], description: 'Play Kiro Runner', category: 'fun' },
];

export function findCommand(input: string): CommandDefinition | null {
  const normalized = input.toLowerCase().trim();
  for (const cmd of commands) {
    if (cmd.name === normalized || cmd.aliases.includes(normalized)) {
      return cmd;
    }
  }
  return null;
}

export function fuzzyMatch(input: string): string | null {
  const normalized = input.toLowerCase().replace('/', '');
  if (!normalized) return null;

  let bestMatch: string | null = null;
  let bestScore = Infinity;

  for (const cmd of commands) {
    const cmdName = cmd.name.replace('/', '');
    // Simple: check if the input is a prefix or close enough
    if (cmdName.startsWith(normalized)) {
      const score = cmdName.length - normalized.length;
      if (score < bestScore) {
        bestScore = score;
        bestMatch = cmd.name;
      }
    }
    // Levenshtein-like: check edit distance for short inputs
    const dist = levenshtein(normalized, cmdName);
    if (dist <= 2 && dist < bestScore) {
      bestScore = dist;
      bestMatch = cmd.name;
    }
  }

  return bestMatch;
}

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
  }
  return dp[m][n];
}

export function filterCommands(prefix: string): CommandDefinition[] {
  const normalized = prefix.toLowerCase();
  return commands.filter(
    (cmd) =>
      cmd.name.startsWith(normalized) ||
      cmd.aliases.some((a) => a.startsWith(normalized)),
  );
}
