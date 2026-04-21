import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { GomokuState, GomokuAction, GomokuSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Gomoku } from "./Game.js";

const settings = {
  boardSize: {
    kind: "enum" as const,
    label: "Board Size",
    options: ["9", "13", "15"] as const,
    default: "15" as const,
  },
} as const;

export const gomokuPlugin: GamePlugin<GomokuState, GomokuAction, typeof settings> = {
  id: "gomoku",
  title: "Gomoku",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Place stones until one player has five in a row. Classic Go-board alternative.",
  howToPlay: `Gomoku (Five in a Row) is a strategy board game played on a grid of intersections. You play as Black and always go first; the bot plays as White. The goal is to place five of your stones in an unbroken row — horizontally, vertically, or diagonally — before your opponent does.

Click any empty intersection to place a Black stone. The bot immediately responds with a White stone. Continue alternating until one player achieves five in a row or the board fills completely (draw). The winning five-stone line is highlighted in gold when the game ends.

Board size can be set to 9×9 (small, fast games), 13×13 (medium), or 15×15 (standard, recommended). On larger boards there are far more possible lines, giving the game much greater depth than Tic-Tac-Toe.

The bot uses minimax search at depth 3 with alpha-beta pruning. It evaluates positions based on open-ended sequences of 2, 3, and 4 stones, and slightly prioritizes blocking your threats over building its own. Candidates are restricted to cells within 2 squares of existing stones.

Strategy tip: build threats in multiple directions simultaneously. A double-open three (three in a row with both ends open) is nearly impossible to block and often leads to a forced win.`,
  settings,
  initialState: (seed: number, s: GomokuSettings) => initialState(seed, s),
  reducer,
  isTerminal,
  component: Gomoku,
};
