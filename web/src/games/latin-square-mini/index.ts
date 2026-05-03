import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { LatinSquareMiniState, LatinSquareMiniAction, LatinSquareMiniSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const LatinSquareMiniGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.LatinSquareMiniGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
export const latinSquareMiniPlugin: GamePlugin<LatinSquareMiniState, LatinSquareMiniAction, typeof settings> = {
  id: "latin-square-mini",
  title: "Latin Square Mini",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Fill an N x N grid so each row and column contains each of N symbols exactly once. No box constraint.",
  howToPlay: "Latin Square Mini is the simplest cousin of Sudoku: just fill an N x N grid with N symbols (typically digits 1 through N) so each row and each column contains each symbol exactly once. There's no box constraint — only rows and columns matter.\n\nA 3x3 Latin square has 12 reduced solutions; a 4x4 has many more. The puzzles here use 3x3 and 4x4 grids with a few givens to anchor the solution.\n\nEach puzzle shows a partial Latin square with a target cell highlighted and four candidate digits. Use row and column uniqueness to find the unique correct value.\n\nSix puzzles per round; 100 points per correct answer plus a 10-point-per-second time bonus. Wrong picks reveal the correct digit. Latin Square is a great gateway to Sudoku for newcomers, and a quick warm-up for veterans. The lack of box constraints means more cells are \"open\" but the deductions are still satisfying.",
  settings,
  initialState: (seed: number) => initialState(seed, { dummy: true } as LatinSquareMiniSettings),
  reducer,
  isTerminal,
  
  hint: (state: LatinSquareMiniState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-latin-square-mini-answer-0"]', pulses: 3 } : null,component: LatinSquareMiniGame,
};
