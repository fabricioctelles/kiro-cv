import { CommandDefinition } from './types';

export const commands: CommandDefinition[] = [
  // Content commands (portfolio)
  { name: '/help', aliases: ['/h', '/?'], description: 'List all available commands', category: 'content' },
  { name: '/about', aliases: ['/summary', '/whoami'], description: 'About me — summary & role', category: 'content' },
  { name: '/experience', aliases: ['/work', '/exp'], description: 'Work history timeline', category: 'content' },
  { name: '/skills', aliases: ['/tech', '/stack'], description: 'Technical skills & toolkit', category: 'content' },
  { name: '/education', aliases: ['/edu'], description: 'Education background', category: 'content' },
  { name: '/certs', aliases: ['/certifications'], description: 'Professional certifications', category: 'content' },
  { name: '/contact', aliases: ['/links', '/socials'], description: 'Contact info & social links', category: 'content' },
  { name: '/model', aliases: ['/models', '/roles'], description: 'Career roles as "models"', category: 'content' },
  { name: '/languages', aliases: ['/lang'], description: 'Languages spoken', category: 'content' },
  { name: '/resume', aliases: ['/pdf', '/download'], description: 'View resume info', category: 'content' },

  // System commands (Kiro-style)
  { name: '/clear', aliases: ['/cls'], description: 'Clear terminal', category: 'system' },
  { name: '/status', aliases: [], description: 'Portfolio status & stats', category: 'system' },
  { name: '/version', aliases: ['/v'], description: 'Version info', category: 'system' },
  { name: '/compact', aliases: [], description: 'Compact context (simulated)', category: 'system' },
  { name: '/context', aliases: [], description: 'Show current context', category: 'system' },
  { name: '/rewind', aliases: [], description: 'Rewind conversation', category: 'system' },
  { name: '/guide', aliases: [], description: 'Ask about commands & features', category: 'system' },

  // Fun/Easter egg commands
  { name: '/cost', aliases: [], description: 'Cost analysis (humorous)', category: 'fun' },
  { name: '/doctor', aliases: [], description: 'Run diagnostics', category: 'fun' },
  { name: '/usage', aliases: [], description: 'Session usage stats', category: 'fun' },
  { name: '/init', aliases: [], description: 'Generate KIRO.md', category: 'fun' },
  { name: '/stats', aliases: [], description: 'Session statistics', category: 'fun' },
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
