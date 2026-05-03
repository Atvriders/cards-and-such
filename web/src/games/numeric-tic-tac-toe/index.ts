import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { NumericTTTState, NumericTTTAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const NumericTicTacToe = /* @__PURE__ */ lazy(() => import("./NumericTicTacToe.js").then((mod) => ({ default: mod.NumericTicTacToe as unknown as React.ComponentType<unknown> })));
export const numericTicTacToePlugin = {
  id: "numeric-tic-tac-toe",
  title: "Numeric TTT",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Place numbers on a 3×3 grid — get three that sum to 15 in a line to win!",
  howToPlay: `Numeric Tic-Tac-Toe is a mathematical twist on the classic game. Instead of X and O, players use numbers. You play as the odd numbers (1, 3, 5, 7, 9) and the AI plays even numbers (2, 4, 6, 8). Each number can only be used once.

The winning condition is new: you win if any row, column, or diagonal contains three of your numbers that add up to exactly 15. The AI wins by the same rule using its even numbers. This is equivalent to a magic square — the winning triples for odd numbers are exactly the same cells that create a magic square.

To take a turn, first click one of your remaining odd numbers to select it, then click an empty cell on the board to place it. The AI responds automatically.

Think about both attack and defence: a triple like (1,5,9) or (3,5,7) both sum to 15, so keep track of which numbers remain. The AI will try to block dangerous odd-number combinations. Beat the AI for 1000 points, draw for 500!`,
  settings: {} as Record<string, never>,
  initialState: (seed: number) => initialState(seed),
  reducer,
  isTerminal,
  hint: (): HintTarget | null => (typeof document !== "undefined" && document.querySelector(".nttt-board")) ? { selector: ".nttt-board", pulses: 3 } : null,
  component: NumericTicTacToe,
} as unknown as GamePlugin;
