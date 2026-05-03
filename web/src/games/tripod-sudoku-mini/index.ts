import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { TripodSudokuMiniState, TripodSudokuMiniStateAction, TripodSudokuMiniSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const TripodSudokuMiniGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.TripodSudokuMiniGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
export const tripodSudokuMiniPlugin: GamePlugin<TripodSudokuMiniState, TripodSudokuMiniStateAction, typeof settings> = {
  id: "tripod-sudoku-mini",
  title: "Tripod Sudoku Mini",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Three overlapping 4x4 grids share a center region.",
  howToPlay: "Tripod Sudoku is a multi-grid variant: three 9x9 Sudoku puzzles overlap, sharing one central 3x3 box among all three. Each individual Sudoku grid follows standard rules, but the central box must satisfy all three simultaneously, creating triple-bound deductions.\n\nThis Mini version reduces each grid to 4x4 with a 2x2 shared region. Three small 4x4 sudokus arrange around a center, sharing a 2x2 box. Solve constraints from all three grids on the shared region.\n\nSix puzzles per round; 100 points per correct answer plus a time bonus. The questions focus on the shared region — given partial fills in two of the grids, you deduce the value of one shared cell. Tripod's elegance is that solving from one grid reveals partial info to the other two, so the deductions cascade satisfyingly. Pick the digit that satisfies all three sudokus at once.",
  settings,
  initialState: (seed: number) => initialState(seed, { dummy: true } as TripodSudokuMiniSettings),
  reducer,
  isTerminal,
  
  hint: (state: TripodSudokuMiniState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-tripod-sudoku-mini-answer-0"]', pulses: 3 } : null,component: TripodSudokuMiniGame,
};
