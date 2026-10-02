// Kiro CLI Dark Theme Colors
// Based on official Kiro theme palette extracted from kiro-cli binary
export const colors = {
  // Primary accent (purple) - #7B5CFA is the official SVG logo fill color
  brand:        '#b080ff',
  brandDark:    '#7B5CFA',  // Official Kiro logo color
  logo:         '#C19AFF',  // kiro-cli dark theme `brand` token (splash logo)
  
  // Semantic colors
  success:      '#80ffb5',
  error:        '#ff8080',
  warning:      '#ffcf99',
  
  // UI colors
  permission:   '#8dc8fb',
  helpBlue:     '#8dc8fb',
  bashBorder:   '#b080ff',
  promptBorder: '#b080ff',
  
  // Text colors
  text:         '#ffffff',
  subtle:       '#938f9b',
  inactive:     '#666666',
  muted:        '#ffffff99',
  
  // Background colors
  bg:           '#19161d',
  surface:      '#211d25',
  panel:        '#28242e',
  
  // Syntax highlighting
  keyword:      '#e2d3fe',
  function:     '#8dc8fb',
  class:        '#ffcf99',
  string:       '#80ffb5',
  variable:     '#80f4ff',
  constant:     '#ff80b5',
  comment:      '#ffffff99',
} as const;
