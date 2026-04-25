import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { UltimateTTTState, UltimateTTTAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { UltimateTicTacToe } from "./Game.js";

export const ultimateTTTSettings = {
  opponent: {
    kind: "enum" as const,
    label: "Opponent",
    options: ["human", "ai"] as const,
    default: "ai" as const,
  },
} as const;

type UltimateTTTSettingsType = SettingsOf<typeof ultimateTTTSettings>;

export const ultimateTicTacToePlugin: GamePlugin<UltimateTTTState, UltimateTTTAction, typeof ultimateTTTSettings> = {
  id: "ultimate-tic-tac-toe",
  title: "Ultimate TTT",
  category: "board",
  players: { min: 1, max: 2, multiplayer: false },
  description: "Tic-tac-toe inside tic-tac-toe — win 3 mini-boards in a row to win.",
  howToPlay: `Ultimate Tic-Tac-Toe is played on a 3×3 grid of smaller 3×3 tic-tac-toe boards. Win three mini-boards in a row (horizontally, vertically, or diagonally) to win the overall game.

Your first move can go anywhere. After each move, your opponent must play in the mini-board that corresponds to the cell position you just chose. For example, if you play in cell 5 (center) of any mini-board, your opponent must play in mini-board 5. If the required mini-board is already won or drawn, the next player may choose any open board.

Win a mini-board by getting three of your marks in a row within it, just like regular tic-tac-toe. A drawn mini-board counts as blocked for both players.

You play as X; the AI (or second player) plays as O. Score: 1000 for a win, 500 for a draw, 0 for a loss.

Strategy: Control the center mini-board early. Try to send your opponent into boards where you already have an advantage. Force them into won or neutral boards when possible. Think two moves ahead — where will your move send them, and what can they do from there?`,
  settings: ultimateTTTSettings,
  initialState: (seed: number, settings: UltimateTTTSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: UltimateTicTacToe,
};
