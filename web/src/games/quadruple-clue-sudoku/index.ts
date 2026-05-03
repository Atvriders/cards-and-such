import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { QuadrupleClueSudokuState, QuadrupleClueSudokuStateAction, QuadrupleClueSudokuSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const QuadrupleClueSudokuGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.QuadrupleClueSudokuGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
export const quadrupleClueSudokuPlugin: GamePlugin<QuadrupleClueSudokuState, QuadrupleClueSudokuStateAction, typeof settings> = {
  id: "quadruple-clue-sudoku",
  title: "Quadruple Clue Sudoku",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Clues at grid intersections show all four touching digits.",
  howToPlay: "Quadruple Clue Sudoku is a Sudoku variant where clues appear at the intersections of grid lines (i.e., at the corners of cells). Each intersection clue gives the four-cell set of digits that must appear in the four cells meeting at that intersection — but does not specify which cell holds which digit.\n\nThis variant adds a powerful new deduction tool. When a quadruple clue says {1,2,5,7}, you know those four digits fill the surrounding cells in some order, eliminating the other digits from those cells.\n\nThis quiz uses standard 9x9 Sudoku with quadruple clues, presenting six puzzles. Each shows a marked intersection with the clue digits and asks for the value of one specific touching cell. Apply the row, column, box, and quadruple constraint to deduce the answer. Six puzzles per round; 100 points per correct answer with time bonus. Pick carefully — the quadruple clue often constrains a cell beyond what rows and columns alone can.",
  settings,
  initialState: (seed: number) => initialState(seed, { dummy: true } as QuadrupleClueSudokuSettings),
  reducer,
  isTerminal,
  
  hint: (state: QuadrupleClueSudokuState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quadruple-clue-sudoku-answer-0"]', pulses: 3 } : null,component: QuadrupleClueSudokuGame,
};
