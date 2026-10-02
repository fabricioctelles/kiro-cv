// Kiro CLI splash logo
// Extracted verbatim from the kiro-cli-chat binary (Ink component that renders
// the welcome banner). Each letter is Unicode Braille art (U+2800–U+28FF) mixed
// with plain spaces — both are 1 column wide, so never trim or normalize them.
//
// Original layout rules (reproduced by kiro-text.ts / KiroLogo.tsx):
// - letters are separate blocks laid out in a row, centered
// - one extra space column only after the first letter (K)
// - with animation, letters appear one by one every 300ms
// - brand color: #C19AFF (dark theme)

export const kiroLogoLetters: readonly (readonly string[])[] = [
  // K
  [
    " ⢀⣴⣶⣶⣦⡀⠀⠀⠀⠀⢀⣴⣶⣦⣄⡀",
    "⢰⣿⠋⠁⠈⠙⣿⡆⠀⢀⣾⡿⠁  ⠈⢻⡆",
    "⢸⣿⠀⠀⠀⠀⣿⣇⣴⡿⠋⠀⠀  ⢀⣼⠇",
    "⢸⣿⠀⠀⠀⠀⣿⡿⠋⠀⠀  ⢀⣾⡿⠁",
    "⢸⣿⠀⠀⠀⠀⠙⠁⠀⠀ ⢀⣼⡟⠁",
    "⢸⣿⠀⠀⠀⠀⠀⠀⠀⠀ ⠹⣷⡀",
    "⢸⣿⠀⠀⠀⠀⠀⣠⡀⠀⠀ ⠹⣷⡄",
    "⢸⣿⠀⠀⠀⠀⣾⡟⣷⡀⠀⠀ ⠘⣿⣆",
    "⢸⣿⠀⠀⠀⠀⣿⡇⠹⣷⡀  ⠀⠈⢻⡇",
    "⠸⣿⣄⡀⢀⣠⣿⠇⠀⠙⣷⡀  ⢀⣼⠇",
    " ⠈⠻⠿⠿⠟⠁⠀⠀⠀⠈⠻⠿⠿⠟⠁",
  ],
  // I
  [
    " ⢀⣴⣶⣶⣦⡀",
    "⢰⣿⠋⠁⠈⠙⣿⡆",
    "⢸⣿⠀⠀⠀⠀⣿⡇",
    "⢸⣿⠀⠀⠀⠀⣿⡇",
    "⢸⣿⠀⠀⠀⠀⣿⡇",
    "⢸⣿⠀⠀⠀⠀⣿⡇⠀",
    "⢸⣿⠀⠀⠀⠀⣿⡇⠀",
    "⢸⣿⠀⠀⠀⠀⣿⡇",
    "⢸⣿⠀⠀⠀⠀⣿⡇",
    "⠸⣿⣄⡀⢀⣠⣿⠇",
    " ⠈⠻⠿⠿⠟⠁",
  ],
  // R
  [
    " ⢀⣴⣶⣶⣶⣶⣶⣶⣶⣶⣶⣦⣄⡀",
    "⢰⣿⠋⠁        ⠈⠙⠻⣦",
    "⢸⣿⠀⠀⠀⢠⣤⣤⣤⣤⣄    ⣿⡆",
    "⢸⣿⠀⠀⠀⢸⣿⠉⠉⠉⣿⡇   ⣿⡇ ",
    "⢸⣿⠀⠀⠀⢸⣿⣶⣶⡶⠋⠀   ⣿⠇",
    "⢸⣿⠀⠀⠀⠀⠀⠀⠀⠀   ⣠⣼⠟",
    "⢸⣿⠀⠀⠀⠀⣤⣄  ⠀⠀⠹⣿⡅",
    "⢸⣿⠀⠀⠀⠀⣿⡟⣷⡀⠀⠀ ⠘⣿⣆",
    "⢸⣿⠀⠀⠀⠀⣿⡇⠹⣷⡀  ⠀⠈⢻⡇",
    "⠸⣿⣄⡀⢀⣠⣿⠇⠀⠙⣷⡀  ⢀⣼⠇",
    " ⠈⠻⠿⠿⠟⠁⠀⠀⠀⠈⠻⠿⠿⠟⠁",
  ],
  // O
  [
    "    ⢀⣠⣴⣶⣶⣶⣶⣶⣦⣄⡀",
    "   ⣴⡿⠟⠋⠁   ⠈⠙⠻⢿⣦",
    "  ⣼⡟⠀⠀⠀ ⣀⣀⣀    ⢻⣧",
    " ⣼⡟⠀⠀ ⣰⡿⠟⠛⠻⢿⣆⠀⠀ ⢻⣧",
    "⢰⣿⠀⠀⠀⢰⣿⠀⠀⠀  ⣿⡆⠀⠀ ⣿⡆",
    "⢸⣿⠀⠀ ⢸⣿⠀⠀⠀⠀ ⣿⡇⠀⠀ ⣿⡇",
    "⠸⣿⠀⠀ ⠸⣿⠀⠀⠀⠀ ⣿⠇⠀  ⣿⠇",
    " ⢻⣧⠀⠀ ⠹⣷⣦⣤⣤⣾⠏⠀⠀⠀⣼⡟",
    "  ⢻⣧⠀⠀⠀ ⠉⠉⠉    ⣼⡟",
    "   ⠻⣷⣦⣄⡀   ⢀⣠⣴⣾⠟",
    "   ⠀⠀⠈⠙⠻⠿⠿⠿⠿⠟⠋⠁",
  ],
];

// Extra blank columns rendered after each letter (only K gets one)
export const kiroLogoLetterGaps = [1, 0, 0, 0] as const;

// Delay between letters in the reveal animation
export const KIRO_LOGO_REVEAL_MS = 300;
