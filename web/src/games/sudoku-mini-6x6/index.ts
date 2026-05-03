import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SudokuMini6x6State, SudokuMini6x6Action, SudokuMini6x6Settings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const SudokuMini6x6Game = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.SudokuMini6x6Game as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
export const sudokuMini6x6Plugin: GamePlugin<SudokuMini6x6State, SudokuMini6x6Action, typeof settings> = {
  id: "sudoku-mini-6x6",
  title: "Sudoku Mini 6x6",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Intermediate 6x6 Sudoku using digits 1-6 in 2x3 boxes. Each row, column, and 2x3 box contains each digit once.",
  howToPlay: "Sudoku Mini 6x6 sits comfortably between the 4x4 starter and the full 9x9 challenge. The grid is 6 wide by 6 tall, divided into six 2x3 boxes (two rows by three columns). Digits 1-6 are used; each row, column, and 2x3 box must contain each digit exactly once.\n\nThe 2x3 box shape is unusual — different from both 4x4 (2x2) and 9x9 (3x3) — so it gives the puzzle a unique flavor. Pencil-marking is rarely needed; most cells solve by quick scanning.\n\nEach puzzle shows a partial grid with a target cell highlighted and four candidate digits. Use row, column, and box rules to choose the unique legal value.\n\nSix puzzles per round; 100 points per correct answer plus a 10-point-per-second time bonus. Wrong picks reveal the correct value. 6x6 Sudoku is a perfect \"next step\" for anyone who has mastered 4x4 and wants slightly meatier puzzles without committing to the full 9x9 grind.",
  settings,
  initialState: (seed: number) => initialState(seed, { dummy: true } as SudokuMini6x6Settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "done" || p === "gameover" || p === "ended" || p === "finished" || (s as any).gameOver || (s as any).won || (s as any).complete || (s as any).isComplete) return null; return { selector: ".sudoku6x6mint-num", pulses: 3 }; },
  component: SudokuMini6x6Game,
};
