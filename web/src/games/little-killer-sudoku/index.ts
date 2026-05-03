import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { LittleKillerSudokuState, LittleKillerSudokuAction, LittleKillerSudokuSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const LittleKillerSudokuGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.LittleKillerSudokuGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
export const littleKillerSudokuPlugin: GamePlugin<LittleKillerSudokuState, LittleKillerSudokuAction, typeof settings> = {
  id: "little-killer-sudoku",
  title: "Little Killer Sudoku",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Diagonal arrows outside the grid show the sum of digits along that diagonal. Repeats are allowed on diagonals.",
  howToPlay: "Little Killer Sudoku adorns the grid edges with diagonal arrows. Each arrow points along a grid diagonal and shows the sum of the digits on that diagonal — but unlike Killer cages, repeats are allowed.\n\nStandard Sudoku rules still hold: each row, column, and box contains digits 1-9 once. The little-killer arrows merely add diagonal-sum constraints. Short diagonals (length 2-3) are highly constrained because few digit combinations sum exactly. Long diagonals (length 7-9) are loose but still trim outliers.\n\nEach puzzle shows a small grid, a diagonal arrow with its sum clue, a target cell, and four candidate digits. Use row, column, and diagonal-sum logic to deduce the unique answer.\n\nSix puzzles per round; 100 points per correct answer plus a speed bonus. Wrong answers earn nothing but display the correct digit. Little Killer puzzles are a popular \"hint-only\" variant — the inside of the grid stays untouched and the deductions ripple from the borders inward.",
  settings,
  initialState: (seed: number) => initialState(seed, { dummy: true } as LittleKillerSudokuSettings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "done" || p === "gameover" || p === "ended" || p === "finished" || (s as any).gameOver || (s as any).won || (s as any).complete || (s as any).isComplete) return null; return { selector: ".littlekillerforensic-num", pulses: 3 }; },
  component: LittleKillerSudokuGame,
};
