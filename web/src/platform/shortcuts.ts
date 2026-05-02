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
