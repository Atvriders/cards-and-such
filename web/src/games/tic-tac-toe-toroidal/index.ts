import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { ToroidalTTTState, ToroidalTTTAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const TicTacToeToroidal = /* @__PURE__ */ lazy(() => import("./TicTacToeToroidal.js").then((mod) => ({ default: mod.TicTacToeToroidal as unknown as React.ComponentType<unknown> })));
export const ticTacToeToroidalPlugin = {
  id: "tic-tac-toe-toroidal",
  title: "Toroidal TTT",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Tic-tac-toe where the board wraps around — top connects to bottom, left to right!",
  howToPlay: `Toroidal Tic-Tac-Toe is classic three-in-a-row on a 3×3 grid, but with a twist: the board is toroidal, meaning the edges wrap around. The top row connects to the bottom row, and the left column connects to the right column — like the surface of a donut.

You play as X and go first. Your AI opponent plays O. Click any empty cell to place your mark. You win by getting three of your marks in a line — but now "line" includes wrap-around lines! Three marks in the top row can also win if two are at the far ends and one is in the centre row of the opposite side.

This dramatically changes strategy from normal TTT: there are many more winning configurations to watch for and block. Draws are harder to force, and surprising wrap-around wins are common for players who spot them.

Win = 1000 points, draw = 500, loss = 0. Study the extra diagonals that wrap through the corners — those are the lines most players miss!`,
  settings: {} as Record<string, never>,
  initialState: (seed: number) => initialState(seed),
  reducer,
  isTerminal,
  hint: (): HintTarget | null => (typeof document !== "undefined" && document.querySelector(".ttt-board")) ? { selector: ".ttt-board", pulses: 3 } : null,
  component: TicTacToeToroidal,
} as unknown as GamePlugin;
