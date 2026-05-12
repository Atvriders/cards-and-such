/**
 * Per-game keyboard shortcut registry.
 *
 * Each entry is keyed by the game's id (the URL slug, matching the directory
 * name under `web/src/games/`). The values describe shortcuts surfaced in the
 * cheat sheet modal — they do NOT install handlers themselves; individual game
 * components remain responsible for registering their own listeners.
 */

export interface Shortcut {
  /** Display label for the key, e.g. "Space", "Ctrl+Z", "1-5". */
  keys: string;
  /** Plain-language description of what the shortcut does. */
  description: string;
}

export const SHORTCUTS: Record<string, Shortcut[]> = {
  klondike: [
    { keys: "Space", description: "Draw from stock / flip waste" },
    { keys: "U", description: "Undo last move" },
    { keys: "R", description: "Restart the current deal" },
    { keys: "H", description: "Hint — highlight a legal move" },
    { keys: "1-7", description: "Auto-move top card to tableau column" },
  ],
  freecell: [
    { keys: "U", description: "Undo last move" },
    { keys: "R", description: "Restart deal" },
    { keys: "1-8", description: "Select tableau column" },
    { keys: "A-D", description: "Send to free cell A-D" },
  ],
  spider: [
    { keys: "Space", description: "Deal next row from stock" },
    { keys: "U", description: "Undo" },
    { keys: "R", description: "Restart deal" },
  ],
  pyramid: [
    { keys: "Space", description: "Draw from stock" },
    { keys: "U", description: "Undo" },
    { keys: "R", description: "Restart" },
  ],
  "youtube-clicker": [
    { keys: "Space", description: "Click the play button" },
    { keys: "R", description: "Reset score" },
  ],
};

/**
 * Categorical shortcut templates — surfaced when no per-game entry exists
 * in SHORTCUTS. Mirrors the categorical-tutorial fallback in
 * `tutorials.ts` so the per-game shortcut surface is never empty for a
 * registered plugin.
 */
export const CATEGORY_SHORTCUTS: Record<string, Shortcut[]> = {
  solitaire: [
    { keys: "U", description: "Undo last move" },
    { keys: "R", description: "Restart deal" },
    { keys: "H", description: "Hint — highlight a legal move" },
  ],
  cards: [
    { keys: "Space", description: "Confirm / advance turn" },
    { keys: "H", description: "Hint — suggest the strongest legal play" },
    { keys: "U", description: "Undo last action" },
  ],
  dice: [
    { keys: "Space", description: "Roll the dice" },
    { keys: "H", description: "Hint — suggest the safest action" },
    { keys: "R", description: "Reset the round" },
  ],
  board: [
    { keys: "U", description: "Undo last move" },
    { keys: "R", description: "Restart the board" },
    { keys: "H", description: "Hint — suggest a move" },
  ],
  arcade: [
    { keys: "Space", description: "Primary action (jump / fire / tap)" },
    { keys: "Esc", description: "Pause the round" },
    { keys: "R", description: "Restart the round" },
  ],
};

/**
 * Resolve the keyboard shortcuts surface for a given game. Falls back to
 * the categorical default when no explicit entry exists, so every
 * registered plugin always returns at least the platform-standard set.
 */
export function shortcutsFor(gameId: string, category?: string): Shortcut[] | undefined {
  const explicit = SHORTCUTS[gameId];
  if (explicit) return explicit;
  if (category && CATEGORY_SHORTCUTS[category]) return CATEGORY_SHORTCUTS[category];
  return undefined;
}
