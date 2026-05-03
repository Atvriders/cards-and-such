import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { OddEvenSudokuState, OddEvenSudokuAction, OddEvenSudokuSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { OddEvenSudokuGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
export const oddEvenSudokuPlugin: GamePlugin<OddEvenSudokuState, OddEvenSudokuAction, typeof settings> = {
  id: "odd-even-sudoku",
  title: "Odd-Even Sudoku",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Some cells are marked gray (odd) and others white (even). Odd cells must contain odd digits; even cells must contain even digits.",
  howToPlay: "Odd-Even Sudoku marks some cells with shading: gray cells must contain an odd digit (1, 3, 5, 7, or 9), white cells an even digit (2, 4, 6, or 8). Standard Sudoku rules apply: each row, column, and box has 1-9 once.\n\nThe parity tag instantly cuts candidates in half for marked cells. With four even and five odd digits in 1-9, the constraint is asymmetric, which often locks a parity row to a unique even/odd pattern.\n\nEach puzzle shows a partial grid, marks a target cell with a parity tag, and offers four candidate digits. Choose the digit that satisfies parity, row, and column rules.\n\nSix puzzles per round, 100 points per correct answer plus speed bonus. Wrong picks earn nothing but reveal the correct digit. Odd-Even is the perfect first variant for anyone wanting more than classic Sudoku — the rule is intuitive and the deductions chain quickly.",
  settings,
  initialState: (seed: number) => initialState(seed, { dummy: true } as OddEvenSudokuSettings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "done" || p === "gameover" || p === "ended" || p === "finished" || (s as any).gameOver || (s as any).won || (s as any).complete || (s as any).isComplete) return null; return { selector: ".oddevenparity-num", pulses: 3 }; },
  component: OddEvenSudokuGame,
};
