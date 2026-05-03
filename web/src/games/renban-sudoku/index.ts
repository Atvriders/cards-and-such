import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { RenbanSudokuState, RenbanSudokuAction, RenbanSudokuSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { RenbanSudokuGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
export const renbanSudokuPlugin: GamePlugin<RenbanSudokuState, RenbanSudokuAction, typeof settings> = {
  id: "renban-sudoku",
  title: "Renban Sudoku",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Marked Renban lines must contain a set of consecutive digits in any order (with no repeats).",
  howToPlay: "Renban Sudoku introduces purple \"renban\" lines: each line must contain a complete set of consecutive digits — in any order, but with no repeats. A length-3 renban could be {1,2,3}, {2,3,4}, ..., {7,8,9}; a length-5 might be {3,4,5,6,7}.\n\nStandard Sudoku constraints apply (each row, column, and box contains 1-9 once). On the renban line, the digits form a contiguous block. Length n means the difference between max and min on the line is exactly n-1.\n\nEach puzzle shows a small example with a renban line, marks a target cell, and offers four candidate digits. Reason about the contiguous-block rule plus row/column uniqueness.\n\nSix puzzles per round; 100 points per correct answer plus a 10-point-per-second time bonus. Wrong answers reveal the correct value. Renban is a favorite for beginners stepping up from classic Sudoku — the consecutive-set rule clicks immediately.",
  settings,
  initialState: (seed: number) => initialState(seed, { dummy: true } as RenbanSudokuSettings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "done" || p === "gameover" || p === "ended" || p === "finished" || (s as any).gameOver || (s as any).won || (s as any).complete || (s as any).isComplete) return null; return { selector: ".renbanribbon-num", pulses: 3 }; },
  component: RenbanSudokuGame,
};
