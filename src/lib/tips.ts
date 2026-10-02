// Startup / thinking tips, in kiro-cli's format ({ id, text, chance? }).
// Texts are kept verbatim from kiro-cli where the command exists here, and
// reworded only where the portfolio's command does something different.

export interface Tip {
  id: string;
  text: string;
  // Fixed probability; tips without it share the remaining weight equally
  chance?: number;
}

export const tips: readonly Tip[] = [
  // kiro-cli, verbatim
  { id: 'paste-image', text: 'Press Ctrl+V or run /paste to attach an image from your clipboard to the conversation.' },
  { id: 'compact', text: 'Running low on context? Type /compact to summarize the conversation and free up space.' },
  { id: 'copy', text: 'Type /copy to copy the last response to your clipboard.' },
  { id: 'interrupt', text: 'Press Esc or Ctrl+C while Kiro is working to interrupt the current turn cleanly.' },
  // kiro-cli, adapted to this portfolio's commands
  { id: 'model-switch', text: 'Type /model to switch between career roles mid-conversation without starting over.' },
  { id: 'chat-new', text: 'Start fresh without quitting: /clear begins a new session in the same window.' },
  { id: 'usage', text: 'Curious about your usage? Type /usage to see session stats.' },
  { id: 'introspect', text: 'Not sure how a command works? Just ask — Kiro answers questions about itself and this portfolio.' },
  { id: 'context', text: 'Type /context to see what Kiro knows in the current session.' },
  // Portfolio
  { id: 'experience', text: 'Type /experience to see the full work history timeline.' },
  { id: 'resume', text: 'Type /resume to view or download the resume.' },
  { id: 'contact', text: 'Type /contact to get email and social links.' },
  { id: 'splash-name', text: 'Add ?splash_name=Your Name to the URL to see it written in the Kiro font.' },
];

// Same weighting as kiro-cli's picker: tips with `chance` keep it, the rest
// split what is left evenly.
export function pickTip(random = Math.random): Tip {
  const fixed = tips.filter((t) => t.chance !== undefined);
  const rest = tips.filter((t) => t.chance === undefined);
  const fixedTotal = fixed.reduce((sum, t) => sum + (t.chance ?? 0), 0);
  const share = rest.length ? Math.max(0, 1 - fixedTotal) / rest.length : 0;

  let roll = random() * Math.max(1, fixedTotal);
  for (const tip of [...fixed, ...rest]) {
    roll -= tip.chance ?? share;
    if (roll < 0) return tip;
  }
  return tips[tips.length - 1];
}

// kiro-cli highlights slash commands, --flags and key combos inside tip text
const KEY_COMBO = /^(?:Esc|(?:Ctrl|Shift|Alt|Cmd|Opt)\+\S*)$/;

export function isTipHighlight(word: string) {
  return word.startsWith('/') || word.startsWith('--') || KEY_COMBO.test(word);
}
