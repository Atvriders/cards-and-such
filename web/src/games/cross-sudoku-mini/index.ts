import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { CrossSudokuMiniState, CrossSudokuMiniStateAction, CrossSudokuMiniSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const CrossSudokuMiniGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.CrossSudokuMiniGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
export const crossSudokuMiniPlugin: GamePlugin<CrossSudokuMiniState, CrossSudokuMiniStateAction, typeof settings> = {
  id: "cross-sudoku-mini",
  title: "Cross Sudoku Mini",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Plus-sign arrangement of overlapping sudoku grids.",
  howToPlay: "Cross Sudoku takes five Sudoku grids and arranges them in a plus-sign (cross) pattern: a center grid with four arm grids extending up, down, left, and right, each sharing one box with the center. Each individual Sudoku grid follows standard rules, with the shared boxes propagating constraints between the center and the arms.\n\nThis Mini version uses 4x4 grids in the cross arrangement, sharing 2x2 boxes between the arms and the center. Each puzzle highlights a cell in one of the shared boxes and asks for the value that satisfies both the arm grid and the center grid.\n\nSix puzzles per round; 100 points per correct answer. The questions cycle through the four arms so you encounter each shared region. Cross Sudoku is forgiving for beginners because each shared cell sits on only two grids (compared to three in Tripod). Pick the digit that fits both grids.",
  settings,
  initialState: (seed: number) => initialState(seed, { dummy: true } as CrossSudokuMiniSettings),
  reducer,
  isTerminal,
  
  hint: (state: CrossSudokuMiniState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-cross-sudoku-mini-answer-0"]', pulses: 3 } : null,component: CrossSudokuMiniGame,
};
