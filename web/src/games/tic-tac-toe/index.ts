import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TTTState, TTTAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TicTacToe } from "./TicTacToe.js";

export const ticTacToeSettings = {
  boardSize: {
    kind: "enum" as const,
    label: "Board Size",
    options: ["3", "4", "5"] as const,
    default: "3",
  },
  winLength: {
    kind: "enum" as const,
    label: "Win Length",
    options: ["3", "4", "5"] as const,
    default: "3",
  },
  opponent: {
    kind: "enum" as const,
    label: "Opponent",
    options: ["bot", "hot-seat"] as const,
    default: "bot",
  },
  botStrength: {
    kind: "enum" as const,
    label: "Bot Strength",
    options: ["easy", "hard"] as const,
    default: "hard",
  },
} as const;

type TTTSettingsType = SettingsOf<typeof ticTacToeSettings>;

export const ticTacToePlugin: GamePlugin<TTTState, TTTAction, typeof ticTacToeSettings> = {
  id: "tic-tac-toe",
  title: "Tic-Tac-Toe",
  category: "board",
  players: { min: 1, max: 2, multiplayer: false },
  description: "Classic 3-in-a-row — or 4, or 5.",
  howToPlay: `Place your marks on the board to form a winning line before your opponent does. You are always X and go first.

Click any empty cell to place your mark. The bot (O) responds immediately. A winning line is a consecutive run of marks — horizontally, vertically, or diagonally — equal to the Win Length setting. Board Size can be 3×3, 4×4, or 5×5; Win Length can be 3, 4, or 5 (must be ≤ board size). In Hot-seat mode a second human controls O and scores are always 0 regardless of outcome. In Bot mode, Easy strength plays randomly while Hard strength uses minimax (unbeatable on a 3×3 board). If the board fills with no winner, the game is a draw.

Scoring (vs bot only): win = 10, draw = 5, loss = 0.

Tips: on a 3×3 board with Hard bot and win length 3, perfect play always draws — your first move in the centre is the strongest. On larger boards try to build two open-ended threats at once so the bot can't block both.`,
  settings: ticTacToeSettings,
  initialState: (seed: number, settings: TTTSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: TicTacToe,
};
