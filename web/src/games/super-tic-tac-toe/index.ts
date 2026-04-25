import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SuperTTTState, SuperAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SuperTicTacToe } from "./Game.js";

export const superTicTacToePlugin = {
  id: "super-tic-tac-toe",
  title: "Super TTT",
  category: "board",
  players: { min: 2, max: 2, multiplayer: false },
  description: "Ultimate Tic-Tac-Toe — nine boards nested inside one. Win local boards to claim the global grid!",
  howToPlay: `Super TTT (Ultimate Tic-Tac-Toe) puts nine regular tic-tac-toe boards inside a 3×3 global grid. Your goal is to win three local boards in a row on the global grid.

On your turn, place your mark (X or O) in any open cell of your designated local board. The local board you must play in is determined by your opponent's last move: whichever cell index they chose, that's the board you go to next. If that board is already claimed or full, you may play in any open board.

Win a local board by getting three in a row as in regular tic-tac-toe. A drawn local board counts as neither player's territory.

Win the overall game by claiming three local boards in a row — horizontally, vertically, or diagonally — on the global 3×3 grid. If all nine local boards fill up without a global winner, the game is a draw.

Strategy tips: Aim to send your opponent to unfavorable boards. Winning the center board gives you the most global winning combinations. Sacrificing a local board to control where your opponent plays next is often the right call. Think two moves ahead — your move dictates their options!`,
  settings: {} as const,
  initialState: (seed: number) => initialState(seed),
  reducer: reducer as (state: SuperTTTState, action: SuperAction) => SuperTTTState,
  isTerminal,
  component: SuperTicTacToe,
} as unknown as GamePlugin;
