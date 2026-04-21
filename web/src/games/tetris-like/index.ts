import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TetrisState, TetrisAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Tetris } from "./Tetris.js";

export const tetrisSettings = {
  startLevel: {
    kind: "enum" as const,
    label: "Start level",
    options: ["0", "5", "10"] as const,
    default: "0" as const,
  },
} as const;

type TetrisSettingsType = SettingsOf<typeof tetrisSettings>;

export const tetrisPlugin: GamePlugin<TetrisState, TetrisAction, typeof tetrisSettings> = {
  id: "tetris-like",
  title: "Block Drop",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Drop tetrominoes. Clear lines to score. Speed increases with each level.",
  howToPlay: `Rotate and drop falling blocks to fill complete horizontal rows and clear them from the board.

Use the Left and Right arrow keys (or A / D) to move the falling piece sideways. Press Up or W to rotate it clockwise. Press Down or S for a slow soft-drop one cell at a time. Press Space to instantly hard-drop the piece to its lowest valid position — useful for fast play once you know where it will land.

When an entire row is filled with no gaps, it disappears and everything above it shifts down. Clearing multiple rows at once scores bonus points: 1 row = 100 pts, 2 = 300, 3 = 500, 4 rows at once (a Tetris!) = 800. All scores are multiplied by (level + 1). The level increases every 10 lines cleared, and each level makes pieces fall faster. The game ends when a new piece cannot be placed at the top.

A ghost piece shows where the current piece will land. The next piece is previewed in the sidebar. Starting at a higher level raises the base speed and multiplies your score. Tips: keep the center clear so the I-piece can always score a Tetris.`,
  settings: tetrisSettings,
  initialState: (seed: number, settings: TetrisSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: Tetris,
};
