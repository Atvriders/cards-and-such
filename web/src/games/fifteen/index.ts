import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { FifteenPuzzleState, FifteenPuzzleAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Fifteen } from "./Fifteen.js";

export const fifteenPuzzleSettings = {
  size: {
    kind: "enum" as const,
    label: "Size",
    options: ["3", "4", "5"] as const,
    default: "4" as const,
  },
  shuffleMoves: {
    kind: "enum" as const,
    label: "Shuffle",
    options: ["20", "50", "100", "200"] as const,
    default: "50" as const,
  },
} as const;

type FifteenPuzzleSettingsType = SettingsOf<typeof fifteenPuzzleSettings>;

export const fifteenPuzzlePlugin: GamePlugin<FifteenPuzzleState, FifteenPuzzleAction, typeof fifteenPuzzleSettings> = {
  id: "fifteen-puzzle",
  title: "15 Puzzle",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Slide numbered tiles to arrange them in order.",
  howToPlay: `Slide the numbered tiles into ascending order, left to right and top to bottom, with the blank space in the last position.

Click any tile that is directly adjacent (horizontally or vertically) to the blank space to slide it into that space. Only tiles next to the blank can move. The puzzle is solved when tile 1 is in the top-left corner and all tiles run in order to N−1 with the blank at the bottom-right.

Score on winning is max(50, 1000 − moves), so fewer moves means a higher score. Choose the board size (3×3, 4×4, or 5×5) and the shuffle depth (20, 50, 100, or 200 random moves from the solved state). A deeper shuffle produces a harder starting position.

Tips: Solve the top row first, then the left column of the remaining grid, and repeat. When placing the last two tiles of a row, use a rotation trick: temporarily place both tiles one row down, then rotate them into position. On a 5×5 board, tackling it in layers this way keeps the complexity manageable.`,
  settings: fifteenPuzzleSettings,
  initialState: (seed: number, settings: FifteenPuzzleSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (): HintTarget | null => (typeof document !== "undefined" && document.querySelector(".fifteen-grid")) ? { selector: ".fifteen-grid", pulses: 3 } : null,
  component: Fifteen,
};
