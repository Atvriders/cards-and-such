import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { FlowerSudokuMiniState, FlowerSudokuMiniStateAction, FlowerSudokuMiniSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const FlowerSudokuMiniGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.FlowerSudokuMiniGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
export const flowerSudokuMiniPlugin: GamePlugin<FlowerSudokuMiniState, FlowerSudokuMiniStateAction, typeof settings> = {
  id: "flower-sudoku-mini",
  title: "Flower Sudoku Mini",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "One central grid with four petals overlapping at corners.",
  howToPlay: "Flower Sudoku arranges five Sudoku grids in a flower pattern: a central grid with four petal grids, each petal overlapping the central grid at a corner box. Unlike Cross Sudoku where arms touch from the sides, Flower's petals touch at the corner boxes, creating diagonal constraint flow.\n\nThis Mini version uses 4x4 grids. The central grid shares its four corner boxes (each a 2x2) with the four petals, so each petal has one shared corner. Each puzzle highlights a shared cell and asks for the value satisfying both the central grid and the petal.\n\nSix puzzles per round; 100 points per correct answer plus time bonus. The questions cycle through corners. Flower Sudoku has a satisfying symmetry — once you place a digit in one shared corner, the central grid often constrains the diagonally opposite corner via row and column propagation. Pick the digit that fits both grids.",
  settings,
  initialState: (seed: number) => initialState(seed, { dummy: true } as FlowerSudokuMiniSettings),
  reducer,
  isTerminal,
  
  hint: (state: FlowerSudokuMiniState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-flower-sudoku-mini-answer-0"]', pulses: 3 } : null,component: FlowerSudokuMiniGame,
};
