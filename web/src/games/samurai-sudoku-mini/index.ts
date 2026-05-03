import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SamuraiSudokuMiniState, SamuraiSudokuMiniStateAction, SamuraiSudokuMiniSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const SamuraiSudokuMiniGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.SamuraiSudokuMiniGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
export const samuraiSudokuMiniPlugin: GamePlugin<SamuraiSudokuMiniState, SamuraiSudokuMiniStateAction, typeof settings> = {
  id: "samurai-sudoku-mini",
  title: "Samurai Sudoku Mini",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Five overlapping 4x4 sudoku grids share corner boxes. Pick the cell value.",
  howToPlay: "Samurai Sudoku is the classic puzzle scaled out: five overlapping 9x9 grids arranged in an X — a center grid and four corner grids that share their corner 3x3 boxes with the center. The full puzzle is 21x21 cells across the bounding box, but each individual sub-grid still follows standard Sudoku rules. The shared boxes act as deduction bridges, letting you ricochet logic between sub-grids.\n\nThis Mini version tightens the layout to five 4x4 grids using digits 1 to 4. Each Mini puzzle highlights a single shared cell or corner cell and asks for its value, giving four lettered candidates. Apply the row, column, and 2x2 box constraints — and remember the cell may be checked from two grids at once.\n\nSix puzzles per round; 100 points per correct answer with bonuses for streaks. Wrong picks reveal the correct digit. Samurai Sudoku rewards seeing the whole layout at once.",
  settings,
  initialState: (seed: number) => initialState(seed, { dummy: true } as SamuraiSudokuMiniSettings),
  reducer,
  isTerminal,
  
  hint: (state: SamuraiSudokuMiniState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-samurai-sudoku-mini-answer-0"]', pulses: 3 } : null,component: SamuraiSudokuMiniGame,
};
