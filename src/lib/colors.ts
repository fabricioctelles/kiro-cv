// Kiro CLI dark theme
// Token names and values mirror the theme object in the kiro-cli binary.
// Tokens kiro-cli leaves as named ANSI colors (yellow, cyan, blue, red) use
// the Tango palette, the GNOME/Ubuntu Terminal default.
export const colors = {
  // Base tokens
  text:         '#ffffff',  // primary (terminal default foreground)
  secondary:    '#808080',  // hints, separators, "· /quit to exit"
  muted:        '#9E9E9E',  // body text that steps back, "(esc to cancel)"
  surface:      '#262626',  // dividers, user prompt background
  brand:        '#C19AFF',  // logo, agent name, path, links in banners
  brandMuted:   '#8700FF',
  accent:       '#ff00ff',  // selected item in menus (bold)
  highlight:    '#0087FF',
  link:         '#3465A4',  // named "blue"
  info:         '#06989A',  // named "cyan"
  success:      '#00D787',
  warning:      '#C4A000',  // named "yellow"
  error:        '#CC0000',  // named "red"

  // Page background — kiro-cli inherits the terminal's, this is ours
  bg:           '#19161d',
  panel:        '#28242e',

  // Syntax highlighting
  keyword:      '#C2A0FD',
  builtIn:      '#80F4FF',
  string:       '#80FFB5',
  comment:      '#FFFFFF99',
  number:       '#FFAFD1',
  literal:      '#FF8080',
  function:     '#8DC8FB',
  class:        '#FF80B5',
  variable:     '#80F4FF',
  punctuation:  '#FFFFFFCC',
} as const;
